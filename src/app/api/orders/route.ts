// src/app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateOrderNumber } from '@/lib/utils'
import { checkoutSchema } from '@/lib/validations'
import { z } from 'zod'

const orderSchema = checkoutSchema.extend({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    name: z.string(),
    image: z.string().optional(),
  })),
  subtotal: z.number(),
  tax: z.number(),
  shipping: z.number(),
  total: z.number(),
})

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const orders = await db.order.findMany({
      where: { userId: session.user.id },
      include: { items: true, shippingAddress: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (err) {
    console.error('[ORDERS_GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = orderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { items, subtotal, tax, shipping, total, paymentMethod, notes, ...address } = parsed.data

    // Validate stock for all items
    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.productId } })
      if (!product) return NextResponse.json({ error: `Product not found: ${item.name}` }, { status: 400 })
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 })
      }
    }

    const order = await db.$transaction(async (tx) => {
      // Decrement stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: session.user.id,
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
          subtotal,
          tax,
          shipping,
          total,
          notes,
          items: {
            create: items.map((item) => ({
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
        include: { items: true, shippingAddress: true },
      })

      return newOrder
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (err) {
    console.error('[ORDERS_POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
