import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract publicGetInstruments (params?: {}): Promise<implicitReturnType>;
    abstract publicGetOrderbook (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTickers (params?: {}): Promise<implicitReturnType>;
    abstract publicGetHistory (params?: {}): Promise<implicitReturnType>;
    abstract publicGetHistoricalfundingrates (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenpositions (params?: {}): Promise<implicitReturnType>;
    abstract privateGetNotifications (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccounts (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenorders (params?: {}): Promise<implicitReturnType>;
    abstract privateGetRecentorders (params?: {}): Promise<implicitReturnType>;
    abstract privateGetFills (params?: {}): Promise<implicitReturnType>;
    abstract privateGetTransfers (params?: {}): Promise<implicitReturnType>;
    abstract privatePostSendorder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostEditorder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostCancelorder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostTransfer (params?: {}): Promise<implicitReturnType>;
    abstract privatePostBatchorder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostCancelallorders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostCancelallordersafter (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdrawal (params?: {}): Promise<implicitReturnType>;
    abstract chartsGetPriceTypeSymbolInterval (params?: {}): Promise<implicitReturnType>;
    abstract historyGetOrders (params?: {}): Promise<implicitReturnType>;
    abstract historyGetExecutions (params?: {}): Promise<implicitReturnType>;
    abstract historyGetTriggers (params?: {}): Promise<implicitReturnType>;
    abstract historyGetAccountlogcsv (params?: {}): Promise<implicitReturnType>;
    abstract historyGetMarketSymbolOrders (params?: {}): Promise<implicitReturnType>;
    abstract historyGetMarketSymbolExecutions (params?: {}): Promise<implicitReturnType>;
    abstract feeschedulesGetVolumes (params?: {}): Promise<implicitReturnType>;
}