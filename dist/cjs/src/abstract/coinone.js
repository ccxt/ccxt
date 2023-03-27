'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetOrderbook(params) { return this['publicGetOrderbook'](params); }
    publicGetTrades(params) { return this['publicGetTrades'](params); }
    publicGetTicker(params) { return this['publicGetTicker'](params); }
    privatePostAccountDepositAddress(params) { return this['privatePostAccountDepositAddress'](params); }
    privatePostAccountBtcDepositAddress(params) { return this['privatePostAccountBtcDepositAddress'](params); }
    privatePostAccountBalance(params) { return this['privatePostAccountBalance'](params); }
    privatePostAccountDailyBalance(params) { return this['privatePostAccountDailyBalance'](params); }
    privatePostAccountUserInfo(params) { return this['privatePostAccountUserInfo'](params); }
    privatePostAccountVirtualAccount(params) { return this['privatePostAccountVirtualAccount'](params); }
    privatePostOrderCancelAll(params) { return this['privatePostOrderCancelAll'](params); }
    privatePostOrderCancel(params) { return this['privatePostOrderCancel'](params); }
    privatePostOrderLimitBuy(params) { return this['privatePostOrderLimitBuy'](params); }
    privatePostOrderLimitSell(params) { return this['privatePostOrderLimitSell'](params); }
    privatePostOrderCompleteOrders(params) { return this['privatePostOrderCompleteOrders'](params); }
    privatePostOrderLimitOrders(params) { return this['privatePostOrderLimitOrders'](params); }
    privatePostOrderOrderInfo(params) { return this['privatePostOrderOrderInfo'](params); }
    privatePostTransactionAuthNumber(params) { return this['privatePostTransactionAuthNumber'](params); }
    privatePostTransactionHistory(params) { return this['privatePostTransactionHistory'](params); }
    privatePostTransactionKrwHistory(params) { return this['privatePostTransactionKrwHistory'](params); }
    privatePostTransactionBtc(params) { return this['privatePostTransactionBtc'](params); }
    privatePostTransactionCoin(params) { return this['privatePostTransactionCoin'](params); }
}

module.exports = Exchange;
