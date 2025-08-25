const winston = require('winston');

//Define log format 
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss'}),
    winston.format.errors({ stack: true}),
    winston.format.json(),
    winston.format.prettyPrint()
);

//logger instance 
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'cloud-service-mapper'},
    transports: [
        //write all logs to console 
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),


        //write error logs to a separate file 
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
        }),

        //Write all logs to a file
        new winston.transports.File({
            filename: 'logs/combined.log',
        }),
    ],
});

//Handle exceptions and rejections
logger.exceptions.handle(
    new winston.transports.File({ filename: 'logs/rejections.log'})
);

module.exports = logger;