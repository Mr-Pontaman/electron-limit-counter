import type { ElectronAPI } from "@electron-toolkit/preload";
import type {
  Item,
  HistoryEntry,
  DailyHistory,
  MutationResult,
  ItemMutationResult
} from "../../shared/types";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: CustomAPI;
  }
}

// レンダラープロセスで window.api を通じて利用する型 - メインプロセスとの通信インターフェースをここで宣言する。
interface CustomAPI {
  /** Ubuntuだと日本語は豆腐になるので英語だけ渡すこと */
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
