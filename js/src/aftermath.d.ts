import Exchange from './abstract/aftermath.js';
import type { Account, Balances, Currencies, Currency, Market, Dict, int, Int, Strings, OHLCV, Order, OrderBook, OrderRequest, Str, Ticker, Trade, TradingFeeInterface, MarginModification, TransferEntry, Position, Transaction, OrderType, OrderSide, Num } from './base/types.js';
export default class aftermath extends Exchange {
    describe(): any;
    /**
     * @method
     * @name aftermath#fetchCurrencies
     * @see https://testnet.aftermath.finance/docs/#/CCXT/currencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    parseCurrency(rawCurrency: Dict): Currency;
    /**
     * @method
     * @name aftermath#fetchMarkets
     * @see https://testnet.aftermath.finance/docs/#/CCXT/markets
     * @description retrieves data on all markets for woo
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name aftermath#fetchTradingFee
     * @see https://testnet.aftermath.finance/docs/#/CCXT/markets
     * @description fetch the trading fees for a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    parseTradingFee(market?: Market): TradingFeeInterface;
    /**
     * @method
     * @name aftermath#fetchTicker
     * @see https://testnet.aftermath.finance/docs/#/CCXT/ticker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name aftermath#fetchOrderBook
     * @see https://testnet.aftermath.finance/docs/#/CCXT/orderbook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name aftermath#fetchTrades
     * @see https://testnet.aftermath.finance/docs/#/CCXT/trades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(rawTrade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name aftermath#fetchOHLCV
     * @see https://testnet.aftermath.finance/docs/#/CCXT/ohlcv
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] max=1000, max=100 when since is defined and is less than (now - (999 * (timeframe in ms)))
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name aftermath#fetchBalance
     * @see https://testnet.aftermath.finance/docs/#/CCXT/balance
     * @description query for balance and get the amount of funds available for trading or funds locked in positions
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] account object ID, required
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name aftermath#fetchAccounts
     * @see https://testnet.aftermath.finance/docs/#/CCXT/accounts
     * @description query for accounts owned by the walletAddress. An Account is needed for all trading methods.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Array} a list of [account structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#accounts}
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    parseAccount(account: Dict): Account;
    /**
     * @method
     * @name aftermath#fetchOpenOrders
     * @see https://testnet.aftermath.finance/docs/#/CCXT/my_pending_orders
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.accountNumber] account number to query orders for, required
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name aftermath#fetchPosition
     * @description fetch data on an open position
     * @see https://testnet.aftermath.finance/docs/#/CCXT/positions
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.accountNumber] account number to query positions for, required
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    /**
     * @method
     * @name aftermath#fetchPositions
     * @see https://testnet.aftermath.finance/docs/#/CCXT/positions
     * @description fetch all open positions
     * @param {string[]} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.accountNumber] account number to query positions for, required
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    parseCreateEditOrderArgs(id: Str, symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): {
        symbol: string;
        type: string;
        side: string;
        amount: number;
        price: number;
        params: {};
    };
    /**
     * @method
     * @name aftermath#createOrder
     * @description create a trade order
     * @see https://testnet.aftermath.finance/docs/#/CCXT/build_create_orders
     * @see https://testnet.aftermath.finance/docs/#/CCXT/submit_create_orders
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
     * @param {Account} [params.account] account id to use, required
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name aftermath#createOrders
     * @see https://testnet.aftermath.finance/docs/#/CCXT/build_create_orders
     * @see https://testnet.aftermath.finance/docs/#/CCXT/submit_create_orders
     * @description create a list of trade orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {Account} [params.account] account id to use, required
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name aftermath#cancelOrder
     * @description cancels an open order
     * @see https://testnet.aftermath.finance/docs/#/CCXT/build_cancel_orders
     * @see https://testnet.aftermath.finance/docs/#/CCXT/submit_cancel_orders
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name aftermath#cancelOrders
     * @see https://testnet.aftermath.finance/docs/#/CCXT/build_cancel_orders
     * @see https://testnet.aftermath.finance/docs/#/CCXT/submit_cancel_orders
     * @description cancel multiple orders
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {Account} [params.account] account to cancel orders for, required
     * @returns {Order[]} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    createAccount(symbol: string, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name aftermath#addMargin
     * @see https://testnet.aftermath.finance/docs/#/CCXT/build_allocate
     * @see https://testnet.aftermath.finance/docs/#/CCXT/submit_allocate
     * @description add margin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {Account} [params.account] account id to use, required
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name aftermath#reduceMargin
     * @see https://testnet.aftermath.finance/docs/#/CCXT/build_deallocate
     * @see https://testnet.aftermath.finance/docs/#/CCXT/submit_deallocate
     * @description remove margin from a position
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {Account} [params.account] account id to use, required
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name aftermath#transfer
     * @see https://testnet.aftermath.finance/docs/#/CCXT/build_deposit
     * @see https://testnet.aftermath.finance/docs/#/CCXT/submit_deposit
     * @description transfer currency internally between wallets on the same account
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    /**
     * @method
     * @name aftermath#withdraw
     * @see https://testnet.aftermath.finance/docs/#/CCXT/build_withdraw
     * @see https://testnet.aftermath.finance/docs/#/CCXT/submit_withdraw
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {Account} [params.account] account id to use, required
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name aftermath#setLeverage
     * @description set the level of leverage for a market
     * @see https://testnet.aftermath.finance/docs/#/CCXT/build_set_leverage
     * @see https://testnet.aftermath.finance/docs/#/CCXT/submit_set_leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {Account} [params.account] account id to use, required
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name aftermath#signTxEd25519
     * @description Helper to sign some transaction bytes and return a generic transaction execution request.
     * @param {object} [tx] transaction bytes and the signing digest for them
     * @returns {object} the input transaction bytes and the signed digest
     */
    signTxEd25519(tx: Dict): Dict;
    parseOrder(order: Dict, market?: Market): Order;
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
