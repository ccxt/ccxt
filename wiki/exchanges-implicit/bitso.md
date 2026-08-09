Every endpoint in `bitso`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bitso) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetAvailableBooks`); the snake_case alias (`public_get_available_books`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetAvailableBooks`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bitso = new ccxt.bitso ();
const response = await bitso.publicGetAvailableBooks (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bitso = new ccxt.bitso ();
const response = await bitso.publicGetAvailableBooks (params);
```

#### **Python**

```python
import ccxt
bitso = ccxt.bitso()
response = bitso.public_get_available_books(params)
```

#### **PHP**

```php
$bitso = new \ccxt\bitso();
$response = $bitso->public_get_available_books($params);
```

#### **C#**

```csharp
using ccxt;
var bitso = new Bitso();
var response = await bitso.publicGetAvailableBooks(parameters);
```

#### **Go**

```go
bitso := ccxt.NewBitso(nil)
response := <-bitso.PublicGetAvailableBooks(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bitso API documentation:** [bitso.com](https://bitso.com/api_info)

> 40 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetAvailableBooks` | GET | `available_books` | 1 |
| `publicGetCatalogues` | GET | `catalogues` | 1 |
| `publicGetTicker` | GET | `ticker` | 1 |
| `publicGetOrderBook` | GET | `order_book` | 1 |
| `publicGetTrades` | GET | `trades` | 1 |
| `publicGetOhlc` | GET | `ohlc` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAccountStatus` | GET | `account_status` | 1 |
| `privateGetBalance` | GET | `balance` | 1 |
| `privateGetFees` | GET | `fees` | 1 |
| `privateGetFundings` | GET | `fundings` | 1 |
| `privateGetFundingsFid` | GET | `fundings/{fid}` | 1 |
| `privateGetFundingDestination` | GET | `funding_destination` | 1 |
| `privateGetKycDocuments` | GET | `kyc_documents` | 1 |
| `privateGetLedger` | GET | `ledger` | 1 |
| `privateGetLedgerTrades` | GET | `ledger/trades` | 1 |
| `privateGetLedgerFees` | GET | `ledger/fees` | 1 |
| `privateGetLedgerFundings` | GET | `ledger/fundings` | 1 |
| `privateGetLedgerWithdrawals` | GET | `ledger/withdrawals` | 1 |
| `privateGetMxBankCodes` | GET | `mx_bank_codes` | 1 |
| `privateGetOpenOrders` | GET | `open_orders` | 1 |
| `privateGetOrderTradesOid` | GET | `order_trades/{oid}` | 1 |
| `privateGetOrdersOid` | GET | `orders/{oid}` | 1 |
| `privateGetUserTrades` | GET | `user_trades` | 1 |
| `privateGetUserTradesTid` | GET | `user_trades/{tid}` | 1 |
| `privateGetWithdrawals` | GET | `withdrawals/` | 1 |
| `privateGetWithdrawalsWid` | GET | `withdrawals/{wid}` | 1 |
| `privatePostBitcoinWithdrawal` | POST | `bitcoin_withdrawal` | 1 |
| `privatePostDebitCardWithdrawal` | POST | `debit_card_withdrawal` | 1 |
| `privatePostEtherWithdrawal` | POST | `ether_withdrawal` | 1 |
| `privatePostOrders` | POST | `orders` | 1 |
| `privatePostPhoneNumber` | POST | `phone_number` | 1 |
| `privatePostPhoneVerification` | POST | `phone_verification` | 1 |
| `privatePostPhoneWithdrawal` | POST | `phone_withdrawal` | 1 |
| `privatePostSpeiWithdrawal` | POST | `spei_withdrawal` | 1 |
| `privatePostRippleWithdrawal` | POST | `ripple_withdrawal` | 1 |
| `privatePostBcashWithdrawal` | POST | `bcash_withdrawal` | 1 |
| `privatePostLitecoinWithdrawal` | POST | `litecoin_withdrawal` | 1 |
| `privateDeleteOrders` | DELETE | `orders` | 1 |
| `privateDeleteOrdersOid` | DELETE | `orders/{oid}` | 1 |
| `privateDeleteOrdersAll` | DELETE | `orders/all` | 1 |

