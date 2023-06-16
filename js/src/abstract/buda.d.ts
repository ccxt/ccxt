import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetPairs(params?: {}): Promise<implicitReturnType>;
    publicGetMarkets(params?: {}): Promise<implicitReturnType>;
    publicGetCurrencies(params?: {}): Promise<implicitReturnType>;
    publicGetMarketsMarket(params?: {}): Promise<implicitReturnType>;
    publicGetMarketsMarketTicker(params?: {}): Promise<implicitReturnType>;
    publicGetMarketsMarketVolume(params?: {}): Promise<implicitReturnType>;
    publicGetMarketsMarketOrderBook(params?: {}): Promise<implicitReturnType>;
    publicGetMarketsMarketTrades(params?: {}): Promise<implicitReturnType>;
    publicGetCurrenciesCurrencyFeesDeposit(params?: {}): Promise<implicitReturnType>;
    publicGetCurrenciesCurrencyFeesWithdrawal(params?: {}): Promise<implicitReturnType>;
    publicGetTvHistory(params?: {}): Promise<implicitReturnType>;
    publicPostMarketsMarketQuotations(params?: {}): Promise<implicitReturnType>;
    privateGetBalances(params?: {}): Promise<implicitReturnType>;
    privateGetBalancesCurrency(params?: {}): Promise<implicitReturnType>;
    privateGetCurrenciesCurrencyBalances(params?: {}): Promise<implicitReturnType>;
    privateGetOrders(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersId(params?: {}): Promise<implicitReturnType>;
    privateGetMarketsMarketOrders(params?: {}): Promise<implicitReturnType>;
    privateGetDeposits(params?: {}): Promise<implicitReturnType>;
    privateGetCurrenciesCurrencyDeposits(params?: {}): Promise<implicitReturnType>;
    privateGetWithdrawals(params?: {}): Promise<implicitReturnType>;
    privateGetCurrenciesCurrencyWithdrawals(params?: {}): Promise<implicitReturnType>;
    privateGetCurrenciesCurrencyReceiveAddresses(params?: {}): Promise<implicitReturnType>;
    privateGetCurrenciesCurrencyReceiveAddressesId(params?: {}): Promise<implicitReturnType>;
    privatePostMarketsMarketOrders(params?: {}): Promise<implicitReturnType>;
    privatePostCurrenciesCurrencyDeposits(params?: {}): Promise<implicitReturnType>;
    privatePostCurrenciesCurrencyWithdrawals(params?: {}): Promise<implicitReturnType>;
    privatePostCurrenciesCurrencySimulatedWithdrawals(params?: {}): Promise<implicitReturnType>;
    privatePostCurrenciesCurrencyReceiveAddresses(params?: {}): Promise<implicitReturnType>;
    privatePutOrdersId(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
