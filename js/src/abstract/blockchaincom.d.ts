import { List, Dict } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetTickers(params?: {}): Promise<List>;
    publicGetTickersSymbol(params?: {}): Promise<Dict>;
    publicGetSymbols(params?: {}): Promise<Dict>;
    publicGetSymbolsSymbol(params?: {}): Promise<Dict>;
    publicGetL2Symbol(params?: {}): Promise<Dict>;
    publicGetL3Symbol(params?: {}): Promise<Dict>;
    privateGetFees(params?: {}): Promise<Dict>;
    privateGetOrders(params?: {}): Promise<List>;
    privateGetOrdersOrderId(params?: {}): Promise<Dict>;
    privateGetTrades(params?: {}): Promise<List>;
    privateGetFills(params?: {}): Promise<List>;
    privateGetDeposits(params?: {}): Promise<List>;
    privateGetDepositsDepositId(params?: {}): Promise<Dict>;
    privateGetAccounts(params?: {}): Promise<Dict>;
    privateGetAccountsAccountCurrency(params?: {}): Promise<Dict>;
    privateGetWhitelist(params?: {}): Promise<List>;
    privateGetWhitelistCurrency(params?: {}): Promise<List>;
    privateGetWithdrawals(params?: {}): Promise<List>;
    privateGetWithdrawalsWithdrawalId(params?: {}): Promise<Dict>;
    privatePostOrders(params?: {}): Promise<Dict>;
    privatePostDepositsCurrency(params?: {}): Promise<Dict>;
    privatePostWithdrawals(params?: {}): Promise<Dict>;
    privateDeleteOrders(params?: {}): Promise<Dict>;
    privateDeleteOrdersOrderId(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
