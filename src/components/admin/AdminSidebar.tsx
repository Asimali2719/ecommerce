// src/components/admin/AdminSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Package, ShoppingBag, Users, LogOut, Store, Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-stone-900 text-white flex flex-col min-h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-stone-800">
        <Link href="/" className="font-display text-2xl font-bold">
          Luxe<span className="text-amber-500">.</span>
        </Link>
        <p className="text-stone-400 text-xs mt-1 uppercase tracking-widest">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-amber-600 text-white'
                  : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-stone-800 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-stone-400 hover:bg-stone-800 hover:text-white transition-all"
        >
          <Store size={18} /> View Store
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-stone-400 hover:bg-red-900/40 hover:text-red-400 transition-all"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
