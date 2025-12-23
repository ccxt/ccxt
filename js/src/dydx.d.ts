import Exchange from './abstract/dydx.js';
import type { Int, Market, Dict, int, Trade, OHLCV, Balances, Str, FundingRateHistory, Order, OrderSide, OrderType, Strings, Num, Position, OrderBook, Currency, LedgerEntry, TransferEntry, Transaction, Account } from './base/types.js';
/**
 * @class dydx
 * @augments Exchange
 */
export default class dydx extends Exchange {
    describe(): any;
    /**
     * @method
     * @name dydx#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.dydx.xyz/indexer-client/http#get-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name dydx#fetchMarkets
     * @description retrieves data on all markets for hyperliquid
     * @see https://docs.dydx.xyz/indexer-client/http#get-perpetual-markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name dydx#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://developer.woox.io/api-reference/endpoint/public_data/marketTrades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name dydx#fetchOHLCV
     * @see https://docs.dydx.xyz/indexer-client/http#get-candles
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name dydx#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.dydx.xyz/indexer-client/http#get-historical-funding
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    handlePublicAddress(methodName: string, params: Dict): any[];
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): string;
    parseOrderType(type: Str): string;
    /**
     * @method
     * @name dydx#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.dydx.xyz/indexer-client/http#get-order
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name dydx#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.dydx.xyz/indexer-client/http#list-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name dydx#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.dydx.xyz/indexer-client/http#list-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name dydx#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.dydx.xyz/indexer-client/http#list-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name dydx#fetchPosition
     * @description fetch data on an open position
     * @see https://docs.dydx.xyz/indexer-client/http#list-positions
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    /**
     * @method
     * @name dydx#fetchPositions
     * @description fetch all open positions
     * @see https://docs.dydx.xyz/indexer-client/http#list-positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    hashMessage(message: any): any;
    signHash(hash: any, privateKey: any): {
        r: string;
        s: string;
        v: any;
    };
    signMessage(message: any, privateKey: any): {
        r: string;
        s: string;
        v: any;
    };
    signOnboardingAction(): object;
    signDydxTx(privateKey: string, message: any, memo: string, chainId: string, account: any, authenticators: any, fee?: any): string;
    retrieveCredentials(): any;
    fetchDydxAccount(): Promise<import("./base/types.js").Dictionary<any>>;
    pow(n: string, m: string): string;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any[];
    createOrderIdFromParts(address: string, subAccountNumber: number, clientOrderId: number, orderFlags: number, clobPairId: number): string;
    fetchLatestBlockHeight(params?: {}): Promise<int>;
    /**
     * @method
     * @name dydx#createOrder
     * @see https://docs.dydx.xyz/interaction/trading#place-an-order
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] "GTT", "IOC", or "PO"
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {float} [params.stopLossPrice] price for a stoploss order
     * @param {float} [params.takeProfitPrice] price for a takeprofit order
     * @param {string} [params.clientOrderId] a unique id for the order
     * @param {bool} [params.postOnly] true or false whether the order is post-only
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
     * @param {float} [params.goodTillBlock] expired block number for the order, required for market order and non limit GTT order, default value is latestBlockHeight + 20
     * @param {float} [params.goodTillBlockTimeInSeconds] expired time elapsed for the order, required for limit GTT order and conditional, default value is 30 days
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name dydx#cancelOrder
     * @description cancels an open order
     * @see https://docs.dydx.xyz/interaction/trading/#cancel-an-order
     * @param {string} id it should be the clientOrderId in this case
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id used when creating the order
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @param {float} [params.orderFlags] default is 64, orderFlags for the order, market order and non limit GTT order is 0, limit GTT order is 64 and conditional order is 32
     * @param {float} [params.goodTillBlock] expired block number for the order, required for market order and non limit GTT order (orderFlags = 0), default value is latestBlockHeight + 20
     * @param {float} [params.goodTillBlockTimeInSeconds] expired time elapsed for the order, required for limit GTT order and conditional (orderFlagss > 0), default value is 30 days
     * @param {int} [params.subAccountId] sub account id, default is 0
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name dydx#cancelOrders
     * @description cancel multiple orders
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] max length 10 e.g. ["my_id_1","my_id_2"], encode the double quotes. No space after comma
     * @param {int} [params.subAccountId] sub account id, default is 0
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name dydx#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.dydx.xyz/indexer-client/http#get-perpetual-market-orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseLedgerEntryType(type: any): string;
    /**
     * @method
     * @name dydx#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
     * @see https://docs.dydx.xyz/indexer-client/http#get-transfers
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    estimateTxFee(message: any, memo: string, account: any): Promise<any>;
    /**
     * @method
     * @name dydx#transfer
     * @description transfer currency internally between wallets on the same account
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from *main, subaccount*
     * @param {string} toAccount account to transfer to *subaccount, address*
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.vaultAddress] the vault address for order
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    /**
     * @method
     * @name dydx#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://docs.dydx.xyz/indexer-client/http#get-transfers
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name dydx#withdraw
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name dydx#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.dydx.xyz/indexer-client/http#get-transfers
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name dydx#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.dydx.xyz/indexer-client/http#get-transfers
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name dydx#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://docs.dydx.xyz/indexer-client/http#get-transfers
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchTransactionsHelper(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any[]>;
    /**
     * @method
     * @name dydx#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://docs.dydx.xyz/indexer-client/http#get-subaccounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    /**
     * @method
     * @name dydx#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.dydx.xyz/indexer-client/http#get-subaccount
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    nonce(): number;
    getWalletAddress(): string;
    sign(path: any, section?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    setSandboxMode(enable: boolean): void;
}
