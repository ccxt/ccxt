import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarketTicker(params?: {}): Promise<implicitReturnType>;
    publicGetMarketOrderbook(params?: {}): Promise<implicitReturnType>;
    publicGetMarketTrades(params?: {}): Promise<implicitReturnType>;
    privatePostMarketMoneyDepthFull(params?: {}): Promise<implicitReturnType>;
    privatePostMarketMoneyOrderAdd(params?: {}): Promise<implicitReturnType>;
    privatePostMarketMoneyOrderCancel(params?: {}): Promise<implicitReturnType>;
    privatePostMarketMoneyOrderResult(params?: {}): Promise<implicitReturnType>;
    privatePostMarketMoneyOrders(params?: {}): Promise<implicitReturnType>;
    privatePostMarketMoneyOrdersHistory(params?: {}): Promise<implicitReturnType>;
    privatePostMarketMoneyTradesFetch(params?: {}): Promise<implicitReturnType>;
    privatePostGENMKTMoneyInfo(params?: {}): Promise<implicitReturnType>;
    privatePostGENMKTMoneyDepositAddress(params?: {}): Promise<implicitReturnType>;
    privatePostGENMKTMoneyNewDepositAddress(params?: {}): Promise<implicitReturnType>;
    privatePostGENMKTMoneyWalletHistory(params?: {}): Promise<implicitReturnType>;
    privatePostGENMKTMoneyWithdraw(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
