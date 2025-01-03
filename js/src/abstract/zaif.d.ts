import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetDepthPair(params?: {}): Promise<implicitReturnType>;
    publicGetCurrenciesPair(params?: {}): Promise<implicitReturnType>;
    publicGetCurrenciesAll(params?: {}): Promise<implicitReturnType>;
    publicGetCurrencyPairsPair(params?: {}): Promise<implicitReturnType>;
    publicGetCurrencyPairsAll(params?: {}): Promise<implicitReturnType>;
    publicGetLastPricePair(params?: {}): Promise<implicitReturnType>;
    publicGetTickerPair(params?: {}): Promise<implicitReturnType>;
    publicGetTradesPair(params?: {}): Promise<implicitReturnType>;
    privatePostActiveOrders(params?: {}): Promise<implicitReturnType>;
    privatePostCancelOrder(params?: {}): Promise<implicitReturnType>;
    privatePostDepositHistory(params?: {}): Promise<implicitReturnType>;
    privatePostGetIdInfo(params?: {}): Promise<implicitReturnType>;
    privatePostGetInfo(params?: {}): Promise<implicitReturnType>;
    privatePostGetInfo2(params?: {}): Promise<implicitReturnType>;
    privatePostGetPersonalInfo(params?: {}): Promise<implicitReturnType>;
    privatePostTrade(params?: {}): Promise<implicitReturnType>;
    privatePostTradeHistory(params?: {}): Promise<implicitReturnType>;
    privatePostWithdraw(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawHistory(params?: {}): Promise<implicitReturnType>;
    ecapiPostCreateInvoice(params?: {}): Promise<implicitReturnType>;
    ecapiPostGetInvoice(params?: {}): Promise<implicitReturnType>;
    ecapiPostGetInvoiceIdsByOrderNumber(params?: {}): Promise<implicitReturnType>;
    ecapiPostCancelInvoice(params?: {}): Promise<implicitReturnType>;
    tlapiPostGetPositions(params?: {}): Promise<implicitReturnType>;
    tlapiPostPositionHistory(params?: {}): Promise<implicitReturnType>;
    tlapiPostActivePositions(params?: {}): Promise<implicitReturnType>;
    tlapiPostCreatePosition(params?: {}): Promise<implicitReturnType>;
    tlapiPostChangePosition(params?: {}): Promise<implicitReturnType>;
    tlapiPostCancelPosition(params?: {}): Promise<implicitReturnType>;
    fapiGetGroupsGroupId(params?: {}): Promise<implicitReturnType>;
    fapiGetLastPriceGroupIdPair(params?: {}): Promise<implicitReturnType>;
    fapiGetTickerGroupIdPair(params?: {}): Promise<implicitReturnType>;
    fapiGetTradesGroupIdPair(params?: {}): Promise<implicitReturnType>;
    fapiGetDepthGroupIdPair(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
