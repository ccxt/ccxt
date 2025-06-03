import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetV2UserApiExchangeMarkets(params?: {}): Promise<implicitReturnType>;
    publicGetV2UserApiExchangeMarketPrice(params?: {}): Promise<implicitReturnType>;
    publicGetV1ExchangeMarketAssets(params?: {}): Promise<implicitReturnType>;
    publicGetV1ExchangeMarketOrderBookCurrencyPair(params?: {}): Promise<implicitReturnType>;
    publicGetV1ExchangeMarketTickers(params?: {}): Promise<implicitReturnType>;
    publicGetV1ExchangeMarketTradesCurrencyPair(params?: {}): Promise<implicitReturnType>;
    privateGetV2UserApiExchangeOrders(params?: {}): Promise<implicitReturnType>;
    privateGetV2UserApiExchangeOrdersHistory(params?: {}): Promise<implicitReturnType>;
    privateGetV2UserApiExchangeAccountBalance(params?: {}): Promise<implicitReturnType>;
    privateGetV2UserApiExchangeAccountTariffs(params?: {}): Promise<implicitReturnType>;
    privateGetV2UserApiPaymentServices(params?: {}): Promise<implicitReturnType>;
    privateGetV2UserApiPayoutServices(params?: {}): Promise<implicitReturnType>;
    privateGetV2UserApiTransactionList(params?: {}): Promise<implicitReturnType>;
    privatePostV2UserApiExchangeOrders(params?: {}): Promise<implicitReturnType>;
    privatePostV2UserApiExchangeOrdersMarket(params?: {}): Promise<implicitReturnType>;
    privateDeleteV2UserApiExchangeOrdersOrderId(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
