// -------------------------------------------------------------------------------

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

// -------------------------------------------------------------------------------

namespace ccxt;

public partial class ascendex : Exchange
{
    public ascendex (object args = null): base(args) {}

    public async Task<object> v1PublicGetAssets (object parameters = null)
    {
        return await this.callAsync ("v1PublicGetAssets",parameters);
    }

    public async Task<object> v1PublicGetProducts (object parameters = null)
    {
        return await this.callAsync ("v1PublicGetProducts",parameters);
    }

    public async Task<object> v1PublicGetTicker (object parameters = null)
    {
        return await this.callAsync ("v1PublicGetTicker",parameters);
    }

    public async Task<object> v1PublicGetBarhistInfo (object parameters = null)
    {
        return await this.callAsync ("v1PublicGetBarhistInfo",parameters);
    }

    public async Task<object> v1PublicGetBarhist (object parameters = null)
    {
        return await this.callAsync ("v1PublicGetBarhist",parameters);
    }

    public async Task<object> v1PublicGetDepth (object parameters = null)
    {
        return await this.callAsync ("v1PublicGetDepth",parameters);
    }

    public async Task<object> v1PublicGetTrades (object parameters = null)
    {
        return await this.callAsync ("v1PublicGetTrades",parameters);
    }

    public async Task<object> v1PublicGetCashAssets (object parameters = null)
    {
        return await this.callAsync ("v1PublicGetCashAssets",parameters);
    }

    public async Task<object> v1PublicGetCashProducts (object parameters = null)
    {
        return await this.callAsync ("v1PublicGetCashProducts",parameters);
    }

    public async Task<object> v1PublicGetMarginAssets (object parameters = null)
    {
        return await this.callAsync ("v1PublicGetMarginAssets",parameters);
    }

    public async Task<object> v1PublicGetMarginProducts (object parameters = null)
    {
        return await this.callAsync ("v1PublicGetMarginProducts",parameters);
    }

    public async Task<object> v1PublicGetFuturesCollateral (object parameters = null)
    {
        return await this.callAsync ("v1PublicGetFuturesCollateral",parameters);
    }

    public async Task<object> v1PublicGetFuturesContracts (object parameters = null)
    {
        return await this.callAsync ("v1PublicGetFuturesContracts",parameters);
    }

    public async Task<object> v1PublicGetFuturesRefPx (object parameters = null)
    {
        return await this.callAsync ("v1PublicGetFuturesRefPx",parameters);
    }

    public async Task<object> v1PublicGetFuturesMarketData (object parameters = null)
    {
        return await this.callAsync ("v1PublicGetFuturesMarketData",parameters);
    }

    public async Task<object> v1PublicGetFuturesFundingRates (object parameters = null)
    {
        return await this.callAsync ("v1PublicGetFuturesFundingRates",parameters);
    }

    public async Task<object> v1PublicGetRiskLimitInfo (object parameters = null)
    {
        return await this.callAsync ("v1PublicGetRiskLimitInfo",parameters);
    }

    public async Task<object> v1PublicGetExchangeInfo (object parameters = null)
    {
        return await this.callAsync ("v1PublicGetExchangeInfo",parameters);
    }

    public async Task<object> v1PrivateGetInfo (object parameters = null)
    {
        return await this.callAsync ("v1PrivateGetInfo",parameters);
    }

    public async Task<object> v1PrivateGetWalletTransactions (object parameters = null)
    {
        return await this.callAsync ("v1PrivateGetWalletTransactions",parameters);
    }

    public async Task<object> v1PrivateGetWalletDepositAddress (object parameters = null)
    {
        return await this.callAsync ("v1PrivateGetWalletDepositAddress",parameters);
    }

    public async Task<object> v1PrivateGetDataBalanceSnapshot (object parameters = null)
    {
        return await this.callAsync ("v1PrivateGetDataBalanceSnapshot",parameters);
    }

    public async Task<object> v1PrivateGetDataBalanceHistory (object parameters = null)
    {
        return await this.callAsync ("v1PrivateGetDataBalanceHistory",parameters);
    }

    public async Task<object> v1PrivateAccountCategoryGetBalance (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountCategoryGetBalance",parameters);
    }

    public async Task<object> v1PrivateAccountCategoryGetOrderOpen (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountCategoryGetOrderOpen",parameters);
    }

    public async Task<object> v1PrivateAccountCategoryGetOrderStatus (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountCategoryGetOrderStatus",parameters);
    }

    public async Task<object> v1PrivateAccountCategoryGetOrderHistCurrent (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountCategoryGetOrderHistCurrent",parameters);
    }

    public async Task<object> v1PrivateAccountCategoryGetRisk (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountCategoryGetRisk",parameters);
    }

    public async Task<object> v1PrivateAccountCategoryPostOrder (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountCategoryPostOrder",parameters);
    }

    public async Task<object> v1PrivateAccountCategoryPostOrderBatch (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountCategoryPostOrderBatch",parameters);
    }

    public async Task<object> v1PrivateAccountCategoryDeleteOrder (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountCategoryDeleteOrder",parameters);
    }

    public async Task<object> v1PrivateAccountCategoryDeleteOrderAll (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountCategoryDeleteOrderAll",parameters);
    }

    public async Task<object> v1PrivateAccountCategoryDeleteOrderBatch (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountCategoryDeleteOrderBatch",parameters);
    }

    public async Task<object> v1PrivateAccountGroupGetCashBalance (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountGroupGetCashBalance",parameters);
    }

    public async Task<object> v1PrivateAccountGroupGetMarginBalance (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountGroupGetMarginBalance",parameters);
    }

    public async Task<object> v1PrivateAccountGroupGetMarginRisk (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountGroupGetMarginRisk",parameters);
    }

    public async Task<object> v1PrivateAccountGroupGetFuturesCollateralBalance (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountGroupGetFuturesCollateralBalance",parameters);
    }

    public async Task<object> v1PrivateAccountGroupGetFuturesPosition (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountGroupGetFuturesPosition",parameters);
    }

    public async Task<object> v1PrivateAccountGroupGetFuturesRisk (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountGroupGetFuturesRisk",parameters);
    }

    public async Task<object> v1PrivateAccountGroupGetFuturesFundingPayments (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountGroupGetFuturesFundingPayments",parameters);
    }

    public async Task<object> v1PrivateAccountGroupGetOrderHist (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountGroupGetOrderHist",parameters);
    }

    public async Task<object> v1PrivateAccountGroupGetSpotFee (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountGroupGetSpotFee",parameters);
    }

    public async Task<object> v1PrivateAccountGroupPostTransfer (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountGroupPostTransfer",parameters);
    }

    public async Task<object> v1PrivateAccountGroupPostFuturesTransferDeposit (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountGroupPostFuturesTransferDeposit",parameters);
    }

    public async Task<object> v1PrivateAccountGroupPostFuturesTransferWithdraw (object parameters = null)
    {
        return await this.callAsync ("v1PrivateAccountGroupPostFuturesTransferWithdraw",parameters);
    }

    public async Task<object> v2PublicGetAssets (object parameters = null)
    {
        return await this.callAsync ("v2PublicGetAssets",parameters);
    }

    public async Task<object> v2PublicGetFuturesContract (object parameters = null)
    {
        return await this.callAsync ("v2PublicGetFuturesContract",parameters);
    }

    public async Task<object> v2PublicGetFuturesCollateral (object parameters = null)
    {
        return await this.callAsync ("v2PublicGetFuturesCollateral",parameters);
    }

    public async Task<object> v2PublicGetFuturesPricingData (object parameters = null)
    {
        return await this.callAsync ("v2PublicGetFuturesPricingData",parameters);
    }

    public async Task<object> v2PublicGetFuturesTicker (object parameters = null)
    {
        return await this.callAsync ("v2PublicGetFuturesTicker",parameters);
    }

    public async Task<object> v2PublicGetRiskLimitInfo (object parameters = null)
    {
        return await this.callAsync ("v2PublicGetRiskLimitInfo",parameters);
    }

    public async Task<object> v2PrivateDataGetOrderHist (object parameters = null)
    {
        return await this.callAsync ("v2PrivateDataGetOrderHist",parameters);
    }

    public async Task<object> v2PrivateGetAccountInfo (object parameters = null)
    {
        return await this.callAsync ("v2PrivateGetAccountInfo",parameters);
    }

    public async Task<object> v2PrivateAccountGroupGetOrderHist (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupGetOrderHist",parameters);
    }

    public async Task<object> v2PrivateAccountGroupGetFuturesPosition (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupGetFuturesPosition",parameters);
    }

    public async Task<object> v2PrivateAccountGroupGetFuturesFreeMargin (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupGetFuturesFreeMargin",parameters);
    }

    public async Task<object> v2PrivateAccountGroupGetFuturesOrderHistCurrent (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupGetFuturesOrderHistCurrent",parameters);
    }

    public async Task<object> v2PrivateAccountGroupGetFuturesFundingPayments (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupGetFuturesFundingPayments",parameters);
    }

    public async Task<object> v2PrivateAccountGroupGetFuturesOrderOpen (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupGetFuturesOrderOpen",parameters);
    }

    public async Task<object> v2PrivateAccountGroupGetFuturesOrderStatus (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupGetFuturesOrderStatus",parameters);
    }

    public async Task<object> v2PrivateAccountGroupPostFuturesIsolatedPositionMargin (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupPostFuturesIsolatedPositionMargin",parameters);
    }

    public async Task<object> v2PrivateAccountGroupPostFuturesMarginType (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupPostFuturesMarginType",parameters);
    }

    public async Task<object> v2PrivateAccountGroupPostFuturesLeverage (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupPostFuturesLeverage",parameters);
    }

    public async Task<object> v2PrivateAccountGroupPostFuturesTransferDeposit (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupPostFuturesTransferDeposit",parameters);
    }

    public async Task<object> v2PrivateAccountGroupPostFuturesTransferWithdraw (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupPostFuturesTransferWithdraw",parameters);
    }

    public async Task<object> v2PrivateAccountGroupPostFuturesOrder (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupPostFuturesOrder",parameters);
    }

    public async Task<object> v2PrivateAccountGroupPostFuturesOrderBatch (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupPostFuturesOrderBatch",parameters);
    }

    public async Task<object> v2PrivateAccountGroupPostFuturesOrderOpen (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupPostFuturesOrderOpen",parameters);
    }

    public async Task<object> v2PrivateAccountGroupPostSubuserSubuserTransfer (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupPostSubuserSubuserTransfer",parameters);
    }

    public async Task<object> v2PrivateAccountGroupPostSubuserSubuserTransferHist (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupPostSubuserSubuserTransferHist",parameters);
    }

    public async Task<object> v2PrivateAccountGroupDeleteFuturesOrder (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupDeleteFuturesOrder",parameters);
    }

    public async Task<object> v2PrivateAccountGroupDeleteFuturesOrderBatch (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupDeleteFuturesOrderBatch",parameters);
    }

    public async Task<object> v2PrivateAccountGroupDeleteFuturesOrderAll (object parameters = null)
    {
        return await this.callAsync ("v2PrivateAccountGroupDeleteFuturesOrderAll",parameters);
    }

}