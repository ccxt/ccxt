import { implicitReturnType } from '../../base/types.js';
import { default as _Exchange } from '../../base/PredictionExchange.js';
interface Exchange {
    myriadPublicGetQuestions(params?: {}): Promise<implicitReturnType>;
    myriadPublicGetQuestionsId(params?: {}): Promise<implicitReturnType>;
    myriadPublicGetMarkets(params?: {}): Promise<implicitReturnType>;
    myriadPublicGetMarketsId(params?: {}): Promise<implicitReturnType>;
    myriadPublicGetMarketsNetworkIdId(params?: {}): Promise<implicitReturnType>;
    myriadPublicGetMarketsIdEvents(params?: {}): Promise<implicitReturnType>;
    myriadPublicGetMarketsIdOrderbook(params?: {}): Promise<implicitReturnType>;
    myriadPublicGetMarketsIdTrades(params?: {}): Promise<implicitReturnType>;
    myriadPublicGetMarketsIdHolders(params?: {}): Promise<implicitReturnType>;
    myriadPublicGetMarketsIdReferrals(params?: {}): Promise<implicitReturnType>;
    myriadPublicGetEvents(params?: {}): Promise<implicitReturnType>;
    myriadPublicGetOrders(params?: {}): Promise<implicitReturnType>;
    myriadPublicGetOrdersHash(params?: {}): Promise<implicitReturnType>;
    myriadPublicGetUsersAddressEvents(params?: {}): Promise<implicitReturnType>;
    myriadPublicGetUsersAddressReferrals(params?: {}): Promise<implicitReturnType>;
    myriadPublicGetUsersAddressPortfolio(params?: {}): Promise<implicitReturnType>;
    myriadPublicGetUsersAddressMarkets(params?: {}): Promise<implicitReturnType>;
    myriadPublicGetTags(params?: {}): Promise<implicitReturnType>;
    myriadPublicGetTopics(params?: {}): Promise<implicitReturnType>;
    myriadPublicPostMarketsQuote(params?: {}): Promise<implicitReturnType>;
    myriadPublicPostMarketsClaim(params?: {}): Promise<implicitReturnType>;
    myriadPublicPostOrders(params?: {}): Promise<implicitReturnType>;
    myriadPublicPostOrdersCancelBatch(params?: {}): Promise<implicitReturnType>;
    myriadPublicPostOrdersCancelAll(params?: {}): Promise<implicitReturnType>;
    myriadPublicPostPositionsSplit(params?: {}): Promise<implicitReturnType>;
    myriadPublicPostPositionsMerge(params?: {}): Promise<implicitReturnType>;
    myriadPublicPostPositionsRedeem(params?: {}): Promise<implicitReturnType>;
    myriadPublicPostPositionsRedeemVoided(params?: {}): Promise<implicitReturnType>;
    myriadPublicPostPositionsNegRiskSplit(params?: {}): Promise<implicitReturnType>;
    myriadPublicPostPositionsNegRiskMerge(params?: {}): Promise<implicitReturnType>;
    myriadPublicDeleteOrdersHash(params?: {}): Promise<implicitReturnType>;
    myriadPrivatePostMarketsQuoteWithFee(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
