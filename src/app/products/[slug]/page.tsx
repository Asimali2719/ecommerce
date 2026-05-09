// src/app/products/[slug]/page.tsx
import { db } from '@/lib/db'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ProductDetail } from '@/components/product/ProductDetail'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await db.product.findUnique({
    where: { slug },
  })
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [product.images[0]] : [],
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = await db.product.findUnique({
    where: { slug, published: true },

  if (!product) notFound()

  const relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      published: true,
    },
    include: { category: true },
    take: 4,
  })

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ProductDetail product={product} relatedProducts={relatedProducts} />
      </main>
      <Footer />
    </>
  )
}
