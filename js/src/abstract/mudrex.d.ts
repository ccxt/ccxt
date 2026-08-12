import { Dict } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    marketGetPriceKline(params?: {}): Promise<Dict>;
    marketGetPriceMarkKline(params?: {}): Promise<Dict>;
    privateGetFutures(params?: {}): Promise<Dict>;
    privateGetFuturesAssetId(params?: {}): Promise<Dict>;
    privateGetWalletFunds(params?: {}): Promise<Dict>;
    privateGetFuturesFunds(params?: {}): Promise<Dict>;
    privateGetFuturesOrders(params?: {}): Promise<Dict>;
    privateGetFuturesOrdersHistory(params?: {}): Promise<Dict>;
    privateGetFuturesOrdersOrderId(params?: {}): Promise<Dict>;
    privateGetFuturesPositions(params?: {}): Promise<Dict>;
    privateGetFuturesPositionsHistory(params?: {}): Promise<Dict>;
    privateGetFuturesFeeHistory(params?: {}): Promise<Dict>;
    privateGetFuturesAssetIdLeverage(params?: {}): Promise<Dict>;
    privateGetFuturesPositionsPositionIdLiqPrice(params?: {}): Promise<Dict>;
    privatePostWalletFuturesTransfer(params?: {}): Promise<Dict>;
    privatePostFuturesTransfersInr(params?: {}): Promise<Dict>;
    privatePostFuturesAssetIdOrder(params?: {}): Promise<Dict>;
    privatePostFuturesPositionsPositionIdClose(params?: {}): Promise<Dict>;
    privatePostFuturesPositionsPositionIdClosePartial(params?: {}): Promise<Dict>;
    privatePostFuturesPositionsPositionIdReverse(params?: {}): Promise<Dict>;
    privatePostFuturesPositionsPositionIdAddMargin(params?: {}): Promise<Dict>;
    privatePostFuturesPositionsPositionIdRiskorder(params?: {}): Promise<Dict>;
    privatePostFuturesAssetIdLeverage(params?: {}): Promise<Dict>;
    privatePatchFuturesOrdersOrderId(params?: {}): Promise<Dict>;
    privatePatchFuturesPositionsPositionIdRiskorder(params?: {}): Promise<Dict>;
    privateDeleteFuturesOrdersOrderId(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
