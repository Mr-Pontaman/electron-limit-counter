/** アイテム基本型（main, preload, renderer で共用） */
export interface Item {
  name: string;
  count: number;
  limit: number;
  createdAt: number;
}

/** 履歴エントリ */
export interface HistoryEntry {
  name: string;
  count: number;
  limit: number;
}

/** 日付→履歴エントリ配列 のマップ */
export type DailyHistory = Record<string, HistoryEntry[]>;

/** 汎用ミューテーション結果 */
export interface MutationResult {
  success: boolean;
  error?: string;
}

/** アイテム追加・削除の結果 */
export interface ItemMutationResult {
  success: boolean;
  error?: string;
  item?: Item;
}

// ---- メインプロセス内部用（store.ts / dailyReset.ts で使う） ----

/** JSONストレージに保存される値のユニオン */
export type StoredValue = number | string | Item;

/** DataStore = Record<string, StoredValue> */
export type DataStore = Record<string, StoredValue>;

/** HistoryStore = Record<string, HistoryEntry[]> */
export type HistoryStore = Record<string, HistoryEntry[]>;
