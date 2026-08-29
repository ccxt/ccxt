Every endpoint in `zaif`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/zaif) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetDepthPair`); the snake_case alias (`public_get_depth_pair`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetDepthPair`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const zaif = new ccxt.zaif ();
const response = await zaif.publicGetDepthPair (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const zaif = new ccxt.zaif ();
const response = await zaif.publicGetDepthPair (params);
```

#### **Python**

```python
import ccxt
zaif = ccxt.zaif()
response = zaif.public_get_depth_pair(params)
```

#### **PHP**

```php
$zaif = new \ccxt\zaif();
$response = $zaif->public_get_depth_pair($params);
```

#### **C#**

```csharp
using ccxt;
var zaif = new Zaif();
var response = await zaif.publicGetDepthPair(parameters);
```

#### **Go**

```go
zaif := ccxt.NewZaif(nil)
response := <-zaif.PublicGetDepthPair(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official zaif API documentation:** [techbureau-api-document.readthedocs.io](https://techbureau-api-document.readthedocs.io/ja/latest/index.html) · [corp.zaif.jp](https://corp.zaif.jp/api-docs) · [corp.zaif.jp](https://corp.zaif.jp/api-docs/api_links) · [npmjs.com](https://www.npmjs.com/package/zaif.jp) · [github.com](https://github.com/you21979/node-zaif)

> 34 implicit endpoints across 5 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetDepthPair` | GET | `depth/{pair}` | 1 |
| `publicGetCurrenciesPair` | GET | `currencies/{pair}` | 1 |
| `publicGetCurrenciesAll` | GET | `currencies/all` | 1 |
| `publicGetCurrencyPairsPair` | GET | `currency_pairs/{pair}` | 1 |
| `publicGetCurrencyPairsAll` | GET | `currency_pairs/all` | 1 |
| `publicGetLastPricePair` | GET | `last_price/{pair}` | 1 |
| `publicGetTickerPair` | GET | `ticker/{pair}` | 1 |
| `publicGetTradesPair` | GET | `trades/{pair}` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostActiveOrders` | POST | `active_orders` | 5 |
| `privatePostCancelOrder` | POST | `cancel_order` | 5 |
| `privatePostDepositHistory` | POST | `deposit_history` | 5 |
| `privatePostGetIdInfo` | POST | `get_id_info` | 5 |
| `privatePostGetInfo` | POST | `get_info` | 10 |
| `privatePostGetInfo2` | POST | `get_info2` | 5 |
| `privatePostGetPersonalInfo` | POST | `get_personal_info` | 5 |
| `privatePostTrade` | POST | `trade` | 5 |
| `privatePostTradeHistory` | POST | `trade_history` | 50 |
| `privatePostWithdraw` | POST | `withdraw` | 5 |
| `privatePostWithdrawHistory` | POST | `withdraw_history` | 5 |

## ecapi

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `ecapiPostCreateInvoice` | POST | `createInvoice` | 1 |
| `ecapiPostGetInvoice` | POST | `getInvoice` | 1 |
| `ecapiPostGetInvoiceIdsByOrderNumber` | POST | `getInvoiceIdsByOrderNumber` | 1 |
| `ecapiPostCancelInvoice` | POST | `cancelInvoice` | 1 |

## tlapi

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `tlapiPostGetPositions` | POST | `get_positions` | 66 |
| `tlapiPostPositionHistory` | POST | `position_history` | 66 |
| `tlapiPostActivePositions` | POST | `active_positions` | 5 |
| `tlapiPostCreatePosition` | POST | `create_position` | 33 |
| `tlapiPostChangePosition` | POST | `change_position` | 33 |
| `tlapiPostCancelPosition` | POST | `cancel_position` | 33 |

## fapi

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `fapiGetGroupsGroupId` | GET | `groups/{group_id}` | 1 |
| `fapiGetLastPriceGroupIdPair` | GET | `last_price/{group_id}/{pair}` | 1 |
| `fapiGetTickerGroupIdPair` | GET | `ticker/{group_id}/{pair}` | 1 |
| `fapiGetTradesGroupIdPair` | GET | `trades/{group_id}/{pair}` | 1 |
| `fapiGetDepthGroupIdPair` | GET | `depth/{group_id}/{pair}` | 1 |

