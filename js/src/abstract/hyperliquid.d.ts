import { Dict, List } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
declare abstract class Exchange extends _Exchange {
    publicPostInfo(params?: {}): Promise<Dict | List | string>;
    privatePostExchange(params?: {}): Promise<Dict>;
}
export default Exchange;
