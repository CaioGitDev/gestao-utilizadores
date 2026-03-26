import { getLogger } from "../helpers/logger.js";
import { getCookie } from "../helpers/cookieHelper.js";
import {
  tryCatch,
  ErrorType,
  createHttpError,
} from "../helpers/errorHandler.js";
import { AUTH_COOKIE_NAME } from "../services/AuthService.js";

const log = getLogger("HttpClient");

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export class HttpClient {
  #baseUrl;
  #timeout;

  constructor(baseUrl, timeout = 15000) {
    this.#baseUrl = baseUrl.replace(/\/$/, "");
    this.#timeout = timeout;
  }

  // open/closed
  #buildHeaders(extraHeaders = {}) {
    const token = getCookie(AUTH_COOKIE_NAME);
    const authHeader = token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};

    return {
      ...DEFAULT_HEADERS,
      ...authHeader,
      ...extraHeaders,
    };
  }

  async #fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.#timeout);

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error(
          `Pedido cancelado: timeout de ${this.#timeout} excedido.`,
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async #request(method, endpoint, body = null, extraHeaders = {}) {
    const url = `${this.#baseUrl}${endpoint}`;
    const headers = this.#buildHeaders(extraHeaders);
    const options = {
      method,
      headers,
      ...(body !== null ? { body: JSON.stringify(body) } : {}),
    };

    log.debug(`-> ${method} ${url}`, body ?? undefined);
    const response = await this.#fetchWithTimeout(url, options);
    log.debug(`<- ${response.status} ${response.statusText}`);

    if (!response.ok) throw createHttpError(response);

    if (response.status === 204) return null;

    return response.json();
  }

  async get(endpoint, headers = {}) {
    return this.#request("GET", endpoint, null, headers);
  }
  async post(endpoint, body, headers = {}) {
    return this.#request("POST", endpoint, body, headers);
  }
  async put(endpoint, body, headers = {}) {
    return this.#request("PUT", endpoint, body, headers);
  }
  async delete(endpoint, headers = {}) {
    return this.#request("DELETE", endpoint, null, headers);
  }
}
