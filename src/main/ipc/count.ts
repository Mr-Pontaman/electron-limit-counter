import fs from "fs";
import { ipcMain } from "electron";
import { itemNameSchema, itemSchema, limitSchema } from "../schemas";
import { loadData, saveData, loadHistory, HISTORY_PATH } from "../store";
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
