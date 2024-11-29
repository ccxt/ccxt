import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarketInstruments(params?: {}): Promise<implicitReturnType>;
    publicGetMarketTickers(params?: {}): Promise<implicitReturnType>;
    publicGetMarketBooks(params?: {}): Promise<implicitReturnType>;
    publicGetMarketTrades(params?: {}): Promise<implicitReturnType>;
    publicGetMarketCandles(params?: {}): Promise<implicitReturnType>;
    publicGetMarketMarkPrice(params?: {}): Promise<implicitReturnType>;
    publicGetMarketFundingRate(params?: {}): Promise<implicitReturnType>;
    publicGetMarketFundingRateHistory(params?: {}): Promise<implicitReturnType>;
    privateGetAssetBalances(params?: {}): Promise<implicitReturnType>;
    privateGetTradeOrdersPending(params?: {}): Promise<implicitReturnType>;
    privateGetTradeFillsHistory(params?: {}): Promise<implicitReturnType>;
    privateGetAssetDepositHistory(params?: {}): Promise<implicitReturnType>;
    privateGetAssetWithdrawalHistory(params?: {}): Promise<implicitReturnType>;
    privateGetAssetBills(params?: {}): Promise<implicitReturnType>;
    privateGetAccountBalance(params?: {}): Promise<implicitReturnType>;
    privateGetAccountPositions(params?: {}): Promise<implicitReturnType>;
    privateGetAccountLeverageInfo(params?: {}): Promise<implicitReturnType>;
    privateGetAccountMarginMode(params?: {}): Promise<implicitReturnType>;
    privateGetAccountBatchLeverageInfo(params?: {}): Promise<implicitReturnType>;
    privateGetTradeOrdersTpslPending(params?: {}): Promise<implicitReturnType>;
    privateGetTradeOrdersHistory(params?: {}): Promise<implicitReturnType>;
    privateGetTradeOrdersTpslHistory(params?: {}): Promise<implicitReturnType>;
    privateGetUserQueryApikey(params?: {}): Promise<implicitReturnType>;
    privateGetAffiliateBasic(params?: {}): Promise<implicitReturnType>;
    privatePostTradeOrder(params?: {}): Promise<implicitReturnType>;
    privatePostTradeCancelOrder(params?: {}): Promise<implicitReturnType>;
    privatePostAccountSetLeverage(params?: {}): Promise<implicitReturnType>;
    privatePostTradeBatchOrders(params?: {}): Promise<implicitReturnType>;
    privatePostTradeOrderTpsl(params?: {}): Promise<implicitReturnType>;
    privatePostTradeCancelBatchOrders(params?: {}): Promise<implicitReturnType>;
    privatePostTradeCancelTpsl(params?: {}): Promise<implicitReturnType>;
    privatePostTradeClosePosition(params?: {}): Promise<implicitReturnType>;
    privatePostAssetTransfer(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
