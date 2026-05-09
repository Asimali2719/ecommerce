// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shop.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@shop.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  })

  // Create test user
  const userPassword = await bcrypt.hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@shop.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@shop.com',
      password: userPassword,
      role: Role.USER,
    },
  })

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Gadgets and electronic devices',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'clothing' },
      update: {},
      create: {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel',
        image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'home-living' },
      update: {},
      create: {
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Home decor and furniture',
        image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400',
      },
    }),
  ])

  // Create products
  const products = [
    {
      name: 'Wireless Noise-Cancelling Headphones',
      slug: 'wireless-nc-headphones',
      description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio. Perfect for work, travel, and leisure.',
      price: 299.99,
      comparePrice: 399.99,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600',
      ],
      categoryId: categories[0].id,
      stock: 50,
      sku: 'WH-1000XM5',
      featured: true,
    },
    {
      name: 'Smartphone Pro Max',
      slug: 'smartphone-pro-max',
      description: 'The latest flagship smartphone with a 6.7" OLED display, triple camera system, and all-day battery life.',
      price: 999.99,
      comparePrice: 1099.99,
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
      ],
      categoryId: categories[0].id,
      stock: 30,
      sku: 'SPM-2024',
      featured: true,
    },
    {
      name: 'Classic Cotton T-Shirt',
      slug: 'classic-cotton-tshirt',
      description: 'Soft, breathable 100% cotton t-shirt available in multiple colors. Perfect for everyday wear.',
      price: 29.99,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
      ],
      categoryId: categories[1].id,
      stock: 200,
      sku: 'CCT-001',
      featured: false,
    },
    {
      name: 'Minimalist Desk Lamp',
      slug: 'minimalist-desk-lamp',
      description: 'Elegant LED desk lamp with adjustable brightness, USB charging port, and touch control.',
      price: 79.99,
      comparePrice: 99.99,
      images: [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
      ],
      categoryId: categories[2].id,
      stock: 75,
      sku: 'MDL-2024',
      featured: true,
    },
    {
      name: 'Mechanical Keyboard',
      slug: 'mechanical-keyboard',
      description: 'Compact TKL mechanical keyboard with RGB backlight, Cherry MX switches, and aluminum frame.',
      price: 149.99,
      images: [
        'https://images.unsplash.com/photo-1595044426077-d36d9236d44a?w=600',
      ],
      categoryId: categories[0].id,
      stock: 40,
      sku: 'MK-TKL-RGB',
      featured: false,
    },
    {
      name: 'Premium Leather Wallet',
      slug: 'premium-leather-wallet',
      description: 'Handcrafted genuine leather slim wallet with RFID protection and multiple card slots.',
      price: 49.99,
      images: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600',
      ],
      categoryId: categories[1].id,
      stock: 100,
      sku: 'PLW-001',
      featured: false,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`   Admin: admin@shop.com / admin123`)
  console.log(`   User:  user@shop.com / user123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
