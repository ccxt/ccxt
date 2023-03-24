import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract publicGetDepthPair (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCurrenciesPair (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCurrenciesAll (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCurrencyPairsPair (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCurrencyPairsAll (params?: {}): Promise<implicitReturnType>;
    abstract publicGetLastPricePair (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTickerPair (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTradesPair (params?: {}): Promise<implicitReturnType>;
    abstract privatePostActiveOrders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostCancelOrder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostDepositHistory (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetIdInfo (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetInfo (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetInfo2 (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetPersonalInfo (params?: {}): Promise<implicitReturnType>;
    abstract privatePostTrade (params?: {}): Promise<implicitReturnType>;
    abstract privatePostTradeHistory (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdraw (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdrawHistory (params?: {}): Promise<implicitReturnType>;
    abstract ecapiPostCreateInvoice (params?: {}): Promise<implicitReturnType>;
    abstract ecapiPostGetInvoice (params?: {}): Promise<implicitReturnType>;
    abstract ecapiPostGetInvoiceIdsByOrderNumber (params?: {}): Promise<implicitReturnType>;
    abstract ecapiPostCancelInvoice (params?: {}): Promise<implicitReturnType>;
    abstract tlapiPostGetPositions (params?: {}): Promise<implicitReturnType>;
    abstract tlapiPostPositionHistory (params?: {}): Promise<implicitReturnType>;
    abstract tlapiPostActivePositions (params?: {}): Promise<implicitReturnType>;
    abstract tlapiPostCreatePosition (params?: {}): Promise<implicitReturnType>;
    abstract tlapiPostChangePosition (params?: {}): Promise<implicitReturnType>;
    abstract tlapiPostCancelPosition (params?: {}): Promise<implicitReturnType>;
    abstract fapiGetGroupsGroupId (params?: {}): Promise<implicitReturnType>;
    abstract fapiGetLastPriceGroupIdPair (params?: {}): Promise<implicitReturnType>;
    abstract fapiGetTickerGroupIdPair (params?: {}): Promise<implicitReturnType>;
    abstract fapiGetTradesGroupIdPair (params?: {}): Promise<implicitReturnType>;
    abstract fapiGetDepthGroupIdPair (params?: {}): Promise<implicitReturnType>;
}