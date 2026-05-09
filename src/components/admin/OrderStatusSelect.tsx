// src/components/admin/OrderStatusSelect.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast.success('Status updated')
      router.refresh()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      disabled={loading}
      className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 bg-white text-stone-700 focus:outline-none focus:border-stone-400 disabled:opacity-50 cursor-pointer"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )
}
