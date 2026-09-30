const express = require('express');
const router = express.Router();
const {
  getMicroTrends,
  getMicroTrendById,
  getMicroTrendStats
} = require('../controllers/microTrendsController');

// GET /api/micro-trends - List all micro-trends with filters
router.get('/', getMicroTrends);

// GET /api/micro-trends/:id - Get single micro-trend
router.get('/:id', getMicroTrendById);

// GET /api/micro-trends/stats/overview - Get micro-trends stats
router.get('/stats/overview', getMicroTrendStats);

module.exports = router;
