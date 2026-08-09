import { Dict, List } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetFeeschedules(params?: {}): Promise<Dict>;
    publicGetInstruments(params?: {}): Promise<Dict>;
    publicGetOrderbook(params?: {}): Promise<Dict>;
    publicGetTickers(params?: {}): Promise<Dict>;
    publicGetHistory(params?: {}): Promise<Dict>;
    publicGetHistoricalfundingrates(params?: {}): Promise<Dict>;
    privateGetFeeschedulesVolumes(params?: {}): Promise<Dict>;
    privateGetOpenpositions(params?: {}): Promise<List>;
    privateGetNotifications(params?: {}): Promise<Dict>;
    privateGetAccounts(params?: {}): Promise<Dict>;
    privateGetOpenorders(params?: {}): Promise<Dict>;
    privateGetRecentorders(params?: {}): Promise<Dict>;
    privateGetFills(params?: {}): Promise<Dict>;
    privateGetTransfers(params?: {}): Promise<Dict>;
    privateGetLeveragepreferences(params?: {}): Promise<Dict>;
    privateGetPnlpreferences(params?: {}): Promise<Dict>;
    privateGetAssignmentprogramCurrent(params?: {}): Promise<Dict>;
    privateGetAssignmentprogramHistory(params?: {}): Promise<Dict>;
    privateGetOrdersStatus(params?: {}): Promise<Dict>;
    privatePostSendorder(params?: {}): Promise<Dict>;
    privatePostEditorder(params?: {}): Promise<Dict>;
    privatePostCancelorder(params?: {}): Promise<Dict>;
    privatePostTransfer(params?: {}): Promise<Dict>;
    privatePostBatchorder(params?: {}): Promise<Dict>;
    privatePostCancelallorders(params?: {}): Promise<Dict>;
    privatePostCancelallordersafter(params?: {}): Promise<Dict>;
    privatePostWithdrawal(params?: {}): Promise<Dict>;
    privatePostAssignmentprogramAdd(params?: {}): Promise<Dict>;
    privatePostAssignmentprogramDelete(params?: {}): Promise<Dict>;
    privatePutLeveragepreferences(params?: {}): Promise<Dict>;
    privatePutPnlpreferences(params?: {}): Promise<Dict>;
    chartsGetPriceTypeSymbolInterval(params?: {}): Promise<Dict>;
    historyGetOrders(params?: {}): Promise<Dict>;
    historyGetExecutions(params?: {}): Promise<Dict>;
    historyGetTriggers(params?: {}): Promise<Dict>;
    historyGetAccountlogcsv(params?: {}): Promise<string>;
    historyGetAccountLog(params?: {}): Promise<Dict>;
    historyGetMarketSymbolOrders(params?: {}): Promise<Dict>;
    historyGetMarketSymbolExecutions(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
