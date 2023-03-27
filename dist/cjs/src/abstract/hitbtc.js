'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetCurrency(params) { return this['publicGetCurrency'](params); }
    publicGetCurrencyCurrency(params) { return this['publicGetCurrencyCurrency'](params); }
    publicGetSymbol(params) { return this['publicGetSymbol'](params); }
    publicGetSymbolSymbol(params) { return this['publicGetSymbolSymbol'](params); }
    publicGetTicker(params) { return this['publicGetTicker'](params); }
    publicGetTickerSymbol(params) { return this['publicGetTickerSymbol'](params); }
    publicGetTrades(params) { return this['publicGetTrades'](params); }
    publicGetTradesSymbol(params) { return this['publicGetTradesSymbol'](params); }
    publicGetOrderbook(params) { return this['publicGetOrderbook'](params); }
    publicGetOrderbookSymbol(params) { return this['publicGetOrderbookSymbol'](params); }
    publicGetCandles(params) { return this['publicGetCandles'](params); }
    publicGetCandlesSymbol(params) { return this['publicGetCandlesSymbol'](params); }
    privateGetTradingBalance(params) { return this['privateGetTradingBalance'](params); }
    privateGetOrder(params) { return this['privateGetOrder'](params); }
    privateGetOrderClientOrderId(params) { return this['privateGetOrderClientOrderId'](params); }
    privateGetTradingFeeAll(params) { return this['privateGetTradingFeeAll'](params); }
    privateGetTradingFeeSymbol(params) { return this['privateGetTradingFeeSymbol'](params); }
    privateGetMarginAccount(params) { return this['privateGetMarginAccount'](params); }
    privateGetMarginAccountSymbol(params) { return this['privateGetMarginAccountSymbol'](params); }
    privateGetMarginPosition(params) { return this['privateGetMarginPosition'](params); }
    privateGetMarginPositionSymbol(params) { return this['privateGetMarginPositionSymbol'](params); }
    privateGetMarginOrder(params) { return this['privateGetMarginOrder'](params); }
    privateGetMarginOrderClientOrderId(params) { return this['privateGetMarginOrderClientOrderId'](params); }
    privateGetHistoryOrder(params) { return this['privateGetHistoryOrder'](params); }
    privateGetHistoryTrades(params) { return this['privateGetHistoryTrades'](params); }
    privateGetHistoryOrderOrderIdTrades(params) { return this['privateGetHistoryOrderOrderIdTrades'](params); }
    privateGetAccountBalance(params) { return this['privateGetAccountBalance'](params); }
    privateGetAccountCryptoAddressCurrency(params) { return this['privateGetAccountCryptoAddressCurrency'](params); }
    privateGetAccountCryptoAddressesCurrency(params) { return this['privateGetAccountCryptoAddressesCurrency'](params); }
    privateGetAccountCryptoUsedAddressesCurrency(params) { return this['privateGetAccountCryptoUsedAddressesCurrency'](params); }
    privateGetAccountCryptoEstimateWithdraw(params) { return this['privateGetAccountCryptoEstimateWithdraw'](params); }
    privateGetAccountCryptoIsMineAddress(params) { return this['privateGetAccountCryptoIsMineAddress'](params); }
    privateGetAccountTransactions(params) { return this['privateGetAccountTransactions'](params); }
    privateGetAccountTransactionsId(params) { return this['privateGetAccountTransactionsId'](params); }
    privateGetSubAcc(params) { return this['privateGetSubAcc'](params); }
    privateGetSubAccAcl(params) { return this['privateGetSubAccAcl'](params); }
    privateGetSubAccBalanceSubAccountUserID(params) { return this['privateGetSubAccBalanceSubAccountUserID'](params); }
    privateGetSubAccDepositAddressSubAccountUserIdCurrency(params) { return this['privateGetSubAccDepositAddressSubAccountUserIdCurrency'](params); }
    privatePostOrder(params) { return this['privatePostOrder'](params); }
    privatePostMarginOrder(params) { return this['privatePostMarginOrder'](params); }
    privatePostAccountCryptoAddressCurrency(params) { return this['privatePostAccountCryptoAddressCurrency'](params); }
    privatePostAccountCryptoWithdraw(params) { return this['privatePostAccountCryptoWithdraw'](params); }
    privatePostAccountCryptoTransferConvert(params) { return this['privatePostAccountCryptoTransferConvert'](params); }
    privatePostAccountTransfer(params) { return this['privatePostAccountTransfer'](params); }
    privatePostAccountTransferInternal(params) { return this['privatePostAccountTransferInternal'](params); }
    privatePostSubAccFreeze(params) { return this['privatePostSubAccFreeze'](params); }
    privatePostSubAccActivate(params) { return this['privatePostSubAccActivate'](params); }
    privatePostSubAccTransfer(params) { return this['privatePostSubAccTransfer'](params); }
    privatePutOrderClientOrderId(params) { return this['privatePutOrderClientOrderId'](params); }
    privatePutMarginAccountSymbol(params) { return this['privatePutMarginAccountSymbol'](params); }
    privatePutMarginOrderClientOrderId(params) { return this['privatePutMarginOrderClientOrderId'](params); }
    privatePutAccountCryptoWithdrawId(params) { return this['privatePutAccountCryptoWithdrawId'](params); }
    privatePutSubAccAclSubAccountUserId(params) { return this['privatePutSubAccAclSubAccountUserId'](params); }
    privateDeleteOrder(params) { return this['privateDeleteOrder'](params); }
    privateDeleteOrderClientOrderId(params) { return this['privateDeleteOrderClientOrderId'](params); }
    privateDeleteMarginAccount(params) { return this['privateDeleteMarginAccount'](params); }
    privateDeleteMarginAccountSymbol(params) { return this['privateDeleteMarginAccountSymbol'](params); }
    privateDeleteMarginPosition(params) { return this['privateDeleteMarginPosition'](params); }
    privateDeleteMarginPositionSymbol(params) { return this['privateDeleteMarginPositionSymbol'](params); }
    privateDeleteMarginOrder(params) { return this['privateDeleteMarginOrder'](params); }
    privateDeleteMarginOrderClientOrderId(params) { return this['privateDeleteMarginOrderClientOrderId'](params); }
    privateDeleteAccountCryptoWithdrawId(params) { return this['privateDeleteAccountCryptoWithdrawId'](params); }
    privatePatchOrderClientOrderId(params) { return this['privatePatchOrderClientOrderId'](params); }
}

module.exports = Exchange;
