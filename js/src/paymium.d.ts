import Exchange from './abstract/paymium.js';
import type { TransferEntry, Balances, Currency, Int, Market, OrderBook, OrderSide, OrderType, Str, Ticker, Trade, Num, Dict, Strings, int, DepositAddress } from './base/types.js';
/**
 * @class paymium
 * @augments Exchange
 */
export default class paymium extends Exchange {
    describe(): any;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name paymium#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://paymium.github.io/api-documentation/#tag/User/paths/~1user/get
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name paymium#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://paymium.github.io/api-documentation/#tag/Public-data/paths/~1data~1%7Bcurrency%7D~1depth/get
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name paymium#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://paymium.github.io/api-documentation/#tag/Public-data/paths/~1data~1%7Bcurrency%7D~1ticker/get
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name paymium#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://paymium.github.io/api-documentation/#tag/Public-data/paths/~1data~1%7Bcurrency%7D~1trades/get
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name paymium#createDepositAddress
     * @description create a currency deposit address
     * @see https://paymium.github.io/api-documentation/#tag/User/paths/~1user~1addresses/post
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    createDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name paymium#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://paymium.github.io/api-documentation/#tag/User/paths/~1user~1addresses~1%7Baddress%7D/get
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name paymium#fetchDepositAddresses
     * @description fetch deposit addresses for multiple currencies and chain types
     * @see https://paymium.github.io/api-documentation/#tag/User/paths/~1user~1addresses/get
     * @param {string[]|undefined} codes list of unified currency codes, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddresses(codes?: Strings, params?: {}): Promise<DepositAddress[]>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name paymium#createOrder
     * @description create a trade order
     * @see https://paymium.github.io/api-documentation/#tag/Order/paths/~1user~1orders/post
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<import("./base/types.js").Order>;
    /**
     * @method
     * @name paymium#cancelOrder
     * @description cancels an open order
     * @see https://paymium.github.io/api-documentation/#tag/Order/paths/~1user~1orders~1%7Buuid%7D/delete
     * @see https://paymium.github.io/api-documentation/#tag/Order/paths/~1user~1orders~1%7Buuid%7D~1cancel/delete
     * @param {string} id order id
     * @param {string} symbol not used by paymium cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<import("./base/types.js").Order>;
    /**
     * @method
     * @name paymium#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://paymium.github.io/api-documentation/#tag/Transfer/paths/~1user~1email_transfers/post
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseTransferStatus(status: Str): Str;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
