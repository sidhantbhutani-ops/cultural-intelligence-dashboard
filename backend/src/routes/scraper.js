const express = require('express');
const authMiddleware = require('../middleware/auth.js');
const { getStatus, triggerRun } = require('../controllers/scraperController.js');

const router = express.Router();

router.use(authMiddleware);

router.get('/status', getStatus);

router.post('/run', triggerRun);

module.exports = router;
