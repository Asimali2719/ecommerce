// src/components/layout/HeroSection.tsx
import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-stone-900 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600"
          alt="Hero"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/80 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-24">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-600/30 rounded-full px-4 py-1.5 mb-8">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span className="text-amber-400 text-xs font-medium tracking-wide">Premium Collection 2024</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl text-white leading-tight mb-6">
            Curated for the{' '}
            <span className="text-amber-400 italic">Discerning</span>{' '}
            Buyer
          </h1>

          <p className="text-stone-300 text-lg leading-relaxed mb-10 max-w-lg">
            Explore our handpicked selection of premium products. From cutting-edge electronics to timeless fashion — quality you can feel.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/products" className="btn-primary text-base px-8 py-4">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link
              href="/products?sort=featured"
              className="inline-flex items-center gap-2 px-8 py-4 text-base text-white border border-white/30 rounded-full hover:bg-white/10 transition-all"
            >
              View Featured
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-16 pt-10 border-t border-white/10">
            {[
              { value: '10K+', label: 'Happy Customers' },
              { value: '500+', label: 'Products' },
              { value: '4.9★', label: 'Average Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl text-white">{stat.value}</p>
                <p className="text-stone-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
