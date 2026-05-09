// src/lib/validations.ts
import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  comparePrice: z.number().positive().optional().nullable(),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  categoryId: z.string().min(1, 'Category is required'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  sku: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
})

export const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  paymentMethod: z.enum(['STRIPE', 'COD']),
  notes: z.string().optional(),
})

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(99),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProductInput = z.infer<typeof productSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type CartItemInput = z.infer<typeof cartItemSchema>
