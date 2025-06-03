import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetV3Symbols(params?: {}): Promise<implicitReturnType>;
    publicGetV3HistoryFunding(params?: {}): Promise<implicitReturnType>;
    publicGetV3Ticker(params?: {}): Promise<implicitReturnType>;
    publicGetV3Klines(params?: {}): Promise<implicitReturnType>;
    publicGetV3Trades(params?: {}): Promise<implicitReturnType>;
    publicGetV3Depth(params?: {}): Promise<implicitReturnType>;
    publicGetV3Time(params?: {}): Promise<implicitReturnType>;
    publicGetV3DataAllTickerInfo(params?: {}): Promise<implicitReturnType>;
    privateGetV3Account(params?: {}): Promise<implicitReturnType>;
    privateGetV3AccountBalance(params?: {}): Promise<implicitReturnType>;
    privateGetV3Fills(params?: {}): Promise<implicitReturnType>;
    privateGetV3OrderFills(params?: {}): Promise<implicitReturnType>;
    privateGetV3Order(params?: {}): Promise<implicitReturnType>;
    privateGetV3HistoryOrders(params?: {}): Promise<implicitReturnType>;
    privateGetV3OrderByClientOrderId(params?: {}): Promise<implicitReturnType>;
    privateGetV3Funding(params?: {}): Promise<implicitReturnType>;
    privateGetV3HistoricalPnl(params?: {}): Promise<implicitReturnType>;
    privateGetV3OpenOrders(params?: {}): Promise<implicitReturnType>;
    privateGetV3Transfers(params?: {}): Promise<implicitReturnType>;
    privateGetV3Transfer(params?: {}): Promise<implicitReturnType>;
    privatePostV3DeleteOpenOrders(params?: {}): Promise<implicitReturnType>;
    privatePostV3DeleteClientOrderId(params?: {}): Promise<implicitReturnType>;
    privatePostV3DeleteOrder(params?: {}): Promise<implicitReturnType>;
    privatePostV3Order(params?: {}): Promise<implicitReturnType>;
    privatePostV3SetInitialMarginRate(params?: {}): Promise<implicitReturnType>;
    privatePostV3TransferOut(params?: {}): Promise<implicitReturnType>;
    privatePostV3ContractTransferOut(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
