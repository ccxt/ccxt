import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
export default abstract class Exchange extends _Exchange {
    abstract publicGetMarketsSymbolTicker(params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketsSymbolOrderBook(params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketsSymbolTrades(params?: {}): Promise<implicitReturnType>;
    abstract privateGetWallets(params?: {}): Promise<implicitReturnType>;
    abstract privateGetWalletsWalletId(params?: {}): Promise<implicitReturnType>;
    abstract privateGetWalletsWalletIdBalancesCurrencyCode(params?: {}): Promise<implicitReturnType>;
    abstract privateGetWalletsWalletIdFundingHistory(params?: {}): Promise<implicitReturnType>;
    abstract privateGetWalletsWalletIdTrades(params?: {}): Promise<implicitReturnType>;
    abstract privateGetWalletsWalletIdOrders(params?: {}): Promise<implicitReturnType>;
    abstract privateGetWalletsWalletIdOrdersId(params?: {}): Promise<implicitReturnType>;
    abstract privatePostWalletTransfers(params?: {}): Promise<implicitReturnType>;
    abstract privatePostWallets(params?: {}): Promise<implicitReturnType>;
    abstract privatePostWalletsWalletIdCryptocurrencyDeposits(params?: {}): Promise<implicitReturnType>;
    abstract privatePostWalletsWalletIdCryptocurrencyWithdrawals(params?: {}): Promise<implicitReturnType>;
    abstract privatePostWalletsWalletIdOrders(params?: {}): Promise<implicitReturnType>;
    abstract privatePostWireWithdrawal(params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteWalletsWalletIdOrdersId(params?: {}): Promise<implicitReturnType>;
}
