import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetOrderBookPair(params?: {}): Promise<implicitReturnType>;
    publicGetTickers(params?: {}): Promise<implicitReturnType>;
    publicGetTickersPair(params?: {}): Promise<implicitReturnType>;
    publicGetTradesPair(params?: {}): Promise<implicitReturnType>;
    publicGetProvisioningCurrencies(params?: {}): Promise<implicitReturnType>;
    publicGetProvisioningTradingPairs(params?: {}): Promise<implicitReturnType>;
    publicGetProvisioningLimitationsAndFees(params?: {}): Promise<implicitReturnType>;
    publicGetTradingHistoryPair(params?: {}): Promise<implicitReturnType>;
    publicGetPriceOtcCurrency(params?: {}): Promise<implicitReturnType>;
    privateGetAccountsBalance(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersHistory(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersAllPair(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersTradesPair(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersPairOrderId(params?: {}): Promise<implicitReturnType>;
    privateGetWalletWithdrawCurrencySerial(params?: {}): Promise<implicitReturnType>;
    privateGetWalletWithdrawCurrencyIdId(params?: {}): Promise<implicitReturnType>;
    privateGetWalletDepositHistoryCurrency(params?: {}): Promise<implicitReturnType>;
    privateGetWalletWithdrawHistoryCurrency(params?: {}): Promise<implicitReturnType>;
    privatePostOrdersPair(params?: {}): Promise<implicitReturnType>;
    privatePostOrdersBatch(params?: {}): Promise<implicitReturnType>;
    privatePostWalletWithdrawCurrency(params?: {}): Promise<implicitReturnType>;
    privatePutOrders(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrdersPairId(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrdersAll(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrdersPair(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
