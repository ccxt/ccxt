import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    v1PrivateGetOrders(params?: {}): Promise<implicitReturnType>;
    v1PrivateGetOrdersId(params?: {}): Promise<implicitReturnType>;
    v1PrivateGetTrades(params?: {}): Promise<implicitReturnType>;
    v1PrivatePostOrders(params?: {}): Promise<implicitReturnType>;
    v1PrivatePatchOrdersIdCancel(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
