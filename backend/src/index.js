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
const teamRouter = require('./routes/team');

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

// Routes
app.use('/api/auth', authRouter);
app.use('/api/trends', trendsRouter);
app.use('/api/scraper', scraperRouter);
app.use('/api/admin', adminRouter);
app.use('/api', collaborationRouter);
app.use('/api', teamRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Error Handler Middleware
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = server;
