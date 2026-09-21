const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const { port } = require('./config/env');
const loggerMiddleware = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const { query } = require('./config/supabase');
const { startDailyScheduler } = require('./services/dailyScheduler');

// Routes
const authRouter = require('./routes/auth');
const trendsRouter = require('./routes/trends');
const adminRouter = require('./routes/admin');
const scraperRouter = require('./routes/scraper');
const collaborationRouter = require('./routes/collaborationRoutes');
const teamRouter = require('./routes/team');
const scoringRouter = require('./routes/scoring');

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
app.use('/api/collaboration', collaborationRouter);
app.use('/api/team', teamRouter);
app.use('/api/scoring', scoringRouter);

// Error Handler
app.use(errorHandler);

// Database Migrations
async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, './migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    console.log('[Migrations] Starting...');

    for (const file of files) {
      if (!file.endsWith('.sql')) continue;

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`[Migration] Running ${file}...`);

      try {
        await query(sql);
        console.log(`[Migration] ✅ ${file}`);
      } catch (err) {
        if (err.message.includes('already exists') || err.message.includes('duplicate key')) {
          console.log(`[Migration] ⚠️  ${file} (already applied)`);
        } else {
          throw err;
        }
      }
    }

    console.log('[Migrations] All migrations completed');
  } catch (err) {
    console.error('[Migrations] Error:', err.message);
    process.exit(1);
  }
}

// Start Server
runMigrations().then(() => {
  app.listen(port, () => {
    console.log(`🎭 Cultural Intelligence Dashboard running on port ${port}`);
    console.log(`📊 http://localhost:${port}`);
    
    // Start daily scheduler for Slack digest
    startDailyScheduler();
  });
});

module.exports = app;
