import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetOpenapiTime(params?: {}): Promise<implicitReturnType>;
    publicGetOpenapiSymbol(params?: {}): Promise<implicitReturnType>;
    publicGetOpenapiQuoteDepth(params?: {}): Promise<implicitReturnType>;
    publicGetOpenapiQuoteTrades(params?: {}): Promise<implicitReturnType>;
    publicGetOpenapiQuoteTicker(params?: {}): Promise<implicitReturnType>;
    publicGetOpenapiQuoteKlines(params?: {}): Promise<implicitReturnType>;
    publicGetOpenapiContractFundingRate(params?: {}): Promise<implicitReturnType>;
    publicGetOpenapiContractFundingRateHistory(params?: {}): Promise<implicitReturnType>;
    publicGetOpenapiQuoteOpenInterest(params?: {}): Promise<implicitReturnType>;
    publicGetOpenapiQuoteIndexPrice(params?: {}): Promise<implicitReturnType>;
    publicGetOpenapiQuoteMarkPrice(params?: {}): Promise<implicitReturnType>;
    publicGetOpenapiQuoteRiskLimit(params?: {}): Promise<implicitReturnType>;
    publicGetOpenapiQuoteInsurance(params?: {}): Promise<implicitReturnType>;
    publicGetOpenapiQuoteLiquidationOrders(params?: {}): Promise<implicitReturnType>;
    privateGetOpenapiContractAccount(params?: {}): Promise<implicitReturnType>;
    privateGetOpenapiContractOrder(params?: {}): Promise<implicitReturnType>;
    privateGetOpenapiContractOrderHistory(params?: {}): Promise<implicitReturnType>;
    privateGetOpenapiContractMyTrades(params?: {}): Promise<implicitReturnType>;
    privateGetOpenapiContractPositions(params?: {}): Promise<implicitReturnType>;
    privateGetOpenapiContractPositionHistory(params?: {}): Promise<implicitReturnType>;
    privateGetOpenapiContractAsset(params?: {}): Promise<implicitReturnType>;
    privateGetOpenapiContractTransfer(params?: {}): Promise<implicitReturnType>;
    privateGetOpenapiContractIncome(params?: {}): Promise<implicitReturnType>;
    privateGetOpenapiContractLeverage(params?: {}): Promise<implicitReturnType>;
    privateGetOpenapiContractForceOrders(params?: {}): Promise<implicitReturnType>;
    privateGetOpenapiContractAdlQuantile(params?: {}): Promise<implicitReturnType>;
    privatePostOpenapiContractOrder(params?: {}): Promise<implicitReturnType>;
    privatePostOpenapiContractBatchOrders(params?: {}): Promise<implicitReturnType>;
    privatePostOpenapiContractLeverage(params?: {}): Promise<implicitReturnType>;
    privatePostOpenapiContractPositionMargin(params?: {}): Promise<implicitReturnType>;
    privatePostOpenapiContractPositionRiskLimit(params?: {}): Promise<implicitReturnType>;
    privatePostOpenapiContractOpenOrders(params?: {}): Promise<implicitReturnType>;
    privatePostOpenapiContractHistoryOrders(params?: {}): Promise<implicitReturnType>;
    privateDeleteOpenapiContractOrderCancel(params?: {}): Promise<implicitReturnType>;
    privateDeleteOpenapiContractBatchOrders(params?: {}): Promise<implicitReturnType>;
    privateDeleteOpenapiContractAllOpenOrders(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
