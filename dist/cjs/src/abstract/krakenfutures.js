'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetInstruments(params) { return this['publicGetInstruments'](params); }
    publicGetOrderbook(params) { return this['publicGetOrderbook'](params); }
    publicGetTickers(params) { return this['publicGetTickers'](params); }
    publicGetHistory(params) { return this['publicGetHistory'](params); }
    publicGetHistoricalfundingrates(params) { return this['publicGetHistoricalfundingrates'](params); }
    privateGetOpenpositions(params) { return this['privateGetOpenpositions'](params); }
    privateGetNotifications(params) { return this['privateGetNotifications'](params); }
    privateGetAccounts(params) { return this['privateGetAccounts'](params); }
    privateGetOpenorders(params) { return this['privateGetOpenorders'](params); }
    privateGetRecentorders(params) { return this['privateGetRecentorders'](params); }
    privateGetFills(params) { return this['privateGetFills'](params); }
    privateGetTransfers(params) { return this['privateGetTransfers'](params); }
    privatePostSendorder(params) { return this['privatePostSendorder'](params); }
    privatePostEditorder(params) { return this['privatePostEditorder'](params); }
    privatePostCancelorder(params) { return this['privatePostCancelorder'](params); }
    privatePostTransfer(params) { return this['privatePostTransfer'](params); }
    privatePostBatchorder(params) { return this['privatePostBatchorder'](params); }
    privatePostCancelallorders(params) { return this['privatePostCancelallorders'](params); }
    privatePostCancelallordersafter(params) { return this['privatePostCancelallordersafter'](params); }
    privatePostWithdrawal(params) { return this['privatePostWithdrawal'](params); }
    chartsGetPriceTypeSymbolInterval(params) { return this['chartsGetPriceTypeSymbolInterval'](params); }
    historyGetOrders(params) { return this['historyGetOrders'](params); }
    historyGetExecutions(params) { return this['historyGetExecutions'](params); }
    historyGetTriggers(params) { return this['historyGetTriggers'](params); }
    historyGetAccountlogcsv(params) { return this['historyGetAccountlogcsv'](params); }
    historyGetMarketSymbolOrders(params) { return this['historyGetMarketSymbolOrders'](params); }
    historyGetMarketSymbolExecutions(params) { return this['historyGetMarketSymbolExecutions'](params); }
    feeschedulesGetVolumes(params) { return this['feeschedulesGetVolumes'](params); }
}

module.exports = Exchange;
