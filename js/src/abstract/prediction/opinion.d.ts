import { Dict, List } from '../../base/types.js';
import { default as _Exchange } from '../../base/PredictionExchange.js';
interface Exchange {
    opinionPublicGetMarket(params?: {}): Promise<Dict | List>;
    opinionPublicGetMarketMarketId(params?: {}): Promise<Dict | List>;
    opinionPublicGetMarketCategoricalMarketId(params?: {}): Promise<Dict | List>;
    opinionPublicGetMarketSlugSlug(params?: {}): Promise<Dict | List>;
    opinionPublicGetLabel(params?: {}): Promise<Dict | List>;
    opinionPublicGetTokenLatestPrice(params?: {}): Promise<Dict | List>;
    opinionPublicGetTokenOrderbook(params?: {}): Promise<Dict | List>;
    opinionPublicGetTokenPriceHistory(params?: {}): Promise<Dict | List>;
    opinionPublicGetQuoteToken(params?: {}): Promise<Dict | List>;
    opinionPrivateGetOrder(params?: {}): Promise<Dict | List>;
    opinionPrivateGetOrderOrderId(params?: {}): Promise<Dict | List>;
    opinionPrivateGetPositionsUserWalletAddress(params?: {}): Promise<Dict | List>;
    opinionPrivateGetTradeUserWalletAddress(params?: {}): Promise<Dict | List>;
    opinionPrivateGetAuthApiKey(params?: {}): Promise<Dict | List>;
    opinionPrivateGetUserAuth(params?: {}): Promise<Dict | List>;
    opinionPrivateGetUserBalance(params?: {}): Promise<Dict | List>;
    opinionPrivatePostAuthApiKey(params?: {}): Promise<Dict | List>;
    opinionPrivatePostOrder(params?: {}): Promise<Dict | List>;
    opinionPrivatePostOrderCancel(params?: {}): Promise<Dict | List>;
    opinionPrivateDeleteAuthApiKey(params?: {}): Promise<Dict | List>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
