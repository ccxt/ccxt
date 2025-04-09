import Exchange from './abstract/coinex.js';
import type { Balances, Currency, FundingHistory, FundingRateHistory, Int, Market, OHLCV, Order, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, OrderRequest, TransferEntry, Leverage, Num, MarginModification, TradingFeeInterface, Currencies, TradingFees, Position, IsolatedBorrowRate, Dict, LeverageTiers, LeverageTier, int, FundingRate, FundingRates, DepositAddress, BorrowInterest } from './base/types.js';
/**
 * @class coinex
 * @augments Exchange
 */
export default class coinex extends Exchange {
    describe(): any;
    /**
     * @method
     * @name coinex#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/list-all-deposit-withdrawal-config
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name coinex#fetchMarkets
     * @description retrieves data on all markets for coinex
     * @see https://docs.coinex.com/api/v2/spot/market/http/list-market
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchSpotMarkets(params: any): Promise<Market[]>;
    fetchContractMarkets(params: any): Promise<any[]>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name coinex#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.coinex.com/api/v2/spot/market/http/list-market-ticker
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name coinex#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.coinex.com/api/v2/spot/market/http/list-market-ticker
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-ticker
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name coinex#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.coinex.com/api/v2/common/http/time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name coinex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.coinex.com/api/v2/spot/market/http/list-market-depth
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<import("./base/types.js").OrderBook>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name coinex#fetchTrades
     * @description get the list of the most recent trades for a particular symbol
     * @see https://docs.coinex.com/api/v2/spot/market/http/list-market-deals
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-deals
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coinex#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://docs.coinex.com/api/v2/spot/market/http/list-market
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name coinex#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://docs.coinex.com/api/v2/spot/market/http/list-market
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name coinex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.coinex.com/api/v2/spot/market/http/list-market-kline
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-kline
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchMarginBalance(params?: {}): Promise<Balances>;
    fetchSpotBalance(params?: {}): Promise<Balances>;
    fetchSwapBalance(params?: {}): Promise<Balances>;
    fetchFinancialBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name coinex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.coinex.com/api/v2/assets/balance/http/get-spot-balance         // spot
     * @see https://docs.coinex.com/api/v2/assets/balance/http/get-futures-balance      // swap
     * @see https://docs.coinex.com/api/v2/assets/balance/http/get-marigin-balance      // margin
     * @see https://docs.coinex.com/api/v2/assets/balance/http/get-financial-balance    // financial
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'margin', 'swap', 'financial', or 'spot'
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name coinex#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade003_market_order
     * @see https://docs.coinex.com/api/v2/spot/order/http/put-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name coinex#createOrder
     * @description create a trade order
     * @see https://docs.coinex.com/api/v2/spot/order/http/put-order
     * @see https://docs.coinex.com/api/v2/spot/order/http/put-stop-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/put-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/put-stop-order
     * @see https://docs.coinex.com/api/v2/futures/position/http/close-position
     * @see https://docs.coinex.com/api/v2/futures/position/http/set-position-stop-loss
     * @see https://docs.coinex.com/api/v2/futures/position/http/set-position-take-profit
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] price to trigger stop orders
     * @param {float} [params.stopLossPrice] price to trigger stop loss orders
     * @param {float} [params.takeProfitPrice] price to trigger take profit orders
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK', 'PO'
     * @param {boolean} [params.postOnly] set to true if you wish to make a post only order
     * @param {boolean} [params.reduceOnly] *contract only* indicates if this order is to reduce the size of a position
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinex#createOrders
     * @description create a list of trade orders (all orders should be of the same symbol)
     * @see https://docs.coinex.com/api/v2/spot/order/http/put-multi-order
     * @see https://docs.coinex.com/api/v2/spot/order/http/put-multi-stop-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/put-multi-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/put-multi-stop-order
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the api endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinex#cancelOrders
     * @description cancel multiple orders
     * @see https://docs.coinex.com/api/v2/spot/order/http/cancel-batch-order
     * @see https://docs.coinex.com/api/v2/spot/order/http/cancel-batch-stop-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/cancel-batch-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/cancel-batch-stop-order
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for canceling stop orders
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<any[]>;
    /**
     * @method
     * @name coinex#editOrder
     * @description edit a trade order
     * @see https://docs.coinex.com/api/v2/spot/order/http/edit-order
     * @see https://docs.coinex.com/api/v2/spot/order/http/edit-stop-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/edit-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/edit-stop-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the price to trigger stop orders
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinex#cancelOrder
     * @description cancels an open order
     * @see https://docs.coinex.com/api/v2/spot/order/http/cancel-order
     * @see https://docs.coinex.com/api/v2/spot/order/http/cancel-stop-order
     * @see https://docs.coinex.com/api/v2/spot/order/http/cancel-order-by-client-id
     * @see https://docs.coinex.com/api/v2/spot/order/http/cancel-stop-order-by-client-id
     * @see https://docs.coinex.com/api/v2/futures/order/http/cancel-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/cancel-stop-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/cancel-order-by-client-id
     * @see https://docs.coinex.com/api/v2/futures/order/http/cancel-stop-order-by-client-id
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, defaults to id if not passed
     * @param {boolean} [params.trigger] set to true for canceling a trigger order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinex#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://docs.coinex.com/api/v2/spot/order/http/cancel-all-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/cancel-all-order
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' for canceling spot margin orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinex#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.coinex.com/api/v2/spot/order/http/get-order-status
     * @see https://docs.coinex.com/api/v2/futures/order/http/get-order-status
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinex#fetchOrdersByStatus
     * @description fetch a list of orders
     * @see https://docs.coinex.com/api/v2/spot/order/http/list-finished-order
     * @see https://docs.coinex.com/api/v2/spot/order/http/list-finished-stop-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/list-finished-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/list-finished-stop-order
     * @param {string} status order status to fetch for
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for fetching trigger orders
     * @param {string} [params.marginMode] 'cross' or 'isolated' for fetching spot margin orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinex#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.coinex.com/api/v2/spot/order/http/list-pending-order
     * @see https://docs.coinex.com/api/v2/spot/order/http/list-pending-stop-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/list-pending-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/list-pending-stop-order
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for fetching trigger orders
     * @param {string} [params.marginMode] 'cross' or 'isolated' for fetching spot margin orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinex#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.coinex.com/api/v2/spot/order/http/list-finished-order
     * @see https://docs.coinex.com/api/v2/spot/order/http/list-finished-stop-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/list-finished-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/list-finished-stop-order
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for fetching trigger orders
     * @param {string} [params.marginMode] 'cross' or 'isolated' for fetching spot margin orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinex#createDepositAddress
     * @description create a currency deposit address
     * @see https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/update-deposit-address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the blockchain network to create a deposit address on
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    createDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name coinex#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/get-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the blockchain network to create a deposit address on
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name coinex#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.coinex.com/api/v2/spot/deal/http/list-user-deals
     * @see https://docs.coinex.com/api/v2/futures/deal/http/list-user-deals
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trades
     * @param {string} [params.side] the side of the trades, either 'buy' or 'sell', required for swap
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coinex#fetchPositions
     * @description fetch all open positions
     * @see https://docs.coinex.com/api/v2/futures/position/http/list-pending-position
     * @see https://docs.coinex.com/api/v2/futures/position/http/list-finished-position
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] the method to use 'v2PrivateGetFuturesPendingPosition' or 'v2PrivateGetFuturesFinishedPosition' default is 'v2PrivateGetFuturesPendingPosition'
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name coinex#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://docs.coinex.com/api/v2/futures/position/http/list-pending-position
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name coinex#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://docs.coinex.com/api/v2/futures/position/http/adjust-position-leverage
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} params.leverage the rate of leverage
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name coinex#setLeverage
     * @see https://docs.coinex.com/api/v2/futures/position/http/adjust-position-leverage
     * @description set the level of leverage for a market
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' (default is 'cross')
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name coinex#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-position-level
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
     */
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<LeverageTiers>;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    modifyMarginHelper(symbol: string, amount: any, addOrReduce: any, params?: {}): Promise<any>;
    parseMarginModification(data: Dict, market?: Market): MarginModification;
    /**
     * @method
     * @name coinex#addMargin
     * @description add margin
     * @see https://docs.coinex.com/api/v2/futures/position/http/adjust-position-margin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name coinex#reduceMargin
     * @description remove margin from a position
     * @see https://docs.coinex.com/api/v2/futures/position/http/adjust-position-margin
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name coinex#fetchFundingHistory
     * @description fetch the history of funding fee payments paid and received on this account
     * @see https://docs.coinex.com/api/v2/futures/position/http/list-position-funding-history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    /**
     * @method
     * @name coinex#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name coinex#fetchFundingInterval
     * @description fetch the current funding rate interval
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingInterval(symbol: string, params?: {}): Promise<FundingRate>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    parseFundingInterval(interval: any): string;
    /**
     * @method
     * @name coinex#fetchFundingRates
     * @description fetch the current funding rates for multiple markets
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    /**
     * @method
     * @name coinex#withdraw
     * @description make a withdrawal
     * @see https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] unified network code
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransactionStatus(status: Str): string;
    /**
     * @method
     * @name coinex#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name coinex#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://docs.coinex.com/api/v2/assets/transfer/http/transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.symbol] unified ccxt symbol, required when either the fromAccount or toAccount is margin
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransferStatus(status: any): string;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    /**
     * @method
     * @name coinex#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://docs.coinex.com/api/v2/assets/transfer/http/list-transfer-history
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfer structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' for fetching transfers to and from your margin account
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    /**
     * @method
     * @name coinex#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/list-withdrawal-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name coinex#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/list-deposit-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposit structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseIsolatedBorrowRate(info: Dict, market?: Market): IsolatedBorrowRate;
    /**
     * @method
     * @name coinex#fetchIsolatedBorrowRate
     * @description fetch the rate of interest to borrow a currency for margin trading
     * @see https://docs.coinex.com/api/v2/assets/loan-flat/http/list-margin-interest-limit
     * @param {string} symbol unified symbol of the market to fetch the borrow rate for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.code unified currency code
     * @returns {object} an [isolated borrow rate structure]{@link https://docs.ccxt.com/#/?id=isolated-borrow-rate-structure}
     */
    fetchIsolatedBorrowRate(symbol: string, params?: {}): Promise<IsolatedBorrowRate>;
    /**
     * @method
     * @name coinex#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://docs.coinex.com/api/v2/assets/loan-flat/http/list-margin-borrow-history
     * @param {string} [code] unified currency code
     * @param {string} [symbol] unified market symbol when fetch interest in isolated markets
     * @param {int} [since] the earliest time in ms to fetch borrrow interest for
     * @param {int} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
     */
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<BorrowInterest[]>;
    parseBorrowInterest(info: Dict, market?: Market): BorrowInterest;
    /**
     * @method
     * @name coinex#borrowIsolatedMargin
     * @description create a loan to borrow margin
     * @see https://docs.coinex.com/api/v2/assets/loan-flat/http/margin-borrow
     * @param {string} symbol unified market symbol, required for coinex
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.isAutoRenew] whether to renew the margin loan automatically or not, default is false
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    borrowIsolatedMargin(symbol: string, code: string, amount: number, params?: {}): Promise<any>;
    /**
     * @method
     * @name coinex#repayIsolatedMargin
     * @description repay borrowed margin and interest
     * @see https://docs.coinex.com/api/v2/assets/loan-flat/http/margin-repay
     * @param {string} symbol unified market symbol, required for coinex
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.borrow_id] extra parameter that is not required
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    repayIsolatedMargin(symbol: string, code: string, amount: any, params?: {}): Promise<any>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: number;
        currency: string;
        amount: string;
        symbol: string;
        timestamp: number;
        datetime: string;
        info: any;
    };
    /**
     * @method
     * @name coinex#fetchDepositWithdrawFee
     * @description fetch the fee for deposits and withdrawals
     * @see https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/get-deposit-withdrawal-config
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFee(code: string, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): Dict;
    /**
     * @method
     * @name coinex#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://docs.coinex.com/api/v2/assets/loan-flat/http/list-margin-interest-limit
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.code unified currency code
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    /**
     * @method
     * @name coinex#fetchPositionHistory
     * @description fetches historical positions
     * @see https://docs.coinex.com/api/v2/futures/position/http/list-finished-position
     * @param {string} symbol unified contract symbol
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum amount of records to fetch, default is 10
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @param {int} [params.until] the latest time in ms to fetch positions for
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositionHistory(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name coinex#closePosition
     * @description closes an open position for a market
     * @see https://docs.coinex.com/api/v2/futures/position/http/close-position
     * @param {string} symbol unified CCXT market symbol
     * @param {string} [side] buy or sell, not used by coinex
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.type required by coinex, one of: limit, market, maker_only, ioc or fok, default is *market*
     * @param {string} [params.price] the price to fulfill the order, ignored in market orders
     * @param {string} [params.amount] the amount to trade in units of the base currency
     * @param {string} [params.clientOrderId] the client id of the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    handleMarginModeAndParams(methodName: any, params?: {}, defaultValue?: any): any[];
    nonce(): number;
    sign(path: any, api?: any[], method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    /**
     * @method
     * @name coinex#fetchMarginAdjustmentHistory
     * @description fetches the history of margin added or reduced from contract isolated positions
     * @see https://docs.coinex.com/api/v2/futures/position/http/list-position-margin-history
     * @param {string} symbol unified market symbol
     * @param {string} [type] not used by coinex fetchMarginAdjustmentHistory
     * @param {int} [since] timestamp in ms of the earliest change to fetch
     * @param {int} [limit] the maximum amount of changes to fetch, default is 10
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @param {int} [params.until] timestamp in ms of the latest change to fetch
     * @param {int} [params.positionId] the id of the position that you want to retrieve margin adjustment history for
     * @returns {object[]} a list of [margin structures]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    fetchMarginAdjustmentHistory(symbol?: Str, type?: Str, since?: Num, limit?: Num, params?: {}): Promise<MarginModification[]>;
}
