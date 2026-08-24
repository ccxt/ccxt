Every endpoint in `bitflyer`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bitflyer) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetGetmarketsUsa`); the snake_case alias (`public_get_getmarkets_usa`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetGetmarketsUsa`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bitflyer = new ccxt.bitflyer ();
const response = await bitflyer.publicGetGetmarketsUsa (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bitflyer = new ccxt.bitflyer ();
const response = await bitflyer.publicGetGetmarketsUsa (params);
```

#### **Python**

```python
import ccxt
bitflyer = ccxt.bitflyer()
response = bitflyer.public_get_getmarkets_usa(params)
```

#### **PHP**

```php
$bitflyer = new \ccxt\bitflyer();
$response = $bitflyer->public_get_getmarkets_usa($params);
```

#### **C#**

```csharp
using ccxt;
var bitflyer = new Bitflyer();
var response = await bitflyer.publicGetGetmarketsUsa(parameters);
```

#### **Go**

```go
bitflyer := ccxt.NewBitflyer(nil)
response := <-bitflyer.PublicGetGetmarketsUsa(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bitflyer API documentation:** [lightning.bitflyer.com](https://lightning.bitflyer.com/docs?lang=en)

> 35 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetGetmarketsUsa` | GET | `getmarkets/usa` | 1 |
| `publicGetGetmarketsEu` | GET | `getmarkets/eu` | 1 |
| `publicGetGetmarkets` | GET | `getmarkets` | 1 |
| `publicGetGetboard` | GET | `getboard` | 1 |
| `publicGetGetticker` | GET | `getticker` | 1 |
| `publicGetGetexecutions` | GET | `getexecutions` | 1 |
| `publicGetGethealth` | GET | `gethealth` | 1 |
| `publicGetGetboardstate` | GET | `getboardstate` | 1 |
| `publicGetGetchats` | GET | `getchats` | 1 |
| `publicGetGetfundingrate` | GET | `getfundingrate` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetGetpermissions` | GET | `getpermissions` | 1 |
| `privateGetGetbalance` | GET | `getbalance` | 1 |
| `privateGetGetbalancehistory` | GET | `getbalancehistory` | 1 |
| `privateGetGetcollateral` | GET | `getcollateral` | 1 |
| `privateGetGetcollateralhistory` | GET | `getcollateralhistory` | 1 |
| `privateGetGetcollateralaccounts` | GET | `getcollateralaccounts` | 1 |
| `privateGetGetaddresses` | GET | `getaddresses` | 1 |
| `privateGetGetcoinins` | GET | `getcoinins` | 1 |
| `privateGetGetcoinouts` | GET | `getcoinouts` | 1 |
| `privateGetGetbankaccounts` | GET | `getbankaccounts` | 1 |
| `privateGetGetdeposits` | GET | `getdeposits` | 1 |
| `privateGetGetwithdrawals` | GET | `getwithdrawals` | 1 |
| `privateGetGetchildorders` | GET | `getchildorders` | 1 |
| `privateGetGetparentorders` | GET | `getparentorders` | 1 |
| `privateGetGetparentorder` | GET | `getparentorder` | 1 |
| `privateGetGetexecutions` | GET | `getexecutions` | 1 |
| `privateGetGetpositions` | GET | `getpositions` | 1 |
| `privateGetGettradingcommission` | GET | `gettradingcommission` | 1 |
| `privatePostSendcoin` | POST | `sendcoin` | 1 |
| `privatePostWithdraw` | POST | `withdraw` | 1 |
| `privatePostSendchildorder` | POST | `sendchildorder` | 1 |
| `privatePostCancelchildorder` | POST | `cancelchildorder` | 1 |
| `privatePostSendparentorder` | POST | `sendparentorder` | 1 |
| `privatePostCancelparentorder` | POST | `cancelparentorder` | 1 |
| `privatePostCancelallchildorders` | POST | `cancelallchildorders` | 1 |

