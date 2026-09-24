#!/usr/bin/env node
// query-token-info CLI — self-contained, zero-dep, Node >= 22
// Usage: node cli.mjs <command> '<json_params>'
//
// Commands:
//   search   token search by keyword
//   meta     static token metadata
//   dynamic  real-time market data (price, volume, holders)
//   kline    candlestick data
//
// All 4 commands use the SAME parameter shape: { chainId, contractAddress, ... }.
// Internally, kline hits a different host and uses different upstream field names
// (platform/address) — this CLI handles the translation so the LLM caller sees
// one consistent interface.

// ---- inline HTTP helper (self-contained, zero dependency) ----
const TIMEOUT_MS = 10_000;
const UA = { 'Accept-Encoding': 'identity', 'User-Agent': 'binance-web3/2.0 (Skill)' };

// ---- chainId → upstream kline platform name ----
// Single source of truth for chain identity. Used only by kline (other commands
// pass chainId through as-is to the Binance Web3 API which accepts chainId directly).
const CHAIN_ID_TO_PLATFORM = {
  '1':      'ethereum',
  '56':     'bsc',
  '8453':   'base',
  'CT_501': 'solana',
};

const qs = (p) => Object.entries(p)
  .filter(([, v]) => v != null)
  .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
  .join('&');

async function call({ url, method = 'GET', body, headers = {} }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const opts = { method, headers: { ...UA, ...headers }, signal: ctrl.signal };
  if (method === 'POST') { opts.headers['content-type'] = 'application/json'; opts.body = JSON.stringify(body || {}); }
  let res;
  try { res = await fetch(url, opts); }
  catch { clearTimeout(timer); throw Object.assign(new Error('Network request failed'), { exitCode: 3 }); }
  clearTimeout(timer);
  const data = await res.json();
  if (res.status >= 400) throw Object.assign(new Error(`HTTP ${res.status}`), { exitCode: 1, body: data });
  return data;
}

// ---- commands: (params) => { url, method?, body?, headers? } ----
const COMMANDS = {
  search: (p) => ({
    url: `https://web3.binance.com/bapi/defi/v5/public/wallet-direct/buw/wallet/market/token/search/ai?${qs(p)}`,
  }),
  meta: (p) => ({
    url: `https://web3.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/dex/market/token/meta/info/ai?${qs(p)}`,
  }),
  dynamic: (p) => ({
    url: `https://web3.binance.com/bapi/defi/v4/public/wallet-direct/buw/wallet/market/token/dynamic/info/ai?${qs(p)}`,
  }),
  kline: (p) => {
    // Translate unified interface → upstream kline field names.
    // { chainId, contractAddress, interval, ... } → { platform, address, interval, ... }
    const { chainId, contractAddress, ...rest } = p;
    const platform = chainId == null ? undefined : CHAIN_ID_TO_PLATFORM[chainId];
    if (chainId != null && platform === undefined) {
      const supported = Object.keys(CHAIN_ID_TO_PLATFORM).map((k) => `"${k}"`).join(', ');
      throw Object.assign(
        new Error(`kline: unsupported chainId "${chainId}". Supported: ${supported}`),
        { exitCode: 1 },
      );
    }
    const upstream = { ...rest };
    if (platform !== undefined) upstream.platform = platform;
    if (contractAddress !== undefined) upstream.address = contractAddress;
    return {
      url: `https://dquery.sintral.io/u-kline/v1/k-line/candles?${qs(upstream)}`,
    };
  },
};

// ---- exports (for unit testing; direct execution still works — see dispatch below) ----
export { COMMANDS, call, qs, UA, TIMEOUT_MS, CHAIN_ID_TO_PLATFORM };

// ---- CLI dispatch (only runs when executed directly, not when imported) ----
if (import.meta.url === `file://${process.argv[1]}`) {
  const [cmd, paramsStr] = process.argv.slice(2);

  if (!cmd || cmd === '--help' || cmd === '-h') {
    console.log("Usage: node cli.mjs <command> '<json_params>'\n\nCommands:");
    for (const name of Object.keys(COMMANDS)) console.log(`  ${name}`);
    process.exit(0);
  }

  const builder = COMMANDS[cmd];
  if (!builder) { console.error(`Unknown command: ${cmd}\nRun with --help to see available commands.`); process.exit(1); }

  let params = {};
  if (paramsStr) {
    try { params = JSON.parse(paramsStr); }
    catch { console.error('Invalid JSON params'); process.exit(1); }
  }

  try {
    const result = await call(builder(params));
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err.message);
    if (err.body) console.log(JSON.stringify(err.body, null, 2));
    process.exit(err.exitCode || 1);
  }
}
