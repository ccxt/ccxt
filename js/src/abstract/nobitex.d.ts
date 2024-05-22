import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarketStats(params?: {}): Promise<implicitReturnType>;
    publicGetMarketUdfHistory(params?: {}): Promise<implicitReturnType>;
    publicGetV2Orderbook(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
