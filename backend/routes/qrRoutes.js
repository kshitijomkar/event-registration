// backend/routes/qrRoutes.js
const express = require('express');
const router = express.Router();
const { scanQrCode } = require('../controllers/qrController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/scan-qr', protect, restrictTo('ADMIN'), scanQrCode);

module.exports = router;