import './setup';
import request from 'supertest';
import express from 'express';
import orderRoutes from '../routes/order.routes';
import { errorHandler, notFoundHandler } from '../middleware/error-handler';
import { testDataSource } from './setup';
import { TestOrder } from './test-order.entity';

const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

describe('Order Controller Integration Tests', () => {
  // Note: These tests now use the real TypeORM-based OrderService
  // Database should be properly configured for testing

  beforeEach(async () => {
    // Clean up orders before each test
    const orderRepository = testDataSource.getRepository(TestOrder);
    await orderRepository.clear();
  });

  describe('POST /api/orders', () => {
    it('should create a new order with valid data', async () => {
      const orderData = {
        customerName: 'John Doe',
        item: 'Laptop Dell XPS 13',
        quantity: 1,
        status: 'pending'
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.customerName).toBe('John Doe');
      expect(response.body.data.item).toBe('Laptop Dell XPS 13');
      expect(response.body.data.quantity).toBe(1);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.message).toBe('Order created successfully');
    });

    it('should return 400 for invalid order data', async () => {
      const invalidOrderData = {
        customerName: '',
        item: 'Laptop',
        quantity: 0
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Customer name is required');
    });

    it('should create order with default status when not provided', async () => {
      const orderData = {
        customerName: 'Jane Smith',
        item: 'Wireless Mouse',
        quantity: 2
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending');
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should retrieve an existing order by ID', async () => {
      // First create an order
      const orderData = {
        customerName: 'Alice Johnson',
        item: 'Mechanical Keyboard',
        quantity: 1
      };

      const createResponse = await request(app)
        .post('/api/orders')
        .send(orderData);

      const orderId = createResponse.body.data.id;

      // Then retrieve it
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(orderId);
      expect(response.body.data.customerName).toBe('Alice Johnson');
    });

    it('should return 404 for non-existent order ID', async () => {
      const response = await request(app)
        .get('/api/orders/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Order not found');
    });

    it('should return orders list for empty order ID path', async () => {
      const response = await request(app)
        .get('/api/orders/ ')
        .expect(200); // This will return the orders list

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/orders', () => {
    beforeEach(async () => {
      // Create test orders
      const orders = [
        { customerName: 'Customer 1', item: 'Item 1', quantity: 1, status: 'pending' },
        { customerName: 'Customer 2', item: 'Item 2', quantity: 2, status: 'completed' },
        { customerName: 'Customer 3', item: 'Item 3', quantity: 3, status: 'cancelled' },
        { customerName: 'Customer 4', item: 'Item 4', quantity: 4, status: 'pending' },
        { customerName: 'Customer 5', item: 'Item 5', quantity: 5, status: 'completed' }
      ];

      for (const order of orders) {
        await request(app)
          .post('/api/orders')
          .send(order);
      }
    });

    it('should retrieve orders with pagination', async () => {
      const response = await request(app)
        .get('/api/orders?page=1&pageSize=2')
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.pageSize).toBeGreaterThanOrEqual(2);
      expect(response.body.data.pagination.total).toBe(5);
      expect(response.body.data.pagination.totalPages).toBe(3);
    });

    it('should retrieve orders with pagination using page_size alias', async () => {
      const response = await request(app)
        .get('/api/orders?page=2&page_size=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.data.length).toBeLessThanOrEqual(2);
      expect(response.body.data.pagination.page).toBe(2);
      expect(response.body.data.pagination.pageSize).toBe(2);
      expect(response.body.data.pagination.total).toBeGreaterThanOrEqual(5);
      expect(response.body.data.pagination.totalPages).toBeGreaterThanOrEqual(3);
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/orders?status=pending')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(2);
      response.body.data.data.forEach((order: any) => {
        expect(order.status).toBe('pending');
      });
    });

    it('should use default pagination values', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.pageSize).toBe(10);
    });
  });

  describe('PUT /api/orders/:id', () => {
    it('should update an existing order', async () => {
      // First create an order
      const orderData = {
        customerName: 'Bob Wilson',
        item: 'Monitor 27 inch',
        quantity: 1,
        status: 'pending'
      };

      const createResponse = await request(app)
        .post('/api/orders')
        .send(orderData);

      const orderId = createResponse.body.data.id;

      // Then update it
      const updateData = {
        customerName: 'Bob Wilson Jr.',
        status: 'completed'
      };

      const response = await request(app)
        .put(`/api/orders/${orderId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customerName).toBe('Bob Wilson Jr.');
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.item).toBe('Monitor 27 inch'); // Should remain unchanged
      expect(response.body.message).toBe('Order updated successfully');
    });

    it('should return 404 for non-existent order ID', async () => {
      const updateData = {
        customerName: 'New Name'
      };

      const response = await request(app)
        .put('/api/orders/non-existent-id')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Order not found');
    });

    it('should return 400 for invalid update data', async () => {
      // First create an order
      const createResponse = await request(app)
        .post('/api/orders')
        .send({
          customerName: 'Test Customer',
          item: 'Test Item',
          quantity: 1
        });

      const orderId = createResponse.body.data.id;

      // Then try to update with invalid data
      const response = await request(app)
        .put(`/api/orders/${orderId}`)
        .send({ customerName: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Customer name cannot be empty');
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('should delete an existing order', async () => {
      // First create an order
      const orderData = {
        customerName: 'Charlie Brown',
        item: 'HDMI Cable',
        quantity: 3
      };

      const createResponse = await request(app)
        .post('/api/orders')
        .send(orderData);

      const orderId = createResponse.body.data.id;

      // Then delete it
      const response = await request(app)
        .delete(`/api/orders/${orderId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe('Order deleted successfully');

      // Verify it's deleted
      const getResponse = await request(app)
        .get(`/api/orders/${orderId}`)
        .expect(404);

      expect(getResponse.body.success).toBe(false);
      expect(getResponse.body.error).toBe('Order not found');
    });

    it('should return 404 for non-existent order ID', async () => {
      const response = await request(app)
        .delete('/api/orders/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Order not found');
    });
  });

  describe('GET /api/orders/test', () => {
    it('should return test endpoint response', async () => {
      const response = await request(app)
        .get('/api/orders/test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Orders server working correctly');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
