'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicSpotGetCurrencies(params = {}) {
        return this.request('currencies', ['public', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicSpotGetDepth(params = {}) {
        return this.request('depth', ['public', 'spot'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicSpotGetKline(params = {}) {
        return this.request('kline', ['public', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicSpotGetSymbol(params = {}) {
        return this.request('symbol', ['public', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicSpotGetTicker(params = {}) {
        return this.request('ticker', ['public', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicSpotGetTickerBook(params = {}) {
        return this.request('ticker/book', ['public', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicSpotGetTickerPrice(params = {}) {
        return this.request('ticker/price', ['public', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicSpotGetTicker24h(params = {}) {
        return this.request('ticker/24h', ['public', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicSpotGetTime(params = {}) {
        return this.request('time', ['public', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicSpotGetTradeHistory(params = {}) {
        return this.request('trade/history', ['public', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicSpotGetTradeRecent(params = {}) {
        return this.request('trade/recent', ['public', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicSpotGetWalletSupportCurrency(params = {}) {
        return this.request('wallet/support/currency', ['public', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicContractRiskBalance(params = {}) {
        return this.request('future/market/v1/public/contract/risk-balance', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicContractOpenInterest(params = {}) {
        return this.request('future/market/v1/public/contract/open-interest', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicLeverageBracketDetail(params = {}) {
        return this.request('future/market/v1/public/leverage/bracket/detail', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicLeverageBracketList(params = {}) {
        return this.request('future/market/v1/public/leverage/bracket/list', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicQAggTicker(params = {}) {
        return this.request('future/market/v1/public/q/agg-ticker', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicQAggTickers(params = {}) {
        return this.request('future/market/v1/public/q/agg-tickers', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicQDeal(params = {}) {
        return this.request('future/market/v1/public/q/deal', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicQDepth(params = {}) {
        return this.request('future/market/v1/public/q/depth', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicQFundingRate(params = {}) {
        return this.request('future/market/v1/public/q/funding-rate', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicQFundingRateRecord(params = {}) {
        return this.request('future/market/v1/public/q/funding-rate-record', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicQIndexPrice(params = {}) {
        return this.request('future/market/v1/public/q/index-price', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicQKline(params = {}) {
        return this.request('future/market/v1/public/q/kline', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicQMarkPrice(params = {}) {
        return this.request('future/market/v1/public/q/mark-price', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicQSymbolIndexPrice(params = {}) {
        return this.request('future/market/v1/public/q/symbol-index-price', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicQSymbolMarkPrice(params = {}) {
        return this.request('future/market/v1/public/q/symbol-mark-price', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicQTicker(params = {}) {
        return this.request('future/market/v1/public/q/ticker', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicQTickerBooks(params = {}) {
        return this.request('future/market/v1/public/q/ticker/books', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicQTickers(params = {}) {
        return this.request('future/market/v1/public/q/tickers', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicLinearGetFutureMarketV1PublicSymbolCoins(params = {}) {
        return this.request('future/market/v1/public/symbol/coins', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 3.33 });
    }
    publicLinearGetFutureMarketV1PublicSymbolDetail(params = {}) {
        return this.request('future/market/v1/public/symbol/detail', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 3.33 });
    }
    publicLinearGetFutureMarketV1PublicSymbolList(params = {}) {
        return this.request('future/market/v1/public/symbol/list', ['public', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicContractRiskBalance(params = {}) {
        return this.request('future/market/v1/public/contract/risk-balance', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicContractOpenInterest(params = {}) {
        return this.request('future/market/v1/public/contract/open-interest', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicLeverageBracketDetail(params = {}) {
        return this.request('future/market/v1/public/leverage/bracket/detail', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicLeverageBracketList(params = {}) {
        return this.request('future/market/v1/public/leverage/bracket/list', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicQAggTicker(params = {}) {
        return this.request('future/market/v1/public/q/agg-ticker', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicQAggTickers(params = {}) {
        return this.request('future/market/v1/public/q/agg-tickers', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicQDeal(params = {}) {
        return this.request('future/market/v1/public/q/deal', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicQDepth(params = {}) {
        return this.request('future/market/v1/public/q/depth', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicQFundingRate(params = {}) {
        return this.request('future/market/v1/public/q/funding-rate', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicQFundingRateRecord(params = {}) {
        return this.request('future/market/v1/public/q/funding-rate-record', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicQIndexPrice(params = {}) {
        return this.request('future/market/v1/public/q/index-price', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicQKline(params = {}) {
        return this.request('future/market/v1/public/q/kline', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicQMarkPrice(params = {}) {
        return this.request('future/market/v1/public/q/mark-price', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicQSymbolIndexPrice(params = {}) {
        return this.request('future/market/v1/public/q/symbol-index-price', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicQSymbolMarkPrice(params = {}) {
        return this.request('future/market/v1/public/q/symbol-mark-price', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicQTicker(params = {}) {
        return this.request('future/market/v1/public/q/ticker', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicQTickerBooks(params = {}) {
        return this.request('future/market/v1/public/q/ticker/books', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicQTickers(params = {}) {
        return this.request('future/market/v1/public/q/tickers', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicInverseGetFutureMarketV1PublicSymbolCoins(params = {}) {
        return this.request('future/market/v1/public/symbol/coins', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 3.33 });
    }
    publicInverseGetFutureMarketV1PublicSymbolDetail(params = {}) {
        return this.request('future/market/v1/public/symbol/detail', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 3.33 });
    }
    publicInverseGetFutureMarketV1PublicSymbolList(params = {}) {
        return this.request('future/market/v1/public/symbol/list', ['public', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateSpotGetBalance(params = {}) {
        return this.request('balance', ['private', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateSpotGetBalances(params = {}) {
        return this.request('balances', ['private', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateSpotGetBatchOrder(params = {}) {
        return this.request('batch-order', ['private', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateSpotGetDepositAddress(params = {}) {
        return this.request('deposit/address', ['private', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateSpotGetDepositHistory(params = {}) {
        return this.request('deposit/history', ['private', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateSpotGetHistoryOrder(params = {}) {
        return this.request('history-order', ['private', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateSpotGetOpenOrder(params = {}) {
        return this.request('open-order', ['private', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateSpotGetOrder(params = {}) {
        return this.request('order', ['private', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateSpotGetOrderOrderId(params = {}) {
        return this.request('order/{orderId}', ['private', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateSpotGetTrade(params = {}) {
        return this.request('trade', ['private', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateSpotGetWithdrawHistory(params = {}) {
        return this.request('withdraw/history', ['private', 'spot'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateSpotPostOrder(params = {}) {
        return this.request('order', ['private', 'spot'], 'POST', params, undefined, undefined, { 'cost': 0.2 });
    }
    privateSpotPostWithdraw(params = {}) {
        return this.request('withdraw', ['private', 'spot'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privateSpotPostBalanceTransfer(params = {}) {
        return this.request('balance/transfer', ['private', 'spot'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateSpotPostBalanceAccountTransfer(params = {}) {
        return this.request('balance/account/transfer', ['private', 'spot'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateSpotPostWsToken(params = {}) {
        return this.request('ws-token', ['private', 'spot'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateSpotDeleteBatchOrder(params = {}) {
        return this.request('batch-order', ['private', 'spot'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateSpotDeleteOpenOrder(params = {}) {
        return this.request('open-order', ['private', 'spot'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateSpotDeleteOrderOrderId(params = {}) {
        return this.request('order/{orderId}', ['private', 'spot'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateSpotPutOrderOrderId(params = {}) {
        return this.request('order/{orderId}', ['private', 'spot'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureCopytradeUserV1CopyTradeCurrentFollowingV2(params = {}) {
        return this.request('future/copytrade/user/v1/copy-trade/current-following-v2', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureCopytradeUserV1CopyTradeFollowerBalanceBill(params = {}) {
        return this.request('future/copytrade/user/v1/copy-trade/follower-balance-bill', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureCopytradeUserV1CopyTradeFollowerPosition(params = {}) {
        return this.request('future/copytrade/user/v1/copy-trade/follower-position', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1EntrustPlanDetail(params = {}) {
        return this.request('future/trade/v1/entrust/plan-detail', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1EntrustPlanList(params = {}) {
        return this.request('future/trade/v1/entrust/plan-list', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1EntrustPlanListHistory(params = {}) {
        return this.request('future/trade/v1/entrust/plan-list-history', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1EntrustProfitDetail(params = {}) {
        return this.request('future/trade/v1/entrust/profit-detail', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1EntrustProfitList(params = {}) {
        return this.request('future/trade/v1/entrust/profit-list', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1EntrustProfitListHistory(params = {}) {
        return this.request('future/trade/v1/entrust/profit-list-history', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1EntrustReversePlanList(params = {}) {
        return this.request('future/trade/v1/entrust/reverse-plan-list', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1EntrustReversePlanListHistory(params = {}) {
        return this.request('future/trade/v1/entrust/reverse-plan-list-history', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1EntrustTrackDetail(params = {}) {
        return this.request('future/trade/v1/entrust/track-detail', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1EntrustTrackList(params = {}) {
        return this.request('future/trade/v1/entrust/track-list', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1EntrustTrackListHistory(params = {}) {
        return this.request('future/trade/v1/entrust/track-list-history', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1OrderEntrustList(params = {}) {
        return this.request('future/trade/v1/order-entrust/list', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1OrderDetail(params = {}) {
        return this.request('future/trade/v1/order/detail', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1OrderList(params = {}) {
        return this.request('future/trade/v1/order/list', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1OrderListHistory(params = {}) {
        return this.request('future/trade/v1/order/list-history', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1OrderTradeHistory(params = {}) {
        return this.request('future/trade/v1/order/trade-history', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1PositionListHistory(params = {}) {
        return this.request('future/trade/v1/position/list-history', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1PositionCrossMarginSymbol(params = {}) {
        return this.request('future/trade/v1/position/cross-margin/{symbol}', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1PositionLeverageList(params = {}) {
        return this.request('future/trade/v1/position/leverage/list', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1PositionListActive(params = {}) {
        return this.request('future/trade/v1/position/list/active', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1OrderTradeList(params = {}) {
        return this.request('future/trade/v1/order/trade-list', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureTradeV1OrderTradeListAll(params = {}) {
        return this.request('future/trade/v1/order/trade-list-all', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureUserV1AccountInfo(params = {}) {
        return this.request('future/user/v1/account/info', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureUserV1AutoDeleverageHistory(params = {}) {
        return this.request('future/user/v1/auto-deleverage/history', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureUserV1BalanceBills(params = {}) {
        return this.request('future/user/v1/balance/bills', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureUserV1BalanceDetail(params = {}) {
        return this.request('future/user/v1/balance/detail', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureUserV1BalanceFundingRateList(params = {}) {
        return this.request('future/user/v1/balance/funding-rate-list', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureUserV1BalanceList(params = {}) {
        return this.request('future/user/v1/balance/list', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureUserV1CompatBalanceCoin(params = {}) {
        return this.request('future/user/v1/compat/balance/{coin}', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureUserV1PositionAdl(params = {}) {
        return this.request('future/user/v1/position/adl', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureUserV1PositionBreakList(params = {}) {
        return this.request('future/user/v1/position/break-list', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureUserV1PositionList(params = {}) {
        return this.request('future/user/v1/position/list', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureUserV1TakerOverList(params = {}) {
        return this.request('future/user/v1/taker-over/list', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureUserV1UserStepRate(params = {}) {
        return this.request('future/user/v1/user/step-rate', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureUserV1UserCollectionList(params = {}) {
        return this.request('future/user/v1/user/collection/list', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearGetFutureUserV1UserListenKey(params = {}) {
        return this.request('future/user/v1/user/listen-key', ['private', 'linear'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureTradeV1EntrustCancelAllPlan(params = {}) {
        return this.request('future/trade/v1/entrust/cancel-all-plan', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureTradeV1EntrustCancelAllProfitStop(params = {}) {
        return this.request('future/trade/v1/entrust/cancel-all-profit-stop', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureTradeV1EntrustCancelAllTrack(params = {}) {
        return this.request('future/trade/v1/entrust/cancel-all-track', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureTradeV1EntrustCancelPlan(params = {}) {
        return this.request('future/trade/v1/entrust/cancel-plan', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureTradeV1EntrustCancelProfitStop(params = {}) {
        return this.request('future/trade/v1/entrust/cancel-profit-stop', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureTradeV1EntrustCreatePlan(params = {}) {
        return this.request('future/trade/v1/entrust/create-plan', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureTradeV1EntrustCancelTrack(params = {}) {
        return this.request('future/trade/v1/entrust/cancel-track', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureTradeV1EntrustCreateProfit(params = {}) {
        return this.request('future/trade/v1/entrust/create-profit', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureTradeV1EntrustCreateTrack(params = {}) {
        return this.request('future/trade/v1/entrust/create-track', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureTradeV1EntrustUpdateProfitStop(params = {}) {
        return this.request('future/trade/v1/entrust/update-profit-stop', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureTradeV1OrderCancel(params = {}) {
        return this.request('future/trade/v1/order/cancel', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureTradeV1OrderCancelAll(params = {}) {
        return this.request('future/trade/v1/order/cancel-all', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureTradeV1OrderCreate(params = {}) {
        return this.request('future/trade/v1/order/create', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureTradeV1OrderCreateBatch(params = {}) {
        return this.request('future/trade/v1/order/create-batch', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureTradeV1OrderUpdate(params = {}) {
        return this.request('future/trade/v1/order/update', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureUserV1AccountOpen(params = {}) {
        return this.request('future/user/v1/account/open', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureUserV1PositionAdjustLeverage(params = {}) {
        return this.request('future/user/v1/position/adjust-leverage', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureUserV1PositionAutoMargin(params = {}) {
        return this.request('future/user/v1/position/auto-margin', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureUserV1PositionCloseAll(params = {}) {
        return this.request('future/user/v1/position/close-all', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureUserV1PositionMargin(params = {}) {
        return this.request('future/user/v1/position/margin', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureUserV1UserCollectionAdd(params = {}) {
        return this.request('future/user/v1/user/collection/add', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureUserV1UserCollectionCancel(params = {}) {
        return this.request('future/user/v1/user/collection/cancel', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateLinearPostFutureUserV1PositionChangeType(params = {}) {
        return this.request('future/user/v1/position/change-type', ['private', 'linear'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1EntrustPlanDetail(params = {}) {
        return this.request('future/trade/v1/entrust/plan-detail', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1EntrustPlanList(params = {}) {
        return this.request('future/trade/v1/entrust/plan-list', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1EntrustPlanListHistory(params = {}) {
        return this.request('future/trade/v1/entrust/plan-list-history', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1EntrustProfitDetail(params = {}) {
        return this.request('future/trade/v1/entrust/profit-detail', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1EntrustProfitList(params = {}) {
        return this.request('future/trade/v1/entrust/profit-list', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1EntrustProfitListHistory(params = {}) {
        return this.request('future/trade/v1/entrust/profit-list-history', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1EntrustReversePlanList(params = {}) {
        return this.request('future/trade/v1/entrust/reverse-plan-list', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1EntrustReversePlanListHistory(params = {}) {
        return this.request('future/trade/v1/entrust/reverse-plan-list-history', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1EntrustTrackDetail(params = {}) {
        return this.request('future/trade/v1/entrust/track-detail', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1EntrustTrackList(params = {}) {
        return this.request('future/trade/v1/entrust/track-list', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1EntrustTrackListHistory(params = {}) {
        return this.request('future/trade/v1/entrust/track-list-history', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1OrderEntrustList(params = {}) {
        return this.request('future/trade/v1/order-entrust/list', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1OrderDetail(params = {}) {
        return this.request('future/trade/v1/order/detail', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1OrderList(params = {}) {
        return this.request('future/trade/v1/order/list', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1OrderListHistory(params = {}) {
        return this.request('future/trade/v1/order/list-history', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1OrderTradeHistory(params = {}) {
        return this.request('future/trade/v1/order/trade-history', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1PositionListHistory(params = {}) {
        return this.request('future/trade/v1/position/list-history', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1PositionCrossMarginSymbol(params = {}) {
        return this.request('future/trade/v1/position/cross-margin/{symbol}', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1PositionLeverageList(params = {}) {
        return this.request('future/trade/v1/position/leverage/list', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1PositionListActive(params = {}) {
        return this.request('future/trade/v1/position/list/active', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1OrderTradeList(params = {}) {
        return this.request('future/trade/v1/order/trade-list', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureTradeV1OrderTradeListAll(params = {}) {
        return this.request('future/trade/v1/order/trade-list-all', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureUserV1AccountInfo(params = {}) {
        return this.request('future/user/v1/account/info', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureUserV1AutoDeleverageHistory(params = {}) {
        return this.request('future/user/v1/auto-deleverage/history', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureUserV1BalanceBills(params = {}) {
        return this.request('future/user/v1/balance/bills', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureUserV1BalanceDetail(params = {}) {
        return this.request('future/user/v1/balance/detail', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureUserV1BalanceFundingRateList(params = {}) {
        return this.request('future/user/v1/balance/funding-rate-list', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureUserV1BalanceList(params = {}) {
        return this.request('future/user/v1/balance/list', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureUserV1CompatBalanceCoin(params = {}) {
        return this.request('future/user/v1/compat/balance/{coin}', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureUserV1PositionAdl(params = {}) {
        return this.request('future/user/v1/position/adl', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureUserV1PositionBreakList(params = {}) {
        return this.request('future/user/v1/position/break-list', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureUserV1PositionList(params = {}) {
        return this.request('future/user/v1/position/list', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureUserV1TakerOverList(params = {}) {
        return this.request('future/user/v1/taker-over/list', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureUserV1UserStepRate(params = {}) {
        return this.request('future/user/v1/user/step-rate', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureUserV1UserCollectionList(params = {}) {
        return this.request('future/user/v1/user/collection/list', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInverseGetFutureUserV1UserListenKey(params = {}) {
        return this.request('future/user/v1/user/listen-key', ['private', 'inverse'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureTradeV1EntrustCancelAllPlan(params = {}) {
        return this.request('future/trade/v1/entrust/cancel-all-plan', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureTradeV1EntrustCancelAllProfitStop(params = {}) {
        return this.request('future/trade/v1/entrust/cancel-all-profit-stop', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureTradeV1EntrustCancelAllTrack(params = {}) {
        return this.request('future/trade/v1/entrust/cancel-all-track', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureTradeV1EntrustCancelPlan(params = {}) {
        return this.request('future/trade/v1/entrust/cancel-plan', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureTradeV1EntrustCancelProfitStop(params = {}) {
        return this.request('future/trade/v1/entrust/cancel-profit-stop', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureTradeV1EntrustCreatePlan(params = {}) {
        return this.request('future/trade/v1/entrust/create-plan', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureTradeV1EntrustCancelTrack(params = {}) {
        return this.request('future/trade/v1/entrust/cancel-track', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureTradeV1EntrustCreateProfit(params = {}) {
        return this.request('future/trade/v1/entrust/create-profit', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureTradeV1EntrustCreateTrack(params = {}) {
        return this.request('future/trade/v1/entrust/create-track', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureTradeV1EntrustUpdateProfitStop(params = {}) {
        return this.request('future/trade/v1/entrust/update-profit-stop', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureTradeV1OrderCancel(params = {}) {
        return this.request('future/trade/v1/order/cancel', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureTradeV1OrderCancelAll(params = {}) {
        return this.request('future/trade/v1/order/cancel-all', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureTradeV1OrderCreate(params = {}) {
        return this.request('future/trade/v1/order/create', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureTradeV1OrderCreateBatch(params = {}) {
        return this.request('future/trade/v1/order/create-batch', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureTradeV1OrderUpdate(params = {}) {
        return this.request('future/trade/v1/order/update', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureUserV1AccountOpen(params = {}) {
        return this.request('future/user/v1/account/open', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureUserV1PositionAdjustLeverage(params = {}) {
        return this.request('future/user/v1/position/adjust-leverage', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureUserV1PositionAutoMargin(params = {}) {
        return this.request('future/user/v1/position/auto-margin', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureUserV1PositionCloseAll(params = {}) {
        return this.request('future/user/v1/position/close-all', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureUserV1PositionMargin(params = {}) {
        return this.request('future/user/v1/position/margin', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureUserV1UserCollectionAdd(params = {}) {
        return this.request('future/user/v1/user/collection/add', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureUserV1UserCollectionCancel(params = {}) {
        return this.request('future/user/v1/user/collection/cancel', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateInversePostFutureUserV1PositionChangeType(params = {}) {
        return this.request('future/user/v1/position/change-type', ['private', 'inverse'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateUserGetUserAccount(params = {}) {
        return this.request('user/account', ['private', 'user'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateUserGetUserAccountApiKey(params = {}) {
        return this.request('user/account/api-key', ['private', 'user'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateUserPostUserAccount(params = {}) {
        return this.request('user/account', ['private', 'user'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateUserPostUserAccountApiKey(params = {}) {
        return this.request('user/account/api-key', ['private', 'user'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateUserPutUserAccountApiKey(params = {}) {
        return this.request('user/account/api-key', ['private', 'user'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    privateUserDeleteUserAccountApiKeyId(params = {}) {
        return this.request('user/account/{apiKeyId}', ['private', 'user'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
