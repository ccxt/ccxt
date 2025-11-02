import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    v3PublicGetCurrencies(params?: {}): Promise<implicitReturnType>;
    v3PublicGetMarkets(params?: {}): Promise<implicitReturnType>;
    v3PublicGetMarketsTicker24hr(params?: {}): Promise<implicitReturnType>;
    v3PublicGetMarketsMarketOrderbook(params?: {}): Promise<implicitReturnType>;
    v3PublicGetMarketsMarketCandlesticks(params?: {}): Promise<implicitReturnType>;
    v3PublicGetMarketsMarketTradesHistory(params?: {}): Promise<implicitReturnType>;
    v3PublicGetMarketsMarketTicker24hr(params?: {}): Promise<implicitReturnType>;
    v3PrivateGetAccounts(params?: {}): Promise<implicitReturnType>;
    v3PrivateGetAccountsSymbolTransactions(params?: {}): Promise<implicitReturnType>;
    v3PrivateGetOrders(params?: {}): Promise<implicitReturnType>;
    v3PrivateGetOrdersByOrderIdId(params?: {}): Promise<implicitReturnType>;
    v3PrivateGetTrades(params?: {}): Promise<implicitReturnType>;
    v3PrivateGetDepositsAddress(params?: {}): Promise<implicitReturnType>;
    v3PrivateGetDeposits(params?: {}): Promise<implicitReturnType>;
    v3PrivateGetWithdrawals(params?: {}): Promise<implicitReturnType>;
    v3PrivateGetMeFeesTrading(params?: {}): Promise<implicitReturnType>;
    v3PrivatePostOrders(params?: {}): Promise<implicitReturnType>;
    v3PrivatePostOrdersBatch(params?: {}): Promise<implicitReturnType>;
    v3PrivatePostOrdersCancelReplace(params?: {}): Promise<implicitReturnType>;
    v3PrivatePostWithdrawals(params?: {}): Promise<implicitReturnType>;
    v3PrivatePutOrdersCancel(params?: {}): Promise<implicitReturnType>;
    statusPublicGetStatus(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
