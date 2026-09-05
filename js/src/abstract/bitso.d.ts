import { Dict } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetAvailableBooks(params?: {}): Promise<Dict>;
    publicGetCatalogues(params?: {}): Promise<Dict>;
    publicGetTicker(params?: {}): Promise<Dict>;
    publicGetOrderBook(params?: {}): Promise<Dict>;
    publicGetTrades(params?: {}): Promise<Dict>;
    publicGetOhlc(params?: {}): Promise<Dict>;
    privateGetAccountStatus(params?: {}): Promise<Dict>;
    privateGetBalance(params?: {}): Promise<Dict>;
    privateGetFees(params?: {}): Promise<Dict>;
    privateGetFundings(params?: {}): Promise<Dict>;
    privateGetFundingsFid(params?: {}): Promise<Dict>;
    privateGetFundingDestination(params?: {}): Promise<Dict>;
    privateGetKycDocuments(params?: {}): Promise<Dict>;
    privateGetLedger(params?: {}): Promise<Dict>;
    privateGetLedgerTrades(params?: {}): Promise<Dict>;
    privateGetLedgerFees(params?: {}): Promise<Dict>;
    privateGetLedgerFundings(params?: {}): Promise<Dict>;
    privateGetLedgerWithdrawals(params?: {}): Promise<Dict>;
    privateGetMxBankCodes(params?: {}): Promise<Dict>;
    privateGetOpenOrders(params?: {}): Promise<Dict>;
    privateGetOrderTradesOid(params?: {}): Promise<Dict>;
    privateGetOrdersOid(params?: {}): Promise<Dict>;
    privateGetUserTrades(params?: {}): Promise<Dict>;
    privateGetUserTradesTid(params?: {}): Promise<Dict>;
    privateGetWithdrawals(params?: {}): Promise<Dict>;
    privateGetWithdrawalsWid(params?: {}): Promise<Dict>;
    privatePostBitcoinWithdrawal(params?: {}): Promise<Dict>;
    privatePostDebitCardWithdrawal(params?: {}): Promise<Dict>;
    privatePostEtherWithdrawal(params?: {}): Promise<Dict>;
    privatePostOrders(params?: {}): Promise<Dict>;
    privatePostPhoneNumber(params?: {}): Promise<Dict>;
    privatePostPhoneVerification(params?: {}): Promise<Dict>;
    privatePostPhoneWithdrawal(params?: {}): Promise<Dict>;
    privatePostSpeiWithdrawal(params?: {}): Promise<Dict>;
    privatePostRippleWithdrawal(params?: {}): Promise<Dict>;
    privatePostBcashWithdrawal(params?: {}): Promise<Dict>;
    privatePostLitecoinWithdrawal(params?: {}): Promise<Dict>;
    privateDeleteOrders(params?: {}): Promise<Dict>;
    privateDeleteOrdersOid(params?: {}): Promise<Dict>;
    privateDeleteOrdersAll(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
