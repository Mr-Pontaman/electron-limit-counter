import { ElectronAPI } from "@electron-toolkit/preload";

interface Item {
  name: string;
  count: number;
  limit: number;
  createdAt: number;
}

interface ItemMutationResult {
  success: boolean;
  error?: string;
  item?: Item;
}

interface MutationResult {
  success: boolean;
  error?: string;
}

interface HistoryEntry {
  name: string;
  count: number;
  limit: number;
}

type DailyHistory = Record<string, HistoryEntry[]>;

interface CustomAPI {
  alertOnce: (message: string) => Promise<unknown>;
  // Ubuntuだと日本語は豆腐になるので英語だけ渡す。
  showMessageBox: (message: string) => Promise<void>;
  getCount: (target: string) => Promise<number>;
  incrementCount: (target: string) => Promise<number>;
  decrementCount: (target: string) => Promise<number>;
  resetCount: (target: string) => Promise<number>;
  setLimit: (target: string, limit: number) => Promise<MutationResult>;
  getItems: () => Promise<Item[]>;
  addItem: (itemName: string) => Promise<ItemMutationResult>;
  deleteItem: (itemName: string) => Promise<ItemMutationResult>;
  getHistory: () => Promise<DailyHistory>;
  deleteHistory: () => Promise<MutationResult>;
  quitApp: () => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: CustomAPI;
  }
}
