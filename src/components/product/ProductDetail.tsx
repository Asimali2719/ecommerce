// src/components/product/ProductDetail.tsx
'use client'

import { useState } from 'react'
import { ShoppingCart, ArrowLeft, Package, Shield, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { ProductCard } from './ProductCard'
import { ProductWithCategory } from '@/types'
import { cn } from '@/lib/utils'

interface ProductDetailProps {
  product: ProductWithCategory
  relatedProducts: ProductWithCategory[]
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const { addItem, openCart } = useCartStore()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const price = Number(product.price)
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : null

  async function handleAddToCart() {
    setIsAdding(true)
    addItem({
      productId: product.id,
      quantity,
      product: {
        id: product.id,
        name: product.name,
        price,
        images: product.images,
        stock: product.stock,
        slug: product.slug,
      },
    })
    setTimeout(() => {
      setIsAdding(false)
      openCart()
    }, 500)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-500 mb-8">
        <Link href="/" className="hover:text-stone-900 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-stone-900 transition-colors">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-stone-900 transition-colors">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-stone-900 font-medium truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-stone-100 rounded-3xl overflow-hidden">
            <img
              src={product.images[selectedImage] || '/placeholder.png'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'w-20 h-20 rounded-xl overflow-hidden border-2 transition-all',
                    selectedImage === i ? 'border-stone-900' : 'border-stone-200 opacity-60 hover:opacity-100'
                  )}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-amber-700 text-sm font-medium">{product.category.name}</span>
          </div>
          <h1 className="font-display text-4xl text-stone-900 mb-4">{product.name}</h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-stone-900">{formatPrice(price)}</span>
            {comparePrice && (
              <span className="text-xl text-stone-400 line-through">{formatPrice(comparePrice)}</span>
            )}
            {discount && (
              <span className="badge bg-amber-600 text-white">Save {discount}%</span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 10 ? (
              <span className="badge-green">In Stock ({product.stock} available)</span>
            ) : product.stock > 0 ? (
              <span className="badge-yellow">Low Stock — Only {product.stock} left</span>
            ) : (
              <span className="badge-red">Out of Stock</span>
            )}
          </div>

          {/* Description */}
          <p className="text-stone-600 leading-relaxed mb-8">{product.description}</p>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="mb-6">
              <label className="label">Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-stone-100 transition-colors text-lg"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 hover:bg-stone-100 transition-colors text-lg"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-stone-500">Max: {product.stock}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
              className="btn-primary flex-1 justify-center py-4 text-base"
            >
              <ShoppingCart size={20} />
              {isAdding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <Link href="/checkout" className="btn-secondary px-6 py-4">
              Buy Now
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-100">
            {[
              { icon: Package, label: 'Free Shipping', sub: 'Orders over $100' },
              { icon: Shield, label: 'Secure Payment', sub: 'SSL Encrypted' },
              { icon: RefreshCw, label: 'Easy Returns', sub: '30-Day Policy' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="text-center">
                <Icon size={24} className="mx-auto mb-2 text-stone-500" />
                <p className="text-xs font-medium text-stone-800">{label}</p>
                <p className="text-xs text-stone-400">{sub}</p>
              </div>
            ))}
          </div>

          {/* SKU */}
          {product.sku && (
            <p className="text-xs text-stone-400 mt-4">SKU: {product.sku}</p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl mb-8">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
