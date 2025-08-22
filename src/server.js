// Load environment variables from .env file
require('dotenv').config();

// Import the Express app, configuration, logger, and Prisma client creator
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const createPrismaClient = require('./config/database');

// Main function to start the server
const startServer = async () => {
    try {
        // Create and connect Prisma client to test database connection
        const prisma = createPrismaClient();
        await prisma.$connect();

        logger.info('Database connection established successfully');

        // Start the Express server on the configured port
        const server = app.listen(config.port, () => {
            logger.info(`🚀 Cloud Service Mapper API running on port ${config.port}`);
            logger.info(`📄 Environment: ${config.nodeEnv}`);
            logger.info(`🗄️ Database: Connected`);
        });

        // Function to handle graceful shutdown on termination signals
        const gracefulShutdown = async (signal) => {
            logger.info(`Received ${signal}. Starting graceful shutdown...`);

            // Close the HTTP server
            server.close(async () => {
                logger.info('HTTP server closed');

                try {
                    // Disconnect Prisma client from the database
                    await prisma.$disconnect();
                    logger.info('Database connection closed gracefully');
                    process.exit(0);
                } catch (error) {
                    logger.error('Error during database disconnection:', error);
                    process.exit(1);
                }
            });
        };

        // Listen for SIGTERM and SIGINT signals to trigger graceful shutdown
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    } catch (error) {
        // Log and exit if there is an error starting the server
        logger.error('Error starting the server:', error);
        process.exit(1);
    }
};

// Invoke the main function to start the server
startServer();
