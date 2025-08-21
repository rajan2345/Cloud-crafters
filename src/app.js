const express = require('express');
const cors = require('cors');
const helmet = require('helment');
const morgan = require('morgan');

//Import configurations and middlewares
const config = require('./config');
const { errorMiddleware } = require('./middleware/error.middleware');
const { loggingMiddleware } = require('./middleware/logging.middleware');
const routes = require('./routes');
const { contentSecurityPolicy } = require('helmet');

const app = express();

//Security middleware
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
}));

//CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV ==='production' ? process.env.ALLOWED_ORIGINS?.split(','): true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-api-key'],
};

app.use(cors(corsOptions));

//Request parsing middleware
app.use(express.json({limit: '10md'}));
app.use(express.urlencoded({extended: true, limit: '10mb'}));

//Logging middleware
if(process.env.NODE_ENV !== 'test'){
    app.use(morgan('combined'));
}

app.use(loggingMiddleware);

//API routes
app.use('/api', routes);

//404 handler for unmatched routes
app.use('*', (req, res) =>{
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
    });
});

//Global error handler 
app.use(errorMiddleware);
module.exports = app;