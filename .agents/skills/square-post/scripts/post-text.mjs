#!/usr/bin/env node

import { parseArgs, printPublishSuccess, publish, resolveApiKey } from "./lib.mjs";

const args = process.argv.slice(2);

if (args.includes("--help")) {
  console.log(`Usage: node post-text.mjs --text <content> [--title <title>]

Post text content to Binance Square as a short post or long article.

Options:
  --text <content> Post text content (required)
  --title <title>  Article title. When present, publish as contentType=2 (optional)

Authentication:
  Set BINANCE_SQUARE_OPENAPI_KEY or save a key with scripts/save-key.mjs.`);
  process.exit(0);
}

const { text } = parseArgs(args, ["text"]);
const { title } = parseArgs(args, [], ["title"]);

const contentType = title ? 2 : 1;

try {
  const key = resolveApiKey(args);

  console.log(contentType === 2 ? "Publishing article..." : "Publishing text post...");
  const body = {
    contentType,
    bodyTextOnly: text,
  };
  if (title) body.title = title;

  const result = await publish(key, body);
  printPublishSuccess(result);
} catch (err) {
  console.error(`\nFailed: ${err.message}`);
  process.exit(1);
}
