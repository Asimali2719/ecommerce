// src/components/layout/Navbar.tsx
'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useCartStore } from '@/store/cart'
import { ShoppingCart, User, Menu, X, Search, LogOut, Package, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { CartSidebar } from '@/components/cart/CartSidebar'

export function Navbar() {
  const { data: session } = useSession()
  const { itemCount, openCart } = useCartStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const count = itemCount()

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="font-display text-2xl text-stone-900 font-bold">
              Luxe<span className="text-amber-600">.</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/products" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                Products
              </Link>
              <Link href="/products?sort=featured" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                Featured
              </Link>
              <Link href="/products?category=electronics" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                Electronics
              </Link>
              <Link href="/products?category=clothing" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                Clothing
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
              >
                <Search size={20} />
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
              >
                <ShoppingCart size={20} />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-medium">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
                  >
                    {session.user.image ? (
                      <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                        <User size={16} className="text-stone-600" />
                      </div>
                    )}
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-stone-100 py-2 animate-fade-in">
                      <div className="px-4 py-2 border-b border-stone-100 mb-1">
                        <p className="text-sm font-medium text-stone-900 truncate">{session.user.name}</p>
                        <p className="text-xs text-stone-500 truncate">{session.user.email}</p>
                      </div>
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Package size={16} /> My Orders
                      </Link>
                      {(session.user as any).role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <LayoutDashboard size={16} /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => { signOut({ callbackUrl: '/' }); setIsUserMenuOpen(false) }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="btn-primary text-xs px-4 py-2">
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t border-stone-100 pt-4 space-y-2 animate-fade-in">
              {['Products', 'Featured', 'Electronics', 'Clothing'].map((item) => (
                <Link
                  key={item}
                  href={`/products${item !== 'Products' ? `?${item === 'Featured' ? 'sort=featured' : `category=${item.toLowerCase()}`}` : ''}`}
                  className="block px-2 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      <CartSidebar />

      {/* Overlay for user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  )
}
