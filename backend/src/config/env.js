require('dotenv').config({ path: '.env.local' });

const requiredEnvVars = [
  'DATABASE_URL',
  'SCRAPER_API_KEY',
  'JWT_SECRET',
  'ANTHROPIC_API_KEY',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`[Error] Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

module.exports = {
  databaseUrl: process.env.DATABASE_URL,
  scraperApiKey: process.env.SCRAPER_API_KEY,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 10000,
  logLevel: process.env.LOG_LEVEL || 'info',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
};
