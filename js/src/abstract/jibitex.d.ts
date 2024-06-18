import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetApi1Markets(params?: {}): Promise<implicitReturnType>;
    publicGetApi1OhlcvsTradingView(params?: {}): Promise<implicitReturnType>;
    publicGetApi1OrdersOrderBookMarket(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
