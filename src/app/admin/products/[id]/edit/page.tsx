// src/app/admin/products/[id]/edit/page.tsx
import { db } from '@/lib/db'
import { ProductForm } from '@/components/admin/ProductForm'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Edit Product' }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!product) notFound()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-stone-900">Edit Product</h1>
        <p className="text-stone-500 mt-1 truncate">{product.name}</p>
      </div>
      <ProductForm categories={categories} product={product} />
    </div>
  )
}
