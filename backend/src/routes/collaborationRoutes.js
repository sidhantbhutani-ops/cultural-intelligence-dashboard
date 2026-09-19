const express = require('express');
const commentsController = require('../controllers/commentsController');
const tagsController = require('../controllers/tagsController');
const pickupController = require('../controllers/pickupController');

const router = express.Router();

// Comments routes
router.post('/trends/:trendId/comments', commentsController.addComment);
router.get('/trends/:trendId/comments', commentsController.getComments);
router.delete('/trends/:trendId/comments/:commentId', commentsController.deleteComment);

// Tags routes
router.post('/trends/:trendId/tags', tagsController.addTag);
router.get('/trends/:trendId/tags', tagsController.getTags);
router.delete('/trends/:trendId/tags/:tag', tagsController.removeTag);

// Pickup routes
router.patch('/trends/:trendId/mark-picked-up', pickupController.markPickedUp);
router.get('/trends/:trendId/pickup-status', pickupController.getPickupStatus);

module.exports = router;
