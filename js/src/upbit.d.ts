import Exchange from './abstract/upbit.js';
import type { Balances, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, Transaction, int, DepositAddress, OrderBooks, TradingFees } from './base/types.js';
/**
 * @class upbit
 * @augments Exchange
 */
export default class upbit extends Exchange {
    describe(): any;
    fetchCurrency(code: string, params?: {}): Promise<{
        info: any;
        id: string;
        code: string;
        name: string;
        active: boolean;
        fee: number;
        precision: any;
        limits: {
            withdraw: {
                min: number;
                max: number;
            };
        };
    }>;
    fetchCurrencyById(id: string, params?: {}): Promise<{
        info: any;
        id: string;
        code: string;
        name: string;
        active: boolean;
        fee: number;
        precision: any;
        limits: {
            withdraw: {
                min: number;
                max: number;
            };
        };
    }>;
    fetchMarket(symbol: string, params?: {}): Promise<import("./base/types.js").MarketInterface>;
    fetchMarketById(id: string, params?: {}): Promise<import("./base/types.js").MarketInterface>;
    /**
     * @method
     * @name upbit#fetchMarkets
     * @see https://docs.upbit.com/kr/reference/마켓-코드-조회
     * @see https://global-docs.upbit.com/reference/listing-market-list
     * @description retrieves data on all markets for upbit
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name upbit#fetchBalance
     * @see https://docs.upbit.com/kr/reference/전체-계좌-조회
     * @see https://global-docs.upbit.com/reference/overall-account-inquiry
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name upbit#fetchOrderBooks
     * @see https://docs.upbit.com/kr/reference/호가-정보-조회
     * @see https://global-docs.upbit.com/reference/order-book-list
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
     * @param {string[]|undefined} symbols list of unified market symbols, all symbols fetched if undefined, default is undefined
     * @param {int} [limit] not used by upbit fetchOrderBooks ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbol
     */
    fetchOrderBooks(symbols?: Strings, limit?: Int, params?: {}): Promise<OrderBooks>;
    /**
     * @method
     * @name upbit#fetchOrderBook
     * @see https://docs.upbit.com/kr/reference/호가-정보-조회
     * @see https://global-docs.upbit.com/reference/order-book-list
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name upbit#fetchTickers
     * @see https://docs.upbit.com/kr/reference/ticker현재가-정보
     * @see https://global-docs.upbit.com/reference/tickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name upbit#fetchTicker
     * @see https://docs.upbit.com/kr/reference/ticker현재가-정보
     * @see https://global-docs.upbit.com/reference/tickers
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name upbit#fetchTrades
     * @see https://docs.upbit.com/kr/reference/최근-체결-내역
     * @see https://global-docs.upbit.com/reference/today-trades-history
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name upbit#fetchTradingFee
     * @see https://docs.upbit.com/kr/reference/주문-가능-정보
     * @see https://global-docs.upbit.com/reference/available-order-information
     * @description fetch the trading fees for a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name upbit#fetchTradingFees
     * @description fetch the trading fees for markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [trading fee structure]{@link https://docs.ccxt.com/#/?id=trading-fee-structure}
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name upbit#fetchOHLCV
     * @see https://docs.upbit.com/kr/reference/분minute-캔들-1
     * @see https://global-docs.upbit.com/reference/minutes
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    calcOrderPrice(symbol: string, amount: number, price?: Num, params?: {}): string;
    /**
     * @method
     * @name upbit#createOrder
     * @description create a trade order
     * @see https://docs.upbit.com/kr/reference/주문하기
     * @see https://global-docs.upbit.com/reference/order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type supports 'market' and 'limit'. if params.ordType is set to best, a best-type order will be created regardless of the value of type.
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] for market buy and best buy orders, the quote quantity that can be used as an alternative for the amount
     * @param {string} [params.ordType] this field can be used to place a ‘best’ type order
     * @param {string} [params.timeInForce] 'IOC' or 'FOK'. only for limit or best type orders. this field is required when the order type is 'best'.
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name upbit#cancelOrder
     * @see https://docs.upbit.com/kr/reference/주문-취소
     * @see https://global-docs.upbit.com/reference/order-cancel
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol not used by upbit cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name upbit#editOrder
     * @see https://docs.upbit.com/kr/reference/취소-후-재주문
     * @see https://global-docs.upbit.com/reference/cancel-and-new
     * @description canceled existing order and create new order. It's only generated same side and symbol as the canceled order. it returns the data of the canceled order, except for `new_order_uuid` and `new_identifier`. to get the details of the new order, use `fetchOrder(new_order_uuid)`.
     * @param {string} id the uuid of the previous order you want to edit.
     * @param {string} symbol the symbol of the new order. it must be the same as the symbol of the previous order.
     * @param {string} type the type of the new order. only limit or market is accepted. if params.newOrdType is set to best, a best-type order will be created regardless of the value of type.
     * @param {string} side the side of the new order. it must be the same as the side of the previous order.
     * @param {number} amount the amount of the asset you want to buy or sell. It could be overridden by specifying the new_volume parameter in params.
     * @param {number} price the price of the asset you want to buy or sell. It could be overridden by specifying the new_price parameter in params.
     * @param {object} [params] extra parameters specific to the exchange API endpoint.
     * @param {string} [params.clientOrderId] to identify the previous order, either the id or this field is required in this method.
     * @param {float} [params.cost] for market buy and best buy orders, the quote quantity that can be used as an alternative for the amount.
     * @param {string} [params.newTimeInForce] 'IOC' or 'FOK'. only for limit or best type orders. this field is required when the order type is 'best'.
     * @param {string} [params.newClientOrderId] the order ID that the user can define.
     * @param {string} [params.newOrdType] this field only accepts limit, price, market, or best. You can refer to the Upbit developer documentation for details on how to use this field.
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name upbit#fetchDeposits
     * @see https://docs.upbit.com/kr/reference/입금-리스트-조회
     * @see https://global-docs.upbit.com/reference/deposit-list-inquiry
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
     * @name upbit#fetchDeposit
     * @description fetch information on a deposit
     * @see https://docs.upbit.com/kr/reference/개별-입금-조회
     * @see https://global-docs.upbit.com/reference/individual-deposit-inquiry
     * @param {string} id the unique id for the deposit
     * @param {string} [code] unified currency code of the currency deposited
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.txid] withdrawal transaction id, the id argument is reserved for uuid
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposit(id: string, code?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name upbit#fetchWithdrawals
     * @see https://docs.upbit.com/kr/reference/전체-출금-조회
     * @see https://global-docs.upbit.com/reference/withdrawal-list-inquiry
     * @description fetch all withdrawals made from an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name upbit#fetchWithdrawal
     * @description fetch data on a currency withdrawal via the withdrawal id
     * @see https://docs.upbit.com/kr/reference/개별-출금-조회
     * @see https://global-docs.upbit.com/reference/individual-withdrawal-inquiry
     * @param {string} id the unique id for the withdrawal
     * @param {string} [code] unified currency code of the currency withdrawn
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.txid] withdrawal transaction id, the id argument is reserved for uuid
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawal(id: string, code?: Str, params?: {}): Promise<Transaction>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name upbit#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.upbit.com/kr/reference/대기-주문-조회
     * @see https://global-docs.upbit.com/reference/open-order
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.state] default is 'wait', set to 'watch' for stop limit orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name upbit#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.upbit.com/kr/reference/종료-주문-조회
     * @see https://global-docs.upbit.com/reference/closed-order
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest order
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name upbit#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://docs.upbit.com/kr/reference/종료-주문-조회
     * @see https://global-docs.upbit.com/reference/closed-order
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] max number of orders to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest order
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name upbit#fetchOrder
     * @see https://docs.upbit.com/kr/reference/개별-주문-조회
     * @see https://global-docs.upbit.com/reference/individual-order-inquiry
     * @description fetches information on an order made by the user
     * @param {string} id order id
     * @param {string} symbol not used by upbit fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name upbit#fetchDepositAddresses
     * @see https://docs.upbit.com/kr/reference/전체-입금-주소-조회
     * @see https://global-docs.upbit.com/reference/general-deposit-address-inquiry
     * @description fetch deposit addresses for multiple currencies and chain types
     * @param {string[]|undefined} codes list of unified currency codes, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddresses(codes?: Strings, params?: {}): Promise<DepositAddress[]>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name upbit#fetchDepositAddress
     * @see https://docs.upbit.com/kr/reference/개별-입금-주소-조회
     * @see https://global-docs.upbit.com/reference/individual-deposit-address-inquiry
     * @description fetch the deposit address for a currency associated with this account
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.network deposit chain, can view all chains via this.publicGetWalletAssets, default is eth, unless the currency has a default chain within this.options['networks']
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name upbit#createDepositAddress
     * @see https://docs.upbit.com/kr/reference/입금-주소-생성-요청
     * @see https://global-docs.upbit.com/reference/deposit-address-generation
     * @description create a currency deposit address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    createDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name upbit#withdraw
     * @see https://docs.upbit.com/kr/reference/디지털자산-출금하기
     * @see https://global-docs.upbit.com/reference/withdrawal-digital-assets
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
