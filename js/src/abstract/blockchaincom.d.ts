import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetTickers(params?: {}): Promise<implicitReturnType>;
    publicGetTickersSymbol(params?: {}): Promise<implicitReturnType>;
    publicGetSymbols(params?: {}): Promise<implicitReturnType>;
    publicGetSymbolsSymbol(params?: {}): Promise<implicitReturnType>;
    publicGetL2Symbol(params?: {}): Promise<implicitReturnType>;
    publicGetL3Symbol(params?: {}): Promise<implicitReturnType>;
    privateGetFees(params?: {}): Promise<implicitReturnType>;
    privateGetOrders(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersOrderId(params?: {}): Promise<implicitReturnType>;
    privateGetTrades(params?: {}): Promise<implicitReturnType>;
    privateGetFills(params?: {}): Promise<implicitReturnType>;
    privateGetDeposits(params?: {}): Promise<implicitReturnType>;
    privateGetDepositsDepositId(params?: {}): Promise<implicitReturnType>;
    privateGetAccounts(params?: {}): Promise<implicitReturnType>;
    privateGetAccountsAccountCurrency(params?: {}): Promise<implicitReturnType>;
    privateGetWhitelist(params?: {}): Promise<implicitReturnType>;
    privateGetWhitelistCurrency(params?: {}): Promise<implicitReturnType>;
    privateGetWithdrawals(params?: {}): Promise<implicitReturnType>;
    privateGetWithdrawalsWithdrawalId(params?: {}): Promise<implicitReturnType>;
    privatePostOrders(params?: {}): Promise<implicitReturnType>;
    privatePostDepositsCurrency(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawals(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrders(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrdersOrderId(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
