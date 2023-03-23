import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract zendeskGet360000292886 (params?: {}): Promise<implicitReturnType>;
    abstract zendeskGet201893608 (params?: {}): Promise<implicitReturnType>;
    abstract publicGetAssets (params?: {}): Promise<implicitReturnType>;
    abstract publicGetAssetPairs (params?: {}): Promise<implicitReturnType>;
    abstract publicGetDepth (params?: {}): Promise<implicitReturnType>;
    abstract publicGetOHLC (params?: {}): Promise<implicitReturnType>;
    abstract publicGetSpread (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTicker (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTime (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTrades (params?: {}): Promise<implicitReturnType>;
    abstract privatePostAddOrder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostAddOrderBatch (params?: {}): Promise<implicitReturnType>;
    abstract privatePostAddExport (params?: {}): Promise<implicitReturnType>;
    abstract privatePostBalance (params?: {}): Promise<implicitReturnType>;
    abstract privatePostCancelAll (params?: {}): Promise<implicitReturnType>;
    abstract privatePostCancelOrder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostCancelOrderBatch (params?: {}): Promise<implicitReturnType>;
    abstract privatePostClosedOrders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostDepositAddresses (params?: {}): Promise<implicitReturnType>;
    abstract privatePostDepositMethods (params?: {}): Promise<implicitReturnType>;
    abstract privatePostDepositStatus (params?: {}): Promise<implicitReturnType>;
    abstract privatePostEditOrder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostExportStatus (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetWebSocketsToken (params?: {}): Promise<implicitReturnType>;
    abstract privatePostLedgers (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOpenOrders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOpenPositions (params?: {}): Promise<implicitReturnType>;
    abstract privatePostQueryLedgers (params?: {}): Promise<implicitReturnType>;
    abstract privatePostQueryOrders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostQueryTrades (params?: {}): Promise<implicitReturnType>;
    abstract privatePostRetrieveExport (params?: {}): Promise<implicitReturnType>;
    abstract privatePostRemoveExport (params?: {}): Promise<implicitReturnType>;
    abstract privatePostTradeBalance (params?: {}): Promise<implicitReturnType>;
    abstract privatePostTradesHistory (params?: {}): Promise<implicitReturnType>;
    abstract privatePostTradeVolume (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdraw (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdrawCancel (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdrawInfo (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdrawStatus (params?: {}): Promise<implicitReturnType>;
    abstract privatePostStake (params?: {}): Promise<implicitReturnType>;
    abstract privatePostUnstake (params?: {}): Promise<implicitReturnType>;
    abstract privatePostStakingAssets (params?: {}): Promise<implicitReturnType>;
    abstract privatePostStakingPending (params?: {}): Promise<implicitReturnType>;
    abstract privatePostStakingTransactions (params?: {}): Promise<implicitReturnType>;
}