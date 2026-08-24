import { List, Dict } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    gatewayPublicGetSymbols(params?: {}): Promise<List>;
    gatewayPublicGetQuery(params?: {}): Promise<Dict>;
    gatewayPublicGetEdgeQuery(params?: {}): Promise<Dict>;
    gatewayPublicPostQuery(params?: {}): Promise<Dict>;
    gatewayPrivatePostExecute(params?: {}): Promise<Dict>;
    gatewayV2PublicGetAssets(params?: {}): Promise<List>;
    gatewayV2PublicGetPairs(params?: {}): Promise<List>;
    gatewayV2PublicGetOrderbook(params?: {}): Promise<Dict>;
    archivePost(params?: {}): Promise<Dict>;
    archiveV2PublicGetTickers(params?: {}): Promise<Dict>;
    archiveV2PublicGetContracts(params?: {}): Promise<Dict>;
    archiveV2PublicGetTrades(params?: {}): Promise<List>;
    triggerPrivatePostExecute(params?: {}): Promise<Dict>;
    triggerPrivatePostQuery(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
