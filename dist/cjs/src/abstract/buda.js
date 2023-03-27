'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetPairs(params) { return this['publicGetPairs'](params); }
    publicGetMarkets(params) { return this['publicGetMarkets'](params); }
    publicGetCurrencies(params) { return this['publicGetCurrencies'](params); }
    publicGetMarketsMarket(params) { return this['publicGetMarketsMarket'](params); }
    publicGetMarketsMarketTicker(params) { return this['publicGetMarketsMarketTicker'](params); }
    publicGetMarketsMarketVolume(params) { return this['publicGetMarketsMarketVolume'](params); }
    publicGetMarketsMarketOrderBook(params) { return this['publicGetMarketsMarketOrderBook'](params); }
    publicGetMarketsMarketTrades(params) { return this['publicGetMarketsMarketTrades'](params); }
    publicGetCurrenciesCurrencyFeesDeposit(params) { return this['publicGetCurrenciesCurrencyFeesDeposit'](params); }
    publicGetCurrenciesCurrencyFeesWithdrawal(params) { return this['publicGetCurrenciesCurrencyFeesWithdrawal'](params); }
    publicGetTvHistory(params) { return this['publicGetTvHistory'](params); }
    publicPostMarketsMarketQuotations(params) { return this['publicPostMarketsMarketQuotations'](params); }
    privateGetBalances(params) { return this['privateGetBalances'](params); }
    privateGetBalancesCurrency(params) { return this['privateGetBalancesCurrency'](params); }
    privateGetCurrenciesCurrencyBalances(params) { return this['privateGetCurrenciesCurrencyBalances'](params); }
    privateGetOrders(params) { return this['privateGetOrders'](params); }
    privateGetOrdersId(params) { return this['privateGetOrdersId'](params); }
    privateGetMarketsMarketOrders(params) { return this['privateGetMarketsMarketOrders'](params); }
    privateGetDeposits(params) { return this['privateGetDeposits'](params); }
    privateGetCurrenciesCurrencyDeposits(params) { return this['privateGetCurrenciesCurrencyDeposits'](params); }
    privateGetWithdrawals(params) { return this['privateGetWithdrawals'](params); }
    privateGetCurrenciesCurrencyWithdrawals(params) { return this['privateGetCurrenciesCurrencyWithdrawals'](params); }
    privateGetCurrenciesCurrencyReceiveAddresses(params) { return this['privateGetCurrenciesCurrencyReceiveAddresses'](params); }
    privateGetCurrenciesCurrencyReceiveAddressesId(params) { return this['privateGetCurrenciesCurrencyReceiveAddressesId'](params); }
    privatePostMarketsMarketOrders(params) { return this['privatePostMarketsMarketOrders'](params); }
    privatePostCurrenciesCurrencyDeposits(params) { return this['privatePostCurrenciesCurrencyDeposits'](params); }
    privatePostCurrenciesCurrencyWithdrawals(params) { return this['privatePostCurrenciesCurrencyWithdrawals'](params); }
    privatePostCurrenciesCurrencySimulatedWithdrawals(params) { return this['privatePostCurrenciesCurrencySimulatedWithdrawals'](params); }
    privatePostCurrenciesCurrencyReceiveAddresses(params) { return this['privatePostCurrenciesCurrencyReceiveAddresses'](params); }
    privatePutOrdersId(params) { return this['privatePutOrdersId'](params); }
}

module.exports = Exchange;
