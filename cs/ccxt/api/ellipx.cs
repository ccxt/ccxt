// -------------------------------------------------------------------------------

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

// -------------------------------------------------------------------------------

namespace ccxt;

public partial class ellipx : Exchange
{
    public ellipx (object args = null): base(args) {}

    public async Task<object> _restGetMarket (object parameters = null)
    {
        return await this.callAsync ("_restGetMarket",parameters);
    }

    public async Task<object> _restGetMarketCurrencyPair (object parameters = null)
    {
        return await this.callAsync ("_restGetMarketCurrencyPair",parameters);
    }

    public async Task<object> _restGetCryptoTokenInfo (object parameters = null)
    {
        return await this.callAsync ("_restGetCryptoTokenInfo",parameters);
    }

    public async Task<object> publicGetMarketCurrencyPairGetDepth (object parameters = null)
    {
        return await this.callAsync ("publicGetMarketCurrencyPairGetDepth",parameters);
    }

    public async Task<object> publicGetMarketCurrencyPairTicker (object parameters = null)
    {
        return await this.callAsync ("publicGetMarketCurrencyPairTicker",parameters);
    }

    public async Task<object> publicGetMarketCurrencyPairGetTrades (object parameters = null)
    {
        return await this.callAsync ("publicGetMarketCurrencyPairGetTrades",parameters);
    }

    public async Task<object> publicGetMarketCurrencyPairGetGraph (object parameters = null)
    {
        return await this.callAsync ("publicGetMarketCurrencyPairGetGraph",parameters);
    }

    public async Task<object> publicGetCMCSummary (object parameters = null)
    {
        return await this.callAsync ("publicGetCMCSummary",parameters);
    }

    public async Task<object> publicGetCMCCurrencyPairTicker (object parameters = null)
    {
        return await this.callAsync ("publicGetCMCCurrencyPairTicker",parameters);
    }

    public async Task<object> privateGetUserWallet (object parameters = null)
    {
        return await this.callAsync ("privateGetUserWallet",parameters);
    }

    public async Task<object> privateGetMarketCurrencyPairOrder (object parameters = null)
    {
        return await this.callAsync ("privateGetMarketCurrencyPairOrder",parameters);
    }

    public async Task<object> privateGetMarketOrderOrderUuid (object parameters = null)
    {
        return await this.callAsync ("privateGetMarketOrderOrderUuid",parameters);
    }

    public async Task<object> privateGetMarketCurrencyPairTrade (object parameters = null)
    {
        return await this.callAsync ("privateGetMarketCurrencyPairTrade",parameters);
    }

    public async Task<object> privateGetMarketTradeFeeQuery (object parameters = null)
    {
        return await this.callAsync ("privateGetMarketTradeFeeQuery",parameters);
    }

    public async Task<object> privateGetUnitCurrency (object parameters = null)
    {
        return await this.callAsync ("privateGetUnitCurrency",parameters);
    }

    public async Task<object> privateGetCryptoTokenCurrency (object parameters = null)
    {
        return await this.callAsync ("privateGetCryptoTokenCurrency",parameters);
    }

    public async Task<object> privateGetCryptoTokenCurrencyChains (object parameters = null)
    {
        return await this.callAsync ("privateGetCryptoTokenCurrencyChains",parameters);
    }

    public async Task<object> privatePostMarketCurrencyPairOrder (object parameters = null)
    {
        return await this.callAsync ("privatePostMarketCurrencyPairOrder",parameters);
    }

    public async Task<object> privatePostCryptoAddressFetch (object parameters = null)
    {
        return await this.callAsync ("privatePostCryptoAddressFetch",parameters);
    }

    public async Task<object> privatePostCryptoDisbursementWithdraw (object parameters = null)
    {
        return await this.callAsync ("privatePostCryptoDisbursementWithdraw",parameters);
    }

    public async Task<object> privateDeleteMarketOrderOrderUuid (object parameters = null)
    {
        return await this.callAsync ("privateDeleteMarketOrderOrderUuid",parameters);
    }

}