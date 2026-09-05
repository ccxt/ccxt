Every endpoint in `bittrade`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bittrade) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `v2PublicGetReferenceCurrencies`); the snake_case alias (`v2Public_get_reference_currencies`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`V2PublicGetReferenceCurrencies`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bittrade = new ccxt.bittrade ();
const response = await bittrade.v2PublicGetReferenceCurrencies (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bittrade = new ccxt.bittrade ();
const response = await bittrade.v2PublicGetReferenceCurrencies (params);
```

#### **Python**

```python
import ccxt
bittrade = ccxt.bittrade()
response = bittrade.v2Public_get_reference_currencies(params)
```

#### **PHP**

```php
$bittrade = new \ccxt\bittrade();
$response = $bittrade->v2Public_get_reference_currencies($params);
```

#### **C#**

```csharp
using ccxt;
var bittrade = new Bittrade();
var response = await bittrade.v2PublicGetReferenceCurrencies(parameters);
```

#### **Go**

```go
bittrade := ccxt.NewBittrade(nil)
response := <-bittrade.V2PublicGetReferenceCurrencies(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bittrade API documentation:** [api-doc.bittrade.co.jp](https://api-doc.bittrade.co.jp)

> 110 implicit endpoints across 5 access groups.

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

## market

**Base URL**: `https://{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `marketGetHistoryKline` | GET | `history/kline` | 1 |
| `marketGetDetailMerged` | GET | `detail/merged` | 1 |
| `marketGetDepth` | GET | `depth` | 1 |
| `marketGetTrade` | GET | `trade` | 1 |
| `marketGetHistoryTrade` | GET | `history/trade` | 1 |
| `marketGetDetail` | GET | `detail` | 1 |
| `marketGetTickers` | GET | `tickers` | 1 |
| `marketGetEtp` | GET | `etp` | 1 |

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

