import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract publicGetMarketAll (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCandlesTimeframe (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCandlesTimeframeUnit (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCandlesMinutesUnit (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCandlesMinutes1 (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCandlesMinutes3 (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCandlesMinutes5 (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCandlesMinutes15 (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCandlesMinutes30 (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCandlesMinutes60 (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCandlesMinutes240 (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCandlesDays (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCandlesWeeks (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCandlesMonths (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTradesTicks (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTicker (params?: {}): Promise<implicitReturnType>;
    abstract publicGetOrderbook (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccounts (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrdersChance (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrder (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrders (params?: {}): Promise<implicitReturnType>;
    abstract privateGetWithdraws (params?: {}): Promise<implicitReturnType>;
    abstract privateGetWithdraw (params?: {}): Promise<implicitReturnType>;
    abstract privateGetWithdrawsChance (params?: {}): Promise<implicitReturnType>;
    abstract privateGetDeposits (params?: {}): Promise<implicitReturnType>;
    abstract privateGetDeposit (params?: {}): Promise<implicitReturnType>;
    abstract privateGetDepositsCoinAddresses (params?: {}): Promise<implicitReturnType>;
    abstract privateGetDepositsCoinAddress (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdrawsCoin (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdrawsKrw (params?: {}): Promise<implicitReturnType>;
    abstract privatePostDepositsGenerateCoinAddress (params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteOrder (params?: {}): Promise<implicitReturnType>;
}