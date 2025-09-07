import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetQuoteV1Ticker24hr(params?: {}): Promise<implicitReturnType>;
    publicGetQuoteV1Ticker24hr(params?: {}): Promise<implicitReturnType>;
    publicGetQuoteV1TickerDepth(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
