#!/usr/bin/env node

import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";
import { parseArgs, api, uploadToS3, pollImageStatus, publish, getContentType, uploadImage, printPublishSuccess, resolveApiKey } from "./lib.mjs";

const args = process.argv.slice(2);

if (args.includes("--help")) {
  console.log(`Usage: node post-video.mjs --video <path> --duration <seconds> [--text <content>]

Post a video to Binance Square.

Options:
  --video <path>       Video file path (required)
  --duration <seconds> Video duration in seconds (required)
  --text <content>     Post text content (optional)

Authentication:
  Set BINANCE_SQUARE_OPENAPI_KEY or save a key with scripts/save-key.mjs.`);
  process.exit(0);
}

const { video, duration } = parseArgs(args, ["video", "duration"]);
const { text } = parseArgs(args, [], ["text"]);

const videoTimeSeconds = Number(duration);
if (isNaN(videoTimeSeconds) || videoTimeSeconds <= 0) {
  console.error("Error: --duration must be a positive number");
  process.exit(1);
}

function extractVideoCover(videoPath) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "square-video-cover-"));
  const coverPath = path.join(tempDir, `${path.parse(videoPath).name}-cover.png`);
  const result = spawnSync("ffmpeg", [
    "-y",
    "-loglevel",
    "error",
    "-i",
    videoPath,
    "-frames:v",
    "1",
    "-q:v",
    "2",
    coverPath,
  ], { encoding: "utf8" });

  if (result.error) {
    throw new Error(`Failed to run ffmpeg: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`Failed to extract video cover: ${result.stderr || "ffmpeg exited with an error"}`);
  }
  if (!fs.existsSync(coverPath) || fs.statSync(coverPath).size === 0) {
    throw new Error("Failed to extract video cover: empty cover file");
  }

  return { coverPath, tempDir };
}

function cleanupCover(coverPath, tempDir) {
  if (coverPath && fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
  if (tempDir && fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
}

let coverPath;
let coverTempDir;

try {
  const key = resolveApiKey(args);

  const fileName = path.basename(video);
  const size = fs.statSync(video).size;
  const contentTypeHeader = getContentType(video);

  console.log(`Uploading video: ${fileName} (${(size / 1024 / 1024).toFixed(1)}MB)`);
  const { presignedUrl, fileTicket } = await api("/video/preSign", key, { fileName, size });

  await uploadToS3(presignedUrl, video, contentTypeHeader);
  console.log(`  Uploaded to S3, polling status...`);

  await pollImageStatus(key, fileTicket);
  console.log(`  Video processed.`);

  console.log("Extracting video cover...");
  ({ coverPath, tempDir: coverTempDir } = extractVideoCover(video));
  const cover = await uploadImage(key, coverPath);

  console.log("Publishing...");
  const body = {
    contentType: 3,
    fileTicket,
    cover,
    videoTimeSeconds,
    isPublish: true,
  };
  if (text) body.bodyTextOnly = text;

  const result = await publish(key, body);

  printPublishSuccess(result);
} catch (err) {
  console.error(`\nFailed: ${err.message}`);
  process.exitCode = 1;
} finally {
  cleanupCover(coverPath, coverTempDir);
}
