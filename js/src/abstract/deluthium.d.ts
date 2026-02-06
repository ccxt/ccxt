import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    privateGetV1ListingPairs(params?: {}): Promise<implicitReturnType>;
    privateGetV1ListingTokens(params?: {}): Promise<implicitReturnType>;
    privateGetV1MarketPair(params?: {}): Promise<implicitReturnType>;
    privateGetV1MarketKlines(params?: {}): Promise<implicitReturnType>;
    privatePostV1QuoteIndicative(params?: {}): Promise<implicitReturnType>;
    privatePostV1QuoteFirm(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
