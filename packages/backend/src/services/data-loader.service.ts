import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Order } from '../entities/order.entity';
import { CreateOrderDto } from '@order-management/shared-types';
import * as fs from 'fs';
import * as path from 'path';

export class DataLoaderService {
  private static orderRepository: Repository<Order> = AppDataSource.getRepository(Order);

  /**
   * Load sample data from the JSON file
   */
  static async loadSampleData(): Promise<void> {
    try {
      const existingOrders = await this.orderRepository.count();
      
      if (existingOrders > 0) {
        console.log(` Database already contains ${existingOrders} orders, skipping sample data load`);
        return;
      }

      const sampleDataPath = path.join(__dirname, '../data/sample-orders.json');
      const sampleDataRaw = fs.readFileSync(sampleDataPath, 'utf8');
      const sampleOrders: CreateOrderDto[] = JSON.parse(sampleDataRaw);

      console.log(` Loading ${sampleOrders.length} sample orders...`);

      for (const orderData of sampleOrders) {
        const order = this.orderRepository.create({
          customerName: orderData.customerName,
          item: orderData.item,
          quantity: orderData.quantity,
          status: orderData.status,
        });
        
        await this.orderRepository.save(order);
      }

      console.log(` Successfully loaded ${sampleOrders.length} sample orders`);
    } catch (error) {
      console.error(' Error loading sample data:', error);
      throw error;
    }
  }

  /**
   * Clear all data from the database (only for development)
   */
  static async clearAllData(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('clearAllData is not allowed in production environment');
    }

    try {
      await this.orderRepository.clear();
      console.log(' All orders data cleared');
    } catch (error) {
      console.error(' Error clearing data:', error);
      throw error;
    }
  }

  /**
   * Reset sample data (clear and reload)
   */
  static async resetSampleData(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('resetSampleData is not allowed in production environment');
    }

    try {
      await this.clearAllData();
      await this.loadSampleData();
      console.log(' Sample data reset completed');
    } catch (error) {
      console.error(' Error resetting sample data:', error);
      throw error;
    }
  }

  /**
   * Get data statistics
   */
  static async getDataStats(): Promise<{
    totalOrders: number;
    ordersByStatus: Record<string, number>;
    latestOrder?: Order;
    oldestOrder?: Order;
  }> {
    try {
      const totalOrders = await this.orderRepository.count();
      
      const ordersByStatus = await this.orderRepository
        .createQueryBuilder('order')
        .select('order.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('order.status')
        .getRawMany();

      const statusCounts: Record<string, number> = {};
      ordersByStatus.forEach(({ status, count }) => {
        statusCounts[status] = parseInt(count);
      });

      const latestOrder = await this.orderRepository.findOne({
        order: { createdAt: 'DESC' },
      });

      const oldestOrder = await this.orderRepository.findOne({
        order: { createdAt: 'ASC' },
      });

      return {
        totalOrders,
        ordersByStatus: statusCounts,
        latestOrder: latestOrder || undefined,
        oldestOrder: oldestOrder || undefined,
      };
    } catch (error) {
      console.error(' Error getting data stats:', error);
      throw error;
    }
  }
}
