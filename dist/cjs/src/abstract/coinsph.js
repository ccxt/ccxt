'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetOpenapiV1Ping(params) { return this['publicGetOpenapiV1Ping'](params); }
    publicGetOpenapiV1Time(params) { return this['publicGetOpenapiV1Time'](params); }
    publicGetOpenapiQuoteV1Ticker24hr(params) { return this['publicGetOpenapiQuoteV1Ticker24hr'](params); }
    publicGetOpenapiQuoteV1TickerPrice(params) { return this['publicGetOpenapiQuoteV1TickerPrice'](params); }
    publicGetOpenapiQuoteV1TickerBookTicker(params) { return this['publicGetOpenapiQuoteV1TickerBookTicker'](params); }
    publicGetOpenapiV1ExchangeInfo(params) { return this['publicGetOpenapiV1ExchangeInfo'](params); }
    publicGetOpenapiQuoteV1Depth(params) { return this['publicGetOpenapiQuoteV1Depth'](params); }
    publicGetOpenapiQuoteV1Klines(params) { return this['publicGetOpenapiQuoteV1Klines'](params); }
    publicGetOpenapiQuoteV1Trades(params) { return this['publicGetOpenapiQuoteV1Trades'](params); }
    publicGetOpenapiV1Pairs(params) { return this['publicGetOpenapiV1Pairs'](params); }
    publicGetOpenapiQuoteV1AvgPrice(params) { return this['publicGetOpenapiQuoteV1AvgPrice'](params); }
    privateGetOpenapiV1Account(params) { return this['privateGetOpenapiV1Account'](params); }
    privateGetOpenapiV1OpenOrders(params) { return this['privateGetOpenapiV1OpenOrders'](params); }
    privateGetOpenapiV1AssetTradeFee(params) { return this['privateGetOpenapiV1AssetTradeFee'](params); }
    privateGetOpenapiV1Order(params) { return this['privateGetOpenapiV1Order'](params); }
    privateGetOpenapiV1HistoryOrders(params) { return this['privateGetOpenapiV1HistoryOrders'](params); }
    privateGetOpenapiV1MyTrades(params) { return this['privateGetOpenapiV1MyTrades'](params); }
    privateGetOpenapiV1CapitalDepositHistory(params) { return this['privateGetOpenapiV1CapitalDepositHistory'](params); }
    privateGetOpenapiV1CapitalWithdrawHistory(params) { return this['privateGetOpenapiV1CapitalWithdrawHistory'](params); }
    privatePostOpenapiV1OrderTest(params) { return this['privatePostOpenapiV1OrderTest'](params); }
    privatePostOpenapiV1Order(params) { return this['privatePostOpenapiV1Order'](params); }
    privatePostOpenapiV1CapitalWithdrawApply(params) { return this['privatePostOpenapiV1CapitalWithdrawApply'](params); }
    privatePostOpenapiV1CapitalDepositApply(params) { return this['privatePostOpenapiV1CapitalDepositApply'](params); }
    privateDeleteOpenapiV1Order(params) { return this['privateDeleteOpenapiV1Order'](params); }
    privateDeleteOpenapiV1OpenOrders(params) { return this['privateDeleteOpenapiV1OpenOrders'](params); }
}

module.exports = Exchange;
