'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetApiV1MarketSymbols(params) { return this['publicGetApiV1MarketSymbols'](params); }
    publicGetApiV1MarketTicker(params) { return this['publicGetApiV1MarketTicker'](params); }
    publicGetApiV1MarketTickerAll(params) { return this['publicGetApiV1MarketTickerAll'](params); }
    publicGetApiV1MarketDepth(params) { return this['publicGetApiV1MarketDepth'](params); }
    publicGetApiV1MarketDepthAll(params) { return this['publicGetApiV1MarketDepthAll'](params); }
    publicGetApiV1MarketTrades(params) { return this['publicGetApiV1MarketTrades'](params); }
    publicGetApiV1MarketKline(params) { return this['publicGetApiV1MarketKline'](params); }
    privatePostApiV1FundMainAccount(params) { return this['privatePostApiV1FundMainAccount'](params); }
    privatePostApiV1FundAllAccount(params) { return this['privatePostApiV1FundAllAccount'](params); }
    privatePostApiV1TradePlaceOrder(params) { return this['privatePostApiV1TradePlaceOrder'](params); }
    privatePostApiV1TradePlaceMultiOrder(params) { return this['privatePostApiV1TradePlaceMultiOrder'](params); }
    privatePostApiV1TradeCancelOrder(params) { return this['privatePostApiV1TradeCancelOrder'](params); }
    privatePostApiV1TradeCancelMultiOrder(params) { return this['privatePostApiV1TradeCancelMultiOrder'](params); }
    privatePostApiV1TradeCancelAllOrder(params) { return this['privatePostApiV1TradeCancelAllOrder'](params); }
    privatePostApiV1TradeOrderInfo(params) { return this['privatePostApiV1TradeOrderInfo'](params); }
    privatePostApiV1TradeMultiOrderInfo(params) { return this['privatePostApiV1TradeMultiOrderInfo'](params); }
    privatePostApiV1TradeOrderInfos(params) { return this['privatePostApiV1TradeOrderInfos'](params); }
}

module.exports = Exchange;
