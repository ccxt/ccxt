'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetCurrencies(params = {}) {
        return this.request('currencies', ['public'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    publicGetCurrenciesCurrency(params = {}) {
        return this.request('currencies/{currency}', ['public'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    publicGetSymbols(params = {}) {
        return this.request('symbols', ['public'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    publicGetMarketOrderbookLevel1(params = {}) {
        return this.request('market/orderbook/level1', ['public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    publicGetMarketAllTickers(params = {}) {
        return this.request('market/allTickers', ['public'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    publicGetMarketStats(params = {}) {
        return this.request('market/stats', ['public'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    publicGetMarkets(params = {}) {
        return this.request('markets', ['public'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    publicGetMarketOrderbookLevelLevelLimit(params = {}) {
        return this.request('market/orderbook/level{level}_{limit}', ['public'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    publicGetMarketOrderbookLevel220(params = {}) {
        return this.request('market/orderbook/level2_20', ['public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    publicGetMarketOrderbookLevel2100(params = {}) {
        return this.request('market/orderbook/level2_100', ['public'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    publicGetMarketHistories(params = {}) {
        return this.request('market/histories', ['public'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    publicGetMarketCandles(params = {}) {
        return this.request('market/candles', ['public'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    publicGetPrices(params = {}) {
        return this.request('prices', ['public'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    publicGetTimestamp(params = {}) {
        return this.request('timestamp', ['public'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    publicGetStatus(params = {}) {
        return this.request('status', ['public'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    publicGetMarkPriceSymbolCurrent(params = {}) {
        return this.request('mark-price/{symbol}/current', ['public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    publicGetMarkPriceAllSymbols(params = {}) {
        return this.request('mark-price/all-symbols', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetMarginConfig(params = {}) {
        return this.request('margin/config', ['public'], 'GET', params, undefined, undefined, { 'cost': 25 });
    }
    publicGetAnnouncements(params = {}) {
        return this.request('announcements', ['public'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    publicGetMarginCollateralRatio(params = {}) {
        return this.request('margin/collateralRatio', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetMarginAvailableInventory(params = {}) {
        return this.request('margin/available-inventory', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetConvertSymbol(params = {}) {
        return this.request('convert/symbol', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetConvertCurrencies(params = {}) {
        return this.request('convert/currencies', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicPostBulletPublic(params = {}) {
        return this.request('bullet-public', ['public'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetUserInfo(params = {}) {
        return this.request('user-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    privateGetUserApiKey(params = {}) {
        return this.request('user/api-key', ['private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    privateGetAccounts(params = {}) {
        return this.request('accounts', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetAccountsAccountId(params = {}) {
        return this.request('accounts/{accountId}', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetAccountsLedgers(params = {}) {
        return this.request('accounts/ledgers', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetHfAccountsLedgers(params = {}) {
        return this.request('hf/accounts/ledgers', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetHfMarginAccountLedgers(params = {}) {
        return this.request('hf/margin/account/ledgers', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetTransactionHistory(params = {}) {
        return this.request('transaction-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetSubUser(params = {}) {
        return this.request('sub/user', ['private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    privateGetSubAccountsSubUserId(params = {}) {
        return this.request('sub-accounts/{subUserId}', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetSubAccounts(params = {}) {
        return this.request('sub-accounts', ['private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    privateGetSubApiKey(params = {}) {
        return this.request('sub/api-key', ['private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    privateGetMarginAccount(params = {}) {
        return this.request('margin/account', ['private'], 'GET', params, undefined, undefined, { 'cost': 40 });
    }
    privateGetMarginAccounts(params = {}) {
        return this.request('margin/accounts', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetIsolatedAccounts(params = {}) {
        return this.request('isolated/accounts', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetDepositAddresses(params = {}) {
        return this.request('deposit-addresses', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetDeposits(params = {}) {
        return this.request('deposits', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetHistDeposits(params = {}) {
        return this.request('hist-deposits', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetWithdrawals(params = {}) {
        return this.request('withdrawals', ['private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    privateGetHistWithdrawals(params = {}) {
        return this.request('hist-withdrawals', ['private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    privateGetWithdrawalsQuotas(params = {}) {
        return this.request('withdrawals/quotas', ['private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    privateGetAccountsTransferable(params = {}) {
        return this.request('accounts/transferable', ['private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    privateGetTransferList(params = {}) {
        return this.request('transfer-list', ['private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    privateGetBaseFee(params = {}) {
        return this.request('base-fee', ['private'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    privateGetTradeFees(params = {}) {
        return this.request('trade-fees', ['private'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    privateGetMarketOrderbookLevelLevel(params = {}) {
        return this.request('market/orderbook/level{level}', ['private'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    privateGetMarketOrderbookLevel2(params = {}) {
        return this.request('market/orderbook/level2', ['private'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    privateGetMarketOrderbookLevel3(params = {}) {
        return this.request('market/orderbook/level3', ['private'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    privateGetHfAccountsOpened(params = {}) {
        return this.request('hf/accounts/opened', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetHfOrdersActive(params = {}) {
        return this.request('hf/orders/active', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetHfOrdersActiveSymbols(params = {}) {
        return this.request('hf/orders/active/symbols', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetHfMarginOrderActiveSymbols(params = {}) {
        return this.request('hf/margin/order/active/symbols', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetHfOrdersDone(params = {}) {
        return this.request('hf/orders/done', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetHfOrdersOrderId(params = {}) {
        return this.request('hf/orders/{orderId}', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetHfOrdersClientOrderClientOid(params = {}) {
        return this.request('hf/orders/client-order/{clientOid}', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetHfOrdersDeadCancelAllQuery(params = {}) {
        return this.request('hf/orders/dead-cancel-all/query', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetHfFills(params = {}) {
        return this.request('hf/fills', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetOrders(params = {}) {
        return this.request('orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetLimitOrders(params = {}) {
        return this.request('limit/orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    privateGetOrdersOrderId(params = {}) {
        return this.request('orders/{orderId}', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetOrderClientOrderClientOid(params = {}) {
        return this.request('order/client-order/{clientOid}', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetFills(params = {}) {
        return this.request('fills', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetLimitFills(params = {}) {
        return this.request('limit/fills', ['private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    privateGetStopOrder(params = {}) {
        return this.request('stop-order', ['private'], 'GET', params, undefined, undefined, { 'cost': 8 });
    }
    privateGetStopOrderOrderId(params = {}) {
        return this.request('stop-order/{orderId}', ['private'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    privateGetStopOrderQueryOrderByClientOid(params = {}) {
        return this.request('stop-order/queryOrderByClientOid', ['private'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    privateGetOcoOrderOrderId(params = {}) {
        return this.request('oco/order/{orderId}', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetOcoOrderDetailsOrderId(params = {}) {
        return this.request('oco/order/details/{orderId}', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetOcoClientOrderClientOid(params = {}) {
        return this.request('oco/client-order/{clientOid}', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetOcoOrders(params = {}) {
        return this.request('oco/orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetHfMarginOrdersActive(params = {}) {
        return this.request('hf/margin/orders/active', ['private'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    privateGetHfMarginOrdersDone(params = {}) {
        return this.request('hf/margin/orders/done', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetHfMarginOrdersOrderId(params = {}) {
        return this.request('hf/margin/orders/{orderId}', ['private'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    privateGetHfMarginOrdersClientOrderClientOid(params = {}) {
        return this.request('hf/margin/orders/client-order/{clientOid}', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetHfMarginFills(params = {}) {
        return this.request('hf/margin/fills', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetHfMarginStopOrders(params = {}) {
        return this.request('hf/margin/stop-orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 8 });
    }
    privateGetHfMarginStopOrderOrderId(params = {}) {
        return this.request('hf/margin/stop-order/orderId', ['private'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    privateGetHfMarginStopOrderClientOid(params = {}) {
        return this.request('hf/margin/stop-order/clientOid', ['private'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    privateGetHfMarginOcoOrderOrderId(params = {}) {
        return this.request('hf/margin/oco-order/orderId', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetHfMarginOcoOrderClientOid(params = {}) {
        return this.request('hf/margin/oco-order/clientOid', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetHfMarginOcoOrderDetailOrderId(params = {}) {
        return this.request('hf/margin/oco-order/detail/orderId', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetHfMarginOcoOrders(params = {}) {
        return this.request('hf/margin/oco-orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    privateGetEtfInfo(params = {}) {
        return this.request('etf/info', ['private'], 'GET', params, undefined, undefined, { 'cost': 25 });
    }
    privateGetMarginCurrencies(params = {}) {
        return this.request('margin/currencies', ['private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    privateGetRiskLimitStrategy(params = {}) {
        return this.request('risk/limit/strategy', ['private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    privateGetIsolatedSymbols(params = {}) {
        return this.request('isolated/symbols', ['private'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    privateGetMarginSymbols(params = {}) {
        return this.request('margin/symbols', ['private'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    privateGetIsolatedAccountSymbol(params = {}) {
        return this.request('isolated/account/{symbol}', ['private'], 'GET', params, undefined, undefined, { 'cost': 50 });
    }
    privateGetMarginBorrow(params = {}) {
        return this.request('margin/borrow', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetMarginRepay(params = {}) {
        return this.request('margin/repay', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetMarginInterest(params = {}) {
        return this.request('margin/interest', ['private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    privateGetMarginBorrowRate(params = {}) {
        return this.request('margin/borrowRate', ['private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    privateGetProjectList(params = {}) {
        return this.request('project/list', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetProjectMarketInterestRate(params = {}) {
        return this.request('project/marketInterestRate', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetRedeemOrders(params = {}) {
        return this.request('redeem/orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetPurchaseOrders(params = {}) {
        return this.request('purchase/orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetBrokerApiRebaseDownload(params = {}) {
        return this.request('broker/api/rebase/download', ['private'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    privateGetBrokerQueryMyCommission(params = {}) {
        return this.request('broker/queryMyCommission', ['private'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    privateGetBrokerQueryUser(params = {}) {
        return this.request('broker/queryUser', ['private'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    privateGetBrokerQueryDetailByUid(params = {}) {
        return this.request('broker/queryDetailByUid', ['private'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    privateGetMigrateUserAccountStatus(params = {}) {
        return this.request('migrate/user/account/status', ['private'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    privateGetConvertQuote(params = {}) {
        return this.request('convert/quote', ['private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    privateGetConvertOrderDetail(params = {}) {
        return this.request('convert/order/detail', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetConvertOrderHistory(params = {}) {
        return this.request('convert/order/history', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetConvertLimitQuote(params = {}) {
        return this.request('convert/limit/quote', ['private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    privateGetConvertLimitOrderDetail(params = {}) {
        return this.request('convert/limit/order/detail', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetConvertLimitOrders(params = {}) {
        return this.request('convert/limit/orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetAffiliateInviterStatistics(params = {}) {
        return this.request('affiliate/inviter/statistics', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetAffiliateQueryInvitees(params = {}) {
        return this.request('affiliate/queryInvitees', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetAffiliateQueryMyCommission(params = {}) {
        return this.request('affiliate/queryMyCommission', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetAffiliateQueryTransactionByUid(params = {}) {
        return this.request('affiliate/queryTransactionByUid', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetAffiliateQueryTransactionByTime(params = {}) {
        return this.request('affiliate/queryTransactionByTime', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetAffiliateQueryKumining(params = {}) {
        return this.request('affiliate/queryKumining', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostSubUserCreated(params = {}) {
        return this.request('sub/user/created', ['private'], 'POST', params, undefined, undefined, { 'cost': 15 });
    }
    privatePostSubApiKey(params = {}) {
        return this.request('sub/api-key', ['private'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    privatePostSubApiKeyUpdate(params = {}) {
        return this.request('sub/api-key/update', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostDepositAddresses(params = {}) {
        return this.request('deposit-addresses', ['private'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    privatePostWithdrawals(params = {}) {
        return this.request('withdrawals', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostAccountsUniversalTransfer(params = {}) {
        return this.request('accounts/universal-transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    privatePostAccountsSubTransfer(params = {}) {
        return this.request('accounts/sub-transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostAccountsInnerTransfer(params = {}) {
        return this.request('accounts/inner-transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 15 });
    }
    privatePostTransferOut(params = {}) {
        return this.request('transfer-out', ['private'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    privatePostTransferIn(params = {}) {
        return this.request('transfer-in', ['private'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    privatePostHfOrders(params = {}) {
        return this.request('hf/orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostHfOrdersTest(params = {}) {
        return this.request('hf/orders/test', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostHfOrdersSync(params = {}) {
        return this.request('hf/orders/sync', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostHfOrdersMulti(params = {}) {
        return this.request('hf/orders/multi', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostHfOrdersMultiSync(params = {}) {
        return this.request('hf/orders/multi/sync', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostHfOrdersAlter(params = {}) {
        return this.request('hf/orders/alter', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostHfOrdersDeadCancelAll(params = {}) {
        return this.request('hf/orders/dead-cancel-all', ['private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    privatePostOrders(params = {}) {
        return this.request('orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    privatePostOrdersTest(params = {}) {
        return this.request('orders/test', ['private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    privatePostOrdersMulti(params = {}) {
        return this.request('orders/multi', ['private'], 'POST', params, undefined, undefined, { 'cost': 3 });
    }
    privatePostStopOrder(params = {}) {
        return this.request('stop-order', ['private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    privatePostOcoOrder(params = {}) {
        return this.request('oco/order', ['private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    privatePostHfMarginOrder(params = {}) {
        return this.request('hf/margin/order', ['private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    privatePostHfMarginOrderTest(params = {}) {
        return this.request('hf/margin/order/test', ['private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    privatePostHfMarginStopOrder(params = {}) {
        return this.request('hf/margin/stop-order', ['private'], 'POST', params, undefined, undefined, { 'cost': 3 });
    }
    privatePostMarginOrder(params = {}) {
        return this.request('margin/order', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostMarginOrderTest(params = {}) {
        return this.request('margin/order/test', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostHfMarginOcoOrder(params = {}) {
        return this.request('hf/margin/oco-order', ['private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    privatePostMarginBorrow(params = {}) {
        return this.request('margin/borrow', ['private'], 'POST', params, undefined, undefined, { 'cost': 15 });
    }
    privatePostMarginRepay(params = {}) {
        return this.request('margin/repay', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostPurchase(params = {}) {
        return this.request('purchase', ['private'], 'POST', params, undefined, undefined, { 'cost': 15 });
    }
    privatePostRedeem(params = {}) {
        return this.request('redeem', ['private'], 'POST', params, undefined, undefined, { 'cost': 15 });
    }
    privatePostLendPurchaseUpdate(params = {}) {
        return this.request('lend/purchase/update', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostConvertOrder(params = {}) {
        return this.request('convert/order', ['private'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    privatePostConvertLimitOrder(params = {}) {
        return this.request('convert/limit/order', ['private'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    privatePostBulletPrivate(params = {}) {
        return this.request('bullet-private', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostPositionUpdateUserLeverage(params = {}) {
        return this.request('position/update-user-leverage', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostDepositAddressCreate(params = {}) {
        return this.request('deposit-address/create', ['private'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    privateDeleteSubApiKey(params = {}) {
        return this.request('sub/api-key', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 30 });
    }
    privateDeleteWithdrawalsWithdrawalId(params = {}) {
        return this.request('withdrawals/{withdrawalId}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 20 });
    }
    privateDeleteHfOrdersOrderId(params = {}) {
        return this.request('hf/orders/{orderId}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteHfOrdersSyncOrderId(params = {}) {
        return this.request('hf/orders/sync/{orderId}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteHfOrdersClientOrderClientOid(params = {}) {
        return this.request('hf/orders/client-order/{clientOid}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteHfOrdersSyncClientOrderClientOid(params = {}) {
        return this.request('hf/orders/sync/client-order/{clientOid}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteHfOrdersCancelOrderId(params = {}) {
        return this.request('hf/orders/cancel/{orderId}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteHfOrders(params = {}) {
        return this.request('hf/orders', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 2 });
    }
    privateDeleteHfOrdersCancelAll(params = {}) {
        return this.request('hf/orders/cancelAll', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 30 });
    }
    privateDeleteOrdersOrderId(params = {}) {
        return this.request('orders/{orderId}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 3 });
    }
    privateDeleteOrderClientOrderClientOid(params = {}) {
        return this.request('order/client-order/{clientOid}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 5 });
    }
    privateDeleteOrders(params = {}) {
        return this.request('orders', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 20 });
    }
    privateDeleteStopOrderOrderId(params = {}) {
        return this.request('stop-order/{orderId}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 3 });
    }
    privateDeleteStopOrderCancelOrderByClientOid(params = {}) {
        return this.request('stop-order/cancelOrderByClientOid', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 5 });
    }
    privateDeleteStopOrderCancel(params = {}) {
        return this.request('stop-order/cancel', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 3 });
    }
    privateDeleteOcoOrderOrderId(params = {}) {
        return this.request('oco/order/{orderId}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 3 });
    }
    privateDeleteOcoClientOrderClientOid(params = {}) {
        return this.request('oco/client-order/{clientOid}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 3 });
    }
    privateDeleteOcoOrders(params = {}) {
        return this.request('oco/orders', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 3 });
    }
    privateDeleteHfMarginOrdersOrderId(params = {}) {
        return this.request('hf/margin/orders/{orderId}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 2 });
    }
    privateDeleteHfMarginOrdersClientOrderClientOid(params = {}) {
        return this.request('hf/margin/orders/client-order/{clientOid}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 2 });
    }
    privateDeleteHfMarginOrders(params = {}) {
        return this.request('hf/margin/orders', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 5 });
    }
    privateDeleteHfMarginStopOrderCancelById(params = {}) {
        return this.request('hf/margin/stop-order/cancel-by-id', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 3 });
    }
    privateDeleteHfMarginStopOrderCancelByClientOid(params = {}) {
        return this.request('hf/margin/stop-order/cancel-by-clientOid', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 5 });
    }
    privateDeleteHfMarginStopOrderCancel(params = {}) {
        return this.request('hf/margin/stop-order/cancel', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 3 });
    }
    privateDeleteHfMarginOcoOrderCancelById(params = {}) {
        return this.request('hf/margin/oco-order/cancel-by-id', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 3 });
    }
    privateDeleteHfMarginOcoOrderCancelByClientOid(params = {}) {
        return this.request('hf/margin/oco-order/cancel-by-clientOid', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 3 });
    }
    privateDeleteHfMarginOcoOrderCancel(params = {}) {
        return this.request('hf/margin/oco-order/cancel', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 3 });
    }
    privateDeleteConvertLimitOrderCancel(params = {}) {
        return this.request('convert/limit/order/cancel', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 5 });
    }
    futuresPublicGetContractsActive(params = {}) {
        return this.request('contracts/active', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    futuresPublicGetContractsSymbol(params = {}) {
        return this.request('contracts/{symbol}', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    futuresPublicGetTicker(params = {}) {
        return this.request('ticker', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPublicGetAllTickers(params = {}) {
        return this.request('allTickers', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    futuresPublicGetLevel2Snapshot(params = {}) {
        return this.request('level2/snapshot', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    futuresPublicGetLevel2Depth20(params = {}) {
        return this.request('level2/depth20', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    futuresPublicGetLevel2Depth100(params = {}) {
        return this.request('level2/depth100', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    futuresPublicGetTradeHistory(params = {}) {
        return this.request('trade/history', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    futuresPublicGetKlineQuery(params = {}) {
        return this.request('kline/query', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    futuresPublicGetInterestQuery(params = {}) {
        return this.request('interest/query', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    futuresPublicGetIndexQuery(params = {}) {
        return this.request('index/query', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPublicGetMarkPriceSymbolCurrent(params = {}) {
        return this.request('mark-price/{symbol}/current', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    futuresPublicGetPremiumQuery(params = {}) {
        return this.request('premium/query', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    futuresPublicGetTradeStatistics(params = {}) {
        return this.request('trade-statistics', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    futuresPublicGetFundingRateSymbolCurrent(params = {}) {
        return this.request('funding-rate/{symbol}/current', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPublicGetContractFundingRates(params = {}) {
        return this.request('contract/funding-rates', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    futuresPublicGetTimestamp(params = {}) {
        return this.request('timestamp', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPublicGetStatus(params = {}) {
        return this.request('status', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 8 });
    }
    futuresPublicGetLevel2MessageQuery(params = {}) {
        return this.request('level2/message/query', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 1.3953 });
    }
    futuresPublicGetContractsRiskLimitSymbol(params = {}) {
        return this.request('contracts/risk-limit/{symbol}', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    futuresPublicGetLevel3MessageQuery(params = {}) {
        return this.request('level3/message/query', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    futuresPublicGetLevel3Snapshot(params = {}) {
        return this.request('level3/snapshot', ['futuresPublic'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    futuresPublicPostBulletPublic(params = {}) {
        return this.request('bullet-public', ['futuresPublic'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    futuresPrivateGetTransactionHistory(params = {}) {
        return this.request('transaction-history', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivateGetAccountOverview(params = {}) {
        return this.request('account-overview', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    futuresPrivateGetAccountOverviewAll(params = {}) {
        return this.request('account-overview-all', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 12 });
    }
    futuresPrivateGetTransferList(params = {}) {
        return this.request('transfer-list', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    futuresPrivateGetOrders(params = {}) {
        return this.request('orders', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivateGetStopOrders(params = {}) {
        return this.request('stopOrders', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 12 });
    }
    futuresPrivateGetRecentDoneOrders(params = {}) {
        return this.request('recentDoneOrders', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    futuresPrivateGetOrdersOrderId(params = {}) {
        return this.request('orders/{orderId}', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    futuresPrivateGetOrdersByClientOid(params = {}) {
        return this.request('orders/byClientOid', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    futuresPrivateGetFills(params = {}) {
        return this.request('fills', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    futuresPrivateGetRecentFills(params = {}) {
        return this.request('recentFills', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    futuresPrivateGetTradeFees(params = {}) {
        return this.request('trade-fees', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    futuresPrivateGetOpenOrderStatistics(params = {}) {
        return this.request('openOrderStatistics', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    futuresPrivateGetPosition(params = {}) {
        return this.request('position', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivateGetPositions(params = {}) {
        return this.request('positions', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivateGetMarginMaxWithdrawMargin(params = {}) {
        return this.request('margin/maxWithdrawMargin', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    futuresPrivateGetContractsRiskLimitSymbol(params = {}) {
        return this.request('contracts/risk-limit/{symbol}', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    futuresPrivateGetFundingHistory(params = {}) {
        return this.request('funding-history', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    futuresPrivateGetCopyTradeFuturesGetMaxOpenSize(params = {}) {
        return this.request('copy-trade/futures/get-max-open-size', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 8 });
    }
    futuresPrivateGetCopyTradeFuturesPositionMarginMaxWithdrawMargin(params = {}) {
        return this.request('copy-trade/futures/position/margin/max-withdraw-margin', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    futuresPrivateGetHistoryPositions(params = {}) {
        return this.request('history-positions', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivateGetPositionGetMarginMode(params = {}) {
        return this.request('position/getMarginMode', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivateGetPositionGetPositionMode(params = {}) {
        return this.request('position/getPositionMode', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivateGetDepositAddress(params = {}) {
        return this.request('deposit-address', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivateGetDepositList(params = {}) {
        return this.request('deposit-list', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivateGetWithdrawalsQuotas(params = {}) {
        return this.request('withdrawals/quotas', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivateGetWithdrawalList(params = {}) {
        return this.request('withdrawal-list', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivateGetSubApiKey(params = {}) {
        return this.request('sub/api-key', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivateGetTradeStatistics(params = {}) {
        return this.request('trade-statistics', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivateGetGetMaxOpenSize(params = {}) {
        return this.request('getMaxOpenSize', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivateGetGetCrossUserLeverage(params = {}) {
        return this.request('getCrossUserLeverage', ['futuresPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivatePostTransferOut(params = {}) {
        return this.request('transfer-out', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    futuresPrivatePostTransferIn(params = {}) {
        return this.request('transfer-in', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    futuresPrivatePostOrders(params = {}) {
        return this.request('orders', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivatePostStOrders(params = {}) {
        return this.request('st-orders', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivatePostOrdersTest(params = {}) {
        return this.request('orders/test', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivatePostOrdersMulti(params = {}) {
        return this.request('orders/multi', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 6 });
    }
    futuresPrivatePostPositionMarginAutoDepositStatus(params = {}) {
        return this.request('position/margin/auto-deposit-status', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 8 });
    }
    futuresPrivatePostMarginWithdrawMargin(params = {}) {
        return this.request('margin/withdrawMargin', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    futuresPrivatePostPositionMarginDepositMargin(params = {}) {
        return this.request('position/margin/deposit-margin', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 8 });
    }
    futuresPrivatePostPositionRiskLimitLevelChange(params = {}) {
        return this.request('position/risk-limit-level/change', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 8 });
    }
    futuresPrivatePostCopyTradeFuturesOrders(params = {}) {
        return this.request('copy-trade/futures/orders', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivatePostCopyTradeFuturesOrdersTest(params = {}) {
        return this.request('copy-trade/futures/orders/test', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivatePostCopyTradeFuturesStOrders(params = {}) {
        return this.request('copy-trade/futures/st-orders', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivatePostCopyTradeFuturesPositionMarginDepositMargin(params = {}) {
        return this.request('copy-trade/futures/position/margin/deposit-margin', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 8 });
    }
    futuresPrivatePostCopyTradeFuturesPositionMarginWithdrawMargin(params = {}) {
        return this.request('copy-trade/futures/position/margin/withdraw-margin', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    futuresPrivatePostCopyTradeFuturesPositionRiskLimitLevelChange(params = {}) {
        return this.request('copy-trade/futures/position/risk-limit-level/change', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivatePostCopyTradeFuturesPositionMarginAutoDepositStatus(params = {}) {
        return this.request('copy-trade/futures/position/margin/auto-deposit-status', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 8 });
    }
    futuresPrivatePostCopyTradeFuturesPositionChangeMarginMode(params = {}) {
        return this.request('copy-trade/futures/position/changeMarginMode', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivatePostCopyTradeFuturesPositionChangeCrossUserLeverage(params = {}) {
        return this.request('copy-trade/futures/position/changeCrossUserLeverage', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivatePostCopyTradeGetCrossModeMarginRequirement(params = {}) {
        return this.request('copy-trade/getCrossModeMarginRequirement', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 6 });
    }
    futuresPrivatePostCopyTradePositionSwitchPositionMode(params = {}) {
        return this.request('copy-trade/position/switchPositionMode', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivatePostChangeCrossUserLeverage(params = {}) {
        return this.request('changeCrossUserLeverage', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivatePostWithdrawals(params = {}) {
        return this.request('withdrawals', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivatePostSubApiKey(params = {}) {
        return this.request('sub/api-key', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivatePostSubApiKeyUpdate(params = {}) {
        return this.request('sub/api-key/update', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivatePostPositionChangeMarginMode(params = {}) {
        return this.request('position/changeMarginMode', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivatePostPositionSwitchPositionMode(params = {}) {
        return this.request('position/switchPositionMode', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    futuresPrivatePostBulletPrivate(params = {}) {
        return this.request('bullet-private', ['futuresPrivate'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    futuresPrivateDeleteOrdersOrderId(params = {}) {
        return this.request('orders/{orderId}', ['futuresPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 2 });
    }
    futuresPrivateDeleteOrdersClientOrderClientOid(params = {}) {
        return this.request('orders/client-order/{clientOid}', ['futuresPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 2 });
    }
    futuresPrivateDeleteOrders(params = {}) {
        return this.request('orders', ['futuresPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 20 });
    }
    futuresPrivateDeleteStopOrders(params = {}) {
        return this.request('stopOrders', ['futuresPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 30 });
    }
    futuresPrivateDeleteCopyTradeFuturesOrders(params = {}) {
        return this.request('copy-trade/futures/orders', ['futuresPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1.5 });
    }
    futuresPrivateDeleteCopyTradeFuturesOrdersClientOrder(params = {}) {
        return this.request('copy-trade/futures/orders/client-order', ['futuresPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1.5 });
    }
    futuresPrivateDeleteOrdersMultiCancel(params = {}) {
        return this.request('orders/multi-cancel', ['futuresPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 40 });
    }
    futuresPrivateDeleteWithdrawalsWithdrawalId(params = {}) {
        return this.request('withdrawals/{withdrawalId}', ['futuresPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 10 });
    }
    futuresPrivateDeleteCancelTransferOut(params = {}) {
        return this.request('cancel/transfer-out', ['futuresPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 10 });
    }
    futuresPrivateDeleteSubApiKey(params = {}) {
        return this.request('sub/api-key', ['futuresPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 10 });
    }
    webExchangeGetCurrencyCurrencyChainInfo(params = {}) {
        return this.request('currency/currency/chain-info', ['webExchange'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    webExchangeGetContractSymbolFundingRates(params = {}) {
        return this.request('contract/{symbol}/funding-rates', ['webExchange'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    brokerGetBrokerNdInfo(params = {}) {
        return this.request('broker/nd/info', ['broker'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    brokerGetBrokerNdAccount(params = {}) {
        return this.request('broker/nd/account', ['broker'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    brokerGetBrokerNdAccountApikey(params = {}) {
        return this.request('broker/nd/account/apikey', ['broker'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    brokerGetBrokerNdRebaseDownload(params = {}) {
        return this.request('broker/nd/rebase/download', ['broker'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    brokerGetBrokerNdMarkUp(params = {}) {
        return this.request('broker/nd/mark-up', ['broker'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    brokerGetAssetNdbrokerDepositList(params = {}) {
        return this.request('asset/ndbroker/deposit/list', ['broker'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    brokerGetBrokerNdTransferDetail(params = {}) {
        return this.request('broker/nd/transfer/detail', ['broker'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    brokerGetBrokerNdDepositDetail(params = {}) {
        return this.request('broker/nd/deposit/detail', ['broker'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    brokerGetBrokerNdWithdrawDetail(params = {}) {
        return this.request('broker/nd/withdraw/detail', ['broker'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    brokerPostBrokerNdTransfer(params = {}) {
        return this.request('broker/nd/transfer', ['broker'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    brokerPostBrokerNdAccount(params = {}) {
        return this.request('broker/nd/account', ['broker'], 'POST', params, undefined, undefined, { 'cost': 6 });
    }
    brokerPostBrokerNdAccountApikey(params = {}) {
        return this.request('broker/nd/account/apikey', ['broker'], 'POST', params, undefined, undefined, { 'cost': 6 });
    }
    brokerPostBrokerNdAccountUpdateApikey(params = {}) {
        return this.request('broker/nd/account/update-apikey', ['broker'], 'POST', params, undefined, undefined, { 'cost': 6 });
    }
    brokerPostBrokerNdMarkUp(params = {}) {
        return this.request('broker/nd/mark-up', ['broker'], 'POST', params, undefined, undefined, { 'cost': 6 });
    }
    brokerDeleteBrokerNdAccountApikey(params = {}) {
        return this.request('broker/nd/account/apikey', ['broker'], 'DELETE', params, undefined, undefined, { 'cost': 6 });
    }
    earnGetOtcLoanDiscountRateConfigs(params = {}) {
        return this.request('otc-loan/discount-rate-configs', ['earn'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    earnGetOtcLoanLoan(params = {}) {
        return this.request('otc-loan/loan', ['earn'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    earnGetOtcLoanAccounts(params = {}) {
        return this.request('otc-loan/accounts', ['earn'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    earnGetEarnRedeemPreview(params = {}) {
        return this.request('earn/redeem-preview', ['earn'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    earnGetEarnSavingProducts(params = {}) {
        return this.request('earn/saving/products', ['earn'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    earnGetEarnHoldAssets(params = {}) {
        return this.request('earn/hold-assets', ['earn'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    earnGetEarnPromotionProducts(params = {}) {
        return this.request('earn/promotion/products', ['earn'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    earnGetEarnKcsStakingProducts(params = {}) {
        return this.request('earn/kcs-staking/products', ['earn'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    earnGetEarnStakingProducts(params = {}) {
        return this.request('earn/staking/products', ['earn'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    earnGetEarnEthStakingProducts(params = {}) {
        return this.request('earn/eth-staking/products', ['earn'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    earnGetStructEarnDualProducts(params = {}) {
        return this.request('struct-earn/dual/products', ['earn'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    earnGetStructEarnOrders(params = {}) {
        return this.request('struct-earn/orders', ['earn'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    earnPostEarnOrders(params = {}) {
        return this.request('earn/orders', ['earn'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    earnPostStructEarnOrders(params = {}) {
        return this.request('struct-earn/orders', ['earn'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    earnDeleteEarnOrders(params = {}) {
        return this.request('earn/orders', ['earn'], 'DELETE', params, undefined, undefined, { 'cost': 10 });
    }
    utaGetMarketAnnouncement(params = {}) {
        return this.request('market/announcement', ['uta'], 'GET', params, undefined, undefined, { 'cost': 40 });
    }
    utaGetMarketCurrency(params = {}) {
        return this.request('market/currency', ['uta'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    utaGetAssetCurrencies(params = {}) {
        return this.request('asset/currencies', ['uta'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    utaGetMarketInstrument(params = {}) {
        return this.request('market/instrument', ['uta'], 'GET', params, undefined, undefined, { 'cost': 8 });
    }
    utaGetMarketTicker(params = {}) {
        return this.request('market/ticker', ['uta'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    utaGetMarketTrade(params = {}) {
        return this.request('market/trade', ['uta'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    utaGetMarketKline(params = {}) {
        return this.request('market/kline', ['uta'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    utaGetMarketFundingRate(params = {}) {
        return this.request('market/funding-rate', ['uta'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    utaGetMarketFundingRateHistory(params = {}) {
        return this.request('market/funding-rate-history', ['uta'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    utaGetMarketCrossConfig(params = {}) {
        return this.request('market/cross-config', ['uta'], 'GET', params, undefined, undefined, { 'cost': 50 });
    }
    utaGetMarketCollateralDiscountRatio(params = {}) {
        return this.request('market/collateral-discount-ratio', ['uta'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    utaGetMarketIndexPrice(params = {}) {
        return this.request('market/index-price', ['uta'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    utaGetMarketPositionTiers(params = {}) {
        return this.request('market/position-tiers', ['uta'], 'GET', params, undefined, undefined, { 'cost': 40 });
    }
    utaGetMarketOpenInterest(params = {}) {
        return this.request('market/open-interest', ['uta'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    utaGetServerStatus(params = {}) {
        return this.request('server/status', ['uta'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    utaGetMarketBorrowableCurrency(params = {}) {
        return this.request('market/borrowable-currency', ['uta'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    utaGetUserMyIp(params = {}) {
        return this.request('user/my-ip', ['uta'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    utaGetMarketFiatPrice(params = {}) {
        return this.request('market/fiat-price', ['uta'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    utaV2GetMarketFundingRate(params = {}) {
        return this.request('market/funding-rate', ['utaV2'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    utaPrivateGetMarketOrderbook(params = {}) {
        return this.request('market/orderbook', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    utaPrivateGetAccountBalance(params = {}) {
        return this.request('account/balance', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    utaPrivateGetAccountTransferQuota(params = {}) {
        return this.request('account/transfer-quota', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 40 });
    }
    utaPrivateGetAccountMode(params = {}) {
        return this.request('account/mode', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 60 });
    }
    utaPrivateGetAccountLedger(params = {}) {
        return this.request('account/ledger', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    utaPrivateGetAccountInterestHistory(params = {}) {
        return this.request('account/interest-history', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    utaPrivateGetAssetDepositAddress(params = {}) {
        return this.request('asset/deposit/address', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    utaPrivateGetAccountDepositAddress(params = {}) {
        return this.request('account/deposit/address', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    utaPrivateGetAccountModeAccountBalance(params = {}) {
        return this.request('{accountMode}/account/balance', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    utaPrivateGetAccountModeAccountOverview(params = {}) {
        return this.request('{accountMode}/account/overview', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    utaPrivateGetAccountModeOrderDetail(params = {}) {
        return this.request('{accountMode}/order/detail', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 8 });
    }
    utaPrivateGetAccountModeOrderOpenList(params = {}) {
        return this.request('{accountMode}/order/open-list', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 8 });
    }
    utaPrivateGetAccountModeOrderHistory(params = {}) {
        return this.request('{accountMode}/order/history', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 8 });
    }
    utaPrivateGetAccountModeOrderExecution(params = {}) {
        return this.request('{accountMode}/order/execution', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 8 });
    }
    utaPrivateGetAccountModePositionOpenList(params = {}) {
        return this.request('{accountMode}/position/open-list', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    utaPrivateGetAccountModePositionHistory(params = {}) {
        return this.request('{accountMode}/position/history', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    utaPrivateGetPositionHistory(params = {}) {
        return this.request('position/history', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    utaPrivateGetAccountModePositionTiers(params = {}) {
        return this.request('{accountMode}/position/tiers', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 40 });
    }
    utaPrivateGetSubAccountBalance(params = {}) {
        return this.request('sub-account/balance', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    utaPrivateGetUserFeeRate(params = {}) {
        return this.request('user/fee-rate', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    utaPrivateGetDcpQuery(params = {}) {
        return this.request('dcp/query', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 4 });
    }
    utaPrivateGetUnifiedAccountLeverage(params = {}) {
        return this.request('unified/account/leverage', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    utaPrivateGetPositionFundingHistory(params = {}) {
        return this.request('position/funding-history', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    utaPrivateGetAccountInterestLimits(params = {}) {
        return this.request('account/interest-limits', ['utaPrivate'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    utaPrivatePostAccountTransfer(params = {}) {
        return this.request('account/transfer', ['utaPrivate'], 'POST', params, undefined, undefined, { 'cost': 8 });
    }
    utaPrivatePostAccountMode(params = {}) {
        return this.request('account/mode', ['utaPrivate'], 'POST', params, undefined, undefined, { 'cost': 60 });
    }
    utaPrivatePostAccountModeAccountModifyLeverage(params = {}) {
        return this.request('{accountMode}/account/modify-leverage', ['utaPrivate'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    utaPrivatePostAccountModeOrderPlace(params = {}) {
        return this.request('{accountMode}/order/place', ['utaPrivate'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    utaPrivatePostAccountModeOrderPlaceBatch(params = {}) {
        return this.request('{accountMode}/order/place-batch', ['utaPrivate'], 'POST', params, undefined, undefined, { 'cost': 8 });
    }
    utaPrivatePostAccountModeOrderCancel(params = {}) {
        return this.request('{accountMode}/order/cancel', ['utaPrivate'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    utaPrivatePostAccountModeOrderCancelBatch(params = {}) {
        return this.request('{accountMode}/order/cancel-batch', ['utaPrivate'], 'POST', params, undefined, undefined, { 'cost': 8 });
    }
    utaPrivatePostAccountModeOrderCancelAll(params = {}) {
        return this.request('{accountMode}/order/cancel-all', ['utaPrivate'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    utaPrivatePostSubAccountCanTransferOut(params = {}) {
        return this.request('sub-account/canTransferOut', ['utaPrivate'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    utaPrivatePostDcpSet(params = {}) {
        return this.request('dcp/set', ['utaPrivate'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    utaPrivatePostAccountModeAccountModifyLeverageMarginCross(params = {}) {
        return this.request('{accountMode}/account/modify-leverage-margin-cross', ['utaPrivate'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
}

exports["default"] = Exchange;
