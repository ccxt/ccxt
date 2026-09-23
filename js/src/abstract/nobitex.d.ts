import { Dict } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetV2Options(params?: {}): Promise<Dict>;
    publicGetMarketStats(params?: {}): Promise<Dict>;
    publicGetV3OrderbookSymbol(params?: {}): Promise<Dict>;
    publicGetV2TradesSymbol(params?: {}): Promise<Dict>;
    publicGetMarketUdfHistory(params?: {}): Promise<Dict>;
    privateGetMarketTradesList(params?: {}): Promise<Dict>;
    privatePostUsersProfile(params?: {}): Promise<Dict>;
    privatePostUsersWalletsList(params?: {}): Promise<Dict>;
    privatePostUsersWalletsBalance(params?: {}): Promise<Dict>;
    privatePostMarketOrdersAdd(params?: {}): Promise<Dict>;
    privatePostMarketOrdersStatus(params?: {}): Promise<Dict>;
    privatePostMarketOrdersList(params?: {}): Promise<Dict>;
    privatePostMarketOrdersUpdateStatus(params?: {}): Promise<Dict>;
    privatePostMarketOrdersCancelOld(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
