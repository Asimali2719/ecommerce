// src/app/orders/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Package, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Orders' }

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: 'badge-yellow',
    PROCESSING: 'badge-blue',
    SHIPPED: 'badge-blue',
    DELIVERED: 'badge-green',
    CANCELLED: 'badge-red',
    REFUNDED: 'badge-gray',
  }
  return map[status] || 'badge-gray'
}

export default async function OrdersPage() {
  const session = await auth()
  if (!session) redirect('/login?callbackUrl=/orders')

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: true,
      shippingAddress: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-stone-50 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="font-display text-4xl text-stone-900 mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="card p-16 text-center">
              <Package size={56} className="mx-auto text-stone-300 mb-4" />
              <h2 className="font-display text-2xl text-stone-700 mb-2">No orders yet</h2>
              <p className="text-stone-500 mb-6">Once you place an order, it'll appear here.</p>
              <Link href="/products" className="btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="card p-6 flex items-center gap-6 hover:shadow-md transition-shadow group"
                >
                  {/* Thumbnail grid */}
                  <div className="flex -space-x-2 flex-shrink-0">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div
                        key={item.id}
                        className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white bg-stone-100"
                        style={{ zIndex: 3 - i }}
                      >
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 rounded-xl border-2 border-white bg-stone-200 flex items-center justify-center text-xs font-medium text-stone-600">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-stone-900">{order.orderNumber}</span>
                      <span className={statusBadge(order.status)}>{order.status}</span>
                    </div>
                    <p className="text-sm text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                      {' · '}
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-stone-900">{formatPrice(Number(order.total))}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{order.paymentMethod}</p>
                  </div>

                  <ChevronRight size={18} className="text-stone-300 group-hover:text-stone-600 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
