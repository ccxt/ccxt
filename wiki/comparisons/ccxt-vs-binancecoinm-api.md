<!-- title: CCXT vs the Binance COIN-M Futures API -->
<!-- description: Binance COIN-M Futures is a product line of Binance. What CCXT's `binancecoinm` class covers, how it differs from `binance`, and where the full comparison lives. -->
<!-- group: Regional entities and product lines -->
<!-- summary: A product line of Binance, shipped as its own CCXT class. Inherits 153 unified capabilities and 808 raw endpoints from `binance`. -->
<!-- weight: 400 -->

# CCXT vs the Binance COIN-M Futures API

`binancecoinm` is a product line of Binance — Binance's coin-margined futures, where the contract is collateralised in the base asset rather than in USDT.

Because it shares an API dialect with Binance, CCXT implements it by extending its `binance` class. Everything in the [CCXT vs the Binance API](/docs/comparisons/ccxt-vs-binance-api) comparison applies here — this page covers only what is specific to `binancecoinm`.

## What is different

Same exchange and credentials as `binance`, different product line and host. The equivalent of `ccxt.binance({"options": {"defaultType": "delivery"}})`.

> Inverse contracts: margin, PnL and position size are denominated in the base coin, so notional maths differs from the USD-M class. Symbols look like `BTC/USD:BTC`.

## What CCXT gives you here

| | `binancecoinm` |
| --- | --- |
| Unified capabilities | 153 (inherited from `binance` plus its own overrides) |
| `fetch*` methods | 79 |
| WebSocket `watch*` methods | 31 |
| Raw endpoints as implicit methods | 808 |
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

exchange = ccxt.binancecoinm({'apiKey': '...', 'secret': '...'})
markets = exchange.load_markets()
ticker = exchange.fetch_ticker(list(markets)[0])
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';

const exchange = new ccxt.binancecoinm ({ apiKey: '...', secret: '...' });
const markets = await exchange.loadMarkets ();
const ticker = await exchange.fetchTicker (Object.keys (markets)[0]);
```

<!-- tabs:end -->

Because `binancecoinm` lists a different market set from `binance`, call `load_markets()` and pick symbols from it rather than assuming a pair exists.

Streaming works the same way:

```python
import ccxt.pro, asyncio

async def main():
    exchange = ccxt.pro.binancecoinm()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

## Should you use this class or the parent?

Use `binancecoinm` when you hold an account with Binance COIN-M Futures specifically. Use [`binance`](/docs/exchanges/binance) when you hold an account with the main venue and want its other product lines from one client. They are different hosts, so this is not a preference — it follows from where your account is.

## FAQ

**Do my `binance` API keys work with `binancecoinm`?**
Yes — it is the same account and the same credentials, just a different product host.

**Does `binancecoinm` support the full unified API?**
It inherits 153 unified capabilities from `binance`. Where the venue does not offer a feature, the corresponding `has` flag is turned off, and the method raises `NotSupported` rather than failing quietly. Check `exchange.has` at runtime.

**Can I reach Binance COIN-M Futures-specific endpoints?**
Yes — all 808 endpoints in this class's `api` block are generated as implicit methods, with signing, rate limiting and error mapping applied. The mechanism is documented on the [`binance` implicit API page](/docs/exchanges/binance/implicit-api); this venue's own endpoint list differs slightly from the parent's.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [CCXT vs the Binance API](/docs/comparisons/ccxt-vs-binance-api) — the full comparison
- [`binance` API reference](/docs/exchanges/binance) — `binancecoinm` inherits it; it has no separate reference page
- [Install CCXT](/docs/install)
- [Manual](/docs/manual)
- [More comparisons](/docs/comparisons)
