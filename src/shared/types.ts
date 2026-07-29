export interface Item {
  name: string;
  count: number;
  limit: number;
  createdAt: number;
}

export interface HistoryEntry {
  name: string;
  count: number;
  limit: number;
}

/* <日付, 履歴エントリ> */
export type DailyHistory = Record<string, HistoryEntry[]>;

export interface MutationResult {
  success: boolean;
  error?: string;
}

export interface ItemMutationResult {
  success: boolean;
  error?: string;
  item?: Item;
}

/** JSONストレージに保存される値 */
export type StoredValue = number | string | Item;

export type DataStore = Record<string, StoredValue>;

export type HistoryStore = Record<string, HistoryEntry[]>;
