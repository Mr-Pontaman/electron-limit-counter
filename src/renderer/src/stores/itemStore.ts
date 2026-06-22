import { create } from "zustand";
import type { Item } from "@renderer/types";

interface ItemState {
  items: Item[];
  loading: boolean;
  error: boolean;
  loadItems: () => Promise<void>;
  addItem: (name: string) => Promise<boolean>;
  deleteItem: (name: string) => Promise<boolean>;
  incrementCount: (name: string) => Promise<void>;
  decrementCount: (name: string) => Promise<void>;
  setLimit: (name: string, limit: number) => Promise<boolean>;
}

export const useItemStore = create<ItemState>((set, get) => ({
  items: [],
  loading: false,
  error: false,

  loadItems: async () => {
    set({ loading: true, error: false });
    try {
      const items = await window.api.getItems();
      set({ items: items || [], loading: false });
    } catch {
      set({ error: true, loading: false });
    }
  },

  addItem: async (name: string) => {
    try {
      const result = await window.api.addItem(name);
      if (result.success) {
        await get().loadItems();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  deleteItem: async (name: string) => {
    try {
      const result = await window.api.deleteItem(name);
      if (result.success) {
        await get().loadItems();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  incrementCount: async (name: string) => {
    try {
      const newCount = await window.api.incrementCount(name);
      set((state) => ({
        items: state.items.map((i) => (i.name === name ? { ...i, count: newCount } : i))
      }));
    } catch {
      /* silent */
    }
  },

  decrementCount: async (name: string) => {
    try {
      const newCount = await window.api.decrementCount(name);
      set((state) => ({
        items: state.items.map((i) => (i.name === name ? { ...i, count: newCount } : i))
      }));
    } catch {
      /* silent */
    }
  },

  setLimit: async (name: string, limit: number) => {
    try {
      const result = await window.api.setLimit(name, limit);
      if (result.success) {
        set((state) => ({
          items: state.items.map((i) => (i.name === name ? { ...i, limit } : i))
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}));
