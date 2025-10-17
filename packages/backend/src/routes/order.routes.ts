import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { CreateOrderDto, UpdateOrderDto, PaginationQueryDto } from '../dto';

const router = Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderDto'
 *           examples:
 *             laptop_order:
 *               summary: Laptop order example
 *               value:
 *                 customerName: "John Doe"
 *                 item: "Laptop Dell XPS 13"
 *                 quantity: 1
 *                 status: "pending"
 *             mouse_order:
 *               summary: Mouse order example
 *               value:
 *                 customerName: "Jane Smith"
 *                 item: "Wireless Mouse"
 *                 quantity: 2
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Order'
 *             example:
 *               success: true
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 customerName: "John Doe"
 *                 item: "Laptop Dell XPS 13"
 *                 quantity: 1
 *                 status: "pending"
 *                 createdAt: "2023-12-01T10:30:00Z"
 *               message: "Order created successfully"
 *       400:
 *         description: Bad request - validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Invalid validation data"
 *               details: ["Customer name is required", "Quantity must be greater than 0"]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Internal server error"
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get paginated list of orders
 *     tags: [Orders]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *       - $ref: '#/components/parameters/StatusFilter'
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PaginatedResponse'
 *             example:
 *               success: true
 *               data:
 *                 data:
 *                   - id: "123e4567-e89b-12d3-a456-426614174000"
 *                     customerName: "John Doe"
 *                     item: "Laptop Dell XPS 13"
 *                     quantity: 1
 *                     status: "pending"
 *                     createdAt: "2023-12-01T10:30:00Z"
 *                 pagination:
 *                   page: 1
 *                   pageSize: 10
 *                   total: 25
 *                   totalPages: 3
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - $ref: '#/components/parameters/OrderId'
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Order'
 *             example:
 *               success: true
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 customerName: "John Doe"
 *                 item: "Laptop Dell XPS 13"
 *                 quantity: 1
 *                 status: "pending"
 *                 createdAt: "2023-12-01T10:30:00Z"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Order not found"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update an existing order
 *     tags: [Orders]
 *     parameters:
 *       - $ref: '#/components/parameters/OrderId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderDto'
 *           examples:
 *             update_status:
 *               summary: Update order status
 *               value:
 *                 status: "completed"
 *             update_details:
 *               summary: Update order details
 *               value:
 *                 customerName: "John Doe Jr."
 *                 quantity: 2
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Order'
 *             example:
 *               success: true
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 customerName: "John Doe Jr."
 *                 item: "Laptop Dell XPS 13"
 *                 quantity: 2
 *                 status: "completed"
 *                 createdAt: "2023-12-01T10:30:00Z"
 *               message: "Order updated successfully"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request - validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     parameters:
 *       - $ref: '#/components/parameters/OrderId'
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data: null
 *               message: "Order deleted successfully"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/orders/test:
 *   get:
 *     summary: Test endpoint for health check
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Test endpoint working
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Orders server working correctly"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-12-01T10:30:00Z"
 */

// Order routes
router.post('/', validateRequest(CreateOrderDto, 'body'), OrderController.createOrder);
router.get('/', validateRequest(PaginationQueryDto, 'query'), OrderController.getOrders);
router.get('/test', OrderController.testEndpoint);
router.get('/:id', OrderController.getOrderById);
router.put('/:id', validateRequest(UpdateOrderDto, 'body'), OrderController.updateOrder);
router.delete('/:id', OrderController.deleteOrder);

export default router;
