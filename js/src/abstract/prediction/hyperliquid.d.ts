import { implicitReturnType } from '../../base/types.js';
import { default as _Exchange } from '../../base/PredictionExchange.js';
interface Exchange {
    publicPostInfo(params?: {}): Promise<implicitReturnType>;
    privatePostExchange(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
