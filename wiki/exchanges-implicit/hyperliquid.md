Every endpoint in `hyperliquid`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/hyperliquid) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicPostInfo`); the snake_case alias (`public_post_info`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicPostInfo`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const hyperliquid = new ccxt.hyperliquid ();
const response = await hyperliquid.publicPostInfo (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const hyperliquid = new ccxt.hyperliquid ();
const response = await hyperliquid.publicPostInfo (params);
```

#### **Python**

```python
import ccxt
hyperliquid = ccxt.hyperliquid()
response = hyperliquid.public_post_info(params)
```

#### **PHP**

```php
$hyperliquid = new \ccxt\hyperliquid();
$response = $hyperliquid->public_post_info($params);
```

#### **C#**

```csharp
using ccxt;
var hyperliquid = new Hyperliquid();
var response = await hyperliquid.publicPostInfo(parameters);
```

#### **Go**

```go
hyperliquid := ccxt.NewHyperliquid(nil)
response := <-hyperliquid.PublicPostInfo(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official hyperliquid API documentation:** [hyperliquid.gitbook.io](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api)

> 2 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicPostInfo` | POST | `info` | 20 |

## private

**Base URL**: `https://api.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostExchange` | POST | `exchange` | 1 |

