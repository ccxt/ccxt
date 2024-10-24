

// this is temporary file, before we merge the correct values, we should read this instaed of binance.ts.

const manualOverrides = {
    'public': {
        'get': {
            'depth': { // https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#order-book
                'cost': 5,
                'byLimit': [ [ 100, 5 ], [ 500, 25 ], [ 1000, 50 ], [ 5000, 250 ] ]
            },
            'ticker':  { 'cost': 4, 'noSymbol': 200 }, // https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#rolling-window-price-change-statistics
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
            "margin/crossMarginData": { 'cost': 1, 'noCoin': 5 }, // https://developers.binance.com/docs/margin_trading/account/Query-Cross-Margin-Fee-Data#http-request
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
            "depth": { // https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Order-Book
                'cost': 2,
                'byLimit': [ [ 50, 2 ], [ 100, 5 ], [ 500, 10 ], [ 1000, 20 ] ] 
            },
            "fundingRate": 1, // 0 ? : https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Get-Funding-Rate-History
            'klines': { // https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Kline-Candlestick-Data
                'cost': 1,
                'byLimit': [ [ 99, 1 ], [ 499, 2 ], [ 1000, 5 ], [ 10000, 10 ] ]
            },
            'continuousKlines': { // https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Continuous-Contract-Kline-Candlestick-Data
                'cost': 1,
                'byLimit': [ [ 99, 1 ], [ 499, 2 ], [ 1000, 5 ], [ 10000, 10 ] ]
            },
            'markPriceKlines': { // https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price-Kline-Candlestick-Data
                'cost': 1,
                'byLimit': [ [ 99, 1 ], [ 499, 2 ], [ 1000, 5 ], [ 10000, 10 ] ]
            },
            'indexPriceKlines': { // https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Index-Price-Kline-Candlestick-Data
                'cost': 1,
                'byLimit': [ [ 99, 1 ], [ 499, 2 ], [ 1000, 5 ], [ 10000, 10 ] ]
            },
            'premiumIndexKlines': { // https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Premium-Index-Kline-Data
                'cost': 1,
                'byLimit': [ [ 99, 1 ], [ 499, 2 ], [ 1000, 5 ], [ 10000, 10 ] ]
            },
            "fundingInfo": 1, // ? https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Get-Funding-Info
        },
    },
    "fapiPrivate": {
        "post": {
            "order": 1, // dynamic: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/New-Order
            "batchOrders": 1, // dynamic: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Place-Multiple-Orders
            'convert/getQuote': 50,
        },
        "put": {
            "order": 1, // dynamic: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Order
            "batchOrders": 1, // dynamic: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Multiple-Orders
        }
    },
    "dapiPublic": {
        "get": {
            "depth": { // https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Order-Book
                'cost': 2,
                'byLimit': [ [ 50, 2 ], [ 100, 5], [ 500, 10 ], [ 1000, 20 ] ],
            },
            'klines': { // https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Kline-Candlestick-Data
                'cost': 1,
                'byLimit': [ [ 99, 1 ], [ 499, 2 ], [ 1000, 5 ], [ 10000, 10 ] ]
            },
            'continuousKlines': { // https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Continuous-Contract-Kline-Candlestick-Data
                'cost': 1,
                'byLimit': [ [ 99, 1 ], [ 499, 2 ], [ 1000, 5 ], [ 10000, 10 ] ]
            },
            'indexPriceKlines': { // https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Index-Price-Kline-Candlestick-Data
                'cost': 1,
                'byLimit': [ [ 99, 1 ], [ 499, 2 ], [ 1000, 5 ], [ 10000, 10 ] ]
            },
            'markPriceKlines': { // https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Mark-Price-Kline-Candlestick-Data"
                'cost': 1,
                'byLimit': [ [ 99, 1 ], [ 499, 2 ], [ 1000, 5 ], [ 10000, 10 ] ]
            },
            'premiumIndexKlines': { // https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Premium-Index-Kline-Data
                'cost': 1,
                'byLimit': [ [ 99, 1 ], [ 499, 2 ], [ 1000, 5 ], [ 10000, 10 ] ]
            },
        },
    },
    "dapiPrivate": {
        "get": {
            "openOrders": { 'cost': 1, 'noSymbol': 40 }, // https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Current-All-Open-Orders"
            "userTrades": { 'cost': 20, 'noSymbol': 40 }, // dynamic : https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Account-Trade-List"
            "allOrders": { 'cost': 20, 'noSymbol': 40 }, // dynamic : https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/All-Orders
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

