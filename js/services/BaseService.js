import { getLogger } from "../helpers/logger.js";

export class BaseService {
  constructor(httpClient) {
    if (new.target === BaseService) {
      throw new Error(
        "BaseService é uma classe abstrata e não pode ser instanciada diretamente",
      );
    }

    this._http = httpClient;
  }

  async getAll() {
    throw new Error("getAll não implementado.");
  }
  async getById() {
    throw new Error("getById não implementado.");
  }
  async create() {
    throw new Error("create não implementado.");
  }
  async update() {
    throw new Error("update não implementado.");
  }
  async remove() {
    throw new Error("remove não implementado.");
  }
}

export class GenericService extends BaseService {
  #endpoint;
  #fromApi;
  #log;

  /**
   * @param {HttpClient} httpClient
   * @param {string} endpoint
   * @param {Function} fromApi
   */
  constructor(httpClient, endpoint, fromApi) {
    super(httpClient);
    this.#endpoint = endpoint;
    this.#fromApi = fromApi;
    this.#log = getLogger(`Service from: ${endpoint}`);
  }

  async getAll() {
    this.#log.info(`GET ${this.#endpoint}`);
    const raw = await this._http.get(this.#endpoint);
    if (!Array.isArray(raw)) return [];
    return raw.map(this.#fromApi);
  }

  async getById(id) {
    this.#log.info(`GET ${this.#endpoint}/${id}`);
    const raw = await this._http.get(`${this.#endpoint}/${id}`);
    return this.#fromApi(raw);
  }

  async create(payload) {
    this.#log.info(`POST ${this.#endpoint}`, payload);
    const raw = await this._http.post(this.#endpoint, payload);
    return raw ? this.#fromApi(raw) : null;
  }

  async update(id, payload) {
    this.#log.info(`PUT ${this.#endpoint}/${id}`, payload);
    const raw = await this._http.put(`${this.#endpoint}/${id}`, payload);
    return raw ? this.#fromApi(raw) : null;
  }
  
  async remove(id) {
    this.#log.info(`DELETE ${this.#endpoint}/${id}`);
    return this._http.delete(`${this.#endpoint}/${id}`);
  }
}
