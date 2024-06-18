import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetV2Tickers(params?: {}): Promise<implicitReturnType>;
    publicGetV2Ticker(params?: {}): Promise<implicitReturnType>;
    publicGetV2Chart(params?: {}): Promise<implicitReturnType>;
    publicGetV2Orderbook(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
