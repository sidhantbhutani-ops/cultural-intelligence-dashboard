const express = require('express');
const authMiddleware = require('../middleware/auth.js');
const { getStatus, triggerRun, cancelRun, testSlackNotification } = require('../controllers/scraperController.js');

const router = express.Router();

router.use(authMiddleware);

router.get('/status', getStatus);

router.post('/run', triggerRun);

router.patch('/run/:runId/cancel', cancelRun);

router.post('/test-slack', testSlackNotification);

module.exports = router;
