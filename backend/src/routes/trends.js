const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getTrends, getTrendById, getArchive } = require('../controllers/trendController');
const { createAction } = require('../controllers/actionController');

const router = express.Router();

// All routes require JWT authentication
router.use(authMiddleware);

// GET trends
router.get('/', getTrends);

// GET single trend
router.get('/:id', getTrendById);

// POST action on trend
router.post('/:id/actions', createAction);

// GET archive
router.get('/archive', getArchive);

module.exports = router;
