import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc-channels";

export const registerHandleApp = () => {
  ipcMain.handle(IPC_CHANNELS.SHOW_MESSAGE_BOX, async (_e, message: string) => {
    const win = BrowserWindow.getFocusedWindow();
    await dialog.showMessageBox(win!, {
      type: "info",
      buttons: ["OK"],
      message: message,
      detail: ""
    });
  });

  ipcMain.on(IPC_CHANNELS.QUIT_APP, () => {
    app.quit();
  });
};
