import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
import { autoUpdater } from "electron-updater"; // 💡 これをインポート
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { registerHandleCount } from "./ipc/count";

// 純粋なNodejs
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      // security: isolate renderer and disable node integration
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  autoUpdater.checkForUpdatesAndNotify();

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

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

  createWindow();

  registerHandleCount();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// for applications and their menu bar to stay active until the user quits
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
