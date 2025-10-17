import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

import { SecurityLoggerService } from '../services/security-logger.service';
import { XSSProtectionService } from '../services/xss-protection.service';

/**
 * Request ID tracking middleware
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = uuidv4();
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

/**
 * Rate limiting for general API endpoints
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    SecurityLoggerService.logRateLimitExceeded(req);
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
    });
  },
});

/**
 * Rate limiting for sensitive operations (create, update, delete)
 */
export const sensitiveOperationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 100 sensitive operations per windowMs (increased for development)
  message: {
    success: false,
    error: 'Too many sensitive operations from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    SecurityLoggerService.logSuspiciousActivity(req, 'EXCESSIVE_SENSITIVE_OPERATIONS');
    res.status(429).json({
      success: false,
      error: 'Too many sensitive operations from this IP, please try again later.',
    });
  },
});

/**
 * XSS protection middleware
 */
export const xssProtectionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitize request body (mutate properties, avoid reassign)
  if (req.body && typeof req.body === 'object') {
    const sanitizedBody = XSSProtectionService.sanitizeObject(req.body);
    for (const key in sanitizedBody) {
      (req.body as any)[key] = (sanitizedBody as any)[key];
    }
  }

  // Sanitize query parameters (mutate properties, avoid reassign)
  if (req.query && typeof req.query === 'object') {
    const sanitizedQuery = XSSProtectionService.sanitizeObject(req.query as Record<string, unknown>);
    for (const key in sanitizedQuery) {
      (req.query as any)[key] = (sanitizedQuery as any)[key];
    }
  }

  // Check for malicious content in URL
  if (XSSProtectionService.containsMaliciousContent(req.url)) {
    SecurityLoggerService.logSuspiciousActivity(req, 'MALICIOUS_URL_DETECTED', {
      url: req.url
    });
    res.status(400).json({
      success: false,
      error: 'Invalid request URL',
    });
    return;
  }

  next();
};

/**
 * Security logging middleware
 */
export const securityLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Log the request
  SecurityLoggerService.logSecurityEvent('info', 'REQUEST_STARTED', req, {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime;
    
    SecurityLoggerService.logSecurityEvent('info', 'REQUEST_COMPLETED', req, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * IP validation middleware (basic)
 */
export const ipValidationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.connection.remoteAddress;
  
  // Block known malicious IP ranges (basic example)
  const blockedRanges = [
    // '127.0.0.1', // localhost - commented out for development
  ];

  if (process.env.NODE_ENV === 'production' && blockedRanges.some(range => ip?.includes(range))) {
    SecurityLoggerService.logSuspiciousActivity(req, 'BLOCKED_IP_ACCESS', { ip });
    res.status(403).json({
      success: false,
      error: 'Access denied',
    });
    return;
  }

  next();
};
