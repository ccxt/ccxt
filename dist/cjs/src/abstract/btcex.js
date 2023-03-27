'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetGetLastTradesByCurrency(params) { return this['publicGetGetLastTradesByCurrency'](params); }
    publicGetGetLastTradesByInstrument(params) { return this['publicGetGetLastTradesByInstrument'](params); }
    publicGetGetOrderBook(params) { return this['publicGetGetOrderBook'](params); }
    publicGetTickers(params) { return this['publicGetTickers'](params); }
    publicGetGetInstruments(params) { return this['publicGetGetInstruments'](params); }
    publicGetGetTradingviewChartData(params) { return this['publicGetGetTradingviewChartData'](params); }
    publicGetCmcSpotSummary(params) { return this['publicGetCmcSpotSummary'](params); }
    publicGetCmcSpotTicker(params) { return this['publicGetCmcSpotTicker'](params); }
    publicGetCmcSpotOrderbook(params) { return this['publicGetCmcSpotOrderbook'](params); }
    publicGetCmcMarketTrades(params) { return this['publicGetCmcMarketTrades'](params); }
    publicGetCmcContracts(params) { return this['publicGetCmcContracts'](params); }
    publicGetCmcContractOrderbook(params) { return this['publicGetCmcContractOrderbook'](params); }
    publicGetCoinGeckoSpotPairs(params) { return this['publicGetCoinGeckoSpotPairs'](params); }
    publicGetCoinGeckoSpotTicker(params) { return this['publicGetCoinGeckoSpotTicker'](params); }
    publicGetCoinGeckoSpotOrderbook(params) { return this['publicGetCoinGeckoSpotOrderbook'](params); }
    publicGetCoinGeckoMarketTrades(params) { return this['publicGetCoinGeckoMarketTrades'](params); }
    publicGetCoinGeckoContracts(params) { return this['publicGetCoinGeckoContracts'](params); }
    publicGetCoinGeckoContractOrderbook(params) { return this['publicGetCoinGeckoContractOrderbook'](params); }
    publicGetGetPerpetualLeverageBracket(params) { return this['publicGetGetPerpetualLeverageBracket'](params); }
    publicGetGetPerpetualLeverageBracketAll(params) { return this['publicGetGetPerpetualLeverageBracketAll'](params); }
    publicPostAuth(params) { return this['publicPostAuth'](params); }
    privateGetGetDepositRecord(params) { return this['privateGetGetDepositRecord'](params); }
    privateGetGetWithdrawRecord(params) { return this['privateGetGetWithdrawRecord'](params); }
    privateGetGetPosition(params) { return this['privateGetGetPosition'](params); }
    privateGetGetPositions(params) { return this['privateGetGetPositions'](params); }
    privateGetGetOpenOrdersByCurrency(params) { return this['privateGetGetOpenOrdersByCurrency'](params); }
    privateGetGetOpenOrdersByInstrument(params) { return this['privateGetGetOpenOrdersByInstrument'](params); }
    privateGetGetOrderHistoryByCurrency(params) { return this['privateGetGetOrderHistoryByCurrency'](params); }
    privateGetGetOrderHistoryByInstrument(params) { return this['privateGetGetOrderHistoryByInstrument'](params); }
    privateGetGetOrderState(params) { return this['privateGetGetOrderState'](params); }
    privateGetGetUserTradesByCurrency(params) { return this['privateGetGetUserTradesByCurrency'](params); }
    privateGetGetUserTradesByInstrument(params) { return this['privateGetGetUserTradesByInstrument'](params); }
    privateGetGetUserTradesByOrder(params) { return this['privateGetGetUserTradesByOrder'](params); }
    privateGetGetPerpetualUserConfig(params) { return this['privateGetGetPerpetualUserConfig'](params); }
    privatePostLogout(params) { return this['privatePostLogout'](params); }
    privatePostGetAssetsInfo(params) { return this['privatePostGetAssetsInfo'](params); }
    privatePostAddWithdrawAddress(params) { return this['privatePostAddWithdrawAddress'](params); }
    privatePostBuy(params) { return this['privatePostBuy'](params); }
    privatePostSell(params) { return this['privatePostSell'](params); }
    privatePostCancel(params) { return this['privatePostCancel'](params); }
    privatePostCancelAllByCurrency(params) { return this['privatePostCancelAllByCurrency'](params); }
    privatePostCancelAllByInstrument(params) { return this['privatePostCancelAllByInstrument'](params); }
    privatePostClosePosition(params) { return this['privatePostClosePosition'](params); }
    privatePostAdjustPerpetualLeverage(params) { return this['privatePostAdjustPerpetualLeverage'](params); }
    privatePostAdjustPerpetualMarginType(params) { return this['privatePostAdjustPerpetualMarginType'](params); }
    privatePostSubmitTransfer(params) { return this['privatePostSubmitTransfer'](params); }
}

module.exports = Exchange;
