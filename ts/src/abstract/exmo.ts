import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract webGetCtrlFeesAndLimits (params?: {}): Promise<implicitReturnType>;
    abstract webGetEnDocsFees (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCurrency (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCurrencyListExtended (params?: {}): Promise<implicitReturnType>;
    abstract publicGetOrderBook (params?: {}): Promise<implicitReturnType>;
    abstract publicGetPairSettings (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTicker (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTrades (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCandlesHistory (params?: {}): Promise<implicitReturnType>;
    abstract publicGetRequiredAmount (params?: {}): Promise<implicitReturnType>;
    abstract publicGetPaymentsProvidersCryptoList (params?: {}): Promise<implicitReturnType>;
    abstract privatePostUserInfo (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrderCreate (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrderCancel (params?: {}): Promise<implicitReturnType>;
    abstract privatePostStopMarketOrderCreate (params?: {}): Promise<implicitReturnType>;
    abstract privatePostStopMarketOrderCancel (params?: {}): Promise<implicitReturnType>;
    abstract privatePostUserOpenOrders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostUserTrades (params?: {}): Promise<implicitReturnType>;
    abstract privatePostUserCancelledOrders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrderTrades (params?: {}): Promise<implicitReturnType>;
    abstract privatePostDepositAddress (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdrawCrypt (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdrawGetTxid (params?: {}): Promise<implicitReturnType>;
    abstract privatePostExcodeCreate (params?: {}): Promise<implicitReturnType>;
    abstract privatePostExcodeLoad (params?: {}): Promise<implicitReturnType>;
    abstract privatePostCodeCheck (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWalletHistory (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWalletOperations (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginUserOrderCreate (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginUserOrderUpdate (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginUserOrderCancel (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginUserPositionClose (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginUserPositionMarginAdd (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginUserPositionMarginRemove (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginCurrencyList (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginPairList (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginSettings (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginFundingList (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginUserInfo (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginUserOrderList (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginUserOrderHistory (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginUserOrderTrades (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginUserOrderMaxQuantity (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginUserPositionList (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginUserPositionMarginRemoveInfo (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginUserPositionMarginAddInfo (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginUserWalletList (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginUserWalletHistory (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginUserTradeList (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginTrades (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarginLiquidationFeed (params?: {}): Promise<implicitReturnType>;
}