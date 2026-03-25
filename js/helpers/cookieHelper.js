
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
    date.setTime(date.getDate() + days * 24 * 60 * 60 * 1000); // days to ms
    expires = `; expires=${date.toUTCString()}`;
  }

  document.cookie = `${name}=${encodeURIComponent(value)};${expires}; path=${path}; SameSite=Strict`;
  log.debug(`Cookie definido: ${name}`, {
    days,
    path
  });

}

export function getCookie(name){
  const key = `${name}=`; // p4e_cookie
  for (let cookie of document.cookie.split(';')){
    const trimmend = cookie.trim();
    if(trimmend.startsWith(key)){
      return decodeURIComponent(trimmend.substring(key.length));
    }
  }

  return null;
}

export function deleteCookie(name, path='/'){
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; SameSite=Strict`;
}


export function hasCookie(name){
  return getCookie(name) !== null;
}
