'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetAssets(params) { return this['publicGetAssets'](params); }
    publicGetSettings(params) { return this['publicGetSettings'](params); }
    publicGetIndices(params) { return this['publicGetIndices'](params); }
    publicGetProducts(params) { return this['publicGetProducts'](params); }
    publicGetTickers(params) { return this['publicGetTickers'](params); }
    publicGetTickersSymbol(params) { return this['publicGetTickersSymbol'](params); }
    publicGetL2orderbookSymbol(params) { return this['publicGetL2orderbookSymbol'](params); }
    publicGetTradesSymbol(params) { return this['publicGetTradesSymbol'](params); }
    publicGetHistoryCandles(params) { return this['publicGetHistoryCandles'](params); }
    publicGetHistorySparklines(params) { return this['publicGetHistorySparklines'](params); }
    privateGetOrders(params) { return this['privateGetOrders'](params); }
    privateGetOrdersLeverage(params) { return this['privateGetOrdersLeverage'](params); }
    privateGetPositions(params) { return this['privateGetPositions'](params); }
    privateGetPositionsMargined(params) { return this['privateGetPositionsMargined'](params); }
    privateGetOrdersHistory(params) { return this['privateGetOrdersHistory'](params); }
    privateGetFills(params) { return this['privateGetFills'](params); }
    privateGetFillsHistoryDownloadCsv(params) { return this['privateGetFillsHistoryDownloadCsv'](params); }
    privateGetWalletBalances(params) { return this['privateGetWalletBalances'](params); }
    privateGetWalletTransactions(params) { return this['privateGetWalletTransactions'](params); }
    privateGetWalletTransactionsDownload(params) { return this['privateGetWalletTransactionsDownload'](params); }
    privateGetDepositsAddress(params) { return this['privateGetDepositsAddress'](params); }
    privatePostOrders(params) { return this['privatePostOrders'](params); }
    privatePostOrdersBatch(params) { return this['privatePostOrdersBatch'](params); }
    privatePostOrdersLeverage(params) { return this['privatePostOrdersLeverage'](params); }
    privatePostPositionsChangeMargin(params) { return this['privatePostPositionsChangeMargin'](params); }
    privatePutOrders(params) { return this['privatePutOrders'](params); }
    privatePutOrdersBatch(params) { return this['privatePutOrdersBatch'](params); }
    privateDeleteOrders(params) { return this['privateDeleteOrders'](params); }
    privateDeleteOrdersAll(params) { return this['privateDeleteOrdersAll'](params); }
    privateDeleteOrdersBatch(params) { return this['privateDeleteOrdersBatch'](params); }
}

module.exports = Exchange;
