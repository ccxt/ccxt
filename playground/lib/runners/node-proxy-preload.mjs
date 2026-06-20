// Preloaded (via `node --import`) before user JS/TS runs. ccxt-js doesn't read
// proxy env vars, so we set its built-in `httpsProxy` on the Exchange prototype —
// every `new ccxt.<exchange>()` then tunnels through the egress allowlist proxy.
// (Only httpsProxy: ccxt rejects setting httpProxy and httpsProxy together.)
// No-op when no proxy is configured (local dev). The internal network blocks any
// non-proxied egress regardless, so this only enables the *allowed* exchange path.
const proxy =
  process.env.HTTPS_PROXY || process.env.https_proxy ||
  process.env.HTTP_PROXY || process.env.http_proxy;

if (proxy) {
  try {
    const mod = await import("ccxt");
    const ccxt = mod.default ?? mod;
    if (ccxt?.Exchange?.prototype) {
      ccxt.Exchange.prototype.httpsProxy = proxy; // REST
      ccxt.Exchange.prototype.wssProxy = proxy;   // ccxt.pro WebSockets (watch*)
    }
  } catch {
    // ccxt not resolvable from here — the internal network still blocks egress
  }
}
