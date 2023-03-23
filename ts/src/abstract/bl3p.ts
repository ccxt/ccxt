import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract publicGetMarketTicker (params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketOrderbook (params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketTrades (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarketMoneyDepthFull (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarketMoneyOrderAdd (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarketMoneyOrderCancel (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarketMoneyOrderResult (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarketMoneyOrders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarketMoneyOrdersHistory (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMarketMoneyTradesFetch (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGENMKTMoneyInfo (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGENMKTMoneyDepositAddress (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGENMKTMoneyNewDepositAddress (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGENMKTMoneyWalletHistory (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGENMKTMoneyWithdraw (params?: {}): Promise<implicitReturnType>;
}