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

/** 失敗の理由。renderer 側でメッセージを出し分けるために使う */
export type MutationErrorCode = "not-found" | "duplicate" | "invalid";

export interface MutationResult {
  success: boolean;
  error?: string;
  code?: MutationErrorCode;
}

export interface ItemMutationResult {
  success: boolean;
  error?: string;
  code?: MutationErrorCode;
  item?: Item;
}

export type StoredValue = number | string | Item;

export type DataStore = Record<string, StoredValue>;

export type HistoryStore = Record<string, HistoryEntry[]>;
