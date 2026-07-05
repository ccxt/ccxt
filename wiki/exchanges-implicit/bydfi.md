Every endpoint in `bydfi`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bydfi) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetV1PublicApiLimits`); the snake_case alias (`public_get_v1_public_api_limits`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetV1PublicApiLimits`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bydfi = new ccxt.bydfi ();
const response = await bydfi.publicGetV1PublicApiLimits (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bydfi = new ccxt.bydfi ();
const response = await bydfi.publicGetV1PublicApiLimits (params);
```

#### **Python**

```python
import ccxt
bydfi = ccxt.bydfi()
response = bydfi.public_get_v1_public_api_limits(params)
```

#### **PHP**

```php
$bydfi = new \ccxt\bydfi();
$response = $bydfi->public_get_v1_public_api_limits($params);
```

#### **C#**

```csharp
using ccxt;
var bydfi = new Bydfi();
var response = await bydfi.publicGetV1PublicApiLimits(parameters);
```

#### **Go**

```go
bydfi := ccxt.NewBydfi(nil)
response := <-bydfi.PublicGetV1PublicApiLimits(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bydfi API documentation:** [developers.bydfi.com](https://developers.bydfi.com/en/)

> 45 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.bydfi.com/api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetV1PublicApiLimits` | GET | `v1/public/api_limits` | 1 |
| `publicGetV1FapiMarketExchangeInfo` | GET | `v1/fapi/market/exchange_info` | 1 |
| `publicGetV1FapiMarketDepth` | GET | `v1/fapi/market/depth` | 1 |
| `publicGetV1FapiMarketTrades` | GET | `v1/fapi/market/trades` | 1 |
| `publicGetV1FapiMarketKlines` | GET | `v1/fapi/market/klines` | 1 |
| `publicGetV1FapiMarketTicker24hr` | GET | `v1/fapi/market/ticker/24hr` | 1 |
| `publicGetV1FapiMarketTickerPrice` | GET | `v1/fapi/market/ticker/price` | 1 |
| `publicGetV1FapiMarketMarkPrice` | GET | `v1/fapi/market/mark_price` | 1 |
| `publicGetV1FapiMarketFundingRate` | GET | `v1/fapi/market/funding_rate` | 1 |
| `publicGetV1FapiMarketFundingRateHistory` | GET | `v1/fapi/market/funding_rate_history` | 1 |
| `publicGetV1FapiMarketRiskLimit` | GET | `v1/fapi/market/risk_limit` | 1 |

## private

**Base URL**: `https://api.bydfi.com/api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetV1AccountAssets` | GET | `v1/account/assets` | 1 |
| `privateGetV1AccountTransferRecords` | GET | `v1/account/transfer_records` | 1 |
| `privateGetV1SpotDepositRecords` | GET | `v1/spot/deposit_records` | 1 |
| `privateGetV1SpotWithdrawRecords` | GET | `v1/spot/withdraw_records` | 1 |
| `privateGetV1FapiTradeOpenOrder` | GET | `v1/fapi/trade/open_order` | 1 |
| `privateGetV1FapiTradePlanOrder` | GET | `v1/fapi/trade/plan_order` | 1 |
| `privateGetV1FapiTradeLeverage` | GET | `v1/fapi/trade/leverage` | 1 |
| `privateGetV1FapiTradeHistoryOrder` | GET | `v1/fapi/trade/history_order` | 1 |
| `privateGetV1FapiTradeHistoryTrade` | GET | `v1/fapi/trade/history_trade` | 1 |
| `privateGetV1FapiTradePositionHistory` | GET | `v1/fapi/trade/position_history` | 1 |
| `privateGetV1FapiTradePositions` | GET | `v1/fapi/trade/positions` | 1 |
| `privateGetV1FapiAccountBalance` | GET | `v1/fapi/account/balance` | 1 |
| `privateGetV1FapiUserDataAssetsMargin` | GET | `v1/fapi/user_data/assets_margin` | 1 |
| `privateGetV1FapiUserDataPositionSideDual` | GET | `v1/fapi/user_data/position_side/dual` | 1 |
| `privateGetV1AgentTeams` | GET | `v1/agent/teams` | 1 |
| `privateGetV1AgentAgentLinks` | GET | `v1/agent/agent_links` | 1 |
| `privateGetV1AgentRegularOverview` | GET | `v1/agent/regular_overview` | 1 |
| `privateGetV1AgentAgentSubOverview` | GET | `v1/agent/agent_sub_overview` | 1 |
| `privateGetV1AgentPartenerUserDeposit` | GET | `v1/agent/partener_user_deposit` | 1 |
| `privateGetV1AgentPartenerUsersData` | GET | `v1/agent/partener_users_data` | 1 |
| `privateGetV1AgentAffiliateUids` | GET | `v1/agent/affiliate_uids` | 1 |
| `privateGetV1AgentAffiliateCommission` | GET | `v1/agent/affiliate_commission` | 1 |
| `privateGetV1AgentInternalWithdrawalStatus` | GET | `v1/agent/internal_withdrawal_status` | 1 |
| `privatePostV1AccountTransfer` | POST | `v1/account/transfer` | 1 |
| `privatePostV1FapiTradePlaceOrder` | POST | `v1/fapi/trade/place_order` | 1 |
| `privatePostV1FapiTradeBatchPlaceOrder` | POST | `v1/fapi/trade/batch_place_order` | 1 |
| `privatePostV1FapiTradeEditOrder` | POST | `v1/fapi/trade/edit_order` | 1 |
| `privatePostV1FapiTradeBatchEditOrder` | POST | `v1/fapi/trade/batch_edit_order` | 1 |
| `privatePostV1FapiTradeCancelAllOrder` | POST | `v1/fapi/trade/cancel_all_order` | 1 |
| `privatePostV1FapiTradeLeverage` | POST | `v1/fapi/trade/leverage` | 1 |
| `privatePostV1FapiTradeBatchLeverageMargin` | POST | `v1/fapi/trade/batch_leverage_margin` | 1 |
| `privatePostV1FapiUserDataMarginType` | POST | `v1/fapi/user_data/margin_type` | 1 |
| `privatePostV1FapiUserDataPositionSideDual` | POST | `v1/fapi/user_data/position_side/dual` | 1 |
| `privatePostV1AgentInternalWithdrawal` | POST | `v1/agent/internal_withdrawal` | 1 |

