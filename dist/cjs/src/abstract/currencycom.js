'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetV1Time(params) { return this['publicGetV1Time'](params); }
    publicGetV1ExchangeInfo(params) { return this['publicGetV1ExchangeInfo'](params); }
    publicGetV1Depth(params) { return this['publicGetV1Depth'](params); }
    publicGetV1AggTrades(params) { return this['publicGetV1AggTrades'](params); }
    publicGetV1Klines(params) { return this['publicGetV1Klines'](params); }
    publicGetV1Ticker24hr(params) { return this['publicGetV1Ticker24hr'](params); }
    publicGetV2Time(params) { return this['publicGetV2Time'](params); }
    publicGetV2ExchangeInfo(params) { return this['publicGetV2ExchangeInfo'](params); }
    publicGetV2Depth(params) { return this['publicGetV2Depth'](params); }
    publicGetV2AggTrades(params) { return this['publicGetV2AggTrades'](params); }
    publicGetV2Klines(params) { return this['publicGetV2Klines'](params); }
    publicGetV2Ticker24hr(params) { return this['publicGetV2Ticker24hr'](params); }
    marketcapGetV1Assets(params) { return this['marketcapGetV1Assets'](params); }
    marketcapGetV1Candles(params) { return this['marketcapGetV1Candles'](params); }
    marketcapGetV1Orderbook(params) { return this['marketcapGetV1Orderbook'](params); }
    marketcapGetV1Summary(params) { return this['marketcapGetV1Summary'](params); }
    marketcapGetV1Ticker(params) { return this['marketcapGetV1Ticker'](params); }
    marketcapGetV1TokenAssets(params) { return this['marketcapGetV1TokenAssets'](params); }
    marketcapGetV1TokenOrderbook(params) { return this['marketcapGetV1TokenOrderbook'](params); }
    marketcapGetV1TokenSummary(params) { return this['marketcapGetV1TokenSummary'](params); }
    marketcapGetV1TokenTicker(params) { return this['marketcapGetV1TokenTicker'](params); }
    marketcapGetV1TokenTrades(params) { return this['marketcapGetV1TokenTrades'](params); }
    marketcapGetV1TokenCryptoOHLC(params) { return this['marketcapGetV1TokenCryptoOHLC'](params); }
    marketcapGetV1TokenCryptoAssets(params) { return this['marketcapGetV1TokenCryptoAssets'](params); }
    marketcapGetV1TokenCryptoOrderbook(params) { return this['marketcapGetV1TokenCryptoOrderbook'](params); }
    marketcapGetV1TokenCryptoSummary(params) { return this['marketcapGetV1TokenCryptoSummary'](params); }
    marketcapGetV1TokenCryptoTicker(params) { return this['marketcapGetV1TokenCryptoTicker'](params); }
    marketcapGetV1TokenCryptoTrades(params) { return this['marketcapGetV1TokenCryptoTrades'](params); }
    marketcapGetV1Trades(params) { return this['marketcapGetV1Trades'](params); }
    privateGetV1Account(params) { return this['privateGetV1Account'](params); }
    privateGetV1Currencies(params) { return this['privateGetV1Currencies'](params); }
    privateGetV1Deposits(params) { return this['privateGetV1Deposits'](params); }
    privateGetV1DepositAddress(params) { return this['privateGetV1DepositAddress'](params); }
    privateGetV1Ledger(params) { return this['privateGetV1Ledger'](params); }
    privateGetV1LeverageSettings(params) { return this['privateGetV1LeverageSettings'](params); }
    privateGetV1MyTrades(params) { return this['privateGetV1MyTrades'](params); }
    privateGetV1OpenOrders(params) { return this['privateGetV1OpenOrders'](params); }
    privateGetV1TradingPositions(params) { return this['privateGetV1TradingPositions'](params); }
    privateGetV1TradingPositionsHistory(params) { return this['privateGetV1TradingPositionsHistory'](params); }
    privateGetV1Transactions(params) { return this['privateGetV1Transactions'](params); }
    privateGetV1Withdrawals(params) { return this['privateGetV1Withdrawals'](params); }
    privateGetV2Account(params) { return this['privateGetV2Account'](params); }
    privateGetV2Currencies(params) { return this['privateGetV2Currencies'](params); }
    privateGetV2Deposits(params) { return this['privateGetV2Deposits'](params); }
    privateGetV2DepositAddress(params) { return this['privateGetV2DepositAddress'](params); }
    privateGetV2Ledger(params) { return this['privateGetV2Ledger'](params); }
    privateGetV2LeverageSettings(params) { return this['privateGetV2LeverageSettings'](params); }
    privateGetV2MyTrades(params) { return this['privateGetV2MyTrades'](params); }
    privateGetV2OpenOrders(params) { return this['privateGetV2OpenOrders'](params); }
    privateGetV2TradingPositions(params) { return this['privateGetV2TradingPositions'](params); }
    privateGetV2TradingPositionsHistory(params) { return this['privateGetV2TradingPositionsHistory'](params); }
    privateGetV2Transactions(params) { return this['privateGetV2Transactions'](params); }
    privateGetV2Withdrawals(params) { return this['privateGetV2Withdrawals'](params); }
    privatePostV1Order(params) { return this['privatePostV1Order'](params); }
    privatePostV1UpdateTradingPosition(params) { return this['privatePostV1UpdateTradingPosition'](params); }
    privatePostV1UpdateTradingOrder(params) { return this['privatePostV1UpdateTradingOrder'](params); }
    privatePostV1CloseTradingPosition(params) { return this['privatePostV1CloseTradingPosition'](params); }
    privatePostV2Order(params) { return this['privatePostV2Order'](params); }
    privatePostV2UpdateTradingPosition(params) { return this['privatePostV2UpdateTradingPosition'](params); }
    privatePostV2UpdateTradingOrder(params) { return this['privatePostV2UpdateTradingOrder'](params); }
    privatePostV2CloseTradingPosition(params) { return this['privatePostV2CloseTradingPosition'](params); }
    privateDeleteV1Order(params) { return this['privateDeleteV1Order'](params); }
    privateDeleteV2Order(params) { return this['privateDeleteV2Order'](params); }
}

module.exports = Exchange;
