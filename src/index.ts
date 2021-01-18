// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../types/castv2-client.d.ts" />

import { app, BrowserWindow, ipcMain } from "electron";
import { Client, DefaultMediaReceiver } from "castv2-client";

declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("start", function (event, chromecast, job) {
  console.log(chromecast, job);
  const client = new Client();
  client.connect(chromecast.ip, () => {
    client.launch(DefaultMediaReceiver, (err: Error, player: any) => {
      if (err) {
        throw err;
      }
      player.load(job, { autoplay: true }, (err: Error, status: any) => {
        if (err) {
          throw err;
        }
        ipcMain.emit("start-response", status);
      });
    });
  });
});
