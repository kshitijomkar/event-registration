// backend/controllers/authController.js

const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Helper function to sign a JWT
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '90d', // Token expires in 90 days
  });
};

// --- User Registration ---
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // 2. Create new user (password will be hashed by the pre-save hook)
    const newUser = await User.create({ name, email, password });
    
    // 3. Generate a token
    const token = signToken(newUser._id, newUser.role);
    
    // 4. Send response (don't send password)
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// --- User Login ---
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if email and password exist
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password.' });
        }

        // 2. Check if user exists and password is correct
        const user = await User.findOne({ email }).select('+password'); // Explicitly select password
        
        if (!user || !(await user.comparePassword(password, user.password))) {
            return res.status(401).json({ message: 'Incorrect email or password.' });
        }

        // 3. If everything is ok, send token to client
        const token = signToken(user._id, user.role);

        user.password = undefined;

        res.status(200).json({
            status: 'success',
            token,
            data: {
              user
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};