import Exchange from './abstract/bit2me.js';
import type { Balances, Currencies, Currency, CurrencyInterface, Dict, Int, List, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TransferEntry, int } from './base/types.js';
/**
 * @class bit2me
 * @augments Exchange
 */
export default class bit2me extends Exchange {
    describe(): Dict;
    /**
     * @method
     * @name bit2me#fetchMarkets
     * @description retrieves data on all markets for bit2me
     * @see https://api.bit2me.com/docs/pro/api-reference/marketdata/v2/trading/market-config/get
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marketEnabled] filter by market state, one of 'enabled', 'enabled_at', 'frozen', 'restricted'
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: Dict): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name bit2me#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api.bit2me.com/docs/wallet/rest-overview
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.includeTestnet] default false, when true testnet assets are included
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: Dict): Promise<Currencies>;
    parseCurrency(rawCurrency: Dict): CurrencyInterface;
    /**
     * @method
     * @name bit2me#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://api.bit2me.com/docs/pro/api-reference/marketdata/v2/trading/tickers/get
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    fetchTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name bit2me#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api.bit2me.com/docs/pro/api-reference/marketdata/v2/trading/tickers/get
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    fetchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bit2me#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.bit2me.com/docs/pro/api-reference/marketdata/v2/trading/order-book/get
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] not used by bit2me.fetchOrderBook, the endpoint always returns up to 100 levels per side
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method
     * @name bit2me#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.bit2me.com/docs/pro/api-reference/marketdata/v1/trading/trade/last/get
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch, default 50, max 50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    parseTrade(trade: Dict | List, market?: Market): Trade;
    /**
     * @method
     * @name bit2me#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api.bit2me.com/docs/pro/api-reference/marketdata/v1/trading/candle/get
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, default 1000, max 1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name bit2me#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api.bit2me.com/docs/pro/api-reference/funding/v1/trading/wallet/balance/get
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.symbols] comma-separated currency codes, only those wallets are returned
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    fetchBalance(params?: Dict): Promise<Balances>;
    parseBalanceList(response: Dict[]): Balances;
    /**
     * @method
     * @name bit2me#createOrder
     * @description create a trade order
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/post
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, required for limit orders, for market buy orders it is used to compute the cost to spend (amount * price)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the price at which a stop-limit order is activated, requires a limit price
     * @param {float} [params.stopLossPrice] the trigger price of a stop loss, placed as a stop-limit order at the limit price, or as the stop loss leg of an OCO when takeProfitPrice is also set
     * @param {float} [params.takeProfitPrice] the trigger price of a take profit, placed as a stop-limit order at the limit price, or as the take profit leg of an OCO when stopLossPrice is also set
     * @param {float} [params.stopLimitPrice] OCO only, the limit price of the stop loss leg, defaults to the price argument and then to stopLossPrice
     * @param {float} [params.cost] for market orders only, the amount to trade in units of the quote currency, overrides amount
     * @param {string} [params.timeInForce] 'GTC' (default) or 'FOK' (limit orders only), IOC is not available on bit2me
     * @param {boolean} [params.postOnly] true to place a post-only limit order
     * @param {string} [params.clientOrderId] a unique identifier for the order
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure), for an OCO the take profit leg is returned and both legs are available in info, cancelling one leg does not cancel the other
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: Dict): Promise<Order>;
    /**
     * @ignore
     * @method
     * @name bit2me#createOrderRequest
     * @description helper function to build the request body for createOrder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the request body
     */
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: Dict): Dict;
    /**
     * @method
     * @name bit2me#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/post
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name bit2me#createMarketSellOrderWithCost
     * @description create a market sell order by providing the symbol and cost
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/post
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    createMarketSellOrderWithCost(symbol: string, cost: number, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name bit2me#cancelOrder
     * @description cancels an open order
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/id/delete
     * @param {string} id order id
     * @param {string} [symbol] not used by bit2me.cancelOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    cancelOrder(id: string, symbol?: Str, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name bit2me#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/id/get
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/get
     * @param {string} id the order id
     * @param {string} [symbol] not used by bit2me.fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] fetch the order by its client order id instead of its id
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOrder(id: string, symbol?: Str, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name bit2me#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/get
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve, default 100, max 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {int} [params.offset] the number of orders to skip, for pagination
     * @param {string} [params.status] only orders in exactly this status, one of 'open', 'inactive', 'filled', 'cancelled'
     * @param {string} [params.status_in] comma-separated statuses to include
     * @param {string} [params.clientOrderId] comma-separated client order ids to filter by
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name bit2me#fetchOpenOrders
     * @description fetch all unfilled currently open orders, including stop-limit orders waiting for their trigger
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/get
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve, default 100, max 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name bit2me#fetchClosedOrders
     * @description fetches information on multiple filled orders made by the user
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/get
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve, default 100, max 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name bit2me#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/get
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve, default 100, max 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name bit2me#fetchCanceledAndClosedOrders
     * @description fetches information on multiple canceled and filled orders made by the user
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/get
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve, default 100, max 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    parseOrderStatus(status: Str): Str;
    parseOrderType(type: Str): Str;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name bit2me#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/trade/get
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve, default 50, max 50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {int} [params.offset] the number of trades to skip, for pagination
     * @returns {Trade[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name bit2me#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/id/trades/get
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name bit2me#transfer
     * @description transfer currency internally between the bit2me wallet and the trading (pro) wallet
     * @see https://api.bit2me.com/docs/pro/api-reference/funding/v1/trading/wallet/deposit/post
     * @see https://api.bit2me.com/docs/pro/api-reference/funding/v1/trading/wallet/withdraw/post
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount 'funding' (the bit2me wallet) or 'spot' (the trading wallet)
     * @param {string} toAccount 'funding' (the bit2me wallet) or 'spot' (the trading wallet)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: Dict): Promise<TransferEntry>;
    /**
     * @method
     * @name bit2me#fetchTransfers
     * @description fetch the history of movements between the bit2me wallet and the trading (pro) wallet
     * @see https://api.bit2me.com/docs/pro/api-reference/funding/v1/trading/movement/get
     * @param {string} [code] unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfer structures to retrieve, default 100, max 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for
     * @param {string} [params.movementType] 'deposit' or 'withdrawal', to fetch only one direction
     * @returns {object[]} a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: Dict): Promise<TransferEntry[]>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseTransferStatus(status: Str): Str;
    nonce(): int;
    sign(path: string, api?: string[], method?: string, params?: Dict): Dict;
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): undefined;
}
