import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetGetValidPrimaryCurrencyCodes(params?: {}): Promise<implicitReturnType>;
    publicGetGetValidSecondaryCurrencyCodes(params?: {}): Promise<implicitReturnType>;
    publicGetGetValidLimitOrderTypes(params?: {}): Promise<implicitReturnType>;
    publicGetGetValidMarketOrderTypes(params?: {}): Promise<implicitReturnType>;
    publicGetGetValidOrderTypes(params?: {}): Promise<implicitReturnType>;
    publicGetGetValidTransactionTypes(params?: {}): Promise<implicitReturnType>;
    publicGetGetMarketSummary(params?: {}): Promise<implicitReturnType>;
    publicGetGetOrderBook(params?: {}): Promise<implicitReturnType>;
    publicGetGetAllOrders(params?: {}): Promise<implicitReturnType>;
    publicGetGetTradeHistorySummary(params?: {}): Promise<implicitReturnType>;
    publicGetGetRecentTrades(params?: {}): Promise<implicitReturnType>;
    publicGetGetFxRates(params?: {}): Promise<implicitReturnType>;
    publicGetGetOrderMinimumVolumes(params?: {}): Promise<implicitReturnType>;
    publicGetGetCryptoWithdrawalFees(params?: {}): Promise<implicitReturnType>;
    privatePostGetOpenOrders(params?: {}): Promise<implicitReturnType>;
    privatePostGetClosedOrders(params?: {}): Promise<implicitReturnType>;
    privatePostGetClosedFilledOrders(params?: {}): Promise<implicitReturnType>;
    privatePostGetOrderDetails(params?: {}): Promise<implicitReturnType>;
    privatePostGetAccounts(params?: {}): Promise<implicitReturnType>;
    privatePostGetTransactions(params?: {}): Promise<implicitReturnType>;
    privatePostGetFiatBankAccounts(params?: {}): Promise<implicitReturnType>;
    privatePostGetDigitalCurrencyDepositAddress(params?: {}): Promise<implicitReturnType>;
    privatePostGetDigitalCurrencyDepositAddresses(params?: {}): Promise<implicitReturnType>;
    privatePostGetTrades(params?: {}): Promise<implicitReturnType>;
    privatePostGetBrokerageFees(params?: {}): Promise<implicitReturnType>;
    privatePostGetDigitalCurrencyWithdrawal(params?: {}): Promise<implicitReturnType>;
    privatePostPlaceLimitOrder(params?: {}): Promise<implicitReturnType>;
    privatePostPlaceMarketOrder(params?: {}): Promise<implicitReturnType>;
    privatePostCancelOrder(params?: {}): Promise<implicitReturnType>;
    privatePostSynchDigitalCurrencyDepositAddressWithBlockchain(params?: {}): Promise<implicitReturnType>;
    privatePostRequestFiatWithdrawal(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawFiatCurrency(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawDigitalCurrency(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
