import { Dict } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetV2UserApiExchangeMarkets(params?: {}): Promise<Dict>;
    publicGetV2UserApiExchangeMarketPrice(params?: {}): Promise<Dict>;
    publicGetV1ExchangeMarketAssets(params?: {}): Promise<Dict>;
    publicGetV1ExchangeMarketOrderBookCurrencyPair(params?: {}): Promise<Dict>;
    publicGetV1ExchangeMarketTickers(params?: {}): Promise<Dict>;
    publicGetV1ExchangeMarketTradesCurrencyPair(params?: {}): Promise<Dict>;
    privateGetV2UserApiExchangeOrders(params?: {}): Promise<Dict>;
    privateGetV2UserApiExchangeOrdersHistory(params?: {}): Promise<Dict>;
    privateGetV2UserApiExchangeAccountBalance(params?: {}): Promise<Dict>;
    privateGetV2UserApiExchangeAccountTariffs(params?: {}): Promise<Dict>;
    privateGetV2UserApiPaymentServices(params?: {}): Promise<Dict>;
    privateGetV2UserApiPayoutServices(params?: {}): Promise<Dict>;
    privateGetV2UserApiTransactionList(params?: {}): Promise<Dict>;
    privatePostV2UserApiExchangeOrders(params?: {}): Promise<Dict>;
    privatePostV2UserApiExchangeOrdersMarket(params?: {}): Promise<Dict>;
    privateDeleteV2UserApiExchangeOrdersOrderId(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
