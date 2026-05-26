import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/lib/types";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, qty?: number, size?: string | null, color?: string | null) => void;
  removeItem: (index: number) => void;
  updateQty: (index: number, qty: number) => void;
  clearCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1, size = null, color = null) => {
        const items = get().items;
        const existing = items.findIndex(
          (i) => i.product.id === product.id && i.size === size && i.color === color
        );
        if (existing >= 0) {
          const updated = [...items];
          updated[existing].quantity += qty;
          set({ items: updated });
        } else {
          set({ items: [...items, { product, quantity: qty, size, color }] });
        }
      },

      removeItem: (index) =>
        set({ items: get().items.filter((_, i) => i !== index) }),

      updateQty: (index, qty) => {
        if (qty < 1) return;
        const updated = [...get().items];
        updated[index].quantity = qty;
        set({ items: updated });
      },

      clearCart: () => set({ items: [] }),

      total: () =>
        get().items.reduce((s, i) => s + i.product.price * i.quantity, 0),

      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "gg-cart" }
  )
);
