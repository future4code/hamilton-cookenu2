import { BaseDatabase } from "./BaseDataBase";

export class RecipeDataBase extends BaseDatabase {
  private static TABLE_NAME = "cookenu_recipe";

  public async createRecipe(
    id: string,
    title: string,
    description: string,
    createAt: string,
    author_id:string
  ): Promise<any> {
    await this.getConnection()
      .insert({
        id,
        title,
        description,
        createAt,
        author_id
        
      })
      .into(RecipeDataBase.TABLE_NAME);
      await BaseDatabase.destroyConnection();
  }
  public async getRecipeById(id: string): Promise<any> {
    const recipe = await this.getConnection()
      .select("*")
      .from(RecipeDataBase.TABLE_NAME)
      .where({ id });

    return recipe[0];
  }
  
}
