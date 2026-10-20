'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicSpotGetMarketSymbols(params = {}) {
        return this.request('{market}/symbols', ['public', 'spot'], 'GET', params, { 'cost': 1 });
    }
    publicSpotGetKline(params = {}) {
        return this.request('kline', ['public', 'spot'], 'GET', params, { 'cost': 1 });
    }
    publicSpotGetMarginCurrencies(params = {}) {
        return this.request('margin/currencies', ['public', 'spot'], 'GET', params, { 'cost': 1 });
    }
    publicSpotGetMarginSymbols(params = {}) {
        return this.request('margin/symbols', ['public', 'spot'], 'GET', params, { 'cost': 1 });
    }
    publicSpotGetMarkets(params = {}) {
        return this.request('markets', ['public', 'spot'], 'GET', params, { 'cost': 1 });
    }
    publicSpotGetOrderBook(params = {}) {
        return this.request('order_book', ['public', 'spot'], 'GET', params, { 'cost': 1 });
    }
    publicSpotGetPing(params = {}) {
        return this.request('ping', ['public', 'spot'], 'GET', params, { 'cost': 1 });
    }
    publicSpotGetSpotSymbols(params = {}) {
        return this.request('spot/symbols', ['public', 'spot'], 'GET', params, { 'cost': 1 });
    }
    publicSpotGetTime(params = {}) {
        return this.request('time', ['public', 'spot'], 'GET', params, { 'cost': 1 });
    }
    publicSpotGetTrades(params = {}) {
        return this.request('trades', ['public', 'spot'], 'GET', params, { 'cost': 1 });
    }
    publicSpotGetTradesSymbols(params = {}) {
        return this.request('trades/symbols', ['public', 'spot'], 'GET', params, { 'cost': 1 });
    }
    publicSpotGetTicker(params = {}) {
        return this.request('ticker', ['public', 'spot'], 'GET', params, { 'cost': 1 });
    }
    publicSpotGetCurrencies(params = {}) {
        return this.request('currencies', ['public', 'spot'], 'GET', params, { 'cost': 1 });
    }
    publicSwapGetPublicApiWeight(params = {}) {
        return this.request('public/api_weight', ['public', 'swap'], 'GET', params, { 'cost': 1 });
    }
    publicSwapGetPublicCandles(params = {}) {
        return this.request('public/candles', ['public', 'swap'], 'GET', params, { 'cost': 1 });
    }
    publicSwapGetPublicCandlesHistory(params = {}) {
        return this.request('public/candles_history', ['public', 'swap'], 'GET', params, { 'cost': 1 });
    }
    publicSwapGetPublicDepth(params = {}) {
        return this.request('public/depth', ['public', 'swap'], 'GET', params, { 'cost': 1 });
    }
    publicSwapGetPublicFundingRate(params = {}) {
        return this.request('public/funding_rate', ['public', 'swap'], 'GET', params, { 'cost': 1 });
    }
    publicSwapGetPublicFundingRateHistory(params = {}) {
        return this.request('public/funding_rate_history', ['public', 'swap'], 'GET', params, { 'cost': 1 });
    }
    publicSwapGetPublicInstrument(params = {}) {
        return this.request('public/instrument', ['public', 'swap'], 'GET', params, { 'cost': 1 });
    }
    publicSwapGetPublicInstruments(params = {}) {
        return this.request('public/instruments', ['public', 'swap'], 'GET', params, { 'cost': 1 });
    }
    publicSwapGetPublicTicker(params = {}) {
        return this.request('public/ticker', ['public', 'swap'], 'GET', params, { 'cost': 1 });
    }
    publicSwapGetPublicTickers(params = {}) {
        return this.request('public/tickers', ['public', 'swap'], 'GET', params, { 'cost': 1 });
    }
    publicSwapGetPublicTime(params = {}) {
        return this.request('public/time', ['public', 'swap'], 'GET', params, { 'cost': 1 });
    }
    publicSwapGetPublicTrades(params = {}) {
        return this.request('public/trades', ['public', 'swap'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetMarketFinancelog(params = {}) {
        return this.request('{market}/financelog', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetMarketMytrades(params = {}) {
        return this.request('{market}/mytrades', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetMarketOrder(params = {}) {
        return this.request('{market}/order', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetMarketOrderDetail(params = {}) {
        return this.request('{market}/order/detail', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetMarketOrderCurrent(params = {}) {
        return this.request('{market}/order/current', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetMarketOrderHistory(params = {}) {
        return this.request('{market}/order/history', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetMarginAssets(params = {}) {
        return this.request('margin/assets', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetMarginFinancelog(params = {}) {
        return this.request('margin/financelog', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetMarginMytrades(params = {}) {
        return this.request('margin/mytrades', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetMarginOrder(params = {}) {
        return this.request('margin/order', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetMarginOrderCurrent(params = {}) {
        return this.request('margin/order/current', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetMarginOrderHistory(params = {}) {
        return this.request('margin/order/history', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetMarginPositions(params = {}) {
        return this.request('margin/positions', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetOtcFinancelog(params = {}) {
        return this.request('otc/financelog', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetSpotAssets(params = {}) {
        return this.request('spot/assets', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetSpotFinancelog(params = {}) {
        return this.request('spot/financelog', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetSpotMytrades(params = {}) {
        return this.request('spot/mytrades', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetSpotOrder(params = {}) {
        return this.request('spot/order', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetSpotOrderCurrent(params = {}) {
        return this.request('spot/order/current', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetSpotOrderHistory(params = {}) {
        return this.request('spot/order/history', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetDepositAddress(params = {}) {
        return this.request('deposit/address', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetDepositHistory(params = {}) {
        return this.request('deposit/history', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotGetWithdrawHistory(params = {}) {
        return this.request('withdraw/history', ['private', 'spot'], 'GET', params, { 'cost': 1 });
    }
    privateSpotPostMarketOrderCancel(params = {}) {
        return this.request('{market}/order/cancel', ['private', 'spot'], 'POST', params, { 'cost': 1 });
    }
    privateSpotPostMarketOrderNew(params = {}) {
        return this.request('{market}/order/new', ['private', 'spot'], 'POST', params, { 'cost': 1 });
    }
    privateSpotPostMarketOrderBatchNew(params = {}) {
        return this.request('{market}/order/batch_new', ['private', 'spot'], 'POST', params, { 'cost': 1 });
    }
    privateSpotPostMarginOrderCancel(params = {}) {
        return this.request('margin/order/cancel', ['private', 'spot'], 'POST', params, { 'cost': 1 });
    }
    privateSpotPostMarginOrderNew(params = {}) {
        return this.request('margin/order/new', ['private', 'spot'], 'POST', params, { 'cost': 1 });
    }
    privateSpotPostMarginPositionClose(params = {}) {
        return this.request('margin/position/close', ['private', 'spot'], 'POST', params, { 'cost': 1 });
    }
    privateSpotPostSpotOrderCancel(params = {}) {
        return this.request('spot/order/cancel', ['private', 'spot'], 'POST', params, { 'cost': 1 });
    }
    privateSpotPostSpotOrderNew(params = {}) {
        return this.request('spot/order/new', ['private', 'spot'], 'POST', params, { 'cost': 1 });
    }
    privateSpotPostTransfer(params = {}) {
        return this.request('transfer', ['private', 'spot'], 'POST', params, { 'cost': 1 });
    }
    privateSpotPostWithdrawNew(params = {}) {
        return this.request('withdraw/new', ['private', 'spot'], 'POST', params, { 'cost': 1 });
    }
    privateSpotPostWithdrawCancel(params = {}) {
        return this.request('withdraw/cancel', ['private', 'spot'], 'POST', params, { 'cost': 1 });
    }
    privateSwapGetAccountBalance(params = {}) {
        return this.request('account/balance', ['private', 'swap'], 'GET', params, { 'cost': 1 });
    }
    privateSwapGetAccountPositions(params = {}) {
        return this.request('account/positions', ['private', 'swap'], 'GET', params, { 'cost': 1 });
    }
    privateSwapGetAccountFinanceRecord(params = {}) {
        return this.request('account/finance_record', ['private', 'swap'], 'GET', params, { 'cost': 1 });
    }
    privateSwapGetAccountTradingFeeRate(params = {}) {
        return this.request('account/trading_fee_rate', ['private', 'swap'], 'GET', params, { 'cost': 1 });
    }
    privateSwapGetAccountTransferRecord(params = {}) {
        return this.request('account/transfer_record', ['private', 'swap'], 'GET', params, { 'cost': 1 });
    }
    privateSwapGetAccountFundingFee(params = {}) {
        return this.request('account/funding_fee', ['private', 'swap'], 'GET', params, { 'cost': 1 });
    }
    privateSwapGetTradeHistoryOrders(params = {}) {
        return this.request('trade/history_orders', ['private', 'swap'], 'GET', params, { 'cost': 1 });
    }
    privateSwapGetTradeHistoryTrades(params = {}) {
        return this.request('trade/history_trades', ['private', 'swap'], 'GET', params, { 'cost': 1 });
    }
    privateSwapGetTradeOpenOrders(params = {}) {
        return this.request('trade/open_orders', ['private', 'swap'], 'GET', params, { 'cost': 1 });
    }
    privateSwapGetTradeOrderInfo(params = {}) {
        return this.request('trade/order_info', ['private', 'swap'], 'GET', params, { 'cost': 1 });
    }
    privateSwapPostAccountTransfer(params = {}) {
        return this.request('account/transfer', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
    privateSwapPostAccountLeverage(params = {}) {
        return this.request('account/leverage', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
    privateSwapPostAccountPositionMode(params = {}) {
        return this.request('account/position_mode', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
    privateSwapPostAccountPositionMargin(params = {}) {
        return this.request('account/position_margin', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
    privateSwapPostTradeBatchCancelOrder(params = {}) {
        return this.request('trade/batch_cancel_order', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
    privateSwapPostTradeBatchOrder(params = {}) {
        return this.request('trade/batch_order', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
    privateSwapPostTradeCancelOrder(params = {}) {
        return this.request('trade/cancel_order', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
    privateSwapPostTradeOrderPlace(params = {}) {
        return this.request('trade/order_place', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
    privateSwapPostFollowSponsorOrder(params = {}) {
        return this.request('follow/sponsor_order', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
    privateSwapPostFollowCloseOrder(params = {}) {
        return this.request('follow/close_order', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
    privateSwapPostFollowCancelOrder(params = {}) {
        return this.request('follow/cancel_order', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
    privateSwapPostFollowUserCenterCurrent(params = {}) {
        return this.request('follow/user_center_current', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
    privateSwapPostFollowUserCenterHistory(params = {}) {
        return this.request('follow/user_center_history', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
    privateSwapPostFollowExpertCurrentOpenOrder(params = {}) {
        return this.request('follow/expert_current_open_order', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
    privateSwapPostFollowAddAlgo(params = {}) {
        return this.request('follow/add_algo', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
    privateSwapPostFollowCancelAlgo(params = {}) {
        return this.request('follow/cancel_algo', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
    privateSwapPostFollowAccountAvailable(params = {}) {
        return this.request('follow/account_available', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
    privateSwapPostFollowPlanTask(params = {}) {
        return this.request('follow/plan_task', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
    privateSwapPostFollowInstrumentList(params = {}) {
        return this.request('follow/instrument_list', ['private', 'swap'], 'POST', params, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
