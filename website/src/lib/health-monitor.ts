import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import ccxt, { BaseError, type Exchange } from 'ccxt';
import { STATUS_FILE, type StatusEntry } from './exchange-status';

// Writer side of the status feed: probes each exchange through ccxt's unified API,
// times it, and snapshots the results to STATUS_FILE for /api/status and /docs/status
// to read. Started on server boot by src/instrumentation.ts, then every 30 minutes.

const TIMEOUT_MS = 10_000;

const EXCHANGES = ['binance', 'bybit', 'okx', 'hyperliquid', 'kucoin', 'bitget', 'gate', 'mexc', 'coinbase', 'kraken', 'htx', 'bingx', 'cryptocom', 'bitmex', 'coinex', 'woo', 'bitmart' ];

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

async function checkOne(id: string): Promise<StatusEntry> {

  let checkedAt = new Date().toISOString();
  let started = performance.now(); // for error cases where instantiation fails and probe() isn't even called
  try {


    const ExchangeClass = (ccxt as unknown as Record<string, new (config: object) => Exchange>)[id];
    const exchange = new ExchangeClass({ timeout: TIMEOUT_MS });
    await exchange.loadMarkets(); // warm up the instance (e.g. resolve any id mapping) before the timed probe

    started = performance.now(); // reset the timer after instantiation and warmup, so we measure just the probe method

    const { ok, method, error } = await probe(exchange);
    const latencyMs = Math.round(performance.now() - started);
    return { exchange: id, ok, latencyMs, checkedAt, method, ...(error !== undefined ? { error } : {}) };
  } catch (err) {
    // probe() never throws — this only guards instantiation (e.g. an id missing
    // from the installed ccxt version), so the sweep still reports every exchange
    // (no method here: the failure happened before one could be picked)
    const latencyMs = Math.round(performance.now() - started);
    return { exchange: id, ok: false, latencyMs, checkedAt, error: errorName(err) };
  }
}

export async function runHealthMonitorCheck(): Promise<StatusEntry[]> {
  const entries = await Promise.all(EXCHANGES.map(checkOne));
  await mkdir(path.dirname(STATUS_FILE), { recursive: true });
  // write-then-rename is atomic on the same filesystem, so readers never see a
  // partial snapshot (the reader's validation fallback stays as a second net)
  const tmpFile = `${STATUS_FILE}.tmp`;
  await writeFile(tmpFile, `${JSON.stringify(entries, null, 2)}\n`);
  await rename(tmpFile, STATUS_FILE);
  return entries;
}
