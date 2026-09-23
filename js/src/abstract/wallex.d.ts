import { Dict } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetV1Markets(params?: {}): Promise<Dict>;
    publicGetV1CurrenciesStats(params?: {}): Promise<Dict>;
    publicGetV1Depth(params?: {}): Promise<Dict>;
    publicGetV1Trades(params?: {}): Promise<Dict>;
    publicGetV1UdfHistory(params?: {}): Promise<Dict>;
    privateGetV1AccountProfile(params?: {}): Promise<Dict>;
    privateGetV1AccountBalances(params?: {}): Promise<Dict>;
    privateGetV1AccountOpenOrders(params?: {}): Promise<Dict>;
    privateGetV1AccountTrades(params?: {}): Promise<Dict>;
    privateGetV1AccountOrdersClientOrderId(params?: {}): Promise<Dict>;
    privatePostV1AccountOrders(params?: {}): Promise<Dict>;
    privateDeleteV1AccountOrders(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
