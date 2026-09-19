const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      code: 'INVALID_TOKEN',
      message: 'Missing or invalid authorization header',
      timestamp: new Date().toISOString(),
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      code: 'INVALID_TOKEN',
      message: 'JWT token expired or invalid',
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = authMiddleware;
