'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetMarket(params) { return this['publicGetMarket'](params); }
    publicGetCurrency(params) { return this['publicGetCurrency'](params); }
    publicGetCurrencyWithPlatform(params) { return this['publicGetCurrencyWithPlatform'](params); }
    publicGetTime(params) { return this['publicGetTime'](params); }
    publicGetTicker(params) { return this['publicGetTicker'](params); }
    publicGetOrderBook(params) { return this['publicGetOrderBook'](params); }
    publicGetTrade(params) { return this['publicGetTrade'](params); }
    publicGetCandle(params) { return this['publicGetCandle'](params); }
    privatePostNewOrder(params) { return this['privatePostNewOrder'](params); }
    privatePostCancelOrder(params) { return this['privatePostCancelOrder'](params); }
    privatePostWithdrawal(params) { return this['privatePostWithdrawal'](params); }
    privateGetBalance(params) { return this['privateGetBalance'](params); }
    privateGetOrder(params) { return this['privateGetOrder'](params); }
    privateGetOpenOrder(params) { return this['privateGetOpenOrder'](params); }
    privateGetOrderHistory(params) { return this['privateGetOrderHistory'](params); }
    privateGetTradeHistory(params) { return this['privateGetTradeHistory'](params); }
    privateGetDepositAddress(params) { return this['privateGetDepositAddress'](params); }
    accountsPostToken(params) { return this['accountsPostToken'](params); }
}

module.exports = Exchange;
