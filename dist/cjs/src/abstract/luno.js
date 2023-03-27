'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    exchangeGetMarkets(params) { return this['exchangeGetMarkets'](params); }
    publicGetOrderbook(params) { return this['publicGetOrderbook'](params); }
    publicGetOrderbookTop(params) { return this['publicGetOrderbookTop'](params); }
    publicGetTicker(params) { return this['publicGetTicker'](params); }
    publicGetTickers(params) { return this['publicGetTickers'](params); }
    publicGetTrades(params) { return this['publicGetTrades'](params); }
    privateGetAccountsIdPending(params) { return this['privateGetAccountsIdPending'](params); }
    privateGetAccountsIdTransactions(params) { return this['privateGetAccountsIdTransactions'](params); }
    privateGetBalance(params) { return this['privateGetBalance'](params); }
    privateGetBeneficiaries(params) { return this['privateGetBeneficiaries'](params); }
    privateGetFeeInfo(params) { return this['privateGetFeeInfo'](params); }
    privateGetFundingAddress(params) { return this['privateGetFundingAddress'](params); }
    privateGetListorders(params) { return this['privateGetListorders'](params); }
    privateGetListtrades(params) { return this['privateGetListtrades'](params); }
    privateGetOrdersId(params) { return this['privateGetOrdersId'](params); }
    privateGetQuotesId(params) { return this['privateGetQuotesId'](params); }
    privateGetWithdrawals(params) { return this['privateGetWithdrawals'](params); }
    privateGetWithdrawalsId(params) { return this['privateGetWithdrawalsId'](params); }
    privateGetTransfers(params) { return this['privateGetTransfers'](params); }
    privatePostAccounts(params) { return this['privatePostAccounts'](params); }
    privatePostAccountsIdName(params) { return this['privatePostAccountsIdName'](params); }
    privatePostPostorder(params) { return this['privatePostPostorder'](params); }
    privatePostMarketorder(params) { return this['privatePostMarketorder'](params); }
    privatePostStoporder(params) { return this['privatePostStoporder'](params); }
    privatePostFundingAddress(params) { return this['privatePostFundingAddress'](params); }
    privatePostWithdrawals(params) { return this['privatePostWithdrawals'](params); }
    privatePostSend(params) { return this['privatePostSend'](params); }
    privatePostQuotes(params) { return this['privatePostQuotes'](params); }
    privatePostOauth2Grant(params) { return this['privatePostOauth2Grant'](params); }
    privatePutAccountsIdName(params) { return this['privatePutAccountsIdName'](params); }
    privatePutQuotesId(params) { return this['privatePutQuotesId'](params); }
    privateDeleteQuotesId(params) { return this['privateDeleteQuotesId'](params); }
    privateDeleteWithdrawalsId(params) { return this['privateDeleteWithdrawalsId'](params); }
}

module.exports = Exchange;
