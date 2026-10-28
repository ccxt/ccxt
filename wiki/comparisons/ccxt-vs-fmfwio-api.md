<!-- title: CCXT vs the FMFW.io API -->
<!-- description: FMFW.io is a white-label venue of HitBTC. What CCXT's `fmfwio` class covers, how it differs from `hitbtc`, and where the full comparison lives. -->
<!-- group: Regional entities and product lines -->
<!-- summary: A white-label venue of HitBTC, shipped as its own CCXT class. Inherits 54 unified capabilities and 111 raw endpoints from `hitbtc`. -->
<!-- weight: 400 -->

# CCXT vs the FMFW.io API

`fmfwio` is a white-label venue of HitBTC — an exchange running on the HitBTC engine, so its API is HitBTC-shaped.

Because it shares an API dialect with HitBTC, CCXT implements it by extending its `hitbtc` class. Everything in the [CCXT vs the HitBTC API](/docs/comparisons/ccxt-vs-hitbtc-api) comparison applies here — this page covers only what is specific to `fmfwio`.

## What is different

A distinct venue with its own accounts and listings, sharing the HitBTC request/response dialect. CCXT implements it by extending its HitBTC class.

> Credentials and markets are its own; only the API dialect is shared.

## What CCXT gives you here

| | `fmfwio` |
| --- | --- |
| Unified capabilities | 54 (inherited from `hitbtc` plus its own overrides) |
| `fetch*` methods | 34 |
| WebSocket `watch*` methods | none — this venue has no CCXT WebSocket support |
| Raw endpoints as implicit methods | 111 |
| Testnet via `setSandboxMode` | no |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust |
| Licence | MIT |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, read from the source tree with `build/comparisons-facts.cjs`. Counts include everything inherited from `hitbtc`.</sub>

## Using it

The class name is the only thing that changes — every unified method behaves as it does everywhere else in CCXT:

<!-- tabs:start -->

#### **Python**

```python
import ccxt

exchange = ccxt.fmfwio({'apiKey': '...', 'secret': '...'})
markets = exchange.load_markets()
ticker = exchange.fetch_ticker(list(markets)[0])
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';

const exchange = new ccxt.fmfwio ({ apiKey: '...', secret: '...' });
const markets = await exchange.loadMarkets ();
const ticker = await exchange.fetchTicker (Object.keys (markets)[0]);
```

<!-- tabs:end -->

Because `fmfwio` lists a different market set from `hitbtc`, call `load_markets()` and pick symbols from it rather than assuming a pair exists.

This venue has no WebSocket implementation in CCXT, so there are no `watch*` methods for `fmfwio` — use the `fetch*` methods and poll. `hitbtc` does have streaming if the global venue suits your use case.

## Should you use this class or the parent?

Use `fmfwio` when you hold an account with FMFW.io specifically. Use [`hitbtc`](/docs/exchanges/hitbtc) when you hold an account with the global venue. They are different venues with separate credentials, so this is not a preference — it follows from where your account is.

## FAQ

**Do my `hitbtc` API keys work with `fmfwio`?**
No. It is a separate legal entity with separate accounts; you need keys issued by FMFW.io.

**Does `fmfwio` support the full unified API?**
It inherits 54 unified capabilities from `hitbtc`. Where the venue does not offer a feature, the corresponding `has` flag is turned off, and the method raises `NotSupported` rather than failing quietly. Check `exchange.has` at runtime.

**Can I reach FMFW.io-specific endpoints?**
Yes — all 111 endpoints in this class's `api` block are generated as implicit methods, with signing, rate limiting and error mapping applied. The mechanism is documented on the [`hitbtc` implicit API page](/docs/exchanges/hitbtc/implicit-api); this venue's own endpoint list differs slightly from the parent's.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [CCXT vs the HitBTC API](/docs/comparisons/ccxt-vs-hitbtc-api) — the full comparison
- [`hitbtc` API reference](/docs/exchanges/hitbtc) — `fmfwio` inherits it; it has no separate reference page
- [Install CCXT](/docs/install)
- [Manual](/docs/manual)
- [More comparisons](/docs/comparisons)
