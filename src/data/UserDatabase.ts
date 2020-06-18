import { BaseDatabase } from "./BaseDataBase";
import { stringify } from "querystring";

export class UserDatabase extends BaseDatabase {
  

  private static TABLE_NAME = "cookenu_user";
  private static TABLE_NAME_FOLLOW = "cookenu_follow";

  public async createUser(
    id: string,
    email: string,
    name: string,
    password: string
  ): Promise<void> {
    await this.getConnection()
      .insert({
        id,
        email,
        name,
        password,
      })
      .into(UserDatabase.TABLE_NAME);
  }

  public async getUserByEmail(email: string): Promise<any> {
    const result = await this.getConnection()
      .select("*")
      .from(UserDatabase.TABLE_NAME)
      .where({ email });

    return result[0];
  }

  public async getUserById(id: string): Promise<any> {
    const result = await this.getConnection()
      .select("*")
      .from(UserDatabase.TABLE_NAME)
      .where({ id });

    return result[0];
  }

  public async followUserById(id_follower: string, id_followed: string): Promise<any>{
    const result = await this.getConnection()
      .insert({
        id_followed,
        id_follower
      })
      .into(UserDatabase.TABLE_NAME_FOLLOW)

      return(result)
  }
}
