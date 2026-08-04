// Preloaded (via `node --import`) before user TypeScript runs. ccxt-js doesn't read
// proxy env vars, so we inject the egress allowlist proxy into every exchange.
// No-op when no proxy is configured (local dev). The internal network blocks any
// non-proxied egress regardless, so this only enables the *allowed* exchange path.
//
// Why afterConstruct and not Exchange.prototype.httpsProxy: the Exchange
// constructor assigns `this.httpsProxy = undefined` (and the other proxy fields)
// as OWN properties, which shadow any prototype value — so setting them on the
// prototype never reaches an instance. `afterConstruct()` runs at the END of every
// exchange's constructor (after those assignments), so wrapping it writes the
// proxy onto the instance itself: REST (httpsProxy) and ccxt.pro WebSockets
// (wssProxy) alike. Without this, watch* snippets dialed the WS host directly and
// hung behind the egress proxy with a connection timeout.
const proxy =
  process.env.HTTPS_PROXY || process.env.https_proxy ||
  process.env.HTTP_PROXY || process.env.http_proxy;

if (proxy) {
  try {
    const mod = await import("ccxt");
    const ccxt = mod.default ?? mod;
    const proto = ccxt?.Exchange?.prototype;
    if (proto) {
      const prev = proto.afterConstruct;
      proto.afterConstruct = function () {
        // Only set when the snippet didn't pick its own proxy.
        if (this.httpsProxy === undefined) this.httpsProxy = proxy; // REST
        if (this.wssProxy === undefined) this.wssProxy = proxy;     // ccxt.pro watch*
        return prev.call(this);
      };
    }
  } catch {
    // ccxt not resolvable from here — the internal network still blocks egress
  }
}
