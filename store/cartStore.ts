import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Pack, Product } from "@/lib/types";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, qty?: number, size?: string | null, color?: string | null) => void;
  addPack: (pack: Pack, qty?: number) => void;
  removeItem: (index: number) => void;
  updateQty: (index: number, qty: number) => void;
  clearCart: () => void;
  total: () => number;
  count: () => number;
}

/** Produit « virtuel » représentant un pack dans le panier (nom, prix, image du pack). */
function packAsProduct(pack: Pack): Product {
  return {
    id: pack.id,
    name: `Pack ${pack.name}`,
    description: pack.description,
    price: pack.price,
    category: "Pack",
    sous_category: null,
    stock: pack.stock,
    images: pack.images?.length ? pack.images : pack.items.map((i) => i.product_image).filter(Boolean) as string[],
    sizes: [],
    colors: [],
    created_at: pack.created_at,
  };
}

/** Nom d'une ligne de panier tel qu'il apparaît sur la commande et la facture. */
export function cartItemLabel(item: CartItem): string {
  if (!item.packId || !item.packItems?.length) return item.product.name;
  const contents = item.packItems.map((i) => `${i.quantity}× ${i.product_name}`).join(", ");
  return `${item.product.name} (${contents})`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1, size = null, color = null) => {
        const items = get().items;
        const existing = items.findIndex(
          (i) => !i.packId && i.product.id === product.id && i.size === size && i.color === color
        );
        if (existing >= 0) {
          const updated = [...items];
          updated[existing].quantity += qty;
          set({ items: updated });
        } else {
          set({ items: [...items, { product, quantity: qty, size, color }] });
        }
      },

      addPack: (pack, qty = 1) => {
        const items = get().items;
        const existing = items.findIndex((i) => i.packId === pack.id);
        if (existing >= 0) {
          const updated = [...items];
          updated[existing].quantity += qty;
          set({ items: updated });
        } else {
          set({
            items: [...items, { product: packAsProduct(pack), quantity: qty, packId: pack.id, packItems: pack.items }],
          });
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
