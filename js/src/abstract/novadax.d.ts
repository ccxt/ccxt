import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetCommonSymbol(params?: {}): Promise<implicitReturnType>;
    publicGetCommonSymbols(params?: {}): Promise<implicitReturnType>;
    publicGetCommonTimestamp(params?: {}): Promise<implicitReturnType>;
    publicGetMarketTickers(params?: {}): Promise<implicitReturnType>;
    publicGetMarketTicker(params?: {}): Promise<implicitReturnType>;
    publicGetMarketDepth(params?: {}): Promise<implicitReturnType>;
    publicGetMarketTrades(params?: {}): Promise<implicitReturnType>;
    publicGetMarketKlineHistory(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersGet(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersList(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersFill(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersFills(params?: {}): Promise<implicitReturnType>;
    privateGetAccountGetBalance(params?: {}): Promise<implicitReturnType>;
    privateGetAccountSubs(params?: {}): Promise<implicitReturnType>;
    privateGetAccountSubsBalance(params?: {}): Promise<implicitReturnType>;
    privateGetAccountSubsTransferRecord(params?: {}): Promise<implicitReturnType>;
    privateGetWalletQueryDepositWithdraw(params?: {}): Promise<implicitReturnType>;
    privatePostOrdersCreate(params?: {}): Promise<implicitReturnType>;
    privatePostOrdersCancel(params?: {}): Promise<implicitReturnType>;
    privatePostAccountWithdrawCoin(params?: {}): Promise<implicitReturnType>;
    privatePostAccountSubsTransfer(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
