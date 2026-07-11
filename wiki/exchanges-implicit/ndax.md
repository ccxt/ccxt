Every endpoint in `ndax`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/ndax) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetActivate2FA`); the snake_case alias (`public_get_activate2fa`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetActivate2FA`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const ndax = new ccxt.ndax ();
const response = await ndax.publicGetActivate2FA (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const ndax = new ccxt.ndax ();
const response = await ndax.publicGetActivate2FA (params);
```

#### **Python**

```python
import ccxt
ndax = ccxt.ndax()
response = ndax.public_get_activate2fa(params)
```

#### **PHP**

```php
$ndax = new \ccxt\ndax();
$response = $ndax->public_get_activate2fa($params);
```

#### **C#**

```csharp
using ccxt;
var ndax = new Ndax();
var response = await ndax.publicGetActivate2FA(parameters);
```

#### **Go**

```go
ndax := ccxt.NewNdax(nil)
response := <-ndax.PublicGetActivate2FA(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official ndax API documentation:** [apidoc.ndax.io](https://apidoc.ndax.io/)

> 104 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.ndax.io:8443/AP`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetActivate2FA` | GET | `Activate2FA` | 1 |
| `publicGetAuthenticate2FA` | GET | `Authenticate2FA` | 1 |
| `publicGetAuthenticateUser` | GET | `AuthenticateUser` | 1 |
| `publicGetEnableXP2FA` | GET | `EnableXP2FA` | 1 |
| `publicGetGetL2Snapshot` | GET | `GetL2Snapshot` | 1 |
| `publicGetGetLevel1` | GET | `GetLevel1` | 1 |
| `publicGetGetValidate2FARequiredEndpoints` | GET | `GetValidate2FARequiredEndpoints` | 1 |
| `publicGetLogOut` | GET | `LogOut` | 1 |
| `publicGetGetTickerHistory` | GET | `GetTickerHistory` | 1 |
| `publicGetGetProduct` | GET | `GetProduct` | 1 |
| `publicGetGetProducts` | GET | `GetProducts` | 1 |
| `publicGetGetInstrument` | GET | `GetInstrument` | 1 |
| `publicGetGetInstruments` | GET | `GetInstruments` | 1 |
| `publicGetGetEarliestTickTime` | GET | `GetEarliestTickTime` | 1 |
| `publicGetPing` | GET | `Ping` | 1 |
| `publicGetAssets` | GET | `assets` | 1 |
| `publicGetOrderbook` | GET | `orderbook` | 1 |
| `publicGetTicker` | GET | `ticker` | 1 |
| `publicGetSummary` | GET | `summary` | 1 |
| `publicGetTrades` | GET | `trades` | 1 |
| `publicGetGetLastTrades` | GET | `GetLastTrades` | 1 |
| `publicGetConfirmWithdraw` | GET | `ConfirmWithdraw` | 1 |
| `publicGetSubscribeLevel1` | GET | `SubscribeLevel1` | 1 |
| `publicGetSubscribeLevel2` | GET | `SubscribeLevel2` | 1 |
| `publicGetSubscribeTicker` | GET | `SubscribeTicker` | 1 |
| `publicGetSubscribeTrades` | GET | `SubscribeTrades` | 1 |
| `publicGetSubscribeBlockTrades` | GET | `SubscribeBlockTrades` | 1 |
| `publicGetUnsubscribeBlockTrades` | GET | `UnsubscribeBlockTrades` | 1 |
| `publicGetUnsubscribeLevel1` | GET | `UnsubscribeLevel1` | 1 |
| `publicGetUnsubscribeLevel2` | GET | `UnsubscribeLevel2` | 1 |
| `publicGetUnsubscribeTicker` | GET | `UnsubscribeTicker` | 1 |
| `publicGetUnsubscribeTrades` | GET | `UnsubscribeTrades` | 1 |
| `publicGetAuthenticate` | GET | `Authenticate` | 1 |

## private

**Base URL**: `https://api.ndax.io:8443/AP`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetGetUserAccountInfos` | GET | `GetUserAccountInfos` | 1 |
| `privateGetGetUserAccounts` | GET | `GetUserAccounts` | 1 |
| `privateGetGetUserAffiliateCount` | GET | `GetUserAffiliateCount` | 1 |
| `privateGetGetUserAffiliateTag` | GET | `GetUserAffiliateTag` | 1 |
| `privateGetGetUserConfig` | GET | `GetUserConfig` | 1 |
| `privateGetGetAllUnredactedUserConfigsForUser` | GET | `GetAllUnredactedUserConfigsForUser` | 1 |
| `privateGetGetUnredactedUserConfigByKey` | GET | `GetUnredactedUserConfigByKey` | 1 |
| `privateGetGetUserDevices` | GET | `GetUserDevices` | 1 |
| `privateGetGetUserReportTickets` | GET | `GetUserReportTickets` | 1 |
| `privateGetGetUserReportWriterResultRecords` | GET | `GetUserReportWriterResultRecords` | 1 |
| `privateGetGetAccountInfo` | GET | `GetAccountInfo` | 1 |
| `privateGetGetAccountPositions` | GET | `GetAccountPositions` | 1 |
| `privateGetGetAllAccountConfigs` | GET | `GetAllAccountConfigs` | 1 |
| `privateGetGetTreasuryProductsForAccount` | GET | `GetTreasuryProductsForAccount` | 1 |
| `privateGetGetAccountTrades` | GET | `GetAccountTrades` | 1 |
| `privateGetGetAccountTransactions` | GET | `GetAccountTransactions` | 1 |
| `privateGetGetOpenTradeReports` | GET | `GetOpenTradeReports` | 1 |
| `privateGetGetAllOpenTradeReports` | GET | `GetAllOpenTradeReports` | 1 |
| `privateGetGetTradesHistory` | GET | `GetTradesHistory` | 1 |
| `privateGetGetOpenOrders` | GET | `GetOpenOrders` | 1 |
| `privateGetGetOpenQuotes` | GET | `GetOpenQuotes` | 1 |
| `privateGetGetOrderFee` | GET | `GetOrderFee` | 1 |
| `privateGetGetOrderHistory` | GET | `GetOrderHistory` | 1 |
| `privateGetGetOrdersHistory` | GET | `GetOrdersHistory` | 1 |
| `privateGetGetOrderStatus` | GET | `GetOrderStatus` | 1 |
| `privateGetGetOmsFeeTiers` | GET | `GetOmsFeeTiers` | 1 |
| `privateGetGetAccountDepositTransactions` | GET | `GetAccountDepositTransactions` | 1 |
| `privateGetGetAccountWithdrawTransactions` | GET | `GetAccountWithdrawTransactions` | 1 |
| `privateGetGetAllDepositRequestInfoTemplates` | GET | `GetAllDepositRequestInfoTemplates` | 1 |
| `privateGetGetDepositInfo` | GET | `GetDepositInfo` | 1 |
| `privateGetGetDepositRequestInfoTemplate` | GET | `GetDepositRequestInfoTemplate` | 1 |
| `privateGetGetDeposits` | GET | `GetDeposits` | 1 |
| `privateGetGetDepositTicket` | GET | `GetDepositTicket` | 1 |
| `privateGetGetDepositTickets` | GET | `GetDepositTickets` | 1 |
| `privateGetGetOMSWithdrawFees` | GET | `GetOMSWithdrawFees` | 1 |
| `privateGetGetWithdrawFee` | GET | `GetWithdrawFee` | 1 |
| `privateGetGetWithdraws` | GET | `GetWithdraws` | 1 |
| `privateGetGetWithdrawTemplate` | GET | `GetWithdrawTemplate` | 1 |
| `privateGetGetWithdrawTemplateTypes` | GET | `GetWithdrawTemplateTypes` | 1 |
| `privateGetGetWithdrawTicket` | GET | `GetWithdrawTicket` | 1 |
| `privateGetGetWithdrawTicketAttachment` | GET | `GetWithdrawTicketAttachment` | 1 |
| `privateGetGetWithdrawTickets` | GET | `GetWithdrawTickets` | 1 |
| `privateGetGetDepositTicketAttachment` | GET | `GetDepositTicketAttachment` | 1 |
| `privatePostAddUserAffiliateTag` | POST | `AddUserAffiliateTag` | 1 |
| `privatePostAddDepositTicketAttachment` | POST | `AddDepositTicketAttachment` | 1 |
| `privatePostAddWithdrawTicketAttachment` | POST | `AddWithdrawTicketAttachment` | 1 |
| `privatePostCancelUserReport` | POST | `CancelUserReport` | 1 |
| `privatePostRegisterNewDevice` | POST | `RegisterNewDevice` | 1 |
| `privatePostSubscribeAccountEvents` | POST | `SubscribeAccountEvents` | 1 |
| `privatePostUpdateUserAffiliateTag` | POST | `UpdateUserAffiliateTag` | 1 |
| `privatePostGenerateTradeActivityReport` | POST | `GenerateTradeActivityReport` | 1 |
| `privatePostGenerateTransactionActivityReport` | POST | `GenerateTransactionActivityReport` | 1 |
| `privatePostGenerateTreasuryActivityReport` | POST | `GenerateTreasuryActivityReport` | 1 |
| `privatePostScheduleTradeActivityReport` | POST | `ScheduleTradeActivityReport` | 1 |
| `privatePostScheduleTransactionActivityReport` | POST | `ScheduleTransactionActivityReport` | 1 |
| `privatePostScheduleTreasuryActivityReport` | POST | `ScheduleTreasuryActivityReport` | 1 |
| `privatePostCancelAllOrders` | POST | `CancelAllOrders` | 1 |
| `privatePostCancelOrder` | POST | `CancelOrder` | 1 |
| `privatePostCancelQuote` | POST | `CancelQuote` | 1 |
| `privatePostCancelReplaceOrder` | POST | `CancelReplaceOrder` | 1 |
| `privatePostCreateQuote` | POST | `CreateQuote` | 1 |
| `privatePostModifyOrder` | POST | `ModifyOrder` | 1 |
| `privatePostSendOrder` | POST | `SendOrder` | 1 |
| `privatePostSubmitBlockTrade` | POST | `SubmitBlockTrade` | 1 |
| `privatePostUpdateQuote` | POST | `UpdateQuote` | 1 |
| `privatePostCancelWithdraw` | POST | `CancelWithdraw` | 1 |
| `privatePostCreateDepositTicket` | POST | `CreateDepositTicket` | 1 |
| `privatePostCreateWithdrawTicket` | POST | `CreateWithdrawTicket` | 1 |
| `privatePostSubmitDepositTicketComment` | POST | `SubmitDepositTicketComment` | 1 |
| `privatePostSubmitWithdrawTicketComment` | POST | `SubmitWithdrawTicketComment` | 1 |
| `privatePostGetOrderHistoryByOrderId` | POST | `GetOrderHistoryByOrderId` | 1 |

