import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract publicGetGetValidPrimaryCurrencyCodes (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetValidSecondaryCurrencyCodes (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetValidLimitOrderTypes (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetValidMarketOrderTypes (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetValidOrderTypes (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetValidTransactionTypes (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetMarketSummary (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetOrderBook (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetAllOrders (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetTradeHistorySummary (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetRecentTrades (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetFxRates (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetOrderMinimumVolumes (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetCryptoWithdrawalFees (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetOpenOrders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetClosedOrders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetClosedFilledOrders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetOrderDetails (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetAccounts (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetTransactions (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetFiatBankAccounts (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetDigitalCurrencyDepositAddress (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetDigitalCurrencyDepositAddresses (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetTrades (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetBrokerageFees (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetDigitalCurrencyWithdrawal (params?: {}): Promise<implicitReturnType>;
    abstract privatePostPlaceLimitOrder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostPlaceMarketOrder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostCancelOrder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostSynchDigitalCurrencyDepositAddressWithBlockchain (params?: {}): Promise<implicitReturnType>;
    abstract privatePostRequestFiatWithdrawal (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdrawFiatCurrency (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdrawDigitalCurrency (params?: {}): Promise<implicitReturnType>;
}