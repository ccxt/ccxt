'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetV1Nonce(params = {}) {
        return this.request("v1/nonce", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1Time(params = {}) {
        return this.request("v1/time", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1Assets(params = {}) {
        return this.request("v1/assets", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1AssetsSymbol(params = {}) {
        return this.request("v1/assets/{symbol}", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1VolGrids(params = {}) {
        return this.request("v1/vol-grids", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1AssetsSymbolVolGrid(params = {}) {
        return this.request("v1/assets/{symbol}/vol-grid", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1Markets(params = {}) {
        return this.request("v1/markets", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1MarketsSymbol(params = {}) {
        return this.request("v1/markets/{symbol}", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1HistoryMarkets(params = {}) {
        return this.request("v1/history/markets", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1HistoryMarketsSymbol(params = {}) {
        return this.request("v1/history/markets/{symbol}", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1MarketsSymbolOrderbookHybrid(params = {}) {
        return this.request("v1/markets/{symbol}/orderbook/hybrid", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1MarketsSymbolTrades(params = {}) {
        return this.request("v1/markets/{symbol}/trades", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1MarketsSymbolTick(params = {}) {
        return this.request("v1/markets/{symbol}/tick", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1MarketsSymbolCandle(params = {}) {
        return this.request("v1/markets/{symbol}/candle", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1MarketsSymbolAuctions(params = {}) {
        return this.request("v1/markets/{symbol}/auctions", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1MarketsSymbolAuctionsNoii(params = {}) {
        return this.request("v1/markets/{symbol}/auctions/noii", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1HistoryMarketsSymbolTrades(params = {}) {
        return this.request("v1/history/markets/{symbol}/trades", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1HistoryMarketsSymbolFundingRate(params = {}) {
        return this.request("v1/history/markets/{symbol}/funding-rate", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1HistoryMarketsSymbolAuctions(params = {}) {
        return this.request("v1/history/markets/{symbol}/auctions", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1HistoryOptionTrades(params = {}) {
        return this.request("v1/history/option-trades", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1IndexPrices(params = {}) {
        return this.request("v1/index-prices", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1IndexPricesAssetSymbol(params = {}) {
        return this.request("v1/index-prices/{assetSymbol}", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1ExpiryPricesSymbol(params = {}) {
        return this.request("v1/expiry-prices/{symbol}", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1OptionLadder(params = {}) {
        return this.request("v1/option-ladder", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetV1OptionLadderSymbol(params = {}) {
        return this.request("v1/option-ladder/{symbol}", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV2Orders(params = {}) {
        return this.request("v2/orders", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV2HistoryOrders(params = {}) {
        return this.request("v2/history/orders", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV2OrdersOrderId(params = {}) {
        return this.request("v2/orders/{orderId}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV2OrdersClientOrderIdClientOrderId(params = {}) {
        return this.request("v2/orders/client-order-id/{clientOrderId}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV2AmmInstructions(params = {}) {
        return this.request("v2/amm-instructions", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV2AmmInstructionsInstructionId(params = {}) {
        return this.request("v2/amm-instructions/{instructionId}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV1WalletsTransactions(params = {}) {
        return this.request("v1/wallets/transactions", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV1WalletsLimitsSymbol(params = {}) {
        return this.request("v1/wallets/limits/{symbol}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV1WalletsDepositInstructionsCryptoSymbol(params = {}) {
        return this.request("v1/wallets/deposit-instructions/crypto/{symbol}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV1WalletsWithdrawalInstructionsCryptoSymbol(params = {}) {
        return this.request("v1/wallets/withdrawal-instructions/crypto/{symbol}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV1WalletsDepositInstructionsFiatSymbol(params = {}) {
        return this.request("v1/wallets/deposit-instructions/fiat/{symbol}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV1WalletsWithdrawalInstructionsFiatSymbol(params = {}) {
        return this.request("v1/wallets/withdrawal-instructions/fiat/{symbol}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV1WalletsSelfHostedVerificationAttempts(params = {}) {
        return this.request("v1/wallets/self-hosted/verification-attempts", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV1Trades(params = {}) {
        return this.request("v1/trades", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetV1HistoryTrades(params = {}) {
        return this.request("v1/history/trades", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetV1TradesTradeId(params = {}) {
        return this.request("v1/trades/{tradeId}", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetV1TradesClientOrderIdClientOrderId(params = {}) {
        return this.request("v1/trades/client-order-id/{clientOrderId}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV1AccountsAsset(params = {}) {
        return this.request("v1/accounts/asset", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV1AccountsAssetSymbol(params = {}) {
        return this.request("v1/accounts/asset/{symbol}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV1UsersLogout(params = {}) {
        return this.request("v1/users/logout", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV1UsersHmacLogin(params = {}) {
        return this.request("v1/users/hmac/login", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV1AccountsTradingAccounts(params = {}) {
        return this.request("v1/accounts/trading-accounts", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV1AccountsTradingAccountsTradingAccountId(params = {}) {
        return this.request("v1/accounts/trading-accounts/{tradingAccountId}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV1DerivativesPositions(params = {}) {
        return this.request("v1/derivatives-positions", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV1HistoryDerivativesSettlement(params = {}) {
        return this.request("v1/history/derivatives-settlement", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV1HistoryTransfer(params = {}) {
        return this.request("v1/history/transfer", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV1HistoryBorrowInterest(params = {}) {
        return this.request("v1/history/borrow-interest", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV2MmpConfiguration(params = {}) {
        return this.request("v2/mmp-configuration", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV2OtcTrades(params = {}) {
        return this.request("v2/otc-trades", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV2OtcTradesOtcTradeId(params = {}) {
        return this.request("v2/otc-trades/{otcTradeId}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV2OtcTradesUnconfirmedTrade(params = {}) {
        return this.request("v2/otc-trades/unconfirmed-trade", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV2OtcTradesDelegatedAccounts(params = {}) {
        return this.request("v2/otc-trades/delegated-accounts", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV2IdbDelegatedAccounts(params = {}) {
        return this.request("v2/idb/delegated-accounts", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetV2IdbOtcTrades(params = {}) {
        return this.request("v2/idb/otc-trades", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privatePostV2Orders(params = {}) {
        return this.request("v2/orders", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostV2Command(params = {}) {
        return this.request("v2/command", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostV2AmmInstructions(params = {}) {
        return this.request("v2/amm-instructions", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostV1WalletsWithdrawal(params = {}) {
        return this.request("v1/wallets/withdrawal", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostV2UsersLogin(params = {}) {
        return this.request("v2/users/login", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostV1SimulatePortfolioMargin(params = {}) {
        return this.request("v1/simulate-portfolio-margin", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostV1BulkSimulatePortfolioMargin(params = {}) {
        return this.request("v1/bulk-simulate-portfolio-margin", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostV1WalletsSelfHostedInitiate(params = {}) {
        return this.request("v1/wallets/self-hosted/initiate", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostV2MmpConfiguration(params = {}) {
        return this.request("v2/mmp-configuration", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostV2OtcTrades(params = {}) {
        return this.request("v2/otc-trades", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostV2OtcCommand(params = {}) {
        return this.request("v2/otc-command", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostV2IdbOtcTrades(params = {}) {
        return this.request("v2/idb/otc-trades", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostV2IdbOtcCommand(params = {}) {
        return this.request("v2/idb/otc-command", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
}

exports["default"] = Exchange;
