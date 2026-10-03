<!-- title: CCXT vs the Binance.US API -->
<!-- description: Binance.US is a regional entity of Binance. What CCXT's `binanceus` class covers, how it differs from `binance`, and where the full comparison lives. -->
<!-- group: Regional entities and product lines -->
<!-- summary: A regional entity of Binance, shipped as its own CCXT class. Inherits 103 unified capabilities and 860 raw endpoints from `binance`. -->
<!-- weight: 400 -->

# CCXT vs the Binance.US API

`binanceus` is a regional entity of Binance — the separate US entity of Binance, operated under US regulation with its own domain, its own listings and its own API host.

Because it shares an API dialect with Binance, CCXT implements it by extending its `binance` class. Everything in the [CCXT vs the Binance API](/docs/comparisons/ccxt-vs-binance-api) comparison applies here — this page covers only what is specific to `binanceus`.

## What is different

A different venue with a different market list, not a flag on the main exchange. Accounts and API keys are not shared with binance.com, and the traded pairs are a subset. CCXT ships it as its own id for exactly that reason — `ccxt.binance()` credentials will not work against it.

> The instrument list is materially smaller than binance.com, so code that hardcodes a symbol available on the global venue may not find it here. Call `load_markets()` and check.

## What CCXT gives you here

| | `binanceus` |
| --- | --- |
| Unified capabilities | 103 (inherited from `binance` plus its own overrides) |
| `fetch*` methods | 50 |
| WebSocket `watch*` methods | 24 |
| Raw endpoints as implicit methods | 860 |
| Testnet via `setSandboxMode` | no |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust |
| Licence | MIT |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, read from the source tree with `build/comparisons-facts.cjs`. Counts include everything inherited from `binance`.</sub>

## Using it

The class name is the only thing that changes — every unified method behaves as it does everywhere else in CCXT:

<!-- tabs:start -->

#### **Python**

```python
import ccxt

exchange = ccxt.binanceus({'apiKey': '...', 'secret': '...'})
markets = exchange.load_markets()
ticker = exchange.fetch_ticker(list(markets)[0])
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';

const exchange = new ccxt.binanceus ({ apiKey: '...', secret: '...' });
const markets = await exchange.loadMarkets ();
const ticker = await exchange.fetchTicker (Object.keys (markets)[0]);
```

<!-- tabs:end -->

Because `binanceus` lists a different market set from `binance`, call `load_markets()` and pick symbols from it rather than assuming a pair exists.

Streaming works the same way:

```python
import ccxt.pro, asyncio

async def main():
    exchange = ccxt.pro.binanceus()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

## Should you use this class or the parent?

Use `binanceus` when you hold an account with Binance.US specifically. Use [`binance`](/docs/exchanges/binance) when you hold an account with the global venue. They are different venues with separate credentials, so this is not a preference — it follows from where your account is.

## FAQ

**Do my `binance` API keys work with `binanceus`?**
No. It is a separate legal entity with separate accounts; you need keys issued by Binance.US.

**Does `binanceus` support the full unified API?**
It inherits 103 unified capabilities from `binance`. Where the venue does not offer a feature, the corresponding `has` flag is turned off, and the method raises `NotSupported` rather than failing quietly. Check `exchange.has` at runtime.

**Can I reach Binance.US-specific endpoints?**
Yes — all 860 endpoints in this class's `api` block are generated as implicit methods, with signing, rate limiting and error mapping applied. The mechanism is documented on the [`binance` implicit API page](/docs/exchanges/binance/implicit-api); this venue's own endpoint list differs slightly from the parent's.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [CCXT vs the Binance API](/docs/comparisons/ccxt-vs-binance-api) — the full comparison
- [`binance` API reference](/docs/exchanges/binance) — `binanceus` inherits it; it has no separate reference page
- [Install CCXT](/docs/install)
- [Manual](/docs/manual)
- [More comparisons](/docs/comparisons)
