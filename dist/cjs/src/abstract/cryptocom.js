'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    basePublicGetV1PublicGetAnnouncements(params = {}) {
        return this.request("v1/public/get-announcements", ["base", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    v1PublicGetPublicAuth(params = {}) {
        return this.request("public/auth", ["v1", "public"], 'GET', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PublicGetPublicGetInstruments(params = {}) {
        return this.request("public/get-instruments", ["v1", "public"], 'GET', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PublicGetPublicGetBook(params = {}) {
        return this.request("public/get-book", ["v1", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    v1PublicGetPublicGetCandlestick(params = {}) {
        return this.request("public/get-candlestick", ["v1", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    v1PublicGetPublicGetTrades(params = {}) {
        return this.request("public/get-trades", ["v1", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    v1PublicGetPublicGetTickers(params = {}) {
        return this.request("public/get-tickers", ["v1", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    v1PublicGetPublicGetValuations(params = {}) {
        return this.request("public/get-valuations", ["v1", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    v1PublicGetPublicGetExpiredSettlementPrice(params = {}) {
        return this.request("public/get-expired-settlement-price", ["v1", "public"], 'GET', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PublicGetPublicGetInsurance(params = {}) {
        return this.request("public/get-insurance", ["v1", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    v1PublicGetPublicGetAnnouncements(params = {}) {
        return this.request("public/get-announcements", ["v1", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    v1PublicGetPublicGetRiskParameters(params = {}) {
        return this.request("public/get-risk-parameters", ["v1", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    v1PublicPostPublicStakingGetConversionRate(params = {}) {
        return this.request("public/staking/get-conversion-rate", ["v1", "public"], 'POST', params, undefined, undefined, { "cost": 2 });
    }
    v1PrivatePostPrivateSetCancelOnDisconnect(params = {}) {
        return this.request("private/set-cancel-on-disconnect", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateGetCancelOnDisconnect(params = {}) {
        return this.request("private/get-cancel-on-disconnect", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateUserBalance(params = {}) {
        return this.request("private/user-balance", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateUserBalanceHistory(params = {}) {
        return this.request("private/user-balance-history", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateGetPositions(params = {}) {
        return this.request("private/get-positions", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateCreateOrder(params = {}) {
        return this.request("private/create-order", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 0.6666666666666666 });
    }
    v1PrivatePostPrivateAmendOrder(params = {}) {
        return this.request("private/amend-order", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 1.3333333333333333 });
    }
    v1PrivatePostPrivateCreateOrderList(params = {}) {
        return this.request("private/create-order-list", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateCancelOrder(params = {}) {
        return this.request("private/cancel-order", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 0.6666666666666666 });
    }
    v1PrivatePostPrivateCancelOrderList(params = {}) {
        return this.request("private/cancel-order-list", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateCancelAllOrders(params = {}) {
        return this.request("private/cancel-all-orders", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 0.6666666666666666 });
    }
    v1PrivatePostPrivateClosePosition(params = {}) {
        return this.request("private/close-position", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateGetOrderHistory(params = {}) {
        return this.request("private/get-order-history", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 100 });
    }
    v1PrivatePostPrivateGetOpenOrders(params = {}) {
        return this.request("private/get-open-orders", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateGetOrderDetail(params = {}) {
        return this.request("private/get-order-detail", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 0.3333333333333333 });
    }
    v1PrivatePostPrivateGetTrades(params = {}) {
        return this.request("private/get-trades", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 100 });
    }
    v1PrivatePostPrivateChangeAccountLeverage(params = {}) {
        return this.request("private/change-account-leverage", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateGetTransactions(params = {}) {
        return this.request("private/get-transactions", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateCreateSubaccountTransfer(params = {}) {
        return this.request("private/create-subaccount-transfer", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateGetSubaccountBalances(params = {}) {
        return this.request("private/get-subaccount-balances", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateGetOrderList(params = {}) {
        return this.request("private/get-order-list", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateCreateWithdrawal(params = {}) {
        return this.request("private/create-withdrawal", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateGetCurrencyNetworks(params = {}) {
        return this.request("private/get-currency-networks", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateGetDepositAddress(params = {}) {
        return this.request("private/get-deposit-address", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateGetAccounts(params = {}) {
        return this.request("private/get-accounts", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateGetWithdrawalHistory(params = {}) {
        return this.request("private/get-withdrawal-history", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateGetDepositHistory(params = {}) {
        return this.request("private/get-deposit-history", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateGetFeeRate(params = {}) {
        return this.request("private/get-fee-rate", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 2 });
    }
    v1PrivatePostPrivateGetInstrumentFeeRate(params = {}) {
        return this.request("private/get-instrument-fee-rate", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 2 });
    }
    v1PrivatePostPrivateGetFeeCreditBalances(params = {}) {
        return this.request("private/get-fee-credit-balances", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateFiatFiatDepositInfo(params = {}) {
        return this.request("private/fiat/fiat-deposit-info", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateFiatFiatDepositHistory(params = {}) {
        return this.request("private/fiat/fiat-deposit-history", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateFiatFiatWithdrawHistory(params = {}) {
        return this.request("private/fiat/fiat-withdraw-history", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateFiatFiatCreateWithdraw(params = {}) {
        return this.request("private/fiat/fiat-create-withdraw", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateFiatFiatTransactionQuota(params = {}) {
        return this.request("private/fiat/fiat-transaction-quota", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateFiatFiatTransactionLimit(params = {}) {
        return this.request("private/fiat/fiat-transaction-limit", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateFiatFiatGetBankAccounts(params = {}) {
        return this.request("private/fiat/fiat-get-bank-accounts", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateStakingStake(params = {}) {
        return this.request("private/staking/stake", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 2 });
    }
    v1PrivatePostPrivateStakingUnstake(params = {}) {
        return this.request("private/staking/unstake", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 2 });
    }
    v1PrivatePostPrivateStakingGetStakingPosition(params = {}) {
        return this.request("private/staking/get-staking-position", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 2 });
    }
    v1PrivatePostPrivateStakingGetStakingInstruments(params = {}) {
        return this.request("private/staking/get-staking-instruments", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 2 });
    }
    v1PrivatePostPrivateStakingGetOpenStake(params = {}) {
        return this.request("private/staking/get-open-stake", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 2 });
    }
    v1PrivatePostPrivateStakingGetStakeHistory(params = {}) {
        return this.request("private/staking/get-stake-history", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 2 });
    }
    v1PrivatePostPrivateStakingGetRewardHistory(params = {}) {
        return this.request("private/staking/get-reward-history", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 2 });
    }
    v1PrivatePostPrivateStakingConvert(params = {}) {
        return this.request("private/staking/convert", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 2 });
    }
    v1PrivatePostPrivateStakingGetOpenConvert(params = {}) {
        return this.request("private/staking/get-open-convert", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 2 });
    }
    v1PrivatePostPrivateStakingGetConvertHistory(params = {}) {
        return this.request("private/staking/get-convert-history", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 2 });
    }
    v1PrivatePostPrivateCreateIsolatedMarginTransfer(params = {}) {
        return this.request("private/create-isolated-margin-transfer", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateChangeIsolatedMarginLeverage(params = {}) {
        return this.request("private/change-isolated-margin-leverage", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateBotCreateTradingBot(params = {}) {
        return this.request("private/bot/create-trading-bot", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateBotUpdateTradingBot(params = {}) {
        return this.request("private/bot/update-trading-bot", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateBotTerminateTradingBot(params = {}) {
        return this.request("private/bot/terminate-trading-bot", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateBotPauseTradingBot(params = {}) {
        return this.request("private/bot/pause-trading-bot", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateBotResumeTradingBot(params = {}) {
        return this.request("private/bot/resume-trading-bot", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateBotGetTradingBots(params = {}) {
        return this.request("private/bot/get-trading-bots", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v1PrivatePostPrivateBotGetTradingBotExecutions(params = {}) {
        return this.request("private/bot/get-trading-bot-executions", ["v1", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PublicGetPublicAuth(params = {}) {
        return this.request("public/auth", ["v2", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    v2PublicGetPublicGetInstruments(params = {}) {
        return this.request("public/get-instruments", ["v2", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    v2PublicGetPublicGetBook(params = {}) {
        return this.request("public/get-book", ["v2", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    v2PublicGetPublicGetCandlestick(params = {}) {
        return this.request("public/get-candlestick", ["v2", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    v2PublicGetPublicGetTicker(params = {}) {
        return this.request("public/get-ticker", ["v2", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    v2PublicGetPublicGetTrades(params = {}) {
        return this.request("public/get-trades", ["v2", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    v2PublicGetPublicMarginGetTransferCurrencies(params = {}) {
        return this.request("public/margin/get-transfer-currencies", ["v2", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    v2PublicGetPublicMarginGetLoadCurrenices(params = {}) {
        return this.request("public/margin/get-load-currenices", ["v2", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    v2PublicGetPublicRespondHeartbeat(params = {}) {
        return this.request("public/respond-heartbeat", ["v2", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    v2PrivatePostPrivateSetCancelOnDisconnect(params = {}) {
        return this.request("private/set-cancel-on-disconnect", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateGetCancelOnDisconnect(params = {}) {
        return this.request("private/get-cancel-on-disconnect", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateCreateWithdrawal(params = {}) {
        return this.request("private/create-withdrawal", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateGetWithdrawalHistory(params = {}) {
        return this.request("private/get-withdrawal-history", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateGetCurrencyNetworks(params = {}) {
        return this.request("private/get-currency-networks", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateGetDepositHistory(params = {}) {
        return this.request("private/get-deposit-history", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateGetDepositAddress(params = {}) {
        return this.request("private/get-deposit-address", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateExportCreateExportRequest(params = {}) {
        return this.request("private/export/create-export-request", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateExportGetExportRequests(params = {}) {
        return this.request("private/export/get-export-requests", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateExportDownloadExportOutput(params = {}) {
        return this.request("private/export/download-export-output", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateGetAccountSummary(params = {}) {
        return this.request("private/get-account-summary", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateCreateOrder(params = {}) {
        return this.request("private/create-order", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 0.6666666666666666 });
    }
    v2PrivatePostPrivateCancelOrder(params = {}) {
        return this.request("private/cancel-order", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 0.6666666666666666 });
    }
    v2PrivatePostPrivateCancelAllOrders(params = {}) {
        return this.request("private/cancel-all-orders", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 0.6666666666666666 });
    }
    v2PrivatePostPrivateCreateOrderList(params = {}) {
        return this.request("private/create-order-list", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateGetOrderHistory(params = {}) {
        return this.request("private/get-order-history", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateGetOpenOrders(params = {}) {
        return this.request("private/get-open-orders", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateGetOrderDetail(params = {}) {
        return this.request("private/get-order-detail", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 0.3333333333333333 });
    }
    v2PrivatePostPrivateGetTrades(params = {}) {
        return this.request("private/get-trades", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 100 });
    }
    v2PrivatePostPrivateGetAccounts(params = {}) {
        return this.request("private/get-accounts", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateGetSubaccountBalances(params = {}) {
        return this.request("private/get-subaccount-balances", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateCreateSubaccountTransfer(params = {}) {
        return this.request("private/create-subaccount-transfer", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateOtcGetOtcUser(params = {}) {
        return this.request("private/otc/get-otc-user", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateOtcGetInstruments(params = {}) {
        return this.request("private/otc/get-instruments", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateOtcRequestQuote(params = {}) {
        return this.request("private/otc/request-quote", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 100 });
    }
    v2PrivatePostPrivateOtcAcceptQuote(params = {}) {
        return this.request("private/otc/accept-quote", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 100 });
    }
    v2PrivatePostPrivateOtcGetQuoteHistory(params = {}) {
        return this.request("private/otc/get-quote-history", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateOtcGetTradeHistory(params = {}) {
        return this.request("private/otc/get-trade-history", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    v2PrivatePostPrivateOtcCreateOrder(params = {}) {
        return this.request("private/otc/create-order", ["v2", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    derivativesPublicGetPublicAuth(params = {}) {
        return this.request("public/auth", ["derivatives", "public"], 'GET', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    derivativesPublicGetPublicGetInstruments(params = {}) {
        return this.request("public/get-instruments", ["derivatives", "public"], 'GET', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    derivativesPublicGetPublicGetBook(params = {}) {
        return this.request("public/get-book", ["derivatives", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    derivativesPublicGetPublicGetCandlestick(params = {}) {
        return this.request("public/get-candlestick", ["derivatives", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    derivativesPublicGetPublicGetTrades(params = {}) {
        return this.request("public/get-trades", ["derivatives", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    derivativesPublicGetPublicGetTickers(params = {}) {
        return this.request("public/get-tickers", ["derivatives", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    derivativesPublicGetPublicGetValuations(params = {}) {
        return this.request("public/get-valuations", ["derivatives", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    derivativesPublicGetPublicGetExpiredSettlementPrice(params = {}) {
        return this.request("public/get-expired-settlement-price", ["derivatives", "public"], 'GET', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    derivativesPublicGetPublicGetInsurance(params = {}) {
        return this.request("public/get-insurance", ["derivatives", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    derivativesPrivatePostPrivateSetCancelOnDisconnect(params = {}) {
        return this.request("private/set-cancel-on-disconnect", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    derivativesPrivatePostPrivateGetCancelOnDisconnect(params = {}) {
        return this.request("private/get-cancel-on-disconnect", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    derivativesPrivatePostPrivateUserBalance(params = {}) {
        return this.request("private/user-balance", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    derivativesPrivatePostPrivateUserBalanceHistory(params = {}) {
        return this.request("private/user-balance-history", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    derivativesPrivatePostPrivateGetPositions(params = {}) {
        return this.request("private/get-positions", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    derivativesPrivatePostPrivateCreateOrder(params = {}) {
        return this.request("private/create-order", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 0.6666666666666666 });
    }
    derivativesPrivatePostPrivateCreateOrderList(params = {}) {
        return this.request("private/create-order-list", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    derivativesPrivatePostPrivateCancelOrder(params = {}) {
        return this.request("private/cancel-order", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 0.6666666666666666 });
    }
    derivativesPrivatePostPrivateCancelOrderList(params = {}) {
        return this.request("private/cancel-order-list", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    derivativesPrivatePostPrivateCancelAllOrders(params = {}) {
        return this.request("private/cancel-all-orders", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 0.6666666666666666 });
    }
    derivativesPrivatePostPrivateClosePosition(params = {}) {
        return this.request("private/close-position", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    derivativesPrivatePostPrivateConvertCollateral(params = {}) {
        return this.request("private/convert-collateral", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    derivativesPrivatePostPrivateGetOrderHistory(params = {}) {
        return this.request("private/get-order-history", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 100 });
    }
    derivativesPrivatePostPrivateGetOpenOrders(params = {}) {
        return this.request("private/get-open-orders", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    derivativesPrivatePostPrivateGetOrderDetail(params = {}) {
        return this.request("private/get-order-detail", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 0.3333333333333333 });
    }
    derivativesPrivatePostPrivateGetTrades(params = {}) {
        return this.request("private/get-trades", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 100 });
    }
    derivativesPrivatePostPrivateChangeAccountLeverage(params = {}) {
        return this.request("private/change-account-leverage", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    derivativesPrivatePostPrivateGetTransactions(params = {}) {
        return this.request("private/get-transactions", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    derivativesPrivatePostPrivateCreateSubaccountTransfer(params = {}) {
        return this.request("private/create-subaccount-transfer", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    derivativesPrivatePostPrivateGetSubaccountBalances(params = {}) {
        return this.request("private/get-subaccount-balances", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
    derivativesPrivatePostPrivateGetOrderList(params = {}) {
        return this.request("private/get-order-list", ["derivatives", "private"], 'POST', params, undefined, undefined, { "cost": 3.3333333333333335 });
    }
}

exports["default"] = Exchange;
