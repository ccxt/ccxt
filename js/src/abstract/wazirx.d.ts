import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetExchangeInfo(params?: {}): Promise<implicitReturnType>;
    publicGetDepth(params?: {}): Promise<implicitReturnType>;
    publicGetPing(params?: {}): Promise<implicitReturnType>;
    publicGetSystemStatus(params?: {}): Promise<implicitReturnType>;
    publicGetTickers24hr(params?: {}): Promise<implicitReturnType>;
    publicGetTicker24hr(params?: {}): Promise<implicitReturnType>;
    publicGetTime(params?: {}): Promise<implicitReturnType>;
    publicGetTrades(params?: {}): Promise<implicitReturnType>;
    publicGetKlines(params?: {}): Promise<implicitReturnType>;
    privateGetAccount(params?: {}): Promise<implicitReturnType>;
    privateGetAllOrders(params?: {}): Promise<implicitReturnType>;
    privateGetFunds(params?: {}): Promise<implicitReturnType>;
    privateGetHistoricalTrades(params?: {}): Promise<implicitReturnType>;
    privateGetOpenOrders(params?: {}): Promise<implicitReturnType>;
    privateGetOrder(params?: {}): Promise<implicitReturnType>;
    privateGetMyTrades(params?: {}): Promise<implicitReturnType>;
    privateGetCoins(params?: {}): Promise<implicitReturnType>;
    privateGetCryptoWithdraws(params?: {}): Promise<implicitReturnType>;
    privateGetCryptoDepositsAddress(params?: {}): Promise<implicitReturnType>;
    privateGetSubAccountFundTransferHistory(params?: {}): Promise<implicitReturnType>;
    privateGetSubAccountAccounts(params?: {}): Promise<implicitReturnType>;
    privatePostOrder(params?: {}): Promise<implicitReturnType>;
    privatePostOrderTest(params?: {}): Promise<implicitReturnType>;
    privatePostCreateAuthToken(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrder(params?: {}): Promise<implicitReturnType>;
    privateDeleteOpenOrders(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
