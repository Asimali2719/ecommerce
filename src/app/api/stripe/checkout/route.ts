// src/app/api/stripe/checkout/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe-server'
import { formatAmountForStripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { items, subtotal, tax, shipping, total, paymentMethod, notes, ...address } = body

    if (!items?.length) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    // Validate stock
    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.productId } })
      if (!product || product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${item.name}` }, { status: 400 })
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const orderNumber = generateOrderNumber()

    // Create pending order first
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        paymentMethod: 'STRIPE',
        paymentStatus: 'PENDING',
        subtotal,
        tax,
        shipping,
        total,
        notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        },
        shippingAddress: {
          create: {
            firstName: address.firstName,
            lastName: address.lastName,
            email: address.email,
            phone: address.phone,
            address: address.address,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          },
        },
      },
    })

    // Create Stripe session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: address.email,
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: formatAmountForStripe(item.price),
        },
        quantity: item.quantity,
      })),
      metadata: {
        orderId: order.id,
        userId: session.user.id,
      },
      success_url: `${appUrl}/orders/${order.id}?success=true`,
      cancel_url: `${appUrl}/checkout`,
    })

    // Save stripe session id
    await db.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    })

    return NextResponse.json({ sessionId: stripeSession.id })
  } catch (err) {
    console.error('[STRIPE_CHECKOUT]', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
