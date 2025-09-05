import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    _restGetMarket(params?: {}): Promise<implicitReturnType>;
    _restGetMarketCurrencyPair(params?: {}): Promise<implicitReturnType>;
    _restGetCryptoTokenInfo(params?: {}): Promise<implicitReturnType>;
    publicGetMarketCurrencyPairGetDepth(params?: {}): Promise<implicitReturnType>;
    publicGetMarketCurrencyPairTicker(params?: {}): Promise<implicitReturnType>;
    publicGetMarketCurrencyPairGetTrades(params?: {}): Promise<implicitReturnType>;
    publicGetMarketCurrencyPairGetGraph(params?: {}): Promise<implicitReturnType>;
    publicGetCMCSummary(params?: {}): Promise<implicitReturnType>;
    publicGetCMCCurrencyPairTicker(params?: {}): Promise<implicitReturnType>;
    privateGetUserWallet(params?: {}): Promise<implicitReturnType>;
    privateGetMarketCurrencyPairOrder(params?: {}): Promise<implicitReturnType>;
    privateGetMarketOrderOrderUuid(params?: {}): Promise<implicitReturnType>;
    privateGetMarketCurrencyPairTrade(params?: {}): Promise<implicitReturnType>;
    privateGetMarketTradeFeeQuery(params?: {}): Promise<implicitReturnType>;
    privateGetUnitCurrency(params?: {}): Promise<implicitReturnType>;
    privateGetCryptoTokenCurrency(params?: {}): Promise<implicitReturnType>;
    privateGetCryptoTokenCurrencyChains(params?: {}): Promise<implicitReturnType>;
    privatePostMarketCurrencyPairOrder(params?: {}): Promise<implicitReturnType>;
    privatePostCryptoAddressFetch(params?: {}): Promise<implicitReturnType>;
    privatePostCryptoDisbursementWithdraw(params?: {}): Promise<implicitReturnType>;
    privateDeleteMarketOrderOrderUuid(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
