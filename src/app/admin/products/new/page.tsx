// src/app/admin/products/new/page.tsx
import { db } from '@/lib/db'
import { ProductForm } from '@/components/admin/ProductForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — New Product' }

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { name: 'asc' } })
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-stone-900">New Product</h1>
        <p className="text-stone-500 mt-1">Fill in the details to add a new product.</p>
      </div>
      <ProductForm categories={categories} />
    </div>
  )
}
