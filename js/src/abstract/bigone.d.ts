import { Dict, List } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetPing(params?: {}): Promise<Dict>;
    publicGetAssetPairs(params?: {}): Promise<Dict>;
    publicGetAssetPairsAssetPairNameDepth(params?: {}): Promise<Dict>;
    publicGetAssetPairsAssetPairNameTrades(params?: {}): Promise<Dict>;
    publicGetAssetPairsAssetPairNameTicker(params?: {}): Promise<Dict>;
    publicGetAssetPairsAssetPairNameCandles(params?: {}): Promise<Dict>;
    publicGetAssetPairsTickers(params?: {}): Promise<Dict>;
    privateGetAccounts(params?: {}): Promise<Dict>;
    privateGetFundAccounts(params?: {}): Promise<Dict>;
    privateGetAssetsAssetSymbolAddress(params?: {}): Promise<Dict>;
    privateGetOrders(params?: {}): Promise<Dict>;
    privateGetOrdersId(params?: {}): Promise<Dict>;
    privateGetOrdersMulti(params?: {}): Promise<Dict>;
    privateGetTrades(params?: {}): Promise<Dict>;
    privateGetWithdrawals(params?: {}): Promise<Dict>;
    privateGetDeposits(params?: {}): Promise<Dict>;
    privatePostOrders(params?: {}): Promise<Dict>;
    privatePostOrdersIdCancel(params?: {}): Promise<Dict>;
    privatePostOrdersCancel(params?: {}): Promise<Dict>;
    privatePostWithdrawals(params?: {}): Promise<Dict>;
    privatePostTransfer(params?: {}): Promise<Dict>;
    contractPublicGetSymbols(params?: {}): Promise<List>;
    contractPublicGetInstruments(params?: {}): Promise<List>;
    contractPublicGetDepthSymbolSnapshot(params?: {}): Promise<Dict>;
    contractPublicGetInstrumentsDifference(params?: {}): Promise<Dict>;
    contractPublicGetInstrumentsPrices(params?: {}): Promise<Dict>;
    contractPrivateGetAccounts(params?: {}): Promise<List>;
    contractPrivateGetOrdersId(params?: {}): Promise<Dict>;
    contractPrivateGetOrders(params?: {}): Promise<List>;
    contractPrivateGetOrdersOpening(params?: {}): Promise<List>;
    contractPrivateGetOrdersCount(params?: {}): Promise<Dict>;
    contractPrivateGetOrdersOpeningCount(params?: {}): Promise<Dict>;
    contractPrivateGetTrades(params?: {}): Promise<List>;
    contractPrivateGetTradesCount(params?: {}): Promise<Dict>;
    contractPrivatePostOrders(params?: {}): Promise<Dict>;
    contractPrivatePostOrdersBatch(params?: {}): Promise<Dict>;
    contractPrivatePutPositionsSymbolMargin(params?: {}): Promise<Dict>;
    contractPrivatePutPositionsSymbolRiskLimit(params?: {}): Promise<Dict>;
    contractPrivateDeleteOrdersId(params?: {}): Promise<Dict>;
    contractPrivateDeleteOrdersBatch(params?: {}): Promise<Dict>;
    webExchangeGetV3Assets(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
