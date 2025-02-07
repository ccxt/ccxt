import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarkets(params?: {}): Promise<implicitReturnType>;
    publicGetOrdersMarket(params?: {}): Promise<implicitReturnType>;
    publicGetTickerMarket(params?: {}): Promise<implicitReturnType>;
    publicGetHistoryMarket(params?: {}): Promise<implicitReturnType>;
    privateGetAccountBalance(params?: {}): Promise<implicitReturnType>;
    privateGetAccountBalances(params?: {}): Promise<implicitReturnType>;
    privateGetAccountOrderUuid(params?: {}): Promise<implicitReturnType>;
    privatePostOrderBuy(params?: {}): Promise<implicitReturnType>;
    privatePostOrderSell(params?: {}): Promise<implicitReturnType>;
    privatePostOrderCancel(params?: {}): Promise<implicitReturnType>;
    privatePostOrders(params?: {}): Promise<implicitReturnType>;
    privatePostAccountOrders(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
