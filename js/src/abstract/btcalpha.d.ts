import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
export default abstract class Exchange extends _Exchange {
    abstract publicGetCurrencies(params?: {}): Promise<implicitReturnType>;
    abstract publicGetPairs(params?: {}): Promise<implicitReturnType>;
    abstract publicGetOrderbookPairName(params?: {}): Promise<implicitReturnType>;
    abstract publicGetExchanges(params?: {}): Promise<implicitReturnType>;
    abstract publicGetChartsPairTypeChart(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTicker(params?: {}): Promise<implicitReturnType>;
    abstract privateGetWallets(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrdersOwn(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrderId(params?: {}): Promise<implicitReturnType>;
    abstract privateGetExchangesOwn(params?: {}): Promise<implicitReturnType>;
    abstract privateGetDeposits(params?: {}): Promise<implicitReturnType>;
    abstract privateGetWithdraws(params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrder(params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrderCancel(params?: {}): Promise<implicitReturnType>;
}
