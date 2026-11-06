const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const connectDB = require('./config/db');
connectDB();

const app = express();

// Cross-Origin Resource Sharing allow karne ke liye helmet config
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration - Allow All Origins for Mobile & Local Dev
app.use(cors({
  origin: '*',
  credentials: true,
}));

// Prevent 304 Caching Issues
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SmartFIR Backend Running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      firs: '/api/firs',
      speech: '/api/speech',
      suspects: '/api/suspects',
      alerts: '/api/alerts',
      cameras: '/api/cameras',
      officers: '/api/officers',
      cases: '/api/cases',
      reports: '/api/reports',
      notifications: '/api/notifications',
      settings: '/api/settings',
    },
  });
});

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/firs', require('./routes/firRoutes'));
app.use('/api/speech', require('./routes/speechRoutes'));
app.use('/api/suspects', require('./routes/suspectRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/cameras', require('./routes/cameraRoutes'));
app.use('/api/officers', require('./routes/officerRoutes'));
app.use('/api/cases', require('./routes/caseRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/stations', require('./routes/stationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 http://localhost:${PORT}\n`);
});