import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetOapiV2ListTradePrice(params?: {}): Promise<implicitReturnType>;
    publicGetOapiV2ListMarketPair(params?: {}): Promise<implicitReturnType>;
    publicGetOpenV2PublicGetOrderBook(params?: {}): Promise<implicitReturnType>;
    privatePostV2CoinCustomerAccount(params?: {}): Promise<implicitReturnType>;
    privatePostV2KlineGetKline(params?: {}): Promise<implicitReturnType>;
    privatePostV2OrderOrder(params?: {}): Promise<implicitReturnType>;
    privatePostV2OrderCancel(params?: {}): Promise<implicitReturnType>;
    privatePostV2OrderGetOrderList(params?: {}): Promise<implicitReturnType>;
    privatePostV2OrderShowOrderStatus(params?: {}): Promise<implicitReturnType>;
    privatePostV2OrderShowOrderHistory(params?: {}): Promise<implicitReturnType>;
    privatePostV2OrderGetTradeList(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
