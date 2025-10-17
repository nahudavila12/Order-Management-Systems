import { IsString, IsNumber, IsEnum, IsOptional, Length, Min, Max } from 'class-validator';
import { OrderStatus } from '@order-management/shared-types';

export class UpdateOrderDto {
  @IsString({ message: 'Customer name must be a string' })
  @Length(2, 100, { message: 'Customer name must be between 2 and 100 characters' })
  @IsOptional()
  customerName?: string;

  @IsString({ message: 'Item must be a string' })
  @Length(1, 200, { message: 'Item must be between 1 and 200 characters' })
  @IsOptional()
  item?: string;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(1000, { message: 'Quantity cannot exceed 1000' })
  @IsOptional()
  quantity?: number;

  @IsEnum(OrderStatus, { message: 'Status must be a valid order status' })
  @IsOptional()
  status?: OrderStatus;
}
