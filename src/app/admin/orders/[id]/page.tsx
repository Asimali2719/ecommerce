// src/app/admin/orders/[id]/page.tsx
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect'

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await db.order.findUnique({
    where: { id: id },
    include: {
      items: true,
      shippingAddress: true,
      user: { select: { name: true, email: true, createdAt: true } },
    },
  })
  if (!order) notFound()

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-stone-900">{order.orderNumber}</h1>
          <p className="text-stone-500 text-sm mt-1">
            {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>
        <Link href="/admin/orders" className="btn-secondary text-sm px-4 py-2">← Back</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          <div className="card p-6">
            <h2 className="font-display text-lg mb-4">Items ({order.items.length})</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-stone-900">{item.name}</p>
                    <p className="text-sm text-stone-500">Qty: {item.quantity} × {formatPrice(Number(item.price))}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(Number(item.price) * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span></div>
              <div className="flex justify-between text-stone-600"><span>Tax</span><span>{formatPrice(Number(order.tax))}</span></div>
              <div className="flex justify-between text-stone-600"><span>Shipping</span><span>{Number(order.shipping) === 0 ? 'Free' : formatPrice(Number(order.shipping))}</span></div>
              <div className="flex justify-between font-bold text-stone-900 text-base border-t border-stone-100 pt-2"><span>Total</span><span>{formatPrice(Number(order.total))}</span></div>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="card p-6">
              <h2 className="font-display text-lg mb-4">Shipping Address</h2>
              <p className="text-stone-700 text-sm leading-relaxed">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}<br />
                <span className="text-stone-400">{order.shippingAddress.phone}</span>
              </p>
            </div>
          )}
        </div>

        {/* Side */}
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-display text-lg mb-4">Order Status</h2>
            <p className="text-sm text-stone-500 mb-2">Current Status</p>
            <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
            <div className="mt-4 pt-4 border-t border-stone-100 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-stone-500">Payment</span><span className="font-medium">{order.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Pay Status</span>
                <span className={`font-medium ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>{order.paymentStatus}</span>
              </div>
              {order.stripeSessionId && (
                <div className="pt-2 border-t border-stone-100">
                  <p className="text-stone-400 text-xs break-all">Stripe: {order.stripeSessionId}</p>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg mb-4">Customer</h2>
            <p className="font-medium text-stone-900">{order.user.name || '—'}</p>
            <p className="text-sm text-stone-500">{order.user.email}</p>
            <p className="text-xs text-stone-400 mt-2">
              Customer since {new Date(order.user.createdAt).toLocaleDateString()}
            </p>
          </div>

          {order.notes && (
            <div className="card p-6">
              <h2 className="font-display text-lg mb-3">Order Notes</h2>
              <p className="text-sm text-stone-600 italic">"{order.notes}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
