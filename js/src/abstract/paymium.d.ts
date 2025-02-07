import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetCountries(params?: {}): Promise<implicitReturnType>;
    publicGetCurrencies(params?: {}): Promise<implicitReturnType>;
    publicGetDataCurrencyTicker(params?: {}): Promise<implicitReturnType>;
    publicGetDataCurrencyTrades(params?: {}): Promise<implicitReturnType>;
    publicGetDataCurrencyDepth(params?: {}): Promise<implicitReturnType>;
    publicGetBitcoinChartsIdTrades(params?: {}): Promise<implicitReturnType>;
    publicGetBitcoinChartsIdDepth(params?: {}): Promise<implicitReturnType>;
    privateGetUser(params?: {}): Promise<implicitReturnType>;
    privateGetUserAddresses(params?: {}): Promise<implicitReturnType>;
    privateGetUserAddressesAddress(params?: {}): Promise<implicitReturnType>;
    privateGetUserOrders(params?: {}): Promise<implicitReturnType>;
    privateGetUserOrdersUuid(params?: {}): Promise<implicitReturnType>;
    privateGetUserPriceAlerts(params?: {}): Promise<implicitReturnType>;
    privateGetMerchantGetPaymentUuid(params?: {}): Promise<implicitReturnType>;
    privatePostUserAddresses(params?: {}): Promise<implicitReturnType>;
    privatePostUserOrders(params?: {}): Promise<implicitReturnType>;
    privatePostUserWithdrawals(params?: {}): Promise<implicitReturnType>;
    privatePostUserEmailTransfers(params?: {}): Promise<implicitReturnType>;
    privatePostUserPaymentRequests(params?: {}): Promise<implicitReturnType>;
    privatePostUserPriceAlerts(params?: {}): Promise<implicitReturnType>;
    privatePostMerchantCreatePayment(params?: {}): Promise<implicitReturnType>;
    privateDeleteUserOrdersUuid(params?: {}): Promise<implicitReturnType>;
    privateDeleteUserOrdersUuidCancel(params?: {}): Promise<implicitReturnType>;
    privateDeleteUserPriceAlertsId(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
