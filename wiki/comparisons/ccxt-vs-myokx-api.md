<!-- title: CCXT vs the MyOKX (EEA) API -->
<!-- description: MyOKX (EEA) is a regional entity of OKX. What CCXT's `myokx` class covers, how it differs from `okx`, and where the full comparison lives. -->
<!-- group: Regional entities and product lines -->
<!-- summary: A regional entity of OKX, shipped as its own CCXT class. Inherits 121 unified capabilities and 446 raw endpoints from `okx`. -->
<!-- weight: 400 -->

# CCXT vs the MyOKX (EEA) API

`myokx` is a regional entity of OKX — OKX's EEA entity, served from `eea.okx.com` under European registration.

Because it shares an API dialect with OKX, CCXT implements it by extending its `okx` class. Everything in the [CCXT vs the OKX API](/docs/comparisons/ccxt-vs-okx-api) comparison applies here — this page covers only what is specific to `myokx`.

## What is different

Separate host and accounts from the global venue, with product coverage limited to what the EEA entity is licensed to offer.

> Credentials are not shared with the global `okx` class.

## What CCXT gives you here

| | `myokx` |
| --- | --- |
| Unified capabilities | 121 (inherited from `okx` plus its own overrides) |
| `fetch*` methods | 64 |
| WebSocket `watch*` methods | 19 |
| Raw endpoints as implicit methods | 446 |
| Testnet via `setSandboxMode` | yes |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust |
| Licence | MIT |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, read from the source tree with `build/comparisons-facts.cjs`. Counts include everything inherited from `okx`.</sub>

## Using it

The class name is the only thing that changes — every unified method behaves as it does everywhere else in CCXT:

<!-- tabs:start -->

#### **Python**

```python
import ccxt

exchange = ccxt.myokx({'apiKey': '...', 'secret': '...'})
markets = exchange.load_markets()
ticker = exchange.fetch_ticker(list(markets)[0])
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';

const exchange = new ccxt.myokx ({ apiKey: '...', secret: '...' });
const markets = await exchange.loadMarkets ();
const ticker = await exchange.fetchTicker (Object.keys (markets)[0]);
```

<!-- tabs:end -->

Because `myokx` lists a different market set from `okx`, call `load_markets()` and pick symbols from it rather than assuming a pair exists.

Streaming works the same way:

```python
import ccxt.pro, asyncio

async def main():
    exchange = ccxt.pro.myokx()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

## Should you use this class or the parent?

Use `myokx` when you hold an account with MyOKX (EEA) specifically. Use [`okx`](/docs/exchanges/okx) when you hold an account with the global venue. They are different venues with separate credentials, so this is not a preference — it follows from where your account is.

## FAQ

**Do my `okx` API keys work with `myokx`?**
No. It is a separate legal entity with separate accounts; you need keys issued by MyOKX (EEA).

**Does `myokx` support the full unified API?**
It inherits 121 unified capabilities from `okx`. Where the venue does not offer a feature, the corresponding `has` flag is turned off, and the method raises `NotSupported` rather than failing quietly. Check `exchange.has` at runtime.

**Can I reach MyOKX (EEA)-specific endpoints?**
Yes — all 446 endpoints in this class's `api` block are generated as implicit methods, with signing, rate limiting and error mapping applied. The mechanism is documented on the [`okx` implicit API page](/docs/exchanges/okx/implicit-api); this venue's own endpoint list differs slightly from the parent's.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [CCXT vs the OKX API](/docs/comparisons/ccxt-vs-okx-api) — the full comparison
- [`okx` API reference](/docs/exchanges/okx) — `myokx` inherits it; it has no separate reference page
- [Install CCXT](/docs/install)
- [Manual](/docs/manual)
- [More comparisons](/docs/comparisons)
