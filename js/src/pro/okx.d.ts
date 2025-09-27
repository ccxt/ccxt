import okxRest from '../okx.js';
import type { Int, OrderSide, OrderType, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, OHLCV, Position, Balances, Num, FundingRate, FundingRates, Liquidation, Bool } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class okx extends okxRest {
    describe(): any;
    getUrl(channel: string, access?: string): string;
    subscribeMultiple(access: any, channel: any, symbols?: Strings, params?: {}): Promise<any>;
    subscribe(access: any, messageHash: any, channel: any, symbol: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name okx#watchTrades
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-trades-channel
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-all-trades-channel
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name okx#watchTradesForSymbols
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-trades-channel
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-all-trades-channel
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbols
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to subscribe to, trades by default. Can be 'trades' and 'trades-all'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name okx#unWatchTradesForSymbols
     * @description unWatches from the stream channel
     * @param {string[]} symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to subscribe to, trades by default. Can be trades, trades-all
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    unWatchTradesForSymbols(symbols: string[], params?: {}): Promise<any>;
    /**
     * @method
     * @name okx#unWatchTrades
     * @description unWatches from the stream channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    handleTrades(client: Client, message: any): void;
    /**
     * @method
     * @name okx#watchFundingRate
     * @description watch the current funding rate
     * @see https://www.okx.com/docs-v5/en/#public-data-websocket-funding-rate-channel
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    watchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name coinbaseinternational#watchFundingRates
     * @description watch the funding rate for multiple markets
     * @see https://www.okx.com/docs-v5/en/#public-data-websocket-funding-rate-channel
     * @param {string[]} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [funding rates structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexe by market symbols
     */
    watchFundingRates(symbols: string[], params?: {}): Promise<FundingRates>;
    handleFundingRate(client: Client, message: any): void;
    /**
     * @method
     * @name okx#watchTicker
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-tickers-channel
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name okx#unWatchTicker
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-tickers-channel
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchTicker(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name okx#watchTickers
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-tickers-channel
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name okx#watchMarkPrice
     * @see https://www.okx.com/docs-v5/en/#public-data-websocket-mark-price-channel
     * @description watches a mark price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchMarkPrice(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name okx#watchMarkPrices
     * @see https://www.okx.com/docs-v5/en/#public-data-websocket-mark-price-channel
     * @description watches mark prices
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchMarkPrices(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name okx#unWatchTickers
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-tickers-channel
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchTickers(symbols?: Strings, params?: {}): Promise<any>;
    handleTicker(client: Client, message: any): void;
    /**
     * @method
     * @name okx#watchBidsAsks
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-tickers-channel
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleBidAsk(client: Client, message: any): void;
    parseWsBidAsk(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name okx#watchLiquidationsForSymbols
     * @description watch the public liquidations of a trading pair
     * @see https://www.okx.com/docs-v5/en/#public-data-websocket-liquidation-orders-channel
     * @param {string} symbols
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the okx api endpoint
     * @returns {object} an array of [liquidation structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure}
     */
    watchLiquidationsForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    handleLiquidation(client: Client, message: any): void;
    /**
     * @method
     * @name okx#watchMyLiquidationsForSymbols
     * @description watch the private liquidations of a trading pair
     * @see https://www.okx.com/docs-v5/en/#trading-account-websocket-balance-and-position-channel
     * @param {string[]} symbols
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the okx api endpoint
     * @returns {object} an array of [liquidation structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure}
     */
    watchMyLiquidationsForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    handleMyLiquidation(client: Client, message: any): void;
    parseWsMyLiquidation(liquidation: any, market?: any): Liquidation;
    parseWsLiquidation(liquidation: any, market?: any): Liquidation;
    /**
     * @method
     * @name okx#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name okx#unWatchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name okx#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: {}): Promise<import("../base/types.js").Dictionary<import("../base/types.js").Dictionary<OHLCV[]>>>;
    /**
     * @method
     * @name okx#unWatchOHLCVForSymbols
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCVForSymbols(symbolsAndTimeframes: string[][], params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: any): void;
    /**
     * @method
     * @name okx#watchOrderBook
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-order-book-channel
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.depth] okx order book depth, can be books, books5, books-l2-tbt, books50-l2-tbt, bbo-tbt
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name okx#watchOrderBookForSymbols
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-order-book-channel
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] 1,5, 400, 50 (l2-tbt, vip4+) or 40000 (vip5+) the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.depth] okx order book depth, can be books, books5, books-l2-tbt, books50-l2-tbt, bbo-tbt
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name okx#unWatchOrderBookForSymbols
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-order-book-channel
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string[]} symbols unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] the maximum amount of order book entries to return
     * @param {string} [params.depth] okx order book depth, can be books, books5, books-l2-tbt, books50-l2-tbt, bbo-tbt
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBookForSymbols(symbols: string[], params?: {}): Promise<any>;
    /**
     * @method
     * @name okx#unWatchOrderBook
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-order-book-channel
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] the maximum amount of order book entries to return
     * @param {string} [params.depth] okx order book depth, can be books, books5, books-l2-tbt, books50-l2-tbt, bbo-tbt
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBookMessage(client: Client, message: any, orderbook: any, messageHash: any, market?: any): any;
    handleOrderBook(client: Client, message: any): any;
    authenticate(params?: {}): Promise<any>;
    /**
     * @method
     * @name okx#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalanceAndPosition(client: Client, message: any): void;
    handleBalance(client: Client, message: any): void;
    orderToTrade(order: any, market?: any): Trade;
    /**
     * @method
     * @name okx#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-order-channel
     * @param {string} [symbol] unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true if fetching trigger or conditional trades
     * @param {string} [params.type] 'spot', 'swap', 'future', 'option', 'ANY', 'SPOT', 'MARGIN', 'SWAP', 'FUTURES' or 'OPTION'
     * @param {string} [params.marginMode] 'cross' or 'isolated', for automatically setting the type to spot margin
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name okx#watchPositions
     * @see https://www.okx.com/docs-v5/en/#trading-account-websocket-positions-channel
     * @description watch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param since
     * @param limit
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    handlePositions(client: any, message: any): void;
    /**
     * @method
     * @name okx#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-order-channel
     * @param {string} [symbol] unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true if fetching trigger or conditional orders
     * @param {string} [params.type] 'spot', 'swap', 'future', 'option', 'ANY', 'SPOT', 'MARGIN', 'SWAP', 'FUTURES' or 'OPTION'
     * @param {string} [params.marginMode] 'cross' or 'isolated', for automatically setting the type to spot margin
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any, subscription?: any): void;
    handleMyTrades(client: Client, message: any): void;
    requestId(): string;
    /**
     * @method
     * @name okx#createOrderWs
     * @see https://www.okx.com/docs-v5/en/#websocket-api-trade-place-order
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float|undefined} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} params.test test order, default false
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    handlePlaceOrders(client: Client, message: any): void;
    /**
     * @method
     * @name okx#editOrderWs
     * @description edit a trade order
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-amend-order
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-amend-multiple-orders
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float|undefined} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrderWs(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name okx#cancelOrderWs
     * @see https://okx-docs.github.io/apidocs/websocket_api/en/#cancel-order-trade
     * @description cancel multiple orders
     * @param {string} id order id
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clOrdId] client order id
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name okx#cancelOrdersWs
     * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-mass-cancel-order
     * @description cancel multiple orders
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrdersWs(ids: string[], symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name okx#cancelAllOrdersWs
     * @see https://docs.okx.com/websockets/#message-cancelAll
     * @description cancel all open orders of a type. Only applicable to Option in Portfolio Margin mode, and MMP privilege is required.
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrdersWs(symbol?: Str, params?: {}): Promise<any>;
    handleCancelAllOrders(client: Client, message: any): void;
    handleSubscriptionStatus(client: Client, message: any): any;
    handleAuthenticate(client: Client, message: any): void;
    ping(client: Client): string;
    handlePong(client: Client, message: any): any;
    handleErrorMessage(client: Client, message: any): Bool;
    handleMessage(client: Client, message: any): void;
    handleUnSubscriptionTrades(client: Client, symbol: string, channel: string): void;
    handleUnsubscriptionOrderBook(client: Client, symbol: string, channel: string): void;
    handleUnsubscriptionOHLCV(client: Client, symbol: string, channel: string): void;
    handleUnsubscriptionTicker(client: Client, symbol: string, channel: any): void;
    handleUnsubscription(client: Client, message: any): void;
}
