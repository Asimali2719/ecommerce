// src/app/orders/[id]/page.tsx
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { CheckCircle2, Package, Truck, MapPin, CreditCard } from 'lucide-react'

interface PageProps { params: { id: string }; searchParams: { success?: string } }

const STATUS_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export default async function OrderDetailPage({ params, searchParams }: PageProps) {
  const session = await auth()
  if (!session) redirect('/login')

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: { items: true, shippingAddress: true },
  })

  if (!order || order.userId !== session.user.id) notFound()

  const isSuccess = searchParams.success === 'true'
  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-stone-50 py-10">
        <div className="max-w-4xl mx-auto px-4">

          {/* Success Banner */}
          {isSuccess && (
            <div className="mb-8 card p-6 bg-emerald-50 border-emerald-200 flex items-start gap-4">
              <CheckCircle2 size={28} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-display text-xl text-emerald-900 mb-1">Order Confirmed!</h2>
                <p className="text-emerald-700 text-sm">
                  Thank you for your purchase. Your order <strong>{order.orderNumber}</strong> has been placed successfully.
                  {order.paymentMethod === 'COD' && ' Our team will contact you to confirm delivery.'}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-3xl text-stone-900">{order.orderNumber}</h1>
              <p className="text-stone-500 text-sm mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Link href="/orders" className="btn-secondary text-sm px-4 py-2">← All Orders</Link>
          </div>

          {/* Progress Bar */}
          {!['CANCELLED', 'REFUNDED'].includes(order.status) && (
            <div className="card p-6 mb-6">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-stone-200" />
                <div
                  className="absolute top-4 left-0 h-0.5 bg-emerald-500 transition-all"
                  style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i <= currentStep ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-400'
                    }`}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs font-medium ${i <= currentStep ? 'text-stone-900' : 'text-stone-400'}`}>
                      {step.charAt(0) + step.slice(1).toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Items */}
            <div className="md:col-span-2 space-y-4">
              <div className="card p-6">
                <h2 className="font-display text-lg mb-4 flex items-center gap-2"><Package size={18} /> Items Ordered</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
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
              </div>

              {/* Shipping */}
              {order.shippingAddress && (
                <div className="card p-6">
                  <h2 className="font-display text-lg mb-4 flex items-center gap-2"><MapPin size={18} /> Shipping Address</h2>
                  <p className="text-stone-700">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                    {order.shippingAddress.address}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                    {order.shippingAddress.country}
                  </p>
                  <p className="text-stone-500 text-sm mt-2">{order.shippingAddress.phone}</p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <div className="card p-6">
                <h2 className="font-display text-lg mb-4 flex items-center gap-2"><CreditCard size={18} /> Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Tax</span><span>{formatPrice(Number(order.tax))}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Shipping</span>
                    <span>{Number(order.shipping) === 0 ? 'Free' : formatPrice(Number(order.shipping))}</span>
                  </div>
                  <div className="flex justify-between font-bold text-stone-900 text-base border-t border-stone-100 pt-2">
                    <span>Total</span><span>{formatPrice(Number(order.total))}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-stone-100 text-sm text-stone-600">
                  <p>Payment: <span className="font-medium text-stone-900">{order.paymentMethod}</span></p>
                  <p className="mt-1">
                    Status: <span className={`font-medium ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {order.paymentStatus}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
