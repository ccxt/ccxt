import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    gatewayPublicGetSymbols(params?: {}): Promise<implicitReturnType>;
    gatewayPublicGetQuery(params?: {}): Promise<implicitReturnType>;
    gatewayPublicGetEdgeQuery(params?: {}): Promise<implicitReturnType>;
    gatewayPublicPostQuery(params?: {}): Promise<implicitReturnType>;
    gatewayPrivatePostExecute(params?: {}): Promise<implicitReturnType>;
    gatewayV2PublicGetAssets(params?: {}): Promise<implicitReturnType>;
    gatewayV2PublicGetPairs(params?: {}): Promise<implicitReturnType>;
    gatewayV2PublicGetOrderbook(params?: {}): Promise<implicitReturnType>;
    archivePost(params?: {}): Promise<implicitReturnType>;
    archiveV2PublicGetTickers(params?: {}): Promise<implicitReturnType>;
    archiveV2PublicGetContracts(params?: {}): Promise<implicitReturnType>;
    archiveV2PublicGetTrades(params?: {}): Promise<implicitReturnType>;
    triggerPrivatePostExecute(params?: {}): Promise<implicitReturnType>;
    triggerPrivatePostQuery(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
