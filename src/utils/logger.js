/**
 * Logger utility for DSA Sync Chrome Extension
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

class Logger {
  constructor(name = 'DSA Sync', currentLevel = LOG_LEVELS.INFO) {
    this.name = name;
    this.currentLevel = currentLevel;
    this.logs = [];
    this.maxLogs = 100;
  }

  setLevel(levelName) {
    if (LOG_LEVELS[levelName] !== undefined) {
      this.currentLevel = LOG_LEVELS[levelName];
    }
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      data
    };
  }

  _storeLog(logItem) {
    this.logs.push(logItem);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  debug(message, data = null) {
    if (this.currentLevel <= LOG_LEVELS.DEBUG) {
      const item = this.formatMessage('DEBUG', message, data);
      this._storeLog(item);
      console.debug(`[${this.name}][DEBUG]`, message, data || '');
    }
  }

  info(message, data = null) {
    if (this.currentLevel <= LOG_LEVELS.INFO) {
      const item = this.formatMessage('INFO', message, data);
      this._storeLog(item);
      console.log(`[${this.name}][INFO]`, message, data || '');
    }
  }

  warn(message, data = null) {
    if (this.currentLevel <= LOG_LEVELS.WARN) {
      const item = this.formatMessage('WARN', message, data);
      this._storeLog(item);
      console.warn(`[${this.name}][WARN]`, message, data || '');
    }
  }

  error(message, data = null) {
    if (this.currentLevel <= LOG_LEVELS.ERROR) {
      const item = this.formatMessage('ERROR', message, data);
      this._storeLog(item);
      console.error(`[${this.name}][ERROR]`, message, data || '');
    }
  }

  getRecentLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

// Create singleton logger instance
const logger = new Logger();

if (typeof window !== 'undefined') {
  window.DSALogger = logger;
}

export { Logger, logger, LOG_LEVELS };
export default logger;
