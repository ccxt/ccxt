import Exchange from './abstract/coinmetro.js';
import { Balances, Currencies, Currency, Dict, IndexType, int, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, LedgerEntry } from './base/types.js';
/**
 * @class coinmetro
 * @augments Exchange
 */
export default class coinmetro extends Exchange {
    describe(): any;
    /**
     * @method
     * @name coinmetro#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#d5876d43-a3fe-4479-8c58-24d0f044edfb
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name coinmetro#fetchMarkets
     * @description retrieves data on all markets for coinmetro
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#9fd18008-338e-4863-b07d-722878a46832
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    parseMarketId(marketId: any): Dict;
    parseMarketPrecisionAndLimits(currencyId: any): Dict;
    /**
     * @method
     * @name coinmetro#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#13cfb5bc-7bfb-4847-85e1-e0f35dfb3573
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name coinmetro#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#6ee5d698-06da-4570-8c84-914185e05065
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coinmetro#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#4d48ae69-8ee2-44d1-a268-71f84e557b7b
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve (default 500, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name coinmetro#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#26ad80d7-8c46-41b5-9208-386f439a8b87
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (default 100, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseBidsAsks(bidasks: any, priceKey?: IndexType, amountKey?: IndexType, countOrIdKey?: IndexType): any[];
    /**
     * @method
     * @name coinmetro#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#6ecd1cd1-f162-45a3-8b3b-de690332a485
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name coinmetro#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#6ecd1cd1-f162-45a3-8b3b-de690332a485
     * @param {string[]} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name coinmetro#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#741a1dcc-7307-40d0-acca-28d003d1506a
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(balances: any): Balances;
    /**
     * @method
     * @name coinmetro#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#4e7831f7-a0e7-4c3e-9336-1d0e5dcb15cf
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseLedgerEntryDescription(description: any): any[];
    parseLedgerEntryType(type: any): string;
    /**
     * @method
     * @name coinmetro#createOrder
     * @description create a trade order
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#a4895a1d-3f50-40ae-8231-6962ef06c771
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] the quote quantity that can be used as an alternative for the amount in market orders
     * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", "GTD"
     * @param {number} [params.expirationTime] timestamp in millisecond, for GTD orders only
     * @param {float} [params.triggerPrice] the price at which a trigger order is triggered at
     * @param {float} [params.stopLossPrice] *margin only* The price at which a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] *margin only* The price at which a take profit order is triggered at
     * @param {bool} [params.margin] true for creating a margin order
     * @param {string} [params.fillStyle] fill style of the limit order: "sell" fulfills selling quantity "buy" fulfills buying quantity "base" fulfills base currency quantity "quote" fulfills quote currency quantity
     * @param {string} [params.clientOrderId] client's comment
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    handleCreateOrderSide(sellingCurrency: any, buyingCurrency: any, sellingQty: any, buyingQty: any, request?: {}): {};
    encodeOrderTimeInForce(timeInForce: any): any;
    /**
     * @method
     * @name coinmetro#cancelOrder
     * @description cancels an open order
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#eaea86da-16ca-4c56-9f00-5b1cb2ad89f8
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#47f913fb-8cab-49f4-bc78-d980e6ced316
     * @param {string} id order id
     * @param {string} symbol not used by coinmetro cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.margin] true for cancelling a margin order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinmetro#closePosition
     * @description closes an open position
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#47f913fb-8cab-49f4-bc78-d980e6ced316
     * @param {string} symbol not used by coinmetro closePosition ()
     * @param {string} [side] not used by coinmetro closePosition ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.orderID] order id
     * @param {number} [params.fraction] fraction of order to close, between 0 and 1 (defaults to 1)
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinmetro#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#518afd7a-4338-439c-a651-d4fdaa964138
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinmetro#fetchCanceledAndClosedOrders
     * @description fetches information on multiple canceled and closed orders made by the user
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#4d48ae69-8ee2-44d1-a268-71f84e557b7b
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinmetro#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#95bbed87-db1c-47a7-a03e-aa247e91d5a6
     * @param {int|string} id order id
     * @param {string} symbol not used by coinmetro fetchOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderTimeInForce(timeInForce: any): any;
    /**
     * @method
     * @name coinmetro#borrowCrossMargin
     * @description create a loan to borrow margin
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#5b90b3b9-e5db-4d07-ac9d-d680a06fd110
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    borrowCrossMargin(code: string, amount: number, params?: {}): Promise<any>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: any;
        currency: string;
        amount: any;
        symbol: any;
        timestamp: any;
        datetime: any;
        info: any;
    };
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
