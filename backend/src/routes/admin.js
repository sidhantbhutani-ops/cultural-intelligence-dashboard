const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getSources, createSource, getSourceById, updateSource, deleteSource } = require('../controllers/adminController');

const router = express.Router();

// All admin routes require JWT authentication
router.use(authMiddleware);

// GET sources
router.get('/sources', getSources);

// POST new source
router.post('/sources', createSource);

// GET single source
router.get('/sources/:id', getSourceById);

// PATCH update source
router.patch('/sources/:id', updateSource);

// DELETE source
router.delete('/sources/:id', deleteSource);

module.exports = router;
