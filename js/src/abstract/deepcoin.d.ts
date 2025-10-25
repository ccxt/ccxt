import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    v1PrivatePostDeepcoinTradeCancelOrder(params?: {}): Promise<implicitReturnType>;
    v1PrivatePostDeepcoinTradeOrder(params?: {}): Promise<implicitReturnType>;
    v1PrivateGetDeepcoinTradeOrdersPending(params?: {}): Promise<implicitReturnType>;
    v1PrivateGetDeepcoinTradeOrdersHistory(params?: {}): Promise<implicitReturnType>;
    v1PrivateGetDeepcoinTradeOrder(params?: {}): Promise<implicitReturnType>;
    v1PrivateGetDeepcoinTradeFills(params?: {}): Promise<implicitReturnType>;
    v1PrivateGetDeepcoinAccountBalances(params?: {}): Promise<implicitReturnType>;
    v1PublicGetDeepcoinMarketInstruments(params?: {}): Promise<implicitReturnType>;
    v1PublicGetDeepcoinMarketTickers(params?: {}): Promise<implicitReturnType>;
    v1PublicGetDeepcoinMarketBooks(params?: {}): Promise<implicitReturnType>;
    v1PublicGetDeepcoinMarketCandles(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
