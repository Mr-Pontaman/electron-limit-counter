/**
 * IPC ハンドラ — アプリ全体の操作
 *
 * index.ts から分離した show-message-box / quit-app を集約。
 */
import { app, BrowserWindow, dialog, ipcMain } from "electron";

export const registerHandleApp = () => {
  ipcMain.handle("show-message-box", async (_e, message: string) => {
    const win = BrowserWindow.getFocusedWindow();
    await dialog.showMessageBox(win!, {
      type: "info",
      buttons: ["OK"],
      message: message,
      detail: ""
    });
  });

  ipcMain.on("quit-app", () => {
    app.quit();
  });
};
