import { List, Dict } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetTokensV2Tag(params?: {}): Promise<List>;
    publicGetTokensV2Search(params?: {}): Promise<List>;
    publicGetPriceV3(params?: {}): Promise<Dict>;
    publicGetSwapV1Quote(params?: {}): Promise<Dict>;
    publicPostSwapV1Swap(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
