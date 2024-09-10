

// this is temporary file, before we merge the correct values, we should read this instaed of binance.ts.

const manualOverrides = {
    'public': {
        'get': {
            'depth': 5, // max 250 : https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#order-book
            'ticker':  4, // dynamic : https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#rolling-window-price-change-statistics
            'ticker/24hr': { 'cost': 2, 'noSymbol': 80 }, // https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#24hr-ticker-price-change-statistics
            'ticker/price': { 'cost': 2, 'noSymbol': 4 }, // https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#symbol-price-ticker
            'ticker/bookTicker': { 'cost': 2, 'noSymbol': 4 }, // https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#symbol-order-book-ticker
            'ticker/tradingDay':  4, // dynamic : https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#trading-day-ticker
        }
    },
    'private': {
        'get': {
            'myPreventedMatches': 2, // https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#query-prevented-matches-user_data
            'openOrders': { 'cost': 6, 'noSymbol': 80 }, // https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#current-open-orders-user_data
        },
        'post': {
            'order/test': 1, // https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#test-new-order-trade
            'sor/order/test': 1, // https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#test-new-order-using-sor-trade
            'orderList/oto': 1, // https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#new-order-list---oto-trade
            'orderList/otoco': 1, // https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#new-order-list---oto-trade
        }
    },
    "sapi": {
        "get": {
            "margin/isolatedMarginData":  { 'cost': 1, 'noSymbol': 10 }, // https://developers.binance.com/docs/margin_trading/account/Query-Isolated-Margin-Fee-Data#http-request
            "margin/crossMarginData": 1, // max 5 : https://developers.binance.com/docs/margin_trading/account/Query-Cross-Margin-Fee-Data#http-request
            "portfolio/asset-index-price": 1, // max 50 : https://developers.binance.com/docs/derivatives/portfolio-margin-pro/market-data/Query-Portfolio-Margin-Asset-Index-Price
            "localentity/withdraw/history": 4, // 10r/s: https://developers.binance.com/docs/wallet/travel-rule/
            "capital/withdraw/history": 4, // 10r/s: https://developers.binance.com/docs/wallet/capital/withdraw-history

        },
        "post": {
            "giftcard/buyCode": 1, // https://developers.binance.com/docs/gift_card/market-data/Create-a-dual-token-gift-card
            "giftcard/createCode": 1, // https://developers.binance.com/docs/gift_card/market-data/Create-a-single-token-gift-card
        }
    },
    "fapiPublic": {
        "get": {
            "klines": 1, // max 10 : https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Kline-Candlestick-Data
            "premiumIndexKlines": 1, // max 10 : https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Premium-Index-Kline-Data
            "depth": 2, // max 20 : https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Order-Book
            "fundingRate": 1, // 0 ? : https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Get-Funding-Rate-History
            "markPriceKlines": 1, // max 10 : https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price-Kline-Candlestick-Data
            "indexPriceKlines": 1, // max 10: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Index-Price-Kline-Candlestick-Data
            "continuousKlines": 1, // max 10 : https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Continuous-Contract-Kline-Candlestick-Data
            "fundingInfo": 1, // ? https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Get-Funding-Info
        },
    },
    "fapiPrivate": {
        "post": {
            "order": 1, // dynamic: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/New-Order
            "batchOrders": 1, // dynamic: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Place-Multiple-Orders
        },
        "put": {
            "order": 1, // dynamic: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Order
            "batchOrders": 1, // dynamic: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Multiple-Orders
        }
    },
    "dapiPublic": {
        "get": {
            "premiumIndexKlines": 1, // max 10 : https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Premium-Index-Kline-Data
            "klines": 1, // max 5: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Kline-Candlestick-Data
            "continuousKlines": 1, // max 5: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Continuous-Contract-Kline-Candlestick-Data
            "depth": 2, // max 20 : https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Order-Book
            "indexPriceKlines": 1, // max 5 : https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Index-Price-Kline-Candlestick-Data
            "markPriceKlines": 1, // max 5 : https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Mark-Price-Kline-Candlestick-Data"
        },
    },
    "dapiPrivate": {
        "get": {
            "openOrders": { 'cost': 1, 'noSymbol': 40 }, // https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Current-All-Open-Orders"
            "userTrades": 20, // dynamic : https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Account-Trade-List"
            "allOrders": 20, // dynamic : https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/All-Orders
        },
        "post": {
            "order": 1, // ? "https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/New-Order
        },
    },
    "papi": {
        "get": {
            "cm/userTrades": 20, // dynamic: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/CM-Account-Trade-List
            "cm/allOrders": 20, // dynamic : https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders
        },
    },
    "eapiPublic": {
        "get": {
            "depth": 2, // max 20: https://developers.binance.com/docs/derivatives/option/market-data/Order-Book
            "openInterest": 1, // ? "https://developers.binance.com/docs/derivatives/option/market-data/Open-Interest
        },
    },
    "eapiPrivate": {
        "get": {
            "historicalTrades": undefined, // needs to be removed from private endpoints, as it's public
        }
    },
};

export default manualOverrides;

