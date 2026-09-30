// Structured submission logging for abuse inspection / detection.
// Writes one JSON object per line. Defaults to stdout (captured by `docker logs`);
// set PLAYGROUND_LOG_FILE to also append to a file (e.g. a mounted volume).
import { appendFile } from "node:fs/promises";

const LOG_FILE = process.env.PLAYGROUND_LOG_FILE;
const MAX_CODE = 4000; // cap logged code so a huge paste can't bloat the log

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function logEvent(event: Record<string, unknown>): void {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...event });
  // stdout — always
  console.log(`[playground] ${line}`);
  // optional file sink
  if (LOG_FILE) {
    void appendFile(LOG_FILE, line + "\n").catch(() => {});
  }
}

export function truncate(s: string | undefined, max = MAX_CODE): string {
  if (!s) return "";
  return s.length > max ? s.slice(0, max) + `…[+${s.length - max} chars]` : s;
}
