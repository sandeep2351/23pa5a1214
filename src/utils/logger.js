/**
 * Frontend Logging Middleware
 * Implements comprehensive logging as required by the technical specifications
 */

class Logger {
  constructor() {
    this.logs = [];
  }

  log(level, packageName, message, additionalData = {}) {
    const logEntry = {
      stack: "frontend",
      level: level,
      package: packageName,
      message: message,
      timestamp: new Date().toISOString(),
      ...additionalData
    };

    this.logs.push(logEntry);
    
    // Output to console for development (as required format)
    console.log(JSON.stringify({
      stack: logEntry.stack,
      level: logEntry.level,
      package: logEntry.package,
      message: logEntry.message
    }, null, 2));

    return logEntry;
  }

  info(packageName, message, additionalData = {}) {
    return this.log('info', packageName, message, additionalData);
  }

  warn(packageName, message, additionalData = {}) {
    return this.log('warn', packageName, message, additionalData);
  }

  error(packageName, message, additionalData = {}) {
    return this.log('error', packageName, message, additionalData);
  }

  debug(packageName, message, additionalData = {}) {
    return this.log('debug', packageName, message, additionalData);
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();