import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetCurrencies(params?: {}): Promise<implicitReturnType>;
    publicGetPairs(params?: {}): Promise<implicitReturnType>;
    publicGetOrderbookPairName(params?: {}): Promise<implicitReturnType>;
    publicGetExchanges(params?: {}): Promise<implicitReturnType>;
    publicGetChartsPairTypeChart(params?: {}): Promise<implicitReturnType>;
    publicGetTicker(params?: {}): Promise<implicitReturnType>;
    privateGetWallets(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersOwn(params?: {}): Promise<implicitReturnType>;
    privateGetOrderId(params?: {}): Promise<implicitReturnType>;
    privateGetExchangesOwn(params?: {}): Promise<implicitReturnType>;
    privateGetDeposits(params?: {}): Promise<implicitReturnType>;
    privateGetWithdraws(params?: {}): Promise<implicitReturnType>;
    privatePostOrder(params?: {}): Promise<implicitReturnType>;
    privatePostOrderCancel(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
