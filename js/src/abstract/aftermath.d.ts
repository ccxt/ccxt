import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarkets(params?: {}): Promise<implicitReturnType>;
    publicGetCurrencies(params?: {}): Promise<implicitReturnType>;
    publicPostTicker(params?: {}): Promise<implicitReturnType>;
    publicPostOrderbook(params?: {}): Promise<implicitReturnType>;
    publicPostTrades(params?: {}): Promise<implicitReturnType>;
    publicPostOHLCV(params?: {}): Promise<implicitReturnType>;
    privatePostAccounts(params?: {}): Promise<implicitReturnType>;
    privatePostBalance(params?: {}): Promise<implicitReturnType>;
    privatePostMyPendingOrders(params?: {}): Promise<implicitReturnType>;
    privatePostPositions(params?: {}): Promise<implicitReturnType>;
    privatePostBuildAllocate(params?: {}): Promise<implicitReturnType>;
    privatePostBuildCancelOrders(params?: {}): Promise<implicitReturnType>;
    privatePostBuildCreateAccount(params?: {}): Promise<implicitReturnType>;
    privatePostBuildCreateOrders(params?: {}): Promise<implicitReturnType>;
    privatePostBuildDeallocate(params?: {}): Promise<implicitReturnType>;
    privatePostBuildDeposit(params?: {}): Promise<implicitReturnType>;
    privatePostBuildSetLeverage(params?: {}): Promise<implicitReturnType>;
    privatePostBuildWithdraw(params?: {}): Promise<implicitReturnType>;
    privatePostSubmitAllocate(params?: {}): Promise<implicitReturnType>;
    privatePostSubmitCancelOrders(params?: {}): Promise<implicitReturnType>;
    privatePostSubmitCreateAccount(params?: {}): Promise<implicitReturnType>;
    privatePostSubmitCreateOrders(params?: {}): Promise<implicitReturnType>;
    privatePostSubmitDeallocate(params?: {}): Promise<implicitReturnType>;
    privatePostSubmitDeposit(params?: {}): Promise<implicitReturnType>;
    privatePostSubmitSetLeverage(params?: {}): Promise<implicitReturnType>;
    privatePostSubmitWithdraw(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
