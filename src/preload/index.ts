import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// メイン（Node.js）とレンダラー（React）の中間に立つ特殊なスクリプト
if (process.contextIsolated) {
  try {
    // window.electron で Electron API を利用可能にする
    // 例：window.electron.ipcRenderer.send("ping")
    contextBridge.exposeInMainWorld("electron", electronAPI);

    contextBridge.exposeInMainWorld("api", {
      alertOnce: async (message: string) => {
        return await ipcRenderer.invoke("alert-once", message);
      },
      showMessageBox: async (message: string) => {
        return await ipcRenderer.invoke("show-message-box", message);
      },
      showConfirmBox: async (message: string) => {
        return (await ipcRenderer.invoke("show-confirm-box", message)) as boolean;
      },
      getCount: async (target: string) => {
        return await ipcRenderer.invoke("get-count", target);
      },
      incrementCount: async (target: string) => {
        return await ipcRenderer.invoke("increment-count", target);
      },
      decrementCount: async (target: string) => {
        return await ipcRenderer.invoke("decrement-count", target);
      },
      resetCount: async (target: string) => {
        return await ipcRenderer.invoke("reset-count", target);
      },
      setLimit: async (target: string, limit: number) => {
        return await ipcRenderer.invoke("set-limit", target, limit);
      },
      quitApp: () => ipcRenderer.send("quit-app"),
      getItems: async () => {
        return await ipcRenderer.invoke("get-items");
      },
      addItem: async (itemName: string) => {
        return await ipcRenderer.invoke("add-item", itemName);
      },
      deleteItem: async (itemName: string) => {
        return await ipcRenderer.invoke("delete-item", itemName);
      },
      getHistory: async () => {
        return await ipcRenderer.invoke("get-history");
      },
      deleteHistory: async () => {
        return await ipcRenderer.invoke("delete-history");
      }
    });
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
}
