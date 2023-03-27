'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetOrderBookPair(params) { return this['publicGetOrderBookPair'](params); }
    publicGetTickers(params) { return this['publicGetTickers'](params); }
    publicGetTickersPair(params) { return this['publicGetTickersPair'](params); }
    publicGetTradesPair(params) { return this['publicGetTradesPair'](params); }
    publicGetProvisioningCurrencies(params) { return this['publicGetProvisioningCurrencies'](params); }
    publicGetProvisioningTradingPairs(params) { return this['publicGetProvisioningTradingPairs'](params); }
    publicGetProvisioningLimitationsAndFees(params) { return this['publicGetProvisioningLimitationsAndFees'](params); }
    publicGetTradingHistoryPair(params) { return this['publicGetTradingHistoryPair'](params); }
    privateGetAccountsBalance(params) { return this['privateGetAccountsBalance'](params); }
    privateGetOrdersHistory(params) { return this['privateGetOrdersHistory'](params); }
    privateGetOrdersAllPair(params) { return this['privateGetOrdersAllPair'](params); }
    privateGetOrdersTradesPair(params) { return this['privateGetOrdersTradesPair'](params); }
    privateGetOrdersPairOrderId(params) { return this['privateGetOrdersPairOrderId'](params); }
    privateGetWalletWithdrawCurrencySerial(params) { return this['privateGetWalletWithdrawCurrencySerial'](params); }
    privateGetWalletWithdrawCurrencyIdId(params) { return this['privateGetWalletWithdrawCurrencyIdId'](params); }
    privateGetWalletDepositHistoryCurrency(params) { return this['privateGetWalletDepositHistoryCurrency'](params); }
    privateGetWalletWithdrawHistoryCurrency(params) { return this['privateGetWalletWithdrawHistoryCurrency'](params); }
    privatePostOrdersPair(params) { return this['privatePostOrdersPair'](params); }
    privatePostOrdersBatch(params) { return this['privatePostOrdersBatch'](params); }
    privatePostWalletWithdrawCurrency(params) { return this['privatePostWalletWithdrawCurrency'](params); }
    privatePutOrders(params) { return this['privatePutOrders'](params); }
    privateDeleteOrdersPairId(params) { return this['privateDeleteOrdersPairId'](params); }
    privateDeleteOrdersAll(params) { return this['privateDeleteOrdersAll'](params); }
    privateDeleteOrdersPair(params) { return this['privateDeleteOrdersPair'](params); }
}

module.exports = Exchange;
