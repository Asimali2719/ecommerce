// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string | { toNumber: () => number }): string {
  const num = typeof price === 'object' ? price.toNumber() : Number(price)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num)
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substr(2, 5).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function getImageUrl(url: string): string {
  if (!url) return '/placeholder.png'
  return url
}

export const TAX_RATE = 0.08 // 8%
export const SHIPPING_RATE = 9.99
export const FREE_SHIPPING_THRESHOLD = 100

export function calculateOrderTotals(subtotal: number) {
  const tax = subtotal * TAX_RATE
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE
  const total = subtotal + tax + shipping
  return { tax, shipping, total }
}
