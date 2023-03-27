'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetTicker(params) { return this['publicGetTicker'](params); }
    publicGetTickerHour(params) { return this['publicGetTickerHour'](params); }
    publicGetOrderBook(params) { return this['publicGetOrderBook'](params); }
    publicGetTransactions(params) { return this['publicGetTransactions'](params); }
    publicGetEurUsd(params) { return this['publicGetEurUsd'](params); }
    privatePostBalance(params) { return this['privatePostBalance'](params); }
    privatePostUserTransactions(params) { return this['privatePostUserTransactions'](params); }
    privatePostOpenOrders(params) { return this['privatePostOpenOrders'](params); }
    privatePostOrderStatus(params) { return this['privatePostOrderStatus'](params); }
    privatePostCancelOrder(params) { return this['privatePostCancelOrder'](params); }
    privatePostCancelAllOrders(params) { return this['privatePostCancelAllOrders'](params); }
    privatePostBuy(params) { return this['privatePostBuy'](params); }
    privatePostSell(params) { return this['privatePostSell'](params); }
    privatePostBitcoinDepositAddress(params) { return this['privatePostBitcoinDepositAddress'](params); }
    privatePostUnconfirmedBtc(params) { return this['privatePostUnconfirmedBtc'](params); }
    privatePostRippleWithdrawal(params) { return this['privatePostRippleWithdrawal'](params); }
    privatePostRippleAddress(params) { return this['privatePostRippleAddress'](params); }
    privatePostWithdrawalRequests(params) { return this['privatePostWithdrawalRequests'](params); }
    privatePostBitcoinWithdrawal(params) { return this['privatePostBitcoinWithdrawal'](params); }
}

module.exports = Exchange;
