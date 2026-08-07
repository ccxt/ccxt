import { Dict, List } from '../../base/types.js';
import { default as _Exchange } from '../../base/PredictionExchange.js';
interface Exchange {
    sapiPrivateGetCategoryList(params?: {}): Promise<Dict>;
    sapiPrivateGetMarketList(params?: {}): Promise<Dict>;
    sapiPrivateGetMarketSearch(params?: {}): Promise<List>;
    sapiPrivateGetMarketDetail(params?: {}): Promise<Dict>;
    sapiPrivateGetOrderBook(params?: {}): Promise<Dict>;
    sapiPrivateGetOrderBookLastTradePrice(params?: {}): Promise<Dict>;
    sapiPrivateGetWalletList(params?: {}): Promise<Dict>;
    sapiPrivateGetBalancePaymentOptions(params?: {}): Promise<Dict>;
    sapiPrivateGetQuotaLimitStatus(params?: {}): Promise<Dict>;
    sapiPrivateGetPnlPortfolio(params?: {}): Promise<Dict>;
    sapiPrivateGetPnlQuery(params?: {}): Promise<Dict>;
    sapiPrivateGetPositionList(params?: {}): Promise<Dict>;
    sapiPrivateGetPositionFilter(params?: {}): Promise<Dict>;
    sapiPrivateGetPositionToken(params?: {}): Promise<Dict>;
    sapiPrivateGetPositionSettledHistory(params?: {}): Promise<Dict>;
    sapiPrivateGetOrderList(params?: {}): Promise<Dict>;
    sapiPrivateGetOrderHistory(params?: {}): Promise<Dict>;
    sapiPrivatePostTradeGetQuote(params?: {}): Promise<Dict>;
    sapiPrivatePostTradePlaceOrderBundle(params?: {}): Promise<Dict>;
    sapiPrivatePostTradeBatchCancel(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
