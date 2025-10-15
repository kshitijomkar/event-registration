// backend/routes/userRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// This is a sample protected route
router.get('/profile', protect, (req, res) => {
  res.status(200).json({
    message: 'You have accessed the protected profile route!',
    user: req.user,
  });
});

module.exports = router;