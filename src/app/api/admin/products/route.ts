// src/app/api/admin/products/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { productSchema } from '@/lib/validations'
import { slugify } from '@/lib/utils'

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') return null
  return session
}

export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const products = await db.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ products })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { name, ...rest } = parsed.data
    const slug = rest.slug || slugify(name)

    const existing = await db.product.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 409 })
    }

    const product = await db.product.create({
      data: { name, slug, ...rest },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    console.error('[ADMIN_PRODUCTS_POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
