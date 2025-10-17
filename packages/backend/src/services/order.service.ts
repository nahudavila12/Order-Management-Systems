import { Repository } from 'typeorm';

import { AppDataSource } from '../config/database';
import { Order } from '../entities/order.entity';
import { 
  ApiResponse,
  CreateOrderDto, 
  OrderStatus,
  PaginatedResponse,
  PaginationQuery, 
  UpdateOrderDto
} from '@order-management/shared-types';
import { EncryptionService } from './encryption.service';
import { SecurityLoggerService } from './security-logger.service';
import { XSSProtectionService } from './xss-protection.service';

export class OrderService {
  private static orderRepository: Repository<Order> = AppDataSource.getRepository(Order);

  /**
   * Create a new order
   */
  static async createOrder(createOrderDto: CreateOrderDto, req?: any): Promise<ApiResponse<Order>> {
    try {
      // Sanitize inputs
      const sanitizedDto = XSSProtectionService.sanitizeObject(createOrderDto);
      
      // Basic validations
      if (!sanitizedDto.customerName || sanitizedDto.customerName.trim() === '') {
        return {
          success: false,
          error: 'Customer name is required',
        };
      }

      if (!sanitizedDto.item || sanitizedDto.item.trim() === '') {
        return {
          success: false,
          error: 'Item is required',
        };
      }

      if (!sanitizedDto.quantity || sanitizedDto.quantity <= 0) {
        return {
          success: false,
          error: 'Quantity must be greater than 0',
        };
      }

      // Create order with encrypted customer name
      const order = this.orderRepository.create({
        customerName: EncryptionService.encryptCustomerName(sanitizedDto.customerName),
        item: XSSProtectionService.sanitizeItemDescription(sanitizedDto.item),
        quantity: sanitizedDto.quantity,
        status: sanitizedDto.status || OrderStatus.PENDING,
      });

      const savedOrder = await this.orderRepository.save(order);
      
      // Log the creation
      if (req) {
        SecurityLoggerService.logDataModification(req, 'CREATE', 'Order', savedOrder.id, {
          customerName: sanitizedDto.customerName,
          item: sanitizedDto.item,
          quantity: sanitizedDto.quantity,
          status: savedOrder.status
        });
      }

      // Decrypt customer name for response
      const responseOrder = {
        ...savedOrder,
        customerName: EncryptionService.decryptCustomerName(savedOrder.customerName)
      };
      
      return {
        success: true,
        data: responseOrder,
        message: 'Order created successfully',
      };
    } catch (error) {
      if (req) {
        SecurityLoggerService.logSecurityEvent('error', 'ORDER_CREATION_FAILED', req, { error: error.message });
      }
      return {
        success: false,
        error: 'Internal server error while creating order',
      };
    }
  }

  /**
   * Get an order by ID
   */
  static async getOrderById(id: string, req?: any): Promise<ApiResponse<Order>> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'Order ID is required',
        };
      }

      const order = await this.orderRepository.findOne({ where: { id } });
      
      if (!order) {
        if (req) {
          SecurityLoggerService.logSecurityEvent('warn', 'ORDER_NOT_FOUND', req, { orderId: id });
        }
        return {
          success: false,
          error: 'Order not found',
        };
      }

      // Log the access
      if (req) {
        SecurityLoggerService.logDataAccess(req, 'READ', 'Order', id);
      }

      // Decrypt customer name for response
      const responseOrder = {
        ...order,
        customerName: EncryptionService.decryptCustomerName(order.customerName)
      };

      return {
        success: true,
        data: responseOrder,
      };
    } catch (error) {
      if (req) {
        SecurityLoggerService.logSecurityEvent('error', 'ORDER_RETRIEVAL_FAILED', req, { error: error.message, orderId: id });
      }
      return {
        success: false,
        error: 'Internal server error while retrieving order',
      };
    }
  }

  /**
   * Get orders with pagination and filters
   */
  static async getOrders(query: PaginationQuery, req?: any): Promise<ApiResponse<PaginatedResponse<Order>>> {
    try {
      const rawPageSize: unknown = (query as any).page_size ?? query.pageSize;
      const parsedPageSize: number | undefined =
        typeof rawPageSize === 'string'
          ? parseInt(rawPageSize)
          : typeof rawPageSize === 'number'
          ? rawPageSize
          : undefined;
      const page = Math.max(1, query.page || 1);
      const pageSize = Math.min(100, Math.max(1, parsedPageSize || 10));
      
      const queryBuilder = this.orderRepository.createQueryBuilder('order');

      if (query.status) {
        queryBuilder.where('order.status = :status', { status: query.status });
      }

      const total = await queryBuilder.getCount();
      const totalPages = Math.ceil(total / pageSize);

      const orders = await queryBuilder
        .orderBy('order.createdAt', 'ASC')
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getMany();

      // Log the access
      if (req) {
        SecurityLoggerService.logDataAccess(req, 'READ', 'Orders', undefined, {
          pagination: {
            page,
            pageSize,
            total,
            totalPages
          },
          filters: query.status ? { status: query.status } : undefined
        });
      }

      // Decrypt customer names for response
      const decryptedOrders = orders.map(order => ({
        ...order,
        customerName: EncryptionService.decryptCustomerName(order.customerName)
      }));
      
      const response: PaginatedResponse<Order> = {
        data: decryptedOrders,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      };

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      if (req) {
        SecurityLoggerService.logSecurityEvent(
          'error',
          'ORDERS_RETRIEVAL_FAILED',
          req,
          { error: error.message, pagination: query }
        );
      }
      return {
        success: false,
        error: 'Internal server error while retrieving orders',
      };
    }
  }

  /**
   * Update an order
   */
  static async updateOrder(id: string, updateOrderDto: UpdateOrderDto, req?: any): Promise<ApiResponse<Order>> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'Order ID is required',
        };
      }

      // Sanitize inputs
      const sanitizedDto = XSSProtectionService.sanitizeObject(updateOrderDto);

      // Verify that the order exists
      const existingOrder = await this.orderRepository.findOne({ where: { id } });
      if (!existingOrder) {
        if (req) {
          SecurityLoggerService.logSecurityEvent('warn', 'ORDER_UPDATE_NOT_FOUND', req, { orderId: id });
        }
        return {
          success: false,
          error: 'Order not found',
        };
      }

      // Validation for updated fields
      if (sanitizedDto.customerName !== undefined && sanitizedDto.customerName.trim() === '') {
        return {
          success: false,
          error: 'Customer name cannot be empty',
        };
      }

      if (sanitizedDto.item !== undefined && sanitizedDto.item.trim() === '') {
        return {
          success: false,
          error: 'Item cannot be empty',
        };
      }

      if (sanitizedDto.quantity !== undefined && sanitizedDto.quantity <= 0) {
        return {
          success: false,
          error: 'Quantity must be greater than 0',
        };
      }

      // Prepare update data with encryption for customer name
      const updateData: any = { ...sanitizedDto };
      if (updateData.customerName) {
        updateData.customerName = EncryptionService.encryptCustomerName(updateData.customerName);
      }
      if (updateData.item) {
        updateData.item = XSSProtectionService.sanitizeItemDescription(updateData.item);
      }

      Object.assign(existingOrder, updateData);
      const updatedOrder = await this.orderRepository.save(existingOrder);

      // Log the update
      if (req) {
        SecurityLoggerService.logDataModification(req, 'UPDATE', 'Order', id, {
          orderId: id,
          changes: sanitizedDto
        });
      }

      // Decrypt customer name for response
      const responseOrder = {
        ...updatedOrder,
        customerName: EncryptionService.decryptCustomerName(updatedOrder.customerName)
      };

      return {
        success: true,
        data: responseOrder,
        message: 'Order updated successfully',
      };
    } catch (error) {
      if (req) {
        SecurityLoggerService.logSecurityEvent(
          'error',
          'ORDER_UPDATE_FAILED',
          req,
          { error: error.message, orderId: id }
        );
      }
      return {
        success: false,
        error: 'Internal server error while updating order',
      };
    }
  }

  /**
   * Delete an order
   */
  static async deleteOrder(id: string, req?: any): Promise<ApiResponse<null>> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'Order ID is required',
        };
      }

      // Verify that the order exists
      const existingOrder = await this.orderRepository.findOne({ where: { id } });
      if (!existingOrder) {
        if (req) {
          SecurityLoggerService.logSecurityEvent('warn', 'ORDER_DELETE_NOT_FOUND', req, { orderId: id });
        }
        return {
          success: false,
          error: 'Order not found',
        };
      }

      const result = await this.orderRepository.delete(id);
      
      if (result.affected === 0) {
        return {
          success: false,
          error: 'Error while deleting the order',
        };
      }

      // Log the deletion
      if (req) {
        SecurityLoggerService.logDataModification(req, 'DELETE', 'Order', id, {
          orderId: id
        });
      }

      return {
        success: true,
        data: null,
        message: 'Order deleted successfully',
      };
    } catch (error) {
      if (req) {
        SecurityLoggerService.logSecurityEvent(
          'error',
          'ORDER_DELETE_FAILED',
          req,
          { error: error.message, orderId: id }
        );
      }
      return {
        success: false,
        error: 'Internal server error while deleting order',
      };
    }
  }
}
