const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const winston = require('winston');
const movieRoutes = require('./movie-service/routes');
const userRoutes = require('./user-service/routes/userRoutes');
require('dotenv').config(); 

// Initialize Express app
const app = express();

// Winston Logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'moviesmama-app' },
    transports: [
        // Write logs to file
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

// Add console logging for development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}


// Secure HTTP headers
app.use(helmet());

// CORS configuration for production (allow specific domains)
const corsOptions = {
    origin: process.env.ALLOWED_ORIGIN || '*', // Set to your frontend domain in production
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting to avoid DoS attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body Parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Exit process with failure
    });

// Define Routes
app.use('/api/movies', movieRoutes)
.use('/api/users',userRoutes)

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

// Graceful shutdown handling
const server = app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
    console.log(`Server running on port ${process.env.PORT}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

