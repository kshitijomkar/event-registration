const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');

router.post('/', async (req, res) => {
  const { name, rollNo, year, section, mobile } = req.body;
  try {
    let registration = await Registration.findOne({ rollNo: rollNo.toUpperCase() });
    if (registration) {
      return res.status(400).json({ msg: 'This roll number is already registered.' });
    }
    registration = new Registration({ name, rollNo, year, section, mobile });
    await registration.save();
    res.status(201).json({ msg: 'Registration successful!', registrationId: registration._id });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});
module.exports = router;