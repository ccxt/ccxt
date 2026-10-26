import coinbaseinternationalRest from '../coinbaseinternational.js';
import { Ticker, Int, Str, Trade, OrderBook, Market, Dict, Strings, FundingRate, FundingRates, Tickers, OHLCV, Bool, Balances, Order, Position, OrderType, OrderSide, Num } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class coinbaseinternational extends coinbaseinternationalRest {
    describe(): any;
    requestId(): any;
    getWsUrl(isPrivate?: boolean): string;
    ping(client: Client): Dict | Str;
    /**
     * @ignore
     * @method
     * @name coinbaseinternational#subscribe
     * @description subscribes to websocket channels
     * @see https://docs.deribit.com/api-reference/subscription-management/public-subscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/private-subscribe
     * @param {string[]} channels exchange channel names
     * @param {string[]} messageHashes message hashes to resolve
     * @param {boolean} [isPrivate] whether to authenticate and subscribe privately
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the subscription result
     */
    subscribe(channels: string[], messageHashes: string[], isPrivate?: boolean, params?: Dict): Promise<any>;
    /**
     * @ignore
     * @method
     * @name coinbaseinternational#unSubscribe
     * @description unsubscribes from websocket channels
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/private-unsubscribe
     * @param {string[]} channels exchange channel names
     * @param {boolean} [isPrivate] whether to authenticate and unsubscribe privately
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {boolean} true when unsubscription has been requested
     */
    unSubscribe(channels: string[], isPrivate?: boolean, params?: Dict): Promise<boolean>;
    /**
     * @method
     * @name coinbaseinternational#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/userportfoliocurrency
     * @see https://docs.deribit.com/subscriptions/user/userportfoliocurrency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.currency] currency code to watch, default is any
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: Dict): void;
    /**
     * @method
     * @name coinbaseinternational#watchMyTrades
     * @description watches trades associated with the user
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/usertradesinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/trades/tradesinstrument_nameinterval
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.interval] notification interval, default raw
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coinbaseinternational#unWatchMyTrades
     * @description stops watching user trades
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/private-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/private-unsubscribe
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    unWatchMyTrades(symbol?: Str, params?: {}): Promise<any>;
    handleMyTrades(client: Client, message: Dict): void;
    /**
     * @method
     * @name coinbaseinternational#watchOrders
     * @description watches information on orders made by the user
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/userordersinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/user/userordersinstrument_nameinterval
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.interval] notification interval, default raw
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinbaseinternational#watchOrdersForSymbols
     * @description watches information on orders made by the user for multiple symbols
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/userordersinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/user/userordersinstrument_nameinterval
     * @param {string[]} symbols unified market symbols
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrdersForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinbaseinternational#unWatchOrders
     * @description stops watching user orders
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/private-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/private-unsubscribe
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    unWatchOrders(symbol?: Str, params?: {}): Promise<any>;
    handleOrders(client: Client, message: Dict): void;
    /**
     * @method
     * @name coinbaseinternational#watchPositions
     * @description watches all open positions
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/userchangesinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/user/userchangesinstrument_nameinterval
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] timestamp in ms of the earliest position to fetch
     * @param {int} [limit] the maximum number of positions to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.interval] notification interval, default raw
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name coinbaseinternational#unWatchPositions
     * @description stops watching open positions
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/private-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/private-unsubscribe
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    unWatchPositions(symbols?: Strings, params?: {}): Promise<any>;
    handlePositions(client: Client, message: Dict): void;
    /**
     * @method
     * @name coinbaseinternational#watchFundingRate
     * @description watch the current funding rate
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/market-data/tickerinstrument_nameinterval
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    watchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name coinbaseinternational#watchFundingRates
     * @description watch the funding rate for multiple markets
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/market-data/tickerinstrument_nameinterval
     * @param {string[]} symbols a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} a dictionary of [funding rates structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexe by market symbols
     */
    watchFundingRates(symbols?: Strings, params?: Dict): Promise<FundingRates>;
    /**
     * @method
     * @name coinbaseinternational#unWatchFundingRate
     * @description stops watching the funding rate for a symbol
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    unWatchFundingRate(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name coinbaseinternational#unWatchFundingRates
     * @description stops watching funding rates for multiple symbols
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    unWatchFundingRates(symbols?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name coinbaseinternational#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/market-data/tickerinstrument_nameinterval
     * @param {string} [symbol] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.interval] notification interval, default 100ms
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    /**
     * @method
     * @name coinbaseinternational#unWatchTicker
     * @description stops watching a ticker
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    unWatchTicker(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name coinbaseinternational#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/market-data/tickerinstrument_nameinterval
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.interval] notification interval, default 100ms
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name coinbaseinternational#unWatchTickers
     * @description stops watching tickers
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    unWatchTickers(symbols?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name coinbaseinternational#watchMarkPrice
     * @description watches a mark price for a specific market
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/market-data/tickerinstrument_nameinterval
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.interval] notification interval, default 100ms
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchMarkPrice(symbol: string, params?: Dict): Promise<Ticker>;
    /**
     * @method
     * @name coinbaseinternational#watchMarkPrices
     * @description watches the mark price for multiple markets
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/market-data/tickerinstrument_nameinterval
     * @param {string[]} symbols unified symbols of the markets to watch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.interval] notification interval, default 100ms
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchMarkPrices(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name coinbaseinternational#unWatchMarkPrice
     * @description stops watching the mark price for a symbol
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    unWatchMarkPrice(symbol: string, params?: Dict): Promise<any>;
    /**
     * @method
     * @name coinbaseinternational#unWatchMarkPrices
     * @description stops watching mark prices for multiple symbols
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    unWatchMarkPrices(symbols?: Strings, params?: Dict): Promise<any>;
    /**
     * @method
     * @name coinbaseinternational#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/quoteinstrument_name
     * @see https://docs.deribit.com/subscriptions/market-data/quoteinstrument_name
     * @param {string[]} [symbols] unified symbols of the markets to watch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name coinbaseinternational#unWatchBidsAsks
     * @description stops watching best bid & ask for symbols
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    unWatchBidsAsks(symbols?: Strings, params?: {}): Promise<any>;
    handleTicker(client: Client, message: Dict): void;
    handleBidAsk(client: Client, message: Dict): void;
    parseWsBidAsk(ticker: any, market?: Market): Ticker;
    /**
     * @method
     * @name coinbaseinternational#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/charttradesinstrument_nameresolution
     * @see https://docs.deribit.com/subscriptions/market-data/charttradesinstrument_nameresolution
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    /**
     * @method
     * @name coinbaseinternational#watchOHLCVForSymbols
     * @description watches historical candlestick data for multiple markets and timeframes
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/charttradesinstrument_nameresolution
     * @see https://docs.deribit.com/subscriptions/market-data/charttradesinstrument_nameresolution
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} a dictionary of OHLCV arrays indexed by symbol and timeframe
     */
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: {}): Promise<import("../base/types.js").Dictionary<import("../base/types.js").Dictionary<OHLCV[]>>>;
    /**
     * @method
     * @name coinbaseinternational#unWatchOHLCV
     * @description stops watching OHLCV data for a symbol
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string} symbol unified market symbol
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name coinbaseinternational#unWatchOHLCVForSymbols
     * @description stops watching OHLCV data for multiple symbols and timeframes
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    unWatchOHLCVForSymbols(symbolsAndTimeframes: string[][], params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: Dict): void;
    parseWsOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name coinbaseinternational#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/trades/tradesinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/trades/tradesinstrument_nameinterval
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name coinbaseinternational#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/trades/tradesinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/trades/tradesinstrument_nameinterval
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name coinbaseinternational#unWatchTrades
     * @description stops watching trades for a symbol
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name coinbaseinternational#unWatchTradesForSymbols
     * @description stops watching trades for multiple symbols
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    unWatchTradesForSymbols(symbols: string[], params?: {}): Promise<any>;
    handleTrades(client: Client, message: Dict): Dict;
    /**
     * @method
     * @name coinbaseinternational#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/orderbook/bookinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/orderbook/bookinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/orderbook/bookinstrument_namegroupdepthinterval
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method
     * @name coinbaseinternational#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/orderbook/bookinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/orderbook/bookinstrument_nameinterval
     * @see https://docs.deribit.com/subscriptions/orderbook/bookinstrument_namegroupdepthinterval
     * @param {string[]} symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name coinbaseinternational#unWatchOrderBook
     * @description stops watching an order book
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name coinbaseinternational#unWatchOrderBookForSymbols
     * @description stops watching order books for multiple symbols
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    unWatchOrderBookForSymbols(symbols: string[], params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: Dict): void;
    resubscribeOrderBook(channel: string): Promise<void>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any[]): void;
    handleErrorMessage(client: Client, message: any): Bool;
    handleHeartbeat(client: Client, message: Dict): Promise<void>;
    handleMessage(client: Client, message: any): void;
    handleAuthenticationMessage(client: Client, message: Dict): void;
    /**
     * @ignore
     * @method
     * @name coinbaseinternational#authenticate
     * @description authenticates the private websocket session
     * @see https://docs.cdp.coinbase.com/api-reference/authentication/public-auth
     * @see https://docs.deribit.com/api-reference/authentication/public-auth
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the authentication response
     */
    authenticate(params?: Dict): Promise<any>;
    /**
     * @ignore
     * @method
     * @name coinbaseinternational#requestWs
     * @description sends a websocket JSON-RPC request
     * @param {string} method exchange JSON-RPC method name
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {boolean} [isPrivate] whether to authenticate before sending the request
     * @returns {object} the exchange response
     */
    requestWs(method: string, params?: Dict, isPrivate?: boolean): Promise<any>;
    /**
     * @method
     * @name coinbaseinternational#createOrderWs
     * @description create a trade order over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-buy
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-sell
     * @see https://docs.deribit.com/api-reference/trading/private-buy
     * @see https://docs.deribit.com/api-reference/trading/private-sell
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount number of contracts for native Deribit derivatives, otherwise the exchange order amount (base currency for spot)
     * @param {float} [price] the price at which the order is to be fulfilled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinbaseinternational#editOrderWs
     * @description edit a trade order over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-edit
     * @see https://docs.deribit.com/api-reference/trading/private-edit
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {string} type not used by coinbaseinternational editOrderWs
     * @param {string} side not used by coinbaseinternational editOrderWs
     * @param {float} [amount] new order amount, in contracts for native Deribit derivatives
     * @param {float} [price] new order price
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrderWs(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinbaseinternational#cancelOrderWs
     * @description cancels an open order over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-cancel
     * @see https://docs.deribit.com/api-reference/trading/private-cancel
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinbaseinternational#cancelAllOrdersWs
     * @description cancels all open orders over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-cancel_all
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-cancel_all_by_instrument
     * @see https://docs.deribit.com/api-reference/trading/private-cancel_all
     * @see https://docs.deribit.com/api-reference/trading/private-cancel_all_by_instrument
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrdersWs(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinbaseinternational#fetchOrderWs
     * @description fetches an order over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-get_order_state
     * @see https://docs.deribit.com/api-reference/trading/private-get_order_state
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinbaseinternational#fetchOpenOrdersWs
     * @description fetches open orders over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-get_open_orders_by_instrument
     * @see https://docs.deribit.com/api-reference/trading/private-get_open_orders_by_instrument
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrdersWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinbaseinternational#fetchOrdersWs
     * @description fetches order history over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-get_order_history_by_instrument
     * @see https://docs.deribit.com/api-reference/trading/private-get_order_history_by_instrument
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrdersWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinbaseinternational#fetchBalanceWs
     * @description fetches the balance over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_account_summaries
     * @see https://docs.deribit.com/api-reference/account-management/private-get_account_summaries
     * @see https://docs.deribit.com/api-reference/account-management/private-get_account_summary
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalanceWs(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name coinbaseinternational#fetchMyTradesWs
     * @description fetches user trades over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/trading/private-get_user_trades_by_instrument
     * @see https://docs.deribit.com/api-reference/trading/private-get_user_trades_by_instrument
     * @see https://docs.deribit.com/api-reference/trading/private-get_user_trades_by_instrument_and_time
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest trade
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTradesWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coinbaseinternational#fetchPositionsWs
     * @description fetches open positions over websocket
     * @see https://docs.cdp.coinbase.com/api-reference/account-management/private-get_positions
     * @see https://docs.deribit.com/api-reference/account-management/private-get_positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositionsWs(symbols?: Strings, params?: {}): Promise<Position[]>;
    /**
     * @ignore
     * @method
     * @name coinbaseinternational#setHeartbeat
     * @description enables heartbeat messages for the private websocket connection
     * @see https://docs.cdp.coinbase.com/api-reference/session-management/public-set_heartbeat
     * @see https://docs.deribit.com/api-reference/session-management/public-set_heartbeat
     * @param {int} [interval] heartbeat interval in seconds, minimum 10
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    setHeartbeat(interval?: Int, params?: Dict): Promise<any>;
    /**
     * @ignore
     * @method
     * @name coinbaseinternational#disableHeartbeat
     * @description disables heartbeat messages for the private websocket connection
     * @see https://docs.cdp.coinbase.com/api-reference/session-management/public-disable_heartbeat
     * @see https://docs.deribit.com/api-reference/session-management/public-disable_heartbeat
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    disableHeartbeat(params?: Dict): Promise<any>;
    /**
     * @ignore
     * @method
     * @name coinbaseinternational#setCancelOnDisconnect
     * @description enables or disables cancel on disconnect
     * @see https://docs.cdp.coinbase.com/api-reference/session-management/private-enable_cancel_on_disconnect
     * @see https://docs.cdp.coinbase.com/api-reference/session-management/private-disable_cancel_on_disconnect
     * @see https://docs.deribit.com/api-reference/session-management/private-enable_cancel_on_disconnect
     * @see https://docs.deribit.com/api-reference/session-management/private-disable_cancel_on_disconnect
     * @param {bool} enabled whether cancel on disconnect should be enabled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.scope] connection or account, default connection
     * @returns {object} the exchange response
     */
    setCancelOnDisconnect(enabled: Bool, params?: Dict): Promise<any>;
    /**
     * @ignore
     * @method
     * @name coinbaseinternational#getCancelOnDisconnect
     * @description gets the cancel on disconnect configuration
     * @see https://docs.cdp.coinbase.com/api-reference/session-management/private-get_cancel_on_disconnect
     * @see https://docs.deribit.com/api-reference/session-management/private-get_cancel_on_disconnect
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {string} [params.scope] connection or account, default connection
     * @returns {object} the exchange response
     */
    getCancelOnDisconnect(params?: Dict): Promise<any>;
    /**
     * @ignore
     * @method
     * @name coinbaseinternational#unsubscribeAllWs
     * @description unsubscribes from all websocket channels
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe_all
     * @see https://docs.cdp.coinbase.com/api-reference/subscription-management/private-unsubscribe_all
     * @see https://docs.deribit.com/api-reference/subscription-management/private-unsubscribe_all
     * @see https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe_all
     * @param {bool} [isPrivate] whether to unsubscribe from private channels
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @returns {object} the exchange response
     */
    unsubscribeAllWs(isPrivate?: boolean, params?: Dict): Promise<any>;
    /**
     * @ignore
     * @method
     * @name coinbaseinternational#logoutWs
     * @description gracefully logs out of the private websocket session
     * @see https://docs.cdp.coinbase.com/api-reference/authentication/private-logout
     * @see https://docs.deribit.com/api-reference/authentication/private-logout
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.route] auto (default), deribit, or coinbase; overrides options.route
     * @param {bool} [params.invalidate_token] whether to invalidate session tokens, default true
     * @returns {object} the exchange response
     */
    logoutWs(params?: Dict): Promise<undefined>;
}
