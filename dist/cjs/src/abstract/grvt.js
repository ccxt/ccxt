'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    privateEdgeGetApiV1DepositAddresses(params = {}) {
        return this.request('api/v1/deposit/addresses', ['privateEdge'], 'GET', params, undefined, undefined, { 'cost': 40 });
    }
    privateEdgeGetApiV1BridgeWithdrawalInfo(params = {}) {
        return this.request('api/v1/bridge/withdrawal-info', ['privateEdge'], 'GET', params, undefined, undefined, { 'cost': 40 });
    }
    privateEdgeGetApiV1BridgeWithdrawalStatus(params = {}) {
        return this.request('api/v1/bridge/withdrawal-status', ['privateEdge'], 'GET', params, undefined, undefined, { 'cost': 40 });
    }
    privateEdgeGetApiV1ReferralEpochs(params = {}) {
        return this.request('api/v1/referral/epochs', ['privateEdge'], 'GET', params, undefined, undefined, { 'cost': 40 });
    }
    privateEdgeGetApiV1ReferralPoints(params = {}) {
        return this.request('api/v1/referral/points', ['privateEdge'], 'GET', params, undefined, undefined, { 'cost': 40 });
    }
    privateEdgeGetApiV1ReferralData(params = {}) {
        return this.request('api/v1/referral/data', ['privateEdge'], 'GET', params, undefined, undefined, { 'cost': 40 });
    }
    privateEdgeGetApiV1ReferralIndirectData(params = {}) {
        return this.request('api/v1/referral/indirect_data', ['privateEdge'], 'GET', params, undefined, undefined, { 'cost': 40 });
    }
    privateEdgePostAuthApiKeyLogin(params = {}) {
        return this.request('auth/api_key/login', ['privateEdge'], 'POST', params, undefined, undefined, { 'cost': 100 });
    }
    privateEdgePostAuthWalletLogin(params = {}) {
        return this.request('auth/wallet/login', ['privateEdge'], 'POST', params, undefined, undefined, { 'cost': 100 });
    }
    privateEdgePostAuthBuilderAuthorize(params = {}) {
        return this.request('auth/builder/authorize', ['privateEdge'], 'POST', params, undefined, undefined, { 'cost': 100 });
    }
    privateEdgePostApiV1DepositGenerateAddress(params = {}) {
        return this.request('api/v1/deposit/generate-address', ['privateEdge'], 'POST', params, undefined, undefined, { 'cost': 100 });
    }
    privateEdgePostApiV1BridgeWithdrawalQuote(params = {}) {
        return this.request('api/v1/bridge/withdrawal-quote', ['privateEdge'], 'POST', params, undefined, undefined, { 'cost': 100 });
    }
    privateEdgePostApiV1BridgeWithdraw(params = {}) {
        return this.request('api/v1/bridge/withdraw', ['privateEdge'], 'POST', params, undefined, undefined, { 'cost': 100 });
    }
    publicMarketPostFullV1Instrument(params = {}) {
        return this.request('full/v1/instrument', ['publicMarket'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    publicMarketPostFullV1AllInstruments(params = {}) {
        return this.request('full/v1/all_instruments', ['publicMarket'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    publicMarketPostFullV1Instruments(params = {}) {
        return this.request('full/v1/instruments', ['publicMarket'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    publicMarketPostFullV1Currency(params = {}) {
        return this.request('full/v1/currency', ['publicMarket'], 'POST', params, undefined, undefined, { 'cost': 12 });
    }
    publicMarketPostFullV1MarginRules(params = {}) {
        return this.request('full/v1/margin_rules', ['publicMarket'], 'POST', params, undefined, undefined, { 'cost': 12 });
    }
    publicMarketPostFullV1Mini(params = {}) {
        return this.request('full/v1/mini', ['publicMarket'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    publicMarketPostFullV1Ticker(params = {}) {
        return this.request('full/v1/ticker', ['publicMarket'], 'POST', params, undefined, undefined, { 'cost': 4 });
    }
    publicMarketPostFullV1Book(params = {}) {
        return this.request('full/v1/book', ['publicMarket'], 'POST', params, undefined, undefined, { 'cost': 12 });
    }
    publicMarketPostFullV1Trade(params = {}) {
        return this.request('full/v1/trade', ['publicMarket'], 'POST', params, undefined, undefined, { 'cost': 12 });
    }
    publicMarketPostFullV1TradeHistory(params = {}) {
        return this.request('full/v1/trade_history', ['publicMarket'], 'POST', params, undefined, undefined, { 'cost': 12 });
    }
    publicMarketPostFullV1Kline(params = {}) {
        return this.request('full/v1/kline', ['publicMarket'], 'POST', params, undefined, undefined, { 'cost': 12 });
    }
    publicMarketPostFullV1Funding(params = {}) {
        return this.request('full/v1/funding', ['publicMarket'], 'POST', params, undefined, undefined, { 'cost': 12 });
    }
    publicMarketPostFullV1SupportedAssets(params = {}) {
        return this.request('full/v1/supported_assets', ['publicMarket'], 'POST', params, undefined, undefined, { 'cost': 12 });
    }
    publicMarketPostFullV1GetAllCollateralAssetInfo(params = {}) {
        return this.request('full/v1/get_all_collateral_asset_info', ['publicMarket'], 'POST', params, undefined, undefined, { 'cost': 12 });
    }
    privateTradingPostFullV1CreateOrder(params = {}) {
        return this.request('full/v1/create_order', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privateTradingPostFullV1CancelOrder(params = {}) {
        return this.request('full/v1/cancel_order', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privateTradingPostFullV1CancelOnDisconnect(params = {}) {
        return this.request('full/v1/cancel_on_disconnect', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 100 });
    }
    privateTradingPostFullV1CancelAllOrders(params = {}) {
        return this.request('full/v1/cancel_all_orders', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privateTradingPostFullV1Order(params = {}) {
        return this.request('full/v1/order', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    privateTradingPostFullV1OrderHistory(params = {}) {
        return this.request('full/v1/order_history', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    privateTradingPostFullV1OpenOrders(params = {}) {
        return this.request('full/v1/open_orders', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    privateTradingPostFullV1FillHistory(params = {}) {
        return this.request('full/v1/fill_history', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    privateTradingPostFullV1Positions(params = {}) {
        return this.request('full/v1/positions', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    privateTradingPostFullV1FundingPaymentHistory(params = {}) {
        return this.request('full/v1/funding_payment_history', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1GetSubAccounts(params = {}) {
        return this.request('full/v1/get_sub_accounts', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1AccountSummary(params = {}) {
        return this.request('full/v1/account_summary', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1AccountHistory(params = {}) {
        return this.request('full/v1/account_history', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1AggregatedAccountSummary(params = {}) {
        return this.request('full/v1/aggregated_account_summary', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1FundingAccountSummary(params = {}) {
        return this.request('full/v1/funding_account_summary', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1Transfer(params = {}) {
        return this.request('full/v1/transfer', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 100 });
    }
    privateTradingPostFullV1DepositHistory(params = {}) {
        return this.request('full/v1/deposit_history', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 100 });
    }
    privateTradingPostFullV1TransferHistory(params = {}) {
        return this.request('full/v1/transfer_history', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 100 });
    }
    privateTradingPostFullV1Withdrawal(params = {}) {
        return this.request('full/v1/withdrawal', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 100 });
    }
    privateTradingPostFullV1WithdrawalHistory(params = {}) {
        return this.request('full/v1/withdrawal_history', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 100 });
    }
    privateTradingPostFullV1AddPositionMargin(params = {}) {
        return this.request('full/v1/add_position_margin', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1GetPositionMarginLimits(params = {}) {
        return this.request('full/v1/get_position_margin_limits', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1SetPositionConfig(params = {}) {
        return this.request('full/v1/set_position_config', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1SetInitialLeverage(params = {}) {
        return this.request('full/v1/set_initial_leverage', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1GetAllInitialLeverage(params = {}) {
        return this.request('full/v1/get_all_initial_leverage', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1SetDeriskMmRatio(params = {}) {
        return this.request('full/v1/set_derisk_mm_ratio', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1VaultBurnTokens(params = {}) {
        return this.request('full/v1/vault_burn_tokens', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1VaultInvest(params = {}) {
        return this.request('full/v1/vault_invest', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1VaultInvestorSummary(params = {}) {
        return this.request('full/v1/vault_investor_summary', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1VaultRedeem(params = {}) {
        return this.request('full/v1/vault_redeem', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1VaultRedeemCancel(params = {}) {
        return this.request('full/v1/vault_redeem_cancel', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1VaultViewRedemptionQueue(params = {}) {
        return this.request('full/v1/vault_view_redemption_queue', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1VaultManagerInvestorHistory(params = {}) {
        return this.request('full/v1/vault_manager_investor_history', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1AuthorizeBuilder(params = {}) {
        return this.request('full/v1/authorize_builder', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1GetAuthorizedBuilders(params = {}) {
        return this.request('full/v1/get_authorized_builders', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1BuilderFillHistory(params = {}) {
        return this.request('full/v1/builder_fill_history', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1CreateRfq(params = {}) {
        return this.request('full/v1/create_rfq', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privateTradingPostFullV1CancelRfq(params = {}) {
        return this.request('full/v1/cancel_rfq', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privateTradingPostFullV1EcnFromBroker(params = {}) {
        return this.request('full/v1/ecn_from_broker', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV2BulkOrders(params = {}) {
        return this.request('full/v2/bulk_orders', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privateTradingPostFullV1PositionHistory(params = {}) {
        return this.request('full/v1/position_history', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    privateTradingPostFullV1InterestPaymentHistory(params = {}) {
        return this.request('full/v1/interest_payment_history', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1GetCollateralPreference(params = {}) {
        return this.request('full/v1/get_collateral_preference', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1SpotAccountSummary(params = {}) {
        return this.request('full/v1/spot_account_summary', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1SetIndicativePrices(params = {}) {
        return this.request('full/v1/set_indicative_prices', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privateTradingPostFullV1WithdrawalFee(params = {}) {
        return this.request('full/v1/withdrawal_fee', ['privateTrading'], 'POST', params, undefined, undefined, { 'cost': 100 });
    }
}

exports["default"] = Exchange;
