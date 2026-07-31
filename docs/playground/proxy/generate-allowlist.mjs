// Generate the egress proxy's domain allowlist FROM CCXT itself, so the proxy
// permits exactly the exchange API hosts CCXT uses (and nothing else). Run at
// proxy image build time; prints squid `dstdomain` lines to stdout.
//
// Output is a MINIMAL set of registrable-domain wildcards (".binance.com") plus
// any bare apex hosts — squid rejects a wildcard that is a subdomain of another
// (e.g. ".demo.hitbtc.com" under ".hitbtc.com"), so we collapse to eTLD+1.
import ccxt from "ccxt";

// Common multi-label public suffixes, so we never emit an over-broad wildcard
// like ".co.uk" (which would allow every co.uk domain).
const TWO_LABEL_SUFFIXES = new Set([
  "co.uk", "org.uk", "ac.uk", "gov.uk", "com.au", "net.au", "org.au",
  "co.jp", "com.br", "com.sg", "com.hk", "co.za", "co.kr", "com.tr",
  "com.mx", "com.cn", "com.tw", "co.in", "co.id", "com.ar", "com.ua",
]);

function registrable(host) {
  const p = host.split(".");
  if (p.length <= 2) return host; // already apex (binance.com) or bare
  const lastTwo = p.slice(-2).join(".");
  const lastThree = p.slice(-3).join(".");
  return TWO_LABEL_SUFFIXES.has(lastTwo) ? lastThree : lastTwo;
}

const hosts = new Set();
function walk(v) {
  if (typeof v === "string") {
    const m = v.match(/^https?:\/\/([^/?#]+)/i);
    if (m) {
      const host = m[1].split("@").pop().split(":")[0].toLowerCase();
      if (host && host.includes(".") && /^[a-z0-9.-]+$/.test(host)) hosts.add(host);
    }
  } else if (Array.isArray(v)) {
    v.forEach(walk);
  } else if (v && typeof v === "object") {
    Object.values(v).forEach(walk);
  }
}

for (const id of ccxt.exchanges) {
  try {
    const ex = new ccxt[id]();
    walk(ex.urls?.api); // only the API/test endpoints, not doc/referral/marketing hosts
    walk(ex.urls?.test);
  } catch {
    // skip exchanges that fail to construct without config
  }
}

// Collapse every host to its registrable domain as a wildcard (".domain.tld").
// A wildcard apex also matches the apex itself in squid, so this covers
// api.binance.com, fapi.binance.com, binance.com, etc. with one ".binance.com".
const domains = new Set();
for (const h of hosts) domains.add("." + registrable(h));

// The server-side AI assistant calls OpenRouter; allow it so the feature works.
domains.add(".openrouter.ai");

process.stdout.write([...domains].sort().join("\n") + "\n");
process.stderr.write(`allowlist: ${hosts.size} hosts -> ${domains.size} domain rules\n`);
