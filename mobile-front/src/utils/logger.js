const logLevels = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  };
  
  export const logger = {
    error: (message, ...args) => {
      console.error(`[ERROR] ${message}`, ...args);
    },
    warn: (message, ...args) => {
      console.warn(`[WARN] ${message}`, ...args);
    },
    info: (message, ...args) => {
      console.info(`[INFO] ${message}`, ...args);
    },
    debug: (message, ...args) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[DEBUG] ${message}`, ...args);
      }
    }
  };