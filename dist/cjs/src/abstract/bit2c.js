'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetExchangesPairTicker(params) { return this['publicGetExchangesPairTicker'](params); }
    publicGetExchangesPairOrderbook(params) { return this['publicGetExchangesPairOrderbook'](params); }
    publicGetExchangesPairTrades(params) { return this['publicGetExchangesPairTrades'](params); }
    publicGetExchangesPairLasttrades(params) { return this['publicGetExchangesPairLasttrades'](params); }
    privatePostMerchantCreateCheckout(params) { return this['privatePostMerchantCreateCheckout'](params); }
    privatePostFundsAddCoinFundsRequest(params) { return this['privatePostFundsAddCoinFundsRequest'](params); }
    privatePostOrderAddFund(params) { return this['privatePostOrderAddFund'](params); }
    privatePostOrderAddOrder(params) { return this['privatePostOrderAddOrder'](params); }
    privatePostOrderGetById(params) { return this['privatePostOrderGetById'](params); }
    privatePostOrderAddOrderMarketPriceBuy(params) { return this['privatePostOrderAddOrderMarketPriceBuy'](params); }
    privatePostOrderAddOrderMarketPriceSell(params) { return this['privatePostOrderAddOrderMarketPriceSell'](params); }
    privatePostOrderCancelOrder(params) { return this['privatePostOrderCancelOrder'](params); }
    privatePostOrderAddCoinFundsRequest(params) { return this['privatePostOrderAddCoinFundsRequest'](params); }
    privatePostOrderAddStopOrder(params) { return this['privatePostOrderAddStopOrder'](params); }
    privatePostPaymentGetMyId(params) { return this['privatePostPaymentGetMyId'](params); }
    privatePostPaymentSend(params) { return this['privatePostPaymentSend'](params); }
    privatePostPaymentPay(params) { return this['privatePostPaymentPay'](params); }
    privateGetAccountBalance(params) { return this['privateGetAccountBalance'](params); }
    privateGetAccountBalanceV2(params) { return this['privateGetAccountBalanceV2'](params); }
    privateGetOrderMyOrders(params) { return this['privateGetOrderMyOrders'](params); }
    privateGetOrderGetById(params) { return this['privateGetOrderGetById'](params); }
    privateGetOrderAccountHistory(params) { return this['privateGetOrderAccountHistory'](params); }
    privateGetOrderOrderHistory(params) { return this['privateGetOrderOrderHistory'](params); }
}

module.exports = Exchange;
