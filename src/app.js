// Import essential libraries
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');


//Import configurations and middlewares
const config = require('./config/index.js');
const { errorMiddleware } = require('./middleware/error.middleware.js');
const { loggingMiddleware } = require('./middleware/logging.middleware.js');
const routes = require('./routes/index.js');
const { contentSecurityPolicy } = require('helmet');

// Initialize the Express application
const app = express();

//Security middleware
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
}));

// Configure Cross-Origin Resource Sharing (CORS)
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-api-key'],
};

app.use(cors(corsOptions));

// Parse incoming requests with JSON and URL-encoded payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable request logging with Morgan in non-test environments
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// Apply custom logging middleware
app.use(loggingMiddleware);

// Mount the API routes
app.use('/api', routes);

// Apply the global error handling middleware
app.use(errorMiddleware);

// Handle 404 errors for unmatched routes (this should be last)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
    });
});

// Export the app for use in server.js
module.exports = app;