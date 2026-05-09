// src/app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { db } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('[WEBHOOK] Signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId

        if (orderId) {
          const order = await db.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'PAID',
              status: 'PROCESSING',
              stripePaymentId: session.payment_intent as string,
            },
            include: { items: true },
          })

          // Decrement stock
          for (const item of order.items) {
            await db.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            })
          }
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId
        if (orderId) {
          await db.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED', paymentStatus: 'FAILED' },
          })
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent as string
        if (paymentIntentId) {
          await db.order.updateMany({
            where: { stripePaymentId: paymentIntentId },
            data: { status: 'REFUNDED', paymentStatus: 'REFUNDED' },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[WEBHOOK_HANDLER]', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

export const config = { api: { bodyParser: false } }
