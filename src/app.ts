import { config } from '@/config';
import { errorHandler, notFound } from '@/middlewares/error.middleware';
import { requestLogger } from '@/middlewares/requestLogger.middleware';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
// import { connectDatabase } from '@/config/database';
import { logger } from '@/utils/logger';
import { initializeDatabase } from './database/connectDB';
const app = express();

// Initialize database connection
// Uncomment the line below to connect to the database
// This is currently commented out to avoid unnecessary database connections in development
initializeDatabase();

// Trust proxy (for production behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
// Helmet helps secure Express apps by setting various HTTP headers. This is a basic setup, you can customize it further based on your needs
// For example, we can add more security headers or configure CSP (Content Security Policy)
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);

const corsOptions = {
    origin:
        config.NODE_ENV === 'production'
            ? (
                origin: string | undefined,
                callback: (err: Error | null, allow?: boolean) => void
            ) => {
                // Allow requests with no origin (like mobile apps or curl requests)
                if (!origin) return callback(null, true);

                // currently only allowed origins that are defined in the config which extracts from the environment variable ALLOWED_ORIGINS
                // TODO:- In future, we can move to a more dynamic approach if needed by fetching allowed origins from a database or config file

                if (config.ALLOWED_ORIGINS.includes(origin)) {
                    return callback(null, true);
                } else {
                    logger.warn(`CORS blocked origin: ${origin}`);
                    return callback(new Error('Not allowed by CORS'), false);
                }
            }
            : true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    optionsSuccessStatus: 204, // For legacy browser support
    preflightContinue: false, // Pass the CORS preflight response to the next handler
    // Expose headers that you want to make available to the client
    exposedHeaders: ['Content-Length', 'X-Request-ID'],
    // Allow specific headers in requests
    // This can be adjusted based on your API requirements
    // For example, if you need to allow custom headers like 'X-Requested-With'
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Rate limiting
//currently using the fixed window rate limiting strategy
// but in future, we can switch to a sliding window or token bucket strategy if needed
// This is a simple rate limiter to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.NODE_ENV === 'production' ? 100 : 1000, // More lenient in development
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

if (config.INTERNAL_SERVICE_NO_EXPOSURE) {
    logger.info('Internal service mode: No external exposure');
} else {
    logger.info('Service is exposed to external traffic');
    /**
     * Apply rate limiting to all API routes
     * This can be adjusted based on your needs
     * Or apply it only to API routes
     * For now, we will apply it to all API routes
     */

    // Uncomment the line below to apply rate limiting globally
    // app.use(limiter);

    app.use('/api', limiter);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (must be before routes)
app.use(requestLogger);

// Health check endpoint
// ToDo: This can be expanded to include more detailed health checks such as database connectivity, external service availability, etc also to move this to a separate file in the future
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy! 🎉',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.NODE_ENV,
    });
});

// API Routes
// app.use('/api', routes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
