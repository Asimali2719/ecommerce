// src/app/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const passwordChecks = [
    { label: 'At least 8 characters', pass: form.password.length >= 8 },
    { label: 'One uppercase letter', pass: /[A-Z]/.test(form.password) },
    { label: 'One number', pass: /[0-9]/.test(form.password) },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    if (form.password !== form.confirm) {
      setErrors({ confirm: 'Passwords do not match' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrors({ general: data.error || 'Registration failed' })
        return
      }

      toast.success('Account created! Please sign in.')
      router.push('/login')
    } catch {
      setErrors({ general: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
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
            Join thousands of{' '}
            <span className="text-amber-400 italic">smart shoppers</span>{' '}
            today.
          </h2>
          <p className="text-stone-400 text-lg">
            Create your account to track orders, save favourites, and enjoy a seamless checkout experience.
          </p>
        </div>
        <div className="flex gap-8 text-stone-400 text-sm">
          <span>Free to join</span>
          <span>Instant access</span>
          <span>No spam</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-stone-50">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="lg:hidden font-display text-2xl font-bold text-stone-900 block mb-8">
              Luxe<span className="text-amber-500">.</span>
            </Link>
            <h1 className="font-display text-3xl text-stone-900 mb-2">Create Account</h1>
            <p className="text-stone-500">
              Already have an account?{' '}
              <Link href="/login" className="text-amber-700 hover:text-amber-600 font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {errors.general && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Email Address</label>
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
                  placeholder="Min. 8 characters"
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
              {form.password && (
                <div className="mt-2 space-y-1">
                  {passwordChecks.map((check) => (
                    <div key={check.label} className="flex items-center gap-2 text-xs">
                      <CheckCircle2
                        size={14}
                        className={check.pass ? 'text-emerald-500' : 'text-stone-300'}
                      />
                      <span className={check.pass ? 'text-emerald-700' : 'text-stone-400'}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="Re-enter password"
                className={`input ${errors.confirm ? 'border-red-400 focus:border-red-500' : ''}`}
                required
              />
              {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !passwordChecks.every((c) => c.pass)}
              className="btn-primary w-full justify-center py-3.5"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-stone-400">
            By creating an account, you agree to our{' '}
            <Link href="#" className="underline">Terms of Service</Link> and{' '}
            <Link href="#" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
