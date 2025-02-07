import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetAvailableBooks(params?: {}): Promise<implicitReturnType>;
    publicGetTicker(params?: {}): Promise<implicitReturnType>;
    publicGetOrderBook(params?: {}): Promise<implicitReturnType>;
    publicGetTrades(params?: {}): Promise<implicitReturnType>;
    publicGetOhlc(params?: {}): Promise<implicitReturnType>;
    privateGetAccountStatus(params?: {}): Promise<implicitReturnType>;
    privateGetBalance(params?: {}): Promise<implicitReturnType>;
    privateGetFees(params?: {}): Promise<implicitReturnType>;
    privateGetFundings(params?: {}): Promise<implicitReturnType>;
    privateGetFundingsFid(params?: {}): Promise<implicitReturnType>;
    privateGetFundingDestination(params?: {}): Promise<implicitReturnType>;
    privateGetKycDocuments(params?: {}): Promise<implicitReturnType>;
    privateGetLedger(params?: {}): Promise<implicitReturnType>;
    privateGetLedgerTrades(params?: {}): Promise<implicitReturnType>;
    privateGetLedgerFees(params?: {}): Promise<implicitReturnType>;
    privateGetLedgerFundings(params?: {}): Promise<implicitReturnType>;
    privateGetLedgerWithdrawals(params?: {}): Promise<implicitReturnType>;
    privateGetMxBankCodes(params?: {}): Promise<implicitReturnType>;
    privateGetOpenOrders(params?: {}): Promise<implicitReturnType>;
    privateGetOrderTradesOid(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersOid(params?: {}): Promise<implicitReturnType>;
    privateGetUserTrades(params?: {}): Promise<implicitReturnType>;
    privateGetUserTradesTid(params?: {}): Promise<implicitReturnType>;
    privateGetWithdrawals(params?: {}): Promise<implicitReturnType>;
    privateGetWithdrawalsWid(params?: {}): Promise<implicitReturnType>;
    privatePostBitcoinWithdrawal(params?: {}): Promise<implicitReturnType>;
    privatePostDebitCardWithdrawal(params?: {}): Promise<implicitReturnType>;
    privatePostEtherWithdrawal(params?: {}): Promise<implicitReturnType>;
    privatePostOrders(params?: {}): Promise<implicitReturnType>;
    privatePostPhoneNumber(params?: {}): Promise<implicitReturnType>;
    privatePostPhoneVerification(params?: {}): Promise<implicitReturnType>;
    privatePostPhoneWithdrawal(params?: {}): Promise<implicitReturnType>;
    privatePostSpeiWithdrawal(params?: {}): Promise<implicitReturnType>;
    privatePostRippleWithdrawal(params?: {}): Promise<implicitReturnType>;
    privatePostBcashWithdrawal(params?: {}): Promise<implicitReturnType>;
    privatePostLitecoinWithdrawal(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrders(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrdersOid(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrdersAll(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
