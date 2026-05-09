// src/app/products/page.tsx
import { db } from '@/lib/db'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductFilters } from '@/components/product/ProductFilters'
import { Prisma } from '@prisma/client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our collection of premium products',
}

interface PageProps {
  searchParams: {
    category?: string
    search?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
    page?: string
  }
}

const ITEMS_PER_PAGE = 12

export default async function ProductsPage({ searchParams }: PageProps) {
  const { category, search, sort, minPrice, maxPrice, page = '1' } = searchParams
  const currentPage = parseInt(page)
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  // Build where clause
  const where: Prisma.ProductWhereInput = {
    published: true,
    ...(category && { category: { slug: category } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(minPrice || maxPrice
      ? {
          price: {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          },
        }
      : {}),
  }

  // Build orderBy
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'price_asc'
      ? { price: 'asc' }
      : sort === 'price_desc'
      ? { price: 'desc' }
      : sort === 'featured'
      ? { featured: 'desc' }
      : { createdAt: 'desc' }

  const [products, totalCount, categories] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
    }),
    db.product.count({ where }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Header */}
        <div className="bg-stone-900 text-white py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-display text-5xl mb-3">
              {category
                ? categories.find((c) => c.slug === category)?.name || 'Products'
                : search
                ? `Results for "${search}"`
                : 'All Products'}
            </h1>
            <p className="text-stone-400">{totalCount} products found</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <ProductFilters categories={categories} />
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {products.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-5xl mb-4">🔍</p>
                  <h3 className="font-display text-2xl text-stone-700 mb-2">No products found</h3>
                  <p className="text-stone-500">Try adjusting your filters or search term</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <a
                          key={p}
                          href={`?${new URLSearchParams({
                            ...(category && { category }),
                            ...(search && { search }),
                            ...(sort && { sort }),
                            page: String(p),
                          })}`}
                          className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                            p === currentPage
                              ? 'bg-stone-900 text-white'
                              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          {p}
                        </a>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
