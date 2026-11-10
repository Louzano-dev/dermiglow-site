import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ShopifyProduct } from "@/lib/shopify";

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}
interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: null;
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => null;
  refreshCheckoutUrl: () => Promise<null>;
}
export const useCartStore = create<CartStore>()(persist((set, get) => ({
  items: [], cartId: null, checkoutUrl: null, isLoading: false, isSyncing: false,
  addItem: async (item) => {
    if (!item.variantId.startsWith("demo-variant-") || item.quantity <= 0) return;
    const existing = get().items.find((entry) => entry.variantId === item.variantId);
    set({ cartId: "portfolio-demo", items: existing
      ? get().items.map((entry) => entry.variantId === item.variantId ? { ...entry, quantity: entry.quantity + item.quantity } : entry)
      : [...get().items, { ...item, lineId: item.variantId }] });
  },
  updateQuantity: async (variantId, quantity) => {
    if (quantity <= 0) { await get().removeItem(variantId); return; }
    set({ items: get().items.map((item) => item.variantId === variantId ? { ...item, quantity } : item) });
  },
  removeItem: async (variantId) => {
    const items = get().items.filter((item) => item.variantId !== variantId);
    set({ items, cartId: items.length ? "portfolio-demo" : null });
  },
  clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
  syncCart: async () => {},
  getCheckoutUrl: () => null,
  refreshCheckoutUrl: async () => null,
}), {
  name: "dermiglow-portfolio-cart",
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ items: state.items, cartId: state.cartId }),
}));
