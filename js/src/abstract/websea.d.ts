import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetOpenApiMarketSymbols(params?: {}): Promise<implicitReturnType>;
    publicGetOpenApiMarketCurrencies(params?: {}): Promise<implicitReturnType>;
    publicGetOpenApiMarketTrade(params?: {}): Promise<implicitReturnType>;
    publicGetOpenApiMarketDepth(params?: {}): Promise<implicitReturnType>;
    publicGetOpenApiMarketOrderbook(params?: {}): Promise<implicitReturnType>;
    publicGetOpenApiMarketKline(params?: {}): Promise<implicitReturnType>;
    publicGetOpenApiMarket24kline(params?: {}): Promise<implicitReturnType>;
    publicGetOpenApiMarket24klineList(params?: {}): Promise<implicitReturnType>;
    publicGetOpenApiMarketPrecision(params?: {}): Promise<implicitReturnType>;
    publicGetOpenApiContractSymbols(params?: {}): Promise<implicitReturnType>;
    publicGetOpenApiContractPrecision(params?: {}): Promise<implicitReturnType>;
    publicGetOpenApiContractTrade(params?: {}): Promise<implicitReturnType>;
    publicGetOpenApiContractDepth(params?: {}): Promise<implicitReturnType>;
    publicGetOpenApiContractKline(params?: {}): Promise<implicitReturnType>;
    publicGetOpenApiContract24kline(params?: {}): Promise<implicitReturnType>;
    privateGetOpenApiWalletList(params?: {}): Promise<implicitReturnType>;
    privateGetOpenApiEntrustHistoryList(params?: {}): Promise<implicitReturnType>;
    privateGetOpenApiEntrustCurrentList(params?: {}): Promise<implicitReturnType>;
    privateGetOpenApiEntrustStatus(params?: {}): Promise<implicitReturnType>;
    privateGetOpenApiContractWalletListFull(params?: {}): Promise<implicitReturnType>;
    privateGetOpenApiContractPosition(params?: {}): Promise<implicitReturnType>;
    privateGetOpenApiContractCurrentList(params?: {}): Promise<implicitReturnType>;
    privateGetOpenApiContractGetOrderDetail(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiEntrustAdd(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiEntrustCancel(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiEntrustOrderDetail(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiEntrustOrderTrade(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiEntrustHistoryDetail(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiWalletDetail(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiContractCancel(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiContractAdd(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
