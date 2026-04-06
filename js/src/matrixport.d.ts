import Exchange from './abstract/matrixport.js';
import type { Balances, Currencies, Currency, Dict, Int, int, Market, Num, Order, OrderSide, OrderType, Str, Ticker, Transaction, LedgerEntry, DepositAddress } from './base/types.js';
/**
 * @class matrixport
 * @augments Exchange
 * @description MatrixPort (bit.com) crypto financial services platform with RFQ-based trading and wallet APIs
 */
export default class matrixport extends Exchange {
    describe(): any;
    /**
     * @method
     * @name matrixport#fetchMarkets
     * @description retrieves data on all markets for matrixport
     * @see https://www.bit.com/docs/en-us/trade.html
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Market[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name matrixport#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://www.bit.com/docs/en-us/wallet.html
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name matrixport#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.bit.com/docs/en-us/trade.html
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    parseBalance(response: any): Balances;
    parseBalancePlusBalance(response: any): Balances;
    parseStakingBalance(response: any): Balances;
    /**
     * @method
     * @name matrixport#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.bit.com/docs/en-us/wallet.html
     * @see https://www.bit.com/docs/en-us/balanceplus.html#currency-list
     * @see https://www.bit.com/docs/en-us/fixed_staking.html#order-list
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] the type of balance to fetch: 'wallet' (default), 'savings' for Balance+ flexible savings, or 'staking' for fixed staking balances
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name matrixport#createOrder
     * @description create a trade order via RFQ (Request for Quote)
     * @see https://www.bit.com/docs/en-us/trade.html
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type must be 'market' (RFQ-based exchange)
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] not used for RFQ orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: any): string;
    /**
     * @method
     * @name matrixport#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://www.bit.com/docs/en-us/trade.html
     * @param {string} id the order id
     * @param {string} symbol not used by matrixport fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name matrixport#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://www.bit.com/docs/en-us/trade.html
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name matrixport#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.bit.com/docs/en-us/wallet.html
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: Dict, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name matrixport#withdraw
     * @description make a withdrawal
     * @see https://www.bit.com/docs/en-us/wallet.html
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} [tag] a memo/tag for the withdrawal
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): Str;
    /**
     * @method
     * @name matrixport#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://www.bit.com/docs/en-us/wallet.html
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name matrixport#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://www.bit.com/docs/en-us/wallet.html
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name matrixport#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://www.bit.com/docs/en-us/wallet.html
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-structure}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
