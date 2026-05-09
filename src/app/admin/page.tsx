// src/app/admin/page.tsx
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import { DollarSign, ShoppingBag, Package, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Dashboard' }

const statusColors: Record<string, string> = {
  PENDING: 'badge-yellow',
  PROCESSING: 'badge-blue',
  SHIPPED: 'badge-blue',
  DELIVERED: 'badge-green',
  CANCELLED: 'badge-red',
  REFUNDED: 'badge-gray',
}

export default async function AdminDashboardPage() {
  const [totalRevenue, totalOrders, totalProducts, totalUsers, recentOrders, lowStockProducts] =
    await Promise.all([
      db.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID' },
      }),
      db.order.count(),
      db.product.count({ where: { published: true } }),
      db.user.count(),
      db.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: true,
        },
      }),
      db.product.findMany({
        where: { stock: { lte: 5 }, published: true },
        take: 5,
        orderBy: { stock: 'asc' },
      }),
    ])

  const stats = [
    {
      label: 'Total Revenue',
      value: formatPrice(Number(totalRevenue._sum.total || 0)),
      icon: DollarSign,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Total Orders',
      value: totalOrders.toString(),
      icon: ShoppingBag,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Products',
      value: totalProducts.toString(),
      icon: Package,
      color: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Customers',
      value: totalUsers.toString(),
      icon: Users,
      color: 'bg-purple-100 text-purple-700',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl text-stone-900">Dashboard</h1>
        <p className="text-stone-500 mt-1">Welcome back, here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-stone-500 text-sm">{label}</p>
              <p className="font-display text-2xl text-stone-900 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-amber-700 hover:text-amber-600 font-medium">
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left pb-3 text-stone-500 font-medium">Order</th>
                  <th className="text-left pb-3 text-stone-500 font-medium">Customer</th>
                  <th className="text-left pb-3 text-stone-500 font-medium">Status</th>
                  <th className="text-right pb-3 text-stone-500 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-stone-900 hover:text-amber-700">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 text-stone-600 truncate max-w-[160px]">
                      {order.user.name || order.user.email}
                    </td>
                    <td className="py-3">
                      <span className={statusColors[order.status]}>{order.status}</span>
                    </td>
                    <td className="py-3 text-right font-semibold">{formatPrice(Number(order.total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl">Low Stock</h2>
            <Link href="/admin/products" className="text-sm text-amber-700 hover:text-amber-600 font-medium">
              Manage →
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp size={32} className="mx-auto text-emerald-400 mb-2" />
              <p className="text-stone-500 text-sm">All products well stocked!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                    {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{p.name}</p>
                    <p className={`text-xs font-medium ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
