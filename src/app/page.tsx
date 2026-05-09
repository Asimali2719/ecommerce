// src/app/page.tsx
import { db } from '@/lib/db'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/product/ProductCard'
import { HeroSection } from '@/components/layout/HeroSection'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const revalidate = 60

async function getFeaturedProducts() {
  return db.product.findMany({
    where: { featured: true, published: true },
    include: { category: true },
    take: 4,
    orderBy: { createdAt: 'desc' },
  })
}

async function getCategories() {
  return db.category.findMany({
    take: 4,
    include: { _count: { select: { products: true } } },
  })
}

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ])

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />

        {/* Categories */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-amber-700 text-sm font-medium tracking-widest uppercase mb-2">
                  Explore
                </p>
                <h2 className="font-display text-4xl text-stone-900">Shop by Category</h2>
              </div>
              <Link
                href="/products"
                className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors"
              >
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl aspect-square bg-stone-200"
                >
                  {cat.image && (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-white font-display text-xl">{cat.name}</h3>
                    <p className="text-stone-300 text-sm">{cat._count.products} products</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-amber-700 text-sm font-medium tracking-widest uppercase mb-2">
                  Handpicked
                </p>
                <h2 className="font-display text-4xl text-stone-900">Featured Products</h2>
              </div>
              <Link
                href="/products?sort=featured"
                className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors"
              >
                See All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="py-20 px-4 bg-stone-900 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  title: 'Free Shipping',
                  desc: 'On orders over $100. Fast, reliable delivery to your door.',
                  icon: '📦',
                },
                {
                  title: 'Secure Payments',
                  desc: 'Your payment info is always encrypted and protected.',
                  icon: '🔒',
                },
                {
                  title: 'Easy Returns',
                  desc: '30-day return policy. No questions asked.',
                  icon: '↩️',
                },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-display text-xl mb-2">{item.title}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
