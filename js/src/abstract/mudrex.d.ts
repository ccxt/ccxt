import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    marketGetPriceKline(params?: {}): Promise<implicitReturnType>;
    marketGetPriceMarkKline(params?: {}): Promise<implicitReturnType>;
    privateGetFutures(params?: {}): Promise<implicitReturnType>;
    privateGetFuturesAssetId(params?: {}): Promise<implicitReturnType>;
    privateGetWalletFunds(params?: {}): Promise<implicitReturnType>;
    privateGetFuturesFunds(params?: {}): Promise<implicitReturnType>;
    privateGetFuturesOrders(params?: {}): Promise<implicitReturnType>;
    privateGetFuturesOrdersHistory(params?: {}): Promise<implicitReturnType>;
    privateGetFuturesOrdersOrderId(params?: {}): Promise<implicitReturnType>;
    privateGetFuturesPositions(params?: {}): Promise<implicitReturnType>;
    privateGetFuturesPositionsHistory(params?: {}): Promise<implicitReturnType>;
    privateGetFuturesFeeHistory(params?: {}): Promise<implicitReturnType>;
    privateGetFuturesAssetIdLeverage(params?: {}): Promise<implicitReturnType>;
    privateGetFuturesPositionsPositionIdLiqPrice(params?: {}): Promise<implicitReturnType>;
    privatePostWalletFuturesTransfer(params?: {}): Promise<implicitReturnType>;
    privatePostFuturesTransfersInr(params?: {}): Promise<implicitReturnType>;
    privatePostFuturesAssetIdOrder(params?: {}): Promise<implicitReturnType>;
    privatePostFuturesPositionsPositionIdClose(params?: {}): Promise<implicitReturnType>;
    privatePostFuturesPositionsPositionIdClosePartial(params?: {}): Promise<implicitReturnType>;
    privatePostFuturesPositionsPositionIdReverse(params?: {}): Promise<implicitReturnType>;
    privatePostFuturesPositionsPositionIdAddMargin(params?: {}): Promise<implicitReturnType>;
    privatePostFuturesPositionsPositionIdRiskorder(params?: {}): Promise<implicitReturnType>;
    privatePostFuturesAssetIdLeverage(params?: {}): Promise<implicitReturnType>;
    privatePatchFuturesOrdersOrderId(params?: {}): Promise<implicitReturnType>;
    privatePatchFuturesPositionsPositionIdRiskorder(params?: {}): Promise<implicitReturnType>;
    privateDeleteFuturesOrdersOrderId(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
