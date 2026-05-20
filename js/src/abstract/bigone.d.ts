import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetPing(params?: {}): Promise<implicitReturnType>;
    publicGetAssetPairs(params?: {}): Promise<implicitReturnType>;
    publicGetAssetPairsAssetPairNameDepth(params?: {}): Promise<implicitReturnType>;
    publicGetAssetPairsAssetPairNameTrades(params?: {}): Promise<implicitReturnType>;
    publicGetAssetPairsAssetPairNameTicker(params?: {}): Promise<implicitReturnType>;
    publicGetAssetPairsAssetPairNameCandles(params?: {}): Promise<implicitReturnType>;
    publicGetAssetPairsTickers(params?: {}): Promise<implicitReturnType>;
    privateGetAccounts(params?: {}): Promise<implicitReturnType>;
    privateGetFundAccounts(params?: {}): Promise<implicitReturnType>;
    privateGetAssetsAssetSymbolAddress(params?: {}): Promise<implicitReturnType>;
    privateGetOrders(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersId(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersMulti(params?: {}): Promise<implicitReturnType>;
    privateGetTrades(params?: {}): Promise<implicitReturnType>;
    privateGetWithdrawals(params?: {}): Promise<implicitReturnType>;
    privateGetDeposits(params?: {}): Promise<implicitReturnType>;
    privatePostOrders(params?: {}): Promise<implicitReturnType>;
    privatePostOrdersIdCancel(params?: {}): Promise<implicitReturnType>;
    privatePostOrdersCancel(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawals(params?: {}): Promise<implicitReturnType>;
    privatePostTransfer(params?: {}): Promise<implicitReturnType>;
    contractPublicGetSymbols(params?: {}): Promise<implicitReturnType>;
    contractPublicGetInstruments(params?: {}): Promise<implicitReturnType>;
    contractPublicGetDepthSymbolSnapshot(params?: {}): Promise<implicitReturnType>;
    contractPublicGetInstrumentsDifference(params?: {}): Promise<implicitReturnType>;
    contractPublicGetInstrumentsPrices(params?: {}): Promise<implicitReturnType>;
    contractPrivateGetAccounts(params?: {}): Promise<implicitReturnType>;
    contractPrivateGetOrdersId(params?: {}): Promise<implicitReturnType>;
    contractPrivateGetOrders(params?: {}): Promise<implicitReturnType>;
    contractPrivateGetOrdersOpening(params?: {}): Promise<implicitReturnType>;
    contractPrivateGetOrdersCount(params?: {}): Promise<implicitReturnType>;
    contractPrivateGetOrdersOpeningCount(params?: {}): Promise<implicitReturnType>;
    contractPrivateGetTrades(params?: {}): Promise<implicitReturnType>;
    contractPrivateGetTradesCount(params?: {}): Promise<implicitReturnType>;
    contractPrivatePostOrders(params?: {}): Promise<implicitReturnType>;
    contractPrivatePostOrdersBatch(params?: {}): Promise<implicitReturnType>;
    contractPrivatePutPositionsSymbolMargin(params?: {}): Promise<implicitReturnType>;
    contractPrivatePutPositionsSymbolRiskLimit(params?: {}): Promise<implicitReturnType>;
    contractPrivateDeleteOrdersId(params?: {}): Promise<implicitReturnType>;
    contractPrivateDeleteOrdersBatch(params?: {}): Promise<implicitReturnType>;
    webExchangeGetV3Assets(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
