import { Request, Response } from 'express';

import { 
  CreateOrderDto,
  PaginationQueryDto,
  UpdateOrderDto
} from '../dto';
import { OrderService } from '../services/order.service';


export class OrderController {
  /**
   * Create a new order
   * POST /orders
   */
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const createOrderDto: CreateOrderDto = req.body;
      const result = await OrderService.createOrder(createOrderDto, req);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error,
      });
    }
  }

  /**
   * Get an order by ID
   * GET /orders/:id
   */
  static async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await OrderService.getOrderById(id, req);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error,
      });
    }
  }

  /**
   * Get orders with pagination and filters
   * GET /orders
   */
  static async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const query: PaginationQueryDto = req.query as any;
      const result = await OrderService.getOrders(query, req);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error,
      });
    }
  }

  /**
   * Update an order
   * PUT /orders/:id
   */
  static async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateOrderDto: UpdateOrderDto = req.body;
      
      const result = await OrderService.updateOrder(id, updateOrderDto, req);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error === 'Order not found' ? 404 : 400;
        res.status(statusCode).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error,
      });
    }
  }

  /**
   * Delete an order
   * DELETE /orders/:id
   */
  static async deleteOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await OrderService.deleteOrder(id, req);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error === 'Order not found' ? 404 : 400;
        res.status(statusCode).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error,
      });
    }
  }

  /**
   * Endpoint for testing the server
   * GET /orders/test
   */
  static async testEndpoint(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Orders server working correctly',
      timestamp: new Date().toISOString(),
    });
  }
}
