'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetDepthPair(params) { return this['publicGetDepthPair'](params); }
    publicGetCurrenciesPair(params) { return this['publicGetCurrenciesPair'](params); }
    publicGetCurrenciesAll(params) { return this['publicGetCurrenciesAll'](params); }
    publicGetCurrencyPairsPair(params) { return this['publicGetCurrencyPairsPair'](params); }
    publicGetCurrencyPairsAll(params) { return this['publicGetCurrencyPairsAll'](params); }
    publicGetLastPricePair(params) { return this['publicGetLastPricePair'](params); }
    publicGetTickerPair(params) { return this['publicGetTickerPair'](params); }
    publicGetTradesPair(params) { return this['publicGetTradesPair'](params); }
    privatePostActiveOrders(params) { return this['privatePostActiveOrders'](params); }
    privatePostCancelOrder(params) { return this['privatePostCancelOrder'](params); }
    privatePostDepositHistory(params) { return this['privatePostDepositHistory'](params); }
    privatePostGetIdInfo(params) { return this['privatePostGetIdInfo'](params); }
    privatePostGetInfo(params) { return this['privatePostGetInfo'](params); }
    privatePostGetInfo2(params) { return this['privatePostGetInfo2'](params); }
    privatePostGetPersonalInfo(params) { return this['privatePostGetPersonalInfo'](params); }
    privatePostTrade(params) { return this['privatePostTrade'](params); }
    privatePostTradeHistory(params) { return this['privatePostTradeHistory'](params); }
    privatePostWithdraw(params) { return this['privatePostWithdraw'](params); }
    privatePostWithdrawHistory(params) { return this['privatePostWithdrawHistory'](params); }
    ecapiPostCreateInvoice(params) { return this['ecapiPostCreateInvoice'](params); }
    ecapiPostGetInvoice(params) { return this['ecapiPostGetInvoice'](params); }
    ecapiPostGetInvoiceIdsByOrderNumber(params) { return this['ecapiPostGetInvoiceIdsByOrderNumber'](params); }
    ecapiPostCancelInvoice(params) { return this['ecapiPostCancelInvoice'](params); }
    tlapiPostGetPositions(params) { return this['tlapiPostGetPositions'](params); }
    tlapiPostPositionHistory(params) { return this['tlapiPostPositionHistory'](params); }
    tlapiPostActivePositions(params) { return this['tlapiPostActivePositions'](params); }
    tlapiPostCreatePosition(params) { return this['tlapiPostCreatePosition'](params); }
    tlapiPostChangePosition(params) { return this['tlapiPostChangePosition'](params); }
    tlapiPostCancelPosition(params) { return this['tlapiPostCancelPosition'](params); }
    fapiGetGroupsGroupId(params) { return this['fapiGetGroupsGroupId'](params); }
    fapiGetLastPriceGroupIdPair(params) { return this['fapiGetLastPriceGroupIdPair'](params); }
    fapiGetTickerGroupIdPair(params) { return this['fapiGetTickerGroupIdPair'](params); }
    fapiGetTradesGroupIdPair(params) { return this['fapiGetTradesGroupIdPair'](params); }
    fapiGetDepthGroupIdPair(params) { return this['fapiGetDepthGroupIdPair'](params); }
}

module.exports = Exchange;
