import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Order Management System API',
      version: '1.0.0',
      description: 'A comprehensive API for managing orders with CRUD operations, pagination, and filtering capabilities.',
      contact: {
        name: 'Nahuel Davila',
        url: 'https://portfolio-nahuel-davila.vercel.app/',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Order: {
          type: 'object',
          required: ['id', 'customerName', 'item', 'quantity', 'status', 'createdAt'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the order',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            customerName: {
              type: 'string',
              description: 'Name of the customer who placed the order',
              example: 'John Doe',
              minLength: 2,
              maxLength: 100,
            },
            item: {
              type: 'string',
              description: 'Name or description of the item being ordered',
              example: 'Laptop Dell XPS 13',
              minLength: 2,
              maxLength: 200,
            },
            quantity: {
              type: 'integer',
              description: 'Number of items ordered',
              example: 1,
              minimum: 1,
              maximum: 1000,
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'cancelled'],
              description: 'Current status of the order',
              example: 'pending',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the order was created',
              example: '2023-12-01T10:30:00Z',
            },
          },
        },
        CreateOrderDto: {
          type: 'object',
          required: ['customerName', 'item', 'quantity'],
          properties: {
            customerName: {
              type: 'string',
              description: 'Name of the customer who placed the order',
              example: 'John Doe',
              minLength: 2,
              maxLength: 100,
            },
            item: {
              type: 'string',
              description: 'Name or description of the item being ordered',
              example: 'Laptop Dell XPS 13',
              minLength: 2,
              maxLength: 200,
            },
            quantity: {
              type: 'integer',
              description: 'Number of items ordered',
              example: 1,
              minimum: 1,
              maximum: 1000,
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'cancelled'],
              description: 'Initial status of the order (defaults to pending)',
              example: 'pending',
              default: 'pending',
            },
          },
        },
        UpdateOrderDto: {
          type: 'object',
          properties: {
            customerName: {
              type: 'string',
              description: 'Name of the customer who placed the order',
              example: 'John Doe',
              minLength: 2,
              maxLength: 100,
            },
            item: {
              type: 'string',
              description: 'Name or description of the item being ordered',
              example: 'Laptop Dell XPS 13',
              minLength: 2,
              maxLength: 200,
            },
            quantity: {
              type: 'integer',
              description: 'Number of items ordered',
              example: 1,
              minimum: 1,
              maximum: 1000,
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'cancelled'],
              description: 'Current status of the order',
              example: 'pending',
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful',
              example: true,
            },
            data: {
              type: 'object',
              description: 'Response data (varies based on endpoint)',
            },
            message: {
              type: 'string',
              description: 'Human-readable message about the operation',
              example: 'Order created successfully',
            },
            error: {
              type: 'string',
              description: 'Error message if the request failed',
              example: 'Order not found',
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Order',
              },
              description: 'Array of orders',
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  description: 'Current page number',
                  example: 1,
                  minimum: 1,
                },
                pageSize: {
                  type: 'integer',
                  description: 'Number of items per page',
                  example: 10,
                  minimum: 1,
                  maximum: 100,
                },
                total: {
                  type: 'integer',
                  description: 'Total number of orders',
                  example: 50,
                },
                totalPages: {
                  type: 'integer',
                  description: 'Total number of pages',
                  example: 5,
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Validation failed',
            },
            details: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Detailed error messages',
              example: ['Customer name is required', 'Quantity must be greater than 0'],
            },
          },
        },
      },
      parameters: {
        OrderId: {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Unique identifier of the order',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        Page: {
          in: 'query',
          name: 'page',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
          description: 'Page number for pagination',
          example: 1,
        },
        PageSize: {
          in: 'query',
          name: 'page_size',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
          },
          description: 'Number of items per page',
          example: 10,
        },
        StatusFilter: {
          in: 'query',
          name: 'status',
          schema: {
            type: 'string',
            enum: ['pending', 'completed', 'cancelled'],
          },
          description: 'Filter orders by status',
          example: 'pending',
        },
      },
    },
    tags: [
      {
        name: 'Orders',
        description: 'Operations related to order management',
      },
      {
        name: 'Health',
        description: 'Health check and system status',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API files
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  // Swagger UI setup
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Order Management API Documentation',
  }));

  // JSON endpoint for the OpenAPI spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export default specs;
