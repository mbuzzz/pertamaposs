import { create } from 'zustand';
import { Product, CartItem } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, cogsOverride?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number, cogsOverride?: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotalMargin: () => number;
  getTotalCOGS: () => number;
  getMarginPercentage: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product, quantity = 1, cogsOverride) => {
    const items = get().items;
    const existingItem = items.find((item) => item.product.id === product.id);

    const itemCOGS = cogsOverride ?? product.sellingPrice * 0.5;
    const itemMargin = product.sellingPrice - itemCOGS;

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      set({
        items: items.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: newQuantity,
                subtotal: newQuantity * product.sellingPrice,
                cogs: newQuantity * itemCOGS,
                margin: newQuantity * itemMargin,
              }
            : item
        ),
      });
    } else {
      set({
        items: [
          ...items,
          {
            product,
            quantity,
            subtotal: quantity * product.sellingPrice,
            cogs: quantity * itemCOGS,
            margin: quantity * itemMargin,
          },
        ],
      });
    }
  },

  removeItem: (productId) => {
    set({
      items: get().items.filter((item) => item.product.id !== productId),
    });
  },

  updateQuantity: (productId, quantity, cogsOverride) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    const items = get().items;
    const item = items.find((i) => i.product.id === productId);
    if (!item) return;

    const itemCOGS = cogsOverride ?? item.product.sellingPrice * 0.5;
    const itemMargin = item.product.sellingPrice - itemCOGS;

    set({
      items: items.map((i) =>
        i.product.id === productId
          ? {
              ...i,
              quantity,
              subtotal: quantity * item.product.sellingPrice,
              cogs: quantity * itemCOGS,
              margin: quantity * itemMargin,
            }
          : i
      ),
    });
  },

  clearCart: () => set({ items: [] }),

  getSubtotal: () => {
    return get().items.reduce((total, item) => total + item.subtotal, 0);
  },

  getTotalCOGS: () => {
    return get().items.reduce((total, item) => total + item.cogs, 0);
  },

  getTotalMargin: () => {
    return get().items.reduce((total, item) => total + item.margin, 0);
  },

  getMarginPercentage: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    return (get().getTotalMargin() / subtotal) * 100;
  },
}));
