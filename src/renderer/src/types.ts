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

export type DailyHistory = Record<string, HistoryEntry[]>;
