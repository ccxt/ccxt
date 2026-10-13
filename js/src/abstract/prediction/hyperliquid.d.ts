import { Dict, List } from '../../base/types.js';
import { default as _Exchange } from '../../base/PredictionExchange.js';
declare abstract class Exchange extends _Exchange {
    publicPostInfo(params?: {}): Promise<Dict | List | string>;
    privatePostExchange(params?: {}): Promise<Dict>;
}
export default Exchange;
