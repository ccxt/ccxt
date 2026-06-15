import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import ccxt, { BaseError, type Exchange } from 'ccxt';
import { STATUS_FILE, type StatusEntry } from './exchange-status';

// Writer side of the status feed: probes each exchange through ccxt's unified API,
// times it, and snapshots the results to STATUS_FILE for /api/status and /docs/status
// to read. Started on server boot by src/instrumentation.ts, then every 30 minutes.

const TIMEOUT_MS = 10_000;

// Roster of monitored exchanges: ccxt id -> logo URL shown on the status page.
// Stable URLs only (github user-attachments / user-images) — the signed
// private-user-images.githubusercontent.com links expire within minutes.
const EXCHANGES: Record<string, string> = {
  'binance': 'https://github.com/user-attachments/assets/e9419b93-ccb0-46aa-9bff-c883f096274b',
  'bybit': 'https://github.com/user-attachments/assets/97a5d0b3-de10-423d-90e1-6620960025ed',
  'okx': 'https://user-images.githubusercontent.com/1294454/152485636-38b19e4a-bece-4dec-979a-5982859ffc04.jpg',
  'gate': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Gateio_logo.svg/960px-Gateio_logo.svg.png',
  'kucoin': 'https://user-images.githubusercontent.com/51840849/87295558-132aaf80-c50e-11ea-9801-a2fb0c57c799.jpg',
  'bitget': 'https://github.com/user-attachments/assets/fbaa10cc-a277-441d-a5b7-997dd9a87658',
  'hyperliquid': 'https://github.com/ccxt/ccxt/assets/43336371/b371bc6c-4a8c-489f-87f4-20a913dd8d4b',
  'bitmex': 'https://github.com/user-attachments/assets/c78425ab-78d5-49d6-bd14-db7734798f04',
  'bingx': 'https://camo.githubusercontent.com/fb94575188eadd1d054a048abde71cb4cf521e2904c295463bc88c0c0cc0b3ee/68747470733a2f2f6769746875622d70726f64756374696f6e2d757365722d61737365742d3632313064662e73332e616d617a6f6e6177732e636f6d2f313239343435342f3235333637353337362d36393833623732652d343939392d343534392d623137372d3333623337346331393565332e6a7067',
  'htx': 'https://user-images.githubusercontent.com/1294454/76137448-22748a80-604e-11ea-8069-6e389271911d.jpg',
  'mexc': 'https://user-images.githubusercontent.com/1294454/137283979-8b2a818d-8633-461b-bfca-de89e8c446b2.jpg',
  'bitmart': 'https://github.com/user-attachments/assets/0623e9c4-f50e-48c9-82bd-65c3908c3a14',
  'cryptocom': 'https://user-images.githubusercontent.com/1294454/147792121-38ed5e36-c229-48d6-b49a-48d05fc19ed4.jpeg',
  'coinex': 'https://user-images.githubusercontent.com/51840849/87182089-1e05fa00-c2ec-11ea-8da9-cc73b45abbbc.jpg',
  'hashkey': 'https://github.com/user-attachments/assets/6dd6127b-cc19-4a13-9b29-a98d81f80e98',
  'woo': 'https://user-images.githubusercontent.com/1294454/150730761-1a00e5e0-d28c-480f-9e65-089ce3e6ef3b.jpg'

};

// only used when an exchange supports neither fetchStatus nor fetchTime
const PROBE_SYMBOL = 'BTC/USDT';

// ccxt class names ARE the error taxonomy (RequestTimeout, ExchangeNotAvailable,
// DDoSProtection, ...) — report them as-is
function errorName(err: unknown): string {
  if (err instanceof BaseError) return err.constructor.name;
  return err instanceof Error ? err.name : 'UnknownError';
}

// The cheapest unified method the exchange supports. fetchStatus is preferred
// because it reflects the exchange's own health report (maintenance, shutdown),
// not just reachability; the others are reachability + latency proxies.
function pickProbeMethod(exchange: Exchange): string {
  if (exchange.has['fetchStatus']) return 'fetchStatus';
  if (exchange.has['fetchTime']) return 'fetchTime';
  if (exchange.has['fetchTicker']) return 'fetchTicker';
  if (exchange.has['fetchOHLCV']) return 'fetchOHLCV';
  return '';
}

// Never throws — any failure comes back as an error response, tagged with the
// unified method that was used.
async function probe(exchange: Exchange): Promise<{ ok: boolean; method: string; error?: string }> {
  const method = pickProbeMethod(exchange);
  try {
    switch (method) {
      case 'fetchStatus': {
        const status = await exchange.fetchStatus();
        const state = status['status'];
        if (state !== undefined && state !== 'ok') return { ok: false, method, error: `OnMaintenance (${state})` };
        break;
      }
      case 'fetchTime':
        await exchange.fetchTime();
        break;
      case 'fetchTicker':
        await exchange.fetchTicker(PROBE_SYMBOL);
        break;
      case 'fetchOHLCV':
        await exchange.fetchOHLCV(PROBE_SYMBOL, '1h', undefined, 1);
        break;
    }
    return { ok: true, method };
  } catch (err) {
    return { ok: false, method, error: errorName(err) };
  }
}

async function checkOne(id: string, logo: string): Promise<StatusEntry> {
  const checkedAt = new Date().toISOString();
  let started = performance.now(); // for error cases where instantiation/warmup fails and probe() isn't even called
  try {
    const ExchangeClass = (ccxt as unknown as Record<string, new (config: object) => Exchange>)[id];
    const exchange = new ExchangeClass({ timeout: TIMEOUT_MS });
    await exchange.loadMarkets(); // warm up the instance (e.g. resolve any id mapping) before the timed probe
    started = performance.now(); // reset the timer after instantiation and warmup, so we measure just the probe method
    const { ok, method, error } = await probe(exchange);
    const latencyMs = Math.round(performance.now() - started);
    return { exchange: id, ok, latencyMs, checkedAt, method, logo, ...(error !== undefined ? { error } : {}) };
  } catch (err) {
    // probe() never throws — this only guards instantiation/warmup (e.g. an id
    // missing from the installed ccxt version), so the sweep still reports every
    // exchange (no method here: the failure happened before one could be picked)
    const latencyMs = Math.round(performance.now() - started);
    return { exchange: id, ok: false, latencyMs, checkedAt, logo, error: errorName(err) };
  }
}

export async function runHealthMonitorCheck(): Promise<StatusEntry[]> {
  const entries = await Promise.all(Object.entries(EXCHANGES).map(([id, logo]) => checkOne(id, logo)));
  await mkdir(path.dirname(STATUS_FILE), { recursive: true });
  // write-then-rename is atomic on the same filesystem, so readers never see a
  // partial snapshot (the reader's validation fallback stays as a second net)
  const tmpFile = `${STATUS_FILE}.tmp`;
  await writeFile(tmpFile, `${JSON.stringify(entries, null, 2)}\n`);
  await rename(tmpFile, STATUS_FILE);
  return entries;
}
