'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetTickerCurrency(params) { return this['publicGetTickerCurrency'](params); }
    publicGetTickerAll(params) { return this['publicGetTickerAll'](params); }
    publicGetTickerALLBTC(params) { return this['publicGetTickerALLBTC'](params); }
    publicGetTickerALLKRW(params) { return this['publicGetTickerALLKRW'](params); }
    publicGetOrderbookCurrency(params) { return this['publicGetOrderbookCurrency'](params); }
    publicGetOrderbookAll(params) { return this['publicGetOrderbookAll'](params); }
    publicGetTransactionHistoryCurrency(params) { return this['publicGetTransactionHistoryCurrency'](params); }
    publicGetTransactionHistoryAll(params) { return this['publicGetTransactionHistoryAll'](params); }
    publicGetCandlestickCurrencyInterval(params) { return this['publicGetCandlestickCurrencyInterval'](params); }
    privatePostInfoAccount(params) { return this['privatePostInfoAccount'](params); }
    privatePostInfoBalance(params) { return this['privatePostInfoBalance'](params); }
    privatePostInfoWalletAddress(params) { return this['privatePostInfoWalletAddress'](params); }
    privatePostInfoTicker(params) { return this['privatePostInfoTicker'](params); }
    privatePostInfoOrders(params) { return this['privatePostInfoOrders'](params); }
    privatePostInfoUserTransactions(params) { return this['privatePostInfoUserTransactions'](params); }
    privatePostInfoOrderDetail(params) { return this['privatePostInfoOrderDetail'](params); }
    privatePostTradePlace(params) { return this['privatePostTradePlace'](params); }
    privatePostTradeCancel(params) { return this['privatePostTradeCancel'](params); }
    privatePostTradeBtcWithdrawal(params) { return this['privatePostTradeBtcWithdrawal'](params); }
    privatePostTradeKrwDeposit(params) { return this['privatePostTradeKrwDeposit'](params); }
    privatePostTradeKrwWithdrawal(params) { return this['privatePostTradeKrwWithdrawal'](params); }
    privatePostTradeMarketBuy(params) { return this['privatePostTradeMarketBuy'](params); }
    privatePostTradeMarketSell(params) { return this['privatePostTradeMarketSell'](params); }
}

module.exports = Exchange;
