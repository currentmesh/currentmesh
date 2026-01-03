import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/env';
import rateLimit from 'express-rate-limit';
import { setSentryUser, addRequestBreadcrumb } from './sentry.middleware';
import { logger } from '../utils/logger';

export function setupMiddleware(app: Express): void {
  // Security headers
  app.use(helmet());

  // CORS - Allow all CurrentMesh frontend domains
  const allowedOrigins = [
    'https://admin.currentmesh.com',
    'https://app.currentmesh.com',
    'https://client.currentmesh.com',
    'https://currentmesh.com',
    'http://localhost:5000',
    'http://localhost:5001',
    'http://localhost:5002',
    'http://localhost:3001',
  ];
  
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin) || config.cors.origin.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
      ],
      exposedHeaders: ['Authorization'],
      maxAge: 86400, // 24 hours
    })
  );

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Sentry middleware (before routes)
  // Temporarily disabled to debug 500 error
  // if (config.sentry.dsn) {
  //   app.use(setSentryUser);
  //   app.use(addRequestBreadcrumb);
  // }

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Request timeout (30 seconds)
  app.use((req, res, next) => {
    req.setTimeout(30000, () => {
      res.status(408).json({ error: 'Request timeout' });
    });
    next();
  });

  // Request logging (structured)
  app.use((req, res, next) => {
    const start = Date.now();
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    (req as any).requestId = requestId;
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('HTTP Request', {
        requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
      });
    });
    
    next();
  });
}

