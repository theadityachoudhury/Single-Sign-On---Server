import { requestLogger } from '@/Logger/requestLogger.js';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import corsOptions from '@/Config/corsOptions.js';
import initializeDatabase from './core/DB/index.js';
import oauthApp from '@/apps/oauth/app.js';
import { config } from '@/Config/index.js';
import {
    errorHandler,
    notFoundHandler,
    initializeErrorHandlers,
} from '@/core/Middlewares/ErrorHandler.js';

// Initialize global error handlers for uncaught exceptions and unhandled rejections
initializeErrorHandlers();

const app = express();
const api_router = express.Router();

// Database initialization before going further as other middlewares might depend on DB
await initializeDatabase();

app.use(helmet());
app.use(requestLogger);
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

api_router.use('/oauth', oauthApp);

app.use(`/${config.API_PREFIX}`, api_router);

// 404 handler - must be placed after all routes
app.use(notFoundHandler);

// Global error handler - must be the last middleware
app.use(errorHandler);

export default app;
