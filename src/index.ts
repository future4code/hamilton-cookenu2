import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { AddressInfo } from "net";
import { IdGenerator } from "./services/IdGenerator";
import { UserDatabase } from "./data/UserDatabase";
import { Authenticator } from "./services/Authenticator";
import { HashManager } from "./services/HashManager";
import { BaseDatabase } from "./data/BaseDataBase";
import { RecipeDataBase } from "./data/RecipeDataBase";
import moment from "moment";

dotenv.config();

const app = express();

app.use(express.json());

app.post("/signup", async (req: Request, res: Response) => {
  try {
    if (req.body.name === "") {
      throw new Error("Preencha o campo name");
    }

    if (!req.body.email || req.body.email.indexOf("@") === -1) {
      throw new Error("Invalid email");
    }

    if (!req.body.password || req.body.password.length < 6) {
      throw new Error("Invalid password");
    }

    const userData = {
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      role: req.body.role,
    };

    const idGenerator = new IdGenerator();
    const id = idGenerator.generate();

    const hashManager = new HashManager();
    const hashPassword = await hashManager.hash(userData.password);

    const userDb = new UserDatabase();
    await userDb.createUser(id, userData.email, userData.name, hashPassword, userData.role);

    const authenticator = new Authenticator();
    const token = authenticator.generateToken({
      id,
      role: userData.role,
    });

    res.status(200).send({
      access_token: token,
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
  await BaseDatabase.destroyConnection();
});

app.post("/login", async (req: Request, res: Response) => {
  try {
    if (!req.body.email || req.body.email.indexOf("@") === -1) {
      throw new Error("Invalid email");
    }

    const userData = {
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
    };

    const userDatabase = new UserDatabase();
    const user = await userDatabase.getUserByEmail(userData.email);

    if (user.password !== userData.password) {
      throw new Error("Invalid password");
    }

    const authenticator = new Authenticator();
    const token = authenticator.generateToken({
      id: user.id,
      role: user.role,
    });

    res.status(200).send({
      token,
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
  await BaseDatabase.destroyConnection();
});

app.post("/user/follow", async (req: Request, res: Response) => {
  try {
    const userToFollowId = {
      id: req.body.id,
    };
    const token = req.headers.authorization as string;

    const authenticator = new Authenticator();
    const follower = authenticator.getData(token);

    const userDatabase = new UserDatabase();
    await userDatabase.followUserById(userToFollowId.id, follower.id);

    res.status(200).send({
      message: "Followed successfully",
    });
  } catch (error) {
    res.status(400).send({message: error.message});
  }
  await BaseDatabase.destroyConnection();
});
app.post("/user/unfollow", async(req:Request, res:Response) => {

  try {
    const token = req.headers.authorization as string;

    const userToUnfollowId = req.body.id

    if(!token || !userToUnfollowId) {

      throw new Error("Invalid");
    } 
    const authenticator = new Authenticator();
    const follower = authenticator.getData(token);

    const userDatabase = new UserDatabase();
    const followerId = userDatabase.getUserById(follower.id)
    
    if(!followerId) {

      throw new Error("Invalid");
    }
    await new UserDatabase().unfollowUserById(userToUnfollowId, follower.id);

    res.status(200).send({message: "Unollowed successfully"});

  } catch (error) {

    res.status(400).send({message: error.message || error.mysqlmessage});
  }
  await BaseDatabase.destroyConnection();
})
app.get("/user/profile", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization as string;

    const authenticator = new Authenticator();
    const authenticationData = authenticator.getData(token);

    const userDb = new UserDatabase();
    const user = await userDb.getUserById(authenticationData.id);

    res.status(200).send({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
  await BaseDatabase.destroyConnection();
});

app.get("/recipe/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const token = req.headers.authorization as string;

    const authenticator = new Authenticator();
    authenticator.getData(token);

    const recipeDb = new RecipeDataBase();
    const recipe = await recipeDb.getRecipeById(id);

    res.status(200).send({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      createDate: recipe.createDate,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
  await BaseDatabase.destroyConnection();
});
/*app.get("/user/:id", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization as string;
    const id = req.params.id;

    const authenticator = new Authenticator();
    authenticator.getData(token);

    const userDb = new UserDatabase();
    const user = await userDb.getUserById(id);

    res.status(200).send({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
  await BaseDatabase.destroyConnection();
});
*/

app.post("/recipe", async (req: Request, res: Response) => {
  try {
      const token = req.headers.authorization as string;

      const authenticator = new Authenticator;
      const authorId = authenticator.getData(token);

      const id = new IdGenerator().generate();
     
      const createAt = moment().format("DD/MM/YYYY")

      const {title, description} = req.body

      const newRecipe = await new RecipeDataBase().createRecipe(
          id,
          title,
          description,
          createAt,
          authorId.id
      );
      if (!title || !description) {

        res.status(400).send({ message: "Preencha todos os campos"});

      } else {

        res.status(200).send({title, description});
      }
          
  } catch(err) {
      res.status(400).send({message: err.message || err.mysqlmessage })
  }
})

app.get("/users/feed", async(req:Request, res:Response) => {

  try {
    const token = req.headers.authorization as string;

    const authenticator = new Authenticator();
    const payloadAuthor = authenticator.getData(token);

    const recipeFeed = await new UserDatabase().getRecipeFeed(payloadAuthor.id)

    console.log(payloadAuthor)
    res.status(200).send({recipes:[recipeFeed]})
  } catch(err) {
    res.status(400).send({message: err.message || err.mysqlmessage })
  }


})
const server = app.listen(process.env.PORT || 3003, () => {
  if (server) {
    const address = server.address() as AddressInfo;
    console.log(`Server is running in http://localhost:${address.port}`);
  } else {
    console.error(`Failure upon starting server.`);
  }
});
