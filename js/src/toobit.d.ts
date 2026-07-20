import Exchange from './abstract/toobit.js';
import type { Balances, Currencies, Currency, DepositAddress, Dict, FundingRate, FundingRateHistory, FundingRates, Int, LedgerEntry, Leverage, Market, MarketInterface, NullableDict, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, TradingFees, Transaction, TransferEntry, int } from './base/types.js';
/**
 * @class toobit
 * @augments Exchange
 */
export default class toobit extends Exchange {
    describe(): any;
    /**
     * @method
     * @name toobit#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#test-connectivity
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    fetchStatus(params?: {}): Promise<{
        status: string;
        updated: any;
        eta: any;
        url: any;
        info: any;
    }>;
    /**
     * @method
     * @name toobit#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://api-docs.toobit.com/api/spot-market-data.html#check-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name toobit#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api-docs.toobit.com/api/spot-market-data.html#exchange-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    parseCurrency(rawCurrency: Dict): Currency;
    /**
     * @method
     * @name toobit#fetchMarkets
     * @description retrieves data on all markets for toobit
     * @see https://api-docs.toobit.com/api/spot-market-data.html#exchange-information
     * @see https://api-docs.toobit.com/api/usdt-m-market-data.html#exchange-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<MarketInterface[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name toobit#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api-docs.toobit.com/api/spot-market-data.html#order-book
     * @see https://api-docs.toobit.com/api/usdt-m-market-data.html#order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name toobit#fetchTrades
     * @description get a list of the most recent trades for a particular symbol
     * @see https://api-docs.toobit.com/api/spot-market-data.html#recent-trades-list
     * @see https://api-docs.toobit.com/api/usdt-m-market-data.html#recent-trades-list
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name toobit#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api-docs.toobit.com/api/spot-market-data.html#kline-candlestick-data
     * @see https://api-docs.toobit.com/api/usdt-m-market-data.html#kline-candlestick-data
     * @see https://api-docs.toobit.com/api/usdt-m-market-data.html#index-price-kline-candlestick-data
     * @see https://api-docs.toobit.com/api/usdt-m-market-data.html#mark-price-kline-candlestick-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name toobit#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://api-docs.toobit.com/api/spot-market-data.html#_24hr-ticker-price-change-statistics
     * @see https://api-docs.toobit.com/api/usdt-m-market-data.html#_24hr-ticker-price-change-statistics
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name toobit#fetchLastPrices
     * @description fetches the last price for multiple markets
     * @see https://api-docs.toobit.com/api/spot-market-data.html#symbol-price-ticker
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#symbol-price-ticker
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the last prices
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of lastprices structures
     */
    fetchLastPrices(symbols?: Strings, params?: {}): Promise<import("./base/types.js").LastPrices>;
    parseLastPrice(entry: any, market?: Market): {
        symbol: string;
        timestamp: any;
        datetime: any;
        price: number;
        side: any;
        info: any;
    };
    /**
     * @method
     * @name toobit#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://api-docs.toobit.com/api/spot-market-data.html#symbol-order-book-ticker
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#symbol-order-book-ticker
     * @param {string[]} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseBidsAsksCustom(tickers: any, symbols?: Strings, params?: {}): Tickers;
    parseBidAskCustom(ticker: any): {
        timestamp: string;
        symbol: string;
        bid: number;
        bidVolume: number;
        ask: number;
        askVolume: number;
        info: any;
    };
    /**
     * @method
     * @name toobit#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://api-docs.toobit.com/api/usdt-m-market-data.html#funding-rate
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rates structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexe by market symbols
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    /**
     * @method
     * @name toobit#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://api-docs.toobit.com/api/usdt-m-market-data.html#get-funding-rate-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseFundingRateHistory(contract: any, market?: Market): {
        info: any;
        symbol: string;
        fundingRate: number;
        timestamp: number;
        datetime: string;
    };
    /**
     * @method
     * @name toobit#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#account-information-user-data
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#futures-account-balance-user-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name toobit#createOrder
     * @description create a trade order
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#new-order-trade
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#new-order-trade
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): {}[];
    createContractOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): {}[];
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): string;
    parseOrderType(status: any): string;
    /**
     * @method
     * @name toobit#cancelOrder
     * @description cancels an open order
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#cancel-order-trade
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#cancel-order-trade
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name toobit#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#cancel-all-open-orders-trade
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#cancel-orders-trade
     * @param {string} symbol unified symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name toobit#cancelOrders
     * @description cancel multiple orders
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#cancel-multiple-orders-trade
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#cancel-multiple-orders-trade
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name toobit#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#query-order-user-data
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#query-order-user-data
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name toobit#fetchOpenOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#current-open-orders-user-data
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#query-current-open-order-user-data
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name toobit#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#all-orders-user-data
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name toobit#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#query-history-orders-user-data
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name toobit#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#account-trade-list-user-data
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#account-trade-list-user-data
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name toobit#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#account-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount 'spot', 'swap'
     * @param {string} toAccount 'spot', 'swap'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    /**
     * @method
     * @name toobit#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#get-account-transaction-history-list-user-data
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#get-futures-account-transaction-history-list-user-data
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseLedgerType(type: any): string;
    /**
     * @method
     * @name toobit#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#user-trade-fee-rate-user-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseTradingFee(data: any, market?: Market): {
        info: any;
        symbol: string;
        maker: number;
        taker: number;
        percentage: any;
        tierBased: any;
    };
    /**
     * @method
     * @name toobit#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://api-docs.toobit.com/api/spot-wallet.html#deposit-history-user-data
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposit structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name toobit#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://api-docs.toobit.com/api/spot-wallet.html#withdrawal-records-user-data
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDepositsOrWithdrawalsHelper(type: any, code: any, since: any, limit: any, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): string;
    /**
     * @method
     * @name toobit#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://api-docs.toobit.com/api/spot-wallet.html#deposit-address-user-data
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name toobit#withdraw
     * @description make a withdrawal
     * @see https://api-docs.toobit.com/api/spot-wallet.html#withdraw-user-data
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag a memo for the transaction
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.addressType] recipient identifier type, one of BLOCK_CHAIN, PHONE_NUMBER, EMAIL, or UID
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name toobit#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#change-margin-type-trade
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name toobit#setLeverage
     * @description set the level of leverage for a market
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#change-initial-leverage-trade
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name toobit#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#get-the-leverage-multiple-and-position-mode-user-data
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    /**
     * @method
     * @name toobit#fetchPositions
     * @description fetch all open positions
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#query-position-user-data
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    sign(path: any, api?: any, method?: string, params?: {}, headers?: NullableDict, body?: Str): {
        url: string;
        method: string;
        body: string;
        headers: Dict;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
