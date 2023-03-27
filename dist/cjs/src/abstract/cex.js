'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetCurrencyProfile(params) { return this['publicGetCurrencyProfile'](params); }
    publicGetCurrencyLimits(params) { return this['publicGetCurrencyLimits'](params); }
    publicGetLastPricePair(params) { return this['publicGetLastPricePair'](params); }
    publicGetLastPricesCurrencies(params) { return this['publicGetLastPricesCurrencies'](params); }
    publicGetOhlcvHdYyyymmddPair(params) { return this['publicGetOhlcvHdYyyymmddPair'](params); }
    publicGetOrderBookPair(params) { return this['publicGetOrderBookPair'](params); }
    publicGetTickerPair(params) { return this['publicGetTickerPair'](params); }
    publicGetTickersCurrencies(params) { return this['publicGetTickersCurrencies'](params); }
    publicGetTradeHistoryPair(params) { return this['publicGetTradeHistoryPair'](params); }
    publicPostConvertPair(params) { return this['publicPostConvertPair'](params); }
    publicPostPriceStatsPair(params) { return this['publicPostPriceStatsPair'](params); }
    privatePostActiveOrdersStatus(params) { return this['privatePostActiveOrdersStatus'](params); }
    privatePostArchivedOrdersPair(params) { return this['privatePostArchivedOrdersPair'](params); }
    privatePostBalance(params) { return this['privatePostBalance'](params); }
    privatePostCancelOrder(params) { return this['privatePostCancelOrder'](params); }
    privatePostCancelOrdersPair(params) { return this['privatePostCancelOrdersPair'](params); }
    privatePostCancelReplaceOrderPair(params) { return this['privatePostCancelReplaceOrderPair'](params); }
    privatePostClosePositionPair(params) { return this['privatePostClosePositionPair'](params); }
    privatePostGetAddress(params) { return this['privatePostGetAddress'](params); }
    privatePostGetCryptoAddress(params) { return this['privatePostGetCryptoAddress'](params); }
    privatePostGetMyfee(params) { return this['privatePostGetMyfee'](params); }
    privatePostGetOrder(params) { return this['privatePostGetOrder'](params); }
    privatePostGetOrderTx(params) { return this['privatePostGetOrderTx'](params); }
    privatePostOpenOrdersPair(params) { return this['privatePostOpenOrdersPair'](params); }
    privatePostOpenOrders(params) { return this['privatePostOpenOrders'](params); }
    privatePostOpenPositionPair(params) { return this['privatePostOpenPositionPair'](params); }
    privatePostOpenPositionsPair(params) { return this['privatePostOpenPositionsPair'](params); }
    privatePostPlaceOrderPair(params) { return this['privatePostPlaceOrderPair'](params); }
    privatePostRawTxHistory(params) { return this['privatePostRawTxHistory'](params); }
}

module.exports = Exchange;
