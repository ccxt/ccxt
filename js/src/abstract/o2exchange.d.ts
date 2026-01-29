import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetV1Markets(params?: {}): Promise<implicitReturnType>;
    publicGetV1MarketsSummary(params?: {}): Promise<implicitReturnType>;
    publicGetV1MarketsTicker(params?: {}): Promise<implicitReturnType>;
    publicGetV1Depth(params?: {}): Promise<implicitReturnType>;
    publicGetV1Trades(params?: {}): Promise<implicitReturnType>;
    publicGetV1Bars(params?: {}): Promise<implicitReturnType>;
    publicGetHealth(params?: {}): Promise<implicitReturnType>;
    privateGetV1Accounts(params?: {}): Promise<implicitReturnType>;
    privateGetV1Balance(params?: {}): Promise<implicitReturnType>;
    privateGetV1Orders(params?: {}): Promise<implicitReturnType>;
    privatePostV1Accounts(params?: {}): Promise<implicitReturnType>;
    privatePostV1SessionCall(params?: {}): Promise<implicitReturnType>;
    privatePutV1Session(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
