import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract publicGetAssetpairs (params?: {}): Promise<implicitReturnType>;
    abstract publicGetAssetpairsId (params?: {}): Promise<implicitReturnType>;
    abstract publicGetAssets (params?: {}): Promise<implicitReturnType>;
    abstract publicGetAssetsId (params?: {}): Promise<implicitReturnType>;
    abstract publicGetIsalive (params?: {}): Promise<implicitReturnType>;
    abstract publicGetOrderbooks (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTickers (params?: {}): Promise<implicitReturnType>;
    abstract publicGetPrices (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTradesPublicAssetPairId (params?: {}): Promise<implicitReturnType>;
    abstract privateGetBalance (params?: {}): Promise<implicitReturnType>;
    abstract privateGetTrades (params?: {}): Promise<implicitReturnType>;
    abstract privateGetTradesOrderOrderId (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrdersActive (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrdersClosed (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrdersOrderId (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOperations (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOperationsDepositsAddresses (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOperationsDepositsAddressesAssetId (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrdersLimit (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrdersMarket (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrdersBulk (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOperationsWithdrawals (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOperationsDepositsAddresses (params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteOrders (params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteOrdersOrderId (params?: {}): Promise<implicitReturnType>;
}