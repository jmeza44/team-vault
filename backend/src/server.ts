import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { notFound, errorHandler } from '@/middleware';
import { authRoutes, userRoutes, credentialRoutes, teamRoutes, auditRoutes, analyticsRoutes } from '@/routes';
import { logger } from '@/utils';


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env['CORS_ORIGIN']?.split(',') || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100000'), // limit each IP to 100000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] || 'development',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/analytics', analyticsRoutes);

// API info endpoint
app.get('/api', (_req, res) => {
  res.json({
    name: 'Team Vault API',
    version: '1.0.0',
    description: 'Secure credential management platform API',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      credentials: '/api/credentials',
      teams: '/api/teams',
      audit: '/api/audit',
      analytics: '/api/analytics',
    },
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Team Vault API server running on port ${PORT}`);
  logger.info(`📱 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
