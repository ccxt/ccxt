#!/usr/bin/env node

import { maskApiKey, saveApiKey } from "./lib.mjs";

const args = process.argv.slice(2);

if (args.includes("--help")) {
  console.log(`Usage: BINANCE_SQUARE_OPENAPI_KEY=<apiKey> node scripts/save-key.mjs

Save the Binance Square OpenAPI key to a local user config file with 0600 permissions.

Authentication:
  Read the key from BINANCE_SQUARE_OPENAPI_KEY. Do not pass keys as CLI arguments.`);
  process.exit(0);
}

if (args.length > 0) {
  console.error("Error: do not pass API keys as CLI arguments. Set BINANCE_SQUARE_OPENAPI_KEY instead.");
  process.exit(1);
}

const key = process.env.BINANCE_SQUARE_OPENAPI_KEY?.trim();
if (!key) {
  console.error("Error: BINANCE_SQUARE_OPENAPI_KEY is required.");
  process.exit(1);
}

try {
  const keyFile = saveApiKey(key);
  console.log(`Saved Square OpenAPI key ${maskApiKey(key)} to ${keyFile}`);
} catch (err) {
  console.error(`Failed: ${err.message}`);
  process.exit(1);
}
