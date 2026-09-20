const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  assignTrend,
  unassignTrend,
} = require('../controllers/teamController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Team members CRUD
router.get('/members', getTeamMembers);
router.post('/members', addTeamMember);
router.put('/members/:id', updateTeamMember);
router.delete('/members/:id', deleteTeamMember);

// Trend assignment
router.put('/trends/:id/assign', assignTrend);
router.put('/trends/:id/unassign', unassignTrend);

module.exports = router;
