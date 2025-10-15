// backend/routes/registrationRoutes.js
const express = require('express');
const router = express.Router();
const { 
    registerForEvent, 
    getMyRegistrations, 
    getRegistrationsForEvent, 
    updateRegistrationStatus,
    exportRegistrationsCsv 
} = require('../controllers/registrationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// User routes
router.post('/', protect, upload, registerForEvent);
router.get('/my-events', protect, getMyRegistrations);

// Admin routes
router.get('/event/:eventId', protect, restrictTo('ADMIN'), getRegistrationsForEvent);
router.put('/:registrationId/status', protect, restrictTo('ADMIN'), updateRegistrationStatus);


// Add the new export route
router.get('/event/:eventId/export-csv', protect, restrictTo('ADMIN'), exportRegistrationsCsv);

module.exports = router;