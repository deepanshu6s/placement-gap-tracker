const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const requestLogger = require('./middleware/requestLogger');
const { globalRateLimiter } = require('./middleware/rateLimiter');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const app = express();

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request Logging
app.use(requestLogger);

// Global Rate Limiting
app.use(globalRateLimiter);

// API Route Hierarchy
app.use('/api', apiRoutes);

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Centralized Error Handler (must be last middleware)
app.use(errorHandler);

module.exports = app;
