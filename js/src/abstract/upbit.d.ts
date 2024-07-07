import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarketAll(params?: {}): Promise<implicitReturnType>;
    publicGetCandlesTimeframe(params?: {}): Promise<implicitReturnType>;
    publicGetCandlesTimeframeUnit(params?: {}): Promise<implicitReturnType>;
    publicGetCandlesMinutesUnit(params?: {}): Promise<implicitReturnType>;
    publicGetCandlesMinutes1(params?: {}): Promise<implicitReturnType>;
    publicGetCandlesMinutes3(params?: {}): Promise<implicitReturnType>;
    publicGetCandlesMinutes5(params?: {}): Promise<implicitReturnType>;
    publicGetCandlesMinutes10(params?: {}): Promise<implicitReturnType>;
    publicGetCandlesMinutes15(params?: {}): Promise<implicitReturnType>;
    publicGetCandlesMinutes30(params?: {}): Promise<implicitReturnType>;
    publicGetCandlesMinutes60(params?: {}): Promise<implicitReturnType>;
    publicGetCandlesMinutes240(params?: {}): Promise<implicitReturnType>;
    publicGetCandlesDays(params?: {}): Promise<implicitReturnType>;
    publicGetCandlesWeeks(params?: {}): Promise<implicitReturnType>;
    publicGetCandlesMonths(params?: {}): Promise<implicitReturnType>;
    publicGetTradesTicks(params?: {}): Promise<implicitReturnType>;
    publicGetTicker(params?: {}): Promise<implicitReturnType>;
    publicGetOrderbook(params?: {}): Promise<implicitReturnType>;
    privateGetAccounts(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersChance(params?: {}): Promise<implicitReturnType>;
    privateGetOrder(params?: {}): Promise<implicitReturnType>;
    privateGetOrders(params?: {}): Promise<implicitReturnType>;
    privateGetWithdraws(params?: {}): Promise<implicitReturnType>;
    privateGetWithdraw(params?: {}): Promise<implicitReturnType>;
    privateGetWithdrawsChance(params?: {}): Promise<implicitReturnType>;
    privateGetDeposits(params?: {}): Promise<implicitReturnType>;
    privateGetDeposit(params?: {}): Promise<implicitReturnType>;
    privateGetDepositsCoinAddresses(params?: {}): Promise<implicitReturnType>;
    privateGetDepositsCoinAddress(params?: {}): Promise<implicitReturnType>;
    privatePostOrders(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawsCoin(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawsKrw(params?: {}): Promise<implicitReturnType>;
    privatePostDepositsGenerateCoinAddress(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrder(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
