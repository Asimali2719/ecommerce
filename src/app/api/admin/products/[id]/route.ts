// src/app/api/admin/products/[id]/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { productSchema } from '@/lib/validations'

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') return null
  return session
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const parsed = productSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const product = await db.product.update({
      where: { id: params.id },
      data: parsed.data,
    })

    return NextResponse.json({ product })
  } catch (err) {
    console.error('[ADMIN_PRODUCT_PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await db.product.update({
      where: { id: params.id },
      data: { published: false },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[ADMIN_PRODUCT_DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
