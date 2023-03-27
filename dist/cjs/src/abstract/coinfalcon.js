'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetMarkets(params) { return this['publicGetMarkets'](params); }
    publicGetMarketsMarket(params) { return this['publicGetMarketsMarket'](params); }
    publicGetMarketsMarketOrders(params) { return this['publicGetMarketsMarketOrders'](params); }
    publicGetMarketsMarketTrades(params) { return this['publicGetMarketsMarketTrades'](params); }
    privateGetUserAccounts(params) { return this['privateGetUserAccounts'](params); }
    privateGetUserOrders(params) { return this['privateGetUserOrders'](params); }
    privateGetUserOrdersId(params) { return this['privateGetUserOrdersId'](params); }
    privateGetUserOrdersIdTrades(params) { return this['privateGetUserOrdersIdTrades'](params); }
    privateGetUserTrades(params) { return this['privateGetUserTrades'](params); }
    privateGetUserFees(params) { return this['privateGetUserFees'](params); }
    privateGetAccountWithdrawalsId(params) { return this['privateGetAccountWithdrawalsId'](params); }
    privateGetAccountWithdrawals(params) { return this['privateGetAccountWithdrawals'](params); }
    privateGetAccountDepositId(params) { return this['privateGetAccountDepositId'](params); }
    privateGetAccountDeposits(params) { return this['privateGetAccountDeposits'](params); }
    privateGetAccountDepositAddress(params) { return this['privateGetAccountDepositAddress'](params); }
    privatePostUserOrders(params) { return this['privatePostUserOrders'](params); }
    privatePostAccountWithdraw(params) { return this['privatePostAccountWithdraw'](params); }
    privateDeleteUserOrdersId(params) { return this['privateDeleteUserOrdersId'](params); }
    privateDeleteAccountWithdrawalsId(params) { return this['privateDeleteAccountWithdrawalsId'](params); }
}

module.exports = Exchange;
