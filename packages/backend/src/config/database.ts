import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: String(process.env.DB_HOST),
  port: Number(process.env.DB_PORT),
  username: String(process.env.DB_USERNAME),
  password: String(process.env.DB_PASSWORD),
  database: String(process.env.DB_NAME),
  synchronize: process.env.NODE_ENV !== 'production', 
  logging: String(process.env.NODE_ENV) === 'development',
  entities: [Order],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscriber/*.ts'],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log(' Database connection established successfully');
    
    if (process.env.NODE_ENV === 'development') {
      await AppDataSource.runMigrations();
      console.log(' Database migrations completed');
    }
  } catch (error) {
    console.error(' Error during Data Source initialization:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log(' Database connection closed');
  }
};
