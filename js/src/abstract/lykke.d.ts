import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetAssetpairs(params?: {}): Promise<implicitReturnType>;
    publicGetAssetpairsId(params?: {}): Promise<implicitReturnType>;
    publicGetAssets(params?: {}): Promise<implicitReturnType>;
    publicGetAssetsId(params?: {}): Promise<implicitReturnType>;
    publicGetIsalive(params?: {}): Promise<implicitReturnType>;
    publicGetOrderbooks(params?: {}): Promise<implicitReturnType>;
    publicGetTickers(params?: {}): Promise<implicitReturnType>;
    publicGetPrices(params?: {}): Promise<implicitReturnType>;
    publicGetTradesPublicAssetPairId(params?: {}): Promise<implicitReturnType>;
    privateGetBalance(params?: {}): Promise<implicitReturnType>;
    privateGetTrades(params?: {}): Promise<implicitReturnType>;
    privateGetTradesOrderOrderId(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersActive(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersClosed(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersOrderId(params?: {}): Promise<implicitReturnType>;
    privateGetOperations(params?: {}): Promise<implicitReturnType>;
    privateGetOperationsDepositsAddresses(params?: {}): Promise<implicitReturnType>;
    privateGetOperationsDepositsAddressesAssetId(params?: {}): Promise<implicitReturnType>;
    privatePostOrdersLimit(params?: {}): Promise<implicitReturnType>;
    privatePostOrdersMarket(params?: {}): Promise<implicitReturnType>;
    privatePostOrdersBulk(params?: {}): Promise<implicitReturnType>;
    privatePostOperationsWithdrawals(params?: {}): Promise<implicitReturnType>;
    privatePostOperationsDepositsAddresses(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrders(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrdersOrderId(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
