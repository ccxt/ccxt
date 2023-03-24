import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
export default abstract class Exchange extends _Exchange {
    abstract publicGetTickers(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTickersSymbol(params?: {}): Promise<implicitReturnType>;
    abstract publicGetSymbols(params?: {}): Promise<implicitReturnType>;
    abstract publicGetSymbolsSymbol(params?: {}): Promise<implicitReturnType>;
    abstract publicGetL2Symbol(params?: {}): Promise<implicitReturnType>;
    abstract publicGetL3Symbol(params?: {}): Promise<implicitReturnType>;
    abstract privateGetFees(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrders(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrdersOrderId(params?: {}): Promise<implicitReturnType>;
    abstract privateGetTrades(params?: {}): Promise<implicitReturnType>;
    abstract privateGetFills(params?: {}): Promise<implicitReturnType>;
    abstract privateGetDeposits(params?: {}): Promise<implicitReturnType>;
    abstract privateGetDepositsDepositId(params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccounts(params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountsAccountCurrency(params?: {}): Promise<implicitReturnType>;
    abstract privateGetWhitelist(params?: {}): Promise<implicitReturnType>;
    abstract privateGetWhitelistCurrency(params?: {}): Promise<implicitReturnType>;
    abstract privateGetWithdrawals(params?: {}): Promise<implicitReturnType>;
    abstract privateGetWithdrawalsWithdrawalId(params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrders(params?: {}): Promise<implicitReturnType>;
    abstract privatePostDepositsCurrency(params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdrawals(params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteOrders(params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteOrdersOrderId(params?: {}): Promise<implicitReturnType>;
}
