'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetCurrencyPairs(params) { return this['publicGetCurrencyPairs'](params); }
    publicGetAccuracy(params) { return this['publicGetAccuracy'](params); }
    publicGetUsdToCny(params) { return this['publicGetUsdToCny'](params); }
    publicGetWithdrawConfigs(params) { return this['publicGetWithdrawConfigs'](params); }
    publicGetTimestamp(params) { return this['publicGetTimestamp'](params); }
    publicGetTicker24hr(params) { return this['publicGetTicker24hr'](params); }
    publicGetTicker(params) { return this['publicGetTicker'](params); }
    publicGetDepth(params) { return this['publicGetDepth'](params); }
    publicGetIncrDepth(params) { return this['publicGetIncrDepth'](params); }
    publicGetTrades(params) { return this['publicGetTrades'](params); }
    publicGetKline(params) { return this['publicGetKline'](params); }
    publicGetSupplementSystemPing(params) { return this['publicGetSupplementSystemPing'](params); }
    publicGetSupplementIncrDepth(params) { return this['publicGetSupplementIncrDepth'](params); }
    publicGetSupplementTrades(params) { return this['publicGetSupplementTrades'](params); }
    publicGetSupplementTickerPrice(params) { return this['publicGetSupplementTickerPrice'](params); }
    publicGetSupplementTickerBookTicker(params) { return this['publicGetSupplementTickerBookTicker'](params); }
    publicPostSupplementSystemStatus(params) { return this['publicPostSupplementSystemStatus'](params); }
    privatePostUserInfo(params) { return this['privatePostUserInfo'](params); }
    privatePostSubscribeGetKey(params) { return this['privatePostSubscribeGetKey'](params); }
    privatePostSubscribeRefreshKey(params) { return this['privatePostSubscribeRefreshKey'](params); }
    privatePostSubscribeDestroyKey(params) { return this['privatePostSubscribeDestroyKey'](params); }
    privatePostGetDepositAddress(params) { return this['privatePostGetDepositAddress'](params); }
    privatePostDepositHistory(params) { return this['privatePostDepositHistory'](params); }
    privatePostCreateOrder(params) { return this['privatePostCreateOrder'](params); }
    privatePostBatchCreateOrder(params) { return this['privatePostBatchCreateOrder'](params); }
    privatePostCancelOrder(params) { return this['privatePostCancelOrder'](params); }
    privatePostCancelClientOrders(params) { return this['privatePostCancelClientOrders'](params); }
    privatePostOrdersInfo(params) { return this['privatePostOrdersInfo'](params); }
    privatePostOrdersInfoHistory(params) { return this['privatePostOrdersInfoHistory'](params); }
    privatePostOrderTransactionDetail(params) { return this['privatePostOrderTransactionDetail'](params); }
    privatePostTransactionHistory(params) { return this['privatePostTransactionHistory'](params); }
    privatePostOrdersInfoNoDeal(params) { return this['privatePostOrdersInfoNoDeal'](params); }
    privatePostWithdraw(params) { return this['privatePostWithdraw'](params); }
    privatePostWithdrawCancel(params) { return this['privatePostWithdrawCancel'](params); }
    privatePostWithdraws(params) { return this['privatePostWithdraws'](params); }
    privatePostSupplementUserInfo(params) { return this['privatePostSupplementUserInfo'](params); }
    privatePostSupplementWithdraw(params) { return this['privatePostSupplementWithdraw'](params); }
    privatePostSupplementDepositHistory(params) { return this['privatePostSupplementDepositHistory'](params); }
    privatePostSupplementWithdraws(params) { return this['privatePostSupplementWithdraws'](params); }
    privatePostSupplementGetDepositAddress(params) { return this['privatePostSupplementGetDepositAddress'](params); }
    privatePostSupplementAssetDetail(params) { return this['privatePostSupplementAssetDetail'](params); }
    privatePostSupplementCustomerTradeFee(params) { return this['privatePostSupplementCustomerTradeFee'](params); }
    privatePostSupplementApiRestrictions(params) { return this['privatePostSupplementApiRestrictions'](params); }
    privatePostSupplementSystemPing(params) { return this['privatePostSupplementSystemPing'](params); }
    privatePostSupplementCreateOrderTest(params) { return this['privatePostSupplementCreateOrderTest'](params); }
    privatePostSupplementCreateOrder(params) { return this['privatePostSupplementCreateOrder'](params); }
    privatePostSupplementCancelOrder(params) { return this['privatePostSupplementCancelOrder'](params); }
    privatePostSupplementCancelOrderBySymbol(params) { return this['privatePostSupplementCancelOrderBySymbol'](params); }
    privatePostSupplementOrdersInfo(params) { return this['privatePostSupplementOrdersInfo'](params); }
    privatePostSupplementOrdersInfoNoDeal(params) { return this['privatePostSupplementOrdersInfoNoDeal'](params); }
    privatePostSupplementOrdersInfoHistory(params) { return this['privatePostSupplementOrdersInfoHistory'](params); }
    privatePostSupplementUserInfoAccount(params) { return this['privatePostSupplementUserInfoAccount'](params); }
    privatePostSupplementTransactionHistory(params) { return this['privatePostSupplementTransactionHistory'](params); }
}

module.exports = Exchange;
