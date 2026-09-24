import fs from "fs";
import os from "os";
import path from "path";

const BASE_URL_V1 = "https://www.binance.com/bapi/composite/v1/public/pgc/openApi";
const BASE_URL_V2 = "https://www.binance.com/bapi/composite/v2/public/pgc/openApi";
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_RETRIES = 10;
const CONFIG_DIR = path.join(os.homedir(), ".config", "binance-square");
const CONFIG_FILE = path.join(CONFIG_DIR, "openapi-key");

const CONTENT_TYPE_MAP = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  mp4: "video/mp4",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  webm: "video/webm",
};

export function getContentType(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return CONTENT_TYPE_MAP[ext] || "application/octet-stream";
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getConfigFilePath() {
  return CONFIG_FILE;
}

export function maskApiKey(apiKey) {
  if (!apiKey) return "";
  if (apiKey.length <= 9) return `${apiKey.slice(0, 2)}...`;
  return `${apiKey.slice(0, 5)}...${apiKey.slice(-4)}`;
}

export function readSavedApiKey() {
  const keyFile = getConfigFilePath();
  if (!fs.existsSync(keyFile)) return "";
  return fs.readFileSync(keyFile, "utf8").trim();
}

export function saveApiKey(apiKey) {
  const key = apiKey.trim();
  if (!key) {
    throw new Error("Missing Square OpenAPI key");
  }

  const keyFile = getConfigFilePath();
  fs.mkdirSync(path.dirname(keyFile), { recursive: true, mode: 0o700 });
  fs.writeFileSync(keyFile, `${key}\n`, { mode: 0o600 });
  fs.chmodSync(keyFile, 0o600);
  return keyFile;
}

export function resolveApiKey(args = []) {
  if (args.includes("--key")) {
    throw new Error("Do not pass API keys with --key. Set BINANCE_SQUARE_OPENAPI_KEY or save the key locally first.");
  }

  const envKey = process.env.BINANCE_SQUARE_OPENAPI_KEY;
  if (envKey?.trim()) return envKey.trim();

  const savedKey = readSavedApiKey();
  if (savedKey) return savedKey;

  throw new Error(
    `Missing Square OpenAPI key. Set BINANCE_SQUARE_OPENAPI_KEY or save it to ${getConfigFilePath()} first.`,
  );
}

export async function api(endpoint, apiKey, body, baseUrl = BASE_URL_V2) {
  const res = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "X-Square-OpenAPI-Key": apiKey,
      "Content-Type": "application/json",
      clienttype: "binanceSkill",
    },
    body: JSON.stringify(body),
  });
  const raw = await res.text();

  if (endpoint === "/content/add" && res.status === 504) {
    return { id: null, shareLink: null, publishStatus: "success_without_post_id" };
  }

  let json;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    console.error("API returned non-JSON response", {
      endpoint,
      status: res.status,
      statusText: res.statusText,
      body: raw,
    });
    throw new Error(`API returned non-JSON response: ${res.status} ${res.statusText}`);
  }
  if (json.code !== "000000") {
    throw new Error(`API error [${json.code}]: ${json.message}`);
  }
  return json.data;
}

export async function uploadToS3(presignedUrl, filePath, contentType) {
  const fileBuffer = fs.readFileSync(filePath);
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: fileBuffer,
  });
  if (!res.ok) {
    throw new Error(`S3 upload failed: ${res.status} ${res.statusText}`);
  }
}

export async function uploadImage(apiKey, imgPath) {
  const imageName = path.basename(imgPath);
  const contentTypeHeader = getContentType(imgPath);

  console.log(`Uploading: ${imageName}`);
  const { presignedUrl, fileTicket } = await api("/image/presignedUrl", apiKey, { imageName });

  await uploadToS3(presignedUrl, imgPath, contentTypeHeader);
  console.log(`  Uploaded to S3, polling status...`);

  const imageStatus = await pollImageStatus(apiKey, fileTicket);
  console.log(`  Ready: ${imageStatus.imageUrl}`);
  return imageStatus.imageUrl;
}

export async function pollImageStatus(apiKey, fileTicket) {
  for (let i = 0; i < MAX_POLL_RETRIES; i++) {
    const data = await api("/image/imageStatus", apiKey, { fileTicket });
    if (data.status === 1) return data;
    if (data.status === 2) throw new Error(`Processing failed: ${data.failedReason}`);
    console.log(`  Processing... (${i + 1}/${MAX_POLL_RETRIES})`);
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error(`Poll timed out after ${MAX_POLL_RETRIES} retries`);
}

export async function publish(apiKey, body) {
  return await api("/content/add", apiKey, body, BASE_URL_V1);
}

export function printPublishSuccess(result) {
  console.log(`\nSuccess!`);
  console.log(`ID: ${result.id ?? "unavailable"}`);
  console.log(`Link: ${result.shareLink ?? "unavailable"}`);
}

export function parseArgs(args, required, optional = []) {
  const result = {};
  for (const flag of [...required, ...optional]) {
    const idx = args.indexOf(`--${flag}`);
    if (idx !== -1 && idx + 1 < args.length) {
      result[flag] = args[idx + 1];
    }
  }
  for (const flag of required) {
    if (!result[flag]) {
      console.error(`Error: --${flag} is required`);
      process.exit(1);
    }
  }
  return result;
}
