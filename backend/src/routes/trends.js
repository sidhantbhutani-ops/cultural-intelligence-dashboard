const express = require('express');
const { getTrends, getTrendById, getArchive } = require('../controllers/trendController');
const { createAction } = require('../controllers/actionController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply auth to all routes
router.use(authMiddleware);

// GET active trends
router.get('/', getTrends);

// GET archive (MUST come before /:id)
router.get('/archive', getArchive);

// GET single trend
router.get('/:id', getTrendById);

// POST action on trend
router.post('/:id/actions', createAction);

module.exports = router;
