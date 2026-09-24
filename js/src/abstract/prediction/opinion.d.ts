import { Dict, List } from '../../base/types.js';
import { default as _Exchange } from '../../base/PredictionExchange.js';
interface Exchange {
    opinionPublicGetMarket(params?: {}): Promise<Dict>;
    opinionPublicGetMarketMarketId(params?: {}): Promise<Dict>;
    opinionPublicGetMarketCategoricalMarketId(params?: {}): Promise<Dict>;
    opinionPublicGetMarketSlugSlug(params?: {}): Promise<Dict>;
    opinionPublicGetLabel(params?: {}): Promise<Dict | List>;
    opinionPublicGetTokenLatestPrice(params?: {}): Promise<Dict>;
    opinionPublicGetTokenOrderbook(params?: {}): Promise<Dict>;
    opinionPublicGetTokenPriceHistory(params?: {}): Promise<Dict>;
    opinionPublicGetQuoteToken(params?: {}): Promise<Dict>;
    opinionPrivateGetOrder(params?: {}): Promise<Dict>;
    opinionPrivateGetOrderOrderId(params?: {}): Promise<Dict>;
    opinionPrivateGetPositionsUserWalletAddress(params?: {}): Promise<Dict>;
    opinionPrivateGetTradeUserWalletAddress(params?: {}): Promise<Dict>;
    opinionPrivateGetAuthApiKey(params?: {}): Promise<Dict>;
    opinionPrivateGetUserAuth(params?: {}): Promise<Dict>;
    opinionPrivateGetUserBalance(params?: {}): Promise<Dict>;
    opinionPrivatePostAuthApiKey(params?: {}): Promise<Dict>;
    opinionPrivatePostOrder(params?: {}): Promise<Dict>;
    opinionPrivatePostOrderCancel(params?: {}): Promise<Dict>;
    opinionPrivateDeleteAuthApiKey(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
