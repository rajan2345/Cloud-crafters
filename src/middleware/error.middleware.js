const logger = require('../utils/logger.js');
const { Prisma } = require('@prisma/client');

// Custom error class for application errors
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Prisma error handler
const handlePrismaError = (error) => {
  if (error.code === 'P2002') {
    return new AppError('Duplicate entry. This resource already exists.', 409);
  }
  if (error.code === 'P2025') {
    return new AppError('Resource not found.', 404);
  }
  if (error.code === 'P2003') {
    return new AppError('Invalid reference. Related resource does not exist.', 400);
  }
  
  return new AppError('Database operation failed.', 500);
};

// Global error handling middleware
const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  logger.error('Error caught by middleware:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle different error types
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  }
  
  if (err.name === 'ValidationError') {
    error = new AppError('Invalid input data.', 400);
  }
  
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token.', 401);
  }
  
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired.', 401);
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Internal server error';

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        details: error 
      }),
    },
    timestamp: new Date().toISOString(),
  });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  errorMiddleware,
  asyncHandler,
};
