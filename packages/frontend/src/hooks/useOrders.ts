import { useMutation, useQuery, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'

import { orderApi } from '@/lib/api'
import {
  CreateOrderDto,
  OrderStatus,
  PaginationQuery,
  UpdateOrderDto,
} from '@order-management/shared-types'

export const useOrders = (query: PaginationQuery = {}) => {
  return useQuery(['orders', query], () => orderApi.getOrders(query), {
    keepPreviousData: true,
    staleTime: 30000, // 30 seconds
  })
}

export const useOrder = (id: string) => {
  return useQuery(['order', id], () => orderApi.getOrderById(id), {
    enabled: !!id,
    staleTime: 30000,
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation((data: CreateOrderDto) => orderApi.createOrder(data), {
    onSuccess: () => {
      queryClient.invalidateQueries('orders')
      toast.success('Order created successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to create order'
      toast.error(message)
    },
  })
}

export const useUpdateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }: { id: string; data: UpdateOrderDto }) =>
      orderApi.updateOrder(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries('orders')
        queryClient.invalidateQueries(['order', id])
        toast.success('Order updated successfully!')
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Failed to update order'
        toast.error(message)
      },
    }
  )
}

export const useDeleteOrder = () => {
  const queryClient = useQueryClient()

  return useMutation((id: string) => orderApi.deleteOrder(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('orders')
      toast.success('Order deleted successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to delete order'
      toast.error(message)
    },
  })
}

export const useOrdersByStatus = (status: OrderStatus) => {
  return useOrders({ status, page: 1, pageSize: 100 })
}
