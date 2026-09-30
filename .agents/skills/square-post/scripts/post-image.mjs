#!/usr/bin/env node

import { parseArgs, printPublishSuccess, publish, resolveApiKey, uploadImage } from "./lib.mjs";

const args = process.argv.slice(2);

if (args.includes("--help")) {
  console.log(`Usage:
  node post-image.mjs --text <content> --images <paths>
  node post-image.mjs --text <content> --title <title> --cover <path>

Post short image content or an article with a cover image to Binance Square.

Options:
  --text <content> Post text content (required)
  --images <paths> Comma-separated image paths for short posts, max 4
  --title <title>  Article title. When present, publish as contentType=2
  --cover <path>   Cover image path for article posts with --title

Authentication:
  Set BINANCE_SQUARE_OPENAPI_KEY or save a key with scripts/save-key.mjs.`);
  process.exit(0);
}

const { text } = parseArgs(args, ["text"]);
const { title, images, cover } = parseArgs(args, [], ["title", "images", "cover"]);

if (title && images) {
  console.error("Error: article posts with --title use --cover, not --images");
  process.exit(1);
}
if (cover && !title) {
  console.error("Error: --cover requires --title");
  process.exit(1);
}

const imagePaths = title ? [] : images ? images.split(",").map((p) => p.trim()).filter(Boolean) : [];

if (title && !cover) {
  console.error("Error: article posts with --title require --cover <path>");
  process.exit(1);
}
if (title && cover.includes(",")) {
  console.error("Error: article posts support exactly one --cover image");
  process.exit(1);
}
if (!title && imagePaths.length === 0) {
  console.error("Error: --images is required for short image posts");
  process.exit(1);
}
if (imagePaths.length > 4) {
  console.error("Error: max 4 images allowed");
  process.exit(1);
}

const contentType = title ? 2 : 1;

try {
  const key = resolveApiKey(args);

  const body = { contentType, bodyTextOnly: text };
  if (title) {
    const coverUrl = await uploadImage(key, cover);
    body.title = title;
    body.cover = coverUrl;
  } else {
    const uploadedImages = [];
    for (const imgPath of imagePaths) {
      uploadedImages.push(await uploadImage(key, imgPath));
    }
    body.imageList = uploadedImages;
  }

  console.log("Publishing...");
  const result = await publish(key, body);
  printPublishSuccess(result);
} catch (err) {
  console.error(`\nFailed: ${err.message}`);
  process.exit(1);
}
