import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarketOrderbook(params?: {}): Promise<implicitReturnType>;
    publicGetMarketTrades(params?: {}): Promise<implicitReturnType>;
    publicGetMarketTicker(params?: {}): Promise<implicitReturnType>;
    publicGetMarketAllTickers(params?: {}): Promise<implicitReturnType>;
    publicGetExTradepairs(params?: {}): Promise<implicitReturnType>;
    publicGetExCurrencies(params?: {}): Promise<implicitReturnType>;
    publicGetMarketKlines(params?: {}): Promise<implicitReturnType>;
    privatePostExOrders(params?: {}): Promise<implicitReturnType>;
    privateGetExOrders(params?: {}): Promise<implicitReturnType>;
    privateGetAccountBalance(params?: {}): Promise<implicitReturnType>;
    privateGetExFeeSymbol(params?: {}): Promise<implicitReturnType>;
    privateGetExOrdersOrderId(params?: {}): Promise<implicitReturnType>;
    privateGetExOrdersFillsOrderId(params?: {}): Promise<implicitReturnType>;
    privateDeleteExOrdersOrderId(params?: {}): Promise<implicitReturnType>;
    privateDeleteExOrders(params?: {}): Promise<implicitReturnType>;
    privateDeleteExOrdersCancelAll(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
