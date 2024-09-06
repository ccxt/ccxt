

// this is temporary file, before we merge the correct values, we should read this instaed of binance.ts. Note:  fapi/dapi need to be multiplied by 2.5 coefficient (RL=25), compared to spot (RL=10)

const manualOverrides = {
    'public': {
        'get': {
            'depth': 5, // dynamic
            'ticker':  4, // dynamic
            'ticker/24hr': { 'cost': 2, 'noSymbol': 80 },
            'ticker/price': { 'cost': 2, 'noSymbol': 4 },
            'ticker/bookTicker': { 'cost': 2, 'noSymbol': 4 },
            'ticker/tradingDay':  4, // dynamic
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
    // fapi/dapi need to be multiplied by 2.5 coefficient (RL=25), compared to spot (RL=10)
    'fapiPublicV2': {
        'get': {
            'ticker/price': { 'cost': 2 * 2.5, 'noSymbol': 4 * 2.5 },
        }
    },
    "sapi": {
        "get": {
            "margin/isolatedMarginData": "https://developers.binance.com/docs/margin_trading/account/Query-Isolated-Margin-Fee-Data",
            "margin/crossMarginData": "https://developers.binance.com/docs/margin_trading/account/Query-Cross-Margin-Fee-Data",
            "portfolio/asset-index-price": "https://developers.binance.com/docs/derivatives/portfolio-margin-pro/market-data/Query-Portfolio-Margin-Asset-Index-Price",
        },
    },
    "fapiPrivate": {
        "get": {
            "apiTradingStatus": "https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Futures-Trading-Quantitative-Rules-Indicators",
            "forceOrders": "https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Users-Force-Orders",
            "openOrders": "https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Current-All-Open-Orders",
        }
    },
    "fapiPublic": {
        "get": {
            "assetIndex": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Multi-Assets-Mode-Asset-Index",
            "ticker/price": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Symbol-Price-Ticker",
            "klines": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Kline-Candlestick-Data",
            "premiumIndexKlines": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Premium-Index-Kline-Data",
            "depth": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Order-Book",
            "fundingRate": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Get-Funding-Rate-History",
            "markPriceKlines": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price-Kline-Candlestick-Data",
            "indexPriceKlines": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Index-Price-Kline-Candlestick-Data",
            "ticker/24hr": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/24hr-Ticker-Price-Change-Statistics",
            "ticker/bookTicker": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Symbol-Order-Book-Ticker",
            "continuousKlines": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Continuous-Contract-Kline-Candlestick-Data",
        },
        "post": {
            "order": "https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/New-Order",
            "batchOrders": "https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Place-Multiple-Orders",
        },
        "put": {
            "order": "https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Order",
            "batchOrders": "https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Multiple-Orders",
        }
    },
    "dapiPrivate": {
        "get": {
            "openOrders": "https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Current-All-Open-Orders",
            "userTrades": "https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Account-Trade-List",
            "allOrders": "https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/All-Orders",
            "forceOrders": "https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Users-Force-Orders",
        }
    },
    "papi": {
        "get": {
            "cm/userTrades": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/CM-Account-Trade-List",
            "um/conditional/openOrders": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-UM-Open-Conditional-Orders",
            "um/openOrders": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-UM-Open-Orders",
            "um/forceOrders": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Users-UM-Force-Orders",
            "cm/openOrders": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-CM-Open-Orders",
            "um/apiTradingStatus": "https://developers.binance.com/docs/derivatives/portfolio-margin/account/Portfolio-Margin-UM-Trading-Quantitative-Rules-Indicators",
            "cm/allOrders": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders",
            "cm/conditional/allOrders": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Conditional-Orders",
            "cm/conditional/openOrders": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-CM-Open-Conditional-Orders",
            "cm/forceOrders": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Users-CM-Force-Orders",
            "um/conditional/allOrders": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Conditional-Orders"
        },
    },
    "eapiPublic": {
        "get": {
            "depth": "https://developers.binance.com/docs/derivatives/option/market-data/Order-Book",
            "openInterest": "https://developers.binance.com/docs/derivatives/option/market-data/Open-Interest",
        },
    },
    "eapiPrivate": {
        "get": {
            "openOrders": "https://developers.binance.com/docs/derivatives/option/trade/Query-Current-Open-Option-Orders",
        }
    },
    "dapiPublic": {
        "get": {
            "premiumIndexKlines": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Premium-Index-Kline-Data",
            "ticker/bookTicker": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Symbol-Order-Book-Ticker",
            "ticker/24hr": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/24hr-Ticker-Price-Change-Statistics",
            "klines": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Kline-Candlestick-Data",
            "ticker/price": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Symbol-Price-Ticker",
            "continuousKlines": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Continuous-Contract-Kline-Candlestick-Data",
            "depth": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Order-Book",
            "indexPriceKlines": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Index-Price-Kline-Candlestick-Data",
            "markPriceKlines": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Mark-Price-Kline-Candlestick-Data"
        },
        "post": {
            "order": "https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/New-Order",
        },
    },
};

export default manualOverrides;

