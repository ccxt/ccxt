import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract publicGetCommonSymbol (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCommonSymbols (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCommonTimestamp (params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketTickers (params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketTicker (params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketDepth (params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketTrades (params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketKlineHistory (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrdersGet (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrdersList (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrdersFill (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrdersFills (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountGetBalance (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountSubs (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountSubsBalance (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountSubsTransferRecord (params?: {}): Promise<implicitReturnType>;
    abstract privateGetWalletQueryDepositWithdraw (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrdersCreate (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrdersCancel (params?: {}): Promise<implicitReturnType>;
    abstract privatePostAccountWithdrawCoin (params?: {}): Promise<implicitReturnType>;
    abstract privatePostAccountSubsTransfer (params?: {}): Promise<implicitReturnType>;
}