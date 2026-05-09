// src/components/admin/ProductForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Category, Product } from '@prisma/client'
import { Plus, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { slugify } from '@/lib/utils'

interface ProductFormProps {
  categories: Category[]
  product?: Product
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const isEditing = !!product

  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product ? String(product.price) : '',
    comparePrice: product?.comparePrice ? String(product.comparePrice) : '',
    categoryId: product?.categoryId || '',
    stock: product ? String(product.stock) : '0',
    sku: product?.sku || '',
    featured: product?.featured ?? false,
    published: product?.published ?? true,
    images: product?.images || [''],
  })
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setForm((prev) => ({
      ...prev,
      [name]: val,
      ...(name === 'name' && !isEditing ? { slug: slugify(value) } : {}),
    }))
  }

  function updateImage(index: number, value: string) {
    const imgs = [...form.images]
    imgs[index] = value
    setForm((prev) => ({ ...prev, images: imgs }))
  }

  function addImage() {
    setForm((prev) => ({ ...prev, images: [...prev.images, ''] }))
  }

  function removeImage(index: number) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...form,
      price: parseFloat(form.price),
      comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
      stock: parseInt(form.stock),
      images: form.images.filter((img) => img.trim() !== ''),
    }

    try {
      const url = isEditing ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success(isEditing ? 'Product updated!' : 'Product created!')
      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="xl:col-span-2 space-y-5">
          <div className="card p-6 space-y-5">
            <h2 className="font-display text-lg">Product Information</h2>

            <div>
              <label className="label">Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className="input" required placeholder="e.g. Wireless Headphones" />
            </div>

            <div>
              <label className="label">Slug (URL)</label>
              <input name="slug" value={form.slug} onChange={handleChange} className="input" required placeholder="wireless-headphones" />
              <p className="text-xs text-stone-400 mt-1">Auto-generated from name. Edit if needed.</p>
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                className="input resize-none"
                required
                placeholder="Detailed product description..."
              />
            </div>
          </div>

          {/* Images */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg">Product Images</h2>
              <button type="button" onClick={addImage} className="btn-secondary text-xs px-3 py-2">
                <Plus size={14} /> Add Image
              </button>
            </div>
            {form.images.map((img, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    value={img}
                    onChange={(e) => updateImage(i, e.target.value)}
                    className="input text-sm"
                    placeholder="https://images.unsplash.com/..."
                  />
                  {img && (
                    <img src={img} alt="" className="mt-2 h-20 w-20 rounded-xl object-cover bg-stone-100" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  )}
                </div>
                {form.images.length > 1 && (
                  <button type="button" onClick={() => removeImage(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1">
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-5">
          <div className="card p-6 space-y-4">
            <h2 className="font-display text-lg">Pricing & Stock</h2>
            <div>
              <label className="label">Price (USD) *</label>
              <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} className="input" required placeholder="0.00" />
            </div>
            <div>
              <label className="label">Compare-at Price</label>
              <input name="comparePrice" type="number" step="0.01" min="0" value={form.comparePrice} onChange={handleChange} className="input" placeholder="0.00" />
              <p className="text-xs text-stone-400 mt-1">Crossed-out price shown to users.</p>
            </div>
            <div>
              <label className="label">Stock Quantity *</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">SKU</label>
              <input name="sku" value={form.sku} onChange={handleChange} className="input" placeholder="PROD-001" />
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="font-display text-lg">Organisation</h2>
            <div>
              <label className="label">Category *</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange} className="input" required>
                <option value="">Select category…</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="featured" name="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 accent-stone-900" />
              <label htmlFor="featured" className="text-sm text-stone-700 cursor-pointer">Featured product</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="published" name="published" checked={form.published} onChange={handleChange} className="w-4 h-4 accent-stone-900" />
              <label htmlFor="published" className="text-sm text-stone-700 cursor-pointer">Published (visible to customers)</label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>

          <button type="button" onClick={() => router.back()} className="btn-secondary w-full justify-center">
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}
