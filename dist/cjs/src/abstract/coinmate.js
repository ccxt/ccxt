'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetOrderBook(params) { return this['publicGetOrderBook'](params); }
    publicGetTicker(params) { return this['publicGetTicker'](params); }
    publicGetTransactions(params) { return this['publicGetTransactions'](params); }
    publicGetTradingPairs(params) { return this['publicGetTradingPairs'](params); }
    privatePostBalances(params) { return this['privatePostBalances'](params); }
    privatePostBitcoinCashWithdrawal(params) { return this['privatePostBitcoinCashWithdrawal'](params); }
    privatePostBitcoinCashDepositAddresses(params) { return this['privatePostBitcoinCashDepositAddresses'](params); }
    privatePostBitcoinDepositAddresses(params) { return this['privatePostBitcoinDepositAddresses'](params); }
    privatePostBitcoinWithdrawal(params) { return this['privatePostBitcoinWithdrawal'](params); }
    privatePostBitcoinWithdrawalFees(params) { return this['privatePostBitcoinWithdrawalFees'](params); }
    privatePostBuyInstant(params) { return this['privatePostBuyInstant'](params); }
    privatePostBuyLimit(params) { return this['privatePostBuyLimit'](params); }
    privatePostCancelOrder(params) { return this['privatePostCancelOrder'](params); }
    privatePostCancelOrderWithInfo(params) { return this['privatePostCancelOrderWithInfo'](params); }
    privatePostCreateVoucher(params) { return this['privatePostCreateVoucher'](params); }
    privatePostDashDepositAddresses(params) { return this['privatePostDashDepositAddresses'](params); }
    privatePostDashWithdrawal(params) { return this['privatePostDashWithdrawal'](params); }
    privatePostEthereumWithdrawal(params) { return this['privatePostEthereumWithdrawal'](params); }
    privatePostEthereumDepositAddresses(params) { return this['privatePostEthereumDepositAddresses'](params); }
    privatePostLitecoinWithdrawal(params) { return this['privatePostLitecoinWithdrawal'](params); }
    privatePostLitecoinDepositAddresses(params) { return this['privatePostLitecoinDepositAddresses'](params); }
    privatePostOpenOrders(params) { return this['privatePostOpenOrders'](params); }
    privatePostOrder(params) { return this['privatePostOrder'](params); }
    privatePostOrderHistory(params) { return this['privatePostOrderHistory'](params); }
    privatePostOrderById(params) { return this['privatePostOrderById'](params); }
    privatePostPusherAuth(params) { return this['privatePostPusherAuth'](params); }
    privatePostRedeemVoucher(params) { return this['privatePostRedeemVoucher'](params); }
    privatePostReplaceByBuyLimit(params) { return this['privatePostReplaceByBuyLimit'](params); }
    privatePostReplaceByBuyInstant(params) { return this['privatePostReplaceByBuyInstant'](params); }
    privatePostReplaceBySellLimit(params) { return this['privatePostReplaceBySellLimit'](params); }
    privatePostReplaceBySellInstant(params) { return this['privatePostReplaceBySellInstant'](params); }
    privatePostRippleDepositAddresses(params) { return this['privatePostRippleDepositAddresses'](params); }
    privatePostRippleWithdrawal(params) { return this['privatePostRippleWithdrawal'](params); }
    privatePostSellInstant(params) { return this['privatePostSellInstant'](params); }
    privatePostSellLimit(params) { return this['privatePostSellLimit'](params); }
    privatePostTransactionHistory(params) { return this['privatePostTransactionHistory'](params); }
    privatePostTraderFees(params) { return this['privatePostTraderFees'](params); }
    privatePostTradeHistory(params) { return this['privatePostTradeHistory'](params); }
    privatePostTransfer(params) { return this['privatePostTransfer'](params); }
    privatePostTransferHistory(params) { return this['privatePostTransferHistory'](params); }
    privatePostUnconfirmedBitcoinDeposits(params) { return this['privatePostUnconfirmedBitcoinDeposits'](params); }
    privatePostUnconfirmedBitcoinCashDeposits(params) { return this['privatePostUnconfirmedBitcoinCashDeposits'](params); }
    privatePostUnconfirmedDashDeposits(params) { return this['privatePostUnconfirmedDashDeposits'](params); }
    privatePostUnconfirmedEthereumDeposits(params) { return this['privatePostUnconfirmedEthereumDeposits'](params); }
    privatePostUnconfirmedLitecoinDeposits(params) { return this['privatePostUnconfirmedLitecoinDeposits'](params); }
    privatePostUnconfirmedRippleDeposits(params) { return this['privatePostUnconfirmedRippleDeposits'](params); }
}

module.exports = Exchange;
