import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import csrf from 'csurf';

import { closeDatabase, initializeDatabase } from './config/database';
import { setupSwagger } from './config/swagger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { 
  requestIdMiddleware, 
  generalRateLimit, 
  sensitiveOperationRateLimit,
  xssProtectionMiddleware,
  securityLoggingMiddleware,
  ipValidationMiddleware
} from './middleware/security.middleware';
import orderRoutes from './routes/order.routes';
import { DataLoaderService } from './services/data-loader.service';
import { SecurityLoggerService } from './services/security-logger.service';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize security logger
SecurityLoggerService.initialize();
console.log('SecurityLoggerService initialized');

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'development' 
    ? [process.env.FRONTEND_URL] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-CSRF-Token'],
};

// Security Headers Configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Apply security middlewares in order
app.use(requestIdMiddleware);
app.use(securityLoggingMiddleware);
app.use(ipValidationMiddleware);
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(xssProtectionMiddleware);

// CSRF Protection (only for state-changing operations)
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'development',
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  }
});

// Apply rate limiting
app.use('/api/', generalRateLimit);

// Setup Swagger documentation
setupSwagger(app);

// Routes with security measures
app.use('/api/orders', sensitiveOperationRateLimit, orderRoutes);

// CSRF token endpoint (for frontend)
app.get('/api/csrf-token', csrfProtection, (_req, res) => {
  res.json({ csrfToken: (res as any).locals.csrfToken });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server running correctly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Development-only routes for data management
if (process.env.NODE_ENV !== 'development') {
  // Get data statistics
  app.get('/api/admin/data/stats', async (_req, res) => {
    try {
      const stats = await DataLoaderService.getDataStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get data statistics',
        details: error,
      });
    }
  });

  // Reset sample data
  app.post('/api/admin/data/reset', async (_req, res) => {
    try {
      await DataLoaderService.resetSampleData();
      res.status(200).json({
        success: true,
        message: 'Sample data reset successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to reset sample data',
        details: error,
      });
    }
  });

  // Clear all data
  app.delete('/api/admin/data/clear', async (_req, res) => {
    try {
      await DataLoaderService.clearAllData();
      res.status(200).json({
        success: true,
        message: 'All data cleared successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to clear data',
        details: error,
      });
    }
  });
}

// Root route
app.get('/', (_req, res) => {
  const endpoints: any = {
    orders: '/api/orders',
    health: '/health',
    documentation: '/api-docs',
  };

  // Add development-only endpoints
  if (process.env.NODE_ENV !== 'development') {
    endpoints.admin = {
      dataStats: '/api/admin/data/stats',
      resetData: '/api/admin/data/reset (POST)',
      clearData: '/api/admin/data/clear (DELETE)',
    };
  }

  res.status(200).json({
    success: true,
    message: 'Order Management System API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints,
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and sample data
const initializeData = async () => {
  try {
    await initializeDatabase();
    await DataLoaderService.loadSampleData();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async (): Promise<void> => {
  try {
    await initializeData();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`URL: http://localhost:${PORT}`);
      console.log(`API Orders: http://localhost:${PORT}/api/orders`);
      console.log(`Health Check: http://localhost:${PORT}/health`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Handle termination signals
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM signal, closing server...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT signal, closing server...');
  await closeDatabase();
  process.exit(0);
});

// Start the server
startServer();
