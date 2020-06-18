import { BaseDatabase } from "./BaseDataBase";

export class RecipeDataBase extends BaseDatabase {
  private static TABLE_NAME = "cookenu_recipe";

  public async createRecipe(
    id: string,
    title: string,
    description: string,
    createDate: string
  ): Promise<any> {
    await this.getConnection()
      .insert({
        id,
        title,
        description,
        createDate,
      })
      .into(RecipeDataBase.TABLE_NAME);
  }
  public async getRecipeById(id: string): Promise<any> {
    const recipe = await this.getConnection()
      .select("*")
      .from(RecipeDataBase.TABLE_NAME)
      .where({ id });

    return recipe[0];
  }
}
