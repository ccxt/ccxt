'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetBboMarket(params = {}) {
        return this.request("bbo/{market}", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetBboMarketInteractive(params = {}) {
        return this.request("bbo/{market}/interactive", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetFundingData(params = {}) {
        return this.request("funding/data", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetMarkets(params = {}) {
        return this.request("markets", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetMarketsHistory(params = {}) {
        return this.request("markets/history", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetMarketsKlines(params = {}) {
        return this.request("markets/klines", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetMarketsSettlementPrice(params = {}) {
        return this.request("markets/settlement-price", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetMarketsSummary(params = {}) {
        return this.request("markets/summary", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetOrderbookMarket(params = {}) {
        return this.request("orderbook/{market}", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetOrderbookMarketImpactPrice(params = {}) {
        return this.request("orderbook/{market}/impact-price", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetOrderbookMarketInteractive(params = {}) {
        return this.request("orderbook/{market}/interactive", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetInsurance(params = {}) {
        return this.request("insurance", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetJwksJson(params = {}) {
        return this.request("jwks.json", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetOnboarding(params = {}) {
        return this.request("onboarding", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetReferralsConfig(params = {}) {
        return this.request("referrals/config", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetStakingBalanceHistoryGlobal(params = {}) {
        return this.request("staking/balance/history/global", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetStakingConfig(params = {}) {
        return this.request("staking/config", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetSystemAnnouncements(params = {}) {
        return this.request("system/announcements", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetSystemConfig(params = {}) {
        return this.request("system/config", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetSystemPortfolioMarginConfig(params = {}) {
        return this.request("system/portfolio-margin-config", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetSystemState(params = {}) {
        return this.request("system/state", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetSystemTime(params = {}) {
        return this.request("system/time", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetSystemVolumeTiers(params = {}) {
        return this.request("system/volume-tiers", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTrades(params = {}) {
        return this.request("trades", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetVaults(params = {}) {
        return this.request("vaults", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetVaultsAnalytics(params = {}) {
        return this.request("vaults/analytics", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetVaultsBalance(params = {}) {
        return this.request("vaults/balance", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetVaultsConfig(params = {}) {
        return this.request("vaults/config", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetVaultsHistory(params = {}) {
        return this.request("vaults/history", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetVaultsPositions(params = {}) {
        return this.request("vaults/positions", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetVaultsSummary(params = {}) {
        return this.request("vaults/summary", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetVaultsTransfers(params = {}) {
        return this.request("vaults/transfers", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetXpFeeConfig(params = {}) {
        return this.request("xp/fee-config", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetXpPublicTransfers(params = {}) {
        return this.request("xp/public-transfers", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetXpTransferTransferId(params = {}) {
        return this.request("xp/transfer/{transfer_id}", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetAccount(params = {}) {
        return this.request("account", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetAccountCompliance(params = {}) {
        return this.request("account/compliance", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetAccountHistory(params = {}) {
        return this.request("account/history", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetAccountInfo(params = {}) {
        return this.request("account/info", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetAccountMargin(params = {}) {
        return this.request("account/margin", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetAccountProfile(params = {}) {
        return this.request("account/profile", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetAccountSettings(params = {}) {
        return this.request("account/settings", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetAccountSubaccounts(params = {}) {
        return this.request("account/subaccounts", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetAccountSummary(params = {}) {
        return this.request("account/summary", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetBalance(params = {}) {
        return this.request("balance", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetFills(params = {}) {
        return this.request("fills", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetFundingPayments(params = {}) {
        return this.request("funding/payments", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetPositions(params = {}) {
        return this.request("positions", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetTradebusts(params = {}) {
        return this.request("tradebusts", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetTransactions(params = {}) {
        return this.request("transactions", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetAccountKeysSubkeys(params = {}) {
        return this.request("account/keys/subkeys", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetAccountKeysSubkeysPublicKey(params = {}) {
        return this.request("account/keys/subkeys/{public_key}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetAccountTokens(params = {}) {
        return this.request("account/tokens", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetAlgoOrders(params = {}) {
        return this.request("algo/orders", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetAlgoOrdersHistory(params = {}) {
        return this.request("algo/orders-history", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetAlgoOrdersAlgoId(params = {}) {
        return this.request("algo/orders/{algo_id}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetBlockTrades(params = {}) {
        return this.request("block-trades", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetBlockTradesBlockTradeId(params = {}) {
        return this.request("block-trades/{block_trade_id}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetBlockTradesBlockTradeIdOffers(params = {}) {
        return this.request("block-trades/{block_trade_id}/offers", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetBlockTradesBlockTradeIdOffersOfferId(params = {}) {
        return this.request("block-trades/{block_trade_id}/offers/{offer_id}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetLiquidations(params = {}) {
        return this.request("liquidations", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetOrders(params = {}) {
        return this.request("orders", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetOrdersHistory(params = {}) {
        return this.request("orders-history", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetOrdersByClientIdClientId(params = {}) {
        return this.request("orders/by_client_id/{client_id}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetOrdersOrderId(params = {}) {
        return this.request("orders/{order_id}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetReferralsQrCode(params = {}) {
        return this.request("referrals/qr-code", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetReferralsSummary(params = {}) {
        return this.request("referrals/summary", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetRfqs(params = {}) {
        return this.request("rfqs", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetRfqsDrafts(params = {}) {
        return this.request("rfqs/drafts", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetRfqsMarkets(params = {}) {
        return this.request("rfqs/markets", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetRfqsRfqIdBbo(params = {}) {
        return this.request("rfqs/{rfq_id}/bbo", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetStakingBalanceHistory(params = {}) {
        return this.request("staking/balance/history", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetStakingHistory(params = {}) {
        return this.request("staking/history", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetStakingSummary(params = {}) {
        return this.request("staking/summary", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetTransfers(params = {}) {
        return this.request("transfers", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetVaultsAccountSummary(params = {}) {
        return this.request("vaults/account-summary", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetVaultsMine(params = {}) {
        return this.request("vaults/mine", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetXpAccountBalance(params = {}) {
        return this.request("xp/account-balance", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetXpTransfers(params = {}) {
        return this.request("xp/transfers", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privatePostAccountCompliance(params = {}) {
        return this.request("account/compliance", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostAccountMarginMarket(params = {}) {
        return this.request("account/margin/{market}", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostAccountProfileMarketMaxSlippageMarket(params = {}) {
        return this.request("account/profile/market_max_slippage/{market}", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostAccountProfileNotifications(params = {}) {
        return this.request("account/profile/notifications", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostAccountProfileNotificationsLastSeen(params = {}) {
        return this.request("account/profile/notifications/last_seen", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostAccountProfileReferralCode(params = {}) {
        return this.request("account/profile/referral_code", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostAccountProfileRefreshInventory(params = {}) {
        return this.request("account/profile/refresh_inventory", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostAccountProfileSizeCurrencyDisplay(params = {}) {
        return this.request("account/profile/size_currency_display", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostAccountProfileUsername(params = {}) {
        return this.request("account/profile/username", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostAccountReferrer(params = {}) {
        return this.request("account/referrer", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostAccountSettingsTradingValueDisplay(params = {}) {
        return this.request("account/settings/trading_value_display", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostAccountParadigmEnable(params = {}) {
        return this.request("account/paradigm/enable", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostAccountTerminalToken(params = {}) {
        return this.request("account/terminal-token", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostAccountKeysSubkeysActivate(params = {}) {
        return this.request("account/keys/subkeys/activate", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostAccountKeysSubkeys(params = {}) {
        return this.request("account/keys/subkeys", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostAccountTokens(params = {}) {
        return this.request("account/tokens", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostAlgoOrders(params = {}) {
        return this.request("algo/orders", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostAuth(params = {}) {
        return this.request("auth", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostBlockTrades(params = {}) {
        return this.request("block-trades", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostBlockTradesBlockTradeIdExecute(params = {}) {
        return this.request("block-trades/{block_trade_id}/execute", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostBlockTradesBlockTradeIdOffers(params = {}) {
        return this.request("block-trades/{block_trade_id}/offers", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostBlockTradesBlockTradeIdOffersOfferIdExecute(params = {}) {
        return this.request("block-trades/{block_trade_id}/offers/{offer_id}/execute", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostOnboarding(params = {}) {
        return this.request("onboarding", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostOrders(params = {}) {
        return this.request("orders", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostOrdersBatch(params = {}) {
        return this.request("orders/batch", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostRfqs(params = {}) {
        return this.request("rfqs", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostRfqsDrafts(params = {}) {
        return this.request("rfqs/drafts", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostRfqsRfqIdExecute(params = {}) {
        return this.request("rfqs/{rfq_id}/execute", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostV2Auth(params = {}) {
        return this.request("v2/auth", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostV2Onboarding(params = {}) {
        return this.request("v2/onboarding", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostVaults(params = {}) {
        return this.request("vaults", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostXpTransfer(params = {}) {
        return this.request("xp/transfer", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePutAccountProfile(params = {}) {
        return this.request("account/profile", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privatePutAccountKeysSubkeysPublicKey(params = {}) {
        return this.request("account/keys/subkeys/{public_key}", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privatePutAccountKeysSubkeysPublicKeyAllowedCidrs(params = {}) {
        return this.request("account/keys/subkeys/{public_key}/allowed-cidrs", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privatePutAccountTokensLookupIdAllowedCidrs(params = {}) {
        return this.request("account/tokens/{lookup_id}/allowed-cidrs", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privatePutOrdersOrderId(params = {}) {
        return this.request("orders/{order_id}", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteAccountKeysSubkeysPublicKey(params = {}) {
        return this.request("account/keys/subkeys/{public_key}", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteAccountTokensLookupId(params = {}) {
        return this.request("account/tokens/{lookup_id}", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteAlgoOrdersAlgoId(params = {}) {
        return this.request("algo/orders/{algo_id}", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteBlockTradesBlockTradeId(params = {}) {
        return this.request("block-trades/{block_trade_id}", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteBlockTradesBlockTradeIdOffersOfferId(params = {}) {
        return this.request("block-trades/{block_trade_id}/offers/{offer_id}", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteOrders(params = {}) {
        return this.request("orders", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteOrdersBatch(params = {}) {
        return this.request("orders/batch", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteOrdersByClientIdClientId(params = {}) {
        return this.request("orders/by_client_id/{client_id}", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteOrdersOrderId(params = {}) {
        return this.request("orders/{order_id}", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteRfqsDraftsDraftId(params = {}) {
        return this.request("rfqs/drafts/{draft_id}", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteRfqsRfqId(params = {}) {
        return this.request("rfqs/{rfq_id}", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
}

exports["default"] = Exchange;
