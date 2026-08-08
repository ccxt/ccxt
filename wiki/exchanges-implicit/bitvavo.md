Every endpoint in `bitvavo`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bitvavo) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetMarketBook`); the snake_case alias (`public_get_market_book`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetMarketBook`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bitvavo = new ccxt.bitvavo ();
const response = await bitvavo.publicGetMarketBook (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bitvavo = new ccxt.bitvavo ();
const response = await bitvavo.publicGetMarketBook (params);
```

#### **Python**

```python
import ccxt
bitvavo = ccxt.bitvavo()
response = bitvavo.public_get_market_book(params)
```

#### **PHP**

```php
$bitvavo = new \ccxt\bitvavo();
$response = $bitvavo->public_get_market_book($params);
```

#### **C#**

```csharp
using ccxt;
var bitvavo = new Bitvavo();
var response = await bitvavo.publicGetMarketBook(parameters);
```

#### **Go**

```go
bitvavo := ccxt.NewBitvavo(nil)
response := <-bitvavo.PublicGetMarketBook(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bitvavo API documentation:** [docs.bitvavo.com](https://docs.bitvavo.com/)

> 41 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.bitvavo.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetMarketBook` | GET | `{market}/book` | 1 |
| `publicGetReportMarketBook` | GET | `report/{market}/book` | 1 |
| `publicGetMarketTrades` | GET | `{market}/trades` | 5 |
| `publicGetReportMarketTrades` | GET | `report/{market}/trades` | 5 |
| `publicGetTickerPrice` | GET | `ticker/price` | 1 |
| `publicGetTickerBook` | GET | `ticker/book` | 1 |
| `publicGetMarketCandles` | GET | `{market}/candles` | 1 |
| `publicGetTicker24h` | GET | `ticker/24h` | 1 |
| `publicGetTime` | GET | `time` | 1 |
| `publicGetMarkets` | GET | `markets` | 1 |
| `publicGetAssets` | GET | `assets` | 1 |

## private

**Base URL**: `https://api.bitvavo.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetOrder` | GET | `order` | 1 |
| `privateGetOrdersOpen` | GET | `ordersOpen` | 5 |
| `privateGetTrades` | GET | `trades` | 5 |
| `privateGetOrders` | GET | `orders` | 5 |
| `privateGetDeposit` | GET | `deposit` | 1 |
| `privateGetDepositHistory` | GET | `depositHistory` | 5 |
| `privateGetWithdrawalHistory` | GET | `withdrawalHistory` | 5 |
| `privateGetAccount` | GET | `account` | 1 |
| `privateGetBalance` | GET | `balance` | 5 |
| `privateGetStakingBalance` | GET | `stakingBalance` | 1 |
| `privateGetAccountFees` | GET | `account/fees` | 1 |
| `privateGetAccountHistory` | GET | `account/history` | 1 |
| `privateGetSubaccounts` | GET | `subaccounts` | 5 |
| `privateGetSubaccountsTransfers` | GET | `subaccounts/transfers` | 5 |
| `privateGetSubaccountsTransfersTransferId` | GET | `subaccounts/transfers/{transferId}` | 5 |
| `privateGetInstitutionalSubaccountsBalance` | GET | `institutional/subaccounts/balance` | 5 |
| `privateGetInstitutionalSubaccountsHistory` | GET | `institutional/subaccounts/history` | 5 |
| `privateGetInstitutionalSubaccountsOrdersOpen` | GET | `institutional/subaccounts/orders/open` | 5 |
| `privatePostOrder` | POST | `order` | 1 |
| `privatePostCancelOrdersAfter` | POST | `cancelOrdersAfter` | 5 |
| `privatePostWithdrawal` | POST | `withdrawal` | 1 |
| `privatePostCryptoWithdrawal` | POST | `crypto/withdrawal` | 25 |
| `privatePostSubaccounts` | POST | `subaccounts` | 5 |
| `privatePostSubaccountsTransfers` | POST | `subaccounts/transfers` | 5 |
| `privatePutOrder` | PUT | `order` | 1 |
| `privateDeleteOrder` | DELETE | `order` | 1 |
| `privateDeleteOrders` | DELETE | `orders` | 25 |
| `privateDeleteAtomicOrders` | DELETE | `atomic/orders` | 100 |
| `privateDeleteInstitutionalSubaccountsOrder` | DELETE | `institutional/subaccounts/order` | 1 |
| `privateDeleteInstitutionalSubaccountsOrders` | DELETE | `institutional/subaccounts/orders` | 25 |

