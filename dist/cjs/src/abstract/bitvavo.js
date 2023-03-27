'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetTime(params) { return this['publicGetTime'](params); }
    publicGetMarkets(params) { return this['publicGetMarkets'](params); }
    publicGetAssets(params) { return this['publicGetAssets'](params); }
    publicGetMarketBook(params) { return this['publicGetMarketBook'](params); }
    publicGetMarketTrades(params) { return this['publicGetMarketTrades'](params); }
    publicGetMarketCandles(params) { return this['publicGetMarketCandles'](params); }
    publicGetTickerPrice(params) { return this['publicGetTickerPrice'](params); }
    publicGetTickerBook(params) { return this['publicGetTickerBook'](params); }
    publicGetTicker24h(params) { return this['publicGetTicker24h'](params); }
    privateGetAccount(params) { return this['privateGetAccount'](params); }
    privateGetOrder(params) { return this['privateGetOrder'](params); }
    privateGetOrders(params) { return this['privateGetOrders'](params); }
    privateGetOrdersOpen(params) { return this['privateGetOrdersOpen'](params); }
    privateGetTrades(params) { return this['privateGetTrades'](params); }
    privateGetBalance(params) { return this['privateGetBalance'](params); }
    privateGetDeposit(params) { return this['privateGetDeposit'](params); }
    privateGetDepositHistory(params) { return this['privateGetDepositHistory'](params); }
    privateGetWithdrawalHistory(params) { return this['privateGetWithdrawalHistory'](params); }
    privatePostOrder(params) { return this['privatePostOrder'](params); }
    privatePostWithdrawal(params) { return this['privatePostWithdrawal'](params); }
    privatePutOrder(params) { return this['privatePutOrder'](params); }
    privateDeleteOrder(params) { return this['privateDeleteOrder'](params); }
    privateDeleteOrders(params) { return this['privateDeleteOrders'](params); }
}

module.exports = Exchange;
