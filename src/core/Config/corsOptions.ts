import { logger } from '@/Logger/index.js';
import { CorsOptions } from 'cors';
import { config } from '@/Config/index.js';
const corsOptions: CorsOptions = {
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

export default corsOptions;
