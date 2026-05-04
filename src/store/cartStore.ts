import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  artworkId: string;
  title: string;
  artistName: string;
  price: number;
  currency: string;
  imageUrl: string;
  quantity: number;
  slug: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (artworkId: string) => void;
  updateQuantity: (artworkId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.artworkId === item.artworkId);
          if (existing) return state;
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },
      removeItem: (artworkId) =>
        set((state) => ({ items: state.items.filter((i) => i.artworkId !== artworkId) })),
      updateQuantity: (artworkId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.artworkId === artworkId ? { ...i, quantity } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "atos-art-cart" }
  )
);
