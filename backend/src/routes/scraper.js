const express = require('express');
const authMiddleware = require('../middleware/auth.js');
const { getStatus, triggerRun, cancelRun } = require('../controllers/scraperController.js');

const router = express.Router();

router.use(authMiddleware);

router.get('/status', getStatus);

router.post('/run', triggerRun);

router.patch('/run/:runId/cancel', cancelRun);

module.exports = router;
