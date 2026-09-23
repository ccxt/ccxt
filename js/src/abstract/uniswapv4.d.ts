import { Dict } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    subgraphPostGraphql(params?: {}): Promise<Dict>;
    tradingPostCheckApproval(params?: {}): Promise<Dict>;
    tradingPostQuote(params?: {}): Promise<Dict>;
    tradingPostSwap(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
