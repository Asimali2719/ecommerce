// src/components/admin/DeleteProductButton.tsx
'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Product deleted')
      router.refresh()
    } catch {
      toast.error('Failed to delete product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  )
}
