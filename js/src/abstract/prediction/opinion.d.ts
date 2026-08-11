import { implicitReturnType } from '../../base/types.js';
import { default as _Exchange } from '../../base/PredictionExchange.js';
interface Exchange {
    opinionPublicGetMarket(params?: {}): Promise<implicitReturnType>;
    opinionPublicGetMarketMarketId(params?: {}): Promise<implicitReturnType>;
    opinionPublicGetMarketCategoricalMarketId(params?: {}): Promise<implicitReturnType>;
    opinionPublicGetMarketSlugSlug(params?: {}): Promise<implicitReturnType>;
    opinionPublicGetLabel(params?: {}): Promise<implicitReturnType>;
    opinionPublicGetTokenLatestPrice(params?: {}): Promise<implicitReturnType>;
    opinionPublicGetTokenOrderbook(params?: {}): Promise<implicitReturnType>;
    opinionPublicGetTokenPriceHistory(params?: {}): Promise<implicitReturnType>;
    opinionPublicGetQuoteToken(params?: {}): Promise<implicitReturnType>;
    opinionPrivateGetOrder(params?: {}): Promise<implicitReturnType>;
    opinionPrivateGetOrderOrderId(params?: {}): Promise<implicitReturnType>;
    opinionPrivateGetPositionsUserWalletAddress(params?: {}): Promise<implicitReturnType>;
    opinionPrivateGetTradeUserWalletAddress(params?: {}): Promise<implicitReturnType>;
    opinionPrivateGetAuthApiKey(params?: {}): Promise<implicitReturnType>;
    opinionPrivateGetUserAuth(params?: {}): Promise<implicitReturnType>;
    opinionPrivateGetUserBalance(params?: {}): Promise<implicitReturnType>;
    opinionPrivatePostAuthApiKey(params?: {}): Promise<implicitReturnType>;
    opinionPrivatePostOrder(params?: {}): Promise<implicitReturnType>;
    opinionPrivatePostOrderCancel(params?: {}): Promise<implicitReturnType>;
    opinionPrivateDeleteAuthApiKey(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
