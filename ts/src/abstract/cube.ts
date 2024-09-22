import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';

class ImplicitAPI {
    // Public
    publicGetTickersSnapshot (params?: {}): Promise<implicitReturnType>;
    publicGetParsedTickers (params?: {}): Promise<implicitReturnType>;
    publicGetParsedBookSnapshot (params?: {}): Promise<implicitReturnType>;
    publicGetParsedBookRecentTrades (params?: {}): Promise<implicitReturnType>;
    publicGetBookSnapshot (params?: {}): Promise<implicitReturnType>;
    publicGetBookRecentTrades (params?: {}): Promise<implicitReturnType>;
    publicGetMarkets (params?: {}): Promise<implicitReturnType>;
    publicGetHistoryKlines (params?: {}): Promise<implicitReturnType>;

    // Private
    privateGetMarkets (params?: {}): Promise<implicitReturnType>;
    privateGetUsersCheck (params?: {}): Promise<implicitReturnType>;
    privatePostUsersApikeys (params?: {}): Promise<implicitReturnType>;
    privateDeleteUsersApikeys (params?: {}): Promise<implicitReturnType>;
    privateGetUsersSubaccounts (params?: {}): Promise<implicitReturnType>;
    privatePostUsersSubaccounts (params?: {}): Promise<implicitReturnType>;
    privateGetUsersSubaccount (params?: {}): Promise<implicitReturnType>;
    privatePatchUsersSubaccount (params?: {}): Promise<implicitReturnType>;
    privateGetUsersSubaccountPositions (params?: {}): Promise<implicitReturnType>;
    privateGetUsersSubaccountTransfers (params?: {}): Promise<implicitReturnType>;
    privateGetUsersSubaccountDeposits (params?: {}): Promise<implicitReturnType>;
    privateGetUsersSubaccountWithdrawals (params?: {}): Promise<implicitReturnType>;
    privateGetUsersSubaccountOrders (params?: {}): Promise<implicitReturnType>;
    privateGetUsersSubaccountFills (params?: {}): Promise<implicitReturnType>;
    privatePostUsersFeeEstimates (params?: {}): Promise<implicitReturnType>;
    privateGetUsersAddress (params?: {}): Promise<implicitReturnType>;
    privateGetUsersAddressSettings (params?: {}): Promise<implicitReturnType>;
    privatePostUsersWithdraw (params?: {}): Promise<implicitReturnType>;
}
abstract class Exchange extends _Exchange {}

export default Exchange