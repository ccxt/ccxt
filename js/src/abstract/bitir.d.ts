import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetV1Market(params?: {}): Promise<implicitReturnType>;
    publicGetV2UdfRealHistory(params?: {}): Promise<implicitReturnType>;
    publicGetV1MarketIdOrder(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
