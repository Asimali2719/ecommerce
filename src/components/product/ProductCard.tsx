// src/components/product/ProductCard.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ShoppingCart, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { ProductWithCategory } from '@/types'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: ProductWithCategory
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()
  const [isAdding, setIsAdding] = useState(false)

  const price = Number(product.price)
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : null

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (product.stock === 0) return
    setIsAdding(true)
    addItem({
      productId: product.id,
      quantity: 1,
      product: {
        id: product.id,
        name: product.name,
        price,
        images: product.images,
        stock: product.stock,
        slug: product.slug,
      },
    })
    setTimeout(() => setIsAdding(false), 600)
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-stone-100 aspect-square mb-3">
        <img
          src={product.images[0] || '/placeholder.png'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.stock === 0 && (
            <span className="badge-red text-xs">Out of Stock</span>
          )}
          {discount && (
            <span className="badge bg-amber-600 text-white text-xs">-{discount}%</span>
          )}
          {product.featured && (
            <span className="badge bg-stone-900 text-white text-xs">Featured</span>
          )}
        </div>

        {/* Quick Add */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAdding}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all',
              product.stock === 0
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-stone-900 text-white hover:bg-stone-700'
            )}
          >
            <ShoppingCart size={16} />
            {isAdding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <div className="px-1">
        <p className="text-xs text-stone-500 mb-1">{product.category.name}</p>
        <h3 className="text-sm font-medium text-stone-900 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-900">{formatPrice(price)}</span>
          {comparePrice && (
            <span className="text-sm text-stone-400 line-through">{formatPrice(comparePrice)}</span>
          )}
        </div>
        <p className="text-xs text-stone-400 mt-1">
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
      </div>
    </Link>
  )
}
