import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract publicGetOrderBookPair (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTickers (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTickersPair (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTradesPair (params?: {}): Promise<implicitReturnType>;
    abstract publicGetProvisioningCurrencies (params?: {}): Promise<implicitReturnType>;
    abstract publicGetProvisioningTradingPairs (params?: {}): Promise<implicitReturnType>;
    abstract publicGetProvisioningLimitationsAndFees (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTradingHistoryPair (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountsBalance (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrdersHistory (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrdersAllPair (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrdersTradesPair (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrdersPairOrderId (params?: {}): Promise<implicitReturnType>;
    abstract privateGetWalletWithdrawCurrencySerial (params?: {}): Promise<implicitReturnType>;
    abstract privateGetWalletWithdrawCurrencyIdId (params?: {}): Promise<implicitReturnType>;
    abstract privateGetWalletDepositHistoryCurrency (params?: {}): Promise<implicitReturnType>;
    abstract privateGetWalletWithdrawHistoryCurrency (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrdersPair (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrdersBatch (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWalletWithdrawCurrency (params?: {}): Promise<implicitReturnType>;
    abstract privatePutOrders (params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteOrdersPairId (params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteOrdersAll (params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteOrdersPair (params?: {}): Promise<implicitReturnType>;
}