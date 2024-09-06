
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
    'fapiPublicV2': {
        'get': {
            'ticker/price': { 'cost': 2 * 2.5, 'noSymbol': 4 * 2.5 },
        }
    },
    "sapi": {
        "post": {
            "loan/vip/borrow": "https://developers.binance.com/docs/vip_loan/trade/VIP-Loan-Borrow",
            "convert/acceptQuote": "https://developers.binance.com/docs/convert/trade/Accept-Quote",
            "margin/exchange-small-liability": "https://developers.binance.com/docs/margin_trading/trade/Small-Liability-Exchange",
            "margin/borrow-repay": "https://developers.binance.com/docs/margin_trading/borrow-and-repay/Margin-Account-Borrow-Repay",
            "convert/getQuote": "https://developers.binance.com/docs/convert/trade/Send-quote-request",
            "bnbBurn": "https://developers.binance.com/docs/margin_trading/account/Toggle-BNB-Burn-On-Spot-Trade-And-Margin-Interest",
            "margin/isolated/account": "https://developers.binance.com/docs/margin_trading/account/Enable-Isolated-Margin-Account",
            "broker/subAccountApi/commission": "https://developers.binance.com/docs/binance_link/exchange-link/fee/Change-Sub-Account-Commission",
            "margin/order": "https://developers.binance.com/docs/margin_trading/trade/Margin-Account-New-Order",
            "convert/limit/queryOpenOrders": "https://developers.binance.com/docs/convert/trade/Query-Order",
            "dci/product/subscribe": "https://developers.binance.com/docs/dual_investment/trade/Subscribe-Dual-Investment-products",
            "dci/product/auto_compound/edit-status": "https://developers.binance.com/docs/dual_investment/trade/Change-Auto-Compound-status",
            "convert/limit/cancelOrder": "https://developers.binance.com/docs/convert/trade/Cancel-Order",
            "convert/limit/placeOrder": "https://developers.binance.com/docs/convert/trade/Place-Order"
        },
        "get": {
            "margin/interestHistory": "https://developers.binance.com/docs/margin_trading/borrow-and-repay/Get-Interest-History",
            "margin/isolatedMarginData": "https://developers.binance.com/docs/margin_trading/account/Query-Isolated-Margin-Fee-Data",
            "margin/crossMarginData": "https://developers.binance.com/docs/margin_trading/account/Query-Cross-Margin-Fee-Data",
            "capital/config/getall": "https://developers.binance.com/docs/wallet/capital/all-coins-info",
            "margin/allOrders": "https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-All-Orders",
            "convert/exchangeInfo": "https://developers.binance.com/docs/convert/market-data/List-all-convert-pairs",
            "margin/openOrders": "https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Open-Orders",
            "dci/product/list": "https://developers.binance.com/docs/dual_investment/market-data/Get-Dual-Investment-product-list",
            "margin/interestRateHistory": "https://developers.binance.com/docs/margin_trading/borrow-and-repay/Query-Margin-Interest-Rate-History",
            "margin/rateLimit/order": "https://developers.binance.com/docs/margin_trading/trade/Query-Current-Margin-Order-Count-Usage",
            "convert/assetInfo": "https://developers.binance.com/docs/convert/market-data/Query-order-quantity-precision-per-asset",
            "margin/forceLiquidationRec": "https://developers.binance.com/docs/margin_trading/trade/Get-Force-Liquidation-Record",
            "margin/exchange-small-liability-history": "https://developers.binance.com/docs/margin_trading/trade/Get-Small-Liability-Exchange-History",
            "margin/order": "https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Order",
            "portfolio/asset-index-price": "https://developers.binance.com/docs/derivatives/portfolio-margin-pro/market-data/Query-Portfolio-Margin-Asset-Index-Price",
            "margin/orderList": "https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-OCO",
            "margin/myTrades": "https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Trade-List",
            "bnbBurn": "https://developers.binance.com/docs/margin_trading/account/Get-BNB-Burn-Status",
            "margin/isolatedMarginTier": "https://developers.binance.com/docs/margin_trading/market-data/Query-Isolated-Margin-Tier-Data",
            "margin/account": "https://developers.binance.com/docs/margin_trading/account/Query-Cross-Margin-Account-Details",
            "accountSnapshot": "https://developers.binance.com/docs/wallet/account/daily-account-snapshoot",
            "margin/crossMarginCollateralRatio": "https://developers.binance.com/docs/margin_trading/market-data/Cross-margin-collateral-ratio",
            "margin/allPairs": "https://developers.binance.com/docs/margin_trading/market-data/Get-All-Cross-Margin-Pairs",
            "margin/allOrderList": "https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-All-OCO",
            "margin/priceIndex": "https://developers.binance.com/docs/margin_trading/market-data/Query-Margin-PriceIndex",
            "dci/product/accounts": "https://developers.binance.com/docs/dual_investment/trade/Check-Dual-Investment-accounts",
            "margin/allAssets": "https://developers.binance.com/docs/margin_trading/market-data/Get-All-Margin-Assets",
            "convert/orderStatus": "https://developers.binance.com/docs/convert/trade/Order-Status",
            "margin/isolated/allPairs": "https://developers.binance.com/docs/margin_trading/market-data/Get-All-Isolated-Margin-Symbol",
            "margin/transfer": "https://developers.binance.com/docs/margin_trading/transfer/Get-Cross-Margin-Transfer-History",
            "margin/isolated/account": "https://developers.binance.com/docs/margin_trading/account/Query-Isolated-Margin-Account-Info",
            "margin/tradeCoeff": "https://developers.binance.com/docs/margin_trading/account/Get-Summary-Of-Margin-Account",
            "margin/maxTransferable": "https://developers.binance.com/docs/margin_trading/transfer/Query-Max-Transfer-Out-Amount",
            "margin/capital-flow": "https://developers.binance.com/docs/margin_trading/account/Query-Cross-Isolated-Margin-Capital-Flow",
            "margin/openOrderList": "https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Open-OCO",
            "margin/borrow-repay": "https://developers.binance.com/docs/margin_trading/borrow-and-repay/Query-Borrow-Repay",
            "margin/maxBorrowable": "https://developers.binance.com/docs/margin_trading/borrow-and-repay/Query-Max-Borrow",
            "dci/product/positions": "https://developers.binance.com/docs/dual_investment/trade/Get-Dual-Investment-positions",
            "margin/isolated/accountLimit": "https://developers.binance.com/docs/margin_trading/account/Query-Enabled-Isolated-Margin-Account-Limit",
            "broker/subAccount/spotSummary": "https://developers.binance.com/docs/binance_link/exchange-link/asset/Query-Sub-Account-Spot-Asset-Info"
        },
        "delete": {
            "margin/isolated/account": "https://developers.binance.com/docs/margin_trading/account/Disable-Isolated-Margin-Account"
        }
    },
    "sapiV2": {
        "post": {
        "broker/subAccountApi/ipRestriction (HMAC SHA256)": "https://developers.binance.com/docs/binance_link/exchange-link/account/Update-IP-Restriction-for-Sub-Account-API-key-For-Master-Account"
        }
    },
    "fapiPrivate": {
        "get": {
            "order/asyn/id": "https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Get-Futures-Order-History-Download-Link-by-Id",
            "positionSide/dual": "https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Get-Current-Position-Mode",
            "apiTradingStatus": "https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Futures-Trading-Quantitative-Rules-Indicators",
            "forceOrders": "https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Users-Force-Orders",
            "convert/orderStatus": "https://developers.binance.com/docs/derivatives/usds-margined-futures/convert/Order-Status",
            "openOrders": "https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Current-All-Open-Orders"
        },
        "post": {
            "convert/acceptQuote": "https://developers.binance.com/docs/derivatives/usds-margined-futures/convert/Accept-Quote",
            "convert/getQuote": "https://developers.binance.com/docs/derivatives/usds-margined-futures/convert/Send-quote-request"
        }
    },
    "fapiPublic": {
        "get": {
            "apiReferral/rebateVol": "https://developers.binance.com/docs/binance_link/link-and-trade/futures/Get-Rebate-Volume",
            "apiReferral/userCustomization": "https://developers.binance.com/docs/binance_link/link-and-trade/futures/Get-User-Customize-Id",
            "apiReferral/tradeVol": "https://developers.binance.com/docs/binance_link/link-and-trade/futures/Get-User-Trade-Volume",
            "apiReferral/customization": "https://developers.binance.com/docs/binance_link/link-and-trade/futures/Get-Client-Email-Customized-Id",
            "apiReferral/traderSummary": "https://developers.binance.com/docs/binance_link/link-and-trade/futures/Get-Trader-Detail",
            "aggTrades": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Compressed-Aggregate-Trades-List",
            "assetIndex": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Multi-Assets-Mode-Asset-Index",
            "ticker/price": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Symbol-Price-Ticker",
            "klines": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Kline-Candlestick-Data",
            "premiumIndexKlines": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Premium-Index-Kline-Data",
            "depth": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Order-Book",
            "fundingRate": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Get-Funding-Rate-History",
            "markPriceKlines": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price-Kline-Candlestick-Data",
            "indexPriceKlines": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Index-Price-Kline-Candlestick-Data",
            "apiReferral/overview": "https://developers.binance.com/docs/binance_link/link-and-trade/futures/Get-Rebate-Data-Overview",
            "income": "https://developers.binance.com/docs/binance_link/link-and-trade/futures/Get-Income-History",
            "ticker/24hr": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/24hr-Ticker-Price-Change-Statistics",
            "ticker/bookTicker": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Symbol-Order-Book-Ticker",
            "convert/exchangeInfo": "https://developers.binance.com/docs/derivatives/usds-margined-futures/convert/List-all-convert-pairs",
            "ping": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Test-Connectivity",
            "apiReferral/traderNum": "https://developers.binance.com/docs/binance_link/link-and-trade/futures/Get-Trader-Number",
            "continuousKlines": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Continuous-Contract-Kline-Candlestick-Data",
            "time": "https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Check-Server-Time",
            "apiReferral/ifNewUser": "https://developers.binance.com/docs/binance_link/link-and-trade/futures/Query-Client-If-New-User"
        },
        "post": {
            "order": "https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/New-Order",
            "apiReferral/customization": "https://developers.binance.com/docs/binance_link/link-and-trade/futures/Customize-Id-For-Client-For-Partner",
            "apiReferral/userCustomization": "https://developers.binance.com/docs/binance_link/link-and-trade/futures/Customize-Id-For-Client-For-Client",
            "countdownCancelAll": "https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Auto-Cancel-All-Open-Orders",
            "batchOrders": "https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Place-Multiple-Orders"
        },
        "delete": {
            "listenKey": "https://developers.binance.com/docs/derivatives/usds-margined-futures/user-data-streams/Close-User-Data-Stream"
        },
        "put": {
            "order": "https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Order",
            "batchOrders": "https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Multiple-Orders"
        }
    },
    "dapiPrivate": {
        "get": {
            "openOrders": "https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Current-All-Open-Orders",
            "userTrades": "https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Account-Trade-List",
            "allOrders": "https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/All-Orders",
            "forceOrders": "https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Users-Force-Orders"
        }
    },
    "papi": {
        "get": {
            "cm/userTrades": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/CM-Account-Trade-List",
            "um/conditional/openOrders": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-UM-Open-Conditional-Orders",
            "apiReferral/ifNewUser": "https://developers.binance.com/docs/binance_link/link-and-trade/futures/Query-Client-If-New-User-PAPI",
            "um/openOrders": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-UM-Open-Orders",
            "um/forceOrders": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Users-UM-Force-Orders",
            "cm/openOrders": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-CM-Open-Orders",
            "um/apiTradingStatus": "https://developers.binance.com/docs/derivatives/portfolio-margin/account/Portfolio-Margin-UM-Trading-Quantitative-Rules-Indicators",
            "cm/allOrders": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders",
            "cm/conditional/allOrders": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Conditional-Orders",
            "cm/conditional/openOrders": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-CM-Open-Conditional-Orders",
            "apiReferral/userCustomization": "https://developers.binance.com/docs/binance_link/link-and-trade/futures/Get-User-Customize-Id-PAPI",
            "cm/forceOrders": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Users-CM-Force-Orders",
            "um/conditional/allOrders": "https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Conditional-Orders"
        },
        "post": {
            "apiReferral/userCustomization": "https://developers.binance.com/docs/binance_link/link-and-trade/futures/Customize-Id-For-Client-For-Client-PAPI"
        }
    },
    "eapiPublic": {
        "get": {
            "countdownCancelAll": "https://developers.binance.com/docs/derivatives/option/market-maker-endpoints/Get-Auto-Cancel-All-Open-Orders-Config",
            "historicalTrades": "https://developers.binance.com/docs/derivatives/option/market-data/Old-Trades-Lookup",
            "depth": "https://developers.binance.com/docs/derivatives/option/market-data/Order-Book",
            "openInterest": "https://developers.binance.com/docs/derivatives/option/market-data/Open-Interest"
        },
        "post": {
            "countdownCancelAllHeartBeat": "https://developers.binance.com/docs/derivatives/option/market-maker-endpoints/Auto-Cancel-All-Open-Orders-Heartbeat"
        },
        "delete": {
            "order": "https://developers.binance.com/docs/derivatives/option/trade/Cancel-Option-Order"
        }
    },
    "eapiPrivate": {
        "get": {
            "openOrders": "https://developers.binance.com/docs/derivatives/option/trade/Query-Current-Open-Option-Orders"
        }
    },
    "dapiPublic": {
        "get": {
            "premiumIndexKlines": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Premium-Index-Kline-Data",
            "ticker/bookTicker": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Symbol-Order-Book-Ticker",
            "ticker/24hr": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/24hr-Ticker-Price-Change-Statistics",
            "klines": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Kline-Candlestick-Data",
            "trades": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Recent-Trades-List",
            "ticker/price": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Symbol-Price-Ticker",
            "continuousKlines": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Continuous-Contract-Kline-Candlestick-Data",
            "depth": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Order-Book",
            "indexPriceKlines": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Index-Price-Kline-Candlestick-Data",
            "exchangeInfo": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Exchange-Information",
            "markPriceKlines": "https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Mark-Price-Kline-Candlestick-Data"
        },
        "post": {
            "order": "https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/New-Order"
        }
    },
};

export default manualOverrides;

