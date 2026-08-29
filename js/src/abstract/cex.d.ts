import { Dict } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicPostGetServerTime(params?: {}): Promise<Dict>;
    publicPostGetPairsInfo(params?: {}): Promise<Dict>;
    publicPostGetCurrenciesInfo(params?: {}): Promise<Dict>;
    publicPostGetProcessingInfo(params?: {}): Promise<Dict>;
    publicPostGetTicker(params?: {}): Promise<Dict>;
    publicPostGetTradeHistory(params?: {}): Promise<Dict>;
    publicPostGetOrderBook(params?: {}): Promise<Dict>;
    publicPostGetCandles(params?: {}): Promise<Dict>;
    privatePostGetMyCurrentFee(params?: {}): Promise<Dict>;
    privatePostGetFeeStrategy(params?: {}): Promise<Dict>;
    privatePostGetMyVolume(params?: {}): Promise<Dict>;
    privatePostDoCreateAccount(params?: {}): Promise<Dict>;
    privatePostGetMyAccountStatusV3(params?: {}): Promise<Dict>;
    privatePostGetMyWalletBalance(params?: {}): Promise<Dict>;
    privatePostGetMyOrders(params?: {}): Promise<Dict>;
    privatePostDoMyNewOrder(params?: {}): Promise<Dict>;
    privatePostDoCancelMyOrder(params?: {}): Promise<Dict>;
    privatePostDoCancelAllOrders(params?: {}): Promise<Dict>;
    privatePostGetOrderBook(params?: {}): Promise<Dict>;
    privatePostGetCandles(params?: {}): Promise<Dict>;
    privatePostGetTradeHistory(params?: {}): Promise<Dict>;
    privatePostGetMyTransactionHistory(params?: {}): Promise<Dict>;
    privatePostGetMyFundingHistory(params?: {}): Promise<Dict>;
    privatePostDoMyInternalTransfer(params?: {}): Promise<Dict>;
    privatePostGetProcessingInfo(params?: {}): Promise<Dict>;
    privatePostGetDepositAddress(params?: {}): Promise<Dict>;
    privatePostDoDepositFundsFromWallet(params?: {}): Promise<Dict>;
    privatePostDoWithdrawalFundsToWallet(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
