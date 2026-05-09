// src/components/cart/CartSidebar.tsx
'use client'

import { useCartStore } from '@/store/cart'
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatPrice, calculateOrderTotals } from '@/lib/utils'

export function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCartStore()

  const sub = subtotal()
  const { tax, shipping, total } = calculateOrderTotals(sub)

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} />
            <h2 className="font-display text-xl">Your Cart</h2>
            <span className="badge-gray">{items.length}</span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <ShoppingBag size={48} className="text-stone-300 mb-4" />
              <h3 className="font-display text-xl text-stone-700 mb-2">Your cart is empty</h3>
              <p className="text-stone-500 text-sm mb-6">Add some products to get started</p>
              <button onClick={closeCart} className="btn-primary">
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-4 p-3 bg-stone-50 rounded-2xl">
                <Link href={`/products/${item.product.slug}`} onClick={closeCart}>
                  <img
                    src={item.product.images[0] || '/placeholder.png'}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    onClick={closeCart}
                    className="text-sm font-medium text-stone-900 line-clamp-2 hover:text-amber-700 transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-amber-700 font-semibold text-sm mt-1">
                    {formatPrice(item.product.price)}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 bg-white rounded-full border border-stone-200 p-0.5">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1.5 hover:bg-stone-100 rounded-full transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1.5 hover:bg-stone-100 rounded-full transition-colors disabled:opacity-40"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-stone-100 space-y-4 bg-stone-50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Tax (8%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-emerald-600">Free</span> : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-semibold text-stone-900 text-base pt-2 border-t border-stone-200">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link href="/checkout" onClick={closeCart} className="btn-primary w-full justify-center">
              Proceed to Checkout
            </Link>
            <button onClick={closeCart} className="btn-secondary w-full justify-center">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
