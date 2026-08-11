Every endpoint in `htx`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/htx) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `v2PublicGetReferenceCurrencies`); the snake_case alias (`v2Public_get_reference_currencies`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`V2PublicGetReferenceCurrencies`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const htx = new ccxt.htx ();
const response = await htx.v2PublicGetReferenceCurrencies (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const htx = new ccxt.htx ();
const response = await htx.v2PublicGetReferenceCurrencies (params);
```

#### **Python**

```python
import ccxt
htx = ccxt.htx()
response = htx.v2Public_get_reference_currencies(params)
```

#### **PHP**

```php
$htx = new \ccxt\htx();
$response = $htx->v2Public_get_reference_currencies($params);
```

#### **C#**

```csharp
using ccxt;
var htx = new Htx();
var response = await htx.v2PublicGetReferenceCurrencies(parameters);
```

#### **Go**

```go
htx := ccxt.NewHtx(nil)
response := <-htx.V2PublicGetReferenceCurrencies(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official htx API documentation:** [huobiapi.github.io](https://huobiapi.github.io/docs/spot/v1/en/) · [huobiapi.github.io](https://huobiapi.github.io/docs/dm/v1/en/) · [huobiapi.github.io](https://huobiapi.github.io/docs/coin_margined_swap/v1/en/) · [huobiapi.github.io](https://huobiapi.github.io/docs/usdt_swap/v1/en/) · [huobi.com](https://www.huobi.com/en-us/opend/newApiPages/)

> 465 implicit endpoints across 7 access groups.

## v2Public

**Base URL**: `https://{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2PublicGetReferenceCurrencies` | GET | `reference/currencies` | 1 |
| `v2PublicGetMarketStatus` | GET | `market-status` | 1 |

## v2Private

**Base URL**: `https://{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2PrivateGetAccountLedger` | GET | `account/ledger` | 1 |
| `v2PrivateGetAccountWithdrawQuota` | GET | `account/withdraw/quota` | 1 |
| `v2PrivateGetAccountWithdrawAddress` | GET | `account/withdraw/address` | 1 |
| `v2PrivateGetAccountDepositAddress` | GET | `account/deposit/address` | 1 |
| `v2PrivateGetAccountRepayment` | GET | `account/repayment` | 5 |
| `v2PrivateGetReferenceTransactFeeRate` | GET | `reference/transact-fee-rate` | 1 |
| `v2PrivateGetAccountAssetValuation` | GET | `account/asset-valuation` | 0.2 |
| `v2PrivateGetPointAccount` | GET | `point/account` | 5 |
| `v2PrivateGetSubUserUserList` | GET | `sub-user/user-list` | 1 |
| `v2PrivateGetSubUserUserState` | GET | `sub-user/user-state` | 1 |
| `v2PrivateGetSubUserAccountList` | GET | `sub-user/account-list` | 1 |
| `v2PrivateGetSubUserDepositAddress` | GET | `sub-user/deposit-address` | 1 |
| `v2PrivateGetSubUserQueryDeposit` | GET | `sub-user/query-deposit` | 1 |
| `v2PrivateGetUserApiKey` | GET | `user/api-key` | 1 |
| `v2PrivateGetUserUid` | GET | `user/uid` | 1 |
| `v2PrivateGetAlgoOrdersOpening` | GET | `algo-orders/opening` | 1 |
| `v2PrivateGetAlgoOrdersHistory` | GET | `algo-orders/history` | 1 |
| `v2PrivateGetAlgoOrdersSpecific` | GET | `algo-orders/specific` | 1 |
| `v2PrivateGetC2cOffers` | GET | `c2c/offers` | 1 |
| `v2PrivateGetC2cOffer` | GET | `c2c/offer` | 1 |
| `v2PrivateGetC2cTransactions` | GET | `c2c/transactions` | 1 |
| `v2PrivateGetC2cRepayment` | GET | `c2c/repayment` | 1 |
| `v2PrivateGetC2cAccount` | GET | `c2c/account` | 1 |
| `v2PrivateGetEtpReference` | GET | `etp/reference` | 1 |
| `v2PrivateGetEtpTransactions` | GET | `etp/transactions` | 5 |
| `v2PrivateGetEtpTransaction` | GET | `etp/transaction` | 5 |
| `v2PrivateGetEtpRebalance` | GET | `etp/rebalance` | 1 |
| `v2PrivateGetEtpLimit` | GET | `etp/limit` | 1 |
| `v2PrivatePostAccountTransfer` | POST | `account/transfer` | 1 |
| `v2PrivatePostAccountRepayment` | POST | `account/repayment` | 5 |
| `v2PrivatePostPointTransfer` | POST | `point/transfer` | 5 |
| `v2PrivatePostSubUserManagement` | POST | `sub-user/management` | 1 |
| `v2PrivatePostSubUserCreation` | POST | `sub-user/creation` | 1 |
| `v2PrivatePostSubUserTradableMarket` | POST | `sub-user/tradable-market` | 1 |
| `v2PrivatePostSubUserTransferability` | POST | `sub-user/transferability` | 1 |
| `v2PrivatePostSubUserApiKeyGeneration` | POST | `sub-user/api-key-generation` | 1 |
| `v2PrivatePostSubUserApiKeyModification` | POST | `sub-user/api-key-modification` | 1 |
| `v2PrivatePostSubUserApiKeyDeletion` | POST | `sub-user/api-key-deletion` | 1 |
| `v2PrivatePostSubUserDeductMode` | POST | `sub-user/deduct-mode` | 1 |
| `v2PrivatePostAlgoOrders` | POST | `algo-orders` | 1 |
| `v2PrivatePostAlgoOrdersCancelAllAfter` | POST | `algo-orders/cancel-all-after` | 1 |
| `v2PrivatePostAlgoOrdersCancellation` | POST | `algo-orders/cancellation` | 1 |
| `v2PrivatePostC2cOffer` | POST | `c2c/offer` | 1 |
| `v2PrivatePostC2cCancellation` | POST | `c2c/cancellation` | 1 |
| `v2PrivatePostC2cCancelAll` | POST | `c2c/cancel-all` | 1 |
| `v2PrivatePostC2cRepayment` | POST | `c2c/repayment` | 1 |
| `v2PrivatePostC2cTransfer` | POST | `c2c/transfer` | 1 |
| `v2PrivatePostEtpCreation` | POST | `etp/creation` | 5 |
| `v2PrivatePostEtpRedemption` | POST | `etp/redemption` | 5 |
| `v2PrivatePostEtpTransactIdCancel` | POST | `etp/{transactId}/cancel` | 10 |
| `v2PrivatePostEtpBatchCancel` | POST | `etp/batch-cancel` | 50 |

## public

**Base URL**: `https://{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetCommonSymbols` | GET | `common/symbols` | 1 |
| `publicGetCommonCurrencys` | GET | `common/currencys` | 1 |
| `publicGetCommonTimestamp` | GET | `common/timestamp` | 1 |
| `publicGetCommonExchange` | GET | `common/exchange` | 1 |
| `publicGetSettingsCurrencys` | GET | `settings/currencys` | 1 |

## private

**Base URL**: `https://{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAccountAccounts` | GET | `account/accounts` | 0.2 |
| `privateGetAccountAccountsIdBalance` | GET | `account/accounts/{id}/balance` | 0.2 |
| `privateGetAccountAccountsSubUid` | GET | `account/accounts/{sub-uid}` | 1 |
| `privateGetAccountHistory` | GET | `account/history` | 4 |
| `privateGetCrossMarginLoanInfo` | GET | `cross-margin/loan-info` | 1 |
| `privateGetMarginLoanInfo` | GET | `margin/loan-info` | 1 |
| `privateGetFeeFeeRateGet` | GET | `fee/fee-rate/get` | 1 |
| `privateGetOrderOpenOrders` | GET | `order/openOrders` | 0.4 |
| `privateGetOrderOrders` | GET | `order/orders` | 0.4 |
| `privateGetOrderOrdersId` | GET | `order/orders/{id}` | 0.4 |
| `privateGetOrderOrdersIdMatchresults` | GET | `order/orders/{id}/matchresults` | 0.4 |
| `privateGetOrderOrdersGetClientOrder` | GET | `order/orders/getClientOrder` | 0.4 |
| `privateGetOrderHistory` | GET | `order/history` | 1 |
| `privateGetOrderMatchresults` | GET | `order/matchresults` | 1 |
| `privateGetQueryDepositWithdraw` | GET | `query/deposit-withdraw` | 1 |
| `privateGetMarginLoanOrders` | GET | `margin/loan-orders` | 0.2 |
| `privateGetMarginAccountsBalance` | GET | `margin/accounts/balance` | 0.2 |
| `privateGetCrossMarginLoanOrders` | GET | `cross-margin/loan-orders` | 1 |
| `privateGetCrossMarginAccountsBalance` | GET | `cross-margin/accounts/balance` | 1 |
| `privateGetPointsActions` | GET | `points/actions` | 1 |
| `privateGetPointsOrders` | GET | `points/orders` | 1 |
| `privateGetSubuserAggregateBalance` | GET | `subuser/aggregate-balance` | 10 |
| `privateGetStableCoinExchangeRate` | GET | `stable-coin/exchange_rate` | 1 |
| `privateGetStableCoinQuote` | GET | `stable-coin/quote` | 1 |
| `privatePostAccountTransfer` | POST | `account/transfer` | 1 |
| `privatePostFuturesTransfer` | POST | `futures/transfer` | 1 |
| `privatePostOrderBatchOrders` | POST | `order/batch-orders` | 0.4 |
| `privatePostOrderOrdersPlace` | POST | `order/orders/place` | 0.2 |
| `privatePostOrderOrdersSubmitCancelClientOrder` | POST | `order/orders/submitCancelClientOrder` | 0.2 |
| `privatePostOrderOrdersBatchCancelOpenOrders` | POST | `order/orders/batchCancelOpenOrders` | 0.4 |
| `privatePostOrderOrdersIdSubmitcancel` | POST | `order/orders/{id}/submitcancel` | 0.2 |
| `privatePostOrderOrdersBatchcancel` | POST | `order/orders/batchcancel` | 0.4 |
| `privatePostDwWithdrawApiCreate` | POST | `dw/withdraw/api/create` | 1 |
| `privatePostDwWithdrawVirtualIdCancel` | POST | `dw/withdraw-virtual/{id}/cancel` | 1 |
| `privatePostDwTransferInMargin` | POST | `dw/transfer-in/margin` | 10 |
| `privatePostDwTransferOutMargin` | POST | `dw/transfer-out/margin` | 10 |
| `privatePostMarginOrders` | POST | `margin/orders` | 10 |
| `privatePostMarginOrdersIdRepay` | POST | `margin/orders/{id}/repay` | 10 |
| `privatePostCrossMarginTransferIn` | POST | `cross-margin/transfer-in` | 1 |
| `privatePostCrossMarginTransferOut` | POST | `cross-margin/transfer-out` | 1 |
| `privatePostCrossMarginOrders` | POST | `cross-margin/orders` | 1 |
| `privatePostCrossMarginOrdersIdRepay` | POST | `cross-margin/orders/{id}/repay` | 1 |
| `privatePostStableCoinExchange` | POST | `stable-coin/exchange` | 1 |
| `privatePostSubuserTransfer` | POST | `subuser/transfer` | 10 |

## status

**Base URL**: `https://{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `statusPublicSpotGetApiV2SummaryJson` | GET | `api/v2/summary.json` | 1 |
| `statusPublicFutureInverseGetApiV2SummaryJson` | GET | `api/v2/summary.json` | 1 |
| `statusPublicFutureLinearGetApiV2SummaryJson` | GET | `api/v2/summary.json` | 1 |
| `statusPublicSwapInverseGetApiV2SummaryJson` | GET | `api/v2/summary.json` | 1 |
| `statusPublicSwapLinearGetApiV2SummaryJson` | GET | `api/v2/summary.json` | 1 |

## spot

**Base URL**: `https://{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `spotPublicGetV2MarketStatus` | GET | `v2/market-status` | 1 |
| `spotPublicGetV1CommonSymbols` | GET | `v1/common/symbols` | 1 |
| `spotPublicGetV1CommonCurrencys` | GET | `v1/common/currencys` | 1 |
| `spotPublicGetV2SettingsCommonCurrencies` | GET | `v2/settings/common/currencies` | 1 |
| `spotPublicGetV2ReferenceCurrencies` | GET | `v2/reference/currencies` | 1 |
| `spotPublicGetV1CommonTimestamp` | GET | `v1/common/timestamp` | 1 |
| `spotPublicGetV1CommonExchange` | GET | `v1/common/exchange` | 1 |
| `spotPublicGetV1SettingsCommonChains` | GET | `v1/settings/common/chains` | 1 |
| `spotPublicGetV1SettingsCommonCurrencys` | GET | `v1/settings/common/currencys` | 1 |
| `spotPublicGetV1SettingsCommonSymbols` | GET | `v1/settings/common/symbols` | 1 |
| `spotPublicGetV2SettingsCommonSymbols` | GET | `v2/settings/common/symbols` | 1 |
| `spotPublicGetV1SettingsCommonMarketSymbols` | GET | `v1/settings/common/market-symbols` | 1 |
| `spotPublicGetMarketHistoryCandles` | GET | `market/history/candles` | 1 |
| `spotPublicGetMarketHistoryKline` | GET | `market/history/kline` | 1 |
| `spotPublicGetMarketDetailMerged` | GET | `market/detail/merged` | 1 |
| `spotPublicGetMarketTickers` | GET | `market/tickers` | 1 |
| `spotPublicGetMarketDetail` | GET | `market/detail` | 1 |
| `spotPublicGetMarketDepth` | GET | `market/depth` | 1 |
| `spotPublicGetMarketTrade` | GET | `market/trade` | 1 |
| `spotPublicGetMarketHistoryTrade` | GET | `market/history/trade` | 1 |
| `spotPublicGetMarketEtp` | GET | `market/etp` | 1 |
| `spotPublicGetV2EtpReference` | GET | `v2/etp/reference` | 1 |
| `spotPublicGetV2EtpRebalance` | GET | `v2/etp/rebalance` | 1 |
| `spotPrivateGetV1AccountAccounts` | GET | `v1/account/accounts` | 0.2 |
| `spotPrivateGetV1AccountAccountsAccountIdBalance` | GET | `v1/account/accounts/{account-id}/balance` | 0.2 |
| `spotPrivateGetV2AccountValuation` | GET | `v2/account/valuation` | 1 |
| `spotPrivateGetV2AccountAssetValuation` | GET | `v2/account/asset-valuation` | 0.2 |
| `spotPrivateGetV1AccountHistory` | GET | `v1/account/history` | 4 |
| `spotPrivateGetV2AccountLedger` | GET | `v2/account/ledger` | 1 |
| `spotPrivateGetV2PointAccount` | GET | `v2/point/account` | 5 |
| `spotPrivateGetV2AccountDepositAddress` | GET | `v2/account/deposit/address` | 1 |
| `spotPrivateGetV2AccountWithdrawQuota` | GET | `v2/account/withdraw/quota` | 1 |
| `spotPrivateGetV2AccountWithdrawAddress` | GET | `v2/account/withdraw/address` | 1 |
| `spotPrivateGetV2ReferenceCurrencies` | GET | `v2/reference/currencies` | 1 |
| `spotPrivateGetV1QueryDepositWithdraw` | GET | `v1/query/deposit-withdraw` | 1 |
| `spotPrivateGetV1QueryWithdrawClientOrderId` | GET | `v1/query/withdraw/client-order-id` | 1 |
| `spotPrivateGetV2UserApiKey` | GET | `v2/user/api-key` | 1 |
| `spotPrivateGetV2UserUid` | GET | `v2/user/uid` | 1 |
| `spotPrivateGetV2SubUserUserList` | GET | `v2/sub-user/user-list` | 1 |
| `spotPrivateGetV2SubUserUserState` | GET | `v2/sub-user/user-state` | 1 |
| `spotPrivateGetV2SubUserAccountList` | GET | `v2/sub-user/account-list` | 1 |
| `spotPrivateGetV2SubUserDepositAddress` | GET | `v2/sub-user/deposit-address` | 1 |
| `spotPrivateGetV2SubUserQueryDeposit` | GET | `v2/sub-user/query-deposit` | 1 |
| `spotPrivateGetV1SubuserAggregateBalance` | GET | `v1/subuser/aggregate-balance` | 10 |
| `spotPrivateGetV1AccountAccountsSubUid` | GET | `v1/account/accounts/{sub-uid}` | 1 |
| `spotPrivateGetV1OrderOpenOrders` | GET | `v1/order/openOrders` | 0.4 |
| `spotPrivateGetV1OrderOrdersOrderId` | GET | `v1/order/orders/{order-id}` | 0.4 |
| `spotPrivateGetV1OrderOrdersGetClientOrder` | GET | `v1/order/orders/getClientOrder` | 0.4 |
| `spotPrivateGetV1OrderOrdersOrderIdMatchresult` | GET | `v1/order/orders/{order-id}/matchresult` | 0.4 |
| `spotPrivateGetV1OrderOrdersOrderIdMatchresults` | GET | `v1/order/orders/{order-id}/matchresults` | 0.4 |
| `spotPrivateGetV1OrderOrders` | GET | `v1/order/orders` | 0.4 |
| `spotPrivateGetV1OrderHistory` | GET | `v1/order/history` | 1 |
| `spotPrivateGetV1OrderMatchresults` | GET | `v1/order/matchresults` | 1 |
| `spotPrivateGetV2ReferenceTransactFeeRate` | GET | `v2/reference/transact-fee-rate` | 1 |
| `spotPrivateGetV2AlgoOrdersOpening` | GET | `v2/algo-orders/opening` | 1 |
| `spotPrivateGetV2AlgoOrdersHistory` | GET | `v2/algo-orders/history` | 1 |
| `spotPrivateGetV2AlgoOrdersSpecific` | GET | `v2/algo-orders/specific` | 1 |
| `spotPrivateGetV1MarginLoanInfo` | GET | `v1/margin/loan-info` | 1 |
| `spotPrivateGetV1MarginLoanOrders` | GET | `v1/margin/loan-orders` | 0.2 |
| `spotPrivateGetV1MarginAccountsBalance` | GET | `v1/margin/accounts/balance` | 0.2 |
| `spotPrivateGetV1CrossMarginLoanInfo` | GET | `v1/cross-margin/loan-info` | 1 |
| `spotPrivateGetV1CrossMarginLoanOrders` | GET | `v1/cross-margin/loan-orders` | 1 |
| `spotPrivateGetV1CrossMarginAccountsBalance` | GET | `v1/cross-margin/accounts/balance` | 1 |
| `spotPrivateGetV2AccountRepayment` | GET | `v2/account/repayment` | 5 |
| `spotPrivateGetV5AccountUniversalTransferRecords` | GET | `v5/account/universal_transfer_records` | 4 |
| `spotPrivateGetV1StableCoinQuote` | GET | `v1/stable-coin/quote` | 1 |
| `spotPrivateGetV1StableCoinExchangeRate` | GET | `v1/stable_coin/exchange_rate` | 1 |
| `spotPrivateGetV2EtpTransactions` | GET | `v2/etp/transactions` | 5 |
| `spotPrivateGetV2EtpTransaction` | GET | `v2/etp/transaction` | 5 |
| `spotPrivateGetV2EtpLimit` | GET | `v2/etp/limit` | 1 |
| `spotPrivatePostV1AccountTransfer` | POST | `v1/account/transfer` | 1 |
| `spotPrivatePostV1FuturesTransfer` | POST | `v1/futures/transfer` | 1 |
| `spotPrivatePostV2PointTransfer` | POST | `v2/point/transfer` | 5 |
| `spotPrivatePostV2AccountTransfer` | POST | `v2/account/transfer` | 1 |
| `spotPrivatePostV1DwWithdrawApiCreate` | POST | `v1/dw/withdraw/api/create` | 1 |
| `spotPrivatePostV1DwWithdrawVirtualWithdrawIdCancel` | POST | `v1/dw/withdraw-virtual/{withdraw-id}/cancel` | 1 |
| `spotPrivatePostV2SubUserDeductMode` | POST | `v2/sub-user/deduct-mode` | 1 |
| `spotPrivatePostV2SubUserCreation` | POST | `v2/sub-user/creation` | 1 |
| `spotPrivatePostV2SubUserManagement` | POST | `v2/sub-user/management` | 1 |
| `spotPrivatePostV2SubUserTradableMarket` | POST | `v2/sub-user/tradable-market` | 1 |
| `spotPrivatePostV2SubUserTransferability` | POST | `v2/sub-user/transferability` | 1 |
| `spotPrivatePostV2SubUserApiKeyGeneration` | POST | `v2/sub-user/api-key-generation` | 1 |
| `spotPrivatePostV2SubUserApiKeyModification` | POST | `v2/sub-user/api-key-modification` | 1 |
| `spotPrivatePostV2SubUserApiKeyDeletion` | POST | `v2/sub-user/api-key-deletion` | 1 |
| `spotPrivatePostV1SubuserTransfer` | POST | `v1/subuser/transfer` | 10 |
| `spotPrivatePostV1TrustUserActiveCredit` | POST | `v1/trust/user/active/credit` | 10 |
| `spotPrivatePostV1OrderOrdersPlace` | POST | `v1/order/orders/place` | 0.2 |
| `spotPrivatePostV1OrderBatchOrders` | POST | `v1/order/batch-orders` | 0.4 |
| `spotPrivatePostV1OrderAutoPlace` | POST | `v1/order/auto/place` | 0.2 |
| `spotPrivatePostV1OrderOrdersOrderIdSubmitcancel` | POST | `v1/order/orders/{order-id}/submitcancel` | 0.2 |
| `spotPrivatePostV1OrderOrdersSubmitCancelClientOrder` | POST | `v1/order/orders/submitCancelClientOrder` | 0.2 |
| `spotPrivatePostV1OrderOrdersBatchCancelOpenOrders` | POST | `v1/order/orders/batchCancelOpenOrders` | 0.4 |
| `spotPrivatePostV1OrderOrdersBatchcancel` | POST | `v1/order/orders/batchcancel` | 0.4 |
| `spotPrivatePostV2AlgoOrdersCancelAllAfter` | POST | `v2/algo-orders/cancel-all-after` | 1 |
| `spotPrivatePostV2AlgoOrders` | POST | `v2/algo-orders` | 1 |
| `spotPrivatePostV2AlgoOrdersCancellation` | POST | `v2/algo-orders/cancellation` | 1 |
| `spotPrivatePostV2AccountRepayment` | POST | `v2/account/repayment` | 5 |
| `spotPrivatePostV1DwTransferInMargin` | POST | `v1/dw/transfer-in/margin` | 10 |
| `spotPrivatePostV1DwTransferOutMargin` | POST | `v1/dw/transfer-out/margin` | 10 |
| `spotPrivatePostV1MarginOrders` | POST | `v1/margin/orders` | 10 |
| `spotPrivatePostV1MarginOrdersOrderIdRepay` | POST | `v1/margin/orders/{order-id}/repay` | 10 |
| `spotPrivatePostV1CrossMarginTransferIn` | POST | `v1/cross-margin/transfer-in` | 1 |
| `spotPrivatePostV1CrossMarginTransferOut` | POST | `v1/cross-margin/transfer-out` | 1 |
| `spotPrivatePostV1CrossMarginOrders` | POST | `v1/cross-margin/orders` | 1 |
| `spotPrivatePostV1CrossMarginOrdersOrderIdRepay` | POST | `v1/cross-margin/orders/{order-id}/repay` | 1 |
| `spotPrivatePostV1StableCoinExchange` | POST | `v1/stable-coin/exchange` | 1 |
| `spotPrivatePostV2EtpCreation` | POST | `v2/etp/creation` | 5 |
| `spotPrivatePostV2EtpRedemption` | POST | `v2/etp/redemption` | 5 |
| `spotPrivatePostV2EtpTransactIdCancel` | POST | `v2/etp/{transactId}/cancel` | 10 |
| `spotPrivatePostV2EtpBatchCancel` | POST | `v2/etp/batch-cancel` | 50 |

## contract

**Base URL**: `https://{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `contractPublicGetApiV1Timestamp` | GET | `api/v1/timestamp` | 1 |
| `contractPublicGetHeartbeat` | GET | `heartbeat/` | 1 |
| `contractPublicGetApiV1ContractContractInfo` | GET | `api/v1/contract_contract_info` | 1 |
| `contractPublicGetApiV1ContractIndex` | GET | `api/v1/contract_index` | 1 |
| `contractPublicGetApiV1ContractQueryElements` | GET | `api/v1/contract_query_elements` | 1 |
| `contractPublicGetApiV1ContractPriceLimit` | GET | `api/v1/contract_price_limit` | 1 |
| `contractPublicGetApiV1ContractOpenInterest` | GET | `api/v1/contract_open_interest` | 1 |
| `contractPublicGetApiV1ContractDeliveryPrice` | GET | `api/v1/contract_delivery_price` | 1 |
| `contractPublicGetMarketDepth` | GET | `market/depth` | 1 |
| `contractPublicGetMarketBbo` | GET | `market/bbo` | 1 |
| `contractPublicGetMarketHistoryKline` | GET | `market/history/kline` | 1 |
| `contractPublicGetIndexMarketHistoryMarkPriceKline` | GET | `index/market/history/mark_price_kline` | 1 |
| `contractPublicGetMarketDetailMerged` | GET | `market/detail/merged` | 1 |
| `contractPublicGetMarketDetailBatchMerged` | GET | `market/detail/batch_merged` | 1 |
| `contractPublicGetV2MarketDetailBatchMerged` | GET | `v2/market/detail/batch_merged` | 1 |
| `contractPublicGetMarketTrade` | GET | `market/trade` | 1 |
| `contractPublicGetMarketHistoryTrade` | GET | `market/history/trade` | 1 |
| `contractPublicGetApiV1ContractRiskInfo` | GET | `api/v1/contract_risk_info` | 1 |
| `contractPublicGetApiV1ContractInsuranceFund` | GET | `api/v1/contract_insurance_fund` | 1 |
| `contractPublicGetApiV1ContractAdjustfactor` | GET | `api/v1/contract_adjustfactor` | 1 |
| `contractPublicGetApiV1ContractHisOpenInterest` | GET | `api/v1/contract_his_open_interest` | 1 |
| `contractPublicGetApiV1ContractLadderMargin` | GET | `api/v1/contract_ladder_margin` | 1 |
| `contractPublicGetApiV1ContractApiState` | GET | `api/v1/contract_api_state` | 1 |
| `contractPublicGetApiV1ContractEliteAccountRatio` | GET | `api/v1/contract_elite_account_ratio` | 1 |
| `contractPublicGetApiV1ContractElitePositionRatio` | GET | `api/v1/contract_elite_position_ratio` | 1 |
| `contractPublicGetApiV1ContractLiquidationOrders` | GET | `api/v1/contract_liquidation_orders` | 1 |
| `contractPublicGetApiV1ContractSettlementRecords` | GET | `api/v1/contract_settlement_records` | 1 |
| `contractPublicGetIndexMarketHistoryIndex` | GET | `index/market/history/index` | 1 |
| `contractPublicGetIndexMarketHistoryBasis` | GET | `index/market/history/basis` | 1 |
| `contractPublicGetApiV1ContractEstimatedSettlementPrice` | GET | `api/v1/contract_estimated_settlement_price` | 1 |
| `contractPublicGetApiV3ContractLiquidationOrders` | GET | `api/v3/contract_liquidation_orders` | 1 |
| `contractPublicGetSwapApiV1SwapContractInfo` | GET | `swap-api/v1/swap_contract_info` | 1 |
| `contractPublicGetSwapApiV1SwapIndex` | GET | `swap-api/v1/swap_index` | 1 |
| `contractPublicGetSwapApiV1SwapQueryElements` | GET | `swap-api/v1/swap_query_elements` | 1 |
| `contractPublicGetSwapApiV1SwapPriceLimit` | GET | `swap-api/v1/swap_price_limit` | 1 |
| `contractPublicGetSwapApiV1SwapOpenInterest` | GET | `swap-api/v1/swap_open_interest` | 1 |
| `contractPublicGetSwapExMarketDepth` | GET | `swap-ex/market/depth` | 1 |
| `contractPublicGetSwapExMarketBbo` | GET | `swap-ex/market/bbo` | 1 |
| `contractPublicGetSwapExMarketHistoryKline` | GET | `swap-ex/market/history/kline` | 1 |
| `contractPublicGetIndexMarketHistorySwapMarkPriceKline` | GET | `index/market/history/swap_mark_price_kline` | 1 |
| `contractPublicGetSwapExMarketDetailMerged` | GET | `swap-ex/market/detail/merged` | 1 |
| `contractPublicGetV2SwapExMarketDetailBatchMerged` | GET | `v2/swap-ex/market/detail/batch_merged` | 1 |
| `contractPublicGetIndexMarketHistorySwapPremiumIndexKline` | GET | `index/market/history/swap_premium_index_kline` | 1 |
| `contractPublicGetSwapExMarketDetailBatchMerged` | GET | `swap-ex/market/detail/batch_merged` | 1 |
| `contractPublicGetSwapExMarketTrade` | GET | `swap-ex/market/trade` | 1 |
| `contractPublicGetSwapExMarketHistoryTrade` | GET | `swap-ex/market/history/trade` | 1 |
| `contractPublicGetSwapApiV1SwapRiskInfo` | GET | `swap-api/v1/swap_risk_info` | 1 |
| `contractPublicGetSwapApiV1SwapInsuranceFund` | GET | `swap-api/v1/swap_insurance_fund` | 1 |
| `contractPublicGetSwapApiV1SwapAdjustfactor` | GET | `swap-api/v1/swap_adjustfactor` | 1 |
| `contractPublicGetSwapApiV1SwapHisOpenInterest` | GET | `swap-api/v1/swap_his_open_interest` | 1 |
| `contractPublicGetSwapApiV1SwapLadderMargin` | GET | `swap-api/v1/swap_ladder_margin` | 1 |
| `contractPublicGetSwapApiV1SwapApiState` | GET | `swap-api/v1/swap_api_state` | 1 |
| `contractPublicGetSwapApiV1SwapEliteAccountRatio` | GET | `swap-api/v1/swap_elite_account_ratio` | 1 |
| `contractPublicGetSwapApiV1SwapElitePositionRatio` | GET | `swap-api/v1/swap_elite_position_ratio` | 1 |
| `contractPublicGetSwapApiV1SwapEstimatedSettlementPrice` | GET | `swap-api/v1/swap_estimated_settlement_price` | 1 |
| `contractPublicGetSwapApiV1SwapLiquidationOrders` | GET | `swap-api/v1/swap_liquidation_orders` | 1 |
| `contractPublicGetSwapApiV1SwapSettlementRecords` | GET | `swap-api/v1/swap_settlement_records` | 1 |
| `contractPublicGetSwapApiV1SwapFundingRate` | GET | `swap-api/v1/swap_funding_rate` | 1 |
| `contractPublicGetSwapApiV1SwapBatchFundingRate` | GET | `swap-api/v1/swap_batch_funding_rate` | 1 |
| `contractPublicGetSwapApiV1SwapHistoricalFundingRate` | GET | `swap-api/v1/swap_historical_funding_rate` | 1 |
| `contractPublicGetSwapApiV3SwapLiquidationOrders` | GET | `swap-api/v3/swap_liquidation_orders` | 1 |
| `contractPublicGetIndexMarketHistorySwapEstimatedRateKline` | GET | `index/market/history/swap_estimated_rate_kline` | 1 |
| `contractPublicGetIndexMarketHistorySwapBasis` | GET | `index/market/history/swap_basis` | 1 |
| `contractPublicGetLinearSwapApiV1SwapContractInfo` | GET | `linear-swap-api/v1/swap_contract_info` | 1 |
| `contractPublicGetLinearSwapApiV1SwapIndex` | GET | `linear-swap-api/v1/swap_index` | 1 |
| `contractPublicGetLinearSwapApiV1SwapQueryElements` | GET | `linear-swap-api/v1/swap_query_elements` | 1 |
| `contractPublicGetLinearSwapApiV1SwapPriceLimit` | GET | `linear-swap-api/v1/swap_price_limit` | 1 |
| `contractPublicGetLinearSwapExMarketDepth` | GET | `linear-swap-ex/market/depth` | 1 |
| `contractPublicGetLinearSwapExMarketBbo` | GET | `linear-swap-ex/market/bbo` | 1 |
| `contractPublicGetLinearSwapExMarketHistoryKline` | GET | `linear-swap-ex/market/history/kline` | 1 |
| `contractPublicGetIndexMarketHistoryLinearSwapMarkPriceKline` | GET | `index/market/history/linear_swap_mark_price_kline` | 1 |
| `contractPublicGetLinearSwapExMarketDetailMerged` | GET | `linear-swap-ex/market/detail/merged` | 1 |
| `contractPublicGetLinearSwapExMarketDetailBatchMerged` | GET | `linear-swap-ex/market/detail/batch_merged` | 1 |
| `contractPublicGetV2LinearSwapExMarketDetailBatchMerged` | GET | `v2/linear-swap-ex/market/detail/batch_merged` | 1 |
| `contractPublicGetLinearSwapExMarketTrade` | GET | `linear-swap-ex/market/trade` | 1 |
| `contractPublicGetLinearSwapExMarketHistoryTrade` | GET | `linear-swap-ex/market/history/trade` | 1 |
| `contractPublicGetSwapApiV1LinearSwapApiV1SwapInsuranceFund` | GET | `swap-api/v1/linear-swap-api/v1/swap_insurance_fund` | 1 |
| `contractPublicGetLinearSwapApiV1SwapAdjustfactor` | GET | `linear-swap-api/v1/swap_adjustfactor` | 1 |
| `contractPublicGetLinearSwapApiV1SwapCrossAdjustfactor` | GET | `linear-swap-api/v1/swap_cross_adjustfactor` | 1 |
| `contractPublicGetLinearSwapApiV1SwapHisOpenInterest` | GET | `linear-swap-api/v1/swap_his_open_interest` | 1 |
| `contractPublicGetLinearSwapApiV1SwapLadderMargin` | GET | `linear-swap-api/v1/swap_ladder_margin` | 1 |
| `contractPublicGetLinearSwapApiV1SwapCrossLadderMargin` | GET | `linear-swap-api/v1/swap_cross_ladder_margin` | 1 |
| `contractPublicGetLinearSwapApiV1SwapApiState` | GET | `linear-swap-api/v1/swap_api_state` | 1 |
| `contractPublicGetLinearSwapApiV1SwapEliteAccountRatio` | GET | `linear-swap-api/v1/swap_elite_account_ratio` | 1 |
| `contractPublicGetLinearSwapApiV1SwapElitePositionRatio` | GET | `linear-swap-api/v1/swap_elite_position_ratio` | 1 |
| `contractPublicGetLinearSwapApiV1SwapSettlementRecords` | GET | `linear-swap-api/v1/swap_settlement_records` | 1 |
| `contractPublicGetLinearSwapApiV3SwapLiquidationOrders` | GET | `linear-swap-api/v3/swap_liquidation_orders` | 1 |
| `contractPublicGetIndexMarketHistoryLinearSwapPremiumIndexKline` | GET | `index/market/history/linear_swap_premium_index_kline` | 1 |
| `contractPublicGetIndexMarketHistoryLinearSwapEstimatedRateKline` | GET | `index/market/history/linear_swap_estimated_rate_kline` | 1 |
| `contractPublicGetIndexMarketHistoryLinearSwapBasis` | GET | `index/market/history/linear_swap_basis` | 1 |
| `contractPublicGetLinearSwapApiV1SwapEstimatedSettlementPrice` | GET | `linear-swap-api/v1/swap_estimated_settlement_price` | 1 |
| `contractPublicGetV5MarketFundingRate` | GET | `v5/market/funding_rate` | 0.125 |
| `contractPublicGetV5MarketFundingRateHistory` | GET | `v5/market/funding_rate_history` | 0.125 |
| `contractPublicGetV5MarketOpenInterest` | GET | `v5/market/open_interest` | 0.125 |
| `contractPublicGetV5MarketLiquidationOrders` | GET | `v5/market/liquidation_orders` | 0.125 |
| `contractPublicGetV5MarketSettlementHistory` | GET | `v5/market/settlement_history` | 0.125 |
| `contractPublicGetV5MarketEliteAccountRatio` | GET | `v5/market/elite_account_ratio` | 0.125 |
| `contractPublicGetV5MarketElitePositionRatio` | GET | `v5/market/elite_position_ratio` | 0.125 |
| `contractPublicGetV5MarketEstimatedSettlementPrice` | GET | `v5/market/estimated_settlement_price` | 0.125 |
| `contractPublicGetV5MarketPriceLimit` | GET | `v5/market/price_limit` | 0.125 |
| `contractPrivateGetApiV1ContractSubAuthList` | GET | `api/v1/contract_sub_auth_list` | 1 |
| `contractPrivateGetApiV1ContractApiTradingStatus` | GET | `api/v1/contract_api_trading_status` | 1 |
| `contractPrivateGetSwapApiV1SwapSubAuthList` | GET | `swap-api/v1/swap_sub_auth_list` | 1 |
| `contractPrivateGetSwapApiV1SwapApiTradingStatus` | GET | `swap-api/v1/swap_api_trading_status` | 1 |
| `contractPrivateGetV5AccountAssetMode` | GET | `v5/account/asset_mode` | 0.20834 |
| `contractPrivateGetV5AccountBalance` | GET | `v5/account/balance` | 0.20834 |
| `contractPrivateGetV5AccountBills` | GET | `v5/account/bills` | 0.20834 |
| `contractPrivateGetV5AccountFeeDeductionCurrency` | GET | `v5/account/fee_deduction_currency` | 0.20834 |
| `contractPrivateGetV5TradePositionOpens` | GET | `v5/trade/position/opens` | 0.41679 |
| `contractPrivateGetV5TradeOrderOpens` | GET | `v5/trade/order/opens` | 0.41679 |
| `contractPrivateGetV5TradeOrderDetails` | GET | `v5/trade/order/details` | 0.41679 |
| `contractPrivateGetV5TradeOrderHistory` | GET | `v5/trade/order/history` | 0.41679 |
| `contractPrivateGetV5TradeOrder` | GET | `v5/trade/order` | 0.41679 |
| `contractPrivateGetV5PositionLever` | GET | `v5/position/lever` | 0.20834 |
| `contractPrivateGetV5PositionMode` | GET | `v5/position/mode` | 0.20834 |
| `contractPrivateGetV5PositionRiskLimit` | GET | `v5/position/risk/limit` | 0.20834 |
| `contractPrivateGetV5PositionRiskLimitTier` | GET | `v5/position/risk/limit_tier` | 0.20834 |
| `contractPrivateGetV5MarketRiskLimit` | GET | `v5/market/risk/limit` | 0.125 |
| `contractPrivateGetV5MarketAssetsDeductionCurrency` | GET | `v5/market/assets_deduction_currency` | 0.125 |
| `contractPrivateGetV5MarketMultiAssetsMargin` | GET | `v5/market/multi_assets_margin` | 0.125 |
| `contractPrivateGetV5AlgoOrderOpens` | GET | `v5/algo/order/opens` | 0.41679 |
| `contractPrivateGetV5AlgoOrder` | GET | `v5/algo/order` | 0.41679 |
| `contractPrivateGetV5AlgoOrderHistory` | GET | `v5/algo/order/history` | 0.41679 |
| `contractPrivatePostApiV1ContractBalanceValuation` | POST | `api/v1/contract_balance_valuation` | 1 |
| `contractPrivatePostApiV1ContractAccountInfo` | POST | `api/v1/contract_account_info` | 1 |
| `contractPrivatePostApiV1ContractPositionInfo` | POST | `api/v1/contract_position_info` | 1 |
| `contractPrivatePostApiV1ContractSubAuth` | POST | `api/v1/contract_sub_auth` | 1 |
| `contractPrivatePostApiV1ContractSubAccountList` | POST | `api/v1/contract_sub_account_list` | 1 |
| `contractPrivatePostApiV1ContractSubAccountInfoList` | POST | `api/v1/contract_sub_account_info_list` | 1 |
| `contractPrivatePostApiV1ContractSubAccountInfo` | POST | `api/v1/contract_sub_account_info` | 1 |
| `contractPrivatePostApiV1ContractSubPositionInfo` | POST | `api/v1/contract_sub_position_info` | 1 |
| `contractPrivatePostApiV1ContractFinancialRecord` | POST | `api/v1/contract_financial_record` | 1 |
| `contractPrivatePostApiV1ContractFinancialRecordExact` | POST | `api/v1/contract_financial_record_exact` | 1 |
| `contractPrivatePostApiV1ContractUserSettlementRecords` | POST | `api/v1/contract_user_settlement_records` | 1 |
| `contractPrivatePostApiV1ContractOrderLimit` | POST | `api/v1/contract_order_limit` | 1 |
| `contractPrivatePostApiV1ContractFee` | POST | `api/v1/contract_fee` | 1 |
| `contractPrivatePostApiV1ContractTransferLimit` | POST | `api/v1/contract_transfer_limit` | 1 |
| `contractPrivatePostApiV1ContractPositionLimit` | POST | `api/v1/contract_position_limit` | 1 |
| `contractPrivatePostApiV1ContractAccountPositionInfo` | POST | `api/v1/contract_account_position_info` | 1 |
| `contractPrivatePostApiV1ContractMasterSubTransfer` | POST | `api/v1/contract_master_sub_transfer` | 1 |
| `contractPrivatePostApiV1ContractMasterSubTransferRecord` | POST | `api/v1/contract_master_sub_transfer_record` | 1 |
| `contractPrivatePostApiV1ContractAvailableLevelRate` | POST | `api/v1/contract_available_level_rate` | 1 |
| `contractPrivatePostApiV3ContractFinancialRecord` | POST | `api/v3/contract_financial_record` | 1 |
| `contractPrivatePostApiV3ContractFinancialRecordExact` | POST | `api/v3/contract_financial_record_exact` | 1 |
| `contractPrivatePostApiV1ContractCancelAfter` | POST | `api/v1/contract-cancel-after` | 1 |
| `contractPrivatePostApiV1ContractOrder` | POST | `api/v1/contract_order` | 1 |
| `contractPrivatePostApiV1ContractBatchorder` | POST | `api/v1/contract_batchorder` | 1 |
| `contractPrivatePostApiV1ContractCancel` | POST | `api/v1/contract_cancel` | 1 |
| `contractPrivatePostApiV1ContractCancelall` | POST | `api/v1/contract_cancelall` | 1 |
| `contractPrivatePostApiV1ContractSwitchLeverRate` | POST | `api/v1/contract_switch_lever_rate` | 30 |
| `contractPrivatePostApiV1LightningClosePosition` | POST | `api/v1/lightning_close_position` | 1 |
| `contractPrivatePostApiV1ContractOrderInfo` | POST | `api/v1/contract_order_info` | 1 |
| `contractPrivatePostApiV1ContractOrderDetail` | POST | `api/v1/contract_order_detail` | 1 |
| `contractPrivatePostApiV1ContractOpenorders` | POST | `api/v1/contract_openorders` | 1 |
| `contractPrivatePostApiV1ContractHisorders` | POST | `api/v1/contract_hisorders` | 1 |
| `contractPrivatePostApiV1ContractHisordersExact` | POST | `api/v1/contract_hisorders_exact` | 1 |
| `contractPrivatePostApiV1ContractMatchresults` | POST | `api/v1/contract_matchresults` | 1 |
| `contractPrivatePostApiV1ContractMatchresultsExact` | POST | `api/v1/contract_matchresults_exact` | 1 |
| `contractPrivatePostApiV3ContractHisorders` | POST | `api/v3/contract_hisorders` | 1 |
| `contractPrivatePostApiV3ContractHisordersExact` | POST | `api/v3/contract_hisorders_exact` | 1 |
| `contractPrivatePostApiV3ContractMatchresults` | POST | `api/v3/contract_matchresults` | 1 |
| `contractPrivatePostApiV3ContractMatchresultsExact` | POST | `api/v3/contract_matchresults_exact` | 1 |
| `contractPrivatePostApiV1ContractTriggerOrder` | POST | `api/v1/contract_trigger_order` | 1 |
| `contractPrivatePostApiV1ContractTriggerCancel` | POST | `api/v1/contract_trigger_cancel` | 1 |
| `contractPrivatePostApiV1ContractTriggerCancelall` | POST | `api/v1/contract_trigger_cancelall` | 1 |
| `contractPrivatePostApiV1ContractTriggerOpenorders` | POST | `api/v1/contract_trigger_openorders` | 1 |
| `contractPrivatePostApiV1ContractTriggerHisorders` | POST | `api/v1/contract_trigger_hisorders` | 1 |
| `contractPrivatePostApiV1ContractTpslOrder` | POST | `api/v1/contract_tpsl_order` | 1 |
| `contractPrivatePostApiV1ContractTpslCancel` | POST | `api/v1/contract_tpsl_cancel` | 1 |
| `contractPrivatePostApiV1ContractTpslCancelall` | POST | `api/v1/contract_tpsl_cancelall` | 1 |
| `contractPrivatePostApiV1ContractTpslOpenorders` | POST | `api/v1/contract_tpsl_openorders` | 1 |
| `contractPrivatePostApiV1ContractTpslHisorders` | POST | `api/v1/contract_tpsl_hisorders` | 1 |
| `contractPrivatePostApiV1ContractRelationTpslOrder` | POST | `api/v1/contract_relation_tpsl_order` | 1 |
| `contractPrivatePostApiV1ContractTrackOrder` | POST | `api/v1/contract_track_order` | 1 |
| `contractPrivatePostApiV1ContractTrackCancel` | POST | `api/v1/contract_track_cancel` | 1 |
| `contractPrivatePostApiV1ContractTrackCancelall` | POST | `api/v1/contract_track_cancelall` | 1 |
| `contractPrivatePostApiV1ContractTrackOpenorders` | POST | `api/v1/contract_track_openorders` | 1 |
| `contractPrivatePostApiV1ContractTrackHisorders` | POST | `api/v1/contract_track_hisorders` | 1 |
| `contractPrivatePostSwapApiV1SwapBalanceValuation` | POST | `swap-api/v1/swap_balance_valuation` | 1 |
| `contractPrivatePostSwapApiV1SwapAccountInfo` | POST | `swap-api/v1/swap_account_info` | 1 |
| `contractPrivatePostSwapApiV1SwapPositionInfo` | POST | `swap-api/v1/swap_position_info` | 1 |
| `contractPrivatePostSwapApiV1SwapAccountPositionInfo` | POST | `swap-api/v1/swap_account_position_info` | 1 |
| `contractPrivatePostSwapApiV1SwapSubAuth` | POST | `swap-api/v1/swap_sub_auth` | 1 |
| `contractPrivatePostSwapApiV1SwapSubAccountList` | POST | `swap-api/v1/swap_sub_account_list` | 1 |
| `contractPrivatePostSwapApiV1SwapSubAccountInfoList` | POST | `swap-api/v1/swap_sub_account_info_list` | 1 |
| `contractPrivatePostSwapApiV1SwapSubAccountInfo` | POST | `swap-api/v1/swap_sub_account_info` | 1 |
| `contractPrivatePostSwapApiV1SwapSubPositionInfo` | POST | `swap-api/v1/swap_sub_position_info` | 1 |
| `contractPrivatePostSwapApiV1SwapFinancialRecord` | POST | `swap-api/v1/swap_financial_record` | 1 |
| `contractPrivatePostSwapApiV1SwapFinancialRecordExact` | POST | `swap-api/v1/swap_financial_record_exact` | 1 |
| `contractPrivatePostSwapApiV1SwapUserSettlementRecords` | POST | `swap-api/v1/swap_user_settlement_records` | 1 |
| `contractPrivatePostSwapApiV1SwapAvailableLevelRate` | POST | `swap-api/v1/swap_available_level_rate` | 1 |
| `contractPrivatePostSwapApiV1SwapOrderLimit` | POST | `swap-api/v1/swap_order_limit` | 1 |
| `contractPrivatePostSwapApiV1SwapFee` | POST | `swap-api/v1/swap_fee` | 1 |
| `contractPrivatePostSwapApiV1SwapTransferLimit` | POST | `swap-api/v1/swap_transfer_limit` | 1 |
| `contractPrivatePostSwapApiV1SwapPositionLimit` | POST | `swap-api/v1/swap_position_limit` | 1 |
| `contractPrivatePostSwapApiV1SwapMasterSubTransfer` | POST | `swap-api/v1/swap_master_sub_transfer` | 1 |
| `contractPrivatePostSwapApiV1SwapMasterSubTransferRecord` | POST | `swap-api/v1/swap_master_sub_transfer_record` | 1 |
| `contractPrivatePostSwapApiV3SwapFinancialRecord` | POST | `swap-api/v3/swap_financial_record` | 1 |
| `contractPrivatePostSwapApiV3SwapFinancialRecordExact` | POST | `swap-api/v3/swap_financial_record_exact` | 1 |
| `contractPrivatePostSwapApiV1SwapCancelAfter` | POST | `swap-api/v1/swap-cancel-after` | 1 |
| `contractPrivatePostSwapApiV1SwapOrder` | POST | `swap-api/v1/swap_order` | 1 |
| `contractPrivatePostSwapApiV1SwapBatchorder` | POST | `swap-api/v1/swap_batchorder` | 1 |
| `contractPrivatePostSwapApiV1SwapCancel` | POST | `swap-api/v1/swap_cancel` | 1 |
| `contractPrivatePostSwapApiV1SwapCancelall` | POST | `swap-api/v1/swap_cancelall` | 1 |
| `contractPrivatePostSwapApiV1SwapLightningClosePosition` | POST | `swap-api/v1/swap_lightning_close_position` | 1 |
| `contractPrivatePostSwapApiV1SwapSwitchLeverRate` | POST | `swap-api/v1/swap_switch_lever_rate` | 30 |
| `contractPrivatePostSwapApiV1SwapOrderInfo` | POST | `swap-api/v1/swap_order_info` | 1 |
| `contractPrivatePostSwapApiV1SwapOrderDetail` | POST | `swap-api/v1/swap_order_detail` | 1 |
| `contractPrivatePostSwapApiV1SwapOpenorders` | POST | `swap-api/v1/swap_openorders` | 1 |
| `contractPrivatePostSwapApiV1SwapHisorders` | POST | `swap-api/v1/swap_hisorders` | 1 |
| `contractPrivatePostSwapApiV1SwapHisordersExact` | POST | `swap-api/v1/swap_hisorders_exact` | 1 |
| `contractPrivatePostSwapApiV1SwapMatchresults` | POST | `swap-api/v1/swap_matchresults` | 1 |
| `contractPrivatePostSwapApiV1SwapMatchresultsExact` | POST | `swap-api/v1/swap_matchresults_exact` | 1 |
| `contractPrivatePostSwapApiV3SwapMatchresults` | POST | `swap-api/v3/swap_matchresults` | 1 |
| `contractPrivatePostSwapApiV3SwapMatchresultsExact` | POST | `swap-api/v3/swap_matchresults_exact` | 1 |
| `contractPrivatePostSwapApiV3SwapHisorders` | POST | `swap-api/v3/swap_hisorders` | 1 |
| `contractPrivatePostSwapApiV3SwapHisordersExact` | POST | `swap-api/v3/swap_hisorders_exact` | 1 |
| `contractPrivatePostSwapApiV1SwapTriggerOrder` | POST | `swap-api/v1/swap_trigger_order` | 1 |
| `contractPrivatePostSwapApiV1SwapTriggerCancel` | POST | `swap-api/v1/swap_trigger_cancel` | 1 |
| `contractPrivatePostSwapApiV1SwapTriggerCancelall` | POST | `swap-api/v1/swap_trigger_cancelall` | 1 |
| `contractPrivatePostSwapApiV1SwapTriggerOpenorders` | POST | `swap-api/v1/swap_trigger_openorders` | 1 |
| `contractPrivatePostSwapApiV1SwapTriggerHisorders` | POST | `swap-api/v1/swap_trigger_hisorders` | 1 |
| `contractPrivatePostSwapApiV1SwapTpslOrder` | POST | `swap-api/v1/swap_tpsl_order` | 1 |
| `contractPrivatePostSwapApiV1SwapTpslCancel` | POST | `swap-api/v1/swap_tpsl_cancel` | 1 |
| `contractPrivatePostSwapApiV1SwapTpslCancelall` | POST | `swap-api/v1/swap_tpsl_cancelall` | 1 |
| `contractPrivatePostSwapApiV1SwapTpslOpenorders` | POST | `swap-api/v1/swap_tpsl_openorders` | 1 |
| `contractPrivatePostSwapApiV1SwapTpslHisorders` | POST | `swap-api/v1/swap_tpsl_hisorders` | 1 |
| `contractPrivatePostSwapApiV1SwapRelationTpslOrder` | POST | `swap-api/v1/swap_relation_tpsl_order` | 1 |
| `contractPrivatePostSwapApiV1SwapTrackOrder` | POST | `swap-api/v1/swap_track_order` | 1 |
| `contractPrivatePostSwapApiV1SwapTrackCancel` | POST | `swap-api/v1/swap_track_cancel` | 1 |
| `contractPrivatePostSwapApiV1SwapTrackCancelall` | POST | `swap-api/v1/swap_track_cancelall` | 1 |
| `contractPrivatePostSwapApiV1SwapTrackOpenorders` | POST | `swap-api/v1/swap_track_openorders` | 1 |
| `contractPrivatePostSwapApiV1SwapTrackHisorders` | POST | `swap-api/v1/swap_track_hisorders` | 1 |
| `contractPrivatePostV5AccountAssetMode` | POST | `v5/account/asset_mode` | 100 |
| `contractPrivatePostV5TradeOrder` | POST | `v5/trade/order` | 0.41679 |
| `contractPrivatePostV5TradeBatchOrders` | POST | `v5/trade/batch_orders` | 0.41679 |
| `contractPrivatePostV5TradeCancelOrder` | POST | `v5/trade/cancel_order` | 0.41679 |
| `contractPrivatePostV5TradeCancelBatchOrders` | POST | `v5/trade/cancel_batch_orders` | 0.41679 |
| `contractPrivatePostV5TradeCancelAllOrders` | POST | `v5/trade/cancel_all_orders` | 0.41679 |
| `contractPrivatePostV5TradeCancelAfter` | POST | `v5/trade/cancel-after` | 0.41679 |
| `contractPrivatePostV5TradePosition` | POST | `v5/trade/position` | 0.41679 |
| `contractPrivatePostV5TradePositionAll` | POST | `v5/trade/position_all` | 0.41679 |
| `contractPrivatePostV5PositionLever` | POST | `v5/position/lever` | 0.20834 |
| `contractPrivatePostV5PositionMode` | POST | `v5/position/mode` | 0.20834 |
| `contractPrivatePostV5PositionMargin` | POST | `v5/position/margin` | 0.20834 |
| `contractPrivatePostV5AccountFeeDeductionCurrency` | POST | `v5/account/fee_deduction_currency` | 0.20834 |
| `contractPrivatePostV5AlgoOrder` | POST | `v5/algo/order` | 0.41679 |
| `contractPrivatePostV5AlgoCancelOrders` | POST | `v5/algo/cancel_orders` | 0.41679 |

