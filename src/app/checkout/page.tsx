// src/app/checkout/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Checkout' }

export default async function CheckoutPage() {
  const session = await auth()
  if (!session) redirect('/login?callbackUrl=/checkout')

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-stone-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="font-display text-4xl text-stone-900 mb-8">Checkout</h1>
          <CheckoutForm userId={session.user.id} userEmail={session.user.email!} userName={session.user.name || ''} />
        </div>
      </main>
    </>
  )
}
