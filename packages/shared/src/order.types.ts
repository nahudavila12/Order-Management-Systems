export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Order {
  id: string;
  customerName: string;
  item: string;
  quantity: number;
  status: OrderStatus;
  createdAt: Date;
}

export interface CreateOrderDto {
  customerName: string;
  item: string;
  quantity: number;
  status?: OrderStatus;
}

export interface UpdateOrderDto {
  customerName?: string;
  item?: string;
  quantity?: number;
  status?: OrderStatus;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface OrderFormData {
  customerName: string;
  item: string;
  quantity: number;
  status: OrderStatus;
}

export interface OrderFilters {
  status?: OrderStatus;
  search?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface OrderListState extends LoadingState {
  orders: Order[];
  pagination: PaginationState;
  filters: OrderFilters;
}
