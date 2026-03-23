import { getLogger } from './logger.js'
const log = getLogger('ErrorHandler');

export const ErrorType = Object.freeze({
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
});

export function createHttpError(response){
  const statusMap = {
    400: { type: ErrorType.VALIDATION, message: 'Dados inválidos' },
    401: { type: ErrorType.AUTH, message: 'Não autorizado'},
    403: { type: ErrorType.AUTH, message: 'Acesso negado'},
    404: { type: ErrorType.NOT_FOUND, message: 'Recurso não encontrado'},
    500: { type: ErrorType.SERVER, message: 'Error interno do servidor'}
  }

  const mapped = statusMap[response.status] || {
    type: TypeError.UNKNOWN, message: `Erro Http inesperado: ${response.status}`
  };

  const error = new Error(mapped.message);
  error.type = mapped.type;
  error.statusCode = response.status;

  return error;
}


export function isNetworkError(error){
  return error instanceof TypeError && error.message.includes('fetch');
}

export async function tryCatch(asyncFn, onError){
  try {
    return await asyncFn();
  } catch(error) {
    if(isNetworkError(error)){
      error.type = ErrorType.NETWORK;
      error.message = 'Sem ligação ao servidor';
    }

    if(!error.type) error.type = ErrorType.UNKNOWN;

    log.error(`[${error.type}] ${error.message}`, {
      stack: error.stack,
      statusCode: error.statusCode
    })

    if(typeof onError === 'function') onError(error);

    return null;
  }
}