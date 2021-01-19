// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../types/castv2-client.d.ts" />
import { app, BrowserWindow, ipcMain } from "electron";
import { Client, DefaultMediaReceiver } from "castv2-client";
import {
  mediaServerApp,
  setMediaServerSubtitlesPath,
  setMediaServerVideoPath,
} from "./mediaServer";
import { networkInterfaces } from "os";
import getPort from "get-port";

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

// PLAYER STUFF
let mediaServerPort = 0;
getPort().then((port) => {
  mediaServerPort = port;
  mediaServerApp.listen(port);
});

const nets = networkInterfaces();
const localIpAddresses = Object.values(nets).reduce<string[]>(
  (prev, ips = []) => {
    ips.forEach((ip) => {
      if (
        ip.family === "IPv4" &&
        ip.internal === false &&
        !ip.address.startsWith("172.17.0")
      ) {
        prev.push(ip.address);
      }
    });
    return prev;
  },
  []
);
console.log(`Found local IP address: ${localIpAddresses.join(", ")}`);

ipcMain.handle(
  "startVideo",
  function (event, chromecast, videoPath, subtitlesPath) {
    setMediaServerVideoPath(videoPath);
    setMediaServerSubtitlesPath(subtitlesPath);
    const chromecastIpNibbles = chromecast.ip.split(".") || [];
    const matchLength = localIpAddresses.map((ip) => {
      let nibblePointer = 0;
      const nibbles = ip.split(".");
      while (nibbles[nibblePointer] === chromecastIpNibbles[nibblePointer]) {
        nibblePointer++;
      }
      return nibblePointer;
    });
    const bestMatchIndex = matchLength.indexOf(Math.max(...matchLength));
    const localIpAddress = localIpAddresses[bestMatchIndex];

    return new Promise((resolve, reject) => {
      const client = new Client();
      client.connect(chromecast.ip, (err: Error) => {
        if (err) {
          reject(err);
          return;
        }
        console.log("Chomecast connected, launching DefaultMediaReceiver");
        client.launch(DefaultMediaReceiver, (err: Error, player: any) => {
          if (err) {
            reject(err);
            return;
          }
          console.log("Player launched, starting movie");

          const job = {
            // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
            contentId: `http://${localIpAddress}:${mediaServerPort}/video`,
            contentType: videoPath.match(/\.mp4$/i)
              ? "video/mp4"
              : "video/webm",
            streamType: "BUFFERED", // or LIVE
            // // Title and cover displayed while buffering
            metadata: {
              type: 0,
              metadataType: 0,
              title: videoPath.split(/[/\\]/).pop(),
              //   images: [
              //     {
              //       url:
              //         "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
              //     },
              //   ],
            },
          };

          if (subtitlesPath) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            job.tracks = [
              {
                trackId: 1, // This is an unique ID, used to reference the track
                type: "TEXT", // Default Media Receiver currently only supports TEXT
                trackContentId: `http://${localIpAddress}:${mediaServerPort}/subtitles`, // the URL of the VTT (enabled CORS and the correct ContentType are required)
                trackContentType: "text/vtt", // Currently only VTT is supported
                name: "English", // a Name for humans
                language: "en-US", // the language
                subtype: "SUBTITLES", // should be SUBTITLES
              },
            ];
          }
          console.log(job);
          player.load(job, { autoplay: true }, (err: Error, status: any) => {
            if (err) {
              reject(err);
              return;
            }
            console.log("Movie started, sending feedback to renderProc");
            resolve(status);
          });
        });
      });
    });
  }
);
