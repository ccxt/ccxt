import Exchange from './abstract/polymarket.js';
import type { NullableDict, Dict, Int, Str, Strings, Num, Market, Currencies, Currency, Ticker, Tickers, OrderBook, Trade, OHLCV, FundingRate, FundingRates, FundingRateHistory, OpenInterest, OpenInterests, TradingFees, Status, List, int, Order, OrderType, OrderSide, OrderRequest, Balances, Position, Transaction, FundingHistory, Leverage, MarginMode, MarginModification } from './base/types.js';
/**
 * @class polymarket
 * @description Polymarket perpetual futures - a hybrid dex with an off-chain order book and on-chain settlement of collateral. The venue trades linear perpetual contracts on crypto, indices, equities and commodities, quoted using USD and collateralized exclusively with pUSD. The prediction-market CLOB is a separate product, integrated separately under ccxt.prediction.polymarket
 * @augments Exchange
 */
export default class polymarket extends Exchange {
    describe(): Dict;
    /**
     * @method
     * @name polymarket#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.polymarket.com/perps/market-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: Dict): Promise<Int>;
    /**
     * @method
     * @name polymarket#fetchStatus
     * @description the latest known information on the availability of the exchange api
     * @see https://docs.polymarket.com/perps/market-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    fetchStatus(params?: Dict): Promise<Status>;
    /**
     * @method
     * @name polymarket#fetchCurrencies
     * @description fetches all available currencies on an exchange - every instrument base, the usd quote and the collateral asset
     * @see https://docs.polymarket.com/perps/market-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: Dict): Promise<Currencies>;
    /**
     * @method
     * @name polymarket#fetchMarkets
     * @description retrieves data on all markets for polymarket perps
     * @see https://docs.polymarket.com/perps/market-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: Dict): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name polymarket#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market, merging the ticker, statistics and best bid and ask endpoints
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    /**
     * @method
     * @name polymarket#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market, merging the ticker, statistics and best bid and ask endpoints
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name polymarket#fetchBidsAsks
     * @description fetches the best bid and ask price and volume for multiple markets
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string[]} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchBidsAsks(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name polymarket#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return, must be one of 10, 100, 500 or 1000, the default is 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method
     * @name polymarket#fetchTrades
     * @description get the list of the most recent trades for a particular symbol
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch, the venue serves at most 100 per request
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name polymarket#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, the venue serves at most 1000 per request
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling the endpoint multiple times
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name polymarket#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: Dict): Promise<FundingRate>;
    /**
     * @method
     * @name polymarket#fetchFundingRates
     * @description fetches the current funding rates for multiple markets
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRates(symbols?: Strings, params?: Dict): Promise<FundingRates>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    /**
     * @method
     * @name polymarket#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of funding rate structures to fetch, the venue serves at most 100 per request
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling the endpoint multiple times
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<FundingRateHistory[]>;
    /**
     * @method
     * @name polymarket#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [open interest structure]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterest(symbol: string, params?: Dict): Promise<OpenInterest>;
    /**
     * @method
     * @name polymarket#fetchOpenInterests
     * @description retrieves the open interest of multiple contract trading pairs
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string[]} [symbols] unified market symbols, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [open interest structures]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterests(symbols?: Strings, params?: Dict): Promise<OpenInterests>;
    parseOpenInterest(interest: NullableDict, market?: Market): OpenInterest;
    /**
     * @method
     * @name polymarket#fetchTradingFees
     * @description fetches the default trading fees for multiple markets
     * @see https://docs.polymarket.com/perps/learn-about-trading/fees
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: Dict): Promise<TradingFees>;
    /**
     * @method
     * @ignore
     * @name polymarket#createOrderRequest
     * @description builds one order for the createOrders operation, returning the compact signable row next to the structured body entry
     * @param {object} market the market the order targets
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price to fulfill the order at, a market order can carry one to act like a protective bound
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dict with the signable row and the body entry
     */
    createOrderRequest(market: Market, type: OrderType, side: OrderSide, amount: any, price?: any, params?: Dict): Dict;
    /**
     * @method
     * @name polymarket#createOrder
     * @description create a trade order
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit', a market order executes like an immediate-or-cancel order without a price
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price to fulfill the order at, a market order accepts one to act like a protective bound
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK' or 'PO'
     * @param {bool} [params.postOnly] true to place a maker only order
     * @param {bool} [params.reduceOnly] true to reduce an open position only
     * @param {string} [params.clientOrderId] a client order id, exactly 32 lowercase hex characters
     * @param {int} [params.exp] expiry timestamp of the signed command in ms, bounds how long the gateway may hold the request
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name polymarket#createOrders
     * @description create a list of trade orders in one signed batch
     * @see https://docs.polymarket.com/perps/trading
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.exp] expiry timestamp of the signed command in ms, bounds how long the gateway may hold the request
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name polymarket#cancelOrder
     * @description cancels an open order
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} id order id
     * @param {string} [symbol] not used by polymarket cancelOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] cancel by the client order id instead of the exchange order id
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name polymarket#cancelOrders
     * @description cancel multiple orders in one signed batch
     * @see https://docs.polymarket.com/perps/trading
     * @param {string[]} ids order ids
     * @param {string} [symbol] not used by polymarket cancelOrders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] cancel by client order ids instead of the exchange order ids
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name polymarket#cancelAllOrders
     * @description cancel all open orders, optionally scoped to a single market
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} [symbol] unified market symbol, cancels the orders of every market when omitted
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list with the raw acknowledgement of the venue
     */
    cancelAllOrders(symbol?: Str, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name polymarket#cancelAllOrdersAfter
     * @description arms or clears a dead man's switch that cancels every open order once the deadline passes
     * @see https://docs.polymarket.com/perps/trading
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer, the venue requires at least 5 seconds
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the raw acknowledgement of the venue
     */
    cancelAllOrdersAfter(timeout: Int, params?: Dict): Promise<any>;
    /**
     * @method
     * @name polymarket#editOrder
     * @description edit a resting standalone gtc limit order, only the price and the total quantity can change
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {string} type not used by polymarket editOrder
     * @param {string} side not used by polymarket editOrder
     * @param {float} amount the new total order quantity, it must exceed the already filled quantity
     * @param {float} price the new order price
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: Dict): Promise<Order>;
    parseOrderStatus(status: Str): Str;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name polymarket#fetchBalance
     * @description query for the account equity, the free order margin and the used initial margin
     * @see https://docs.polymarket.com/perps/trading
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: Dict): Promise<Balances>;
    /**
     * @method
     * @name polymarket#fetchPositions
     * @description fetch all open positions
     * @see https://docs.polymarket.com/perps/trading
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: Dict): Promise<Position[]>;
    /**
     * @method
     * @name polymarket#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: Dict): Promise<Position>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name polymarket#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] not sent to the venue, applied client-side
     * @param {int} [limit] the maximum number of open order structures to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name polymarket#fetchOrders
     * @description fetches the latest known snapshot of up to one hundred orders
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] not sent to the venue, applied client-side
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest order
     * @param {string} [params.clientOrderId] fetch the order with this client order id only
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name polymarket#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} id the order id
     * @param {string} [symbol] not used by polymarket fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name polymarket#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} [symbol] unified market symbol, the venue serves fills of every market, filtered client-side
     * @param {int} [since] timestamp in ms of the earliest trade
     * @param {int} [limit] the maximum number of trade structures to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade
     * @param {string} [params.cursor] opaque pagination cursor returned by the previous page
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name polymarket#fetchFundingHistory
     * @description fetch the funding payments paid and received on the open positions of the account
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest funding payment
     * @param {int} [limit] the maximum number of funding payment structures to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding payment
     * @returns {object[]} a list of [funding history structures]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<FundingHistory[]>;
    parseTransactionStatus(status: Str): Str;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name polymarket#fetchDeposits
     * @description fetch all deposits made to the account
     * @see https://docs.polymarket.com/perps/fund-your-account
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest deposit
     * @param {int} [limit] the maximum number of transaction structures to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest deposit
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Transaction[]>;
    /**
     * @method
     * @name polymarket#fetchWithdrawals
     * @description fetch all withdrawals made from the account
     * @see https://docs.polymarket.com/perps/fund-your-account
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest withdrawal
     * @param {int} [limit] the maximum number of transaction structures to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest withdrawal
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Transaction[]>;
    /**
     * @method
     * @name polymarket#withdraw
     * @description withdraw the collateral asset to the polymarket wallet of the account, the request is signed by the wallet key with the withdraw struct of the deposit contract
     * @see https://docs.polymarket.com/perps/fund-your-account
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, params?: Dict): Promise<Transaction>;
    /**
     * @method
     * @name polymarket#fetchLeverage
     * @description fetch the leverage and the margin mode configured for a market
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: Dict): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    /**
     * @method
     * @name polymarket#fetchMarginMode
     * @description fetches the margin mode configured for a market
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/#/?id=margin-mode-structure}
     */
    fetchMarginMode(symbol: string, params?: Dict): Promise<MarginMode>;
    /**
     * @method
     * @name polymarket#setLeverage
     * @description set the level of leverage for a market, optionally switching the margin mode at the same time
     * @see https://docs.polymarket.com/perps/trading
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated', the venue keeps the current mode when omitted is not supported - the default is cross
     * @returns {object} the raw acknowledgement of the venue
     */
    setLeverage(leverage: int, symbol?: Str, params?: Dict): Promise<any>;
    /**
     * @method
     * @name polymarket#setMarginMode
     * @description set the margin mode of a market, the venue updates the mode and the leverage together
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} params.leverage the rate of leverage to set together with the mode
     * @returns {object} the raw acknowledgement of the venue
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: Dict): Promise<any>;
    /**
     * @method
     * @ignore
     * @name polymarket#modifyMarginHelper
     * @description adds margin to an isolated position or removes some, the amount is a signed decimal in the collateral asset
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to move
     * @param {string} type 'add' or 'reduce'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    modifyMarginHelper(symbol: string, amount: any, type: string, params?: Dict): Promise<MarginModification>;
    /**
     * @method
     * @name polymarket#addMargin
     * @description add margin to an isolated position
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: Dict): Promise<MarginModification>;
    /**
     * @method
     * @name polymarket#reduceMargin
     * @description remove margin from an isolated position
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: Dict): Promise<MarginModification>;
    hashMessage(message: any): string;
    signHash(hash: any, privateKey: any): string;
    signMessage(message: any, privateKey: any): string;
    /**
     * @method
     * @name polymarket#createProxyCredentials
     * @description provisions fresh trading session credentials - generates a proxy keypair, registers it with an EIP-712 CreateProxy message signed by the wallet key and caches the returned secret, the venue keeps the session valid for the requested lifetime
     * @see https://docs.polymarket.com/perps/authenticated-sessions
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the session credentials, holding the proxy address, the proxy private key, the secret and the expiry timestamp
     */
    createProxyCredentials(params?: Dict): Promise<Dict>;
    /**
     * @method
     * @ignore
     * @name polymarket#loadProxyCredentials
     * @description returns the cached trading session credentials, provisioning fresh ones when none are cached or the cached session is close to its expiry
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the session credentials, holding the proxy address, the proxy private key, the secret and the expiry timestamp
     */
    loadProxyCredentials(params?: Dict): Promise<Dict>;
    /**
     * @method
     * @ignore
     * @name polymarket#signPerpsOp
     * @description signs a trading operation with the session proxy key - the compact signable array is msgpack-encoded and keccak-hashed, the hash is signed inside an EIP-712 Op struct and the structured operation travels next to the signature
     * @param {any[]} signable the compact positional operation array, undefined entries already removed
     * @param {object} bodyOp the structured operation object transmitted to the venue
     * @returns {object} the signed request body with the op, sig, salt and ts fields
     */
    signPerpsOp(signable: List, bodyOp: Dict, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @ignore
     * @name polymarket#compactSignable
     * @description removes undefined entries from a positional signable array, later entries shift left exactly like the official sdk does before hashing
     * @param {any[]} row the positional array to compact
     * @returns {any[]} the compacted array
     */
    compactSignable(row: any[]): any[];
    priceToPrecision(symbol: Str, price: any): Str;
    amountToPrecision(symbol: Str, amount: any): Str;
    calculateRateLimiterCost(api: string[], method: string, path: string, params: any, config?: {}): any;
    sign(path: string, api?: string[], method?: string, params?: Dict): Dict;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: NullableDict, requestBody: Str): undefined;
}
