import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarkets(params?: {}): Promise<implicitReturnType>;
    publicGetMarketsMarket(params?: {}): Promise<implicitReturnType>;
    publicGetMarketsMarketOrders(params?: {}): Promise<implicitReturnType>;
    publicGetMarketsMarketTrades(params?: {}): Promise<implicitReturnType>;
    privateGetUserAccounts(params?: {}): Promise<implicitReturnType>;
    privateGetUserOrders(params?: {}): Promise<implicitReturnType>;
    privateGetUserOrdersId(params?: {}): Promise<implicitReturnType>;
    privateGetUserOrdersIdTrades(params?: {}): Promise<implicitReturnType>;
    privateGetUserTrades(params?: {}): Promise<implicitReturnType>;
    privateGetUserFees(params?: {}): Promise<implicitReturnType>;
    privateGetAccountWithdrawalsId(params?: {}): Promise<implicitReturnType>;
    privateGetAccountWithdrawals(params?: {}): Promise<implicitReturnType>;
    privateGetAccountDepositId(params?: {}): Promise<implicitReturnType>;
    privateGetAccountDeposits(params?: {}): Promise<implicitReturnType>;
    privateGetAccountDepositAddress(params?: {}): Promise<implicitReturnType>;
    privatePostUserOrders(params?: {}): Promise<implicitReturnType>;
    privatePostAccountWithdraw(params?: {}): Promise<implicitReturnType>;
    privateDeleteUserOrdersId(params?: {}): Promise<implicitReturnType>;
    privateDeleteAccountWithdrawalsId(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
