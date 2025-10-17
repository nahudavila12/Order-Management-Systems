import { Request } from 'express';
import winston from 'winston';

export class SecurityLoggerService {
  private static logger: winston.Logger;

  static initialize(): void {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'order-management-security' },
      transports: [
        new winston.transports.File({ 
          filename: 'logs/security-error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'logs/security.log' 
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ],
    });
  }

  static logSecurityEvent(
    level: 'info' | 'warn' | 'error',
    event: string,
    req: Request,
    details?: any
  ): void {
    if (!this.logger) {
      this.initialize();
    }

    const logData = {
      event,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.url,
      requestId: (req as any).requestId,
      timestamp: new Date().toISOString(),
      ...details
    };

    this.logger.log(level, `Security Event: ${event}`, logData);
  }

  static logValidationFailure(
    req: Request,
    errors: any[],
    details?: any
  ): void {
    this.logSecurityEvent('warn', 'VALIDATION_FAILURE', req, {
      validationErrors: errors,
      ...details
    });
  }

  static logRateLimitExceeded(
    req: Request,
    details?: any
  ): void {
    this.logSecurityEvent('warn', 'RATE_LIMIT_EXCEEDED', req, {
      ...details
    });
  }

  static logSuspiciousActivity(
    req: Request,
    activity: string,
    details?: any
  ): void {
    this.logSecurityEvent('error', 'SUSPICIOUS_ACTIVITY', req, {
      activity,
      ...details
    });
  }

  static logDataAccess(
    req: Request,
    operation: string,
    entityType: string,
    entityId?: string,
    changes?: any
  ): void {
    this.logSecurityEvent('info', 'DATA_ACCESS', req, {
      operation,
      entityType,
      entityId,
      changes: this.maskSensitiveData(changes)
    });
  }

  static logDataModification(
    req: Request,
    operation: string,
    entityType: string,
    entityId?: string,
    changes?: any
  ): void {
    this.logSecurityEvent('info', 'DATA_MODIFICATION', req, {
      operation,
      entityType,
      entityId,
      changes: this.maskSensitiveData(changes)
    });
  }

  private static maskSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    const masked = { ...data };

    for (const field of sensitiveFields) {
      if (masked[field]) {
        masked[field] = '***MASKED***';
      }
    }

    return masked;
  }
}
