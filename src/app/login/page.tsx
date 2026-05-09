// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      toast.error('Invalid email or password')
    } else {
      toast.success('Welcome back!')
      router.push(callbackUrl)
      router.refresh()
    }
  }

  async function handleGoogleSignIn() {
    await signIn('google', { callbackUrl })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-stone-900 text-white p-12 flex-col justify-between">
        <Link href="/" className="font-display text-2xl font-bold">
          Luxe<span className="text-amber-500">.</span>
        </Link>
        <div>
          <h2 className="font-display text-5xl leading-tight mb-6">
            Welcome back to a world of{' '}
            <span className="text-amber-400 italic">premium</span> shopping.
          </h2>
          <p className="text-stone-400 text-lg">
            Sign in to access your orders, track shipments, and discover new arrivals.
          </p>
        </div>
        <div className="flex gap-8 text-stone-400 text-sm">
          <span>10K+ Customers</span>
          <span>500+ Products</span>
          <span>Free Returns</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="lg:hidden font-display text-2xl font-bold text-stone-900 block mb-8">
              Luxe<span className="text-amber-500">.</span>
            </Link>
            <h1 className="font-display text-3xl text-stone-900 mb-2">Sign In</h1>
            <p className="text-stone-500">
              Don't have an account?{' '}
              <Link href="/register" className="text-amber-700 hover:text-amber-600 font-medium">
                Create one
              </Link>
            </p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleSignIn}
            className="btn-secondary w-full justify-center mb-6 py-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-stone-50 px-4 text-stone-500">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
            <p className="font-medium text-amber-800 mb-1">Demo Credentials</p>
            <p className="text-amber-700">Admin: admin@shop.com / admin123</p>
            <p className="text-amber-700">User: user@shop.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
