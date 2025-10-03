import app from '@/app';
import { config } from '@/config/index';
import { logger } from '@/utils/logger';

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught Exception! 💥 Shutting down...', {
        error: err.message,
        stack: err.stack,
    });
    process.exit(1);
});

// Start server
const server = app.listen(config.PORT, () => {
    logger.success(`🚀 Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
    logger.info(`📊 Process ID: ${process.pid}`);
    logger.info(`🔗 Health check: http://localhost:${config.PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
    logger.error('Unhandled Rejection! 💥 Shutting down...', {
        error: err.message,
        stack: err.stack,
    });

    server.close(() => {
        process.exit(1);
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('👋 SIGTERM received. Shutting down gracefully');
    server.close(() => {
        logger.info('💀 Process terminated');
    });
});

process.on('SIGINT', () => {
    logger.info('👋 SIGINT received. Shutting down gracefully');
    server.close(() => {
        logger.info('💀 Process terminated');
    });
});

export default server;
