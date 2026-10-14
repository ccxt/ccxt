'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var hitbtc$1 = require('../hitbtc.js');

// ----------------------------------------------------------------------------
class hitbtc extends hitbtc$1["default"] {
    publicGetPublicCurrency(params = {}) {
        return this.request('public/currency', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicCurrencyCurrency(params = {}) {
        return this.request('public/currency/{currency}', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicSymbol(params = {}) {
        return this.request('public/symbol', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicSymbolSymbol(params = {}) {
        return this.request('public/symbol/{symbol}', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicTicker(params = {}) {
        return this.request('public/ticker', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicTickerSymbol(params = {}) {
        return this.request('public/ticker/{symbol}', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicPriceRate(params = {}) {
        return this.request('public/price/rate', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicPriceHistory(params = {}) {
        return this.request('public/price/history', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicPriceTicker(params = {}) {
        return this.request('public/price/ticker', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicPriceTickerSymbol(params = {}) {
        return this.request('public/price/ticker/{symbol}', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicTrades(params = {}) {
        return this.request('public/trades', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicTradesSymbol(params = {}) {
        return this.request('public/trades/{symbol}', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicOrderbook(params = {}) {
        return this.request('public/orderbook', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicOrderbookSymbol(params = {}) {
        return this.request('public/orderbook/{symbol}', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicCandles(params = {}) {
        return this.request('public/candles', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicCandlesSymbol(params = {}) {
        return this.request('public/candles/{symbol}', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicConvertedCandles(params = {}) {
        return this.request('public/converted/candles', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicConvertedCandlesSymbol(params = {}) {
        return this.request('public/converted/candles/{symbol}', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicFuturesInfo(params = {}) {
        return this.request('public/futures/info', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicFuturesInfoSymbol(params = {}) {
        return this.request('public/futures/info/{symbol}', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicFuturesHistoryFunding(params = {}) {
        return this.request('public/futures/history/funding', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicFuturesHistoryFundingSymbol(params = {}) {
        return this.request('public/futures/history/funding/{symbol}', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicFuturesCandlesIndexPrice(params = {}) {
        return this.request('public/futures/candles/index_price', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicFuturesCandlesIndexPriceSymbol(params = {}) {
        return this.request('public/futures/candles/index_price/{symbol}', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicFuturesCandlesMarkPrice(params = {}) {
        return this.request('public/futures/candles/mark_price', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicFuturesCandlesMarkPriceSymbol(params = {}) {
        return this.request('public/futures/candles/mark_price/{symbol}', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicFuturesCandlesPremiumIndex(params = {}) {
        return this.request('public/futures/candles/premium_index', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicFuturesCandlesPremiumIndexSymbol(params = {}) {
        return this.request('public/futures/candles/premium_index/{symbol}', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicFuturesCandlesOpenInterest(params = {}) {
        return this.request('public/futures/candles/open_interest', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetPublicFuturesCandlesOpenInterestSymbol(params = {}) {
        return this.request('public/futures/candles/open_interest/{symbol}', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetSpotBalance(params = {}) {
        return this.request('spot/balance', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetSpotBalanceCurrency(params = {}) {
        return this.request('spot/balance/{currency}', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetSpotOrder(params = {}) {
        return this.request('spot/order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetSpotOrderClientOrderId(params = {}) {
        return this.request('spot/order/{client_order_id}', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetSpotFee(params = {}) {
        return this.request('spot/fee', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetSpotFeeSymbol(params = {}) {
        return this.request('spot/fee/{symbol}', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetSpotHistoryOrder(params = {}) {
        return this.request('spot/history/order', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetSpotHistoryTrade(params = {}) {
        return this.request('spot/history/trade', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetMarginAccount(params = {}) {
        return this.request('margin/account', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetMarginAccountIsolatedSymbol(params = {}) {
        return this.request('margin/account/isolated/{symbol}', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetMarginAccountCrossCurrency(params = {}) {
        return this.request('margin/account/cross/{currency}', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetMarginOrder(params = {}) {
        return this.request('margin/order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetMarginOrderClientOrderId(params = {}) {
        return this.request('margin/order/{client_order_id}', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetMarginConfig(params = {}) {
        return this.request('margin/config', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetMarginHistoryOrder(params = {}) {
        return this.request('margin/history/order', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetMarginHistoryTrade(params = {}) {
        return this.request('margin/history/trade', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetMarginHistoryPositions(params = {}) {
        return this.request('margin/history/positions', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetMarginHistoryClearing(params = {}) {
        return this.request('margin/history/clearing', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetMarginSettings(params = {}) {
        return this.request('margin-settings', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetFuturesBalance(params = {}) {
        return this.request('futures/balance', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetFuturesBalanceCurrency(params = {}) {
        return this.request('futures/balance/{currency}', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetFuturesAccount(params = {}) {
        return this.request('futures/account', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetFuturesAccountIsolatedSymbol(params = {}) {
        return this.request('futures/account/isolated/{symbol}', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetFuturesOrder(params = {}) {
        return this.request('futures/order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetFuturesOrderClientOrderId(params = {}) {
        return this.request('futures/order/{client_order_id}', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetFuturesConfig(params = {}) {
        return this.request('futures/config', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetFuturesFee(params = {}) {
        return this.request('futures/fee', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetFuturesFeeSymbol(params = {}) {
        return this.request('futures/fee/{symbol}', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetFuturesHistoryOrder(params = {}) {
        return this.request('futures/history/order', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetFuturesHistoryTrade(params = {}) {
        return this.request('futures/history/trade', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetFuturesHistoryPositions(params = {}) {
        return this.request('futures/history/positions', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetFuturesHistoryClearing(params = {}) {
        return this.request('futures/history/clearing', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetUserApiKeys(params = {}) {
        return this.request('user/api-keys', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetWalletBalance(params = {}) {
        return this.request('wallet/balance', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetWalletBalanceCurrency(params = {}) {
        return this.request('wallet/balance/{currency}', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetWalletCryptoAddressWhiteList(params = {}) {
        return this.request('wallet/crypto/address/white-list', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetWalletCryptoAddress(params = {}) {
        return this.request('wallet/crypto/address', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetWalletCryptoAddressRecentDeposit(params = {}) {
        return this.request('wallet/crypto/address/recent-deposit', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetWalletCryptoAddressRecentWithdraw(params = {}) {
        return this.request('wallet/crypto/address/recent-withdraw', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetWalletCryptoAddressCheckMine(params = {}) {
        return this.request('wallet/crypto/address/check-mine', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetWalletTransactions(params = {}) {
        return this.request('wallet/transactions', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetWalletTransactionsTxId(params = {}) {
        return this.request('wallet/transactions/{tx_id}', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetWalletCryptoFeeEstimate(params = {}) {
        return this.request('wallet/crypto/fee/estimate', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetWalletCryptoFeeWithdrawHash(params = {}) {
        return this.request('wallet/crypto/fee/withdraw/hash', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetWalletAirdrops(params = {}) {
        return this.request('wallet/airdrops', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetWalletAmountLocks(params = {}) {
        return this.request('wallet/amount-locks', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetSubAccount(params = {}) {
        return this.request('sub-account', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetSubAccountAcl(params = {}) {
        return this.request('sub-account/acl', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetSubAccountBalanceSubAccID(params = {}) {
        return this.request('sub-account/balance/{subAccID}', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privateGetSubAccountCryptoAddressSubAccIDCurrency(params = {}) {
        return this.request('sub-account/crypto/address/{subAccID}/{currency}', ['private'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    privatePostSpotOrder(params = {}) {
        return this.request('spot/order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSpotOrderList(params = {}) {
        return this.request('spot/order/list', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostMarginOrder(params = {}) {
        return this.request('margin/order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostMarginOrderList(params = {}) {
        return this.request('margin/order/list', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostFuturesOrder(params = {}) {
        return this.request('futures/order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostFuturesOrderList(params = {}) {
        return this.request('futures/order/list', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostWalletCryptoAddress(params = {}) {
        return this.request('wallet/crypto/address', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostWalletCryptoWithdraw(params = {}) {
        return this.request('wallet/crypto/withdraw', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostWalletConvert(params = {}) {
        return this.request('wallet/convert', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostWalletTransfer(params = {}) {
        return this.request('wallet/transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostWalletInternalWithdraw(params = {}) {
        return this.request('wallet/internal/withdraw', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostWalletCryptoCheckOffchainAvailable(params = {}) {
        return this.request('wallet/crypto/check-offchain-available', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostWalletCryptoFeesEstimate(params = {}) {
        return this.request('wallet/crypto/fees/estimate', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostWalletCryptoFeeEstimateBulk(params = {}) {
        return this.request('wallet/crypto/fee/estimate/bulk', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostWalletAirdropsIdClaim(params = {}) {
        return this.request('wallet/airdrops/{id}/claim', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostSubAccountFreeze(params = {}) {
        return this.request('sub-account/freeze', ['private'], 'POST', params, undefined, undefined, { 'cost': 15 });
    }
    privatePostSubAccountActivate(params = {}) {
        return this.request('sub-account/activate', ['private'], 'POST', params, undefined, undefined, { 'cost': 15 });
    }
    privatePostSubAccountTransfer(params = {}) {
        return this.request('sub-account/transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 15 });
    }
    privatePostSubAccountTransferSubToSuper(params = {}) {
        return this.request('sub-account/transfer/sub-to-super', ['private'], 'POST', params, undefined, undefined, { 'cost': 15 });
    }
    privatePostSubAccountTransferSubToSub(params = {}) {
        return this.request('sub-account/transfer/sub-to-sub', ['private'], 'POST', params, undefined, undefined, { 'cost': 15 });
    }
    privatePostSubAccountAcl(params = {}) {
        return this.request('sub-account/acl', ['private'], 'POST', params, undefined, undefined, { 'cost': 15 });
    }
    privatePatchSpotOrderClientOrderId(params = {}) {
        return this.request('spot/order/{client_order_id}', ['private'], 'PATCH', params, undefined, undefined, { 'cost': 1 });
    }
    privatePatchMarginOrderClientOrderId(params = {}) {
        return this.request('margin/order/{client_order_id}', ['private'], 'PATCH', params, undefined, undefined, { 'cost': 1 });
    }
    privatePatchFuturesOrderClientOrderId(params = {}) {
        return this.request('futures/order/{client_order_id}', ['private'], 'PATCH', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteSpotOrder(params = {}) {
        return this.request('spot/order', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteSpotOrderClientOrderId(params = {}) {
        return this.request('spot/order/{client_order_id}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteMarginPosition(params = {}) {
        return this.request('margin/position', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteMarginPositionIsolatedSymbol(params = {}) {
        return this.request('margin/position/isolated/{symbol}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteMarginOrder(params = {}) {
        return this.request('margin/order', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteMarginOrderClientOrderId(params = {}) {
        return this.request('margin/order/{client_order_id}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteFuturesPosition(params = {}) {
        return this.request('futures/position', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteFuturesPositionMarginModeSymbol(params = {}) {
        return this.request('futures/position/{margin_mode}/{symbol}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteFuturesOrder(params = {}) {
        return this.request('futures/order', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteFuturesOrderClientOrderId(params = {}) {
        return this.request('futures/order/{client_order_id}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteWalletCryptoWithdrawId(params = {}) {
        return this.request('wallet/crypto/withdraw/{id}', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 30 });
    }
    privatePutMarginAccountIsolatedSymbol(params = {}) {
        return this.request('margin/account/isolated/{symbol}', ['private'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    privatePutMarginSettingsAmm(params = {}) {
        return this.request('margin-settings/amm', ['private'], 'PUT', params, undefined, undefined, { 'cost': 15 });
    }
    privatePutMarginMarginSettingsAmr(params = {}) {
        return this.request('margin/margin-settings/amr', ['private'], 'PUT', params, undefined, undefined, { 'cost': 15 });
    }
    privatePutFuturesAccountIsolatedSymbol(params = {}) {
        return this.request('futures/account/isolated/{symbol}', ['private'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    privatePutFuturesMarginSettingsAmr(params = {}) {
        return this.request('futures/margin-settings/amr', ['private'], 'PUT', params, undefined, undefined, { 'cost': 15 });
    }
    privatePutWalletCryptoWithdrawId(params = {}) {
        return this.request('wallet/crypto/withdraw/{id}', ['private'], 'PUT', params, undefined, undefined, { 'cost': 30 });
    }
}

exports["default"] = hitbtc;
