import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetApiSpotProductList(params?: {}): Promise<implicitReturnType>;
    publicGetApiTvTradingViewHistory(params?: {}): Promise<implicitReturnType>;
    quoteGetTickers(params?: {}): Promise<implicitReturnType>;
    quoteGetMkpaiDepthV2(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
