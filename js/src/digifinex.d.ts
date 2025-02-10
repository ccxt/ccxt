import Exchange from './abstract/digifinex.js';
import type { FundingRateHistory, Int, OHLCV, Order, OrderSide, OrderType, OrderRequest, Trade, Balances, Str, Transaction, Ticker, OrderBook, Tickers, Strings, Market, Currency, TransferEntry, Num, MarginModification, TradingFeeInterface, Currencies, CrossBorrowRate, CrossBorrowRates, Dict, LeverageTier, LeverageTiers, int, LedgerEntry, FundingRate, DepositAddress, BorrowInterest } from './base/types.js';
/**
 * @class digifinex
 * @augments Exchange
 */
export default class digifinex extends Exchange {
    describe(): any;
    /**
     * @method
     * @name digifinex#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name digifinex#fetchMarkets
     * @description retrieves data on all markets for digifinex
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchMarketsV2(params?: {}): Promise<any[]>;
    fetchMarketsV1(params?: {}): Promise<any[]>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name digifinex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#spot-account-assets
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#margin-assets
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#accountbalance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name digifinex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-orderbook
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name digifinex#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#ticker-price
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name digifinex#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#ticker-price
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name digifinex#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<number>;
    /**
     * @method
     * @name digifinex#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
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
     * @name digifinex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-recent-trades
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#recenttrades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name digifinex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-candles-data
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#recentcandle
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name digifinex#createOrder
     * @description create a trade order
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#create-new-order
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#orderplace
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency, spot market orders use the quote currency, swap requires the number of contracts
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", or "PO"
     * @param {bool} [params.postOnly] true or false
     * @param {bool} [params.reduceOnly] true or false
     * @param {string} [params.marginMode] 'cross' or 'isolated', for spot margin trading
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name digifinex#createOrders
     * @description create a list of trade orders (all orders should be of the same symbol)
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#create-multiple-order
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#batchorder
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name digifinex#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#create-new-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name digifinex#cancelOrder
     * @description cancels an open order
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#cancel-order
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#cancelorder
     * @param {string} id order id
     * @param {string} symbol not used by digifinex cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<import("./base/types.js").Dictionary<any>>;
    parseCancelOrders(response: any): any[];
    /**
     * @method
     * @name digifinex#cancelOrders
     * @description cancel multiple orders
     * @param {string[]} ids order ids
     * @param {string} symbol not used by digifinex cancelOrders ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<any[]>;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name digifinex#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#current-active-orders
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#openorder
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name digifinex#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-all-orders-including-history-orders
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#historyorder
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name digifinex#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-order-status
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#orderinfo
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name digifinex#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#customer-39-s-trades
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#historytrade
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseLedgerEntryType(type: any): string;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    /**
     * @method
     * @name digifinex#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#spot-margin-otc-financial-logs
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#bills
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name digifinex#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    fetchTransactionsByType(type: any, code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name digifinex#fetchDeposits
     * @description fetch all deposits made to an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name digifinex#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransferStatus(status: Str): Str;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    /**
     * @method
     * @name digifinex#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#transfer-assets-among-accounts
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#accounttransfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount 'spot', 'swap', 'margin', 'OTC' - account to transfer from
     * @param {string} toAccount 'spot', 'swap', 'margin', 'OTC' - account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    /**
     * @method
     * @name digifinex#withdraw
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<BorrowInterest[]>;
    parseBorrowInterest(info: Dict, market?: Market): BorrowInterest;
    /**
     * @method
     * @name digifinex#fetchCrossBorrowRate
     * @description fetch the rate of interest to borrow a currency for margin trading
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#margin-assets
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [borrow rate structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#borrow-rate-structure}
     */
    fetchCrossBorrowRate(code: string, params?: {}): Promise<CrossBorrowRate>;
    /**
     * @method
     * @name digifinex#fetchCrossBorrowRates
     * @description fetch the borrow interest rates of all currencies
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#margin-assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
     */
    fetchCrossBorrowRates(params?: {}): Promise<CrossBorrowRates>;
    parseBorrowRate(info: any, currency?: Currency): {
        currency: string;
        rate: number;
        period: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    parseBorrowRates(info: any, codeKey: any): any;
    /**
     * @method
     * @name digifinex#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#currentfundingrate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name digifinex#fetchFundingInterval
     * @description fetch the current funding rate interval
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#currentfundingrate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingInterval(symbol: string, params?: {}): Promise<FundingRate>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    parseFundingInterval(interval: any): string;
    /**
     * @method
     * @name digifinex#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    /**
     * @method
     * @name digifinex#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#tradingfee
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    /**
     * @method
     * @name digifinex#fetchPositions
     * @description fetch all open positions
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#margin-positions
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    /**
     * @method
     * @name digifinex#fetchPosition
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#margin-positions
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#positions
     * @description fetch data on a single open contract trade position
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<import("./base/types.js").Position>;
    parsePosition(position: Dict, market?: Market): import("./base/types.js").Position;
    /**
     * @method
     * @name digifinex#setLeverage
     * @description set the level of leverage for a market
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#setleverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] either 'cross' or 'isolated', default is cross
     * @param {string} [params.side] either 'long' or 'short', required for isolated markets only
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name digifinex#fetchTransfers
     * @description fetch the transfer history, only transfers between spot and swap accounts are supported
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#transferrecord
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of  transfers to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    /**
     * @method
     * @name digifinex#fetchLeverageTiers
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#instruments
     * @description retrieve information on the maximum leverage, for different trade sizes
     * @param {string[]|undefined} symbols a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
     */
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<LeverageTiers>;
    /**
     * @method
     * @name digifinex#fetchMarketLeverageTiers
     * @description retrieve information on the maximum leverage, for different trade sizes for a single market
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#instrument
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
     */
    fetchMarketLeverageTiers(symbol: string, params?: {}): Promise<LeverageTier[]>;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    handleMarginModeAndParams(methodName: any, params?: {}, defaultValue?: any): any[];
    /**
     * @method
     * @name digifinex#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://docs.digifinex.com/en-ww/spot/v3/rest.html#get-currency-deposit-and-withdrawal-information
     * @param {string[]|undefined} codes not used by fetchDepositWithdrawFees ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<Dict>;
    parseDepositWithdrawFees(response: any, codes?: any, currencyIdKey?: any): Dict;
    /**
     * @method
     * @name digifinex#addMargin
     * @description add margin to a position
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#positionmargin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.side the position side: 'long' or 'short'
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name digifinex#reduceMargin
     * @description remove margin from a position
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#positionmargin
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.side the position side: 'long' or 'short'
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    modifyMarginHelper(symbol: string, amount: any, type: any, params?: {}): Promise<MarginModification>;
    parseMarginModification(data: Dict, market?: Market): MarginModification;
    /**
     * @method
     * @name digifinex#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#funding-fee
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding payment
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").FundingHistory[]>;
    parseIncome(income: any, market?: Market): {
        info: any;
        symbol: string;
        code: string;
        timestamp: number;
        datetime: string;
        id: any;
        amount: number;
    };
    /**
     * @method
     * @name digifinex#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://docs.digifinex.com/en-ww/swap/v2/rest.html#positionmode
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<any>;
    sign(path: any, api?: any[], method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(statusCode: int, statusText: string, url: string, method: string, responseHeaders: Dict, responseBody: any, response: any, requestHeaders: any, requestBody: any): any;
}
