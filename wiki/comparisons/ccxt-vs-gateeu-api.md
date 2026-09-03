<!-- title: CCXT vs the Gate EU API -->
<!-- description: Gate EU is a regional entity of Gate. What CCXT's `gateeu` class covers, how it differs from `gate`, and where the full comparison lives. -->
<!-- group: Regional entities and product lines -->
<!-- summary: A regional entity of Gate, shipped as its own CCXT class. Inherits 110 unified capabilities and 339 raw endpoints from `gate`. -->
<!-- weight: 400 -->

# CCXT vs the Gate EU API

`gateeu` is a regional entity of Gate — the European entity of Gate, serving EEA users under separate registration.

Because it shares an API dialect with Gate, CCXT implements it by extending its `gate` class. Everything in the [CCXT vs the Gate API](/docs/comparisons/ccxt-vs-gate-api) comparison applies here — this page covers only what is specific to `gateeu`.

## What is different

Separate host and separate accounts from the global venue, with a narrower listed market set.

> Credentials are not shared with the global `gate` class.

## What CCXT gives you here

| | `gateeu` |
| --- | --- |
| Unified capabilities | 110 (inherited from `gate` plus its own overrides) |
| `fetch*` methods | 49 |
| WebSocket `watch*` methods | 16 |
| Raw endpoints as implicit methods | 339 |
| Testnet via `setSandboxMode` | no |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java |
| Licence | MIT |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, read from the source tree with `build/comparisons-facts.cjs`. Counts include everything inherited from `gate`.</sub>

## Using it

The class name is the only thing that changes — every unified method behaves as it does everywhere else in CCXT:

<!-- tabs:start -->

#### **Python**

```python
import ccxt

exchange = ccxt.gateeu({'apiKey': '...', 'secret': '...'})
markets = exchange.load_markets()
ticker = exchange.fetch_ticker(list(markets)[0])
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';

const exchange = new ccxt.gateeu ({ apiKey: '...', secret: '...' });
const markets = await exchange.loadMarkets ();
const ticker = await exchange.fetchTicker (Object.keys (markets)[0]);
```

<!-- tabs:end -->

Because `gateeu` lists a different market set from `gate`, call `load_markets()` and pick symbols from it rather than assuming a pair exists.

Streaming works the same way:

```python
import ccxt.pro, asyncio

async def main():
    exchange = ccxt.pro.gateeu()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

## Should you use this class or the parent?

Use `gateeu` when you hold an account with Gate EU specifically. Use [`gate`](/docs/exchanges/gate) when you hold an account with the global venue. They are different venues with separate credentials, so this is not a preference — it follows from where your account is.

## FAQ

**Do my `gate` API keys work with `gateeu`?**
No. It is a separate legal entity with separate accounts; you need keys issued by Gate EU.

**Does `gateeu` support the full unified API?**
It inherits 110 unified capabilities from `gate`. Where the venue does not offer a feature, the corresponding `has` flag is turned off, and the method raises `NotSupported` rather than failing quietly. Check `exchange.has` at runtime.

**Can I reach Gate EU-specific endpoints?**
Yes — all 339 endpoints in this class's `api` block are generated as implicit methods, with signing, rate limiting and error mapping applied. The mechanism is documented on the [`gate` implicit API page](/docs/exchanges/gate/implicit-api); this venue's own endpoint list differs slightly from the parent's.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [CCXT vs the Gate API](/docs/comparisons/ccxt-vs-gate-api) — the full comparison
- [`gate` API reference](/docs/exchanges/gate) — `gateeu` inherits it; it has no separate reference page
- [Install CCXT](/docs/install)
- [Manual](/docs/manual)
- [More comparisons](/docs/comparisons)
