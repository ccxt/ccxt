import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetExchangesPairTicker(params?: {}): Promise<implicitReturnType>;
    publicGetExchangesPairOrderbook(params?: {}): Promise<implicitReturnType>;
    publicGetExchangesPairTrades(params?: {}): Promise<implicitReturnType>;
    publicGetExchangesPairLasttrades(params?: {}): Promise<implicitReturnType>;
    privatePostMerchantCreateCheckout(params?: {}): Promise<implicitReturnType>;
    privatePostFundsAddCoinFundsRequest(params?: {}): Promise<implicitReturnType>;
    privatePostOrderAddFund(params?: {}): Promise<implicitReturnType>;
    privatePostOrderAddOrder(params?: {}): Promise<implicitReturnType>;
    privatePostOrderGetById(params?: {}): Promise<implicitReturnType>;
    privatePostOrderAddOrderMarketPriceBuy(params?: {}): Promise<implicitReturnType>;
    privatePostOrderAddOrderMarketPriceSell(params?: {}): Promise<implicitReturnType>;
    privatePostOrderCancelOrder(params?: {}): Promise<implicitReturnType>;
    privatePostOrderAddCoinFundsRequest(params?: {}): Promise<implicitReturnType>;
    privatePostOrderAddStopOrder(params?: {}): Promise<implicitReturnType>;
    privatePostPaymentGetMyId(params?: {}): Promise<implicitReturnType>;
    privatePostPaymentSend(params?: {}): Promise<implicitReturnType>;
    privatePostPaymentPay(params?: {}): Promise<implicitReturnType>;
    privateGetAccountBalance(params?: {}): Promise<implicitReturnType>;
    privateGetAccountBalanceV2(params?: {}): Promise<implicitReturnType>;
    privateGetOrderMyOrders(params?: {}): Promise<implicitReturnType>;
    privateGetOrderGetById(params?: {}): Promise<implicitReturnType>;
    privateGetOrderAccountHistory(params?: {}): Promise<implicitReturnType>;
    privateGetOrderOrderHistory(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
