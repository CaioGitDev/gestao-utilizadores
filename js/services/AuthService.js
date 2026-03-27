import { getLogger }                          from '../helpers/logger.js';
import { setCookie, getCookie, deleteCookie } from '../helpers/cookieHelper.js';
import { tryCatch, ErrorType }                from '../helpers/errorHandler.js';

const log = getLogger("AuthService");

export const AUTH_COOKIE_NAME   = 'ipo_auth_token';
export const AUTH_EXPIRY_COOKIE = 'ipo_auth_expiry';

const COOKIE_EXPIRY_DAYS = 1;
const EXPIRY_SAFETY_MARGIN_MS = 60 * 1000; // 1 minuto

class AuthService {
  #tokenEndpoint;
  #credentials;

  constructor(apiBaseUrl, credentials) {
    this.#tokenEndpoint = `${apiBaseUrl.replace(/\/$/, "")}/token`;
    this.#credentials = credentials;
  }

  hasValidToken() {
    const token = getCookie(AUTH_COOKIE_NAME);
    const expiry = getCookie(AUTH_EXPIRY_COOKIE);

    if (!token || !expiry) return false;

    const expiryTime = parseInt(expiry, 10);
    if (Number.isNaN(expiryTime)) return false;

    return Date.now() < (expiryTime - EXPIRY_SAFETY_MARGIN_MS);
  }

  async ensureToken() {
    if (this.hasValidToken()) {
      log.info("Token reutilizado do cookie.");
      return getCookie(AUTH_COOKIE_NAME);
    }

    log.info("A obter novo token da API…");

    return await tryCatch(
      () => this.#fetchToken(),
      (error) => {
        log.error("Falha ao obter token.", error.message);
        this.clearToken();
      }
    );
  }

  getToken() {
    return getCookie(AUTH_COOKIE_NAME);
  }

  clearToken() {
    deleteCookie(AUTH_COOKIE_NAME);
    deleteCookie(AUTH_EXPIRY_COOKIE);
    log.info("Token removido.");
  }

  async #fetchToken() {
    if (!this.#credentials?.username || !this.#credentials?.password) {
      throw new Error("Credenciais inválidas ou não definidas.");
    }


    const body = new URLSearchParams({
      grant_type: "password",
      username: this.#credentials.username,
      password: this.#credentials.password
    });

    const response = await fetch(this.#tokenEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });

    const raw = await response.text();

    if (!response.ok) {
      const err = new Error(`Auth falhou: HTTP ${response.status} - ${raw}`);
      err.type = ErrorType.AUTH;
      throw err;
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(`Resposta inválida (não JSON): ${raw}`);
    }

    const token = data.access_token;
    const expiresIn = data.expires_in || 3600;

    if (!token) {
      throw new Error("Token não presente na resposta.");
    }

    this.#storeToken(token, expiresIn);

    log.info("Token obtido com sucesso.", {
      expiresIn: `${expiresIn}s`
    });

    return token;
  }

  #storeToken(token, expiresInSeconds) {
    const expiryTimestamp = Date.now() + (expiresInSeconds * 1000);

    setCookie(AUTH_COOKIE_NAME, token, COOKIE_EXPIRY_DAYS);
    setCookie(AUTH_EXPIRY_COOKIE, String(expiryTimestamp), COOKIE_EXPIRY_DAYS);
  }
}

// FACTORY
export function createAuthService(apiBaseUrl, credentials) {
  return new AuthService(apiBaseUrl, credentials);
}