Every endpoint in `bitflyer`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bitflyer) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetGetmarketsUsa`); the snake_case alias (`public_get_getmarkets_usa`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetGetmarketsUsa`). Switch tabs for the call in each language:

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
| `publicGetGetmarketsUsa` | GET | `getmarkets/usa` |  |
| `publicGetGetmarketsEu` | GET | `getmarkets/eu` |  |
| `publicGetGetmarkets` | GET | `getmarkets` |  |
| `publicGetGetboard` | GET | `getboard` |  |
| `publicGetGetticker` | GET | `getticker` |  |
| `publicGetGetexecutions` | GET | `getexecutions` |  |
| `publicGetGethealth` | GET | `gethealth` |  |
| `publicGetGetboardstate` | GET | `getboardstate` |  |
| `publicGetGetchats` | GET | `getchats` |  |
| `publicGetGetfundingrate` | GET | `getfundingrate` |  |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetGetpermissions` | GET | `getpermissions` |  |
| `privateGetGetbalance` | GET | `getbalance` |  |
| `privateGetGetbalancehistory` | GET | `getbalancehistory` |  |
| `privateGetGetcollateral` | GET | `getcollateral` |  |
| `privateGetGetcollateralhistory` | GET | `getcollateralhistory` |  |
| `privateGetGetcollateralaccounts` | GET | `getcollateralaccounts` |  |
| `privateGetGetaddresses` | GET | `getaddresses` |  |
| `privateGetGetcoinins` | GET | `getcoinins` |  |
| `privateGetGetcoinouts` | GET | `getcoinouts` |  |
| `privateGetGetbankaccounts` | GET | `getbankaccounts` |  |
| `privateGetGetdeposits` | GET | `getdeposits` |  |
| `privateGetGetwithdrawals` | GET | `getwithdrawals` |  |
| `privateGetGetchildorders` | GET | `getchildorders` |  |
| `privateGetGetparentorders` | GET | `getparentorders` |  |
| `privateGetGetparentorder` | GET | `getparentorder` |  |
| `privateGetGetexecutions` | GET | `getexecutions` |  |
| `privateGetGetpositions` | GET | `getpositions` |  |
| `privateGetGettradingcommission` | GET | `gettradingcommission` |  |
| `privatePostSendcoin` | POST | `sendcoin` |  |
| `privatePostWithdraw` | POST | `withdraw` |  |
| `privatePostSendchildorder` | POST | `sendchildorder` |  |
| `privatePostCancelchildorder` | POST | `cancelchildorder` |  |
| `privatePostSendparentorder` | POST | `sendparentorder` |  |
| `privatePostCancelparentorder` | POST | `cancelparentorder` |  |
| `privatePostCancelallchildorders` | POST | `cancelallchildorders` |  |

