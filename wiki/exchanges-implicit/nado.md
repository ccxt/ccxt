Every endpoint in `nado`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/nado) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `gatewayPublicGetSymbols`); the snake_case alias (`gateway_public_get_symbols`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`GatewayPublicGetSymbols`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const nado = new ccxt.nado ();
const response = await nado.gatewayPublicGetSymbols (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const nado = new ccxt.nado ();
const response = await nado.gatewayPublicGetSymbols (params);
```

#### **Python**

```python
import ccxt
nado = ccxt.nado()
response = nado.gateway_public_get_symbols(params)
```

#### **PHP**

```php
$nado = new \ccxt\nado();
$response = $nado->gateway_public_get_symbols($params);
```

#### **C#**

```csharp
using ccxt;
var nado = new Nado();
var response = await nado.gatewayPublicGetSymbols(parameters);
```

#### **Go**

```go
nado := ccxt.NewNado(nil)
response := <-nado.GatewayPublicGetSymbols(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official nado API documentation:** [docs.nado.xyz](https://docs.nado.xyz/)

> 14 implicit endpoints across 5 access groups.

## gateway

**Base URL**: `https://gateway.prod.nado.xyz/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `gatewayPublicGetSymbols` | GET | `symbols` | 2 |
| `gatewayPublicGetQuery` | GET | `query` | 1 |
| `gatewayPublicGetEdgeQuery` | GET | `edge/query` | 1 |
| `gatewayPublicPostQuery` | POST | `query` | 1 |
| `gatewayPrivatePostExecute` | POST | `execute` | 1 |

## gatewayV2

**Base URL**: `https://gateway.prod.nado.xyz/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `gatewayV2PublicGetAssets` | GET | `assets` | 2 |
| `gatewayV2PublicGetPairs` | GET | `pairs` | 1 |
| `gatewayV2PublicGetOrderbook` | GET | `orderbook` | 1 |

## archive

**Base URL**: `https://archive.prod.nado.xyz/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `archivePost` | POST | `` | 1 |

## archiveV2

**Base URL**: `https://archive.prod.nado.xyz/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `archiveV2PublicGetTickers` | GET | `tickers` | 1 |
| `archiveV2PublicGetContracts` | GET | `contracts` | 1 |
| `archiveV2PublicGetTrades` | GET | `trades` | 1 |

## trigger

**Base URL**: `https://trigger.prod.nado.xyz/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `triggerPrivatePostExecute` | POST | `execute` | 1 |
| `triggerPrivatePostQuery` | POST | `query` | 1 |

