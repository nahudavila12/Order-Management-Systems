import { NextFunction, Request, Response } from 'express';
import { ValidationError, validate } from 'class-validator';
import { ClassConstructor, plainToClass } from 'class-transformer';

export const validateRequest = <T extends object>(
  dtoClass: ClassConstructor<T>,
  property: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Normalize incoming data (handle snake_case and casing for query)
      let data: any = req[property];
      if (property === 'query' && data && typeof data === 'object') {
        const normalized: Record<string, unknown> = { ...data };
        if (Object.prototype.hasOwnProperty.call(normalized, 'page_size')) {
          if (!normalized.pageSize) {
            (normalized as any).pageSize = (normalized as any).page_size;
          }
          delete (normalized as any).page_size;
        }
        if (typeof (normalized as any).status === 'string') {
          (normalized as any).status = String((normalized as any).status).toLowerCase();
        }
        data = normalized;
      }
      const dto = plainToClass(dtoClass, data);
      
      const errors = await validate(dto as object, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      if (errors.length > 0) {
        const errorMessages = errors.map((error: ValidationError) => ({
          field: error.property,
          message: Object.values(error.constraints || {}).join(', '),
        }));

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errorMessages,
        });
        return;
      }

      // Replace the original data with the validated and transformed data
      // For query, mutate properties instead of reassigning (Express 5 getter)
      if (property === 'query') {
        const source = dto as unknown as Record<string, unknown>;
        for (const key in source) {
          (req.query as any)[key] = (source as any)[key];
        }
        if (Object.prototype.hasOwnProperty.call(req.query as any, 'page_size')) {
          delete (req.query as any).page_size;
        }
      } else {
        (req as any)[property] = dto;
      }
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error,
      });
    }
  };
};
