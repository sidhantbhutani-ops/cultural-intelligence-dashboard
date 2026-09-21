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


// DELETE all trends (clear cache for re-analysis)
router.post("/clear-trends", async (req, res) => {
  try {
    const supabase = require("../config/supabase");
    const { rows, error } = await supabase.query("DELETE FROM trends WHERE created_at IS NOT NULL RETURNING id");
    
    if (error) throw error;
    
    res.json({ status: "success", message: `All trends deleted (${rows?.length || 0} removed)` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
