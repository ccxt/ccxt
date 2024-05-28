import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetPlotsMarketInformation(params?: {}): Promise<implicitReturnType>;
    publicGetRApiV1Depth(params?: {}): Promise<implicitReturnType>;
    publicGetRPlotsHistory(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
