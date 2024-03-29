// -------------------------------------------------------------------------------

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

// -------------------------------------------------------------------------------

namespace ccxt;

public partial class probit : Exchange
{
    public probit (object args = null): base(args) {}

    public async Task<object> publicGetMarket (object parameters = null)
    {
        return await this.callAsync ("publicGetMarket",parameters);
    }

    public async Task<object> publicGetCurrency (object parameters = null)
    {
        return await this.callAsync ("publicGetCurrency",parameters);
    }

    public async Task<object> publicGetCurrencyWithPlatform (object parameters = null)
    {
        return await this.callAsync ("publicGetCurrencyWithPlatform",parameters);
    }

    public async Task<object> publicGetTime (object parameters = null)
    {
        return await this.callAsync ("publicGetTime",parameters);
    }

    public async Task<object> publicGetTicker (object parameters = null)
    {
        return await this.callAsync ("publicGetTicker",parameters);
    }

    public async Task<object> publicGetOrderBook (object parameters = null)
    {
        return await this.callAsync ("publicGetOrderBook",parameters);
    }

    public async Task<object> publicGetTrade (object parameters = null)
    {
        return await this.callAsync ("publicGetTrade",parameters);
    }

    public async Task<object> publicGetCandle (object parameters = null)
    {
        return await this.callAsync ("publicGetCandle",parameters);
    }

    public async Task<object> privatePostNewOrder (object parameters = null)
    {
        return await this.callAsync ("privatePostNewOrder",parameters);
    }

    public async Task<object> privatePostCancelOrder (object parameters = null)
    {
        return await this.callAsync ("privatePostCancelOrder",parameters);
    }

    public async Task<object> privatePostWithdrawal (object parameters = null)
    {
        return await this.callAsync ("privatePostWithdrawal",parameters);
    }

    public async Task<object> privateGetBalance (object parameters = null)
    {
        return await this.callAsync ("privateGetBalance",parameters);
    }

    public async Task<object> privateGetOrder (object parameters = null)
    {
        return await this.callAsync ("privateGetOrder",parameters);
    }

    public async Task<object> privateGetOpenOrder (object parameters = null)
    {
        return await this.callAsync ("privateGetOpenOrder",parameters);
    }

    public async Task<object> privateGetOrderHistory (object parameters = null)
    {
        return await this.callAsync ("privateGetOrderHistory",parameters);
    }

    public async Task<object> privateGetTradeHistory (object parameters = null)
    {
        return await this.callAsync ("privateGetTradeHistory",parameters);
    }

    public async Task<object> privateGetDepositAddress (object parameters = null)
    {
        return await this.callAsync ("privateGetDepositAddress",parameters);
    }

    public async Task<object> privateGetTransferPayment (object parameters = null)
    {
        return await this.callAsync ("privateGetTransferPayment",parameters);
    }

    public async Task<object> accountsPostToken (object parameters = null)
    {
        return await this.callAsync ("accountsPostToken",parameters);
    }

}