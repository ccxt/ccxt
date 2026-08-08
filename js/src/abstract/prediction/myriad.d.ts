import { Dict, List } from '../../base/types.js';
import { default as _Exchange } from '../../base/PredictionExchange.js';
interface Exchange {
    myriadPublicGetQuestions(params?: {}): Promise<Dict>;
    myriadPublicGetQuestionsId(params?: {}): Promise<Dict>;
    myriadPublicGetMarkets(params?: {}): Promise<Dict>;
    myriadPublicGetMarketsId(params?: {}): Promise<Dict>;
    myriadPublicGetMarketsNetworkIdId(params?: {}): Promise<Dict>;
    myriadPublicGetMarketsIdEvents(params?: {}): Promise<Dict>;
    myriadPublicGetMarketsIdOrderbook(params?: {}): Promise<Dict>;
    myriadPublicGetMarketsIdTrades(params?: {}): Promise<List>;
    myriadPublicGetMarketsIdHolders(params?: {}): Promise<Dict>;
    myriadPublicGetMarketsIdReferrals(params?: {}): Promise<Dict>;
    myriadPublicGetEvents(params?: {}): Promise<Dict>;
    myriadPublicGetOrders(params?: {}): Promise<Dict>;
    myriadPublicGetOrdersHash(params?: {}): Promise<Dict>;
    myriadPublicGetUsersAddressEvents(params?: {}): Promise<Dict>;
    myriadPublicGetUsersAddressReferrals(params?: {}): Promise<Dict>;
    myriadPublicGetUsersAddressPortfolio(params?: {}): Promise<Dict>;
    myriadPublicGetUsersAddressMarkets(params?: {}): Promise<Dict>;
    myriadPublicGetTags(params?: {}): Promise<Dict>;
    myriadPublicGetTopics(params?: {}): Promise<Dict>;
    myriadPublicPostMarketsQuote(params?: {}): Promise<Dict>;
    myriadPublicPostMarketsClaim(params?: {}): Promise<Dict>;
    myriadPublicPostOrders(params?: {}): Promise<Dict>;
    myriadPublicPostOrdersCancelBatch(params?: {}): Promise<Dict>;
    myriadPublicPostOrdersCancelAll(params?: {}): Promise<Dict>;
    myriadPublicPostPositionsSplit(params?: {}): Promise<Dict>;
    myriadPublicPostPositionsMerge(params?: {}): Promise<Dict>;
    myriadPublicPostPositionsRedeem(params?: {}): Promise<Dict>;
    myriadPublicPostPositionsRedeemVoided(params?: {}): Promise<Dict>;
    myriadPublicPostPositionsNegRiskSplit(params?: {}): Promise<Dict>;
    myriadPublicPostPositionsNegRiskMerge(params?: {}): Promise<Dict>;
    myriadPublicDeleteOrdersHash(params?: {}): Promise<Dict>;
    myriadPrivatePostMarketsQuoteWithFee(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
