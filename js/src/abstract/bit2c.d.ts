import { Dict, List } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetExchangesPairTicker(params?: {}): Promise<Dict>;
    publicGetExchangesPairOrderbook(params?: {}): Promise<Dict>;
    publicGetExchangesPairTrades(params?: {}): Promise<List>;
    publicGetExchangesPairLasttrades(params?: {}): Promise<List>;
    privatePostMerchantCreateCheckout(params?: {}): Promise<Dict>;
    privatePostFundsAddCoinFundsRequest(params?: {}): Promise<Dict>;
    privatePostOrderAddFund(params?: {}): Promise<Dict>;
    privatePostOrderAddOrder(params?: {}): Promise<Dict>;
    privatePostOrderGetById(params?: {}): Promise<Dict>;
    privatePostOrderAddOrderMarketPriceBuy(params?: {}): Promise<Dict>;
    privatePostOrderAddOrderMarketPriceSell(params?: {}): Promise<Dict>;
    privatePostOrderCancelOrder(params?: {}): Promise<Dict>;
    privatePostOrderAddCoinFundsRequest(params?: {}): Promise<Dict>;
    privatePostOrderAddStopOrder(params?: {}): Promise<Dict>;
    privatePostPaymentGetMyId(params?: {}): Promise<Dict>;
    privatePostPaymentSend(params?: {}): Promise<Dict>;
    privatePostPaymentPay(params?: {}): Promise<string>;
    privateGetAccountBalance(params?: {}): Promise<Dict>;
    privateGetAccountBalanceV2(params?: {}): Promise<Dict>;
    privateGetOrderMyOrders(params?: {}): Promise<Dict>;
    privateGetOrderGetById(params?: {}): Promise<Dict>;
    privateGetOrderAccountHistory(params?: {}): Promise<List>;
    privateGetOrderOrderHistory(params?: {}): Promise<List>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
