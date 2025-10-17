import './setup';
import { OrderService } from '../services/order.service';
import { CreateOrderDto, UpdateOrderDto, OrderStatus } from '@order-management/shared-types';
import { testDataSource } from './setup';
import { TestOrder } from './test-order.entity';

describe('OrderService', () => {
  beforeEach(async () => {
    // Clean up orders before each test
    const orderRepository = testDataSource.getRepository(TestOrder);
    await orderRepository.clear();
  });

  describe('createOrder', () => {
    it('should create an order successfully with valid data', async () => {
      const createOrderDto: CreateOrderDto = {
        customerName: 'Juan Pérez',
        item: 'Laptop Dell',
        quantity: 1,
      };

      const result = await OrderService.createOrder(createOrderDto);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.customerName).toBe('Juan Pérez');
      expect(result.data!.item).toBe('Laptop Dell');
      expect(result.data!.quantity).toBe(1);
      expect(result.data!.status).toBe(OrderStatus.PENDING);
      expect(result.message).toBe('Order created successfully');
    });

    it('should fail with empty customer name', async () => {
      const createOrderDto: CreateOrderDto = {
        customerName: '',
        item: 'Laptop Dell',
        quantity: 1,
      };

      const result = await OrderService.createOrder(createOrderDto);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Customer name is required');
    });

    it('should fail with empty item', async () => {
      const createOrderDto: CreateOrderDto = {
        customerName: 'Juan Pérez',
        item: '',
        quantity: 1,
      };

      const result = await OrderService.createOrder(createOrderDto);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Item is required');
    });

    it('should fail with invalid quantity', async () => {
      const createOrderDto: CreateOrderDto = {
        customerName: 'Juan Pérez',
        item: 'Laptop Dell',
        quantity: 0,
      };

      const result = await OrderService.createOrder(createOrderDto);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Quantity must be greater than 0');
    });
  });

  describe('getOrderById', () => {
    it('should return an existing order', async () => {
      // Crear una orden primero
      const createOrderDto: CreateOrderDto = {
        customerName: 'María García',
        item: 'Mouse',
        quantity: 2,
      };

      const createResult = await OrderService.createOrder(createOrderDto);
      expect(createResult.success).toBe(true);

      const getResult = await OrderService.getOrderById(createResult.data!.id);

      expect(getResult.success).toBe(true);
      expect(getResult.data!.id).toBe(createResult.data!.id);
      expect(getResult.data!.customerName).toBe(createResult.data!.customerName);
    });

    it('should fail with empty ID', async () => {
      const result = await OrderService.getOrderById('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order ID is required');
    });

    it('should fail with non-existent order', async () => {
      const result = await OrderService.getOrderById('id-inexistente');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order not found');
    });
  });

  describe('getOrders', () => {
    beforeEach(async () => {
      // Create test orders
      const orders: CreateOrderDto[] = [
        { customerName: 'Cliente 1', item: 'Item 1', quantity: 1, status: OrderStatus.PENDING },
        { customerName: 'Cliente 2', item: 'Item 2', quantity: 2, status: OrderStatus.COMPLETED },
        { customerName: 'Cliente 3', item: 'Item 3', quantity: 3, status: OrderStatus.PENDING },
      ];

      for (const order of orders) {
        await OrderService.createOrder(order);
      }
    });

    it('should return orders with pagination', async () => {
      const result = await OrderService.getOrders({ page: 1, pageSize: 2 });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.data).toHaveLength(2);
      expect(result.data!.pagination.total).toBe(3);
      expect(result.data!.pagination.totalPages).toBe(2);
    });

    it('should filter by status', async () => {
      const result = await OrderService.getOrders({ page: 1, pageSize: 10, status: OrderStatus.PENDING });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.data).toHaveLength(2);
      result.data!.data.forEach(order => {
        expect(order.status).toBe(OrderStatus.PENDING);
      });
    });

    it('should limit pageSize to 100', async () => {
      const result = await OrderService.getOrders({ page: 1, pageSize: 200 });

      expect(result.success).toBe(true);
      expect(result.data!.pagination.pageSize).toBe(100);
    });

    it('should use default values', async () => {
      const result = await OrderService.getOrders({});

      expect(result.success).toBe(true);
      expect(result.data!.pagination.page).toBe(1);
      expect(result.data!.pagination.pageSize).toBe(10);
    });
  });

  describe('updateOrder', () => {
    it('should update an existing order', async () => {
      // Crear una orden primero
      const createOrderDto: CreateOrderDto = {
        customerName: 'Carlos López',
        item: 'Teclado',
        quantity: 1,
      };

      const createResult = await OrderService.createOrder(createOrderDto);
      expect(createResult.success).toBe(true);

      const updateOrderDto: UpdateOrderDto = {
        customerName: 'Carlos López Martínez',
        status: OrderStatus.COMPLETED,
      };

      const updateResult = await OrderService.updateOrder(createResult.data!.id, updateOrderDto);

      expect(updateResult.success).toBe(true);
      expect(updateResult.data!.customerName).toBe('Carlos López Martínez');
      expect(updateResult.data!.status).toBe(OrderStatus.COMPLETED);
      expect(updateResult.message).toBe('Order updated successfully');
    });

    it('should fail with empty ID', async () => {
      const result = await OrderService.updateOrder('', { customerName: 'Nuevo nombre' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order ID is required');
    });

    it('should fail with non-existent order', async () => {
      const result = await OrderService.updateOrder('id-inexistente', { customerName: 'Nuevo nombre' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order not found');
    });

    it('should fail with empty customer name', async () => {
      // Crear una orden primero
      const createResult = await OrderService.createOrder({
        customerName: 'Cliente Original',
        item: 'Item',
        quantity: 1,
      });

      const result = await OrderService.updateOrder(createResult.data!.id, { customerName: '' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Customer name cannot be empty');
    });
  });

  describe('deleteOrder', () => {
    it('should delete an existing order', async () => {
      // Crear una orden primero
      const createOrderDto: CreateOrderDto = {
        customerName: 'Ana Martínez',
        item: 'Monitor',
        quantity: 1,
      };

      const createResult = await OrderService.createOrder(createOrderDto);
      expect(createResult.success).toBe(true);

      const deleteResult = await OrderService.deleteOrder(createResult.data!.id);

      expect(deleteResult.success).toBe(true);
      expect(deleteResult.data).toBeNull();
      expect(deleteResult.message).toBe('Order deleted successfully');
    });

    it('should fail with empty ID', async () => {
      const result = await OrderService.deleteOrder('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order ID is required');
    });

    it('should fail with non-existent order', async () => {
      const result = await OrderService.deleteOrder('id-inexistente');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order not found');
    });
  });
});
