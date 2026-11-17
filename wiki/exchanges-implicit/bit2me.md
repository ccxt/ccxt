Every endpoint in `bit2me`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bit2me) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetV2TradingMarketConfig`); Python and PHP use the snake_case form (`public_get_v2_trading_market_config`), and Go uses the PascalCase form (`PublicGetV2TradingMarketConfig`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bit2me = new ccxt.bit2me ();
const response = await bit2me.publicGetV2TradingMarketConfig (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bit2me = new ccxt.bit2me ();
const response = await bit2me.publicGetV2TradingMarketConfig (params);
```

#### **Python**

```python
import ccxt
bit2me = ccxt.bit2me()
response = bit2me.public_get_v2_trading_market_config(params)
```

#### **PHP**

```php
$bit2me = new \ccxt\bit2me();
$response = $bit2me->public_get_v2_trading_market_config($params);
```

#### **C#**

```csharp
using ccxt;
var bit2me = new Bit2me();
var response = await bit2me.publicGetV2TradingMarketConfig(parameters);
```

#### **Go**

```go
bit2me := ccxt.NewBit2me(nil)
response := <-bit2me.PublicGetV2TradingMarketConfig(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bit2me API documentation:** [api.bit2me.com](https://api.bit2me.com/docs/pro/overview) · [api.bit2me.com](https://api.bit2me.com/docs)

> 20 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://gateway.bit2me.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetV2TradingMarketConfig` | GET | `v2/trading/market-config` | 1 |
| `publicGetV2TradingTickers` | GET | `v2/trading/tickers` | 1 |
| `publicGetV2TradingOrderBook` | GET | `v2/trading/order-book` | 1 |
| `publicGetV1TradingCandle` | GET | `v1/trading/candle` | 1 |
| `publicGetV1TradingTradeLast` | GET | `v1/trading/trade/last` | 1 |
| `publicGetV2CurrencyAssets` | GET | `v2/currency/assets` | 1 |
| `publicGetV2CurrencyAssetsSymbol` | GET | `v2/currency/assets/{symbol}` | 1 |
| `publicGetV1WalletSettingsAssets` | GET | `v1/wallet/settings/assets` | 1 |

## private

**Base URL**: `https://gateway.bit2me.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetV1TradingOrder` | GET | `v1/trading/order` | 1 |
| `privateGetV1TradingOrderId` | GET | `v1/trading/order/{id}` | 1 |
| `privateGetV1TradingOrderIdTrades` | GET | `v1/trading/order/{id}/trades` | 1 |
| `privateGetV1TradingTrade` | GET | `v1/trading/trade` | 1 |
| `privateGetV1TradingWalletBalance` | GET | `v1/trading/wallet/balance` | 1 |
| `privateGetV1TradingWorkingCapital` | GET | `v1/trading/working-capital` | 1 |
| `privateGetV1TradingMovement` | GET | `v1/trading/movement` | 1 |
| `privatePostV1TradingOrder` | POST | `v1/trading/order` | 1 |
| `privatePostV1TradingWalletDeposit` | POST | `v1/trading/wallet/deposit` | 1 |
| `privatePostV1TradingWalletWithdraw` | POST | `v1/trading/wallet/withdraw` | 1 |
| `privatePostV1SigninApikey` | POST | `v1/signin/apikey` | 1 |
| `privateDeleteV1TradingOrderId` | DELETE | `v1/trading/order/{id}` | 1 |

