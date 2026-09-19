const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

const VALID_USERS = {
  'afreen@broadway.com': 'broadway-afreen-123',
  'kevin@broadway.com': 'broadway-kevin-123',
  'aashna@broadway.com': 'broadway-aashna-123',
  'demo@broadway.com': 'demo-password-123',
};

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      code: 'MISSING_CREDENTIALS',
      message: 'Email and password are required',
      timestamp: new Date().toISOString(),
    });
  }

  if (!VALID_USERS[email] || VALID_USERS[email] !== password) {
    return res.status(401).json({
      status: 'error',
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
      timestamp: new Date().toISOString(),
    });
  }

  const token = jwt.sign(
    {
      user_id: email,
      email: email,
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
    },
    jwtSecret,
    { expiresIn: '24h' }
  );

  return res.json({
    status: 'success',
    token: token,
    user: {
      email: email,
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
    },
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  login,
};
