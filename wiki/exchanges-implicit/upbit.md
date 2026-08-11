Every endpoint in `upbit`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/upbit) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetMarketAll`); the snake_case alias (`public_get_market_all`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetMarketAll`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const upbit = new ccxt.upbit ();
const response = await upbit.publicGetMarketAll (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const upbit = new ccxt.upbit ();
const response = await upbit.publicGetMarketAll (params);
```

#### **Python**

```python
import ccxt
upbit = ccxt.upbit()
response = upbit.public_get_market_all(params)
```

#### **PHP**

```php
$upbit = new \ccxt\upbit();
$response = $upbit->public_get_market_all($params);
```

#### **C#**

```csharp
using ccxt;
var upbit = new Upbit();
var response = await upbit.publicGetMarketAll(parameters);
```

#### **Go**

```go
upbit := ccxt.NewUpbit(nil)
response := <-upbit.PublicGetMarketAll(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official upbit API documentation:** [docs.upbit.com](https://docs.upbit.com/kr) · [global-docs.upbit.com](https://global-docs.upbit.com)

> 53 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetMarketAll` | GET | `market/all` | 2 |
| `publicGetCandlesTimeframe` | GET | `candles/{timeframe}` | 2 |
| `publicGetCandlesTimeframeUnit` | GET | `candles/{timeframe}/{unit}` | 2 |
| `publicGetCandlesSeconds` | GET | `candles/seconds` | 2 |
| `publicGetCandlesMinutesUnit` | GET | `candles/minutes/{unit}` | 2 |
| `publicGetCandlesMinutes1` | GET | `candles/minutes/1` | 2 |
| `publicGetCandlesMinutes3` | GET | `candles/minutes/3` | 2 |
| `publicGetCandlesMinutes5` | GET | `candles/minutes/5` | 2 |
| `publicGetCandlesMinutes10` | GET | `candles/minutes/10` | 2 |
| `publicGetCandlesMinutes15` | GET | `candles/minutes/15` | 2 |
| `publicGetCandlesMinutes30` | GET | `candles/minutes/30` | 2 |
| `publicGetCandlesMinutes60` | GET | `candles/minutes/60` | 2 |
| `publicGetCandlesMinutes240` | GET | `candles/minutes/240` | 2 |
| `publicGetCandlesDays` | GET | `candles/days` | 2 |
| `publicGetCandlesWeeks` | GET | `candles/weeks` | 2 |
| `publicGetCandlesMonths` | GET | `candles/months` | 2 |
| `publicGetCandlesYears` | GET | `candles/years` | 2 |
| `publicGetTradesTicks` | GET | `trades/ticks` | 2 |
| `publicGetTicker` | GET | `ticker` | 2 |
| `publicGetTickerAll` | GET | `ticker/all` | 2 |
| `publicGetOrderbook` | GET | `orderbook` | 2 |
| `publicGetOrderbookInstruments` | GET | `orderbook/instruments` | 2 |

## private

**Base URL**: `https://{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAccounts` | GET | `accounts` | 0.67 |
| `privateGetOrdersChance` | GET | `orders/chance` | 0.67 |
| `privateGetOrder` | GET | `order` | 0.67 |
| `privateGetOrdersClosed` | GET | `orders/closed` | 0.67 |
| `privateGetOrdersOpen` | GET | `orders/open` | 0.67 |
| `privateGetOrdersUuids` | GET | `orders/uuids` | 0.67 |
| `privateGetWithdraws` | GET | `withdraws` | 0.67 |
| `privateGetWithdraw` | GET | `withdraw` | 0.67 |
| `privateGetWithdrawsChance` | GET | `withdraws/chance` | 0.67 |
| `privateGetWithdrawsCoinAddresses` | GET | `withdraws/coin_addresses` | 0.67 |
| `privateGetDeposits` | GET | `deposits` | 0.67 |
| `privateGetDepositsChanceCoin` | GET | `deposits/chance/coin` | 0.67 |
| `privateGetDeposit` | GET | `deposit` | 0.67 |
| `privateGetDepositsCoinAddresses` | GET | `deposits/coin_addresses` | 0.67 |
| `privateGetDepositsCoinAddress` | GET | `deposits/coin_address` | 0.67 |
| `privateGetTravelRuleVasps` | GET | `travel_rule/vasps` | 0.67 |
| `privateGetStatusWallet` | GET | `status/wallet` | 0.67 |
| `privateGetApiKeys` | GET | `api_keys` | 0.67 |
| `privatePostOrders` | POST | `orders` | 2.5 |
| `privatePostOrdersTest` | POST | `orders/test` | 2.5 |
| `privatePostOrdersCancelAndNew` | POST | `orders/cancel_and_new` | 2.5 |
| `privatePostWithdrawsCoin` | POST | `withdraws/coin` | 0.67 |
| `privatePostWithdrawsKrw` | POST | `withdraws/krw` | 0.67 |
| `privatePostDepositsKrw` | POST | `deposits/krw` | 0.67 |
| `privatePostDepositsGenerateCoinAddress` | POST | `deposits/generate_coin_address` | 0.67 |
| `privatePostTravelRuleDepositUuid` | POST | `travel_rule/deposit/uuid` | 0.67 |
| `privatePostTravelRuleDepositTxid` | POST | `travel_rule/deposit/txid` | 0.67 |
| `privateDeleteOrder` | DELETE | `order` | 0.67 |
| `privateDeleteOrdersOpen` | DELETE | `orders/open` | 40 |
| `privateDeleteOrdersUuids` | DELETE | `orders/uuids` | 0.67 |
| `privateDeleteWithdrawsCoin` | DELETE | `withdraws/coin` | 0.67 |

