import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'

import { useCreateOrder } from '@/hooks/useOrders'
import { CreateOrderDto, OrderStatus } from '@order-management/shared-types'

const CreateOrder = () => {
  const navigate = useNavigate()
  const createOrderMutation = useCreateOrder()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateOrderDto>({
    defaultValues: {
      customerName: '',
      item: '',
      quantity: 1,
      status: OrderStatus.PENDING,
    },
  })

  const onSubmit = async (data: CreateOrderDto) => {
    try {
      await createOrderMutation.mutateAsync(data)
      reset()
      navigate('/orders')
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/orders" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the details to create a new order
          </p>
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
                Status
              </label>
              <select id="status" {...register('status')} className="select">
                <option value={OrderStatus.PENDING}>Pending</option>
                <option value={OrderStatus.COMPLETED}>Completed</option>
                <option value={OrderStatus.CANCELLED}>Cancelled</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Select the initial status for this order
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link to="/orders" className="btn-secondary btn-md">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || createOrderMutation.isLoading}
                className="btn-primary btn-md"
              >
                {isSubmitting || createOrderMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Order
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

export default CreateOrder
