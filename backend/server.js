const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const Admin = require('./models/Admin');
const registrationRoutes = require('./routes/registration');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

const app = express();

const allowedOrigins = ['https://event-registration-sigma-nine.vercel.app'];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log('MongoDB Connected...');
    createDefaultAdmin();
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

app.use('/api/register', registrationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// --- NEW: API Health Check Endpoint ---
app.get('/api/health', (req, res) => {
  // Check DB connection state
  const isDbConnected = mongoose.connection.readyState === 1;
  if (isDbConnected) {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      database: 'Connected',
    });
  } else {
    res.status(503).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
    });
  }
});


const createDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      const admin = new Admin({
        username: process.env.ADMIN_USERNAME,
        password: hashedPassword,
      });
      await admin.save();
      console.log('Default admin user created.');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));