import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetApiV1MarketSymbols(params?: {}): Promise<implicitReturnType>;
    publicGetApiV1MarketTradingviewOhlcv(params?: {}): Promise<implicitReturnType>;
    publicGetApiV1MarketDepth(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
