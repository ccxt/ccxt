Every endpoint in `grvt`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/grvt) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `privateEdgePostAuthApiKeyLogin`); the snake_case alias (`privateEdge_post_auth_api_key_login`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PrivateEdgePostAuthApiKeyLogin`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const grvt = new ccxt.grvt ();
const response = await grvt.privateEdgePostAuthApiKeyLogin (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const grvt = new ccxt.grvt ();
const response = await grvt.privateEdgePostAuthApiKeyLogin (params);
```

#### **Python**

```python
import ccxt
grvt = ccxt.grvt()
response = grvt.privateEdge_post_auth_api_key_login(params)
```

#### **PHP**

```php
$grvt = new \ccxt\grvt();
$response = $grvt->privateEdge_post_auth_api_key_login($params);
```

#### **C#**

```csharp
using ccxt;
var grvt = new Grvt();
var response = await grvt.privateEdgePostAuthApiKeyLogin(parameters);
```

#### **Go**

```go
grvt := ccxt.NewGrvt(nil)
response := <-grvt.PrivateEdgePostAuthApiKeyLogin(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official grvt API documentation:** [api-docs.grvt.io](https://api-docs.grvt.io/)

> 50 implicit endpoints across 3 access groups.

## privateEdge

**Base URL**: `https://edge.grvt.io/`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateEdgePostAuthApiKeyLogin` | POST | `auth/api_key/login` | 100 |
| `privateEdgePostAuthWalletLogin` | POST | `auth/wallet/login` | 100 |

## publicMarket

**Base URL**: `https://market-data.grvt.io/`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicMarketPostFullV1Instrument` | POST | `full/v1/instrument` | 4 |
| `publicMarketPostFullV1AllInstruments` | POST | `full/v1/all_instruments` | 4 |
| `publicMarketPostFullV1Instruments` | POST | `full/v1/instruments` | 4 |
| `publicMarketPostFullV1Currency` | POST | `full/v1/currency` | 12 |
| `publicMarketPostFullV1MarginRules` | POST | `full/v1/margin_rules` | 12 |
| `publicMarketPostFullV1Mini` | POST | `full/v1/mini` | 4 |
| `publicMarketPostFullV1Ticker` | POST | `full/v1/ticker` | 4 |
| `publicMarketPostFullV1Book` | POST | `full/v1/book` | 12 |
| `publicMarketPostFullV1Trade` | POST | `full/v1/trade` | 12 |
| `publicMarketPostFullV1TradeHistory` | POST | `full/v1/trade_history` | 12 |
| `publicMarketPostFullV1Kline` | POST | `full/v1/kline` | 12 |
| `publicMarketPostFullV1Funding` | POST | `full/v1/funding` | 12 |

## privateTrading

**Base URL**: `https://trades.grvt.io/`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateTradingPostFullV1CreateOrder` | POST | `full/v1/create_order` | 5 |
| `privateTradingPostFullV1CancelOrder` | POST | `full/v1/cancel_order` | 5 |
| `privateTradingPostFullV1CancelOnDisconnect` | POST | `full/v1/cancel_on_disconnect` | 100 |
| `privateTradingPostFullV1CancelAllOrders` | POST | `full/v1/cancel_all_orders` | 50 |
| `privateTradingPostFullV1Order` | POST | `full/v1/order` | 20 |
| `privateTradingPostFullV1OrderHistory` | POST | `full/v1/order_history` | 20 |
| `privateTradingPostFullV1OpenOrders` | POST | `full/v1/open_orders` | 20 |
| `privateTradingPostFullV1FillHistory` | POST | `full/v1/fill_history` | 20 |
| `privateTradingPostFullV1Positions` | POST | `full/v1/positions` | 20 |
| `privateTradingPostFullV1FundingPaymentHistory` | POST | `full/v1/funding_payment_history` | 40 |
| `privateTradingPostFullV1GetSubAccounts` | POST | `full/v1/get_sub_accounts` | 40 |
| `privateTradingPostFullV1AccountSummary` | POST | `full/v1/account_summary` | 40 |
| `privateTradingPostFullV1AccountHistory` | POST | `full/v1/account_history` | 40 |
| `privateTradingPostFullV1AggregatedAccountSummary` | POST | `full/v1/aggregated_account_summary` | 40 |
| `privateTradingPostFullV1FundingAccountSummary` | POST | `full/v1/funding_account_summary` | 40 |
| `privateTradingPostFullV1Transfer` | POST | `full/v1/transfer` | 100 |
| `privateTradingPostFullV1DepositHistory` | POST | `full/v1/deposit_history` | 100 |
| `privateTradingPostFullV1TransferHistory` | POST | `full/v1/transfer_history` | 100 |
| `privateTradingPostFullV1Withdrawal` | POST | `full/v1/withdrawal` | 100 |
| `privateTradingPostFullV1WithdrawalHistory` | POST | `full/v1/withdrawal_history` | 100 |
| `privateTradingPostFullV1AddPositionMargin` | POST | `full/v1/add_position_margin` | 40 |
| `privateTradingPostFullV1GetPositionMarginLimits` | POST | `full/v1/get_position_margin_limits` | 40 |
| `privateTradingPostFullV1SetPositionConfig` | POST | `full/v1/set_position_config` | 40 |
| `privateTradingPostFullV1SetInitialLeverage` | POST | `full/v1/set_initial_leverage` | 40 |
| `privateTradingPostFullV1GetAllInitialLeverage` | POST | `full/v1/get_all_initial_leverage` | 40 |
| `privateTradingPostFullV1SetDeriskMmRatio` | POST | `full/v1/set_derisk_mm_ratio` | 40 |
| `privateTradingPostFullV1VaultBurnTokens` | POST | `full/v1/vault_burn_tokens` | 40 |
| `privateTradingPostFullV1VaultInvest` | POST | `full/v1/vault_invest` | 40 |
| `privateTradingPostFullV1VaultInvestorSummary` | POST | `full/v1/vault_investor_summary` | 40 |
| `privateTradingPostFullV1VaultRedeem` | POST | `full/v1/vault_redeem` | 40 |
| `privateTradingPostFullV1VaultRedeemCancel` | POST | `full/v1/vault_redeem_cancel` | 40 |
| `privateTradingPostFullV1VaultViewRedemptionQueue` | POST | `full/v1/vault_view_redemption_queue` | 40 |
| `privateTradingPostFullV1VaultManagerInvestorHistory` | POST | `full/v1/vault_manager_investor_history` | 40 |
| `privateTradingPostFullV1AuthorizeBuilder` | POST | `full/v1/authorize_builder` | 40 |
| `privateTradingPostFullV1GetAuthorizedBuilders` | POST | `full/v1/get_authorized_builders` | 40 |
| `privateTradingPostFullV1BuilderFillHistory` | POST | `full/v1/builder_fill_history` | 40 |

