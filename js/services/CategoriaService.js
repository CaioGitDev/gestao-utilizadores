import { GenericService } from "./BaseService.js";
import { Categoria } from "../models/Categoria.model.js";

export class CategoriaService extends GenericService {

  constructor(httpClient) {
    super(httpClient, "api/tmpCategoriaDemo", Categoria.fromApi);
  }

  async getAllAtivas(){
    const categorias = await this.getAll();
    return categorias.filter(x => x.ativo);
  }
}
