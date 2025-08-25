const logger = require('../utils/logger.js');

const loggingMiddleware = (req, res, next) =>{
    const start = Date.now();


    //log the incoming request 
    logger.info('Incoming Request:', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        query: req.query,
        body: req.method !== 'GET' ? req.body : undefined, // Avoid logging body for GET requests
    });

    //Capture response data
    const originalSend = res.send;
    res.send = function(data){
        const duration = Date.now() - start;

        logger.info('Outgoing Response:', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode, 
            duration: `${duration}ms`,
            responseSize : data? data.length: 0,
        });

        originalSend.call(this, data);
    };
    next();
};

module.exports = {
    loggingMiddleware,
};

