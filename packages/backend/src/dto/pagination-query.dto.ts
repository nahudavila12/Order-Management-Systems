import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { OrderStatus } from '@order-management/shared-types';

export class PaginationQueryDto {
  @Transform(({ obj, value }) => {
    const raw = obj.page ?? value;
    return raw !== undefined ? parseInt(raw) : undefined;
  })
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  @IsOptional()
  page?: number;

  @Transform(({ obj, value }) => {
    const raw = obj.page_size ?? value;
    return raw !== undefined ? parseInt(raw) : undefined;
  })
  @IsNumber({}, { message: 'Page size must be a number' })
  @Min(1, { message: 'Page size must be at least 1' })
  @Max(100, { message: 'Page size cannot exceed 100' })
  @IsOptional()
  pageSize?: number;

  @Transform(({ value }) => (value !== undefined ? String(value).toLowerCase() : value))
  @IsEnum(OrderStatus, { message: 'Status must be a valid order status' })
  @IsOptional()
  status?: OrderStatus;
}
