// src/app/admin/users/page.tsx
import { db } from '@/lib/db'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Users' }

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { orders: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-stone-900">Users</h1>
        <p className="text-stone-500 mt-1">{users.length} registered users</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-6 py-4 text-stone-500 font-medium">User</th>
                <th className="text-left px-6 py-4 text-stone-500 font-medium">Role</th>
                <th className="text-left px-6 py-4 text-stone-500 font-medium">Orders</th>
                <th className="text-left px-6 py-4 text-stone-500 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-medium flex-shrink-0">
                        {user.image
                          ? <img src={user.image} alt="" className="w-full h-full rounded-full object-cover" />
                          : (user.name || user.email)[0].toUpperCase()
                        }
                      </div>
                      <div>
                        <p className="font-medium text-stone-900">{user.name || '—'}</p>
                        <p className="text-stone-400 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={user.role === 'ADMIN' ? 'badge bg-amber-100 text-amber-800' : 'badge-gray'}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-700 font-medium">{user._count.orders}</td>
                  <td className="px-6 py-4 text-stone-500">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
