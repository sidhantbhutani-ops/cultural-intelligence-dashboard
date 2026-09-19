const { scraperApiKey } = require('../config/env');

function apiKeyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      code: 'INVALID_API_KEY',
      message: 'Missing or invalid API key',
      timestamp: new Date().toISOString(),
    });
  }

  const apiKey = authHeader.substring(7);

  if (apiKey !== scraperApiKey) {
    return res.status(401).json({
      status: 'error',
      code: 'INVALID_API_KEY',
      message: 'API key is invalid',
      timestamp: new Date().toISOString(),
    });
  }

  next();
}

module.exports = apiKeyAuth;
