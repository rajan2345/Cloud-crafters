require('dotenv').config();
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const createPrismaClient = require('./config/database');

const startServer = async () => {
    try{
        //Test database connection
        const prisma = createPrismaClient();
        await prisma.$connect();

        logger.info('Database connection established successfully');

        //start the server
        const server = app.listen(config.port, () =>{
            logger.info(`🚀 Cloud Service Mapper API running on port ${config.port}`);
            logger.info(`📄 Environment: ${config.nodeEnv}`);
            logger.info(`🗄️ Database: Connected`);
        });

        //Handle graceful shutdown
        const gracefulShutdown = async (signal) => {
            logger.info(`Received ${signal}. Starting graceful shutdown...`);

            server.close(async () => {
                logger.info('HTTP server closed');

                try{
                    await prisma.$disconnect();
                    logger.info('Database connection closed gracefully');
                    process.exit(0);
                }catch(error){
                    logger.error('Error during database disconnection:', error);
                    process.exit(1);
                }
            });
        };
        //Listen for shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));     
    }catch(error){
        logger.error('Error starting the server:', error);
        process.exit(1);
    }
};

startServer();
