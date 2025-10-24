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
    contractGetOpenApiContractSymbols(params?: {}): Promise<implicitReturnType>;
    contractGetOpenApiContractTrade(params?: {}): Promise<implicitReturnType>;
    contractGetOpenApiContractDepth(params?: {}): Promise<implicitReturnType>;
    contractGetOpenApiContractKline(params?: {}): Promise<implicitReturnType>;
    contractGetOpenApiContract24kline(params?: {}): Promise<implicitReturnType>;
    contractGetOpenApiContractCurrentList(params?: {}): Promise<implicitReturnType>;
    privateGetOpenApiWalletList(params?: {}): Promise<implicitReturnType>;
    privateGetOpenApiEntrustHistoryList(params?: {}): Promise<implicitReturnType>;
    privateGetOpenApiEntrustCurrentList(params?: {}): Promise<implicitReturnType>;
    privateGetOpenApiFuturesEntrustOrderList(params?: {}): Promise<implicitReturnType>;
    privateGetOpenApiFuturesPositionList(params?: {}): Promise<implicitReturnType>;
    privateGetOpenApiContractWalletListFull(params?: {}): Promise<implicitReturnType>;
    privateGetOpenApiContractPosition(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiEntrustAdd(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiEntrustCancel(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiEntrustOrderDetail(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiEntrustOrderTrade(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiEntrustHistoryDetail(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiWalletDetail(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiFuturesEntrustAdd(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiFuturesEntrustCancel(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiFuturesEntrustOrderDetail(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiFuturesPositionDetail(params?: {}): Promise<implicitReturnType>;
    privatePostOpenApiFuturesPositionSetLeverage(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
