import Exchange from './abstract/ellipx.js';
import { Str, Int, int, Dict, Num, Market, Ticker, OrderBook, OHLCV, Currency, Currencies, Trade, Balances, OrderType, OrderSide, Order, DepositAddress, TradingFeeInterface, Transaction } from '../ccxt.js';
/**
 * @class ellipx
 * @augments Exchange
 */
export default class ellipx extends Exchange {
    describe(): any;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    calculateMod(a: any, b: any): number;
    /**
     * @method
     * @name ellipx#fetchMarkets
     * @description Fetches market information from the exchange.
     * @see https://docs.ccxt.com/en/latest/manual.html#markets
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.1a1t05wpgfof
     * @param {object} [params] - Extra parameters specific to the exchange API endpoint
     * @returns {Promise<Market[]>} An array of market structures.
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name ellipx#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.d2jylz4u6pmu
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name ellipx#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.bqmucewhkpdz
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return the exchange not supported yet.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name ellipx#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market, default will return the last 24h period.
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.w65baeuhxwt8
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the API endpoint
     * @returns {OHLCV[]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name ellipx#fetchCurrencies
     * @description fetches information on all currencies from the exchange, including deposit/withdrawal details and available chains
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.x65f9s9j74jf
     * @param {object} [params] extra parameters specific to the ellipx API endpoint
     * @param {string} [params.Can_Deposit] filter currencies by deposit availability, Y for available
     * @param {number} [params.results_per_page] number of results per page, default 100
     * @param {string} [params._expand] additional fields to expand in response, default '/Crypto_Token,/Crypto_Chain'
     * @returns {Promise<Currencies>} An object of currency structures indexed by currency codes
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    parseCurrency(currency: any): Currency;
    /**
     * @method
     * @name ellipx#fetchTrades
     * @description fetches all completed trades for a particular market/symbol
     * @param {string} symbol unified market symbol (e.g. 'BTC/USDT')
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the EllipX API endpoint
     * @param {string} [params.before] get trades before the given trade ID
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: any): Trade;
    /**
     * @method
     * @name ellipx#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.ihrjov144txg
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name ellipx#createOrder
     * @description create a new order in a market
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.yzfak2n2bwpo
     * @param {string} symbol unified market symbol (e.g. 'BTC/USDT')
     * @param {string} type order type - the exchange automatically sets type to 'limit' if price defined, 'market' if undefined
     * @param {string} side 'buy' or 'sell'
     * @param {float} [amount] amount of base currency to trade (can be undefined if using Spend_Limit)
     * @param {float} [price] price per unit of base currency for limit orders
     * @param {object} [params] extra parameters specific to the EllipX API endpoint
     * @param {float} [params.cost] maximum amount to spend in quote currency (required for market orders if amount undefined)
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name ellipx#fetchOrder
     * @description fetches information on an order made by the user
     * @param {string} id the order ID as returned by createOrder or fetchOrders
     * @param {string|undefined} symbol not used by ellipx.fetchOrder
     * @param {object} [params] extra parameters specific to the EllipX API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name ellipx#fetchOrdersByStatus
     * @description fetches a list of orders placed on the exchange
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.5z2nh2b5s81n
     * @param {string} status 'open' or 'closed', omit for all orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum amount of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name ellipx#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.5z2nh2b5s81n
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int|undefined} since timestamp in ms of the earliest order
     * @param {int|undefined} limit the maximum amount of orders to fetch
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name ellipx#fetchOpenOrders
     * @description fetches information on open orders made by the user
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.5z2nh2b5s81n
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int|undefined} since timestamp in ms of the earliest order
     * @param {int|undefined} limit the maximum amount of orders to fetch
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrder(order: any, market?: any): Order;
    /**
     * @method
     * @name ellipx#cancelOrder
     * @description Cancels an open order on the exchange
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.f1qu1pb1rebn
     * @param {string} id - The order ID to cancel (format: mktor-xxxxx-xxxx-xxxx-xxxx-xxxxxxxx)
     * @param {string} [symbol] - ellipx.cancelOrder does not use the symbol parameter
     * @param {object} [params] - Extra parameters specific to the exchange API
     * @returns {Promise<object>} A Promise that resolves to the canceled order info
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name ellipx#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name ellipx#fetchDepositAddress
     * @description fetches a crypto deposit address for a specific currency
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.k7qe5aricayh
     * @param {string} code unified currency code (e.g. "BTC", "ETH", "USDT")
     * @param {object} [params] extra parameters specific to the EllipX API endpoint
     * @returns {object} an address structure {
     *     'currency': string, // unified currency code
     *     'address': string, // the address for deposits
     *     'tag': string|undefined, // tag/memo for deposits if needed
     *     'network': object, // network object from currency info
     *     'info': object // raw response from exchange
     * }
     * @throws {ExchangeError} if currency does not support deposits
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name ellipx#fetchTradingFee
     * @description Fetches the current trading fees (maker and taker) applicable to the user.
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.kki5jay2c8it
     * @param {string} [symbol] Not used by EllipX as fees are not symbol-specific.
     * @param {object} [params] Extra parameters specific to the EllipX API endpoint.
     * @returns {Promise<object>} A promise resolving to a unified trading fee structure:
     * {
     *     'info': object,        // the raw response from the exchange
     *     'symbol': undefined,   // symbol is not used for this exchange
     *     'maker': number,       // maker fee rate in decimal form
     *     'taker': number,       // taker fee rate in decimal form
     *     'percentage': true,    // indicates fees are in percentage
     *     'tierBased': false,    // indicates fees do not vary by volume tiers
     * }
     */
    fetchTradingFee(symbol?: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @description Make a withdrawal request
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.zegupoa8g4t9
     * @param {string} code Currency code
     * @param {number} amount Amount to withdraw
     * @param {string} address Destination wallet address
     * @param {string} [tag] Additional tag/memo for currencies that require it
     * @param {object} params Extra parameters specific to the EllipX API endpoint (Crypto_Chain__, Unit__)
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransactionStatus(status: string): string;
    parseOrderStatus(status: any): string;
    parseAmount(amount: any): Str;
    toAmount(amount: number, precision: number): Dict;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
