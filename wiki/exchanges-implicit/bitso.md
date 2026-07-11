Every endpoint in `bitso`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bitso) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetAvailableBooks`); the snake_case alias (`public_get_available_books`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetAvailableBooks`). Switch tabs for the call in each language:

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
| `publicGetAvailableBooks` | GET | `available_books` |  |
| `publicGetCatalogues` | GET | `catalogues` |  |
| `publicGetTicker` | GET | `ticker` |  |
| `publicGetOrderBook` | GET | `order_book` |  |
| `publicGetTrades` | GET | `trades` |  |
| `publicGetOhlc` | GET | `ohlc` |  |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAccountStatus` | GET | `account_status` |  |
| `privateGetBalance` | GET | `balance` |  |
| `privateGetFees` | GET | `fees` |  |
| `privateGetFundings` | GET | `fundings` |  |
| `privateGetFundingsFid` | GET | `fundings/{fid}` |  |
| `privateGetFundingDestination` | GET | `funding_destination` |  |
| `privateGetKycDocuments` | GET | `kyc_documents` |  |
| `privateGetLedger` | GET | `ledger` |  |
| `privateGetLedgerTrades` | GET | `ledger/trades` |  |
| `privateGetLedgerFees` | GET | `ledger/fees` |  |
| `privateGetLedgerFundings` | GET | `ledger/fundings` |  |
| `privateGetLedgerWithdrawals` | GET | `ledger/withdrawals` |  |
| `privateGetMxBankCodes` | GET | `mx_bank_codes` |  |
| `privateGetOpenOrders` | GET | `open_orders` |  |
| `privateGetOrderTradesOid` | GET | `order_trades/{oid}` |  |
| `privateGetOrdersOid` | GET | `orders/{oid}` |  |
| `privateGetUserTrades` | GET | `user_trades` |  |
| `privateGetUserTradesTid` | GET | `user_trades/{tid}` |  |
| `privateGetWithdrawals` | GET | `withdrawals/` |  |
| `privateGetWithdrawalsWid` | GET | `withdrawals/{wid}` |  |
| `privatePostBitcoinWithdrawal` | POST | `bitcoin_withdrawal` |  |
| `privatePostDebitCardWithdrawal` | POST | `debit_card_withdrawal` |  |
| `privatePostEtherWithdrawal` | POST | `ether_withdrawal` |  |
| `privatePostOrders` | POST | `orders` |  |
| `privatePostPhoneNumber` | POST | `phone_number` |  |
| `privatePostPhoneVerification` | POST | `phone_verification` |  |
| `privatePostPhoneWithdrawal` | POST | `phone_withdrawal` |  |
| `privatePostSpeiWithdrawal` | POST | `spei_withdrawal` |  |
| `privatePostRippleWithdrawal` | POST | `ripple_withdrawal` |  |
| `privatePostBcashWithdrawal` | POST | `bcash_withdrawal` |  |
| `privatePostLitecoinWithdrawal` | POST | `litecoin_withdrawal` |  |
| `privateDeleteOrders` | DELETE | `orders` |  |
| `privateDeleteOrdersOid` | DELETE | `orders/{oid}` |  |
| `privateDeleteOrdersAll` | DELETE | `orders/all` |  |

