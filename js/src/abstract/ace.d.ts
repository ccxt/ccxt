import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
export default abstract class Exchange extends _Exchange {
    abstract publicGetOapiV2ListTradePrice(params?: {}): Promise<implicitReturnType>;
    abstract publicGetOapiV2ListMarketPair(params?: {}): Promise<implicitReturnType>;
    abstract publicGetOpenV2PublicGetOrderBook(params?: {}): Promise<implicitReturnType>;
    abstract privatePostV2CoinCustomerAccount(params?: {}): Promise<implicitReturnType>;
    abstract privatePostV2KlineGetKline(params?: {}): Promise<implicitReturnType>;
    abstract privatePostV2OrderOrder(params?: {}): Promise<implicitReturnType>;
    abstract privatePostV2OrderCancel(params?: {}): Promise<implicitReturnType>;
    abstract privatePostV2OrderGetOrderList(params?: {}): Promise<implicitReturnType>;
    abstract privatePostV2OrderShowOrderStatus(params?: {}): Promise<implicitReturnType>;
    abstract privatePostV2OrderShowOrderHistory(params?: {}): Promise<implicitReturnType>;
    abstract privatePostV2OrderGetTradeList(params?: {}): Promise<implicitReturnType>;
}
