import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicPostGetServerTime(params?: {}): Promise<implicitReturnType>;
    publicPostGetPairsInfo(params?: {}): Promise<implicitReturnType>;
    publicPostGetCurrenciesInfo(params?: {}): Promise<implicitReturnType>;
    publicPostGetProcessingInfo(params?: {}): Promise<implicitReturnType>;
    publicPostGetTicker(params?: {}): Promise<implicitReturnType>;
    publicPostGetTradeHistory(params?: {}): Promise<implicitReturnType>;
    publicPostGetOrderBook(params?: {}): Promise<implicitReturnType>;
    publicPostGetCandles(params?: {}): Promise<implicitReturnType>;
    privatePostGetMyCurrentFee(params?: {}): Promise<implicitReturnType>;
    privatePostGetFeeStrategy(params?: {}): Promise<implicitReturnType>;
    privatePostGetMyVolume(params?: {}): Promise<implicitReturnType>;
    privatePostDoCreateAccount(params?: {}): Promise<implicitReturnType>;
    privatePostGetMyAccountStatusV3(params?: {}): Promise<implicitReturnType>;
    privatePostGetMyWalletBalance(params?: {}): Promise<implicitReturnType>;
    privatePostGetMyOrders(params?: {}): Promise<implicitReturnType>;
    privatePostDoMyNewOrder(params?: {}): Promise<implicitReturnType>;
    privatePostDoCancelMyOrder(params?: {}): Promise<implicitReturnType>;
    privatePostDoCancelAllOrders(params?: {}): Promise<implicitReturnType>;
    privatePostGetOrderBook(params?: {}): Promise<implicitReturnType>;
    privatePostGetCandles(params?: {}): Promise<implicitReturnType>;
    privatePostGetTradeHistory(params?: {}): Promise<implicitReturnType>;
    privatePostGetMyTransactionHistory(params?: {}): Promise<implicitReturnType>;
    privatePostGetMyFundingHistory(params?: {}): Promise<implicitReturnType>;
    privatePostDoMyInternalTransfer(params?: {}): Promise<implicitReturnType>;
    privatePostGetProcessingInfo(params?: {}): Promise<implicitReturnType>;
    privatePostGetDepositAddress(params?: {}): Promise<implicitReturnType>;
    privatePostDoDepositFundsFromWallet(params?: {}): Promise<implicitReturnType>;
    privatePostDoWithdrawalFundsToWallet(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
