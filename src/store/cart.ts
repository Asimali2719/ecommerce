// src/store/cart.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LocalCartItem } from '@/types'
import toast from 'react-hot-toast'

interface CartStore {
  items: LocalCartItem[]
  isOpen: boolean
  addItem: (item: LocalCartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  itemCount: () => number
  subtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const { items } = get()
        const existingItem = items.find((item) => item.productId === newItem.productId)

        if (existingItem) {
          const newQty = existingItem.quantity + newItem.quantity
          if (newQty > newItem.product.stock) {
            toast.error('Not enough stock available')
            return
          }
          set({
            items: items.map((item) =>
              item.productId === newItem.productId
                ? { ...item, quantity: newQty }
                : item
            ),
          })
        } else {
          set({ items: [...items, newItem] })
        }
        toast.success('Added to cart!')
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.productId !== productId) })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      subtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
