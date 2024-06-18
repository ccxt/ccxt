import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarketSymbolThumbTrend(params?: {}): Promise<implicitReturnType>;
    publicGetMarketHistory(params?: {}): Promise<implicitReturnType>;
    publicGetMarketExchangePlateFull(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
