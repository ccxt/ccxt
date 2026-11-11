import { Dict, List } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
declare abstract class Exchange extends _Exchange {
    publicGetProducts(params?: {}): Promise<Dict | List>;
    publicGetProductsIdBook(params?: {}): Promise<Dict | List>;
    publicGetProductsIdTrades(params?: {}): Promise<Dict | List>;
    publicGetProductsIdCandles(params?: {}): Promise<Dict | List>;
}
export default Exchange;
