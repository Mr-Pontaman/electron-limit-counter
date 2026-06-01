import { app } from "electron";
import { join } from "path";
import fs from "fs";
import { ipcMain } from "electron";
import { itemNameSchema, itemSchema, limitSchema } from "../schemas";

// new Notification({
//   body: `get-count for ${target ?? "Item"}, current counts: ${data[target] ?? 0}`,
//   title: "Debug Notification"
// }).show();

interface Item {
  name: string;
  count: number;
  limit: number;
  createdAt: number;
}

type StoredValue = number | string | Item;
type DataStore = Record<string, StoredValue>;

interface HistoryEntry {
  name: string;
  count: number;
  limit: number;
}

type HistoryStore = Record<string, HistoryEntry[]>;

export const registerHandleCount = () => {
  const dataPath = join(app.getPath("userData"), "log.json");
  const historyPath = join(app.getPath("userData"), "history.json");
  const META_LAST_RESET_KEY = "__meta:lastResetDate";

  const getLocalDateKey = (): string => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const isItem = (value: StoredValue): value is Item => {
    return typeof value === "object" && value !== null && "name" in value && "count" in value;
  };

  const loadData = (): DataStore => {
    if (!fs.existsSync(dataPath)) {
      return {};
    }
    const raw = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(raw);
  };

  const saveData = (data: DataStore) => {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf-8");
  };

  const loadHistory = (): HistoryStore => {
    if (!fs.existsSync(historyPath)) {
      return {};
    }
    const raw = fs.readFileSync(historyPath, "utf-8");
    return JSON.parse(raw) as HistoryStore;
  };

  const saveHistory = (history: HistoryStore) => {
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), "utf-8");
  };

  const archiveDayToHistory = (data: DataStore, date: string) => {
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

  const ensureDailyReset = (data: DataStore): DataStore => {
    const today = getLocalDateKey();
    const lastReset =
      typeof data[META_LAST_RESET_KEY] === "string" ? data[META_LAST_RESET_KEY] : "";

    if (lastReset === today) {
      return data;
    }

    // リセット前に昨日のデータを履歴に保存
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

  ipcMain.handle("get-items", async () => {
    const data = ensureDailyReset(loadData());
    const items: Item[] = [];

    for (const [, value] of Object.entries(data)) {
      if (isItem(value)) {
        items.push(value);
      }
    }

    return items;
  });

  ipcMain.handle("add-item", async (_e, itemName: string) => {
    const data = ensureDailyReset(loadData());
    const parsedName = itemSchema.safeParse({ itemName });
    if (!parsedName.success) {
      return { success: false, error: parsedName.error.message };
    }
    const itemKey = `item:${parsedName.data.itemName}`;

    if (itemKey in data) {
      return { success: false, error: `Item "${parsedName.data.itemName}" already exists` };
    }

    const newItem: Item = {
      name: parsedName.data.itemName,
      count: 0,
      limit: 10,
      createdAt: Date.now()
    };

    data[itemKey] = newItem;
    saveData(data);

    return { success: true, item: newItem };
  });

  ipcMain.handle("delete-item", async (_e, itemName: string) => {
    const data = ensureDailyReset(loadData());
    const parsedName = itemSchema.safeParse({ itemName });
    if (!parsedName.success) {
      return { success: false, error: parsedName.error.message };
    }
    const itemKey = `item:${parsedName.data.itemName}`;

    if (!(itemKey in data)) {
      return { success: false, error: `Item "${itemName}" not found` };
    }

    delete data[itemKey];
    saveData(data);

    return { success: true };
  });

  ipcMain.handle("get-count", async (_e, target: string) => {
    const data = ensureDailyReset(loadData());
    const targetItem = itemSchema.safeParse({ itemName: target });
    if (!targetItem.success) {
      return typeof data[target] === "number" ? data[target] : 0;
    }
    const targetItemName = targetItem.data.itemName;
    const itemKey = `item:${targetItemName}`;

    if (itemKey in data) {
      const item = data[itemKey] as Item;
      return item.count;
    }

    return typeof data[target] === "number" ? data[target] : 0;
  });

  ipcMain.handle("increment-count", async (_e, target: string) => {
    const data = ensureDailyReset(loadData());
    const parsedTarget = itemNameSchema.safeParse(target);
    if (!parsedTarget.success) {
      return 0;
    }
    const targetItemName = parsedTarget.data;
    const itemKey = `item:${targetItemName}`;

    if (itemKey in data) {
      const item = data[itemKey] as Item;
      item.count += 1;
      saveData(data);
      return item.count;
    }

    const currentCount = typeof data[targetItemName] === "number" ? data[targetItemName] : 0;
    const nextCount = currentCount + 1;
    data[targetItemName] = nextCount;
    saveData(data);
    return nextCount;
  });

  ipcMain.handle("decrement-count", async (_e, target: string) => {
    const data = ensureDailyReset(loadData());
    const parsedTarget = itemNameSchema.safeParse(target);
    if (!parsedTarget.success) {
      return 0;
    }
    const targetItemName = parsedTarget.data;
    const itemKey = `item:${targetItemName}`;

    if (itemKey in data) {
      const item = data[itemKey] as Item;
      item.count -= 1;
      saveData(data);
      return item.count;
    }

    const currentCount = typeof data[targetItemName] === "number" ? data[targetItemName] : 0;
    const nextCount = currentCount - 1;
    data[targetItemName] = nextCount;
    saveData(data);
    return nextCount;
  });

  ipcMain.handle("reset-count", async (_e, target: string) => {
    const data = ensureDailyReset(loadData());
    const parsedTarget = itemNameSchema.safeParse(target);
    if (!parsedTarget.success) {
      return 0;
    }
    const targetItemName = parsedTarget.data;
    const itemKey = `item:${targetItemName}`;

    if (itemKey in data) {
      const item = data[itemKey] as Item;
      item.count = 0;
      saveData(data);
      return item.count;
    }

    data[targetItemName] = 0;
    saveData(data);
    return 0;
  });

  ipcMain.handle("set-limit", async (_e, target: string, limit: number) => {
    const data = ensureDailyReset(loadData());
    const parsedTarget = itemNameSchema.safeParse(target);
    if (!parsedTarget.success) {
      return { success: false, error: parsedTarget.error.message };
    }
    const parsedLimit = limitSchema.safeParse(limit);
    if (!parsedLimit.success) {
      return { success: false, error: parsedLimit.error.message };
    }

    const targetItemName = parsedTarget.data;
    const validatedLimit = parsedLimit.data;
    const itemKey = `item:${targetItemName}`;

    if (itemKey in data) {
      const item = data[itemKey] as Item;
      item.limit = validatedLimit;
      saveData(data);
      return { success: true };
    }

    data[`limit:${targetItemName}`] = validatedLimit;
    saveData(data);
    return { success: true };
  });

  ipcMain.handle("get-history", async () => {
    return loadHistory();
  });

  ipcMain.handle("delete-history", async () => {
    if (fs.existsSync(historyPath)) {
      fs.unlinkSync(historyPath);
    }
    return { success: true };
  });
};

/*
JSON Storage Format:
{
  "item:タバコ": {
    "name": "タバコ",
    "count": 10,
    "limit": 5,
    "createdAt": 1234567890
  },
  "item:ビール": {
    "name": "ビール",
    "count": 3,
    "limit": 2,
    "createdAt": 1234567891
  }
}
*/
