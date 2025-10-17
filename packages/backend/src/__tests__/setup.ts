// Test setup configuration
import { DataSource } from 'typeorm';
import { TestOrder } from './test-order.entity';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.ENCRYPTION_KEY = 'test-encryption-key-for-testing-only';

// Create in-memory SQLite database for testing
export const testDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  entities: [TestOrder],
  synchronize: true,
  logging: false,
});

// Global setup for all tests
beforeAll(async () => {
  await testDataSource.initialize();
});

// Global teardown for all tests
afterAll(async () => {
  if (testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
});

// Mock the AppDataSource for tests
jest.mock('../config/database', () => {
  const originalModule = jest.requireActual('../config/database');
  return {
    ...originalModule,
    AppDataSource: {
      getRepository: () => testDataSource.getRepository(TestOrder),
      initialize: jest.fn(),
      destroy: jest.fn(),
      isInitialized: true,
    },
    initializeDatabase: jest.fn(),
    closeDatabase: jest.fn(),
  };
});

// Mock security logger to avoid file system issues in tests
jest.mock('../services/security-logger.service', () => ({
  SecurityLoggerService: {
    initialize: jest.fn(),
    logSecurityEvent: jest.fn(),
    logDataAccess: jest.fn(),
    logDataModification: jest.fn(),
    logValidationFailure: jest.fn(),
    logRateLimitExceeded: jest.fn(),
    logSuspiciousActivity: jest.fn(),
  },
}));

// Mock the DTOs to use test versions
jest.mock('../dto', () => ({
  CreateOrderDto: class CreateOrderDto {
    customerName!: string;
    item!: string;
    quantity!: number;
    status?: string;
  },
  UpdateOrderDto: class UpdateOrderDto {
    customerName?: string;
    item?: string;
    quantity?: number;
    status?: string;
  },
  PaginationQueryDto: class PaginationQueryDto {
    page?: number;
    pageSize?: number;
    status?: string;
  },
}));

// Mock validation middleware
jest.mock('../middleware/validation.middleware', () => ({
  validateRequest: () => (req: any, res: any, next: any) => next(),
}));
