import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetFeeschedules(params?: {}): Promise<implicitReturnType>;
    publicGetInstruments(params?: {}): Promise<implicitReturnType>;
    publicGetOrderbook(params?: {}): Promise<implicitReturnType>;
    publicGetTickers(params?: {}): Promise<implicitReturnType>;
    publicGetHistory(params?: {}): Promise<implicitReturnType>;
    publicGetHistoricalfundingrates(params?: {}): Promise<implicitReturnType>;
    privateGetFeeschedulesVolumes(params?: {}): Promise<implicitReturnType>;
    privateGetOpenpositions(params?: {}): Promise<implicitReturnType>;
    privateGetNotifications(params?: {}): Promise<implicitReturnType>;
    privateGetAccounts(params?: {}): Promise<implicitReturnType>;
    privateGetOpenorders(params?: {}): Promise<implicitReturnType>;
    privateGetRecentorders(params?: {}): Promise<implicitReturnType>;
    privateGetFills(params?: {}): Promise<implicitReturnType>;
    privateGetTransfers(params?: {}): Promise<implicitReturnType>;
    privateGetLeveragepreferences(params?: {}): Promise<implicitReturnType>;
    privateGetPnlpreferences(params?: {}): Promise<implicitReturnType>;
    privateGetAssignmentprogramCurrent(params?: {}): Promise<implicitReturnType>;
    privateGetAssignmentprogramHistory(params?: {}): Promise<implicitReturnType>;
    privatePostSendorder(params?: {}): Promise<implicitReturnType>;
    privatePostEditorder(params?: {}): Promise<implicitReturnType>;
    privatePostCancelorder(params?: {}): Promise<implicitReturnType>;
    privatePostTransfer(params?: {}): Promise<implicitReturnType>;
    privatePostBatchorder(params?: {}): Promise<implicitReturnType>;
    privatePostCancelallorders(params?: {}): Promise<implicitReturnType>;
    privatePostCancelallordersafter(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawal(params?: {}): Promise<implicitReturnType>;
    privatePostAssignmentprogramAdd(params?: {}): Promise<implicitReturnType>;
    privatePostAssignmentprogramDelete(params?: {}): Promise<implicitReturnType>;
    privatePutLeveragepreferences(params?: {}): Promise<implicitReturnType>;
    privatePutPnlpreferences(params?: {}): Promise<implicitReturnType>;
    chartsGetPriceTypeSymbolInterval(params?: {}): Promise<implicitReturnType>;
    historyGetOrders(params?: {}): Promise<implicitReturnType>;
    historyGetExecutions(params?: {}): Promise<implicitReturnType>;
    historyGetTriggers(params?: {}): Promise<implicitReturnType>;
    historyGetAccountlogcsv(params?: {}): Promise<implicitReturnType>;
    historyGetAccountLog(params?: {}): Promise<implicitReturnType>;
    historyGetMarketSymbolOrders(params?: {}): Promise<implicitReturnType>;
    historyGetMarketSymbolExecutions(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
