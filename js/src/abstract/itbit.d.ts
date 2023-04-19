import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarketsSymbolTicker(params?: {}): Promise<implicitReturnType>;
    publicGetMarketsSymbolOrderBook(params?: {}): Promise<implicitReturnType>;
    publicGetMarketsSymbolTrades(params?: {}): Promise<implicitReturnType>;
    privateGetWallets(params?: {}): Promise<implicitReturnType>;
    privateGetWalletsWalletId(params?: {}): Promise<implicitReturnType>;
    privateGetWalletsWalletIdBalancesCurrencyCode(params?: {}): Promise<implicitReturnType>;
    privateGetWalletsWalletIdFundingHistory(params?: {}): Promise<implicitReturnType>;
    privateGetWalletsWalletIdTrades(params?: {}): Promise<implicitReturnType>;
    privateGetWalletsWalletIdOrders(params?: {}): Promise<implicitReturnType>;
    privateGetWalletsWalletIdOrdersId(params?: {}): Promise<implicitReturnType>;
    privatePostWalletTransfers(params?: {}): Promise<implicitReturnType>;
    privatePostWallets(params?: {}): Promise<implicitReturnType>;
    privatePostWalletsWalletIdCryptocurrencyDeposits(params?: {}): Promise<implicitReturnType>;
    privatePostWalletsWalletIdCryptocurrencyWithdrawals(params?: {}): Promise<implicitReturnType>;
    privatePostWalletsWalletIdOrders(params?: {}): Promise<implicitReturnType>;
    privatePostWireWithdrawal(params?: {}): Promise<implicitReturnType>;
    privateDeleteWalletsWalletIdOrdersId(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
