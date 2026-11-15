#!/usr/bin/env node
// crypto-market-rank CLI — self-contained, zero-dep, Node >= 22
// Usage: node cli.mjs <command> '<json_params>'
//
// Commands:
//   social-hype         GET   social buzz leaderboard (sentiment + summary)
//   token-rank          POST  unified rank (Trending / TopSearch / Alpha / Stock)
//   smart-money-inflow  POST  token rank by smart money net inflow
//   meme-rank           GET   top meme tokens from Pulse launchpad (BSC only)
//   address-pnl-rank    GET   top trader PnL leaderboard
//

// ---- inline HTTP helper (self-contained, zero dependency) ----
const TIMEOUT_MS = 10_000;
const UA = { 'Accept-Encoding': 'identity', 'User-Agent': 'binance-web3/3.0 (Skill)' };

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

// ---- per-command supported chains (client-side fail-fast) ----
const CHAINS = {
  'social-hype':        new Set(['56', '8453', 'CT_501']),
  'token-rank':         new Set(['56', '8453', 'CT_501', '1']),
  'smart-money-inflow': new Set(['56', 'CT_501', '8453']),
  'meme-rank':          new Set(['56']),
  'address-pnl-rank':   new Set(['56', 'CT_501', '8453', '1']),
};

function validateChainId(cmd, chainId) {
  const allowed = CHAINS[cmd];
  if (!allowed) return;
  const id = String(chainId ?? '');
  if (!allowed.has(id)) {
    const supported = [...allowed].map((c) => `"${c}"`).join(', ');
    throw Object.assign(
      new Error(`${cmd}: unsupported chainId "${chainId}". Supported: ${supported}`),
      { exitCode: 1 },
    );
  }
}

// ---- commands: (params) => { url, method?, body?, headers? } ----
const COMMANDS = {
  'social-hype': (p) => {
    validateChainId('social-hype', p.chainId);
    return {
      url: `https://web3.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/pulse/social/hype/rank/leaderboard/ai?${qs(p)}`,
    };
  },
  'token-rank': (p) => {
    validateChainId('token-rank', p.chainId);
    const TRENDING_ALPHA_DEFAULTS = {
      countMin: 10,
      launchTimeMin: 15,
      liquidityMin: 5000,
      uniqueTraderMin: 10,
      volumeMin: 10000,
    };
    const TRENDING_DEFAULTS = {
      tagFilter: [1, 2, 3],
    };

    const rankType = p.rankType ?? 10;
    let body = { ...p };

    if (rankType === 10) {
      // Trending: apply both shared + trending-only defaults (caller params take precedence)
      body = { ...TRENDING_ALPHA_DEFAULTS, ...TRENDING_DEFAULTS, ...p };
    } else if (rankType === 20) {
      // Alpha: apply only shared defaults (caller params take precedence)
      body = { ...TRENDING_ALPHA_DEFAULTS, ...p };
    }

    return {
      url: 'https://web3.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/pulse/unified/rank/list/ai',
      method: 'POST',
      body,
    };
  },
  'smart-money-inflow': (p) => {
    validateChainId('smart-money-inflow', p.chainId);
    return {
      url: 'https://web3.binance.com/bapi/defi/v1/public/wallet-direct/tracker/wallet/token/inflow/rank/query/ai',
      method: 'POST',
      body: { ...p, tagType: p.tagType ?? 2 },
    };
  },
  'meme-rank': (p) => {
    validateChainId('meme-rank', p.chainId);
    return {
      url: `https://web3.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/pulse/exclusive/rank/list/ai?${qs(p)}`,
    };
  },
  'address-pnl-rank': (p) => {
    validateChainId('address-pnl-rank', p.chainId);
    return {
      url: `https://web3.binance.com/bapi/defi/v1/public/wallet-direct/market/leaderboard/query/ai?${qs(p)}`,
    };
  },
};

// ---- exports (for unit testing; direct execution still works — see dispatch below) ----
export { COMMANDS, call, qs, UA, TIMEOUT_MS, CHAINS, validateChainId };

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
