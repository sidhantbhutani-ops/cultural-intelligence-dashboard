const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  debug: (msg) => console.log(`[DEBUG] ${msg}`),
};

// Express middleware wrapper
const loggerMiddleware = (req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
};

module.exports = loggerMiddleware;
module.exports.logger = logger;
