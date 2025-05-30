import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarketAll(params?: {}): Promise<implicitReturnType>;
    publicGetCandlesTimeframe(params?: {}): Promise<implicitReturnType>;
    publicGetCandlesTimeframeUnit(params?: {}): Promise<implicitReturnType>;
    publicGetCandlesSeconds(params?: {}): Promise<implicitReturnType>;
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
    publicGetCandlesYears(params?: {}): Promise<implicitReturnType>;
    publicGetTradesTicks(params?: {}): Promise<implicitReturnType>;
    publicGetTicker(params?: {}): Promise<implicitReturnType>;
    publicGetTickerAll(params?: {}): Promise<implicitReturnType>;
    publicGetOrderbook(params?: {}): Promise<implicitReturnType>;
    publicGetOrderbookSupportedLevels(params?: {}): Promise<implicitReturnType>;
    privateGetAccounts(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersChance(params?: {}): Promise<implicitReturnType>;
    privateGetOrder(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersClosed(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersOpen(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersUuids(params?: {}): Promise<implicitReturnType>;
    privateGetWithdraws(params?: {}): Promise<implicitReturnType>;
    privateGetWithdraw(params?: {}): Promise<implicitReturnType>;
    privateGetWithdrawsChance(params?: {}): Promise<implicitReturnType>;
    privateGetWithdrawsCoinAddresses(params?: {}): Promise<implicitReturnType>;
    privateGetDeposits(params?: {}): Promise<implicitReturnType>;
    privateGetDepositsChanceCoin(params?: {}): Promise<implicitReturnType>;
    privateGetDeposit(params?: {}): Promise<implicitReturnType>;
    privateGetDepositsCoinAddresses(params?: {}): Promise<implicitReturnType>;
    privateGetDepositsCoinAddress(params?: {}): Promise<implicitReturnType>;
    privateGetTravelRuleVasps(params?: {}): Promise<implicitReturnType>;
    privateGetStatusWallet(params?: {}): Promise<implicitReturnType>;
    privateGetApiKeys(params?: {}): Promise<implicitReturnType>;
    privatePostOrders(params?: {}): Promise<implicitReturnType>;
    privatePostOrdersCancelAndNew(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawsCoin(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawsKrw(params?: {}): Promise<implicitReturnType>;
    privatePostDepositsKrw(params?: {}): Promise<implicitReturnType>;
    privatePostDepositsGenerateCoinAddress(params?: {}): Promise<implicitReturnType>;
    privatePostTravelRuleDepositUuid(params?: {}): Promise<implicitReturnType>;
    privatePostTravelRuleDepositTxid(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrder(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrdersOpen(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrdersUuids(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
