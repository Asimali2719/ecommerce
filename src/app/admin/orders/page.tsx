// src/app/admin/orders/page.tsx
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Orders' }

const statusColors: Record<string, string> = {
  PENDING: 'badge-yellow', PROCESSING: 'badge-blue', SHIPPED: 'badge-blue',
  DELIVERED: 'badge-green', CANCELLED: 'badge-red', REFUNDED: 'badge-gray',
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const orders = await db.order.findMany({
    where: searchParams.status ? { status: searchParams.status as any } : undefined,
    include: {
      user: { select: { name: true, email: true } },
      items: true,
      shippingAddress: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const statuses = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-stone-900">Orders</h1>
        <p className="text-stone-500 mt-1">{orders.length} orders found</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <Link
            key={s}
            href={s === 'ALL' ? '/admin/orders' : `/admin/orders?status=${s}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              (s === 'ALL' && !searchParams.status) || searchParams.status === s
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-6 py-4 text-stone-500 font-medium">Order</th>
                <th className="text-left px-6 py-4 text-stone-500 font-medium">Customer</th>
                <th className="text-left px-6 py-4 text-stone-500 font-medium">Date</th>
                <th className="text-left px-6 py-4 text-stone-500 font-medium">Status</th>
                <th className="text-left px-6 py-4 text-stone-500 font-medium">Payment</th>
                <th className="text-right px-6 py-4 text-stone-500 font-medium">Total</th>
                <th className="text-right px-6 py-4 text-stone-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-stone-900 hover:text-amber-700 transition-colors">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-stone-900 font-medium">{order.user.name || '—'}</p>
                    <p className="text-stone-400 text-xs">{order.user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-stone-600">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    <span className={order.paymentStatus === 'PAID' ? 'badge-green' : 'badge-yellow'}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">{formatPrice(Number(order.total))}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="text-amber-700 hover:text-amber-600 font-medium text-xs">
                      Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-16 text-stone-400">No orders found</div>
          )}
        </div>
      </div>
    </div>
  )
}
