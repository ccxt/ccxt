#!/usr/bin/env node
// query-address-info CLI — self-contained, zero-dep, Node >= 22
// Usage: node cli.mjs <command> '<json_params>'
//
// Commands:
//   positions  GET  wallet active-position list (token balances + 24h price change)
//

// ---- inline HTTP helper (self-contained, zero dependency) ----
const TIMEOUT_MS = 10_000;
const UA = { 'Accept-Encoding': 'identity', 'User-Agent': 'binance-web3/2.0 (Skill)' };

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

// ---- supported chains (client-side fail-fast) ----
const SUPPORTED_CHAINS = new Set(['1', '56', '8453', 'CT_501']);

function validateChainId(chainId) {
  const id = String(chainId ?? '');
  if (!SUPPORTED_CHAINS.has(id)) {
    const supported = [...SUPPORTED_CHAINS].map((c) => `"${c}"`).join(', ');
    throw Object.assign(
      new Error(`positions: unsupported chainId "${chainId}". Supported: ${supported}`),
      { exitCode: 1 },
    );
  }
}

// Client-side fail-fast for malformed addresses.
const EVM_CHAINS = new Set(['1', '56', '8453']);
const SOLANA_CHAIN = 'CT_501';
const EVM_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
const SOLANA_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const EVM_ZERO = '0x' + '0'.repeat(40);

function validationError(msg) {
  return Object.assign(new Error(msg), { exitCode: 1 });
}

function validateAddress(address, chainId) {
  if (typeof address !== 'string' || address.length === 0) {
    throw validationError('address is required');
  }
  // Reject whitespace, control chars, URL-encoded sequences (CRLF injection guard).
  if (/\s/.test(address) || /[\x00-\x1f\x7f]/.test(address) || /%/.test(address)) {
    throw validationError('address contains invalid characters (whitespace / control / %-encoded)');
  }
  // Reject non-ASCII (rejects unicode look-alikes and multibyte chars).
  if (/[^\x20-\x7e]/.test(address)) {
    throw validationError('address contains non-ASCII characters');
  }

  const chain = String(chainId ?? '');
  if (EVM_CHAINS.has(chain)) {
    if (!EVM_ADDRESS_RE.test(address)) {
      throw validationError(`invalid EVM address for chainId=${chain}: expected 0x + 40 hex chars`);
    }
    if (address.toLowerCase() === EVM_ZERO) {
      throw validationError('zero address (0x000...000) is not a valid wallet');
    }
    return;
  }
  if (chain === SOLANA_CHAIN) {
    if (!SOLANA_ADDRESS_RE.test(address)) {
      throw validationError('invalid Solana address: expected base58, 32-44 chars');
    }
    return;
  }
  // Unknown chain — let upstream decide.
}

// ---- commands: (params) => { url, method?, body?, headers? } ----
const COMMANDS = {
  positions: (p) => {
    validateChainId(p.chainId);
    validateAddress(p.address, p.chainId);
    return {
      url: `https://web3.binance.com/bapi/defi/v3/public/wallet-direct/buw/wallet/address/pnl/active-position-list/ai?${qs(p)}`,
      headers: { clienttype: 'web', clientversion: '1.2.0' },
    };
  },
};

// ---- exports (for unit testing; direct execution still works — see dispatch below) ----
export { COMMANDS, call, qs, UA, TIMEOUT_MS, validateAddress, validateChainId, SUPPORTED_CHAINS };

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
