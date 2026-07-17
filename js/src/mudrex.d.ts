import Exchange from './abstract/mudrex.js';
import type { Balances, Dict, Int, Leverage, MarginModification, Market, Num, OHLCV, Order, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, TransferEntry, int } from './base/types.js';
/**
 * @class mudrex
 * @augments Exchange
 */
export default class mudrex extends Exchange {
    describe(): any;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: string;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name mudrex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.trade.mudrex.com/docs/historical-kline
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {string} [params.price] "mark" to fetch mark price candles
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name mudrex#fetchMarkOHLCV
     * @description fetches historical mark price candlestick data containing the open, high, low, and close price of a market
     * @see https://docs.trade.mudrex.com/docs
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchMarkOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name mudrex#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.trade.mudrex.com/docs
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name mudrex#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.trade.mudrex.com/docs
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name mudrex#fetchMarkets
     * @description retrieves data on all markets for the exchange
     * @see https://docs.trade.mudrex.com/docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(asset: Dict): Market;
    /**
     * @method
     * @name mudrex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.trade.mudrex.com/docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'swap' (default) or 'spot' - which wallet balance to fetch
     * @param {string} [params.trade_currency] the settlement currency to query the balance for
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name mudrex#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://docs.trade.mudrex.com/docs
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure](https://docs.ccxt.com/#/?id=leverage-structure)
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    /**
     * @method
     * @name mudrex#setLeverage
     * @description set the level of leverage for a market
     * @see https://docs.trade.mudrex.com/docs
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginType] 'ISOLATED' (default) or 'CROSSED'
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name mudrex#createOrder
     * @description create a trade order
     * @see https://docs.trade.mudrex.com/docs
     * @param {string} symbol unified market symbol
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price to fulfill the order, in units of the quote currency (also required for market orders on this exchange)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.leverage] leverage for the order, required if setLeverage() was not called beforehand
     * @param {bool} [params.reduceOnly] true if the order is reduce only
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the trigger price of the take-profit order attached to this order
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the trigger price of the stop-loss order attached to this order
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {float} [params.takeProfitPrice] the trigger price for a standalone take-profit order on an existing position (requires params.positionId)
     * @param {float} [params.stopLossPrice] the trigger price for a standalone stop-loss order on an existing position (requires params.positionId)
     * @param {string} [params.positionId] the id of the position the standalone stopLossPrice/takeProfitPrice order is attached to
     * @param {string} [params.trade_currency] the settlement currency for the order
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name mudrex#editOrder
     * @description edit a trade order
     * @see https://docs.trade.mudrex.com/docs
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to edit an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} [amount] how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    parseOrderStatus(status: Str): Str;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name mudrex#cancelOrder
     * @description cancels an open order
     * @see https://docs.trade.mudrex.com/docs
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name mudrex#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.trade.mudrex.com/docs
     * @param {string} id the order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name mudrex#fetchOrdersByState
     * @ignore
     * @description fetches a list of orders filtered by their state
     * @param {string} state the state of the orders to fetch
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOrdersByState(state: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name mudrex#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.trade.mudrex.com/docs
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name mudrex#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.trade.mudrex.com/docs
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name mudrex#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.trade.mudrex.com/docs
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name mudrex#fetchPositions
     * @description fetch all open positions
     * @see https://docs.trade.mudrex.com/docs
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.trade_currency] the settlement currency to query positions for
     * @returns {object[]} a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name mudrex#fetchPositionsHistory
     * @description fetches the history of closed positions
     * @see https://docs.trade.mudrex.com/docs/get-position-history
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of position structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.trade_currency] the settlement currency to filter positions by
     * @returns {object[]} a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    fetchPositionsHistory(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name mudrex#closePosition
     * @description closes an open position for a market
     * @see https://docs.trade.mudrex.com/docs
     * @param {string} symbol unified CCXT market symbol
     * @param {string} [side] 'buy' or 'sell', not required by mudrex
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.position_id] the id of the position to close, resolved from the symbol if not provided
     * @param {float} [params.amount] the amount to close for a partial close, closes the whole position if not provided
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    /**
     * @method
     * @name mudrex#addMargin
     * @description add margin to a position
     * @see https://docs.trade.mudrex.com/docs
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.position_id] the id of the position to add margin to, resolved from the symbol if not provided
     * @returns {object} a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name mudrex#reduceMargin
     * @description remove margin from a position
     * @see https://docs.trade.mudrex.com/docs
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name mudrex#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.trade.mudrex.com/docs
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.trade_currency] the settlement currency to filter trades by
     * @returns {Trade[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name mudrex#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://docs.trade.mudrex.com/docs
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount 'spot' or 'futures'
     * @param {string} toAccount 'spot' or 'futures'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
}
