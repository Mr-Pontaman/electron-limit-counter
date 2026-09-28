import fs from "fs";
import { ipcMain } from "electron";
import { itemNameSchema, itemSchema, limitSchema, renameSchema } from "../schemas";
import { loadData, saveData, loadHistory, saveHistory, HISTORY_PATH } from "../store";
import { ensureDailyReset } from "../dailyReset";
import { Item } from "../../shared/types";
import { IPC_CHANNELS } from "../../shared/ipc-channels";

export const registerHandleCount = () => {
  ipcMain.handle(IPC_CHANNELS.GET_ITEMS, async () => {
    const data = ensureDailyReset(loadData());
    const items: Item[] = [];
    for (const [, value] of Object.entries(data)) {
      if (typeof value === "object" && value !== null && "name" in value && "count" in value) {
        items.push(value as Item);
      }
    }
    return items;
  });

  ipcMain.handle(IPC_CHANNELS.ADD_ITEM, async (_e, itemName: string) => {
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

  ipcMain.handle(IPC_CHANNELS.DELETE_ITEM, async (_e, itemName: string) => {
    const data = ensureDailyReset(loadData());
    const parsedName = itemSchema.safeParse({ itemName });
    if (!parsedName.success) {
      return { success: false, error: parsedName.error.message };
    }
    const itemKey = `item:${parsedName.data.itemName}`;

    if (!(itemKey in data)) {
      return { success: false, error: `Item "${itemName}" not found` };
    }

    const { [itemKey]: _, ...newData } = data;

    saveData(newData);
    return { success: true };
  });

  // 名前は保存キーそのもの（item:<名前>）なので、リネームはキーの付け替えになる。
  // 履歴は各エントリが名前を文字列で持っていて、履歴画面はその名前でグラフを描くので、
  // ここで全期間を書き換えないとカードが新旧2枚に分裂する。
  ipcMain.handle(IPC_CHANNELS.RENAME_ITEM, async (_e, oldName: string, newName: string) => {
    const data = ensureDailyReset(loadData());
    const parsed = renameSchema.safeParse({ oldName, newName });
    if (!parsed.success) {
      return { success: false, error: parsed.error.message, code: "invalid" };
    }
    const from = parsed.data.oldName;
    const to = parsed.data.newName;
    const fromKey = `item:${from}`;
    const toKey = `item:${to}`;

    // 変更なし。UI 側でも保存ボタンを無効にしているが、念のため
    if (from === to) {
      return { success: true, item: data[fromKey] as Item };
    }

    if (!(fromKey in data)) {
      return { success: false, error: `Item "${from}" not found`, code: "not-found" };
    }
    // 移動先が埋まっていると既存アイテムを潰すので弾く。旧形式のベタ書きキーも見る
    if (toKey in data || typeof data[to] === "number") {
      return { success: false, error: `Item "${to}" already exists`, code: "duplicate" };
    }

    const renamed: Item = { ...(data[fromKey] as Item), name: to };
    delete data[fromKey];
    data[toKey] = renamed;

    // 旧形式のキー（ベタ書きの数値カウンタ / limit:）も揃えて移す
    if (typeof data[from] === "number") {
      data[to] = data[from];
      delete data[from];
    }
    if (`limit:${from}` in data) {
      data[`limit:${to}`] = data[`limit:${from}`];
      delete data[`limit:${from}`];
    }

    saveData(data);

    const history = loadHistory();
    let historyChanged = false;
    for (const entries of Object.values(history)) {
      for (const entry of entries) {
        if (entry.name === from) {
          entry.name = to;
          historyChanged = true;
        }
      }
    }
    if (historyChanged) {
      saveHistory(history);
    }

    return { success: true, item: renamed };
  });

  ipcMain.handle(IPC_CHANNELS.GET_COUNT, async (_e, target: string) => {
    const data = ensureDailyReset(loadData());
    const targetItem = itemSchema.safeParse({ itemName: target });
    if (!targetItem.success) {
      return typeof data[target] === "number" ? data[target] : 0;
    }
    const targetItemName = targetItem.data.itemName;
    const itemKey = `item:${targetItemName}`;

    if (itemKey in data) {
      return (data[itemKey] as Item).count;
    }

    return typeof data[target] === "number" ? data[target] : 0;
  });

  ipcMain.handle(IPC_CHANNELS.INCREMENT_COUNT, async (_e, target: string) => {
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

  ipcMain.handle(IPC_CHANNELS.DECREMENT_COUNT, async (_e, target: string) => {
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

  ipcMain.handle(IPC_CHANNELS.RESET_COUNT, async (_e, target: string) => {
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

  ipcMain.handle(IPC_CHANNELS.SET_LIMIT, async (_e, target: string, limit: number) => {
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

  ipcMain.handle(IPC_CHANNELS.GET_HISTORY, async () => {
    return loadHistory();
  });

  ipcMain.handle(IPC_CHANNELS.DELETE_HISTORY, async () => {
    if (fs.existsSync(HISTORY_PATH)) {
      // ファイルの削除
      fs.unlinkSync(HISTORY_PATH);
    }
    return { success: true };
  });
};
