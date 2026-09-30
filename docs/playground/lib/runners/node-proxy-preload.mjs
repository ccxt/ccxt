// Preloaded (via `node --import`) before user TypeScript runs. ccxt-js doesn't read
// proxy env vars, so we inject the egress allowlist proxy into every exchange.
// No-op when no proxy is configured (local dev). The internal network blocks any
// non-proxied egress regardless, so this only enables the *allowed* exchange path.
//
// Why afterConstruct and not a prototype field: every Exchange constructor assigns
// `this.httpsProxy = undefined` (and the other proxy fields) as OWN properties,
// which shadow any prototype value — so setting them on a prototype never reaches
// an instance. `afterConstruct()` runs at the END of each constructor (after those
// assignments), so wrapping it writes the proxy onto the instance itself.
//
// Why BaseExchange and not ccxt.Exchange: spot (`ccxt.*`), pro (`ccxt.pro.*`) and
// prediction (`ccxt.prediction.*`) exchanges all inherit from the SAME
// BaseExchange, but prediction exchanges do NOT extend `ccxt.Exchange`
// (`instanceof ccxt.Exchange === false`). Hooking only `ccxt.Exchange` left every
// prediction market (Polymarket, Kalshi, Limitless, ...) dialing directly — behind
// the egress proxy that surfaced as `getaddrinfo EAI_AGAIN`. Hooking the shared
// BaseExchange root covers all three namespaces with one wrap.
const proxy =
  process.env.HTTPS_PROXY || process.env.https_proxy ||
  process.env.HTTP_PROXY || process.env.http_proxy;

if (proxy) {
  try {
    const mod = await import("ccxt");
    const ccxt = mod.default ?? mod;
    // BaseExchange is the shared root of spot, pro and prediction exchanges, but
    // is not a named export — resolve it via the prototype chain.
    const predProto = ccxt?.PredictionExchange?.prototype;
    const baseProto = predProto ? Object.getPrototypeOf(predProto) : null;
    const proto =
      baseProto?.constructor?.name === "BaseExchange"
        ? baseProto
        : ccxt?.Exchange?.prototype; // fallback: spot-only (shouldn't happen)
    if (proto && !proto.__egressProxyHooked) {
      const prev = proto.afterConstruct;
      proto.afterConstruct = function () {
        // Only set when the snippet didn't pick its own proxy.
        if (this.httpsProxy === undefined) this.httpsProxy = proxy; // REST
        if (this.wssProxy === undefined) this.wssProxy = proxy;     // ccxt.pro / watch*
        return prev.call(this);
      };
      proto.__egressProxyHooked = true;
    }
  } catch {
    // ccxt not resolvable from here — the internal network still blocks egress
  }
}
