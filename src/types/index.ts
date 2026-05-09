// src/types/index.ts
import { Product, Category, Order, OrderItem, User, OrderStatus, PaymentMethod, PaymentStatus, CartItem } from '@prisma/client'

export type ProductWithCategory = Product & {
  category: Category
}

export type CartItemWithProduct = CartItem & {
  product: Product
}

export type OrderWithItems = Order & {
  items: OrderItem[]
  shippingAddress: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
  } | null
  user: {
    name: string | null
    email: string
  }
}

export type LocalCartItem = {
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    images: string[]
    stock: number
    slug: string
  }
}

export type CheckoutFormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  paymentMethod: 'STRIPE' | 'COD'
  notes?: string
}

export type ProductFilters = {
  category?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'featured'
  page?: number
  limit?: number
}

export type ApiResponse<T> = {
  data?: T
  error?: string
  message?: string
}

export type DashboardStats = {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
  recentOrders: OrderWithItems[]
  ordersByStatus: Record<OrderStatus, number>
}

export { OrderStatus, PaymentMethod, PaymentStatus }
