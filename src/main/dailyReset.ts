/**
 * 日次リセット & 履歴アーカイブ
 */
import type { DataStore, HistoryEntry, StoredValue } from "../shared/types";
import type { Item } from "../shared/types";
import { loadHistory, saveHistory, saveData, META_LAST_RESET_KEY } from "./store";

// ---- 型ガード ----

export const isItem = (value: StoredValue): value is Item => {
  return typeof value === "object" && value !== null && "name" in value && "count" in value;
};

// ---- ユーティリティ ----

export const getLocalDateKey = (): string => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// ---- 履歴アーカイブ ----

export const archiveDayToHistory = (data: DataStore, date: string): void => {
  const entries: HistoryEntry[] = [];
  for (const [, value] of Object.entries(data)) {
    if (isItem(value)) {
      entries.push({ name: value.name, count: value.count, limit: value.limit });
    }
  }
  if (entries.length === 0) return;
  const history = loadHistory();
  history[date] = entries;
  saveHistory(history);
};

// ---- 日次リセット ----

export const ensureDailyReset = (data: DataStore): DataStore => {
  const today = getLocalDateKey();
  const lastReset =
    typeof data[META_LAST_RESET_KEY] === "string" ? data[META_LAST_RESET_KEY] : "";

  if (lastReset === today) {
    return data;
  }

  if (lastReset !== "") {
    archiveDayToHistory(data, lastReset);
  }

  for (const [key, value] of Object.entries(data)) {
    if (isItem(value)) {
      value.count = 0;
      continue;
    }
    if (typeof value === "number" && !key.startsWith("limit:")) {
      data[key] = 0;
    }
  }

  data[META_LAST_RESET_KEY] = today;
  saveData(data);
  return data;
};
