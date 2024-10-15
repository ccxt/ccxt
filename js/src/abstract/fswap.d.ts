import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    fswapPublicGetInfo(params?: {}): Promise<implicitReturnType>;
    fswapPublicGetAssets(params?: {}): Promise<implicitReturnType>;
    fswapPublicGetPairs(params?: {}): Promise<implicitReturnType>;
    fswapPublicGetCmcPairs(params?: {}): Promise<implicitReturnType>;
    fswapPublicGetStatsMarkets(params?: {}): Promise<implicitReturnType>;
    fswapPublicGetStatsMarketsBaseQuote(params?: {}): Promise<implicitReturnType>;
    fswapPublicGetStatsMarketsBaseQuoteKlineV2(params?: {}): Promise<implicitReturnType>;
    fswapPublicGetTransactionsBaseQuote(params?: {}): Promise<implicitReturnType>;
    mixinPublicGetNetworkAssetAssetId(params?: {}): Promise<implicitReturnType>;
    fswapPrivateGetOrdersFollowId(params?: {}): Promise<implicitReturnType>;
    fswapPrivateGetTransactionsBaseQuoteMine(params?: {}): Promise<implicitReturnType>;
    fswapPrivatePostActions(params?: {}): Promise<implicitReturnType>;
    mixinPrivateGetSafeSnapshots(params?: {}): Promise<implicitReturnType>;
    mixinPrivateGetSafeDepositEntries(params?: {}): Promise<implicitReturnType>;
    mixinPrivatePostSafeKeys(params?: {}): Promise<implicitReturnType>;
    mixinPrivatePostSafeTransactionRequests(params?: {}): Promise<implicitReturnType>;
    mixinPrivatePostSafeTransactions(params?: {}): Promise<implicitReturnType>;
    ccxtProxyPost4swapPreorder(params?: {}): Promise<implicitReturnType>;
    ccxtProxyPostMixinEncodetx(params?: {}): Promise<implicitReturnType>;
    ccxtProxyPostMixinMixaddress(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
