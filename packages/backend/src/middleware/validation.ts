import { Request, Response, NextFunction } from 'express';
import { OrderStatus } from '@order-management/shared-types';

export const validateCreateOrder = (req: Request, res: Response, next: NextFunction): void => {
  const { customerName, item, quantity, status } = req.body;

  const errors: string[] = [];

  if (!customerName || typeof customerName !== 'string' || customerName.trim() === '') {
    errors.push('customerName is required and must be a non-empty string');
  }

  if (!item || typeof item !== 'string' || item.trim() === '') {
    errors.push('item is required and must be a non-empty string');
  }

  if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
    errors.push('quantity is required and must be a number greater than 0');
  }

  if (status && !Object.values(OrderStatus).includes(status)) {
    errors.push(`status must be one of: ${Object.values(OrderStatus).join(', ')}`);
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Invalid validation data',
      details: errors,
    });
    return;
  }

  next();
};

export const validateUpdateOrder = (req: Request, res: Response, next: NextFunction): void => {
  const { customerName, item, quantity, status } = req.body;

  const errors: string[] = [];

  if (customerName !== undefined && (typeof customerName !== 'string' || customerName.trim() === '')) {
    errors.push('customerName must be a non-empty string');
  }

  if (item !== undefined && (typeof item !== 'string' || item.trim() === '')) {
    errors.push('item must be a non-empty string');
  }

  if (quantity !== undefined && (typeof quantity !== 'number' || quantity <= 0)) {
    errors.push('quantity must be a number greater than 0');
  }

  if (status !== undefined && !Object.values(OrderStatus).includes(status)) {
    errors.push(`status must be one of: ${Object.values(OrderStatus).join(', ')}`);
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Invalid validation data',
      details: errors,
    });
    return;
  }

  next();
};

export const validateOrderId = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    res.status(400).json({
      success: false,
      error: 'Order ID is required',
    });
    return;
  }

  next();
};
