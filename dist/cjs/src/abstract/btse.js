'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetSpotApiV33MarketSummary(params = {}) {
        return this.request("spot/api/v3.3/market_summary", "public", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    publicGetSpotApiV33Ohlcv(params = {}) {
        return this.request("spot/api/v3.3/ohlcv", "public", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    publicGetSpotApiV33Price(params = {}) {
        return this.request("spot/api/v3.3/price", "public", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    publicGetSpotApiV33Orderbook(params = {}) {
        return this.request("spot/api/v3.3/orderbook", "public", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    publicGetSpotApiV33OrderbookL2(params = {}) {
        return this.request("spot/api/v3.3/orderbook/L2", "public", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    publicGetSpotApiV33Trades(params = {}) {
        return this.request("spot/api/v3.3/trades", "public", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    publicGetSpotApiV33Time(params = {}) {
        return this.request("spot/api/v3.3/time", "public", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    publicGetFuturesApiV23MarketSummary(params = {}) {
        return this.request("futures/api/v2.3/market_summary", "public", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    publicGetFuturesApiV23Ohlcv(params = {}) {
        return this.request("futures/api/v2.3/ohlcv", "public", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    publicGetFuturesApiV23Price(params = {}) {
        return this.request("futures/api/v2.3/price", "public", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    publicGetFuturesApiV23Orderbook(params = {}) {
        return this.request("futures/api/v2.3/orderbook", "public", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    publicGetFuturesApiV23OrderbookL2(params = {}) {
        return this.request("futures/api/v2.3/orderbook/L2", "public", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    publicGetFuturesApiV23Trades(params = {}) {
        return this.request("futures/api/v2.3/trades", "public", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    publicGetFuturesApiV23FundingHistory(params = {}) {
        return this.request("futures/api/v2.3/funding_history", "public", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    publicGetFuturesApiV23MarketRiskLimit(params = {}) {
        return this.request("futures/api/v2.3/market/risk_limit", "public", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    publicGetSpotApiV32AvailableCurrencyNetworks(params = {}) {
        return this.request("spot/api/v3.2/availableCurrencyNetworks", "public", 'GET', params, undefined, undefined, { "cost": 15 });
    }
    publicGetSpotApiV32ExchangeRate(params = {}) {
        return this.request("spot/api/v3.2/exchangeRate", "public", 'GET', params, undefined, undefined, { "cost": 15 });
    }
    publicGetPublicApiWalletV1CryptoNetworks(params = {}) {
        return this.request("public-api/wallet/v1/crypto/networks", "public", 'GET', params, undefined, undefined, { "cost": 15 });
    }
    publicGetPublicApiWalletV1AssetsExchangeRate(params = {}) {
        return this.request("public-api/wallet/v1/assets/exchangeRate", "public", 'GET', params, undefined, undefined, { "cost": 15 });
    }
    publicGetPublicApiMarketV1Markets(params = {}) {
        return this.request("public-api/market/v1/markets", "public", 'GET', params, undefined, undefined, { "cost": 3 });
    }
    publicGetPublicApiMarketV1ExchangeInfo(params = {}) {
        return this.request("public-api/market/v1/exchangeInfo", "public", 'GET', params, undefined, undefined, { "cost": 3 });
    }
    publicGetPublicApiMarketV1Orderbook(params = {}) {
        return this.request("public-api/market/v1/orderbook", "public", 'GET', params, undefined, undefined, { "cost": 3 });
    }
    publicGetPublicApiMarketV1Trades(params = {}) {
        return this.request("public-api/market/v1/trades", "public", 'GET', params, undefined, undefined, { "cost": 3 });
    }
    publicGetPublicApiMarketV1Klines(params = {}) {
        return this.request("public-api/market/v1/klines", "public", 'GET', params, undefined, undefined, { "cost": 3 });
    }
    publicGetPublicApiMarketV1Ticker24hr(params = {}) {
        return this.request("public-api/market/v1/ticker/24hr", "public", 'GET', params, undefined, undefined, { "cost": 3 });
    }
    publicGetPublicApiMarketV1TickerPrice(params = {}) {
        return this.request("public-api/market/v1/ticker/price", "public", 'GET', params, undefined, undefined, { "cost": 3 });
    }
    publicGetPublicApiMarketV1TickerIndices(params = {}) {
        return this.request("public-api/market/v1/ticker/indices", "public", 'GET', params, undefined, undefined, { "cost": 3 });
    }
    publicGetPublicApiMarketV1TickerL1(params = {}) {
        return this.request("public-api/market/v1/ticker/l1", "public", 'GET', params, undefined, undefined, { "cost": 3 });
    }
    publicGetPublicApiMarketV1RecentFundingHistory(params = {}) {
        return this.request("public-api/market/v1/recentFundingHistory", "public", 'GET', params, undefined, undefined, { "cost": 3 });
    }
    publicGetPublicApiMarketV1RiskLimits(params = {}) {
        return this.request("public-api/market/v1/riskLimits", "public", 'GET', params, undefined, undefined, { "cost": 3 });
    }
    publicGetPublicApiWalletV1CryptoList(params = {}) {
        return this.request("public-api/wallet/v1/crypto/list", "public", 'GET', params, undefined, undefined, { "cost": 15 });
    }
    publicGetPublicApiOtcV1Markets(params = {}) {
        return this.request("public-api/otc/v1/markets", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetSpotApiV33Order(params = {}) {
        return this.request("spot/api/v3.3/order", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetSpotApiV33UserOpenOrders(params = {}) {
        return this.request("spot/api/v3.3/user/open_orders", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetSpotApiV33UserTradeHistory(params = {}) {
        return this.request("spot/api/v3.3/user/trade_history", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetSpotApiV33UserFees(params = {}) {
        return this.request("spot/api/v3.3/user/fees", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetSpotApiV33InvestProducts(params = {}) {
        return this.request("spot/api/v3.3/invest/products", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetSpotApiV33InvestOrders(params = {}) {
        return this.request("spot/api/v3.3/invest/orders", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetSpotApiV33InvestHistory(params = {}) {
        return this.request("spot/api/v3.3/invest/history", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesApiV23Order(params = {}) {
        return this.request("futures/api/v2.3/order", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetFuturesApiV23UserOpenOrders(params = {}) {
        return this.request("futures/api/v2.3/user/open_orders", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetFuturesApiV23UserTradeHistory(params = {}) {
        return this.request("futures/api/v2.3/user/trade_history", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesApiV23UserPositions(params = {}) {
        return this.request("futures/api/v2.3/user/positions", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesApiV23RiskLimit(params = {}) {
        return this.request("futures/api/v2.3/risk_limit", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesApiV23Leverage(params = {}) {
        return this.request("futures/api/v2.3/leverage", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesApiV23UserFees(params = {}) {
        return this.request("futures/api/v2.3/user/fees", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesApiV23PositionMode(params = {}) {
        return this.request("futures/api/v2.3/position_mode", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesApiV23UserMarginSetting(params = {}) {
        return this.request("futures/api/v2.3/user/margin_setting", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesApiV23UserWallet(params = {}) {
        return this.request("futures/api/v2.3/user/wallet", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesApiV23UserWalletHistory(params = {}) {
        return this.request("futures/api/v2.3/user/wallet_history", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesApiV23UserUnifiedWalletMargin(params = {}) {
        return this.request("futures/api/v2.3/user/unifiedWallet/margin", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesApiV23UserMargin(params = {}) {
        return this.request("futures/api/v2.3/user/margin", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetOtcApiV1GetMarket(params = {}) {
        return this.request("otc/api/v1/getMarket", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetSpotApiV32UserWallet(params = {}) {
        return this.request("spot/api/v3.2/user/wallet", "private", 'GET', params, undefined, undefined, { "cost": 15 });
    }
    privateGetSpotApiV32UserWalletHistory(params = {}) {
        return this.request("spot/api/v3.2/user/wallet_history", "private", 'GET', params, undefined, undefined, { "cost": 15 });
    }
    privateGetSpotApiV33UserWalletAddress(params = {}) {
        return this.request("spot/api/v3.3/user/wallet/address", "private", 'GET', params, undefined, undefined, { "cost": 15 });
    }
    privateGetSpotApiV32AvailableCurrencies(params = {}) {
        return this.request("spot/api/v3.2/availableCurrencies", "private", 'GET', params, undefined, undefined, { "cost": 15 });
    }
    privateGetSpotApiV32SubaccountWalletHistory(params = {}) {
        return this.request("spot/api/v3.2/subaccount/wallet/history", "private", 'GET', params, undefined, undefined, { "cost": 15 });
    }
    privateGetSpotApiV4TradeOrders(params = {}) {
        return this.request("spot/api/v4/trade/orders", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetSpotApiV4TradeOrder(params = {}) {
        return this.request("spot/api/v4/trade/order", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetSpotApiV4TradeTradeHistory(params = {}) {
        return this.request("spot/api/v4/trade/trade_history", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetSpotApiV4TradeFees(params = {}) {
        return this.request("spot/api/v4/trade/fees", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesApiV3TradeOrders(params = {}) {
        return this.request("futures/api/v3/trade/orders", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesApiV3TradeRiskLimit(params = {}) {
        return this.request("futures/api/v3/trade/risk_limit", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesApiV3TradePositionMode(params = {}) {
        return this.request("futures/api/v3/trade/position_mode", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesApiV3TradeLeverage(params = {}) {
        return this.request("futures/api/v3/trade/leverage", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesApiV3TradeTradeHistory(params = {}) {
        return this.request("futures/api/v3/trade/trade_history", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesApiV3TradePositions(params = {}) {
        return this.request("futures/api/v3/trade/positions", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesApiV3TradeMarginSetting(params = {}) {
        return this.request("futures/api/v3/trade/margin_setting", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetPublicApiWalletV1Assets(params = {}) {
        return this.request("public-api/wallet/v1/assets", "private", 'GET', params, undefined, undefined, { "cost": 15 });
    }
    privateGetPublicApiWalletV1UserAssets(params = {}) {
        return this.request("public-api/wallet/v1/user/assets", "private", 'GET', params, undefined, undefined, { "cost": 15 });
    }
    privateGetPublicApiWalletV1UserWalletHistory(params = {}) {
        return this.request("public-api/wallet/v1/user/walletHistory", "private", 'GET', params, undefined, undefined, { "cost": 15 });
    }
    privateGetPublicApiWalletV1UserCryptoAddress(params = {}) {
        return this.request("public-api/wallet/v1/user/crypto/address", "private", 'GET', params, undefined, undefined, { "cost": 15 });
    }
    privateGetPublicApiOtcV1Quotes(params = {}) {
        return this.request("public-api/otc/v1/quotes", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privatePostSpotApiV33Order(params = {}) {
        return this.request("spot/api/v3.3/order", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostSpotApiV33OrderPeg(params = {}) {
        return this.request("spot/api/v3.3/order/peg", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostSpotApiV33OrderCancelAllAfter(params = {}) {
        return this.request("spot/api/v3.3/order/cancelAllAfter", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostSpotApiV33InvestDeposit(params = {}) {
        return this.request("spot/api/v3.3/invest/deposit", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostSpotApiV33InvestRenew(params = {}) {
        return this.request("spot/api/v3.3/invest/renew", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostSpotApiV33InvestRedeem(params = {}) {
        return this.request("spot/api/v3.3/invest/redeem", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostFuturesApiV23Order(params = {}) {
        return this.request("futures/api/v2.3/order", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostFuturesApiV23OrderPeg(params = {}) {
        return this.request("futures/api/v2.3/order/peg", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostFuturesApiV23OrderCancelAllAfter(params = {}) {
        return this.request("futures/api/v2.3/order/cancelAllAfter", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostFuturesApiV23OrderClosePosition(params = {}) {
        return this.request("futures/api/v2.3/order/close_position", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostFuturesApiV23RiskLimit(params = {}) {
        return this.request("futures/api/v2.3/risk_limit", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostFuturesApiV23Leverage(params = {}) {
        return this.request("futures/api/v2.3/leverage", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostFuturesApiV23SettleIn(params = {}) {
        return this.request("futures/api/v2.3/settle_in", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostFuturesApiV23OrderBindTpsl(params = {}) {
        return this.request("futures/api/v2.3/order/bind/tpsl", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostFuturesApiV23PositionMode(params = {}) {
        return this.request("futures/api/v2.3/position_mode", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostFuturesApiV23UserWalletTransfer(params = {}) {
        return this.request("futures/api/v2.3/user/wallet/transfer", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostFuturesApiV23SubaccountWalletTransfer(params = {}) {
        return this.request("futures/api/v2.3/subaccount/wallet/transfer", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostOtcApiV1Quote(params = {}) {
        return this.request("otc/api/v1/quote", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostOtcApiV1AcceptQuoteId(params = {}) {
        return this.request("otc/api/v1/accept/{quoteId}", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostOtcApiV1RejectQuoteId(params = {}) {
        return this.request("otc/api/v1/reject/{quoteId}", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostOtcApiV1QueryOrderQuoteId(params = {}) {
        return this.request("otc/api/v1/queryOrder/{quoteId}", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostSpotApiV33UserWalletAddress(params = {}) {
        return this.request("spot/api/v3.3/user/wallet/address", "private", 'POST', params, undefined, undefined, { "cost": 15 });
    }
    privatePostSpotApiV33UserWalletWithdraw(params = {}) {
        return this.request("spot/api/v3.3/user/wallet/withdraw", "private", 'POST', params, undefined, undefined, { "cost": 15 });
    }
    privatePostSpotApiV32UserWalletConvert(params = {}) {
        return this.request("spot/api/v3.2/user/wallet/convert", "private", 'POST', params, undefined, undefined, { "cost": 15 });
    }
    privatePostSpotApiV33UserWalletTransfer(params = {}) {
        return this.request("spot/api/v3.3/user/wallet/transfer", "private", 'POST', params, undefined, undefined, { "cost": 15 });
    }
    privatePostSpotApiV4TradeOrders(params = {}) {
        return this.request("spot/api/v4/trade/orders", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostSpotApiV4TradeOrdersCancelAllAfter(params = {}) {
        return this.request("spot/api/v4/trade/orders/cancel_all_after", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostSpotApiV4TradeOrdersAlgo(params = {}) {
        return this.request("spot/api/v4/trade/orders/algo", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostFuturesApiV3TradeOrders(params = {}) {
        return this.request("futures/api/v3/trade/orders", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostFuturesApiV3TradeOrdersCancelAllAfter(params = {}) {
        return this.request("futures/api/v3/trade/orders/cancel_all_after", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostFuturesApiV3TradeOrdersAlgo(params = {}) {
        return this.request("futures/api/v3/trade/orders/algo", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostFuturesApiV3TradeSettleIn(params = {}) {
        return this.request("futures/api/v3/trade/settle_in", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostFuturesApiV3TradeRiskLimit(params = {}) {
        return this.request("futures/api/v3/trade/risk_limit", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostFuturesApiV3TradePositionsTpsl(params = {}) {
        return this.request("futures/api/v3/trade/positions/tpsl", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostFuturesApiV3TradePositionMode(params = {}) {
        return this.request("futures/api/v3/trade/position_mode", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostFuturesApiV3TradeLeverage(params = {}) {
        return this.request("futures/api/v3/trade/leverage", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostPublicApiWalletV1UserCryptoAddress(params = {}) {
        return this.request("public-api/wallet/v1/user/crypto/address", "private", 'POST', params, undefined, undefined, { "cost": 15 });
    }
    privatePostPublicApiWalletV1UserCryptoWithdraw(params = {}) {
        return this.request("public-api/wallet/v1/user/crypto/withdraw", "private", 'POST', params, undefined, undefined, { "cost": 15 });
    }
    privatePostPublicApiWalletV1UserAssetsSendTo(params = {}) {
        return this.request("public-api/wallet/v1/user/assets/sendTo", "private", 'POST', params, undefined, undefined, { "cost": 15 });
    }
    privatePostPublicApiWalletV1UserAssetsConvert(params = {}) {
        return this.request("public-api/wallet/v1/user/assets/convert", "private", 'POST', params, undefined, undefined, { "cost": 15 });
    }
    privatePostPublicApiOtcV1Quotes(params = {}) {
        return this.request("public-api/otc/v1/quotes", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostPublicApiOtcV1QuotesAccept(params = {}) {
        return this.request("public-api/otc/v1/quotes/accept", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePutSpotApiV33Order(params = {}) {
        return this.request("spot/api/v3.3/order", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privatePutFuturesApiV23Order(params = {}) {
        return this.request("futures/api/v2.3/order", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privatePutSpotApiV4TradeOrders(params = {}) {
        return this.request("spot/api/v4/trade/orders", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privatePutFuturesApiV3TradeOrders(params = {}) {
        return this.request("futures/api/v3/trade/orders", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteSpotApiV33Order(params = {}) {
        return this.request("spot/api/v3.3/order", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteFuturesApiV23Order(params = {}) {
        return this.request("futures/api/v2.3/order", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteSpotApiV33UserWalletAddress(params = {}) {
        return this.request("spot/api/v3.3/user/wallet/address", "private", 'DELETE', params, undefined, undefined, { "cost": 15 });
    }
    privateDeleteSpotApiV4TradeOrders(params = {}) {
        return this.request("spot/api/v4/trade/orders", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteSpotApiV4TradeOrdersAll(params = {}) {
        return this.request("spot/api/v4/trade/orders/all", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteFuturesApiV3TradeOrders(params = {}) {
        return this.request("futures/api/v3/trade/orders", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteFuturesApiV3TradePositions(params = {}) {
        return this.request("futures/api/v3/trade/positions", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeletePublicApiWalletV1UserCryptoAddress(params = {}) {
        return this.request("public-api/wallet/v1/user/crypto/address", "private", 'DELETE', params, undefined, undefined, { "cost": 15 });
    }
}

exports["default"] = Exchange;
