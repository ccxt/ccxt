'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetCurrencies(params) { return this['publicGetCurrencies'](params); }
    publicGetCandlesticksInstrumentCode(params) { return this['publicGetCandlesticksInstrumentCode'](params); }
    publicGetFees(params) { return this['publicGetFees'](params); }
    publicGetInstruments(params) { return this['publicGetInstruments'](params); }
    publicGetOrderBookInstrumentCode(params) { return this['publicGetOrderBookInstrumentCode'](params); }
    publicGetMarketTicker(params) { return this['publicGetMarketTicker'](params); }
    publicGetMarketTickerInstrumentCode(params) { return this['publicGetMarketTickerInstrumentCode'](params); }
    publicGetPriceTicksInstrumentCode(params) { return this['publicGetPriceTicksInstrumentCode'](params); }
    publicGetTime(params) { return this['publicGetTime'](params); }
    privateGetAccountBalances(params) { return this['privateGetAccountBalances'](params); }
    privateGetAccountDepositCryptoCurrencyCode(params) { return this['privateGetAccountDepositCryptoCurrencyCode'](params); }
    privateGetAccountDepositFiatEUR(params) { return this['privateGetAccountDepositFiatEUR'](params); }
    privateGetAccountDeposits(params) { return this['privateGetAccountDeposits'](params); }
    privateGetAccountDepositsBitpanda(params) { return this['privateGetAccountDepositsBitpanda'](params); }
    privateGetAccountWithdrawals(params) { return this['privateGetAccountWithdrawals'](params); }
    privateGetAccountWithdrawalsBitpanda(params) { return this['privateGetAccountWithdrawalsBitpanda'](params); }
    privateGetAccountFees(params) { return this['privateGetAccountFees'](params); }
    privateGetAccountOrders(params) { return this['privateGetAccountOrders'](params); }
    privateGetAccountOrdersOrderId(params) { return this['privateGetAccountOrdersOrderId'](params); }
    privateGetAccountOrdersOrderIdTrades(params) { return this['privateGetAccountOrdersOrderIdTrades'](params); }
    privateGetAccountTrades(params) { return this['privateGetAccountTrades'](params); }
    privateGetAccountTradesTradeId(params) { return this['privateGetAccountTradesTradeId'](params); }
    privateGetAccountTradingVolume(params) { return this['privateGetAccountTradingVolume'](params); }
    privatePostAccountDepositCrypto(params) { return this['privatePostAccountDepositCrypto'](params); }
    privatePostAccountWithdrawCrypto(params) { return this['privatePostAccountWithdrawCrypto'](params); }
    privatePostAccountWithdrawFiat(params) { return this['privatePostAccountWithdrawFiat'](params); }
    privatePostAccountFees(params) { return this['privatePostAccountFees'](params); }
    privatePostAccountOrders(params) { return this['privatePostAccountOrders'](params); }
    privateDeleteAccountOrders(params) { return this['privateDeleteAccountOrders'](params); }
    privateDeleteAccountOrdersOrderId(params) { return this['privateDeleteAccountOrdersOrderId'](params); }
    privateDeleteAccountOrdersClientClientId(params) { return this['privateDeleteAccountOrdersClientClientId'](params); }
}

module.exports = Exchange;
