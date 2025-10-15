// backend/controllers/registrationController.js
const Registration = require('../models/registrationModel');
const StudentDetails = require('../models/studentDetailsModel');
// Add this to backend/controllers/registrationController.js
const { Parser } = require('json2csv');

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Private
exports.registerForEvent = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Payment screenshot is required.' });
    }

    const { eventId, fullName, rollNumber, department, section, year, phoneNumber, collegeName, teamName, transactionId } = req.body;
    const userId = req.user._id;

    const existingRegistration = await Registration.findOne({ userId, eventId });
    if (existingRegistration) {
      return res.status(400).json({ message: 'You are already registered for this event.' });
    }

    await StudentDetails.create({
      userId, eventId, fullName, rollNumber, department, section, year, phoneNumber, collegeName, teamName
    });

    const registration = await Registration.create({
      userId,
      eventId,
      transactionId,
      paymentScreenshot: req.file.path,
    });

    res.status(201).json({
      status: 'success',
      message: 'Registered successfully. Your registration is pending approval.',
      data: registration,
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get my registrations
// @route   GET /api/registrations/my-events
// @access  Private
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ userId: req.user._id }).populate('eventId', 'title date venue');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all registrations for an event (Admin)
// @route   GET /api/registrations/event/:eventId
// @access  Private/Admin
exports.getRegistrationsForEvent = async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.eventId })
      .populate('userId', 'name email');

    const studentDetails = await StudentDetails.find({ eventId: req.params.eventId });

    const combinedData = registrations.map(reg => {
      const details = studentDetails.find(sd => sd.userId.toString() === reg.userId._id.toString());
      return {
        ...reg.toObject(),
        studentDetails: details
      };
    });

    res.json(combinedData);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update registration status (Admin)
// @route   PUT /api/registrations/:registrationId/status
// @access  Private/Admin
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const registration = await Registration.findById(req.params.registrationId);

    if (registration) {
      registration.status = status;
      const updatedRegistration = await registration.save();
      res.json(updatedRegistration);
    } else {
      res.status(404).json({ message: 'Registration not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// @desc    Export registrations to CSV
// @route   GET /api/registrations/event/:eventId/export-csv
// @access  Private/Admin
exports.exportRegistrationsCsv = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Fetch registrations and populate related data
    const registrations = await Registration.find({ eventId })
      .populate('userId', 'name email');
    const studentDetails = await StudentDetails.find({ eventId });

    // Combine the data into a flat structure for the CSV
    const flattenedData = registrations.map(reg => {
      const details = studentDetails.find(sd => sd.userId._id.toString() === reg.userId._id.toString());
      return {
        registrationId: reg._id,
        userName: reg.userId.name,
        userEmail: reg.userId.email,
        status: reg.status,
        checkedIn: reg.qrUsed ? 'Yes' : 'No',
        registrationDate: reg.createdAt.toLocaleDateString(),
        fullName: details?.fullName,
        rollNumber: details?.rollNumber,
        department: details?.department,
        year: details?.year,
        collegeName: details?.collegeName,
        phoneNumber: details?.phoneNumber,
      };
    });

    // Define the CSV fields and header names
    const fields = [
      { label: 'Name', value: 'fullName' },
      { label: 'Email', value: 'userEmail' },
      { label: 'Roll Number', value: 'rollNumber' },
      { label: 'Department', value: 'department' },
      { label: 'Year', value: 'year' },
      { label: 'College', value: 'collegeName' },
      { label: 'Phone Number', value: 'phoneNumber' },
      { label: 'Status', value: 'status' },
      { label: 'Checked In', value: 'checkedIn' },
      { label: 'Registration Date', value: 'registrationDate' },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(flattenedData);

    // Set headers to trigger browser download
    res.header('Content-Type', 'text/csv');
    res.attachment(`event-registrations-${eventId}.csv`);
    res.status(200).send(csv);

  } catch (error) {
    console.error('CSV Export Error:', error);
    res.status(500).json({ message: 'Server Error during CSV export' });
  }
};