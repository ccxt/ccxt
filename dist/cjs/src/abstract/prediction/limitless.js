'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var PredictionExchange = require('../../base/PredictionExchange.js');

// ----------------------------------------------------------------------------
class Exchange extends PredictionExchange["default"] {
    limitlessPublicGetMarketsActive(params = {}) {
        return this.request('markets/active', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetMarketsActiveCategoryId(params = {}) {
        return this.request('markets/active/{categoryId}', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetCategories(params = {}) {
        return this.request('categories', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetMarketsAddressOrSlug(params = {}) {
        return this.request('markets/{addressOrSlug}', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetMarketsCategoriesCount(params = {}) {
        return this.request('markets/categories/count', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetMarketsActiveSlugs(params = {}) {
        return this.request('markets/active/slugs', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetMarketsSearch(params = {}) {
        return this.request('markets/search', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetMarketsSlugOrderbook(params = {}) {
        return this.request('markets/{slug}/orderbook', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetMarketsSlugHistoricalPrice(params = {}) {
        return this.request('markets/{slug}/historical-price', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetAuthSigningMessage(params = {}) {
        return this.request('auth/signing-message', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetMarketsAddressOrSlugOracleCandles(params = {}) {
        return this.request('markets/{addressOrSlug}/oracle-candles', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetMarketsSlugGetFeedEvents(params = {}) {
        return this.request('markets/{slug}/get-feed-events', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetMarketsSlugEvents(params = {}) {
        return this.request('markets/{slug}/events', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetMarketsTimeline(params = {}) {
        return this.request('markets/timeline', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetMarketsSlugTimeline(params = {}) {
        return this.request('markets/{slug}/timeline', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetNavigation(params = {}) {
        return this.request('navigation', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetMarketPagesByPath(params = {}) {
        return this.request('market-pages/by-path', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetMarketPagesIdMarkets(params = {}) {
        return this.request('market-pages/{id}/markets', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetPropertyKeys(params = {}) {
        return this.request('property-keys', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetPropertyKeysId(params = {}) {
        return this.request('property-keys/{id}', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetPropertyKeysIdOptions(params = {}) {
        return this.request('property-keys/{id}/options', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetPortfolioAccountTradedVolume(params = {}) {
        return this.request('portfolio/{account}/traded-volume', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetPortfolioAccountPositions(params = {}) {
        return this.request('portfolio/{account}/positions', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPublicGetPortfolioAccountPnlChart(params = {}) {
        return this.request('portfolio/{account}/pnl-chart', ['limitless', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateGetAuthApiKeys(params = {}) {
        return this.request('auth/api-keys', ['limitless', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateGetProfilesPartnerAccounts(params = {}) {
        return this.request('profiles/partner-accounts', ['limitless', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateGetMarketsSlugUserOrders(params = {}) {
        return this.request('markets/{slug}/user-orders', ['limitless', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateGetPortfolioPositions(params = {}) {
        return this.request('portfolio/positions', ['limitless', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateGetPortfolioTrades(params = {}) {
        return this.request('portfolio/trades', ['limitless', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateGetMarketsSlugLockedBalance(params = {}) {
        return this.request('markets/{slug}/locked-balance', ['limitless', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateGetProfilesMe(params = {}) {
        return this.request('profiles/me', ['limitless', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateGetProfilesAccount(params = {}) {
        return this.request('profiles/{account}', ['limitless', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateGetPortfolioPnlChart(params = {}) {
        return this.request('portfolio/pnl-chart', ['limitless', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateGetPortfolioHistory(params = {}) {
        return this.request('portfolio/history', ['limitless', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateGetPortfolioPoints(params = {}) {
        return this.request('portfolio/points', ['limitless', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateGetPortfolioTradingAllowance(params = {}) {
        return this.request('portfolio/trading/allowance', ['limitless', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateGetAuthApiTokensCapabilities(params = {}) {
        return this.request('auth/api-tokens/capabilities', ['limitless', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateGetAuthApiTokens(params = {}) {
        return this.request('auth/api-tokens', ['limitless', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateGetProfilesPartnerAccountsProfileIdAllowances(params = {}) {
        return this.request('profiles/partner-accounts/{profileId}/allowances', ['limitless', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivatePostAuthLogout(params = {}) {
        return this.request('auth/logout', ['limitless', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivatePostAuthApiKeys(params = {}) {
        return this.request('auth/api-keys', ['limitless', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivatePostAuthLogin(params = {}) {
        return this.request('auth/login', ['limitless', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivatePostOrders(params = {}) {
        return this.request('orders', ['limitless', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivatePostOrdersCancel(params = {}) {
        return this.request('orders/cancel', ['limitless', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivatePostOrdersCancelBatch(params = {}) {
        return this.request('orders/cancel-batch', ['limitless', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivatePostOrdersBatchCancel(params = {}) {
        return this.request('orders/batch-cancel', ['limitless', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivatePostOrdersStatusBatch(params = {}) {
        return this.request('orders/status/batch', ['limitless', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivatePostPortfolioRedeem(params = {}) {
        return this.request('portfolio/redeem', ['limitless', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivatePostPortfolioWithdraw(params = {}) {
        return this.request('portfolio/withdraw', ['limitless', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivatePostPortfolioWithdrawalAddresses(params = {}) {
        return this.request('portfolio/withdrawal-addresses', ['limitless', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivatePostAuthApiTokensDerive(params = {}) {
        return this.request('auth/api-tokens/derive', ['limitless', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivatePostProfilesPartnerAccounts(params = {}) {
        return this.request('profiles/partner-accounts', ['limitless', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivatePostProfilesPartnerAccountsProfileIdAllowancesRetry(params = {}) {
        return this.request('profiles/partner-accounts/{profileId}/allowances/retry', ['limitless', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateDeleteAuthApiKeys(params = {}) {
        return this.request('auth/api-keys', ['limitless', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateDeleteOrdersOrderId(params = {}) {
        return this.request('orders/{order_id}', ['limitless', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateDeleteOrdersAllSlug(params = {}) {
        return this.request('orders/all/{slug}', ['limitless', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateDeleteAuthApiTokensTokenId(params = {}) {
        return this.request('auth/api-tokens/{tokenId}', ['limitless', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    limitlessPrivateDeletePortfolioWithdrawalAddressesAddress(params = {}) {
        return this.request('portfolio/withdrawal-addresses/{address}', ['limitless', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
