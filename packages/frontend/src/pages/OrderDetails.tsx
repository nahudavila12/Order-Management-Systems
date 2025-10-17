import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Hash,
  Package,
  User,
  XCircle,
} from 'lucide-react'

import { useOrder } from '@/hooks/useOrders'
import { cn, formatDate } from '@/lib/utils'

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useOrder(id!)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'badge-pending'
      case 'completed':
        return 'badge-completed'
      case 'cancelled':
        return 'badge-cancelled'
      default:
        return 'badge'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
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

  const order = data?.data

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Order not found
        </h3>
        <div className="mt-6">
          <Link to="/orders" className="btn-primary btn-md">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/orders" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="mt-1 text-sm text-gray-500">Order ID: {order.id}</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to={`/orders/${order.id}/edit`}
            className="btn-secondary btn-md"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Order
          </Link>
        </div>
      </div>

      {/* Order Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Order Information
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Hash className="h-4 w-4 mr-2" />
                  Order ID
                </dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">
                  {order.id}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created At
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(order.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Customer Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {order.customerName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Item
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{order.item}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                <dd className="mt-1 text-sm text-gray-900">{order.quantity}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span
                    className={cn('badge', getStatusBadgeClass(order.status))}
                  >
                    {order.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Status Card */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Order Status
            </h3>
            <div className="flex items-center space-x-3">
              {getStatusIcon(order.status)}
              <span className={cn('badge', getStatusBadgeClass(order.status))}>
                {order.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              {order.status === 'pending' &&
                'This order is waiting to be processed.'}
              {order.status === 'completed' &&
                'This order has been completed successfully.'}
              {order.status === 'cancelled' && 'This order has been cancelled.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                to={`/orders/${order.id}/edit`}
                className="w-full btn-primary btn-md flex items-center justify-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Order
              </Link>
              <Link
                to="/orders"
                className="w-full btn-secondary btn-md flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Order Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Item:</span>
                <span className="text-gray-900">{order.item}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Quantity:</span>
                <span className="text-gray-900">{order.quantity}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span className="text-gray-900">Status:</span>
                  <span
                    className={cn('badge', getStatusBadgeClass(order.status))}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails
