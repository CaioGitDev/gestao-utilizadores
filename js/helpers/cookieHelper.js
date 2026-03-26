
import { getLogger } from './logger.js';
const log = getLogger("CookieHelper");


export function setCookie(
  name,
  value,
  days = 0,
  path = '/'
){

  let expires = '';
  if(days > 0){
    const date = new Date();
    date.setTime(date.getTime() + days * 86400000); 
    expires = `; expires=${date.toUTCString()}`;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=${path}; SameSite=Strict`;
}

export function getCookie(name){
  const key = `${name}=`;
  for (let cookie of document.cookie.split(';')){
    const trimmend = cookie.trim();
    if(trimmend.startsWith(key)){
      return decodeURIComponent(trimmend.substring(key.length));
    }
  }

  return null;
}

export function deleteCookie(name, path='/'){
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; SameSite=Strict`;
  log.debug(`Cookie removido: ${name}`);
}


export function hasCookie(name){
  return getCookie(name) !== null;
}
