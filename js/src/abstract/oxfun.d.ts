import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetV3Markets(params?: {}): Promise<implicitReturnType>;
    publicGetV3Assets(params?: {}): Promise<implicitReturnType>;
    publicGetV3Tickers(params?: {}): Promise<implicitReturnType>;
    publicGetV3FundingEstimates(params?: {}): Promise<implicitReturnType>;
    publicGetV3Candles(params?: {}): Promise<implicitReturnType>;
    publicGetV3Depth(params?: {}): Promise<implicitReturnType>;
    publicGetV3MarketsOperational(params?: {}): Promise<implicitReturnType>;
    publicGetV3ExchangeTrades(params?: {}): Promise<implicitReturnType>;
    publicGetV3FundingRates(params?: {}): Promise<implicitReturnType>;
    publicGetV3LeverageTiers(params?: {}): Promise<implicitReturnType>;
    privateGetV3Account(params?: {}): Promise<implicitReturnType>;
    privateGetV3AccountNames(params?: {}): Promise<implicitReturnType>;
    privateGetV3Wallet(params?: {}): Promise<implicitReturnType>;
    privateGetV3Transfer(params?: {}): Promise<implicitReturnType>;
    privateGetV3Balances(params?: {}): Promise<implicitReturnType>;
    privateGetV3Positions(params?: {}): Promise<implicitReturnType>;
    privateGetV3Funding(params?: {}): Promise<implicitReturnType>;
    privateGetV3DepositAddresses(params?: {}): Promise<implicitReturnType>;
    privateGetV3Deposit(params?: {}): Promise<implicitReturnType>;
    privateGetV3WithdrawalAddresses(params?: {}): Promise<implicitReturnType>;
    privateGetV3Withdrawal(params?: {}): Promise<implicitReturnType>;
    privateGetV3WithdrawalFees(params?: {}): Promise<implicitReturnType>;
    privateGetV3OrdersStatus(params?: {}): Promise<implicitReturnType>;
    privateGetV3OrdersWorking(params?: {}): Promise<implicitReturnType>;
    privateGetV3Trades(params?: {}): Promise<implicitReturnType>;
    privatePostV3Transfer(params?: {}): Promise<implicitReturnType>;
    privatePostV3Withdrawal(params?: {}): Promise<implicitReturnType>;
    privatePostV3OrdersPlace(params?: {}): Promise<implicitReturnType>;
    privateDeleteV3OrdersCancel(params?: {}): Promise<implicitReturnType>;
    privateDeleteV3OrdersCancelAll(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
