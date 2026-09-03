<!-- title: CCXT vs the OKX US API -->
<!-- description: OKX US is a regional entity of OKX. What CCXT's `okxus` class covers, how it differs from `okx`, and where the full comparison lives. -->
<!-- group: Regional entities and product lines -->
<!-- summary: A regional entity of OKX, shipped as its own CCXT class. Inherits 122 unified capabilities and 446 raw endpoints from `okx`. -->
<!-- weight: 400 -->

# CCXT vs the OKX US API

`okxus` is a regional entity of OKX — the US entity of OKX, served from `us.okx.com`.

Because it shares an API dialect with OKX, CCXT implements it by extending its `okx` class. Everything in the [CCXT vs the OKX API](/docs/comparisons/ccxt-vs-okx-api) comparison applies here — this page covers only what is specific to `okxus`.

## What is different

Separate host, separate accounts and a narrower product set than the global venue — notably fewer derivatives, reflecting what the US entity offers.

> Credentials are not shared with the global `okx` class.

## What CCXT gives you here

| | `okxus` |
| --- | --- |
| Unified capabilities | 122 (inherited from `okx` plus its own overrides) |
| `fetch*` methods | 64 |
| WebSocket `watch*` methods | 19 |
| Raw endpoints as implicit methods | 446 |
| Testnet via `setSandboxMode` | yes |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java |
| Licence | MIT |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, read from the source tree with `build/comparisons-facts.cjs`. Counts include everything inherited from `okx`.</sub>

## Using it

The class name is the only thing that changes — every unified method behaves as it does everywhere else in CCXT:

<!-- tabs:start -->

#### **Python**

```python
import ccxt

exchange = ccxt.okxus({'apiKey': '...', 'secret': '...'})
markets = exchange.load_markets()
ticker = exchange.fetch_ticker(list(markets)[0])
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';

const exchange = new ccxt.okxus ({ apiKey: '...', secret: '...' });
const markets = await exchange.loadMarkets ();
const ticker = await exchange.fetchTicker (Object.keys (markets)[0]);
```

<!-- tabs:end -->

Because `okxus` lists a different market set from `okx`, call `load_markets()` and pick symbols from it rather than assuming a pair exists.

Streaming works the same way:

```python
import ccxt.pro, asyncio

async def main():
    exchange = ccxt.pro.okxus()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

## Should you use this class or the parent?

Use `okxus` when you hold an account with OKX US specifically. Use [`okx`](/docs/exchanges/okx) when you hold an account with the global venue. They are different venues with separate credentials, so this is not a preference — it follows from where your account is.

## FAQ

**Do my `okx` API keys work with `okxus`?**
No. It is a separate legal entity with separate accounts; you need keys issued by OKX US.

**Does `okxus` support the full unified API?**
It inherits 122 unified capabilities from `okx`. Where the venue does not offer a feature, the corresponding `has` flag is turned off, and the method raises `NotSupported` rather than failing quietly. Check `exchange.has` at runtime.

**Can I reach OKX US-specific endpoints?**
Yes — all 446 endpoints in this class's `api` block are generated as implicit methods, with signing, rate limiting and error mapping applied. The mechanism is documented on the [`okx` implicit API page](/docs/exchanges/okx/implicit-api); this venue's own endpoint list differs slightly from the parent's.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [CCXT vs the OKX API](/docs/comparisons/ccxt-vs-okx-api) — the full comparison
- [`okx` API reference](/docs/exchanges/okx) — `okxus` inherits it; it has no separate reference page
- [Install CCXT](/docs/install)
- [Manual](/docs/manual)
- [More comparisons](/docs/comparisons)
