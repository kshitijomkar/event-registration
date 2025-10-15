// backend/controllers/qrController.js
const Registration = require('../models/registrationModel');
const StudentDetails = require('../models/studentDetailsModel');
const { decryptData } = require('../utils/cryptoUtils');

// @desc    Validate a QR code and check-in user
// @route   POST /api/scan/qr
// @access  Private/Admin
exports.scanQrCode = async (req, res) => {
    const { qrData } = req.body;

    if (!qrData) {
        return res.status(400).json({ message: 'QR data is required.' });
    }

    try {
        // 1. Decrypt the QR data
        const decryptedData = decryptData(qrData);
        const { registrationId, eventId, userId } = decryptedData;

        // 2. Find the registration
        const registration = await Registration.findById(registrationId);

        // 3. Perform validation checks
        if (!registration) {
            return res.status(404).json({ message: 'INVALID QR CODE: Registration not found.' });
        }
        if (registration.eventId.toString() !== eventId) {
            return res.status(400).json({ message: 'INVALID QR CODE: Event mismatch.' });
        }
        if (registration.status !== 'APPROVED') {
            return res.status(403).json({ message: `Registration is not approved. Current status: ${registration.status}` });
        }
        if (registration.qrUsed) {
            return res.status(409).json({ message: 'ALREADY CHECKED-IN: This QR code has already been used.' });
        }

        // 4. If all checks pass, update the registration
        registration.qrUsed = true;
        await registration.save();

        // 5. Fetch student details to return to the admin
        const studentDetails = await StudentDetails.findOne({ userId, eventId });

        res.status(200).json({
            status: 'success',
            message: 'Check-in successful!',
            data: {
                fullName: studentDetails?.fullName,
                rollNumber: studentDetails?.rollNumber,
                collegeName: studentDetails?.collegeName,
            }
        });

    } catch (error) {
        console.error('QR Scan Error:', error);
        res.status(400).json({ message: 'INVALID QR CODE: Data could not be processed.' });
    }
};