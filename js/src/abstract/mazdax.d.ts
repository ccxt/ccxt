import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarketSymbols(params?: {}): Promise<implicitReturnType>;
    publicGetMarketRollingprice(params?: {}): Promise<implicitReturnType>;
    publicGetMarketCandle(params?: {}): Promise<implicitReturnType>;
    publicGetMarketOrder(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
