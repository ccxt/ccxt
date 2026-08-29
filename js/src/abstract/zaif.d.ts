import { Dict, List } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetDepthPair(params?: {}): Promise<Dict>;
    publicGetCurrenciesPair(params?: {}): Promise<List>;
    publicGetCurrenciesAll(params?: {}): Promise<List>;
    publicGetCurrencyPairsPair(params?: {}): Promise<List>;
    publicGetCurrencyPairsAll(params?: {}): Promise<List>;
    publicGetLastPricePair(params?: {}): Promise<Dict>;
    publicGetTickerPair(params?: {}): Promise<Dict>;
    publicGetTradesPair(params?: {}): Promise<List>;
    privatePostActiveOrders(params?: {}): Promise<Dict>;
    privatePostCancelOrder(params?: {}): Promise<Dict>;
    privatePostDepositHistory(params?: {}): Promise<Dict>;
    privatePostGetIdInfo(params?: {}): Promise<Dict>;
    privatePostGetInfo(params?: {}): Promise<Dict>;
    privatePostGetInfo2(params?: {}): Promise<Dict>;
    privatePostGetPersonalInfo(params?: {}): Promise<Dict>;
    privatePostTrade(params?: {}): Promise<Dict>;
    privatePostTradeHistory(params?: {}): Promise<Dict>;
    privatePostWithdraw(params?: {}): Promise<Dict>;
    privatePostWithdrawHistory(params?: {}): Promise<Dict>;
    ecapiPostCreateInvoice(params?: {}): Promise<Dict>;
    ecapiPostGetInvoice(params?: {}): Promise<Dict>;
    ecapiPostGetInvoiceIdsByOrderNumber(params?: {}): Promise<Dict>;
    ecapiPostCancelInvoice(params?: {}): Promise<Dict>;
    tlapiPostGetPositions(params?: {}): Promise<Dict>;
    tlapiPostPositionHistory(params?: {}): Promise<Dict>;
    tlapiPostActivePositions(params?: {}): Promise<Dict>;
    tlapiPostCreatePosition(params?: {}): Promise<Dict>;
    tlapiPostChangePosition(params?: {}): Promise<Dict>;
    tlapiPostCancelPosition(params?: {}): Promise<Dict>;
    fapiGetGroupsGroupId(params?: {}): Promise<List>;
    fapiGetLastPriceGroupIdPair(params?: {}): Promise<Dict>;
    fapiGetTickerGroupIdPair(params?: {}): Promise<Dict>;
    fapiGetTradesGroupIdPair(params?: {}): Promise<List>;
    fapiGetDepthGroupIdPair(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
