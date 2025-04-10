import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { corsConfig } from './config/cors';
import routes from './routes';

// Load environment variables
dotenv.config();

// Create Express server
const app = express();

// Set port
const port = process.env.PORT || 3001;

// Middleware
app.use(morgan('dev'));
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root route
app.get('/', (_, res) => {
  res.status(200).json({ 
    message: 'CyberSafe API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth/*'
    }
  });
});

// API Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
