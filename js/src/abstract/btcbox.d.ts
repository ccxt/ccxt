import { Dict, List } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
declare abstract class Exchange extends _Exchange {
    publicGetDepth(params?: {}): Promise<Dict>;
    publicGetOrders(params?: {}): Promise<List>;
    publicGetTicker(params?: {}): Promise<Dict>;
    publicGetTickers(params?: {}): Promise<Dict>;
    privatePostBalance(params?: {}): Promise<Dict>;
    privatePostOrderHistory(params?: {}): Promise<List>;
    privatePostTradeAdd(params?: {}): Promise<Dict>;
    privatePostTradeCancel(params?: {}): Promise<Dict>;
    privatePostTradeList(params?: {}): Promise<List>;
    privatePostTradeView(params?: {}): Promise<Dict>;
    privatePostWallet(params?: {}): Promise<Dict>;
    webApiGetAjaxCoinCoinInfo(params?: {}): Promise<Dict>;
}
export default Exchange;
