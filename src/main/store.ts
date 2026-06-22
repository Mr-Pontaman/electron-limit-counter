/**
 * データ永続化層
 *
 * log.json / history.json の読み書きを担当。
 * ファイルパスやメタキーの定数もここで一元管理する。
 */
import { app } from "electron";
import { join } from "path";
import fs from "fs";
import { DataStore, HistoryStore } from "../shared/types";

// ---- パス & 定数 ----

export const DATA_PATH = join(app.getPath("userData"), "log.json");
export const HISTORY_PATH = join(app.getPath("userData"), "history.json");
export const META_LAST_RESET_KEY = "__meta:lastResetDate";

// ---- データストア I/O ----

export const loadData = (): DataStore => {
  if (!fs.existsSync(DATA_PATH)) {
    return {};
  }
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
};

export const saveData = (data: DataStore): void => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

// ---- 履歴ストア I/O ----

export const loadHistory = (): HistoryStore => {
  if (!fs.existsSync(HISTORY_PATH)) {
    return {};
  }
  const raw = fs.readFileSync(HISTORY_PATH, "utf-8");
  return JSON.parse(raw) as HistoryStore;
};

export const saveHistory = (history: HistoryStore): void => {
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), "utf-8");
};
