import { create } from "zustand";
import { Item, MutationErrorCode } from "../../../shared/types";

/** 失敗の理由をダイアログ側で出し分けたいので、boolean ではなく code を返す */
export type RenameOutcome = { success: boolean; code?: MutationErrorCode };

interface ItemState {
  items: Item[];
  loading: boolean;
  error: boolean;
  loadItems: () => Promise<void>;
  addItem: (name: string) => Promise<boolean>;
  deleteItem: (name: string) => Promise<boolean>;
  renameItem: (oldName: string, newName: string) => Promise<RenameOutcome>;
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

  // 名前は React の key でもあるので、局所更新せず全再読込する（addItem / deleteItem と同じ）
  renameItem: async (oldName: string, newName: string) => {
    try {
      const result = await window.api.renameItem(oldName, newName);
      if (result.success) {
        await get().loadItems();
        return { success: true };
      }
      return { success: false, code: result.code };
    } catch {
      return { success: false };
    }
  },

  incrementCount: async (name: string) => {
    try {
      const newCount = await window.api.incrementCount(name);
      set((state) => ({
        items: state.items.map((i) => (i.name === name ? { ...i, count: newCount } : i))
      }));
    } catch {}
  },

  decrementCount: async (name: string) => {
    try {
      const newCount = await window.api.decrementCount(name);
      set((state) => ({
        items: state.items.map((i) => (i.name === name ? { ...i, count: newCount } : i))
      }));
    } catch {}
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
