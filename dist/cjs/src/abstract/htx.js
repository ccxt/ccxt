'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    v2PublicGetReferenceCurrencies(params = {}) {
        return this.request('reference/currencies', ['v2Public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PublicGetMarketStatus(params = {}) {
        return this.request('market-status', ['v2Public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetAccountLedger(params = {}) {
        return this.request('account/ledger', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetAccountWithdrawQuota(params = {}) {
        return this.request('account/withdraw/quota', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetAccountWithdrawAddress(params = {}) {
        return this.request('account/withdraw/address', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetAccountDepositAddress(params = {}) {
        return this.request('account/deposit/address', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetAccountRepayment(params = {}) {
        return this.request('account/repayment', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v2PrivateGetReferenceTransactFeeRate(params = {}) {
        return this.request('reference/transact-fee-rate', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetAccountAssetValuation(params = {}) {
        return this.request('account/asset-valuation', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 0.2 });
    }
    v2PrivateGetPointAccount(params = {}) {
        return this.request('point/account', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v2PrivateGetSubUserUserList(params = {}) {
        return this.request('sub-user/user-list', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetSubUserUserState(params = {}) {
        return this.request('sub-user/user-state', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetSubUserAccountList(params = {}) {
        return this.request('sub-user/account-list', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetSubUserDepositAddress(params = {}) {
        return this.request('sub-user/deposit-address', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetSubUserQueryDeposit(params = {}) {
        return this.request('sub-user/query-deposit', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetUserApiKey(params = {}) {
        return this.request('user/api-key', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetUserUid(params = {}) {
        return this.request('user/uid', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetAlgoOrdersOpening(params = {}) {
        return this.request('algo-orders/opening', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetAlgoOrdersHistory(params = {}) {
        return this.request('algo-orders/history', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetAlgoOrdersSpecific(params = {}) {
        return this.request('algo-orders/specific', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetC2cOffers(params = {}) {
        return this.request('c2c/offers', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetC2cOffer(params = {}) {
        return this.request('c2c/offer', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetC2cTransactions(params = {}) {
        return this.request('c2c/transactions', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetC2cRepayment(params = {}) {
        return this.request('c2c/repayment', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetC2cAccount(params = {}) {
        return this.request('c2c/account', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetEtpReference(params = {}) {
        return this.request('etp/reference', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetEtpTransactions(params = {}) {
        return this.request('etp/transactions', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v2PrivateGetEtpTransaction(params = {}) {
        return this.request('etp/transaction', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v2PrivateGetEtpRebalance(params = {}) {
        return this.request('etp/rebalance', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivateGetEtpLimit(params = {}) {
        return this.request('etp/limit', ['v2Private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostAccountTransfer(params = {}) {
        return this.request('account/transfer', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostAccountRepayment(params = {}) {
        return this.request('account/repayment', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    v2PrivatePostPointTransfer(params = {}) {
        return this.request('point/transfer', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    v2PrivatePostSubUserManagement(params = {}) {
        return this.request('sub-user/management', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostSubUserCreation(params = {}) {
        return this.request('sub-user/creation', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostSubUserTradableMarket(params = {}) {
        return this.request('sub-user/tradable-market', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostSubUserTransferability(params = {}) {
        return this.request('sub-user/transferability', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostSubUserApiKeyGeneration(params = {}) {
        return this.request('sub-user/api-key-generation', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostSubUserApiKeyModification(params = {}) {
        return this.request('sub-user/api-key-modification', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostSubUserApiKeyDeletion(params = {}) {
        return this.request('sub-user/api-key-deletion', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostSubUserDeductMode(params = {}) {
        return this.request('sub-user/deduct-mode', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostAlgoOrders(params = {}) {
        return this.request('algo-orders', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostAlgoOrdersCancelAllAfter(params = {}) {
        return this.request('algo-orders/cancel-all-after', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostAlgoOrdersCancellation(params = {}) {
        return this.request('algo-orders/cancellation', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostC2cOffer(params = {}) {
        return this.request('c2c/offer', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostC2cCancellation(params = {}) {
        return this.request('c2c/cancellation', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostC2cCancelAll(params = {}) {
        return this.request('c2c/cancel-all', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostC2cRepayment(params = {}) {
        return this.request('c2c/repayment', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostC2cTransfer(params = {}) {
        return this.request('c2c/transfer', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostEtpCreation(params = {}) {
        return this.request('etp/creation', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    v2PrivatePostEtpRedemption(params = {}) {
        return this.request('etp/redemption', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    v2PrivatePostEtpTransactIdCancel(params = {}) {
        return this.request('etp/{transactId}/cancel', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v2PrivatePostEtpBatchCancel(params = {}) {
        return this.request('etp/batch-cancel', ['v2Private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    publicGetCommonSymbols(params = {}) {
        return this.request('common/symbols', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetCommonCurrencys(params = {}) {
        return this.request('common/currencys', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetCommonTimestamp(params = {}) {
        return this.request('common/timestamp', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetCommonExchange(params = {}) {
        return this.request('common/exchange', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetSettingsCurrencys(params = {}) {
        return this.request('settings/currencys', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAccountAccounts(params = {}) {
        return this.request('account/accounts', ['private'], 'GET', params, undefined, undefined, { 'cost': 0.2 });
    }
    privateGetAccountAccountsIdBalance(params = {}) {
        return this.request('account/accounts/{id}/balance', ['private'], 'GET', params, undefined, undefined, { 'cost': 0.2 });
    }
    privateGetAccountAccountsSubUid(params = {}) {
        return this.request('account/accounts/{sub-uid}', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAccountHistory(params = {}) {
        return this.request('account/history', ['private'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    privateGetCrossMarginLoanInfo(params = {}) {
        return this.request('cross-margin/loan-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetMarginLoanInfo(params = {}) {
        return this.request('margin/loan-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetFeeFeeRateGet(params = {}) {
        return this.request('fee/fee-rate/get', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetOrderOpenOrders(params = {}) {
        return this.request('order/openOrders', ['private'], 'GET', params, undefined, undefined, { 'cost': 0.4 });
    }
    privateGetOrderOrders(params = {}) {
        return this.request('order/orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 0.4 });
    }
    privateGetOrderOrdersId(params = {}) {
        return this.request('order/orders/{id}', ['private'], 'GET', params, undefined, undefined, { 'cost': 0.4 });
    }
    privateGetOrderOrdersIdMatchresults(params = {}) {
        return this.request('order/orders/{id}/matchresults', ['private'], 'GET', params, undefined, undefined, { 'cost': 0.4 });
    }
    privateGetOrderOrdersGetClientOrder(params = {}) {
        return this.request('order/orders/getClientOrder', ['private'], 'GET', params, undefined, undefined, { 'cost': 0.4 });
    }
    privateGetOrderHistory(params = {}) {
        return this.request('order/history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetOrderMatchresults(params = {}) {
        return this.request('order/matchresults', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetQueryDepositWithdraw(params = {}) {
        return this.request('query/deposit-withdraw', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetMarginLoanOrders(params = {}) {
        return this.request('margin/loan-orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 0.2 });
    }
    privateGetMarginAccountsBalance(params = {}) {
        return this.request('margin/accounts/balance', ['private'], 'GET', params, undefined, undefined, { 'cost': 0.2 });
    }
    privateGetCrossMarginLoanOrders(params = {}) {
        return this.request('cross-margin/loan-orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetCrossMarginAccountsBalance(params = {}) {
        return this.request('cross-margin/accounts/balance', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetPointsActions(params = {}) {
        return this.request('points/actions', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetPointsOrders(params = {}) {
        return this.request('points/orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetSubuserAggregateBalance(params = {}) {
        return this.request('subuser/aggregate-balance', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetStableCoinExchangeRate(params = {}) {
        return this.request('stable-coin/exchange_rate', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetStableCoinQuote(params = {}) {
        return this.request('stable-coin/quote', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAccountTransfer(params = {}) {
        return this.request('account/transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostFuturesTransfer(params = {}) {
        return this.request('futures/transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOrderBatchOrders(params = {}) {
        return this.request('order/batch-orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 0.4 });
    }
    privatePostOrderOrdersPlace(params = {}) {
        return this.request('order/orders/place', ['private'], 'POST', params, undefined, undefined, { 'cost': 0.2 });
    }
    privatePostOrderOrdersSubmitCancelClientOrder(params = {}) {
        return this.request('order/orders/submitCancelClientOrder', ['private'], 'POST', params, undefined, undefined, { 'cost': 0.2 });
    }
    privatePostOrderOrdersBatchCancelOpenOrders(params = {}) {
        return this.request('order/orders/batchCancelOpenOrders', ['private'], 'POST', params, undefined, undefined, { 'cost': 0.4 });
    }
    privatePostOrderOrdersIdSubmitcancel(params = {}) {
        return this.request('order/orders/{id}/submitcancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 0.2 });
    }
    privatePostOrderOrdersBatchcancel(params = {}) {
        return this.request('order/orders/batchcancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 0.4 });
    }
    privatePostDwWithdrawApiCreate(params = {}) {
        return this.request('dw/withdraw/api/create', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostDwWithdrawVirtualIdCancel(params = {}) {
        return this.request('dw/withdraw-virtual/{id}/cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostDwTransferInMargin(params = {}) {
        return this.request('dw/transfer-in/margin', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostDwTransferOutMargin(params = {}) {
        return this.request('dw/transfer-out/margin', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostMarginOrders(params = {}) {
        return this.request('margin/orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostMarginOrdersIdRepay(params = {}) {
        return this.request('margin/orders/{id}/repay', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostCrossMarginTransferIn(params = {}) {
        return this.request('cross-margin/transfer-in', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCrossMarginTransferOut(params = {}) {
        return this.request('cross-margin/transfer-out', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCrossMarginOrders(params = {}) {
        return this.request('cross-margin/orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCrossMarginOrdersIdRepay(params = {}) {
        return this.request('cross-margin/orders/{id}/repay', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostStableCoinExchange(params = {}) {
        return this.request('stable-coin/exchange', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSubuserTransfer(params = {}) {
        return this.request('subuser/transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    spotPublicGetV2MarketStatus(params = {}) {
        return this.request('v2/market-status', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetV1CommonSymbols(params = {}) {
        return this.request('v1/common/symbols', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetV1CommonCurrencys(params = {}) {
        return this.request('v1/common/currencys', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetV2SettingsCommonCurrencies(params = {}) {
        return this.request('v2/settings/common/currencies', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetV2ReferenceCurrencies(params = {}) {
        return this.request('v2/reference/currencies', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetV1CommonTimestamp(params = {}) {
        return this.request('v1/common/timestamp', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetV1CommonExchange(params = {}) {
        return this.request('v1/common/exchange', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetV1SettingsCommonChains(params = {}) {
        return this.request('v1/settings/common/chains', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetV1SettingsCommonCurrencys(params = {}) {
        return this.request('v1/settings/common/currencys', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetV1SettingsCommonSymbols(params = {}) {
        return this.request('v1/settings/common/symbols', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetV2SettingsCommonSymbols(params = {}) {
        return this.request('v2/settings/common/symbols', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetV1SettingsCommonMarketSymbols(params = {}) {
        return this.request('v1/settings/common/market-symbols', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetMarketHistoryCandles(params = {}) {
        return this.request('market/history/candles', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetMarketHistoryKline(params = {}) {
        return this.request('market/history/kline', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetMarketDetailMerged(params = {}) {
        return this.request('market/detail/merged', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetMarketTickers(params = {}) {
        return this.request('market/tickers', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetMarketDetail(params = {}) {
        return this.request('market/detail', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetMarketDepth(params = {}) {
        return this.request('market/depth', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetMarketTrade(params = {}) {
        return this.request('market/trade', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetMarketHistoryTrade(params = {}) {
        return this.request('market/history/trade', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetMarketEtp(params = {}) {
        return this.request('market/etp', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetV2EtpReference(params = {}) {
        return this.request('v2/etp/reference', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetV2EtpRebalance(params = {}) {
        return this.request('v2/etp/rebalance', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV1AccountAccounts(params = {}) {
        return this.request('v1/account/accounts', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.2 });
    }
    spotPrivateGetV1AccountAccountsAccountIdBalance(params = {}) {
        return this.request('v1/account/accounts/{account-id}/balance', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.2 });
    }
    spotPrivateGetV2AccountValuation(params = {}) {
        return this.request('v2/account/valuation', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2AccountAssetValuation(params = {}) {
        return this.request('v2/account/asset-valuation', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.2 });
    }
    spotPrivateGetV1AccountHistory(params = {}) {
        return this.request('v1/account/history', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    spotPrivateGetV2AccountLedger(params = {}) {
        return this.request('v2/account/ledger', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2PointAccount(params = {}) {
        return this.request('v2/point/account', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    spotPrivateGetV2AccountDepositAddress(params = {}) {
        return this.request('v2/account/deposit/address', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2AccountWithdrawQuota(params = {}) {
        return this.request('v2/account/withdraw/quota', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2AccountWithdrawAddress(params = {}) {
        return this.request('v2/account/withdraw/address', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2ReferenceCurrencies(params = {}) {
        return this.request('v2/reference/currencies', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV1QueryDepositWithdraw(params = {}) {
        return this.request('v1/query/deposit-withdraw', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV1QueryWithdrawClientOrderId(params = {}) {
        return this.request('v1/query/withdraw/client-order-id', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2UserApiKey(params = {}) {
        return this.request('v2/user/api-key', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2UserUid(params = {}) {
        return this.request('v2/user/uid', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2SubUserUserList(params = {}) {
        return this.request('v2/sub-user/user-list', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2SubUserUserState(params = {}) {
        return this.request('v2/sub-user/user-state', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2SubUserAccountList(params = {}) {
        return this.request('v2/sub-user/account-list', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2SubUserDepositAddress(params = {}) {
        return this.request('v2/sub-user/deposit-address', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2SubUserQueryDeposit(params = {}) {
        return this.request('v2/sub-user/query-deposit', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV1SubuserAggregateBalance(params = {}) {
        return this.request('v1/subuser/aggregate-balance', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivateGetV1AccountAccountsSubUid(params = {}) {
        return this.request('v1/account/accounts/{sub-uid}', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV1OrderOpenOrders(params = {}) {
        return this.request('v1/order/openOrders', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.4 });
    }
    spotPrivateGetV1OrderOrdersOrderId(params = {}) {
        return this.request('v1/order/orders/{order-id}', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.4 });
    }
    spotPrivateGetV1OrderOrdersGetClientOrder(params = {}) {
        return this.request('v1/order/orders/getClientOrder', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.4 });
    }
    spotPrivateGetV1OrderOrdersOrderIdMatchresult(params = {}) {
        return this.request('v1/order/orders/{order-id}/matchresult', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.4 });
    }
    spotPrivateGetV1OrderOrdersOrderIdMatchresults(params = {}) {
        return this.request('v1/order/orders/{order-id}/matchresults', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.4 });
    }
    spotPrivateGetV1OrderOrders(params = {}) {
        return this.request('v1/order/orders', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.4 });
    }
    spotPrivateGetV1OrderHistory(params = {}) {
        return this.request('v1/order/history', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV1OrderMatchresults(params = {}) {
        return this.request('v1/order/matchresults', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2ReferenceTransactFeeRate(params = {}) {
        return this.request('v2/reference/transact-fee-rate', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2AlgoOrdersOpening(params = {}) {
        return this.request('v2/algo-orders/opening', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2AlgoOrdersHistory(params = {}) {
        return this.request('v2/algo-orders/history', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2AlgoOrdersSpecific(params = {}) {
        return this.request('v2/algo-orders/specific', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV1MarginLoanInfo(params = {}) {
        return this.request('v1/margin/loan-info', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV1MarginLoanOrders(params = {}) {
        return this.request('v1/margin/loan-orders', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.2 });
    }
    spotPrivateGetV1MarginAccountsBalance(params = {}) {
        return this.request('v1/margin/accounts/balance', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.2 });
    }
    spotPrivateGetV1CrossMarginLoanInfo(params = {}) {
        return this.request('v1/cross-margin/loan-info', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV1CrossMarginLoanOrders(params = {}) {
        return this.request('v1/cross-margin/loan-orders', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV1CrossMarginAccountsBalance(params = {}) {
        return this.request('v1/cross-margin/accounts/balance', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2AccountRepayment(params = {}) {
        return this.request('v2/account/repayment', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    spotPrivateGetV5AccountUniversalTransferRecords(params = {}) {
        return this.request('v5/account/universal_transfer_records', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    spotPrivateGetV1StableCoinQuote(params = {}) {
        return this.request('v1/stable-coin/quote', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV1StableCoinExchangeRate(params = {}) {
        return this.request('v1/stable_coin/exchange_rate', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2EtpTransactions(params = {}) {
        return this.request('v2/etp/transactions', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    spotPrivateGetV2EtpTransaction(params = {}) {
        return this.request('v2/etp/transaction', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    spotPrivateGetV2EtpLimit(params = {}) {
        return this.request('v2/etp/limit', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2InviteeRebateReferrals(params = {}) {
        return this.request('v2/invitee/rebate/referrals', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivateGetV2InviteeRebateDetail(params = {}) {
        return this.request('v2/invitee/rebate/detail', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2InviteeRebateHistory(params = {}) {
        return this.request('v2/invitee/rebate/history', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2InviteeRebateAllRebateDetail(params = {}) {
        return this.request('v2/invitee/rebate/all_rebate/detail', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetV2InviteeRebateBatcherRebateDetail(params = {}) {
        return this.request('v2/invitee/rebate/batcher_rebate/detail', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV1AccountTransfer(params = {}) {
        return this.request('v1/account/transfer', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV1FuturesTransfer(params = {}) {
        return this.request('v1/futures/transfer', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV2PointTransfer(params = {}) {
        return this.request('v2/point/transfer', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    spotPrivatePostV2AccountTransfer(params = {}) {
        return this.request('v2/account/transfer', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV1DwWithdrawApiCreate(params = {}) {
        return this.request('v1/dw/withdraw/api/create', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV1DwWithdrawVirtualWithdrawIdCancel(params = {}) {
        return this.request('v1/dw/withdraw-virtual/{withdraw-id}/cancel', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV2SubUserDeductMode(params = {}) {
        return this.request('v2/sub-user/deduct-mode', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV2SubUserCreation(params = {}) {
        return this.request('v2/sub-user/creation', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV2SubUserManagement(params = {}) {
        return this.request('v2/sub-user/management', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV2SubUserTradableMarket(params = {}) {
        return this.request('v2/sub-user/tradable-market', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV2SubUserTransferability(params = {}) {
        return this.request('v2/sub-user/transferability', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV2SubUserApiKeyGeneration(params = {}) {
        return this.request('v2/sub-user/api-key-generation', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV2SubUserApiKeyModification(params = {}) {
        return this.request('v2/sub-user/api-key-modification', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV2SubUserApiKeyDeletion(params = {}) {
        return this.request('v2/sub-user/api-key-deletion', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV1SubuserTransfer(params = {}) {
        return this.request('v1/subuser/transfer', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivatePostV1TrustUserActiveCredit(params = {}) {
        return this.request('v1/trust/user/active/credit', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivatePostV1OrderOrdersPlace(params = {}) {
        return this.request('v1/order/orders/place', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.2 });
    }
    spotPrivatePostV1OrderBatchOrders(params = {}) {
        return this.request('v1/order/batch-orders', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.4 });
    }
    spotPrivatePostV1OrderAutoPlace(params = {}) {
        return this.request('v1/order/auto/place', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.2 });
    }
    spotPrivatePostV1OrderOrdersOrderIdSubmitcancel(params = {}) {
        return this.request('v1/order/orders/{order-id}/submitcancel', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.2 });
    }
    spotPrivatePostV1OrderOrdersSubmitCancelClientOrder(params = {}) {
        return this.request('v1/order/orders/submitCancelClientOrder', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.2 });
    }
    spotPrivatePostV1OrderOrdersBatchCancelOpenOrders(params = {}) {
        return this.request('v1/order/orders/batchCancelOpenOrders', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.4 });
    }
    spotPrivatePostV1OrderOrdersBatchcancel(params = {}) {
        return this.request('v1/order/orders/batchcancel', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.4 });
    }
    spotPrivatePostV2AlgoOrdersCancelAllAfter(params = {}) {
        return this.request('v2/algo-orders/cancel-all-after', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV2AlgoOrders(params = {}) {
        return this.request('v2/algo-orders', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV2AlgoOrdersCancellation(params = {}) {
        return this.request('v2/algo-orders/cancellation', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV2AccountRepayment(params = {}) {
        return this.request('v2/account/repayment', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    spotPrivatePostV1DwTransferInMargin(params = {}) {
        return this.request('v1/dw/transfer-in/margin', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivatePostV1DwTransferOutMargin(params = {}) {
        return this.request('v1/dw/transfer-out/margin', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivatePostV1MarginOrders(params = {}) {
        return this.request('v1/margin/orders', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivatePostV1MarginOrdersOrderIdRepay(params = {}) {
        return this.request('v1/margin/orders/{order-id}/repay', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivatePostV1CrossMarginTransferIn(params = {}) {
        return this.request('v1/cross-margin/transfer-in', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV1CrossMarginTransferOut(params = {}) {
        return this.request('v1/cross-margin/transfer-out', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV1CrossMarginOrders(params = {}) {
        return this.request('v1/cross-margin/orders', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV1CrossMarginOrdersOrderIdRepay(params = {}) {
        return this.request('v1/cross-margin/orders/{order-id}/repay', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV1StableCoinExchange(params = {}) {
        return this.request('v1/stable-coin/exchange', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostV2EtpCreation(params = {}) {
        return this.request('v2/etp/creation', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    spotPrivatePostV2EtpRedemption(params = {}) {
        return this.request('v2/etp/redemption', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    spotPrivatePostV2EtpTransactIdCancel(params = {}) {
        return this.request('v2/etp/{transactId}/cancel', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivatePostV2EtpBatchCancel(params = {}) {
        return this.request('v2/etp/batch-cancel', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    spotPrivatePostV5AccountUniversalTransfer(params = {}) {
        return this.request('v5/account/universal_transfer', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    contractPublicGetApiV1Timestamp(params = {}) {
        return this.request('api/v1/timestamp', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetHeartbeat(params = {}) {
        return this.request('heartbeat/', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetApiV1ContractContractInfo(params = {}) {
        return this.request('api/v1/contract_contract_info', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetApiV1ContractIndex(params = {}) {
        return this.request('api/v1/contract_index', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetApiV1ContractQueryElements(params = {}) {
        return this.request('api/v1/contract_query_elements', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetApiV1ContractPriceLimit(params = {}) {
        return this.request('api/v1/contract_price_limit', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetApiV1ContractOpenInterest(params = {}) {
        return this.request('api/v1/contract_open_interest', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetApiV1ContractDeliveryPrice(params = {}) {
        return this.request('api/v1/contract_delivery_price', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetMarketDepth(params = {}) {
        return this.request('market/depth', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetMarketBbo(params = {}) {
        return this.request('market/bbo', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetMarketHistoryKline(params = {}) {
        return this.request('market/history/kline', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetIndexMarketHistoryMarkPriceKline(params = {}) {
        return this.request('index/market/history/mark_price_kline', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetMarketDetailMerged(params = {}) {
        return this.request('market/detail/merged', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetMarketDetailBatchMerged(params = {}) {
        return this.request('market/detail/batch_merged', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetV2MarketDetailBatchMerged(params = {}) {
        return this.request('v2/market/detail/batch_merged', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetMarketTrade(params = {}) {
        return this.request('market/trade', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetMarketHistoryTrade(params = {}) {
        return this.request('market/history/trade', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetApiV1ContractRiskInfo(params = {}) {
        return this.request('api/v1/contract_risk_info', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetApiV1ContractInsuranceFund(params = {}) {
        return this.request('api/v1/contract_insurance_fund', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetApiV1ContractAdjustfactor(params = {}) {
        return this.request('api/v1/contract_adjustfactor', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetApiV1ContractHisOpenInterest(params = {}) {
        return this.request('api/v1/contract_his_open_interest', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetApiV1ContractLadderMargin(params = {}) {
        return this.request('api/v1/contract_ladder_margin', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetApiV1ContractApiState(params = {}) {
        return this.request('api/v1/contract_api_state', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetApiV1ContractEliteAccountRatio(params = {}) {
        return this.request('api/v1/contract_elite_account_ratio', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetApiV1ContractElitePositionRatio(params = {}) {
        return this.request('api/v1/contract_elite_position_ratio', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetApiV1ContractLiquidationOrders(params = {}) {
        return this.request('api/v1/contract_liquidation_orders', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetApiV1ContractSettlementRecords(params = {}) {
        return this.request('api/v1/contract_settlement_records', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetIndexMarketHistoryIndex(params = {}) {
        return this.request('index/market/history/index', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetIndexMarketHistoryBasis(params = {}) {
        return this.request('index/market/history/basis', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetApiV1ContractEstimatedSettlementPrice(params = {}) {
        return this.request('api/v1/contract_estimated_settlement_price', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetApiV3ContractLiquidationOrders(params = {}) {
        return this.request('api/v3/contract_liquidation_orders', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapContractInfo(params = {}) {
        return this.request('swap-api/v1/swap_contract_info', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapIndex(params = {}) {
        return this.request('swap-api/v1/swap_index', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapQueryElements(params = {}) {
        return this.request('swap-api/v1/swap_query_elements', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapPriceLimit(params = {}) {
        return this.request('swap-api/v1/swap_price_limit', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapOpenInterest(params = {}) {
        return this.request('swap-api/v1/swap_open_interest', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapExMarketDepth(params = {}) {
        return this.request('swap-ex/market/depth', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapExMarketBbo(params = {}) {
        return this.request('swap-ex/market/bbo', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapExMarketHistoryKline(params = {}) {
        return this.request('swap-ex/market/history/kline', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetIndexMarketHistorySwapMarkPriceKline(params = {}) {
        return this.request('index/market/history/swap_mark_price_kline', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapExMarketDetailMerged(params = {}) {
        return this.request('swap-ex/market/detail/merged', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetV2SwapExMarketDetailBatchMerged(params = {}) {
        return this.request('v2/swap-ex/market/detail/batch_merged', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetIndexMarketHistorySwapPremiumIndexKline(params = {}) {
        return this.request('index/market/history/swap_premium_index_kline', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapExMarketDetailBatchMerged(params = {}) {
        return this.request('swap-ex/market/detail/batch_merged', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapExMarketTrade(params = {}) {
        return this.request('swap-ex/market/trade', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapExMarketHistoryTrade(params = {}) {
        return this.request('swap-ex/market/history/trade', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapRiskInfo(params = {}) {
        return this.request('swap-api/v1/swap_risk_info', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapInsuranceFund(params = {}) {
        return this.request('swap-api/v1/swap_insurance_fund', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapAdjustfactor(params = {}) {
        return this.request('swap-api/v1/swap_adjustfactor', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapHisOpenInterest(params = {}) {
        return this.request('swap-api/v1/swap_his_open_interest', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapLadderMargin(params = {}) {
        return this.request('swap-api/v1/swap_ladder_margin', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapApiState(params = {}) {
        return this.request('swap-api/v1/swap_api_state', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapEliteAccountRatio(params = {}) {
        return this.request('swap-api/v1/swap_elite_account_ratio', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapElitePositionRatio(params = {}) {
        return this.request('swap-api/v1/swap_elite_position_ratio', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapEstimatedSettlementPrice(params = {}) {
        return this.request('swap-api/v1/swap_estimated_settlement_price', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapLiquidationOrders(params = {}) {
        return this.request('swap-api/v1/swap_liquidation_orders', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapSettlementRecords(params = {}) {
        return this.request('swap-api/v1/swap_settlement_records', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapFundingRate(params = {}) {
        return this.request('swap-api/v1/swap_funding_rate', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapBatchFundingRate(params = {}) {
        return this.request('swap-api/v1/swap_batch_funding_rate', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1SwapHistoricalFundingRate(params = {}) {
        return this.request('swap-api/v1/swap_historical_funding_rate', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV3SwapLiquidationOrders(params = {}) {
        return this.request('swap-api/v3/swap_liquidation_orders', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetIndexMarketHistorySwapEstimatedRateKline(params = {}) {
        return this.request('index/market/history/swap_estimated_rate_kline', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetIndexMarketHistorySwapBasis(params = {}) {
        return this.request('index/market/history/swap_basis', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapApiV1SwapContractInfo(params = {}) {
        return this.request('linear-swap-api/v1/swap_contract_info', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapApiV1SwapIndex(params = {}) {
        return this.request('linear-swap-api/v1/swap_index', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapApiV1SwapQueryElements(params = {}) {
        return this.request('linear-swap-api/v1/swap_query_elements', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapApiV1SwapPriceLimit(params = {}) {
        return this.request('linear-swap-api/v1/swap_price_limit', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapExMarketDepth(params = {}) {
        return this.request('linear-swap-ex/market/depth', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapExMarketBbo(params = {}) {
        return this.request('linear-swap-ex/market/bbo', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapExMarketHistoryKline(params = {}) {
        return this.request('linear-swap-ex/market/history/kline', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetIndexMarketHistoryLinearSwapMarkPriceKline(params = {}) {
        return this.request('index/market/history/linear_swap_mark_price_kline', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapExMarketDetailMerged(params = {}) {
        return this.request('linear-swap-ex/market/detail/merged', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapExMarketDetailBatchMerged(params = {}) {
        return this.request('linear-swap-ex/market/detail/batch_merged', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetV2LinearSwapExMarketDetailBatchMerged(params = {}) {
        return this.request('v2/linear-swap-ex/market/detail/batch_merged', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapExMarketTrade(params = {}) {
        return this.request('linear-swap-ex/market/trade', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapExMarketHistoryTrade(params = {}) {
        return this.request('linear-swap-ex/market/history/trade', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetSwapApiV1LinearSwapApiV1SwapInsuranceFund(params = {}) {
        return this.request('swap-api/v1/linear-swap-api/v1/swap_insurance_fund', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapApiV1SwapAdjustfactor(params = {}) {
        return this.request('linear-swap-api/v1/swap_adjustfactor', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapApiV1SwapCrossAdjustfactor(params = {}) {
        return this.request('linear-swap-api/v1/swap_cross_adjustfactor', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapApiV1SwapHisOpenInterest(params = {}) {
        return this.request('linear-swap-api/v1/swap_his_open_interest', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapApiV1SwapLadderMargin(params = {}) {
        return this.request('linear-swap-api/v1/swap_ladder_margin', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapApiV1SwapCrossLadderMargin(params = {}) {
        return this.request('linear-swap-api/v1/swap_cross_ladder_margin', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapApiV1SwapApiState(params = {}) {
        return this.request('linear-swap-api/v1/swap_api_state', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapApiV1SwapEliteAccountRatio(params = {}) {
        return this.request('linear-swap-api/v1/swap_elite_account_ratio', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapApiV1SwapElitePositionRatio(params = {}) {
        return this.request('linear-swap-api/v1/swap_elite_position_ratio', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapApiV1SwapSettlementRecords(params = {}) {
        return this.request('linear-swap-api/v1/swap_settlement_records', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapApiV3SwapLiquidationOrders(params = {}) {
        return this.request('linear-swap-api/v3/swap_liquidation_orders', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetIndexMarketHistoryLinearSwapPremiumIndexKline(params = {}) {
        return this.request('index/market/history/linear_swap_premium_index_kline', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetIndexMarketHistoryLinearSwapEstimatedRateKline(params = {}) {
        return this.request('index/market/history/linear_swap_estimated_rate_kline', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetIndexMarketHistoryLinearSwapBasis(params = {}) {
        return this.request('index/market/history/linear_swap_basis', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetLinearSwapApiV1SwapEstimatedSettlementPrice(params = {}) {
        return this.request('linear-swap-api/v1/swap_estimated_settlement_price', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetV5MarketFundingRate(params = {}) {
        return this.request('v5/market/funding_rate', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.125 });
    }
    contractPublicGetV5MarketFundingRateHistory(params = {}) {
        return this.request('v5/market/funding_rate_history', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.125 });
    }
    contractPublicGetV5MarketOpenInterest(params = {}) {
        return this.request('v5/market/open_interest', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.125 });
    }
    contractPublicGetV5MarketLiquidationOrders(params = {}) {
        return this.request('v5/market/liquidation_orders', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.125 });
    }
    contractPublicGetV5MarketSettlementHistory(params = {}) {
        return this.request('v5/market/settlement_history', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.125 });
    }
    contractPublicGetV5MarketEliteAccountRatio(params = {}) {
        return this.request('v5/market/elite_account_ratio', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.125 });
    }
    contractPublicGetV5MarketElitePositionRatio(params = {}) {
        return this.request('v5/market/elite_position_ratio', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.125 });
    }
    contractPublicGetV5MarketEstimatedSettlementPrice(params = {}) {
        return this.request('v5/market/estimated_settlement_price', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.125 });
    }
    contractPublicGetV5MarketPriceLimit(params = {}) {
        return this.request('v5/market/price_limit', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.125 });
    }
    contractPrivateGetApiV1ContractSubAuthList(params = {}) {
        return this.request('api/v1/contract_sub_auth_list', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivateGetApiV1ContractApiTradingStatus(params = {}) {
        return this.request('api/v1/contract_api_trading_status', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivateGetSwapApiV1SwapSubAuthList(params = {}) {
        return this.request('swap-api/v1/swap_sub_auth_list', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivateGetSwapApiV1SwapApiTradingStatus(params = {}) {
        return this.request('swap-api/v1/swap_api_trading_status', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivateGetV5AccountAssetMode(params = {}) {
        return this.request('v5/account/asset_mode', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.20834 });
    }
    contractPrivateGetV5AccountBalance(params = {}) {
        return this.request('v5/account/balance', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.20834 });
    }
    contractPrivateGetV5AccountBills(params = {}) {
        return this.request('v5/account/bills', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.20834 });
    }
    contractPrivateGetV5AccountFeeDeductionCurrency(params = {}) {
        return this.request('v5/account/fee_deduction_currency', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.20834 });
    }
    contractPrivateGetV5TradePositionOpens(params = {}) {
        return this.request('v5/trade/position/opens', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.41679 });
    }
    contractPrivateGetV5TradeOrderOpens(params = {}) {
        return this.request('v5/trade/order/opens', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.41679 });
    }
    contractPrivateGetV5TradeOrderDetails(params = {}) {
        return this.request('v5/trade/order/details', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.41679 });
    }
    contractPrivateGetV5TradeOrderHistory(params = {}) {
        return this.request('v5/trade/order/history', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.41679 });
    }
    contractPrivateGetV5TradeOrder(params = {}) {
        return this.request('v5/trade/order', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.41679 });
    }
    contractPrivateGetV5PositionLever(params = {}) {
        return this.request('v5/position/lever', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.20834 });
    }
    contractPrivateGetV5PositionMode(params = {}) {
        return this.request('v5/position/mode', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.20834 });
    }
    contractPrivateGetV5PositionRiskLimit(params = {}) {
        return this.request('v5/position/risk/limit', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.20834 });
    }
    contractPrivateGetV5PositionRiskLimitTier(params = {}) {
        return this.request('v5/position/risk/limit_tier', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.20834 });
    }
    contractPrivateGetV5MarketRiskLimit(params = {}) {
        return this.request('v5/market/risk/limit', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.125 });
    }
    contractPrivateGetV5MarketAssetsDeductionCurrency(params = {}) {
        return this.request('v5/market/assets_deduction_currency', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.125 });
    }
    contractPrivateGetV5MarketMultiAssetsMargin(params = {}) {
        return this.request('v5/market/multi_assets_margin', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.125 });
    }
    contractPrivateGetV5AlgoOrderOpens(params = {}) {
        return this.request('v5/algo/order/opens', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.41679 });
    }
    contractPrivateGetV5AlgoOrder(params = {}) {
        return this.request('v5/algo/order', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.41679 });
    }
    contractPrivateGetV5AlgoOrderHistory(params = {}) {
        return this.request('v5/algo/order/history', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.41679 });
    }
    contractPrivateGetApiV6CopyTradingTraderInstruments(params = {}) {
        return this.request('api/v6/copyTrading/trader/instruments', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetApiV6CopyTradingTraderStatistics(params = {}) {
        return this.request('api/v6/copyTrading/trader/statistics', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetApiV6CopyTradingTraderProfitSharingHistory(params = {}) {
        return this.request('api/v6/copyTrading/trader/profit-sharing-history', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetApiV6CopyTradingTraderProfitSharingHistorySummary(params = {}) {
        return this.request('api/v6/copyTrading/trader/profit-sharing-history-summary', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetApiV6CopyTradingTraderUnrealizedProfitSharingSummary(params = {}) {
        return this.request('api/v6/copyTrading/trader/unrealized-profit-sharing-summary', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetApiV6CopyTradingTraderFollowers(params = {}) {
        return this.request('api/v6/copyTrading/trader/followers', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostApiV1ContractBalanceValuation(params = {}) {
        return this.request('api/v1/contract_balance_valuation', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractAccountInfo(params = {}) {
        return this.request('api/v1/contract_account_info', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractPositionInfo(params = {}) {
        return this.request('api/v1/contract_position_info', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractSubAuth(params = {}) {
        return this.request('api/v1/contract_sub_auth', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractSubAccountList(params = {}) {
        return this.request('api/v1/contract_sub_account_list', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractSubAccountInfoList(params = {}) {
        return this.request('api/v1/contract_sub_account_info_list', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractSubAccountInfo(params = {}) {
        return this.request('api/v1/contract_sub_account_info', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractSubPositionInfo(params = {}) {
        return this.request('api/v1/contract_sub_position_info', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractFinancialRecord(params = {}) {
        return this.request('api/v1/contract_financial_record', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractFinancialRecordExact(params = {}) {
        return this.request('api/v1/contract_financial_record_exact', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractUserSettlementRecords(params = {}) {
        return this.request('api/v1/contract_user_settlement_records', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractOrderLimit(params = {}) {
        return this.request('api/v1/contract_order_limit', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractFee(params = {}) {
        return this.request('api/v1/contract_fee', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractTransferLimit(params = {}) {
        return this.request('api/v1/contract_transfer_limit', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractPositionLimit(params = {}) {
        return this.request('api/v1/contract_position_limit', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractAccountPositionInfo(params = {}) {
        return this.request('api/v1/contract_account_position_info', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractMasterSubTransfer(params = {}) {
        return this.request('api/v1/contract_master_sub_transfer', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractMasterSubTransferRecord(params = {}) {
        return this.request('api/v1/contract_master_sub_transfer_record', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractAvailableLevelRate(params = {}) {
        return this.request('api/v1/contract_available_level_rate', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV3ContractFinancialRecord(params = {}) {
        return this.request('api/v3/contract_financial_record', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV3ContractFinancialRecordExact(params = {}) {
        return this.request('api/v3/contract_financial_record_exact', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractCancelAfter(params = {}) {
        return this.request('api/v1/contract-cancel-after', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractOrder(params = {}) {
        return this.request('api/v1/contract_order', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractBatchorder(params = {}) {
        return this.request('api/v1/contract_batchorder', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractCancel(params = {}) {
        return this.request('api/v1/contract_cancel', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractCancelall(params = {}) {
        return this.request('api/v1/contract_cancelall', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractSwitchLeverRate(params = {}) {
        return this.request('api/v1/contract_switch_lever_rate', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    contractPrivatePostApiV1LightningClosePosition(params = {}) {
        return this.request('api/v1/lightning_close_position', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractOrderInfo(params = {}) {
        return this.request('api/v1/contract_order_info', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractOrderDetail(params = {}) {
        return this.request('api/v1/contract_order_detail', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractOpenorders(params = {}) {
        return this.request('api/v1/contract_openorders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractHisorders(params = {}) {
        return this.request('api/v1/contract_hisorders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractHisordersExact(params = {}) {
        return this.request('api/v1/contract_hisorders_exact', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractMatchresults(params = {}) {
        return this.request('api/v1/contract_matchresults', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractMatchresultsExact(params = {}) {
        return this.request('api/v1/contract_matchresults_exact', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV3ContractHisorders(params = {}) {
        return this.request('api/v3/contract_hisorders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV3ContractHisordersExact(params = {}) {
        return this.request('api/v3/contract_hisorders_exact', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV3ContractMatchresults(params = {}) {
        return this.request('api/v3/contract_matchresults', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV3ContractMatchresultsExact(params = {}) {
        return this.request('api/v3/contract_matchresults_exact', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractTriggerOrder(params = {}) {
        return this.request('api/v1/contract_trigger_order', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractTriggerCancel(params = {}) {
        return this.request('api/v1/contract_trigger_cancel', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractTriggerCancelall(params = {}) {
        return this.request('api/v1/contract_trigger_cancelall', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractTriggerOpenorders(params = {}) {
        return this.request('api/v1/contract_trigger_openorders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractTriggerHisorders(params = {}) {
        return this.request('api/v1/contract_trigger_hisorders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractTpslOrder(params = {}) {
        return this.request('api/v1/contract_tpsl_order', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractTpslCancel(params = {}) {
        return this.request('api/v1/contract_tpsl_cancel', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractTpslCancelall(params = {}) {
        return this.request('api/v1/contract_tpsl_cancelall', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractTpslOpenorders(params = {}) {
        return this.request('api/v1/contract_tpsl_openorders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractTpslHisorders(params = {}) {
        return this.request('api/v1/contract_tpsl_hisorders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractRelationTpslOrder(params = {}) {
        return this.request('api/v1/contract_relation_tpsl_order', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractTrackOrder(params = {}) {
        return this.request('api/v1/contract_track_order', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractTrackCancel(params = {}) {
        return this.request('api/v1/contract_track_cancel', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractTrackCancelall(params = {}) {
        return this.request('api/v1/contract_track_cancelall', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractTrackOpenorders(params = {}) {
        return this.request('api/v1/contract_track_openorders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostApiV1ContractTrackHisorders(params = {}) {
        return this.request('api/v1/contract_track_hisorders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapBalanceValuation(params = {}) {
        return this.request('swap-api/v1/swap_balance_valuation', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapAccountInfo(params = {}) {
        return this.request('swap-api/v1/swap_account_info', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapPositionInfo(params = {}) {
        return this.request('swap-api/v1/swap_position_info', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapAccountPositionInfo(params = {}) {
        return this.request('swap-api/v1/swap_account_position_info', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapSubAuth(params = {}) {
        return this.request('swap-api/v1/swap_sub_auth', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapSubAccountList(params = {}) {
        return this.request('swap-api/v1/swap_sub_account_list', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapSubAccountInfoList(params = {}) {
        return this.request('swap-api/v1/swap_sub_account_info_list', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapSubAccountInfo(params = {}) {
        return this.request('swap-api/v1/swap_sub_account_info', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapSubPositionInfo(params = {}) {
        return this.request('swap-api/v1/swap_sub_position_info', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapFinancialRecord(params = {}) {
        return this.request('swap-api/v1/swap_financial_record', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapFinancialRecordExact(params = {}) {
        return this.request('swap-api/v1/swap_financial_record_exact', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapUserSettlementRecords(params = {}) {
        return this.request('swap-api/v1/swap_user_settlement_records', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapAvailableLevelRate(params = {}) {
        return this.request('swap-api/v1/swap_available_level_rate', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapOrderLimit(params = {}) {
        return this.request('swap-api/v1/swap_order_limit', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapFee(params = {}) {
        return this.request('swap-api/v1/swap_fee', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapTransferLimit(params = {}) {
        return this.request('swap-api/v1/swap_transfer_limit', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapPositionLimit(params = {}) {
        return this.request('swap-api/v1/swap_position_limit', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapMasterSubTransfer(params = {}) {
        return this.request('swap-api/v1/swap_master_sub_transfer', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapMasterSubTransferRecord(params = {}) {
        return this.request('swap-api/v1/swap_master_sub_transfer_record', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV3SwapFinancialRecord(params = {}) {
        return this.request('swap-api/v3/swap_financial_record', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV3SwapFinancialRecordExact(params = {}) {
        return this.request('swap-api/v3/swap_financial_record_exact', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapCancelAfter(params = {}) {
        return this.request('swap-api/v1/swap-cancel-after', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapOrder(params = {}) {
        return this.request('swap-api/v1/swap_order', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapBatchorder(params = {}) {
        return this.request('swap-api/v1/swap_batchorder', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapCancel(params = {}) {
        return this.request('swap-api/v1/swap_cancel', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapCancelall(params = {}) {
        return this.request('swap-api/v1/swap_cancelall', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapLightningClosePosition(params = {}) {
        return this.request('swap-api/v1/swap_lightning_close_position', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapSwitchLeverRate(params = {}) {
        return this.request('swap-api/v1/swap_switch_lever_rate', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    contractPrivatePostSwapApiV1SwapOrderInfo(params = {}) {
        return this.request('swap-api/v1/swap_order_info', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapOrderDetail(params = {}) {
        return this.request('swap-api/v1/swap_order_detail', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapOpenorders(params = {}) {
        return this.request('swap-api/v1/swap_openorders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapHisorders(params = {}) {
        return this.request('swap-api/v1/swap_hisorders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapHisordersExact(params = {}) {
        return this.request('swap-api/v1/swap_hisorders_exact', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapMatchresults(params = {}) {
        return this.request('swap-api/v1/swap_matchresults', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapMatchresultsExact(params = {}) {
        return this.request('swap-api/v1/swap_matchresults_exact', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV3SwapMatchresults(params = {}) {
        return this.request('swap-api/v3/swap_matchresults', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV3SwapMatchresultsExact(params = {}) {
        return this.request('swap-api/v3/swap_matchresults_exact', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV3SwapHisorders(params = {}) {
        return this.request('swap-api/v3/swap_hisorders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV3SwapHisordersExact(params = {}) {
        return this.request('swap-api/v3/swap_hisorders_exact', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapTriggerOrder(params = {}) {
        return this.request('swap-api/v1/swap_trigger_order', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapTriggerCancel(params = {}) {
        return this.request('swap-api/v1/swap_trigger_cancel', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapTriggerCancelall(params = {}) {
        return this.request('swap-api/v1/swap_trigger_cancelall', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapTriggerOpenorders(params = {}) {
        return this.request('swap-api/v1/swap_trigger_openorders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapTriggerHisorders(params = {}) {
        return this.request('swap-api/v1/swap_trigger_hisorders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapTpslOrder(params = {}) {
        return this.request('swap-api/v1/swap_tpsl_order', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapTpslCancel(params = {}) {
        return this.request('swap-api/v1/swap_tpsl_cancel', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapTpslCancelall(params = {}) {
        return this.request('swap-api/v1/swap_tpsl_cancelall', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapTpslOpenorders(params = {}) {
        return this.request('swap-api/v1/swap_tpsl_openorders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapTpslHisorders(params = {}) {
        return this.request('swap-api/v1/swap_tpsl_hisorders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapRelationTpslOrder(params = {}) {
        return this.request('swap-api/v1/swap_relation_tpsl_order', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapTrackOrder(params = {}) {
        return this.request('swap-api/v1/swap_track_order', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapTrackCancel(params = {}) {
        return this.request('swap-api/v1/swap_track_cancel', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapTrackCancelall(params = {}) {
        return this.request('swap-api/v1/swap_track_cancelall', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapTrackOpenorders(params = {}) {
        return this.request('swap-api/v1/swap_track_openorders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostSwapApiV1SwapTrackHisorders(params = {}) {
        return this.request('swap-api/v1/swap_track_hisorders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    contractPrivatePostV5AccountAssetMode(params = {}) {
        return this.request('v5/account/asset_mode', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 100 });
    }
    contractPrivatePostV5TradeOrder(params = {}) {
        return this.request('v5/trade/order', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.41679 });
    }
    contractPrivatePostV5TradeBatchOrders(params = {}) {
        return this.request('v5/trade/batch_orders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.41679 });
    }
    contractPrivatePostV5TradeCancelOrder(params = {}) {
        return this.request('v5/trade/cancel_order', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.41679 });
    }
    contractPrivatePostV5TradeCancelBatchOrders(params = {}) {
        return this.request('v5/trade/cancel_batch_orders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.41679 });
    }
    contractPrivatePostV5TradeCancelAllOrders(params = {}) {
        return this.request('v5/trade/cancel_all_orders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.41679 });
    }
    contractPrivatePostV5TradeCancelAfter(params = {}) {
        return this.request('v5/trade/cancel-after', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.41679 });
    }
    contractPrivatePostV5TradePosition(params = {}) {
        return this.request('v5/trade/position', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.41679 });
    }
    contractPrivatePostV5TradePositionAll(params = {}) {
        return this.request('v5/trade/position_all', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.41679 });
    }
    contractPrivatePostV5PositionLever(params = {}) {
        return this.request('v5/position/lever', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.20834 });
    }
    contractPrivatePostV5PositionMode(params = {}) {
        return this.request('v5/position/mode', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.20834 });
    }
    contractPrivatePostV5PositionMargin(params = {}) {
        return this.request('v5/position/margin', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.20834 });
    }
    contractPrivatePostV5AccountFeeDeductionCurrency(params = {}) {
        return this.request('v5/account/fee_deduction_currency', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.20834 });
    }
    contractPrivatePostV5AlgoOrder(params = {}) {
        return this.request('v5/algo/order', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.41679 });
    }
    contractPrivatePostV5AlgoCancelOrders(params = {}) {
        return this.request('v5/algo/cancel_orders', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 0.41679 });
    }
    contractPrivatePostApiV6CopyTradingTraderFollower(params = {}) {
        return this.request('api/v6/copyTrading/trader/follower', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostApiV6CopyTradingTraderTransfer(params = {}) {
        return this.request('api/v6/copyTrading/trader/transfer', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostApiV6CopyTradingTraderFollowerSettings(params = {}) {
        return this.request('api/v6/copyTrading/trader/follower-settings', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostApiV6CopyTradingTraderConfig(params = {}) {
        return this.request('api/v6/copyTrading/trader/config', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostApiV6CopyTradingTraderApikey(params = {}) {
        return this.request('api/v6/copyTrading/trader/apikey', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
}

exports["default"] = Exchange;
