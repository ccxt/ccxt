<!-- title: CCXT vs the KuCoin EU API -->
<!-- description: KuCoin EU is a regional entity of KuCoin. What CCXT's `kucoineu` class covers, how it differs from `kucoin`, and where the full comparison lives. -->
<!-- group: Regional entities and product lines -->
<!-- summary: A regional entity of KuCoin, shipped as its own CCXT class. Inherits 111 unified capabilities and 351 raw endpoints from `kucoin`. -->
<!-- weight: 400 -->

# CCXT vs the KuCoin EU API

`kucoineu` is a regional entity of KuCoin — the European entity of KuCoin, serving EEA users under separate registration.

Because it shares an API dialect with KuCoin, CCXT implements it by extending its `kucoin` class. Everything in the [CCXT vs the KuCoin API](/docs/comparisons/ccxt-vs-kucoin-api) comparison applies here — this page covers only what is specific to `kucoineu`.

## What is different

Separate host and separate accounts from the global venue, with a narrower listed market set.

> Credentials are not shared with the global `kucoin` class.

## What CCXT gives you here

| | `kucoineu` |
| --- | --- |
| Unified capabilities | 111 (inherited from `kucoin` plus its own overrides) |
| `fetch*` methods | 54 |
| WebSocket `watch*` methods | 22 |
| Raw endpoints as implicit methods | 351 |
| Testnet via `setSandboxMode` | no |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java |
| Licence | MIT |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, read from the source tree with `build/comparisons-facts.cjs`. Counts include everything inherited from `kucoin`.</sub>

## Using it

The class name is the only thing that changes — every unified method behaves as it does everywhere else in CCXT:

<!-- tabs:start -->

#### **Python**

```python
import ccxt

exchange = ccxt.kucoineu({'apiKey': '...', 'secret': '...'})
markets = exchange.load_markets()
ticker = exchange.fetch_ticker(list(markets)[0])
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';

const exchange = new ccxt.kucoineu ({ apiKey: '...', secret: '...' });
const markets = await exchange.loadMarkets ();
const ticker = await exchange.fetchTicker (Object.keys (markets)[0]);
```

<!-- tabs:end -->

Because `kucoineu` lists a different market set from `kucoin`, call `load_markets()` and pick symbols from it rather than assuming a pair exists.

Streaming works the same way:

```python
import ccxt.pro, asyncio

async def main():
    exchange = ccxt.pro.kucoineu()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

## Should you use this class or the parent?

Use `kucoineu` when you hold an account with KuCoin EU specifically. Use [`kucoin`](/docs/exchanges/kucoin) when you hold an account with the global venue. They are different venues with separate credentials, so this is not a preference — it follows from where your account is.

## FAQ

**Do my `kucoin` API keys work with `kucoineu`?**
No. It is a separate legal entity with separate accounts; you need keys issued by KuCoin EU.

**Does `kucoineu` support the full unified API?**
It inherits 111 unified capabilities from `kucoin`. Where the venue does not offer a feature, the corresponding `has` flag is turned off, and the method raises `NotSupported` rather than failing quietly. Check `exchange.has` at runtime.

**Can I reach KuCoin EU-specific endpoints?**
Yes — all 351 endpoints in this class's `api` block are generated as implicit methods, with signing, rate limiting and error mapping applied. The mechanism is documented on the [`kucoin` implicit API page](/docs/exchanges/kucoin/implicit-api); this venue's own endpoint list differs slightly from the parent's.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [CCXT vs the KuCoin API](/docs/comparisons/ccxt-vs-kucoin-api) — the full comparison
- [`kucoin` API reference](/docs/exchanges/kucoin) — `kucoineu` inherits it; it has no separate reference page
- [Install CCXT](/docs/install)
- [Manual](/docs/manual)
- [More comparisons](/docs/comparisons)
