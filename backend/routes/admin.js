const express = require('express');
const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const Registration = require('../models/Registration');

// Protect all routes in this file
router.use(adminAuth);

// @route   GET /api/admin/registrations
// @desc    Get all registrations with optional filters
router.get('/registrations', async (req, res) => {
    try {
        const { year, section } = req.query;
        const filter = {};
        if (year) filter.year = year;
        if (section) filter.section = section;

        const registrations = await Registration.find(filter).sort({ registeredAt: -1 });
        res.json(registrations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/admin/approve
// @desc    Approve multiple registrations
router.put('/approve', async (req, res) => {
    const { ids } = req.body; // Expect an array of registration IDs
    try {
        await Registration.updateMany(
            { _id: { $in: ids } },
            { $set: { status: 'approved' } }
        );
        res.json({ msg: 'Registrations approved successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/admin/reject
// @desc    Reject (delete) multiple registrations
router.delete('/reject', async (req, res) => {
    const { ids } = req.body; // Expect an array of registration IDs
    try {
        await Registration.deleteMany({ _id: { $in: ids } });
        res.json({ msg: 'Registrations rejected and removed successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET /api/admin/verify/:id
// @desc    Verify a registration and mark it as attended (one-time scan)
router.get('/verify/:id', adminAuth, async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ msg: 'Registration not found. Invalid QR Code.' });
        }

        if (registration.status !== 'approved') {
            return res.status(403).json({ msg: 'Access Denied: Registration not approved.' });
        }
        
        // --- NEW: Check if QR code has already been scanned ---
        if (registration.attended) {
            return res.status(409).json({ 
                msg: 'Access Denied: QR code has already been scanned.',
                student: {
                    name: registration.name,
                    rollNo: registration.rollNo,
                    attendedAt: registration.attendedAt
                }
            });
        }
        // ---

        // If all checks pass, mark as attended and save
        registration.attended = true;
        registration.attendedAt = new Date();
        await registration.save();

        res.json({
            msg: 'Entry Validated!',
            student: {
                name: registration.name,
                rollNo: registration.rollNo,
                year: registration.year,
                section: registration.section,
            },
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;