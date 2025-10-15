// backend/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const {
  createEvent,
  getActiveEvents,
  updateEvent,
  deleteEvent,
  getAllEventsAdmin,
} = require('../controllers/eventController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public route
router.get('/', getActiveEvents);

// Admin routes
router.post('/', protect, restrictTo('ADMIN'), createEvent);
router.get('/admin/all', protect, restrictTo('ADMIN'), getAllEventsAdmin);
router.put('/:id', protect, restrictTo('ADMIN'), updateEvent);
router.delete('/:id', protect, restrictTo('ADMIN'), deleteEvent);

module.exports = router;