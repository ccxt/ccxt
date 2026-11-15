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

// Many exchanges store API bases as templates (okx: "https://{hostname}",
// bybit: "https://api.{hostname}") and put the real host in `exchange.hostname`.
// The bare template is not a DNS name — without substitution those exchanges
// never reach the allowlist and playground calls hang until RequestTimeout.
function expandUrlTemplates(str, ex) {
  if (typeof str !== "string") return str;
  const hostname = typeof ex?.hostname === "string" ? ex.hostname : "";
  if (!hostname || !str.includes("{")) return str;
  return str.replaceAll("{hostname}", hostname);
}

const hosts = new Set();
function addHost(host) {
  if (!host) return;
  const h = host.split("@").pop().split(":")[0].toLowerCase();
  if (h && h.includes(".") && /^[a-z0-9.-]+$/.test(h)) hosts.add(h);
}

function walk(v, ex) {
  if (typeof v === "string") {
    const expanded = expandUrlTemplates(v, ex);
    const m = expanded.match(/^https?:\/\/([^/?#]+)/i);
    if (m) addHost(m[1]);
  } else if (Array.isArray(v)) {
    v.forEach((x) => walk(x, ex));
  } else if (v && typeof v === "object") {
    Object.values(v).forEach((x) => walk(x, ex));
  }
}

// Prediction-market exchanges (Polymarket, Kalshi, ...) are NOT in ccxt.exchanges
// — they live in the separate ccxt.prediction namespace with its own id list, so
// walking only ccxt.exchanges left every prediction host off the allowlist and
// the playground's prediction example failed with a 403 CONNECT.
const namespaces = [
  [ccxt, ccxt.exchanges],
  [ccxt.prediction, ccxt.prediction?.exchanges],
];

for (const [ns, ids] of namespaces) {
  for (const id of ids ?? []) {
    try {
      const ex = new ns[id]();
      walk(ex.urls?.api, ex); // only the API/test endpoints, not doc/referral/marketing hosts
      walk(ex.urls?.test, ex);
      // Hostname is the live API host for template-based exchanges even when
      // urls.api has already been walked (and when the template expands to the
      // same host this is a no-op via the Set).
      if (typeof ex.hostname === "string") addHost(ex.hostname);
    } catch {
      // skip exchanges that fail to construct without config
    }
  }
}

// Collapse every host to its registrable domain as a wildcard (".domain.tld").
// A wildcard apex also matches the apex itself in squid, so this covers
// api.binance.com, fapi.binance.com, binance.com, etc. with one ".binance.com".
const domains = new Set();
for (const h of hosts) domains.add("." + registrable(h));

// Nothing else is added here: the AI assistant posts to PLAYGROUND_AI_URL, which
// is expected to be deployment-local and reached directly (NO_PROXY), not out
// through this allowlist. Point it at a remote endpoint and you must add that
// host here too.

process.stdout.write([...domains].sort().join("\n") + "\n");
process.stderr.write(`allowlist: ${hosts.size} hosts -> ${domains.size} domain rules\n`);
