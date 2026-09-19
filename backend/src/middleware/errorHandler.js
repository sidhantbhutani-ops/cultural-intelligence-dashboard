function errorHandler(err, req, res, next) {
  console.error('[Error]', err);

  // Database errors
  if (err.code === '23505') {
    return res.status(409).json({
      status: 'error',
      code: 'DUPLICATE_ENTRY',
      message: 'This record already exists',
      timestamp: new Date().toISOString(),
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      status: 'error',
      code: 'FOREIGN_KEY_VIOLATION',
      message: 'Referenced record not found',
      timestamp: new Date().toISOString(),
    });
  }

  // Validation errors
  if (err.message && err.message.includes('validation')) {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Default 500 error
  res.status(500).json({
    status: 'error',
    code: 'SERVER_ERROR',
    message: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
}

module.exports = errorHandler;
