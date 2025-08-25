const environment = require('./environment.js');
const createPrismaClient = require('./database.js');

module.exports = {
    ...environment, 
    database: createPrismaClient,
}