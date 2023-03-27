'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetCoins(params) { return this['publicGetCoins'](params); }
    publicGetCoinOrderbook(params) { return this['publicGetCoinOrderbook'](params); }
    publicGetCoinTicker(params) { return this['publicGetCoinTicker'](params); }
    publicGetCoinTrades(params) { return this['publicGetCoinTrades'](params); }
    publicGetCoinTradesFrom(params) { return this['publicGetCoinTradesFrom'](params); }
    publicGetCoinTradesFromTo(params) { return this['publicGetCoinTradesFromTo'](params); }
    publicGetCoinDaySummaryYearMonthDay(params) { return this['publicGetCoinDaySummaryYearMonthDay'](params); }
    privatePostCancelOrder(params) { return this['privatePostCancelOrder'](params); }
    privatePostGetAccountInfo(params) { return this['privatePostGetAccountInfo'](params); }
    privatePostGetOrder(params) { return this['privatePostGetOrder'](params); }
    privatePostGetWithdrawal(params) { return this['privatePostGetWithdrawal'](params); }
    privatePostListSystemMessages(params) { return this['privatePostListSystemMessages'](params); }
    privatePostListOrders(params) { return this['privatePostListOrders'](params); }
    privatePostListOrderbook(params) { return this['privatePostListOrderbook'](params); }
    privatePostPlaceBuyOrder(params) { return this['privatePostPlaceBuyOrder'](params); }
    privatePostPlaceSellOrder(params) { return this['privatePostPlaceSellOrder'](params); }
    privatePostPlaceMarketBuyOrder(params) { return this['privatePostPlaceMarketBuyOrder'](params); }
    privatePostPlaceMarketSellOrder(params) { return this['privatePostPlaceMarketSellOrder'](params); }
    privatePostWithdrawCoin(params) { return this['privatePostWithdrawCoin'](params); }
    v4PublicGetCoinCandle(params) { return this['v4PublicGetCoinCandle'](params); }
    v4PublicNetGetCandles(params) { return this['v4PublicNetGetCandles'](params); }
}

module.exports = Exchange;
