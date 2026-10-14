'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    fundV1PrivateGetAccountBalance(params = {}) {
        return this.request('account/balance', ['fund', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV1PublicGetServerTime(params = {}) {
        return this.request('server/time', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV1PublicGetCommonSymbols(params = {}) {
        return this.request('common/symbols', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV1PublicGetMarketTrades(params = {}) {
        return this.request('market/trades', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV1PublicGetMarketDepth(params = {}) {
        return this.request('market/depth', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV1PublicGetMarketKline(params = {}) {
        return this.request('market/kline', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV1PublicGetTicker24hr(params = {}) {
        return this.request('ticker/24hr', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV1PublicGetTickerPrice(params = {}) {
        return this.request('ticker/price', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV1PublicGetTickerBookTicker(params = {}) {
        return this.request('ticker/bookTicker', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV1PrivateGetTradeQuery(params = {}) {
        return this.request('trade/query', ['spot', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV1PrivateGetTradeOpenOrders(params = {}) {
        return this.request('trade/openOrders', ['spot', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV1PrivateGetTradeHistoryOrders(params = {}) {
        return this.request('trade/historyOrders', ['spot', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV1PrivateGetTradeMyTrades(params = {}) {
        return this.request('trade/myTrades', ['spot', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    spotV1PrivateGetUserCommissionRate(params = {}) {
        return this.request('user/commissionRate', ['spot', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    spotV1PrivateGetAccountBalance(params = {}) {
        return this.request('account/balance', ['spot', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    spotV1PrivateGetOcoOrderList(params = {}) {
        return this.request('oco/orderList', ['spot', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    spotV1PrivateGetOcoOpenOrderList(params = {}) {
        return this.request('oco/openOrderList', ['spot', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    spotV1PrivateGetOcoHistoryOrderList(params = {}) {
        return this.request('oco/historyOrderList', ['spot', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    spotV1PrivatePostTradeOrder(params = {}) {
        return this.request('trade/order', ['spot', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    spotV1PrivatePostTradeCancel(params = {}) {
        return this.request('trade/cancel', ['spot', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    spotV1PrivatePostTradeBatchOrders(params = {}) {
        return this.request('trade/batchOrders', ['spot', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    spotV1PrivatePostTradeOrderCancelReplace(params = {}) {
        return this.request('trade/order/cancelReplace', ['spot', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    spotV1PrivatePostTradeCancelOrders(params = {}) {
        return this.request('trade/cancelOrders', ['spot', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    spotV1PrivatePostTradeCancelOpenOrders(params = {}) {
        return this.request('trade/cancelOpenOrders', ['spot', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    spotV1PrivatePostTradeCancelAllAfter(params = {}) {
        return this.request('trade/cancelAllAfter', ['spot', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    spotV1PrivatePostOcoOrder(params = {}) {
        return this.request('oco/order', ['spot', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    spotV1PrivatePostOcoCancel(params = {}) {
        return this.request('oco/cancel', ['spot', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    spotV2PublicGetMarketDepth(params = {}) {
        return this.request('market/depth', ['spot', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV2PublicGetMarketKline(params = {}) {
        return this.request('market/kline', ['spot', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV2PublicGetTickerPrice(params = {}) {
        return this.request('ticker/price', ['spot', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV2PublicGetQuoteBookTicker(params = {}) {
        return this.request('quote/bookTicker', ['spot', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV2PublicGetQuoteDepth(params = {}) {
        return this.request('quote/depth', ['spot', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV2PublicGetQuoteHistoricalKlines(params = {}) {
        return this.request('quote/historicalKlines', ['spot', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV2PublicGetQuoteHistoricalTrades(params = {}) {
        return this.request('quote/historicalTrades', ['spot', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV2PublicGetQuoteKlines(params = {}) {
        return this.request('quote/klines', ['spot', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV2PublicGetQuotePrice(params = {}) {
        return this.request('quote/price', ['spot', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV2PublicGetQuoteTicker(params = {}) {
        return this.request('quote/ticker', ['spot', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV2PublicGetQuoteTrades(params = {}) {
        return this.request('quote/trades', ['spot', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV3PrivateGetGetAssetTransfer(params = {}) {
        return this.request('get/asset/transfer', ['spot', 'v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV3PrivateGetAssetTransfer(params = {}) {
        return this.request('asset/transfer', ['spot', 'v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV3PrivateGetCapitalDepositHisrec(params = {}) {
        return this.request('capital/deposit/hisrec', ['spot', 'v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV3PrivateGetCapitalWithdrawHistory(params = {}) {
        return this.request('capital/withdraw/history', ['spot', 'v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotV3PrivatePostPostAssetTransfer(params = {}) {
        return this.request('post/asset/transfer', ['spot', 'v3', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    swapV1PublicGetTickerPrice(params = {}) {
        return this.request('ticker/price', ['swap', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV1PublicGetMarketHistoricalTrades(params = {}) {
        return this.request('market/historicalTrades', ['swap', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV1PublicGetMarketMarkPriceKlines(params = {}) {
        return this.request('market/markPriceKlines', ['swap', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV1PublicGetTradeMultiAssetsRules(params = {}) {
        return this.request('trade/multiAssetsRules', ['swap', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV1PublicGetTradingRules(params = {}) {
        return this.request('tradingRules', ['swap', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV1PrivateGetPositionSideDual(params = {}) {
        return this.request('positionSide/dual', ['swap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    swapV1PrivateGetTradeBatchCancelReplace(params = {}) {
        return this.request('trade/batchCancelReplace', ['swap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    swapV1PrivateGetTradeFullOrder(params = {}) {
        return this.request('trade/fullOrder', ['swap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    swapV1PrivateGetMaintMarginRatio(params = {}) {
        return this.request('maintMarginRatio', ['swap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    swapV1PrivateGetTradePositionHistory(params = {}) {
        return this.request('trade/positionHistory', ['swap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    swapV1PrivateGetPositionMarginHistory(params = {}) {
        return this.request('positionMargin/history', ['swap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    swapV1PrivateGetTwapOpenOrders(params = {}) {
        return this.request('twap/openOrders', ['swap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    swapV1PrivateGetTwapHistoryOrders(params = {}) {
        return this.request('twap/historyOrders', ['swap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    swapV1PrivateGetTwapOrderDetail(params = {}) {
        return this.request('twap/orderDetail', ['swap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    swapV1PrivateGetTradeAssetMode(params = {}) {
        return this.request('trade/assetMode', ['swap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    swapV1PrivateGetUserMarginAssets(params = {}) {
        return this.request('user/marginAssets', ['swap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    swapV1PrivatePostTradeAmend(params = {}) {
        return this.request('trade/amend', ['swap', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    swapV1PrivatePostTradeCancelReplace(params = {}) {
        return this.request('trade/cancelReplace', ['swap', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    swapV1PrivatePostPositionSideDual(params = {}) {
        return this.request('positionSide/dual', ['swap', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    swapV1PrivatePostTradeBatchCancelReplace(params = {}) {
        return this.request('trade/batchCancelReplace', ['swap', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    swapV1PrivatePostTradeClosePosition(params = {}) {
        return this.request('trade/closePosition', ['swap', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    swapV1PrivatePostTradeGetVst(params = {}) {
        return this.request('trade/getVst', ['swap', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    swapV1PrivatePostTwapOrder(params = {}) {
        return this.request('twap/order', ['swap', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    swapV1PrivatePostTwapCancelOrder(params = {}) {
        return this.request('twap/cancelOrder', ['swap', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    swapV1PrivatePostTradeAssetMode(params = {}) {
        return this.request('trade/assetMode', ['swap', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    swapV1PrivatePostTradeReverse(params = {}) {
        return this.request('trade/reverse', ['swap', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    swapV1PrivatePostTradeAutoAddMargin(params = {}) {
        return this.request('trade/autoAddMargin', ['swap', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    swapV2PublicGetServerTime(params = {}) {
        return this.request('server/time', ['swap', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV2PublicGetQuoteContracts(params = {}) {
        return this.request('quote/contracts', ['swap', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV2PublicGetQuotePrice(params = {}) {
        return this.request('quote/price', ['swap', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV2PublicGetQuoteDepth(params = {}) {
        return this.request('quote/depth', ['swap', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV2PublicGetQuoteTrades(params = {}) {
        return this.request('quote/trades', ['swap', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV2PublicGetQuotePremiumIndex(params = {}) {
        return this.request('quote/premiumIndex', ['swap', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV2PublicGetQuoteFundingRate(params = {}) {
        return this.request('quote/fundingRate', ['swap', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV2PublicGetQuoteKlines(params = {}) {
        return this.request('quote/klines', ['swap', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV2PublicGetQuoteOpenInterest(params = {}) {
        return this.request('quote/openInterest', ['swap', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV2PublicGetQuoteTicker(params = {}) {
        return this.request('quote/ticker', ['swap', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV2PublicGetQuoteBookTicker(params = {}) {
        return this.request('quote/bookTicker', ['swap', 'v2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV2PrivateGetUserBalance(params = {}) {
        return this.request('user/balance', ['swap', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivateGetUserPositions(params = {}) {
        return this.request('user/positions', ['swap', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivateGetUserIncome(params = {}) {
        return this.request('user/income', ['swap', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivateGetTradeOpenOrders(params = {}) {
        return this.request('trade/openOrders', ['swap', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivateGetTradeOpenOrder(params = {}) {
        return this.request('trade/openOrder', ['swap', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivateGetTradeOrder(params = {}) {
        return this.request('trade/order', ['swap', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivateGetTradeMarginType(params = {}) {
        return this.request('trade/marginType', ['swap', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    swapV2PrivateGetTradeLeverage(params = {}) {
        return this.request('trade/leverage', ['swap', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivateGetTradeForceOrders(params = {}) {
        return this.request('trade/forceOrders', ['swap', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV2PrivateGetTradeAllOrders(params = {}) {
        return this.request('trade/allOrders', ['swap', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivateGetTradeAllFillOrders(params = {}) {
        return this.request('trade/allFillOrders', ['swap', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivateGetTradeFillHistory(params = {}) {
        return this.request('trade/fillHistory', ['swap', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivateGetTradePositionHistory(params = {}) {
        return this.request('trade/positionHistory', ['swap', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivateGetUserIncomeExport(params = {}) {
        return this.request('user/income/export', ['swap', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivateGetUserCommissionRate(params = {}) {
        return this.request('user/commissionRate', ['swap', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivateGetQuoteBookTicker(params = {}) {
        return this.request('quote/bookTicker', ['swap', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV2PrivatePostTradeGetVst(params = {}) {
        return this.request('trade/getVst', ['swap', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    swapV2PrivatePostTradeOrder(params = {}) {
        return this.request('trade/order', ['swap', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivatePostTradeBatchOrders(params = {}) {
        return this.request('trade/batchOrders', ['swap', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivatePostTradeCloseAllPositions(params = {}) {
        return this.request('trade/closeAllPositions', ['swap', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivatePostTradeCancelAllAfter(params = {}) {
        return this.request('trade/cancelAllAfter', ['swap', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    swapV2PrivatePostTradeMarginType(params = {}) {
        return this.request('trade/marginType', ['swap', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    swapV2PrivatePostTradeLeverage(params = {}) {
        return this.request('trade/leverage', ['swap', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    swapV2PrivatePostTradePositionMargin(params = {}) {
        return this.request('trade/positionMargin', ['swap', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    swapV2PrivatePostTradeOrderTest(params = {}) {
        return this.request('trade/order/test', ['swap', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivateDeleteTradeOrder(params = {}) {
        return this.request('trade/order', ['swap', 'v2', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivateDeleteTradeBatchOrders(params = {}) {
        return this.request('trade/batchOrders', ['swap', 'v2', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 2 });
    }
    swapV2PrivateDeleteTradeAllOpenOrders(params = {}) {
        return this.request('trade/allOpenOrders', ['swap', 'v2', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 2 });
    }
    swapV3PublicGetQuoteKlines(params = {}) {
        return this.request('quote/klines', ['swap', 'v3', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    swapV3PrivateGetUserBalance(params = {}) {
        return this.request('user/balance', ['swap', 'v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV1PublicGetMarketContracts(params = {}) {
        return this.request('market/contracts', ['cswap', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    cswapV1PublicGetMarketPremiumIndex(params = {}) {
        return this.request('market/premiumIndex', ['cswap', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    cswapV1PublicGetMarketOpenInterest(params = {}) {
        return this.request('market/openInterest', ['cswap', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    cswapV1PublicGetMarketKlines(params = {}) {
        return this.request('market/klines', ['cswap', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    cswapV1PublicGetMarketDepth(params = {}) {
        return this.request('market/depth', ['cswap', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    cswapV1PublicGetMarketTicker(params = {}) {
        return this.request('market/ticker', ['cswap', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    cswapV1PrivateGetTradeLeverage(params = {}) {
        return this.request('trade/leverage', ['cswap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV1PrivateGetTradeForceOrders(params = {}) {
        return this.request('trade/forceOrders', ['cswap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV1PrivateGetTradeAllFillOrders(params = {}) {
        return this.request('trade/allFillOrders', ['cswap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV1PrivateGetTradeOpenOrders(params = {}) {
        return this.request('trade/openOrders', ['cswap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV1PrivateGetTradeOrderDetail(params = {}) {
        return this.request('trade/orderDetail', ['cswap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV1PrivateGetTradeOrderHistory(params = {}) {
        return this.request('trade/orderHistory', ['cswap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV1PrivateGetTradeMarginType(params = {}) {
        return this.request('trade/marginType', ['cswap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV1PrivateGetUserCommissionRate(params = {}) {
        return this.request('user/commissionRate', ['cswap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV1PrivateGetUserPositions(params = {}) {
        return this.request('user/positions', ['cswap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV1PrivateGetUserBalance(params = {}) {
        return this.request('user/balance', ['cswap', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV1PrivatePostTradeOrder(params = {}) {
        return this.request('trade/order', ['cswap', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV1PrivatePostTradeLeverage(params = {}) {
        return this.request('trade/leverage', ['cswap', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV1PrivatePostTradeAllOpenOrders(params = {}) {
        return this.request('trade/allOpenOrders', ['cswap', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV1PrivatePostTradeCloseAllPositions(params = {}) {
        return this.request('trade/closeAllPositions', ['cswap', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV1PrivatePostTradeMarginType(params = {}) {
        return this.request('trade/marginType', ['cswap', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV1PrivatePostTradePositionMargin(params = {}) {
        return this.request('trade/positionMargin', ['cswap', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV1PrivateDeleteTradeAllOpenOrders(params = {}) {
        return this.request('trade/allOpenOrders', ['cswap', 'v1', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV1PrivateDeleteTradeCancelOrder(params = {}) {
        return this.request('trade/cancelOrder', ['cswap', 'v1', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 2 });
    }
    cswapV2PrivatePostTradeOrder(params = {}) {
        return this.request('trade/order', ['cswap', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractV1PrivateGetAllPosition(params = {}) {
        return this.request('allPosition', ['contract', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractV1PrivateGetAllOrders(params = {}) {
        return this.request('allOrders', ['contract', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractV1PrivateGetBalance(params = {}) {
        return this.request('balance', ['contract', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    walletsV1PrivateGetCapitalConfigGetall(params = {}) {
        return this.request('capital/config/getall', ['wallets', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    walletsV1PrivateGetCapitalDepositAddress(params = {}) {
        return this.request('capital/deposit/address', ['wallets', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    walletsV1PrivateGetCapitalInnerTransferRecords(params = {}) {
        return this.request('capital/innerTransfer/records', ['wallets', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    walletsV1PrivateGetCapitalSubAccountDepositAddress(params = {}) {
        return this.request('capital/subAccount/deposit/address', ['wallets', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    walletsV1PrivateGetCapitalDepositSubHisrec(params = {}) {
        return this.request('capital/deposit/subHisrec', ['wallets', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    walletsV1PrivateGetCapitalSubAccountInnerTransferRecords(params = {}) {
        return this.request('capital/subAccount/innerTransfer/records', ['wallets', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    walletsV1PrivateGetCapitalDepositRiskRecords(params = {}) {
        return this.request('capital/deposit/riskRecords', ['wallets', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    walletsV1PrivatePostCapitalWithdrawApply(params = {}) {
        return this.request('capital/withdraw/apply', ['wallets', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    walletsV1PrivatePostCapitalInnerTransferApply(params = {}) {
        return this.request('capital/innerTransfer/apply', ['wallets', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    walletsV1PrivatePostCapitalSubAccountInnerTransferApply(params = {}) {
        return this.request('capital/subAccountInnerTransfer/apply', ['wallets', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    walletsV1PrivatePostCapitalDepositCreateSubAddress(params = {}) {
        return this.request('capital/deposit/createSubAddress', ['wallets', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    subAccountV1PrivateGetList(params = {}) {
        return this.request('list', ['subAccount', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    subAccountV1PrivateGetAssets(params = {}) {
        return this.request('assets', ['subAccount', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    subAccountV1PrivateGetAllAccountBalance(params = {}) {
        return this.request('allAccountBalance', ['subAccount', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    subAccountV1PrivatePostCreate(params = {}) {
        return this.request('create', ['subAccount', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    subAccountV1PrivatePostApiKeyCreate(params = {}) {
        return this.request('apiKey/create', ['subAccount', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    subAccountV1PrivatePostApiKeyEdit(params = {}) {
        return this.request('apiKey/edit', ['subAccount', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    subAccountV1PrivatePostApiKeyDel(params = {}) {
        return this.request('apiKey/del', ['subAccount', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    subAccountV1PrivatePostUpdateStatus(params = {}) {
        return this.request('updateStatus', ['subAccount', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    accountV1PrivateGetUid(params = {}) {
        return this.request('uid', ['account', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    accountV1PrivateGetApiKeyQuery(params = {}) {
        return this.request('apiKey/query', ['account', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    accountV1PrivateGetAccountApiPermissions(params = {}) {
        return this.request('account/apiPermissions', ['account', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    accountV1PrivateGetAccountApiRestrictions(params = {}) {
        return this.request('account/apiRestrictions', ['account', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    accountV1PrivateGetAllAccountBalance(params = {}) {
        return this.request('allAccountBalance', ['account', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    accountV1PrivatePostInnerTransferAuthorizeSubAccount(params = {}) {
        return this.request('innerTransfer/authorizeSubAccount', ['account', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    accountTransferV1PrivateGetSubAccountAssetTransferHistory(params = {}) {
        return this.request('subAccount/asset/transferHistory', ['account', 'transfer', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    accountTransferV1PrivatePostSubAccountTransferAssetSupportCoins(params = {}) {
        return this.request('subAccount/transferAsset/supportCoins', ['account', 'transfer', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    accountTransferV1PrivatePostSubAccountTransferAsset(params = {}) {
        return this.request('subAccount/transferAsset', ['account', 'transfer', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    userAuthPrivatePostUserDataStream(params = {}) {
        return this.request('userDataStream', ['user', 'auth', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    userAuthPrivatePutUserDataStream(params = {}) {
        return this.request('userDataStream', ['user', 'auth', 'private'], 'PUT', params, undefined, undefined, { 'cost': 2 });
    }
    userAuthPrivateDeleteUserDataStream(params = {}) {
        return this.request('userDataStream', ['user', 'auth', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 2 });
    }
    copyTradingV1PrivateGetPFuturesTraderDetail(params = {}) {
        return this.request('PFutures/traderDetail', ['copyTrading', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    copyTradingV1PrivateGetPFuturesProfitHistorySummarys(params = {}) {
        return this.request('PFutures/profitHistorySummarys', ['copyTrading', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    copyTradingV1PrivateGetPFuturesProfitDetail(params = {}) {
        return this.request('PFutures/profitDetail', ['copyTrading', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    copyTradingV1PrivateGetPFuturesTradingPairs(params = {}) {
        return this.request('PFutures/tradingPairs', ['copyTrading', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    copyTradingV1PrivateGetSpotTraderDetail(params = {}) {
        return this.request('spot/traderDetail', ['copyTrading', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    copyTradingV1PrivateGetSpotProfitHistorySummarys(params = {}) {
        return this.request('spot/profitHistorySummarys', ['copyTrading', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    copyTradingV1PrivateGetSpotProfitDetail(params = {}) {
        return this.request('spot/profitDetail', ['copyTrading', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    copyTradingV1PrivateGetSpotHistoryOrder(params = {}) {
        return this.request('spot/historyOrder', ['copyTrading', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    copyTradingV1PrivatePostSwapTraceSetTPSL(params = {}) {
        return this.request('swap/trace/setTPSL', ['copyTrading', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    copyTradingV1PrivatePostPFuturesSetCommission(params = {}) {
        return this.request('PFutures/setCommission', ['copyTrading', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    copyTradingV1PrivatePostSpotTraderSellOrder(params = {}) {
        return this.request('spot/trader/sellOrder', ['copyTrading', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    apiV3PrivateGetAssetTransfer(params = {}) {
        return this.request('asset/transfer', ['api', 'v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    apiV3PrivateGetAssetTransferRecord(params = {}) {
        return this.request('asset/transferRecord', ['api', 'v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    apiV3PrivateGetCapitalDepositHisrec(params = {}) {
        return this.request('capital/deposit/hisrec', ['api', 'v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    apiV3PrivateGetCapitalWithdrawHistory(params = {}) {
        return this.request('capital/withdraw/history', ['api', 'v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    apiV3PrivatePostPostAssetTransfer(params = {}) {
        return this.request('post/asset/transfer', ['api', 'v3', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    apiAssetV1PrivatePostTransfer(params = {}) {
        return this.request('transfer', ['api', 'asset', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    apiAssetV1PublicGetTransferSupportCoins(params = {}) {
        return this.request('transfer/supportCoins', ['api', 'asset', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    agentV1PrivateGetAccountInviteAccountList(params = {}) {
        return this.request('account/inviteAccountList', ['agent', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    agentV1PrivateGetRewardCommissionDataList(params = {}) {
        return this.request('reward/commissionDataList', ['agent', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    agentV1PrivateGetAccountInviteRelationCheck(params = {}) {
        return this.request('account/inviteRelationCheck', ['agent', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    agentV1PrivateGetAssetDepositDetailList(params = {}) {
        return this.request('asset/depositDetailList', ['agent', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    agentV1PrivateGetRewardThirdCommissionDataList(params = {}) {
        return this.request('reward/third/commissionDataList', ['agent', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    agentV1PrivateGetAssetPartnerData(params = {}) {
        return this.request('asset/partnerData', ['agent', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    agentV1PrivateGetCommissionDataListReferralCode(params = {}) {
        return this.request('commissionDataList/referralCode', ['agent', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    agentV1PrivateGetAccountSuperiorCheck(params = {}) {
        return this.request('account/superiorCheck', ['agent', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    wealthV1PrivateGetProductDualCurrencyPreOrder(params = {}) {
        return this.request('product/dual-currency/pre-order', ['wealth', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    wealthV1PrivateGetProductDualCurrencyPosition(params = {}) {
        return this.request('product/dual-currency/position', ['wealth', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    wealthV1PrivateGetProductDualCurrencyOrderRecords(params = {}) {
        return this.request('product/dual-currency/order-records', ['wealth', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    wealthV1PrivatePostProductDualCurrencyInvestAssetList(params = {}) {
        return this.request('product/dual-currency/invest-asset-list', ['wealth', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    wealthV1PrivatePostProductDualCurrencyOrder(params = {}) {
        return this.request('product/dual-currency/order', ['wealth', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
}

exports["default"] = Exchange;
