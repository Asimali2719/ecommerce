// src/app/api/admin/orders/[id]/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateOrderStatusSchema } from '@/lib/validations'

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') return null
  return session
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const order = await db.order.findUnique({
      where: { id: params.id },
      include: { items: true, shippingAddress: true, user: true },
    })
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ order })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const parsed = updateOrderStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const order = await db.order.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
    })

    return NextResponse.json({ order })
  } catch (err) {
    console.error('[ADMIN_ORDER_PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
