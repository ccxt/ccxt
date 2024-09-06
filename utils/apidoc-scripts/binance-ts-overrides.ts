

// this is temporary file, before we merge the correct values, we should read this instaed of binance.ts.
// at this moment, fapi/dapi need to be multiplied by 2.5 coefficient (RL=25), compared to spot (RL=10)

const manualOverrides = {
    'public': {
        'get': {
            'depth': 5, // max 250 : https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#order-book
            'ticker':  4, // dynamic : https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#rolling-window-price-change-statistics
            'ticker/24hr': { 'cost': 2, 'noSymbol': 80 },
            'ticker/price': { 'cost': 2, 'noSymbol': 4 },
            'ticker/bookTicker': { 'cost': 2, 'noSymbol': 4 },
            'ticker/tradingDay':  4, // dynamic : https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#trading-day-ticker
        }
    },
    'private': {
        'get': {
            'myPreventedMatches': 2, 
            'openOrders': { 'cost': 6, 'noSymbol': 80 },
        },
        'post': {
            'order/test': 1,
            'sor/order/test': 1,
            'orderList/oto': 1,
            'orderList/otoco': 1,
        }
    },
    "sapi": {
        "get": {
            "margin/isolatedMarginData":  { 'cost': 1, 'noSymbol': 10 },
            "margin/crossMarginData": 1, // max 5 : https://developers.binance.com/docs/margin_trading/account/Query-Cross-Margin-Fee-Data#http-request
            "portfolio/asset-index-price": 1, // max 50 : https://developers.binance.com/docs/derivatives/portfolio-margin-pro/market-data/Query-Portfolio-Margin-Asset-Index-Price
        },
    },
    "fapiPublic": {
        "get": {
            "assetIndex": { 'cost': 1, 'noSymbol': 10 },
            "ticker/price": { 'cost': 1, 'noSymbol': 2 },
            "klines": 1, // max 10 : "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Kline-Candlestick-Data",
            "premiumIndexKlines": 1, // max 10 : "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Premium-Index-Kline-Data",
            "depth": 2, // max 20 : "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Order-Book",
            "fundingRate": 1, // 0 ? : "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Get-Funding-Rate-History",
            "markPriceKlines": 1, // max 10 : "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price-Kline-Candlestick-Data",
            "indexPriceKlines": 1, // max 10: "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Index-Price-Kline-Candlestick-Data",
            "ticker/24hr": { 'cost': 1, 'noSymbol': 40 },
            "ticker/bookTicker": { 'cost': 2, 'noSymbol': 5 },
            "continuousKlines": 1, // max 10 : "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Continuous-Contract-Kline-Candlestick-Data",
        },
        "post": {
            "order": 1, // dynamic: "https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/New-Order",
            "batchOrders": 1, // dynamic: "https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Place-Multiple-Orders",
        },
        "put": {
            "order": 1, // dynamic: "https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Order",
            "batchOrders": 1, // dynamic: "https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Multiple-Orders",
        }
    },
    "fapiPrivate": {
        "get": {
            "apiTradingStatus": { 'cost': 1, 'noSymbol': 10 },
            "forceOrders": { 'cost': 20, 'noSymbol': 50 },
            "openOrders": { 'cost': 1, 'noSymbol': 40 },
        }
    },
    'fapiPublicV2': {
        'get': {
            'ticker/price': { 'cost': 2, 'noSymbol': 4 },
        }
    },
    "dapiPrivate": {
        "get": {
            "openOrders": { 'cost': 1, 'noSymbol': 40 },
            "userTrades": { 'cost': 20, 'noSymbol': 40 },
            "allOrders": { 'cost': 20, 'noSymbol': 40 },
            "forceOrders": { 'cost': 20, 'noSymbol': 50 },
        }
    },
    "papi": {
        "get": {
            "cm/userTrades": { 'cost': 20, 'noSymbol': 40 },
            "um/conditional/openOrders": { 'cost': 1, 'noSymbol': 40 },
            "um/openOrders": { 'cost': 1, 'noSymbol': 40 },
            "um/forceOrders": { 'cost': 20, 'noSymbol': 50 },
            "cm/openOrders": { 'cost': 1, 'noSymbol': 40 },
            "um/apiTradingStatus": { 'cost': 1, 'noSymbol': 10 },
            "cm/allOrders": { 'cost': 20, 'noSymbol': 40 },
            "cm/conditional/allOrders": { 'cost': 1, 'noSymbol': 40 },
            "cm/conditional/openOrders": { 'cost': 1, 'noSymbol': 40 },
            "cm/forceOrders": { 'cost': 20, 'noSymbol': 50 },
            "um/conditional/allOrders":  { 'cost': 1, 'noSymbol': 40 }
        },
    },
    "eapiPublic": {
        "get": {
            "depth": 2, // max 20: "https://developers.binance.com/docs/derivatives/option/market-data/Order-Book",
            "openInterest": 1, // ? "https://developers.binance.com/docs/derivatives/option/market-data/Open-Interest",
        },
    },
    "eapiPrivate": {
        "get": {
            "openOrders": { 'cost': 1, 'noSymbol': 40 },
        }
    },
    "dapiPublic": {
        "get": {
            "premiumIndexKlines": 1, // max 10 : "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Premium-Index-Kline-Data",
            "ticker/bookTicker": { 'cost': 2, 'noSymbol': 5 },
            "ticker/24hr": { 'cost': 1, 'noSymbol': 40 },
            "klines": 1, // max 5: "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Kline-Candlestick-Data",
            "ticker/price": { 'cost': 1, 'noSymbol': 2 },
            "continuousKlines": 1, // max 5: "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Continuous-Contract-Kline-Candlestick-Data",
            "depth": 2, // max 20 : "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Order-Book",
            "indexPriceKlines": 1, // max 5 : "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Index-Price-Kline-Candlestick-Data",
            "markPriceKlines": 1, // max 5 : "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Mark-Price-Kline-Candlestick-Data"
        },
        "post": {
            "order": 1, // ? "https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/New-Order",
        },
    },
};

export default manualOverrides;

