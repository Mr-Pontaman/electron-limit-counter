import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { IPC_CHANNELS } from "../shared/ipc-channels";

// メイン（Node.js）とレンダラー（React）の中間に立つ特殊なスクリプト
if (process.contextIsolated) {
  try {
    // window.electron で Electron API を利用可能にする - 例：window.electron.ipcRenderer.send("ping")
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", {
      showMessageBox: async (message: string) => {
        return await ipcRenderer.invoke(IPC_CHANNELS.SHOW_MESSAGE_BOX, message);
      },
      getCount: async (target: string) => {
        return await ipcRenderer.invoke(IPC_CHANNELS.GET_COUNT, target);
      },
      incrementCount: async (target: string) => {
        return await ipcRenderer.invoke(IPC_CHANNELS.INCREMENT_COUNT, target);
      },
      decrementCount: async (target: string) => {
        return await ipcRenderer.invoke(IPC_CHANNELS.DECREMENT_COUNT, target);
      },
      resetCount: async (target: string) => {
        return await ipcRenderer.invoke(IPC_CHANNELS.RESET_COUNT, target);
      },
      setLimit: async (target: string, limit: number) => {
        return await ipcRenderer.invoke(IPC_CHANNELS.SET_LIMIT, target, limit);
      },
      quitApp: () => ipcRenderer.send(IPC_CHANNELS.QUIT_APP),
      getItems: async () => {
        return await ipcRenderer.invoke(IPC_CHANNELS.GET_ITEMS);
      },
      addItem: async (itemName: string) => {
        return await ipcRenderer.invoke(IPC_CHANNELS.ADD_ITEM, itemName);
      },
      deleteItem: async (itemName: string) => {
        return await ipcRenderer.invoke(IPC_CHANNELS.DELETE_ITEM, itemName);
      },
      getHistory: async () => {
        return await ipcRenderer.invoke(IPC_CHANNELS.GET_HISTORY);
      },
      deleteHistory: async () => {
        return await ipcRenderer.invoke(IPC_CHANNELS.DELETE_HISTORY);
      }
    });
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
}
