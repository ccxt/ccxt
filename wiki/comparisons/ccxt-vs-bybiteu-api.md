<!-- title: CCXT vs the Bybit EU API -->
<!-- description: Bybit EU is a regional entity of Bybit. What CCXT's `bybiteu` class covers, how it differs from `bybit`, and where the full comparison lives. -->
<!-- group: Regional entities and product lines -->
<!-- summary: A regional entity of Bybit, shipped as its own CCXT class. Inherits 121 unified capabilities and 403 raw endpoints from `bybit`. -->
<!-- weight: 400 -->

# CCXT vs the Bybit EU API

`bybiteu` is a regional entity of Bybit — the MiCA-regulated European entity of Bybit, serving EEA users from a separate host.

Because it shares an API dialect with Bybit, CCXT implements it by extending its `bybit` class. Everything in the [CCXT vs the Bybit API](/docs/comparisons/ccxt-vs-bybit-api) comparison applies here — this page covers only what is specific to `bybiteu`.

## What is different

Separate registration and separate API host from bybit.com. Product coverage is narrower than the global venue, reflecting what the European entity is licensed to offer.

> Credentials are not shared with the global `bybit` class.

## What CCXT gives you here

| | `bybiteu` |
| --- | --- |
| Unified capabilities | 121 (inherited from `bybit` plus its own overrides) |
| `fetch*` methods | 59 |
| WebSocket `watch*` methods | 25 |
| Raw endpoints as implicit methods | 403 |
| Testnet via `setSandboxMode` | yes |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java |
| Licence | MIT |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, read from the source tree with `build/comparisons-facts.cjs`. Counts include everything inherited from `bybit`.</sub>

## Using it

The class name is the only thing that changes — every unified method behaves as it does everywhere else in CCXT:

<!-- tabs:start -->

#### **Python**

```python
import ccxt

exchange = ccxt.bybiteu({'apiKey': '...', 'secret': '...'})
markets = exchange.load_markets()
ticker = exchange.fetch_ticker(list(markets)[0])
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';

const exchange = new ccxt.bybiteu ({ apiKey: '...', secret: '...' });
const markets = await exchange.loadMarkets ();
const ticker = await exchange.fetchTicker (Object.keys (markets)[0]);
```

<!-- tabs:end -->

Because `bybiteu` lists a different market set from `bybit`, call `load_markets()` and pick symbols from it rather than assuming a pair exists.

Streaming works the same way:

```python
import ccxt.pro, asyncio

async def main():
    exchange = ccxt.pro.bybiteu()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

## Should you use this class or the parent?

Use `bybiteu` when you hold an account with Bybit EU specifically. Use [`bybit`](/docs/exchanges/bybit) when you hold an account with the global venue. They are different venues with separate credentials, so this is not a preference — it follows from where your account is.

## FAQ

**Do my `bybit` API keys work with `bybiteu`?**
No. It is a separate legal entity with separate accounts; you need keys issued by Bybit EU.

**Does `bybiteu` support the full unified API?**
It inherits 121 unified capabilities from `bybit`. Where the venue does not offer a feature, the corresponding `has` flag is turned off, and the method raises `NotSupported` rather than failing quietly. Check `exchange.has` at runtime.

**Can I reach Bybit EU-specific endpoints?**
Yes — all 403 endpoints in this class's `api` block are generated as implicit methods, with signing, rate limiting and error mapping applied. The mechanism is documented on the [`bybit` implicit API page](/docs/exchanges/bybit/implicit-api); this venue's own endpoint list differs slightly from the parent's.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [CCXT vs the Bybit API](/docs/comparisons/ccxt-vs-bybit-api) — the full comparison
- [`bybit` API reference](/docs/exchanges/bybit) — `bybiteu` inherits it; it has no separate reference page
- [Install CCXT](/docs/install)
- [Manual](/docs/manual)
- [More comparisons](/docs/comparisons)
