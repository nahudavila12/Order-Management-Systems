import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { useOrder, useUpdateOrder } from '@/hooks/useOrders'
import { OrderStatus, UpdateOrderDto } from '@order-management/shared-types'

const EditOrder = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = useOrder(id!)
  const updateOrderMutation = useUpdateOrder()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateOrderDto>()

  useEffect(() => {
    if (data?.data) {
      reset({
        customerName: data.data.customerName,
        item: data.data.item,
        quantity: data.data.quantity,
        status: data.data.status,
      })
    }
  }, [data?.data, reset])

  const onSubmit = async (formData: UpdateOrderDto) => {
    try {
      await updateOrderMutation.mutateAsync({ id: id!, data: formData })
      navigate(`/orders/${id}`)
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error || !data?.data) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Order not found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {(error as any)?.message || 'Something went wrong'}
        </p>
        <div className="mt-6">
          <Link to="/orders" className="btn-primary btn-md">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  const order = data.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to={`/orders/${id}`}
          className="text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Order</h1>
          <p className="mt-1 text-sm text-gray-500">Order ID: {order.id}</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Name */}
            <div>
              <label
                htmlFor="customerName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Customer Name *
              </label>
              <input
                id="customerName"
                type="text"
                {...register('customerName', {
                  required: 'Customer name is required',
                  minLength: {
                    value: 2,
                    message: 'Customer name must be at least 2 characters',
                  },
                  maxLength: {
                    value: 100,
                    message: 'Customer name must be less than 100 characters',
                  },
                })}
                className={`input ${errors.customerName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter customer name"
              />
              {errors.customerName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            {/* Item */}
            <div>
              <label
                htmlFor="item"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Item *
              </label>
              <input
                id="item"
                type="text"
                {...register('item', {
                  required: 'Item is required',
                  minLength: {
                    value: 2,
                    message: 'Item must be at least 2 characters',
                  },
                  maxLength: {
                    value: 200,
                    message: 'Item must be less than 200 characters',
                  },
                })}
                className={`input ${errors.item ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter item name"
              />
              {errors.item && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.item.message}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Quantity *
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                max="1000"
                {...register('quantity', {
                  required: 'Quantity is required',
                  min: {
                    value: 1,
                    message: 'Quantity must be at least 1',
                  },
                  max: {
                    value: 1000,
                    message: 'Quantity must be less than 1000',
                  },
                  valueAsNumber: true,
                })}
                className={`input ${errors.quantity ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter quantity"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status *
              </label>
              <select
                id="status"
                {...register('status', {
                  required: 'Status is required',
                })}
                className="select"
              >
                <option value={OrderStatus.PENDING}>Pending</option>
                <option value={OrderStatus.COMPLETED}>Completed</option>
                <option value={OrderStatus.CANCELLED}>Cancelled</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.status.message}
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link to={`/orders/${id}`} className="btn-secondary btn-md">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || updateOrderMutation.isLoading}
                className="btn-primary btn-md"
              >
                {isSubmitting || updateOrderMutation.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Order
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditOrder
