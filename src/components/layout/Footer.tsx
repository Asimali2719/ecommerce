// src/components/layout/Footer.tsx
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="font-display text-2xl text-white font-bold">
              Luxe<span className="text-amber-500">.</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              Premium products curated for quality and style. Shop with confidence.
            </p>
          </div>
          {[
            {
              title: 'Shop',
              links: [
                { label: 'All Products', href: '/products' },
                { label: 'Electronics', href: '/products?category=electronics' },
                { label: 'Clothing', href: '/products?category=clothing' },
                { label: 'Home & Living', href: '/products?category=home-living' },
              ],
            },
            {
              title: 'Account',
              links: [
                { label: 'Sign In', href: '/login' },
                { label: 'Register', href: '/register' },
                { label: 'My Orders', href: '/orders' },
                { label: 'Cart', href: '/cart' },
              ],
            },
            {
              title: 'Legal',
              links: [
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Cookie Policy', href: '#' },
                { label: 'Refund Policy', href: '#' },
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="text-white text-sm font-semibold uppercase tracking-widest mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} Luxe Shop. All rights reserved.</p>
          <p className="text-sm">Built with Next.js, Prisma & Stripe</p>
        </div>
      </div>
    </footer>
  )
}
