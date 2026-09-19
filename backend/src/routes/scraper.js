const express = require('express');
const authMiddleware = require('../middleware/auth.js');
const { getStatus, triggerRun } = require('../controllers/scraperController.js');

const router = express.Router();

// All scraper routes require JWT auth (dashboard internal use)
router.use(authMiddleware);

// Get scraper status and last runs
router.get('/status', getStatus);

// Trigger a manual scraper run
router.post('/run', triggerRun);

module.exports = router;
