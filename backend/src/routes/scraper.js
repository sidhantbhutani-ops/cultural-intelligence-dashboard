const express = require('express');
const apiKeyAuth = require('../middleware/apiKeyAuth.js');
const { getStatus, triggerRun } = require('../controllers/scraperController.js');

const router = express.Router();

// All scraper admin routes require API key
router.use(apiKeyAuth);

// Get scraper status and last runs
router.get('/status', getStatus);

// Trigger a manual scraper run
router.post('/run', triggerRun);

module.exports = router;
