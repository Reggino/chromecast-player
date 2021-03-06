import { createReadStream, statSync } from "fs";
import express from "express";
import cors from "cors";

let videoPath = "";
let subtitlePath = "";

// END OF CONFIG
export const mediaServerApp = express();

mediaServerApp.use(cors());

mediaServerApp.get("/subtitles", function (req, res) {
  res.setHeader("Content-Type", "text/vtt");
  res.sendFile(subtitlePath);
});
mediaServerApp.get("/video", function (req, res) {
  const { range = "" } = req.headers;
  if (!range) {
    res.status(400).send("Requires Range header");
  }
  const videoSize = statSync(videoPath).size;
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const videoStream = createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

export const setMediaServerVideoPath = (newVideoPath: string): void => {
  videoPath = newVideoPath;
};

export const setMediaServerSubtitlesPath = (newSubtitlesPath: string): void => {
  subtitlePath = newSubtitlesPath;
};
