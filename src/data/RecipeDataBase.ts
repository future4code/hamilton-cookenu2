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
}
