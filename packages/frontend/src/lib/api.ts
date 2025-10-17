import axios, { AxiosResponse } from 'axios'

import {
  ApiResponse,
  CreateOrderDto,
  Order,
  PaginatedResponse,
  PaginationQuery,
  UpdateOrderDto,
} from '@order-management/shared-types'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  config => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to ${config.url}`
    )
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const orderApi = {
  // Create a new order
  createOrder: async (data: CreateOrderDto): Promise<ApiResponse<Order>> => {
    const response: AxiosResponse<ApiResponse<Order>> = await api.post(
      '/orders',
      data
    )
    return response.data
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    const response: AxiosResponse<ApiResponse<Order>> = await api.get(
      `/orders/${id}`
    )
    return response.data
  },

  // Get orders with pagination and filters
  getOrders: async (
    query: PaginationQuery = {}
  ): Promise<ApiResponse<PaginatedResponse<Order>>> => {
    const { page, pageSize, status } = query
    const params: Record<string, unknown> = {}
    if (page !== undefined) params.page = page
    if (pageSize !== undefined) params.page_size = pageSize // backend expects snake_case
    if (status !== undefined) params.status = status
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Order>>> =
      await api.get('/orders', { params })
    return response.data
  },

  // Update order
  updateOrder: async (
    id: string,
    data: UpdateOrderDto
  ): Promise<ApiResponse<Order>> => {
    const response: AxiosResponse<ApiResponse<Order>> = await api.put(
      `/orders/${id}`,
      data
    )
    return response.data
  },

  // Delete order
  deleteOrder: async (id: string): Promise<ApiResponse<null>> => {
    const response: AxiosResponse<ApiResponse<null>> = await api.delete(
      `/orders/${id}`
    )
    return response.data
  },

  // Health check
  healthCheck: async (): Promise<
    ApiResponse<{ message: string; timestamp: string }>
  > => {
    const response: AxiosResponse<
      ApiResponse<{ message: string; timestamp: string }>
    > = await api.get('/orders/test')
    return response.data
  },
}

export default api
