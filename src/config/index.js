const environment = require('./environment');
const createPrismaClient = require('./database');

module.exports = {
    ...environment, 
    database: createPrismaClient,
}