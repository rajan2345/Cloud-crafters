const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

// Create a singleton instance of PrismaClient
// This ensures that we do not create multiple instances of PrismaClient
// which can lead to connection issues and performance degradation.
// The instance is created only once and reused throughout the application.
// The PrismaClient is configured to log queries and errors in development mode,
let prisma = null;

const createPrismaClient = () => {
    if(!prisma){
        prisma = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
            errorFormat: 'pretty'
        });
        //Handle graceful shutdown
        process.on('beforeExit', async () =>{
            await prisma.$disconnect();
            logger.infor('Prisma Client disconnected gracefully');
        });
    }
    return prisma;
};

module.exports = createPrismaClient;
// Export the Prisma client instance