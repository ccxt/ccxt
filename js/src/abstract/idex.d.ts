import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
export default abstract class Exchange extends _Exchange {
    abstract publicGetPing(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTime(params?: {}): Promise<implicitReturnType>;
    abstract publicGetExchange(params?: {}): Promise<implicitReturnType>;
    abstract publicGetAssets(params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarkets(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTickers(params?: {}): Promise<implicitReturnType>;
    abstract publicGetCandles(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTrades(params?: {}): Promise<implicitReturnType>;
    abstract publicGetOrderbook(params?: {}): Promise<implicitReturnType>;
    abstract privateGetUser(params?: {}): Promise<implicitReturnType>;
    abstract privateGetWallets(params?: {}): Promise<implicitReturnType>;
    abstract privateGetBalances(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrders(params?: {}): Promise<implicitReturnType>;
    abstract privateGetFills(params?: {}): Promise<implicitReturnType>;
    abstract privateGetDeposits(params?: {}): Promise<implicitReturnType>;
    abstract privateGetWithdrawals(params?: {}): Promise<implicitReturnType>;
    abstract privateGetWsToken(params?: {}): Promise<implicitReturnType>;
    abstract privatePostWallets(params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrders(params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrdersTest(params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdrawals(params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteOrders(params?: {}): Promise<implicitReturnType>;
}
