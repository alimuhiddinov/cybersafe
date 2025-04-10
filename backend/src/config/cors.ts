import { CorsOptions } from 'cors';

/**
 * Parse CORS_ORIGINS environment variable into an array of allowed origins
 * @returns Array of allowed origins
 */
const getAllowedOrigins = (): string[] => {
  const corsOrigins = process.env.CORS_ORIGINS || 'http://localhost:3000';
  return corsOrigins.split(',').map(origin => origin.trim());
};

/**
 * CORS configuration for the API
 */
export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
