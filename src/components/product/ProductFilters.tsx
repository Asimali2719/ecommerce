// src/components/product/ProductFilters.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Category } from '@prisma/client'
import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

interface ProductFiltersProps {
  categories: Category[]
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const selectedCategory = searchParams.get('category') || ''
  const selectedSort = searchParams.get('sort') || ''

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParams({ search })
  }

  function clearAll() {
    setSearch('')
    setMinPrice('')
    setMaxPrice('')
    router.push('/products')
  }

  const hasFilters = selectedCategory || search || minPrice || maxPrice || selectedSort

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
          <Search size={16} /> Search
        </h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input flex-1 py-2 text-sm"
          />
          <button type="submit" className="btn-primary px-3 py-2 rounded-xl text-xs">
            Go
          </button>
        </form>
      </div>

      {/* Sort */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
          <SlidersHorizontal size={16} /> Sort By
        </h3>
        <div className="space-y-1">
          {[
            { label: 'Newest', value: '' },
            { label: 'Price: Low to High', value: 'price_asc' },
            { label: 'Price: High to Low', value: 'price_desc' },
            { label: 'Featured', value: 'featured' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateParams({ sort: option.value })}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                selectedSort === option.value
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-stone-900 mb-3">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateParams({ category: '' })}
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
              !selectedCategory ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParams({ category: cat.slug })}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-stone-900 mb-3">Price Range</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="input py-2 text-sm"
          />
          <span className="text-stone-400">–</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="input py-2 text-sm"
          />
        </div>
        <button
          onClick={() => updateParams({ minPrice, maxPrice })}
          className="btn-secondary w-full justify-center mt-2 py-2 text-xs"
        >
          Apply
        </button>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          <X size={16} /> Clear All Filters
        </button>
      )}
    </div>
  )
}
