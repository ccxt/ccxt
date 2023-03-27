'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetHealth(params) { return this['publicGetHealth'](params); }
    publicGetConstants(params) { return this['publicGetConstants'](params); }
    publicGetKit(params) { return this['publicGetKit'](params); }
    publicGetTiers(params) { return this['publicGetTiers'](params); }
    publicGetTicker(params) { return this['publicGetTicker'](params); }
    publicGetTickers(params) { return this['publicGetTickers'](params); }
    publicGetOrderbook(params) { return this['publicGetOrderbook'](params); }
    publicGetOrderbooks(params) { return this['publicGetOrderbooks'](params); }
    publicGetTrades(params) { return this['publicGetTrades'](params); }
    publicGetChart(params) { return this['publicGetChart'](params); }
    publicGetCharts(params) { return this['publicGetCharts'](params); }
    publicGetUdfConfig(params) { return this['publicGetUdfConfig'](params); }
    publicGetUdfHistory(params) { return this['publicGetUdfHistory'](params); }
    publicGetUdfSymbols(params) { return this['publicGetUdfSymbols'](params); }
    privateGetUser(params) { return this['privateGetUser'](params); }
    privateGetUserBalance(params) { return this['privateGetUserBalance'](params); }
    privateGetUserDeposits(params) { return this['privateGetUserDeposits'](params); }
    privateGetUserWithdrawals(params) { return this['privateGetUserWithdrawals'](params); }
    privateGetUserWithdrawalFee(params) { return this['privateGetUserWithdrawalFee'](params); }
    privateGetUserTrades(params) { return this['privateGetUserTrades'](params); }
    privateGetOrders(params) { return this['privateGetOrders'](params); }
    privateGetOrder(params) { return this['privateGetOrder'](params); }
    privatePostUserWithdrawal(params) { return this['privatePostUserWithdrawal'](params); }
    privatePostOrder(params) { return this['privatePostOrder'](params); }
    privateDeleteOrderAll(params) { return this['privateDeleteOrderAll'](params); }
    privateDeleteOrder(params) { return this['privateDeleteOrder'](params); }
}

module.exports = Exchange;
