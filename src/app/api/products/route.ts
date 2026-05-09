// src/app/api/products/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const where: Prisma.ProductWhereInput = {
      published: true,
      ...(category && { category: { slug: category } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === 'price_asc' ? { price: 'asc' } :
      sort === 'price_desc' ? { price: 'desc' } :
      sort === 'featured' ? { featured: 'desc' } :
      { createdAt: 'desc' }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({ products, total, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[PRODUCTS_GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
