// List of required environment variable names
const requiredEnvVars = [
    'DATABASE_URL',
    'NODE_ENV',
    'PORT'
];

//Function to check if all required environment variables are set
// if any required variable is missing , it throws an error and logs a warning
const validateEnvironment = () =>{
    const missingVars = [];
    for(const varName of requiredEnvVars){
        if(!process.env[varName]){
            missingVars.push(varName);
            console.warn(`Warning: Environment variable ${varName} is not set.`);
        }
    }
    if(missingVars.length > 0){
        throw new Error(`Missing required environment variables: ${missingVars.join(' , ')}`);
    }
};

// Configuration object that reads values from environment variables, with defaults
const config = {
    nodeEnv: process.env.NODE_ENV || 'development', // App environment (development/production)
    port: parseInt(process.env.PORT) || 3000,       // Server port
    apiVersion: process.env.API_VERSION || 'v1',    // API version
    logLevel: process.env.LOG_LEVEL || 'info',      // Logging level
    database: {
        url: process.env.DATABASE_URL,              // Database connection URL
    },
};

// Validate environment variables before exporting config
validateEnvironment();

// Export the configuration object for use in other parts of the app
module.exports = config;