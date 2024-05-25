import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetExchangeApiV10ExchangePairs(params?: {}): Promise<implicitReturnType>;
    publicGetExchangeApiV10ExchangeChartTvHistory(params?: {}): Promise<implicitReturnType>;
    publicGetExchangeApiV10ExchangeOrderbooks(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
