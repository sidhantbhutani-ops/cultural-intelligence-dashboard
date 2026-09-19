const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });

const { port } = require('./config/env');
const loggerMiddleware = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRouter = require('./routes/auth');
const trendsRouter = require('./routes/trends');
const adminRouter = require('./routes/admin');
const scraperRouter = require('./routes/scraper');
const collaborationRouter = require('./routes/collaborationRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/trends', trendsRouter);
app.use('/api/scraper', scraperRouter);
app.use('/api/admin', adminRouter);
app.use('/api', collaborationRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: 'Endpoint not found',
    timestamp: new Date().toISOString(),
  });
});

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(port, () => {
  console.log(`[Server] Listening on port ${port}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
  console.log(`[Server] API Health: http://localhost:${port}/api/health`);
});

module.exports = app;
