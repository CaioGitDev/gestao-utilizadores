import { GenericService } from "./BaseService.js";
import { UserDemo } from "../models/UserDemo.model.js";
import { getLogger } from "../helpers/logger.js";

const log = getLogger("UserDemoService");

export class UserDemoService extends GenericService {
  #currentUser;

  constructor(httpClient, currentUser = "Admin") {
    super(httpClient, "api/tmpUserDemo", UserDemo.fromApi);
    this.#currentUser = currentUser;
  }

  async create(payload) {
    const payloadWithCurrentUser = {
      ...payload,
      criadoPor: this.#currentUser,
    };
    log.info("Utilizador criado por: ", this.#currentUser);
    return super.create(payloadWithCurrentUser);
  }

  setCurrentUser(username){
    this.#currentUser = username;
    log.debug(`Utilizador atual definido:  ${username}`)
  }
}
