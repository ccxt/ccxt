import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetV1Markets(params?: {}): Promise<implicitReturnType>;
    publicGetV1CurrenciesStats(params?: {}): Promise<implicitReturnType>;
    publicGetV1Depth(params?: {}): Promise<implicitReturnType>;
    publicGetV1UdfHistory(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
