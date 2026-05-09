// src/components/checkout/CheckoutForm.tsx
'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { formatPrice, calculateOrderTotals } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Loader2, CreditCard, Truck, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { getStripe } from '@/lib/stripe'

interface CheckoutFormProps {
  userId: string
  userEmail: string
  userName: string
}

export function CheckoutForm({ userId, userEmail, userName }: CheckoutFormProps) {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCartStore()
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'COD'>('STRIPE')
  const [loading, setLoading] = useState(false)

  const [nameParts] = useState(() => {
    const parts = userName.split(' ')
    return { first: parts[0] || '', last: parts.slice(1).join(' ') || '' }
  })

  const [form, setForm] = useState({
    firstName: nameParts.first,
    lastName: nameParts.last,
    email: userEmail,
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    notes: '',
  })

  const sub = subtotal()
  const { tax, shipping, total } = calculateOrderTotals(sub)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...form,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.product.price,
          name: i.product.name,
          image: i.product.images[0] || '',
        })),
        subtotal: sub,
        tax,
        shipping,
        total,
      }

      if (paymentMethod === 'COD') {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        clearCart()
        toast.success('Order placed successfully!')
        router.push(`/orders/${data.order.id}?success=true`)
      } else {
        // Stripe checkout
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        const stripe = await getStripe()
        if (!stripe) throw new Error('Stripe failed to load')
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="font-display text-2xl text-stone-700 mb-4">Your cart is empty</h2>
        <button onClick={() => router.push('/products')} className="btn-primary">
          Shop Now
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Left: Form */}
        <div className="lg:col-span-3 space-y-8">
          {/* Shipping */}
          <div className="card p-6">
            <h2 className="font-display text-xl mb-5 flex items-center gap-2">
              <Truck size={20} /> Shipping Address
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} className="input" required />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} className="input" required />
              </div>
              <div className="col-span-2">
                <label className="label">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="input" required />
              </div>
              <div className="col-span-2">
                <label className="label">Phone Number</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+1 555 000 0000" className="input" required />
              </div>
              <div className="col-span-2">
                <label className="label">Street Address</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="123 Main St, Apt 4" className="input" required />
              </div>
              <div>
                <label className="label">City</label>
                <input name="city" value={form.city} onChange={handleChange} className="input" required />
              </div>
              <div>
                <label className="label">State / Province</label>
                <input name="state" value={form.state} onChange={handleChange} className="input" required />
              </div>
              <div>
                <label className="label">Postal Code</label>
                <input name="postalCode" value={form.postalCode} onChange={handleChange} className="input" required />
              </div>
              <div>
                <label className="label">Country</label>
                <select name="country" value={form.country} onChange={handleChange} className="input">
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="PK">Pakistan</option>
                  <option value="IN">India</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Order Notes (optional)</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Any special delivery instructions..." className="input resize-none" />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-6">
            <h2 className="font-display text-xl mb-5 flex items-center gap-2">
              <CreditCard size={20} /> Payment Method
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'STRIPE', label: 'Credit / Debit Card', sub: 'Secure payment via Stripe', icon: '💳' },
                { value: 'COD', label: 'Cash on Delivery', sub: 'Pay when you receive', icon: '💵' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPaymentMethod(opt.value as 'STRIPE' | 'COD')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    paymentMethod === opt.value
                      ? 'border-stone-900 bg-stone-50'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <span className="text-2xl block mb-2">{opt.icon}</span>
                  <p className="font-medium text-stone-900 text-sm">{opt.label}</p>
                  <p className="text-stone-500 text-xs mt-0.5">{opt.sub}</p>
                </button>
              ))}
            </div>

            {paymentMethod === 'STRIPE' && (
              <div className="mt-4 flex items-center gap-2 text-xs text-stone-500 bg-stone-50 p-3 rounded-xl">
                <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0" />
                You'll be redirected to Stripe's secure payment page to complete your purchase.
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-24">
            <h2 className="font-display text-xl mb-5">Order Summary</h2>

            <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 items-center">
                  <img
                    src={item.product.images[0] || '/placeholder.png'}
                    alt={item.product.name}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-stone-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-stone-900 flex-shrink-0">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span><span>{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Tax (8%)</span><span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : formatPrice(shipping)}</span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-emerald-600">🎉 You qualify for free shipping!</p>
              )}
              <div className="flex justify-between font-bold text-stone-900 text-base pt-3 border-t border-stone-100">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-6 py-4 text-base"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading
                ? 'Processing...'
                : paymentMethod === 'COD'
                ? `Place Order — ${formatPrice(total)}`
                : `Pay with Stripe — ${formatPrice(total)}`}
            </button>

            <p className="text-center text-xs text-stone-400 mt-3">
              🔒 Your data is safe and encrypted
            </p>
          </div>
        </div>
      </div>
    </form>
  )
}
