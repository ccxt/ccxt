import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetPing(params?: {}): Promise<implicitReturnType>;
    publicGetTime(params?: {}): Promise<implicitReturnType>;
    publicGetExchange(params?: {}): Promise<implicitReturnType>;
    publicGetAssets(params?: {}): Promise<implicitReturnType>;
    publicGetMarkets(params?: {}): Promise<implicitReturnType>;
    publicGetTickers(params?: {}): Promise<implicitReturnType>;
    publicGetCandles(params?: {}): Promise<implicitReturnType>;
    publicGetTrades(params?: {}): Promise<implicitReturnType>;
    publicGetOrderbook(params?: {}): Promise<implicitReturnType>;
    privateGetUser(params?: {}): Promise<implicitReturnType>;
    privateGetWallets(params?: {}): Promise<implicitReturnType>;
    privateGetBalances(params?: {}): Promise<implicitReturnType>;
    privateGetOrders(params?: {}): Promise<implicitReturnType>;
    privateGetFills(params?: {}): Promise<implicitReturnType>;
    privateGetDeposits(params?: {}): Promise<implicitReturnType>;
    privateGetWithdrawals(params?: {}): Promise<implicitReturnType>;
    privateGetWsToken(params?: {}): Promise<implicitReturnType>;
    privatePostWallets(params?: {}): Promise<implicitReturnType>;
    privatePostOrders(params?: {}): Promise<implicitReturnType>;
    privatePostOrdersTest(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawals(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrders(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
