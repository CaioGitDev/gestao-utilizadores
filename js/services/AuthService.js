import { getLogger } from '../helpers/logger.js';
import { setCookie, getCookie, deleteCookie } from '../helpers/cookieHelper.js';
import { tryCatch, ErrorType } from '../helpers/errorHandler.js';

const log = getLogger("AuthService");

export const AUTH_COOKIE_NAME = 'ipo_auth_token';
export const AUTH_EXPIRY_COOKIE = 'ipo_auth_expiry';

const COOKIE_EXPIRY_DAYS = 1;

class AuthService{
  #tokenEndpoint;
  #credentials;

  constructor(apiBaseUrl, credentials){
    this.#tokenEndpoint = `${apiBaseUrl.replace(/\/$/, '')}/api/token`;
    this.#credentials = credentials;
  }

  hasValidToken() {
    const token = getCookie(AUTH_COOKIE_NAME);
    const expiry = getCookie(AUTH_EXPIRY_COOKIE);

    if(!token || !expiry) return false;
    return Date.now() < (parseInt(expiry, 10) - 60 * 1000);
  }

  // gerantir que o token existe
  async ensureToken(){
    if(this.hasValidToken()){
      log.info("Token ainda válido!");
      return getCookie(AUTH_COOKIE_NAME);
    }

    log.info("Obter token da API");

    return await tryCatch(
      () => this.#fetchToken(),
      (error) => log.error("Falha do obter token", error.message)
    );
  }

  clearToken () {
    deleteCookie(AUTH_COOKIE_NAME);
    deleteCookie(AUTH_EXPIRY_COOKIE);
    log.info("Token removido");
  }

  getToken() {
    return getCookie(AUTH_COOKIE_NAME);
  }
  
  async #fetchToken() {
    const params =  new URLSearchParams(this.credentials);
    const url = `${this.#tokenEndpoint}?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'appplication/json'
      }
    });

    if(!response.ok){
      const err = new Error(`Falha ao obter token: HTTP ${response.status}`);
      err.type = ErrorType.AUTH;
      throw err;
    }

    const data = await response.json();
    this.#storeToken(data.token, data.expiresIn ?? 3600);
    log.info('Token obtido com sucesso', {
      expiresIn: `${data.expiresIn}s`
    });

    return data.token;
  }

  #storeToken(token, expiresInSeconds){
    const expiresTimeStamp = Date.now() + expiresInSeconds * 1000;

    setCookie(AUTH_COOKIE_NAME, token, COOKIE_EXPIRY_DAYS);
    setCookie(AUTH_EXPIRY_COOKIE, String(expiresTimeStamp), COOKIE_EXPIRY_DAYS);
  }

}


// FACTORY
export function createAuthService(apiBaseUrl, credentials){
  return new AuthService(apiBaseUrl, credentials);
}

