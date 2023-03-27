'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetAvailableBooks(params) { return this['publicGetAvailableBooks'](params); }
    publicGetTicker(params) { return this['publicGetTicker'](params); }
    publicGetOrderBook(params) { return this['publicGetOrderBook'](params); }
    publicGetTrades(params) { return this['publicGetTrades'](params); }
    publicGetOhlc(params) { return this['publicGetOhlc'](params); }
    privateGetAccountStatus(params) { return this['privateGetAccountStatus'](params); }
    privateGetBalance(params) { return this['privateGetBalance'](params); }
    privateGetFees(params) { return this['privateGetFees'](params); }
    privateGetFundings(params) { return this['privateGetFundings'](params); }
    privateGetFundingsFid(params) { return this['privateGetFundingsFid'](params); }
    privateGetFundingDestination(params) { return this['privateGetFundingDestination'](params); }
    privateGetKycDocuments(params) { return this['privateGetKycDocuments'](params); }
    privateGetLedger(params) { return this['privateGetLedger'](params); }
    privateGetLedgerTrades(params) { return this['privateGetLedgerTrades'](params); }
    privateGetLedgerFees(params) { return this['privateGetLedgerFees'](params); }
    privateGetLedgerFundings(params) { return this['privateGetLedgerFundings'](params); }
    privateGetLedgerWithdrawals(params) { return this['privateGetLedgerWithdrawals'](params); }
    privateGetMxBankCodes(params) { return this['privateGetMxBankCodes'](params); }
    privateGetOpenOrders(params) { return this['privateGetOpenOrders'](params); }
    privateGetOrderTradesOid(params) { return this['privateGetOrderTradesOid'](params); }
    privateGetOrdersOid(params) { return this['privateGetOrdersOid'](params); }
    privateGetUserTrades(params) { return this['privateGetUserTrades'](params); }
    privateGetUserTradesTid(params) { return this['privateGetUserTradesTid'](params); }
    privateGetWithdrawals(params) { return this['privateGetWithdrawals'](params); }
    privateGetWithdrawalsWid(params) { return this['privateGetWithdrawalsWid'](params); }
    privatePostBitcoinWithdrawal(params) { return this['privatePostBitcoinWithdrawal'](params); }
    privatePostDebitCardWithdrawal(params) { return this['privatePostDebitCardWithdrawal'](params); }
    privatePostEtherWithdrawal(params) { return this['privatePostEtherWithdrawal'](params); }
    privatePostOrders(params) { return this['privatePostOrders'](params); }
    privatePostPhoneNumber(params) { return this['privatePostPhoneNumber'](params); }
    privatePostPhoneVerification(params) { return this['privatePostPhoneVerification'](params); }
    privatePostPhoneWithdrawal(params) { return this['privatePostPhoneWithdrawal'](params); }
    privatePostSpeiWithdrawal(params) { return this['privatePostSpeiWithdrawal'](params); }
    privatePostRippleWithdrawal(params) { return this['privatePostRippleWithdrawal'](params); }
    privatePostBcashWithdrawal(params) { return this['privatePostBcashWithdrawal'](params); }
    privatePostLitecoinWithdrawal(params) { return this['privatePostLitecoinWithdrawal'](params); }
    privateDeleteOrders(params) { return this['privateDeleteOrders'](params); }
    privateDeleteOrdersOid(params) { return this['privateDeleteOrdersOid'](params); }
    privateDeleteOrdersAll(params) { return this['privateDeleteOrdersAll'](params); }
}

module.exports = Exchange;
