
const LOG_LEVELS = Object.freeze({
  DEBUG: { value: 0, label: 'DEBUG', color: '#9e9e9e' },
  INFO: { value: 1, label: 'INFO', color: '#2196F3' },
  WARN: { value: 2, label: 'WARN', color: '#ff9800' },
  ERROR: { value: 3, label: 'ERROR', color: '#f44336' },
});

const ACTIVE_LEVEL = LOG_LEVELS.DEBUG;

class Logger {
  #context;

  constructor(context = "App"){
    this.#context = context;
  }

  #format(level, message, data){
    return {
      timestamp: new Date().toISOString(),
      context: this.#context,
      level: level.label,
      message,
      data
    }
  }

  #shouldLog(level){
    return level.value >= ACTIVE_LEVEL.value;
  }

  #write(level, message, data){
    if(!this.#shouldLog(level)) return;

    const entry = this.#format(level, message, data);
    const style = `color: ${level.color}; font-weight: bold;`;
    const prefix = `%c[${entry.timestamp}] [${entry.context}] ${level.label}:`;

    if(data !== undefined){
      console.groupCollapsed(prefix, style, message);
      console.log('Dados: ', data);
      console.groupEnd();
    }else {
      console.log(prefix, style, message)
    }
  }


  debug(message, data){ this.#write(LOG_LEVELS.DEBUG, message, data); }
  info(message, data){ this.#write(LOG_LEVELS.INFO, message, data);  }
  warn(message, data){ this.#write(LOG_LEVELS.WARN, message, data);  }
  error(message, data){ this.#write(LOG_LEVELS.ERROR, message, data);  }

}

const _intances = new Map();

export function getLogger(context = 'App'){

  if(!_intances.has(context)){
    _intances.set(context, new Logger(context));
  }

  return _intances.get(context);
}

export const logger = getLogger('App');