import { implicitReturnType } from '../base/types.js';
import _onetrading from '../onetrading.js';
interface onetrading {
    publicGetCurrencies(params?: {}): Promise<implicitReturnType>;
    publicGetCandlesticksInstrumentCode(params?: {}): Promise<implicitReturnType>;
    publicGetFees(params?: {}): Promise<implicitReturnType>;
    publicGetInstruments(params?: {}): Promise<implicitReturnType>;
    publicGetOrderBookInstrumentCode(params?: {}): Promise<implicitReturnType>;
    publicGetMarketTicker(params?: {}): Promise<implicitReturnType>;
    publicGetMarketTickerInstrumentCode(params?: {}): Promise<implicitReturnType>;
    publicGetTime(params?: {}): Promise<implicitReturnType>;
    privateGetAccountBalances(params?: {}): Promise<implicitReturnType>;
    privateGetAccountFees(params?: {}): Promise<implicitReturnType>;
    privateGetAccountOrders(params?: {}): Promise<implicitReturnType>;
    privateGetAccountOrdersOrderId(params?: {}): Promise<implicitReturnType>;
    privateGetAccountOrdersOrderIdTrades(params?: {}): Promise<implicitReturnType>;
    privateGetAccountTrades(params?: {}): Promise<implicitReturnType>;
    privateGetAccountTradesTradeId(params?: {}): Promise<implicitReturnType>;
    privatePostAccountOrders(params?: {}): Promise<implicitReturnType>;
    privateDeleteAccountOrders(params?: {}): Promise<implicitReturnType>;
    privateDeleteAccountOrdersOrderId(params?: {}): Promise<implicitReturnType>;
    privateDeleteAccountOrdersClientClientId(params?: {}): Promise<implicitReturnType>;
}
declare abstract class onetrading extends _onetrading {
}
export default onetrading;
