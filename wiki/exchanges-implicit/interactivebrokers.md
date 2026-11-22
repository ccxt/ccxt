Every endpoint in `interactivebrokers`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/interactivebrokers) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `webapiGetV1ApiIserverAccountPnlPartitioned`); Python and PHP use the snake_case form (`webapi_get_v1_api_iserver_account_pnl_partitioned`), and Go uses the PascalCase form (`WebapiGetV1ApiIserverAccountPnlPartitioned`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const interactivebrokers = new ccxt.interactivebrokers ();
const response = await interactivebrokers.webapiGetV1ApiIserverAccountPnlPartitioned (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const interactivebrokers = new ccxt.interactivebrokers ();
const response = await interactivebrokers.webapiGetV1ApiIserverAccountPnlPartitioned (params);
```

#### **Python**

```python
import ccxt
interactivebrokers = ccxt.interactivebrokers()
response = interactivebrokers.webapi_get_v1_api_iserver_account_pnl_partitioned(params)
```

#### **PHP**

```php
$interactivebrokers = new \ccxt\interactivebrokers();
$response = $interactivebrokers->webapi_get_v1_api_iserver_account_pnl_partitioned($params);
```

#### **C#**

```csharp
using ccxt;
var interactivebrokers = new Interactivebrokers();
var response = await interactivebrokers.webapiGetV1ApiIserverAccountPnlPartitioned(parameters);
```

#### **Go**

```go
interactivebrokers := ccxt.NewInteractivebrokers(nil)
response := <-interactivebrokers.WebapiGetV1ApiIserverAccountPnlPartitioned(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official interactivebrokers API documentation:** [interactivebrokers.com](https://www.interactivebrokers.com/docs/web-api/introduction) · [ndcdyn.interactivebrokers.com](https://ndcdyn.interactivebrokers.com/oauth/?loginType=1&action=OAUTH&clt=0&RL=1&ip2loc=US#/configuration) · [github.com](https://github.com/Voyz/ibind/blob/master/docs/oauth/oauth_1a.md#enabling_oauth1a)

> 193 implicit endpoints across 1 access group.

## webapi

**Base URL**: `https://api.ibkr.com/`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `webapiGetV1ApiIserverAccountPnlPartitioned` | GET | `v1/api/iserver/account/pnl/partitioned` | 1 |
| `webapiGetV1ApiAceswsAccountIdSignaturesAndOwners` | GET | `v1/api/acesws/:accountId/signatures-and-owners` | 1 |
| `webapiGetV1ApiIserverAccounts` | GET | `v1/api/iserver/accounts` | 1 |
| `webapiGetV1ApiIserverAccountSearchSearchPattern` | GET | `v1/api/iserver/account/search/:searchPattern` | 1 |
| `webapiGetV1ApiIserverAccountAccountIdSummaryBalances` | GET | `v1/api/iserver/account/:accountId/summary/balances` | 1 |
| `webapiGetV1ApiIserverAccountAccountIdSummaryMargins` | GET | `v1/api/iserver/account/:accountId/summary/margins` | 1 |
| `webapiGetV1ApiIserverAccountAccountIdSummaryMarketValue` | GET | `v1/api/iserver/account/:accountId/summary/market_value` | 1 |
| `webapiGetV1ApiIserverAccountAccountIdSummary` | GET | `v1/api/iserver/account/:accountId/summary` | 1 |
| `webapiGetV1ApiIserverAccountAccountIdSummaryAvailableFunds` | GET | `v1/api/iserver/account/:accountId/summary/available_funds` | 1 |
| `webapiGetV1ApiIserverAccountMta` | GET | `v1/api/iserver/account/mta` | 1 |
| `webapiGetV1ApiIserverAccountAlertAlertId` | GET | `v1/api/iserver/account/alert/:alertId` | 1 |
| `webapiGetV1ApiIserverAccountAccountIdAlerts` | GET | `v1/api/iserver/account/:accountId/alerts` | 1 |
| `webapiGetV1ApiIserverCurrencyPairs` | GET | `v1/api/iserver/currency/pairs` | 1 |
| `webapiGetV1ApiIserverExchangerate` | GET | `v1/api/iserver/exchangerate` | 1 |
| `webapiGetV1ApiIserverContractConidInfo` | GET | `v1/api/iserver/contract/:conid/info` | 1 |
| `webapiGetV1ApiIserverSecdefInfo` | GET | `v1/api/iserver/secdef/info` | 1 |
| `webapiGetV1ApiTrsrvSecdef` | GET | `v1/api/trsrv/secdef` | 1 |
| `webapiGetV1ApiIserverContractConidInfoAndRules` | GET | `v1/api/iserver/contract/:conid/info-and-rules` | 1 |
| `webapiGetV1ApiTrsrvAllConids` | GET | `v1/api/trsrv/all-conids` | 1 |
| `webapiGetV1ApiIserverContractConidAlgos` | GET | `v1/api/iserver/contract/:conid/algos` | 1 |
| `webapiGetV1ApiIserverSecdefBondFilters` | GET | `v1/api/iserver/secdef/bond-filters` | 1 |
| `webapiGetV1ApiTrsrvFutures` | GET | `v1/api/trsrv/futures` | 1 |
| `webapiGetV1ApiIserverSecdefSearch` | GET | `v1/api/iserver/secdef/search` | 1 |
| `webapiGetV1ApiTrsrvStocks` | GET | `v1/api/trsrv/stocks` | 1 |
| `webapiGetV1ApiIserverSecdefStrikes` | GET | `v1/api/iserver/secdef/strikes` | 1 |
| `webapiGetV1ApiTrsrvSecdefSchedule` | GET | `v1/api/trsrv/secdef/schedule` | 1 |
| `webapiGetV1ApiForecastCategoryTree` | GET | `v1/api/forecast/category/tree` | 1 |
| `webapiGetV1ApiForecastContractDetails` | GET | `v1/api/forecast/contract/details` | 1 |
| `webapiGetV1ApiForecastContractRules` | GET | `v1/api/forecast/contract/rules` | 1 |
| `webapiGetV1ApiForecastContractSchedules` | GET | `v1/api/forecast/contract/schedules` | 1 |
| `webapiGetV1ApiForecastContractMarket` | GET | `v1/api/forecast/contract/market` | 1 |
| `webapiGetV1ApiIserverAccountAllocationGroup` | GET | `v1/api/iserver/account/allocation/group` | 1 |
| `webapiGetV1ApiIserverAccountAllocationAccounts` | GET | `v1/api/iserver/account/allocation/accounts` | 1 |
| `webapiGetV1ApiIserverAccountAllocationPresets` | GET | `v1/api/iserver/account/allocation/presets` | 1 |
| `webapiGetV1ApiIserverAccountAllocationModels` | GET | `v1/api/iserver/account/allocation/models` | 1 |
| `webapiGetV1ApiFyiDeliveryoptions` | GET | `v1/api/fyi/deliveryoptions` | 1 |
| `webapiGetV1ApiFyiDisclaimerTypecode` | GET | `v1/api/fyi/disclaimer/:typecode` | 1 |
| `webapiGetV1ApiFyiSettings` | GET | `v1/api/fyi/settings` | 1 |
| `webapiGetV1ApiFyiUnreadnumber` | GET | `v1/api/fyi/unreadnumber` | 1 |
| `webapiGetV1ApiFyiNotifications` | GET | `v1/api/fyi/notifications` | 1 |
| `webapiGetV1ApiIserverMarketdataUnsubscribeall` | GET | `v1/api/iserver/marketdata/unsubscribeall` | 1 |
| `webapiGetV1ApiIserverMarketdataHistory` | GET | `v1/api/iserver/marketdata/history` | 1 |
| `webapiGetV1ApiIserverMarketdataSnapshot` | GET | `v1/api/iserver/marketdata/snapshot` | 1 |
| `webapiGetV1ApiIserverAccountOrders` | GET | `v1/api/iserver/account/orders` | 1 |
| `webapiGetV1ApiIserverAccountOrderStatusOrderId` | GET | `v1/api/iserver/account/order/status/:orderId` | 1 |
| `webapiGetV1ApiIserverAccountTrades` | GET | `v1/api/iserver/account/trades` | 1 |
| `webapiGetV1ApiPortfolioAccountIdAllocation` | GET | `v1/api/portfolio/:accountId/allocation` | 1 |
| `webapiGetV1ApiPortfolioAccountIdMeta` | GET | `v1/api/portfolio/:accountId/meta` | 1 |
| `webapiGetV1ApiPortfolioAccountIdLedger` | GET | `v1/api/portfolio/:accountId/ledger` | 1 |
| `webapiGetV1ApiPortfolioAccountIdSummary` | GET | `v1/api/portfolio/:accountId/summary` | 1 |
| `webapiGetV1ApiPortfolioAccountIdPositionConid` | GET | `v1/api/portfolio/:accountId/position/:conid` | 1 |
| `webapiGetV1ApiPortfolioAccountIdPositionsPageId` | GET | `v1/api/portfolio/:accountId/positions/:pageId` | 1 |
| `webapiGetV1ApiPortfolio2AccountIdPositions` | GET | `v1/api/portfolio2/:accountId/positions` | 1 |
| `webapiGetV1ApiPortfolioPositionsConid` | GET | `v1/api/portfolio/positions/:conid` | 1 |
| `webapiGetV1ApiPortfolioAccountIdComboPositions` | GET | `v1/api/portfolio/:accountId/combo/positions` | 1 |
| `webapiGetV1ApiPortfolioAccounts` | GET | `v1/api/portfolio/accounts` | 1 |
| `webapiGetV1ApiPortfolioSubaccounts` | GET | `v1/api/portfolio/subaccounts` | 1 |
| `webapiGetV1ApiPortfolioSubaccounts2` | GET | `v1/api/portfolio/subaccounts2` | 1 |
| `webapiGetV1ApiSsoValidate` | GET | `v1/api/sso/validate` | 1 |
| `webapiGetV1ApiIserverScannerParams` | GET | `v1/api/iserver/scanner/params` | 1 |
| `webapiGetV1ApiIserverWatchlist` | GET | `v1/api/iserver/watchlist` | 1 |
| `webapiGetV1ApiIserverWatchlists` | GET | `v1/api/iserver/watchlists` | 1 |
| `webapiGetGwApiV1AccountsAccountIdDetails` | GET | `gw/api/v1/accounts/:accountId/details` | 1 |
| `webapiGetGwApiV1AccountsStatus` | GET | `gw/api/v1/accounts/status` | 1 |
| `webapiGetGwApiV1AccountsAccountIdLoginMessages` | GET | `gw/api/v1/accounts/:accountId/login-messages` | 1 |
| `webapiGetGwApiV1AccountsLoginMessages` | GET | `gw/api/v1/accounts/login-messages` | 1 |
| `webapiGetGwApiV1AccountsAccountIdTasks` | GET | `gw/api/v1/accounts/:accountId/tasks` | 1 |
| `webapiGetGwApiV1AccountsAccountIdStatus` | GET | `gw/api/v1/accounts/:accountId/status` | 1 |
| `webapiGetGwApiV1AccountsAccountIdKyc` | GET | `gw/api/v1/accounts/:accountId/kyc` | 1 |
| `webapiGetGwApiV1Accounts` | GET | `gw/api/v1/accounts` | 1 |
| `webapiGetGwApiV1ClientInstructionsClientInstructionId` | GET | `gw/api/v1/client-instructions/:clientInstructionId` | 1 |
| `webapiGetGwApiV1InstructionsInstructionId` | GET | `gw/api/v1/instructions/:instructionId` | 1 |
| `webapiGetGwApiV1InstructionSetsInstructionSetId` | GET | `gw/api/v1/instruction-sets/:instructionSetId` | 1 |
| `webapiGetGwApiV1StatementsAvailable` | GET | `gw/api/v1/statements/available` | 1 |
| `webapiGetGwApiV1TaxDocumentsAvailable` | GET | `gw/api/v1/tax-documents/available` | 1 |
| `webapiGetGwApiV1TradeConfirmationsAvailable` | GET | `gw/api/v1/trade-confirmations/available` | 1 |
| `webapiGetGwApiV1EnumerationsComplexAssetTransfer` | GET | `gw/api/v1/enumerations/complex-asset-transfer` | 1 |
| `webapiGetGwApiV1EnumerationsEnumerationType` | GET | `gw/api/v1/enumerations/:enumerationType` | 1 |
| `webapiGetGwApiV1Forms` | GET | `gw/api/v1/forms` | 1 |
| `webapiGetGwApiV1ParticipatingBanks` | GET | `gw/api/v1/participating-banks` | 1 |
| `webapiGetGwApiV1Requests` | GET | `gw/api/v1/requests` | 1 |
| `webapiGetGwApiV1FormsRequiredForms` | GET | `gw/api/v1/forms/required-forms` | 1 |
| `webapiGetGwApiV1RequestsRequestIdStatus` | GET | `gw/api/v1/requests/:requestId/status` | 1 |
| `webapiGetGwApiV1ValidationsUsernamesUsername` | GET | `gw/api/v1/validations/usernames/:username` | 1 |
| `webapiGetGwApiV1RestrictionsList` | GET | `gw/api/v1/restrictions/list` | 1 |
| `webapiGetGwApiV1RestrictionsListsIds` | GET | `gw/api/v1/restrictions/lists/ids` | 1 |
| `webapiGetGwApiV1RestrictionsRestriction` | GET | `gw/api/v1/restrictions/restriction` | 1 |
| `webapiGetGwApiV1RestrictionsIds` | GET | `gw/api/v1/restrictions/ids` | 1 |
| `webapiGetGwApiV1RestrictionsUser` | GET | `gw/api/v1/restrictions/user` | 1 |
| `webapiGetGwApiV1RestrictionsAccount` | GET | `gw/api/v1/restrictions/account` | 1 |
| `webapiGetGwApiV1RestrictionsRestrictionScope` | GET | `gw/api/v1/restrictions/restriction-scope` | 1 |
| `webapiGetGwApiV1TaxVouchersRequestIdDownload` | GET | `gw/api/v1/tax-vouchers/:requestId/download` | 1 |
| `webapiGetGwApiV1TaxVouchersDividends` | GET | `gw/api/v1/tax-vouchers/dividends` | 1 |
| `webapiGetGwApiV1TaxVouchersActiveCountries` | GET | `gw/api/v1/tax-vouchers/active-countries` | 1 |
| `webapiGetGwApiV1TaxVouchersYears` | GET | `gw/api/v1/tax-vouchers/years` | 1 |
| `webapiGetGwApiV1TaxVouchersRequestIdState` | GET | `gw/api/v1/tax-vouchers/:requestId/state` | 1 |
| `webapiGetGwApiV1EchoHttps` | GET | `gw/api/v1/echo/https` | 1 |
| `webapiGetV1ApiMdRegsnapshot` | GET | `v1/api/md/regsnapshot` | 1 |
| `webapiGetV1ApiContractTradingSchedule` | GET | `v1/api/contract/trading-schedule` | 1 |
| `webapiPostV1ApiOauthRequestToken` | POST | `v1/api/oauth/request_token` | 1 |
| `webapiPostV1ApiOauthAccessToken` | POST | `v1/api/oauth/access_token` | 1 |
| `webapiPostV1ApiOauthLiveSessionToken` | POST | `v1/api/oauth/live_session_token` | 1 |
| `webapiPostGwApiV1SsoBrowserSessions` | POST | `gw/api/v1/sso-browser-sessions` | 1 |
| `webapiPostGwApiV1SsoSessions` | POST | `gw/api/v1/sso-sessions` | 1 |
| `webapiPostOauth2ApiV1Token` | POST | `oauth2/api/v1/token` | 1 |
| `webapiPostV1ApiIserverDynaccount` | POST | `v1/api/iserver/dynaccount` | 1 |
| `webapiPostV1ApiIserverAccount` | POST | `v1/api/iserver/account` | 1 |
| `webapiPostV1ApiIserverAccountAccountIdAlertActivate` | POST | `v1/api/iserver/account/:accountId/alert/activate` | 1 |
| `webapiPostV1ApiIserverAccountAccountIdAlert` | POST | `v1/api/iserver/account/:accountId/alert` | 1 |
| `webapiPostV1ApiIserverContractRules` | POST | `v1/api/iserver/contract/rules` | 1 |
| `webapiPostV1ApiIserverSecdefSearch` | POST | `v1/api/iserver/secdef/search` | 1 |
| `webapiPostV1ApiIserverAccountAllocationGroup` | POST | `v1/api/iserver/account/allocation/group` | 1 |
| `webapiPostV1ApiIserverAccountAllocationGroupDelete` | POST | `v1/api/iserver/account/allocation/group/delete` | 1 |
| `webapiPostV1ApiIserverAccountAllocationGroupSingle` | POST | `v1/api/iserver/account/allocation/group/single` | 1 |
| `webapiPostV1ApiIserverAccountAllocationPresets` | POST | `v1/api/iserver/account/allocation/presets` | 1 |
| `webapiPostV1ApiFaFaPresetGet` | POST | `v1/api/fa/fa-preset/get` | 1 |
| `webapiPostV1ApiFaModelAccountsDetails` | POST | `v1/api/fa/model/accounts-details` | 1 |
| `webapiPostV1ApiFaModelInvestDivest` | POST | `v1/api/fa/model/invest-divest` | 1 |
| `webapiPostV1ApiFaIsFullMaster` | POST | `v1/api/fa/is-full-master` | 1 |
| `webapiPostV1ApiFaModelCashAnalyzer` | POST | `v1/api/fa/model/cash-analyzer` | 1 |
| `webapiPostV1ApiFaModelRebalanceToExistingTargets` | POST | `v1/api/fa/model/rebalance/to-existing-targets` | 1 |
| `webapiPostV1ApiFaModelRebalanceToNewTargets` | POST | `v1/api/fa/model/rebalance/to-new-targets` | 1 |
| `webapiPostV1ApiFaModelRebalanceToSpecificTargets` | POST | `v1/api/fa/model/rebalance/to-specific-targets` | 1 |
| `webapiPostV1ApiFaModelList` | POST | `v1/api/fa/model/list` | 1 |
| `webapiPostV1ApiFaModelPositions` | POST | `v1/api/fa/model/positions` | 1 |
| `webapiPostV1ApiFaModelSummary` | POST | `v1/api/fa/model/summary` | 1 |
| `webapiPostV1ApiFaModelSave` | POST | `v1/api/fa/model/save` | 1 |
| `webapiPostV1ApiFaFaPresetSave` | POST | `v1/api/fa/fa-preset/save` | 1 |
| `webapiPostV1ApiIserverAccountModelCodeOrders` | POST | `v1/api/iserver/account/:modelCode/orders` | 1 |
| `webapiPostV1ApiFaModelSubmitTransfers` | POST | `v1/api/fa/model/submit-transfers` | 1 |
| `webapiPostV1ApiFaModelInvestDivestPositions` | POST | `v1/api/fa/model/invest-divest-positions` | 1 |
| `webapiPostV1ApiFaModelTwsInvestDivest` | POST | `v1/api/fa/model/tws-invest-divest` | 1 |
| `webapiPostV1ApiFyiSettingsTypecode` | POST | `v1/api/fyi/settings/:typecode` | 1 |
| `webapiPostV1ApiFyiDeliveryoptionsDevice` | POST | `v1/api/fyi/deliveryoptions/device` | 1 |
| `webapiPostV1ApiIserverMarketdataUnsubscribe` | POST | `v1/api/iserver/marketdata/unsubscribe` | 1 |
| `webapiPostV1ApiIserverReplyReplyId` | POST | `v1/api/iserver/reply/:replyId` | 1 |
| `webapiPostV1ApiIserverNotification` | POST | `v1/api/iserver/notification` | 1 |
| `webapiPostV1ApiIserverAccountAccountIdOrderOrderId` | POST | `v1/api/iserver/account/:accountId/order/:orderId` | 1 |
| `webapiPostV1ApiIserverAccountAccountIdOrdersWhatif` | POST | `v1/api/iserver/account/:accountId/orders/whatif` | 1 |
| `webapiPostV1ApiIserverQuestionsSuppressReset` | POST | `v1/api/iserver/questions/suppress/reset` | 1 |
| `webapiPostV1ApiIserverAccountAccountIdOrders` | POST | `v1/api/iserver/account/:accountId/orders` | 1 |
| `webapiPostV1ApiIserverQuestionsSuppress` | POST | `v1/api/iserver/questions/suppress` | 1 |
| `webapiPostV1ApiPortfolioAccountIdPositionsInvalidate` | POST | `v1/api/portfolio/:accountId/positions/invalidate` | 1 |
| `webapiPostV1ApiPaPerformance` | POST | `v1/api/pa/performance` | 1 |
| `webapiPostV1ApiPaAllperiods` | POST | `v1/api/pa/allperiods` | 1 |
| `webapiPostV1ApiPaAllocation` | POST | `v1/api/pa/allocation` | 1 |
| `webapiPostV1ApiPaTransactions` | POST | `v1/api/pa/transactions` | 1 |
| `webapiPostV1ApiIserverScannerRun` | POST | `v1/api/iserver/scanner/run` | 1 |
| `webapiPostV1ApiTickle` | POST | `v1/api/tickle` | 1 |
| `webapiPostV1ApiIserverAuthStatus` | POST | `v1/api/iserver/auth/status` | 1 |
| `webapiPostV1ApiIserverAuthSsodhInit` | POST | `v1/api/iserver/auth/ssodh/init` | 1 |
| `webapiPostV1ApiIserverWatchlist` | POST | `v1/api/iserver/watchlist` | 1 |
| `webapiPostGwApiV1AccountsAccountIdTasks` | POST | `gw/api/v1/accounts/:accountId/tasks` | 1 |
| `webapiPostGwApiV1Accounts` | POST | `gw/api/v1/accounts` | 1 |
| `webapiPostGwApiV1AccountsDocuments` | POST | `gw/api/v1/accounts/documents` | 1 |
| `webapiPostGwApiV1InstructionsCancel` | POST | `gw/api/v1/instructions/cancel` | 1 |
| `webapiPostGwApiV1BankInstructionsBulk` | POST | `gw/api/v1/bank-instructions:bulk` | 1 |
| `webapiPostGwApiV1InstructionsCancelBulk` | POST | `gw/api/v1/instructions/cancel:bulk` | 1 |
| `webapiPostGwApiV1ExternalAssetTransfersBulk` | POST | `gw/api/v1/external-asset-transfers:bulk` | 1 |
| `webapiPostGwApiV2ExternalAssetTransfersBulk` | POST | `gw/api/v2/external-asset-transfers:bulk` | 1 |
| `webapiPostGwApiV1ExternalCashTransfersBulk` | POST | `gw/api/v1/external-cash-transfers:bulk` | 1 |
| `webapiPostGwApiV1InternalAssetTransfersBulk` | POST | `gw/api/v1/internal-asset-transfers:bulk` | 1 |
| `webapiPostGwApiV1InternalCashTransfersBulk` | POST | `gw/api/v1/internal-cash-transfers:bulk` | 1 |
| `webapiPostGwApiV1InstructionsQuery` | POST | `gw/api/v1/instructions/query` | 1 |
| `webapiPostGwApiV1BankInstructions` | POST | `gw/api/v1/bank-instructions` | 1 |
| `webapiPostGwApiV1ExternalCashTransfers` | POST | `gw/api/v1/external-cash-transfers` | 1 |
| `webapiPostGwApiV1InternalCashTransfers` | POST | `gw/api/v1/internal-cash-transfers` | 1 |
| `webapiPostGwApiV1ExternalAssetTransfers` | POST | `gw/api/v1/external-asset-transfers` | 1 |
| `webapiPostGwApiV2ExternalAssetTransfers` | POST | `gw/api/v2/external-asset-transfers` | 1 |
| `webapiPostGwApiV1InternalAssetTransfers` | POST | `gw/api/v1/internal-asset-transfers` | 1 |
| `webapiPostGwApiV1BankInstructionsQuery` | POST | `gw/api/v1/bank-instructions/query` | 1 |
| `webapiPostGwApiV1ExternalCashTransfersQuery` | POST | `gw/api/v1/external-cash-transfers/query` | 1 |
| `webapiPostGwApiV1TaxDocuments` | POST | `gw/api/v1/tax-documents` | 1 |
| `webapiPostGwApiV1TradeConfirmations` | POST | `gw/api/v1/trade-confirmations` | 1 |
| `webapiPostGwApiV1Statements` | POST | `gw/api/v1/statements` | 1 |
| `webapiPostGwApiV1Restrictions` | POST | `gw/api/v1/restrictions` | 1 |
| `webapiPostGwApiV1RestrictionsVerify` | POST | `gw/api/v1/restrictions/verify` | 1 |
| `webapiPostGwApiV1BalancesQuery` | POST | `gw/api/v1/balances/query` | 1 |
| `webapiPostGwApiV1TaxVouchers` | POST | `gw/api/v1/tax-vouchers` | 1 |
| `webapiPostGwApiV1EchoSignedJwt` | POST | `gw/api/v1/echo/signed-jwt` | 1 |
| `webapiPostV1ApiLogout` | POST | `v1/api/logout` | 1 |
| `webapiPutV1ApiIserverAccountAllocationGroup` | PUT | `v1/api/iserver/account/allocation/group` | 1 |
| `webapiPutV1ApiFyiDisclaimerTypecode` | PUT | `v1/api/fyi/disclaimer/:typecode` | 1 |
| `webapiPutV1ApiFyiNotificationsNotificationId` | PUT | `v1/api/fyi/notifications/:notificationId` | 1 |
| `webapiPutV1ApiFyiDeliveryoptionsEmail` | PUT | `v1/api/fyi/deliveryoptions/email` | 1 |
| `webapiDeleteV1ApiIserverAccountAccountIdAlertAlertId` | DELETE | `v1/api/iserver/account/:accountId/alert/:alertId` | 1 |
| `webapiDeleteV1ApiFyiDeliveryoptionsDeviceId` | DELETE | `v1/api/fyi/deliveryoptions/:deviceId` | 1 |
| `webapiDeleteV1ApiIserverAccountAccountIdOrderOrderId` | DELETE | `v1/api/iserver/account/:accountId/order/:orderId` | 1 |
| `webapiDeleteV1ApiIserverWatchlist` | DELETE | `v1/api/iserver/watchlist` | 1 |
| `webapiPatchGwApiV1Accounts` | PATCH | `gw/api/v1/accounts` | 1 |
| `webapiPatchGwApiV1AccountsAccountIdStatus` | PATCH | `gw/api/v1/accounts/:accountId/status` | 1 |
| `webapiPatchGwApiV1AccountsAccountIdTasks` | PATCH | `gw/api/v1/accounts/:accountId/tasks` | 1 |
| `webapiPatchGwApiV1RequestsRequestIdStatus` | PATCH | `gw/api/v1/requests/:requestId/status` | 1 |

