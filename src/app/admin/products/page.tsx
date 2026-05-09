// src/app/admin/products/page.tsx
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { DeleteProductButton } from '@/components/admin/DeleteProductButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Products' }

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-stone-900">Products</h1>
          <p className="text-stone-500 mt-1">{products.length} total products</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-6 py-4 text-stone-500 font-medium">Product</th>
                <th className="text-left px-6 py-4 text-stone-500 font-medium">Category</th>
                <th className="text-left px-6 py-4 text-stone-500 font-medium">Price</th>
                <th className="text-left px-6 py-4 text-stone-500 font-medium">Stock</th>
                <th className="text-left px-6 py-4 text-stone-500 font-medium">Status</th>
                <th className="text-right px-6 py-4 text-stone-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                        {product.images[0] && (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-stone-900 max-w-[200px] truncate">{product.name}</p>
                        <p className="text-stone-400 text-xs">{product.sku || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-stone-600">{product.category.name}</td>
                  <td className="px-6 py-4 font-medium">{formatPrice(Number(product.price))}</td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${product.stock === 0 ? 'text-red-600' : product.stock <= 5 ? 'text-amber-600' : 'text-stone-900'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={product.published ? 'badge-green' : 'badge-gray'}>
                      {product.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
