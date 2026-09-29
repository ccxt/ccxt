import { Dict, List } from '../../base/types.js';
import { default as _Exchange } from '../../base/PredictionExchange.js';
interface Exchange {
    publicPostInfo(params?: {}): Promise<Dict | List | string>;
    privatePostExchange(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
