import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
export default abstract class Exchange extends _Exchange {
    abstract publicGetDepth(params?: {}): Promise<implicitReturnType>;
    abstract publicGetOrders(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTicker(params?: {}): Promise<implicitReturnType>;
    abstract privatePostBalance(params?: {}): Promise<implicitReturnType>;
    abstract privatePostTradeAdd(params?: {}): Promise<implicitReturnType>;
    abstract privatePostTradeCancel(params?: {}): Promise<implicitReturnType>;
    abstract privatePostTradeList(params?: {}): Promise<implicitReturnType>;
    abstract privatePostTradeView(params?: {}): Promise<implicitReturnType>;
    abstract privatePostWallet(params?: {}): Promise<implicitReturnType>;
}
