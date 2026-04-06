require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const logger = require('./config/logger');

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const scanRoutes = require('./routes/scanRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const simulationRoutes = require('./routes/simulationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/simulation', simulationRoutes);

// Basic route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'PhishShield API is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
