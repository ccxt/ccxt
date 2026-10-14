'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetOhlcPair(params = {}) {
        return this.request('ohlc/{pair}/', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetOrderBookPair(params = {}) {
        return this.request('order_book/{pair}/', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetTicker(params = {}) {
        return this.request('ticker/', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetTickerHourPair(params = {}) {
        return this.request('ticker_hour/{pair}/', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetTickerPair(params = {}) {
        return this.request('ticker/{pair}/', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetTransactionsPair(params = {}) {
        return this.request('transactions/{pair}/', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetTradingPairsInfo(params = {}) {
        return this.request('trading-pairs-info/', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarkets(params = {}) {
        return this.request('markets/', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetCurrencies(params = {}) {
        return this.request('currencies/', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetEurUsd(params = {}) {
        return this.request('eur_usd/', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetTravelRuleVasps(params = {}) {
        return this.request('travel_rule/vasps/', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetFundingRateMarketSymbol(params = {}) {
        return this.request('funding_rate/{market_symbol}/', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetFundingRateHistoryPair(params = {}) {
        return this.request('funding_rate_history/{pair}/', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetDerivativesMarketHours(params = {}) {
        return this.request('derivatives/market_hours/', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetDerivativesMarketHoursMarketSymbol(params = {}) {
        return this.request('derivatives/market_hours/{market_symbol}/', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetTravelRuleContacts(params = {}) {
        return this.request('travel_rule/contacts/', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetContactsContactUuid(params = {}) {
        return this.request('contacts/{contact_uuid}/', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetTravelRuleUtxoXpubRegistrations(params = {}) {
        return this.request('travel_rule/utxo/xpub_registrations/', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetTravelRuleUtxoXpubRegistrationsRegistrationId(params = {}) {
        return this.request('travel_rule/utxo/xpub_registrations/{registration_id}/', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetTravelRuleAddressVerification(params = {}) {
        return this.request('travel_rule/address_verification/', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetCryptoTransactionsDeposits(params = {}) {
        return this.request('crypto-transactions/deposits/', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetEarnSubscriptions(params = {}) {
        return this.request('earn/subscriptions/', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetEarnTransactions(params = {}) {
        return this.request('earn/transactions/', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetTradeHistory(params = {}) {
        return this.request('trade_history/', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetTradeHistoryPair(params = {}) {
        return this.request('trade_history/{pair}', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAccountBalances(params = {}) {
        return this.request('account_balances/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAccountBalancesCurrency(params = {}) {
        return this.request('account_balances/{currency}/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBalance(params = {}) {
        return this.request('balance/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBalancePair(params = {}) {
        return this.request('balance/{pair}/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBchWithdrawal(params = {}) {
        return this.request('bch_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBchAddress(params = {}) {
        return this.request('bch_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostUserTransactions(params = {}) {
        return this.request('user_transactions/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostUserTransactionsPair(params = {}) {
        return this.request('user_transactions/{pair}/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCryptoTransactions(params = {}) {
        return this.request('crypto-transactions/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCryptoTransactionsDepositsDepositIdReject(params = {}) {
        return this.request('crypto-transactions/deposits/{deposit_id}/reject/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOpenOrder(params = {}) {
        return this.request('open_order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOpenOrdersAll(params = {}) {
        return this.request('open_orders/all/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOpenOrdersPair(params = {}) {
        return this.request('open_orders/{pair}/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostReplaceOrder(params = {}) {
        return this.request('replace_order/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOrderStatus(params = {}) {
        return this.request('order_status/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelOrder(params = {}) {
        return this.request('cancel_order/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelAllOrders(params = {}) {
        return this.request('cancel_all_orders/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelAllOrdersPair(params = {}) {
        return this.request('cancel_all_orders/{pair}/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBuyPair(params = {}) {
        return this.request('buy/{pair}/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBuyMarketPair(params = {}) {
        return this.request('buy/market/{pair}/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBuyInstantPair(params = {}) {
        return this.request('buy/instant/{pair}/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSellPair(params = {}) {
        return this.request('sell/{pair}/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSellMarketPair(params = {}) {
        return this.request('sell/market/{pair}/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSellInstantPair(params = {}) {
        return this.request('sell/instant/{pair}/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTransferToMain(params = {}) {
        return this.request('transfer-to-main/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTransferFromMain(params = {}) {
        return this.request('transfer-from-main/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostMyTradingPairs(params = {}) {
        return this.request('my_trading_pairs/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostFeesTrading(params = {}) {
        return this.request('fees/trading/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostFeesTradingMarketSymbol(params = {}) {
        return this.request('fees/trading/{market_symbol}', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostFeesWithdrawal(params = {}) {
        return this.request('fees/withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostFeesWithdrawalCurrency(params = {}) {
        return this.request('fees/withdrawal/{currency}/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostWithdrawalRequests(params = {}) {
        return this.request('withdrawal-requests/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostWithdrawalOpen(params = {}) {
        return this.request('withdrawal/open/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostWithdrawalStatus(params = {}) {
        return this.request('withdrawal/status/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostWithdrawalCancel(params = {}) {
        return this.request('withdrawal/cancel/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostLiquidationAddressNew(params = {}) {
        return this.request('liquidation_address/new/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostLiquidationAddressInfo(params = {}) {
        return this.request('liquidation_address/info/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBtcUnconfirmed(params = {}) {
        return this.request('btc_unconfirmed/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostWebsocketsToken(params = {}) {
        return this.request('websockets_token/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostRevokeAllApiKeys(params = {}) {
        return this.request('revoke_all_api_keys/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetMaxOrderAmount(params = {}) {
        return this.request('get_max_order_amount/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOrderData(params = {}) {
        return this.request('order_data/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAccountOrderData(params = {}) {
        return this.request('account_order_data/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBtcWithdrawal(params = {}) {
        return this.request('btc_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBtcAddress(params = {}) {
        return this.request('btc_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostRippleWithdrawal(params = {}) {
        return this.request('ripple_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostRippleAddress(params = {}) {
        return this.request('ripple_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostLtcWithdrawal(params = {}) {
        return this.request('ltc_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostLtcAddress(params = {}) {
        return this.request('ltc_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostEthWithdrawal(params = {}) {
        return this.request('eth_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostEthAddress(params = {}) {
        return this.request('eth_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostXrpWithdrawal(params = {}) {
        return this.request('xrp_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostXrpAddress(params = {}) {
        return this.request('xrp_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostXlmWithdrawal(params = {}) {
        return this.request('xlm_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostXlmAddress(params = {}) {
        return this.request('xlm_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostPaxWithdrawal(params = {}) {
        return this.request('pax_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostPaxAddress(params = {}) {
        return this.request('pax_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostLinkWithdrawal(params = {}) {
        return this.request('link_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostLinkAddress(params = {}) {
        return this.request('link_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostUsdcWithdrawal(params = {}) {
        return this.request('usdc_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostUsdcAddress(params = {}) {
        return this.request('usdc_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOmgWithdrawal(params = {}) {
        return this.request('omg_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOmgAddress(params = {}) {
        return this.request('omg_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostDaiWithdrawal(params = {}) {
        return this.request('dai_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostDaiAddress(params = {}) {
        return this.request('dai_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostKncWithdrawal(params = {}) {
        return this.request('knc_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostKncAddress(params = {}) {
        return this.request('knc_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostMkrWithdrawal(params = {}) {
        return this.request('mkr_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostMkrAddress(params = {}) {
        return this.request('mkr_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostZrxWithdrawal(params = {}) {
        return this.request('zrx_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostZrxAddress(params = {}) {
        return this.request('zrx_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGusdWithdrawal(params = {}) {
        return this.request('gusd_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGusdAddress(params = {}) {
        return this.request('gusd_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAaveWithdrawal(params = {}) {
        return this.request('aave_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAaveAddress(params = {}) {
        return this.request('aave_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBatWithdrawal(params = {}) {
        return this.request('bat_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBatAddress(params = {}) {
        return this.request('bat_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostUmaWithdrawal(params = {}) {
        return this.request('uma_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostUmaAddress(params = {}) {
        return this.request('uma_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSnxWithdrawal(params = {}) {
        return this.request('snx_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSnxAddress(params = {}) {
        return this.request('snx_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostUniWithdrawal(params = {}) {
        return this.request('uni_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostUniAddress(params = {}) {
        return this.request('uni_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostYfiWithdrawal(params = {}) {
        return this.request('yfi_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostYfiAddress(params = {}) {
        return this.request('yfi_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAudioWithdrawal(params = {}) {
        return this.request('audio_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAudioAddress(params = {}) {
        return this.request('audio_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCrvWithdrawal(params = {}) {
        return this.request('crv_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCrvAddress(params = {}) {
        return this.request('crv_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAlgoWithdrawal(params = {}) {
        return this.request('algo_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAlgoAddress(params = {}) {
        return this.request('algo_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCompWithdrawal(params = {}) {
        return this.request('comp_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCompAddress(params = {}) {
        return this.request('comp_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGrtWithdrawal(params = {}) {
        return this.request('grt_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGrtAddress(params = {}) {
        return this.request('grt_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostUsdtWithdrawal(params = {}) {
        return this.request('usdt_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostUsdtAddress(params = {}) {
        return this.request('usdt_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostEurtWithdrawal(params = {}) {
        return this.request('eurt_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostEurtAddress(params = {}) {
        return this.request('eurt_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostMaticWithdrawal(params = {}) {
        return this.request('matic_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostMaticAddress(params = {}) {
        return this.request('matic_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSushiWithdrawal(params = {}) {
        return this.request('sushi_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSushiAddress(params = {}) {
        return this.request('sushi_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostChzWithdrawal(params = {}) {
        return this.request('chz_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostChzAddress(params = {}) {
        return this.request('chz_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostEnjWithdrawal(params = {}) {
        return this.request('enj_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostEnjAddress(params = {}) {
        return this.request('enj_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAlphaWithdrawal(params = {}) {
        return this.request('alpha_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAlphaAddress(params = {}) {
        return this.request('alpha_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostFttWithdrawal(params = {}) {
        return this.request('ftt_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostFttAddress(params = {}) {
        return this.request('ftt_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostStorjWithdrawal(params = {}) {
        return this.request('storj_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostStorjAddress(params = {}) {
        return this.request('storj_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAxsWithdrawal(params = {}) {
        return this.request('axs_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAxsAddress(params = {}) {
        return this.request('axs_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSandWithdrawal(params = {}) {
        return this.request('sand_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSandAddress(params = {}) {
        return this.request('sand_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostHbarWithdrawal(params = {}) {
        return this.request('hbar_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostHbarAddress(params = {}) {
        return this.request('hbar_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostRgtWithdrawal(params = {}) {
        return this.request('rgt_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostRgtAddress(params = {}) {
        return this.request('rgt_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostFetWithdrawal(params = {}) {
        return this.request('fet_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostFetAddress(params = {}) {
        return this.request('fet_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSklWithdrawal(params = {}) {
        return this.request('skl_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSklAddress(params = {}) {
        return this.request('skl_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCelWithdrawal(params = {}) {
        return this.request('cel_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCelAddress(params = {}) {
        return this.request('cel_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSxpWithdrawal(params = {}) {
        return this.request('sxp_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSxpAddress(params = {}) {
        return this.request('sxp_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAdaWithdrawal(params = {}) {
        return this.request('ada_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAdaAddress(params = {}) {
        return this.request('ada_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSlpWithdrawal(params = {}) {
        return this.request('slp_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSlpAddress(params = {}) {
        return this.request('slp_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostFtmWithdrawal(params = {}) {
        return this.request('ftm_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostFtmAddress(params = {}) {
        return this.request('ftm_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostPerpWithdrawal(params = {}) {
        return this.request('perp_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostPerpAddress(params = {}) {
        return this.request('perp_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostDydxWithdrawal(params = {}) {
        return this.request('dydx_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostDydxAddress(params = {}) {
        return this.request('dydx_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGalaWithdrawal(params = {}) {
        return this.request('gala_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGalaAddress(params = {}) {
        return this.request('gala_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostShibWithdrawal(params = {}) {
        return this.request('shib_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostShibAddress(params = {}) {
        return this.request('shib_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAmpWithdrawal(params = {}) {
        return this.request('amp_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAmpAddress(params = {}) {
        return this.request('amp_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSgbWithdrawal(params = {}) {
        return this.request('sgb_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSgbAddress(params = {}) {
        return this.request('sgb_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAvaxWithdrawal(params = {}) {
        return this.request('avax_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAvaxAddress(params = {}) {
        return this.request('avax_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostWbtcWithdrawal(params = {}) {
        return this.request('wbtc_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostWbtcAddress(params = {}) {
        return this.request('wbtc_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCtsiWithdrawal(params = {}) {
        return this.request('ctsi_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCtsiAddress(params = {}) {
        return this.request('ctsi_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCvxWithdrawal(params = {}) {
        return this.request('cvx_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCvxAddress(params = {}) {
        return this.request('cvx_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostImxWithdrawal(params = {}) {
        return this.request('imx_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostImxAddress(params = {}) {
        return this.request('imx_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostNexoWithdrawal(params = {}) {
        return this.request('nexo_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostNexoAddress(params = {}) {
        return this.request('nexo_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostUstWithdrawal(params = {}) {
        return this.request('ust_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostUstAddress(params = {}) {
        return this.request('ust_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAntWithdrawal(params = {}) {
        return this.request('ant_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAntAddress(params = {}) {
        return this.request('ant_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGodsWithdrawal(params = {}) {
        return this.request('gods_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGodsAddress(params = {}) {
        return this.request('gods_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostRadWithdrawal(params = {}) {
        return this.request('rad_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostRadAddress(params = {}) {
        return this.request('rad_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBandWithdrawal(params = {}) {
        return this.request('band_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBandAddress(params = {}) {
        return this.request('band_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostInjWithdrawal(params = {}) {
        return this.request('inj_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostInjAddress(params = {}) {
        return this.request('inj_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostRlyWithdrawal(params = {}) {
        return this.request('rly_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostRlyAddress(params = {}) {
        return this.request('rly_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostRndrWithdrawal(params = {}) {
        return this.request('rndr_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostRndrAddress(params = {}) {
        return this.request('rndr_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostVegaWithdrawal(params = {}) {
        return this.request('vega_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostVegaAddress(params = {}) {
        return this.request('vega_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePost1inchWithdrawal(params = {}) {
        return this.request('1inch_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePost1inchAddress(params = {}) {
        return this.request('1inch_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostEnsWithdrawal(params = {}) {
        return this.request('ens_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostEnsAddress(params = {}) {
        return this.request('ens_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostManaWithdrawal(params = {}) {
        return this.request('mana_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostManaAddress(params = {}) {
        return this.request('mana_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostLrcWithdrawal(params = {}) {
        return this.request('lrc_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostLrcAddress(params = {}) {
        return this.request('lrc_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostApeWithdrawal(params = {}) {
        return this.request('ape_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostApeAddress(params = {}) {
        return this.request('ape_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostMplWithdrawal(params = {}) {
        return this.request('mpl_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostMplAddress(params = {}) {
        return this.request('mpl_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostEurocWithdrawal(params = {}) {
        return this.request('euroc_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostEurocAddress(params = {}) {
        return this.request('euroc_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSolWithdrawal(params = {}) {
        return this.request('sol_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSolAddress(params = {}) {
        return this.request('sol_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostDotWithdrawal(params = {}) {
        return this.request('dot_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostDotAddress(params = {}) {
        return this.request('dot_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostNearWithdrawal(params = {}) {
        return this.request('near_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostNearAddress(params = {}) {
        return this.request('near_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostDogeWithdrawal(params = {}) {
        return this.request('doge_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostDogeAddress(params = {}) {
        return this.request('doge_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostFlrWithdrawal(params = {}) {
        return this.request('flr_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostFlrAddress(params = {}) {
        return this.request('flr_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostDgldWithdrawal(params = {}) {
        return this.request('dgld_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostDgldAddress(params = {}) {
        return this.request('dgld_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostLdoWithdrawal(params = {}) {
        return this.request('ldo_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostLdoAddress(params = {}) {
        return this.request('ldo_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTravelRuleContacts(params = {}) {
        return this.request('travel_rule/contacts/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTravelRuleUtxoXpubRegistrations(params = {}) {
        return this.request('travel_rule/utxo/xpub_registrations/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTravelRuleUtxoXpubRegistrationsRegistrationIdRevoke(params = {}) {
        return this.request('travel_rule/utxo/xpub_registrations/{registration_id}/revoke/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostEarnSubscribe(params = {}) {
        return this.request('earn/subscribe/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostEarnSubscriptionsSetting(params = {}) {
        return this.request('earn/subscriptions/setting/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostEarnUnsubscribe(params = {}) {
        return this.request('earn/unsubscribe', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostWecanWithdrawal(params = {}) {
        return this.request('wecan_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostWecanAddress(params = {}) {
        return this.request('wecan_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTracWithdrawal(params = {}) {
        return this.request('trac_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTracAddress(params = {}) {
        return this.request('trac_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostEurcvWithdrawal(params = {}) {
        return this.request('eurcv_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostEurcvAddress(params = {}) {
        return this.request('eurcv_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostPyusdWithdrawal(params = {}) {
        return this.request('pyusd_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostPyusdAddress(params = {}) {
        return this.request('pyusd_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostLmwrWithdrawal(params = {}) {
        return this.request('lmwr_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostLmwrAddress(params = {}) {
        return this.request('lmwr_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostPepeWithdrawal(params = {}) {
        return this.request('pepe_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostPepeAddress(params = {}) {
        return this.request('pepe_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBlurWithdrawal(params = {}) {
        return this.request('blur_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBlurAddress(params = {}) {
        return this.request('blur_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostVextWithdrawal(params = {}) {
        return this.request('vext_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostVextAddress(params = {}) {
        return this.request('vext_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCsprWithdrawal(params = {}) {
        return this.request('cspr_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCsprAddress(params = {}) {
        return this.request('cspr_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostVchfWithdrawal(params = {}) {
        return this.request('vchf_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostVchfAddress(params = {}) {
        return this.request('vchf_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostVeurWithdrawal(params = {}) {
        return this.request('veur_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostVeurAddress(params = {}) {
        return this.request('veur_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTrufWithdrawal(params = {}) {
        return this.request('truf_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTrufAddress(params = {}) {
        return this.request('truf_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostWifWithdrawal(params = {}) {
        return this.request('wif_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostWifAddress(params = {}) {
        return this.request('wif_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSmtWithdrawal(params = {}) {
        return this.request('smt_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSmtAddress(params = {}) {
        return this.request('smt_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSuiWithdrawal(params = {}) {
        return this.request('sui_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSuiAddress(params = {}) {
        return this.request('sui_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostJupWithdrawal(params = {}) {
        return this.request('jup_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostJupAddress(params = {}) {
        return this.request('jup_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOndoWithdrawal(params = {}) {
        return this.request('ondo_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOndoAddress(params = {}) {
        return this.request('ondo_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBobaWithdrawal(params = {}) {
        return this.request('boba_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBobaAddress(params = {}) {
        return this.request('boba_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostPythWithdrawal(params = {}) {
        return this.request('pyth_withdrawal/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostPythAddress(params = {}) {
        return this.request('pyth_address/', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
