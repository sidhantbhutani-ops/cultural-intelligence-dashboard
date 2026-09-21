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


// Add SPECTRUM scoring columns to trends table
router.post("/add-spectrum-columns", async (req, res) => {
  try {
    const supabase = require("../config/supabase");
    const { query } = supabase;

    const columns = [
      { name: 'velocity_score', def: 'INTEGER DEFAULT 0' },
      { name: 'platform_score', def: 'INTEGER DEFAULT 0' },
      { name: 'novelty_score', def: 'INTEGER DEFAULT 0' },
      { name: 'community_score', def: 'INTEGER DEFAULT 0' },
      { name: 'adoption_score', def: 'INTEGER DEFAULT 0' },
      { name: 'category_score', def: 'INTEGER DEFAULT 0' }
    ];

    const results = [];
    for (const col of columns) {
      try {
        const sql = `ALTER TABLE trends ADD COLUMN ${col.name} ${col.def};`;
        await query(sql);
        results.push({ column: col.name, status: 'added' });
        console.log(`✅ Added column: ${col.name}`);
      } catch (err) {
        if (err.message && err.message.includes('already exists')) {
          results.push({ column: col.name, status: 'already_exists' });
          console.log(`⚠️  Column ${col.name} already exists`);
        } else {
          throw err;
        }
      }
    }

    res.json({ 
      status: 'success', 
      message: 'SPECTRUM columns processed',
      results
    });
  } catch (error) {
    console.error('Error adding SPECTRUM columns:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

module.exports = router;
