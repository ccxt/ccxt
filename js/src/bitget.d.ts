import Exchange from './abstract/bitget.js';
import type { Int, OrderSide, OrderType, Trade, OHLCV, Order, FundingRateHistory, OrderRequest, FundingHistory, Balances, Str, Transaction, Ticker, OrderBook, Tickers, Market, Strings, Currency, Position, Liquidation, TransferEntry, Leverage, MarginMode, Num, MarginModification, TradingFeeInterface, Currencies, TradingFees, Conversion, CrossBorrowRate, IsolatedBorrowRate, Dict, LeverageTier, int, LedgerEntry, FundingRate, DepositAddress, LongShortRatio, BorrowInterest, FundingRates } from './base/types.js';
/**
 * @class bitget
 * @augments Exchange
 */
export default class bitget extends Exchange {
    describe(): any;
    setSandboxMode(enabled: any): void;
    convertSymbolForSandbox(symbol: any): any;
    handleProductTypeAndParams(market?: any, params?: {}): {}[];
    /**
     * @method
     * @name bitget#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://www.bitget.com/api-doc/common/public/Get-Server-Time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<number>;
    /**
     * @method
     * @name bitget#fetchMarkets
     * @description retrieves data on all markets for bitget
     * @see https://www.bitget.com/api-doc/spot/market/Get-Symbols
     * @see https://www.bitget.com/api-doc/contract/market/Get-All-Symbols-Contracts
     * @see https://www.bitget.com/api-doc/margin/common/support-currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name bitget#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://www.bitget.com/api-doc/spot/market/Get-Coin-List
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name bitget#fetchMarketLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
     * @see https://www.bitget.com/api-doc/contract/position/Get-Query-Position-Lever
     * @see https://www.bitget.com/api-doc/margin/cross/account/Cross-Tier-Data
     * @see https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Tier-Data
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] for spot margin 'cross' or 'isolated', default is 'isolated'
     * @param {string} [params.code] required for cross spot margin
     * @param {string} [params.productType] *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
     */
    fetchMarketLeverageTiers(symbol: string, params?: {}): Promise<LeverageTier[]>;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    /**
     * @method
     * @name bitget#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://www.bitget.com/api-doc/spot/account/Get-Deposit-Record
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in milliseconds
     * @param {string} [params.idLessThan] return records with id less than the provided value
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name bitget#withdraw
     * @description make a withdrawal
     * @see https://www.bitget.com/api-doc/spot/account/Wallet-Withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.chain] the blockchain network the withdrawal is taking place on
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name bitget#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://www.bitget.com/api-doc/spot/account/Get-Withdraw-Record
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in milliseconds
     * @param {string} [params.idLessThan] return records with id less than the provided value
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): string;
    /**
     * @method
     * @name bitget#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.bitget.com/api-doc/spot/account/Get-Deposit-Address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name bitget#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.bitget.com/api-doc/spot/market/Get-Orderbook
     * @see https://www.bitget.com/api-doc/contract/market/Get-Merge-Depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bitget#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.bitget.com/api-doc/spot/market/Get-Tickers
     * @see https://www.bitget.com/api-doc/contract/market/Get-Ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name bitget#fetchMarkPrice
     * @description fetches the mark price for a specific market
     * @see https://www.bitget.com/api-doc/contract/market/Get-Symbol-Price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchMarkPrice(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name bitget#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://www.bitget.com/api-doc/spot/market/Get-Tickers
     * @see https://www.bitget.com/api-doc/contract/market/Get-All-Symbol-Ticker
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] *contract only* 'linear', 'inverse'
     * @param {string} [params.productType] *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bitget#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.bitget.com/api-doc/spot/market/Get-Recent-Trades
     * @see https://www.bitget.com/api-doc/spot/market/Get-Market-Trades
     * @see https://www.bitget.com/api-doc/contract/market/Get-Recent-Fills
     * @see https://www.bitget.com/api-doc/contract/market/Get-Fills-History
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] *only applies to publicSpotGetV2SpotMarketFillsHistory and publicMixGetV2MixMarketFillsHistory* the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] *only applies to publicSpotGetV2SpotMarketFillsHistory and publicMixGetV2MixMarketFillsHistory* default false, when true will automatically paginate by calling this endpoint multiple times
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitget#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://www.bitget.com/api-doc/common/public/Get-Trade-Rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'isolated' or 'cross', for finding the fee rate of spot margin trading pairs
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name bitget#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://www.bitget.com/api-doc/spot/market/Get-Symbols
     * @see https://www.bitget.com/api-doc/contract/market/Get-All-Symbols-Contracts
     * @see https://www.bitget.com/api-doc/margin/common/support-currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.productType] *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @param {boolean} [params.margin] set to true for spot margin
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
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
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name bitget#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.bitget.com/api-doc/spot/market/Get-Candle-Data
     * @see https://www.bitget.com/api-doc/spot/market/Get-History-Candle-Data
     * @see https://www.bitget.com/api-doc/contract/market/Get-Candle-Data
     * @see https://www.bitget.com/api-doc/contract/market/Get-History-Candle-Data
     * @see https://www.bitget.com/api-doc/contract/market/Get-History-Index-Candle-Data
     * @see https://www.bitget.com/api-doc/contract/market/Get-History-Mark-Candle-Data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.price] *swap only* "mark" (to fetch mark price candles) or "index" (to fetch index price candles)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name bitget#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.bitget.com/api-doc/spot/account/Get-Account-Assets
     * @see https://www.bitget.com/api-doc/contract/account/Get-Account-List
     * @see https://www.bitget.com/api-doc/margin/cross/account/Get-Cross-Assets
     * @see https://www.bitget.com/api-doc/margin/isolated/account/Get-Isolated-Assets
     * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-cross-assets
     * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-isolated-assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.productType] *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(balance: any): Balances;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name bitget#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://www.bitget.com/api-doc/spot/trade/Place-Order
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Cross-Place-Order
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Place-Order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitget#createOrder
     * @description create a trade order
     * @see https://www.bitget.com/api-doc/spot/trade/Place-Order
     * @see https://www.bitget.com/api-doc/spot/plan/Place-Plan-Order
     * @see https://www.bitget.com/api-doc/contract/trade/Place-Order
     * @see https://www.bitget.com/api-doc/contract/plan/Place-Tpsl-Order
     * @see https://www.bitget.com/api-doc/contract/plan/Place-Plan-Order
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Cross-Place-Order
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Place-Order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] *spot only* how much you want to trade in units of the quote currency, for market buy orders only
     * @param {float} [params.triggerPrice] *swap only* The price at which a trigger order is triggered at
     * @param {float} [params.stopLossPrice] *swap only* The price at which a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] *swap only* The price at which a take profit order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] *swap only* take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] *swap only* stop loss trigger price
     * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", or "PO"
     * @param {string} [params.marginMode] 'isolated' or 'cross' for spot margin trading
     * @param {string} [params.loanType] *spot margin only* 'normal', 'autoLoan', 'autoRepay', or 'autoLoanAndRepay' default is 'normal'
     * @param {string} [params.holdSide] *contract stopLossPrice, takeProfitPrice only* Two-way position: ('long' or 'short'), one-way position: ('buy' or 'sell')
     * @param {float} [params.stopLoss.price] *swap only* the execution price for a stop loss attached to a trigger order
     * @param {float} [params.takeProfit.price] *swap only* the execution price for a take profit attached to a trigger order
     * @param {string} [params.stopLoss.type] *swap only* the type for a stop loss attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price'
     * @param {string} [params.takeProfit.type] *swap only* the type for a take profit attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price'
     * @param {string} [params.trailingPercent] *swap and future only* the percent to trail away from the current market price, rate can not be greater than 10
     * @param {string} [params.trailingTriggerPrice] *swap and future only* the price to trigger a trailing stop order, default uses the price argument
     * @param {string} [params.triggerType] *swap and future only* 'fill_price', 'mark_price' or 'index_price'
     * @param {boolean} [params.oneWayMode] *swap and future only* required to set this to true in one_way_mode and you can leave this as undefined in hedge_mode, can adjust the mode using the setPositionMode() method
     * @param {bool} [params.hedged] *swap and future only* true for hedged mode, false for one way mode, default is false
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name bitget#createOrders
     * @description create a list of trade orders (all orders should be of the same symbol)
     * @see https://www.bitget.com/api-doc/spot/trade/Batch-Place-Orders
     * @see https://www.bitget.com/api-doc/contract/trade/Batch-Order
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Batch-Order
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Cross-Batch-Order
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the api endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitget#editOrder
     * @description edit a trade order
     * @see https://www.bitget.com/api-doc/spot/plan/Modify-Plan-Order
     * @see https://www.bitget.com/api-doc/contract/trade/Modify-Order
     * @see https://www.bitget.com/api-doc/contract/plan/Modify-Tpsl-Order
     * @see https://www.bitget.com/api-doc/contract/plan/Modify-Plan-Order
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at
     * @param {float} [params.stopLossPrice] *swap only* The price at which a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] *swap only* The price at which a take profit order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] *swap only* take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] *swap only* stop loss trigger price
     * @param {float} [params.stopLoss.price] *swap only* the execution price for a stop loss attached to a trigger order
     * @param {float} [params.takeProfit.price] *swap only* the execution price for a take profit attached to a trigger order
     * @param {string} [params.stopLoss.type] *swap only* the type for a stop loss attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price'
     * @param {string} [params.takeProfit.type] *swap only* the type for a take profit attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price'
     * @param {string} [params.trailingPercent] *swap and future only* the percent to trail away from the current market price, rate can not be greater than 10
     * @param {string} [params.trailingTriggerPrice] *swap and future only* the price to trigger a trailing stop order, default uses the price argument
     * @param {string} [params.newTriggerType] *swap and future only* 'fill_price', 'mark_price' or 'index_price'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitget#cancelOrder
     * @description cancels an open order
     * @see https://www.bitget.com/api-doc/spot/trade/Cancel-Order
     * @see https://www.bitget.com/api-doc/spot/plan/Cancel-Plan-Order
     * @see https://www.bitget.com/api-doc/contract/trade/Cancel-Order
     * @see https://www.bitget.com/api-doc/contract/plan/Cancel-Plan-Order
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Cross-Cancel-Order
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Cancel-Order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'isolated' or 'cross' for spot margin trading
     * @param {boolean} [params.trigger] set to true for canceling trigger orders
     * @param {string} [params.planType] *swap only* either profit_plan, loss_plan, normal_plan, pos_profit, pos_loss, moving_plan or track_plan
     * @param {boolean} [params.trailing] set to true if you want to cancel a trailing order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitget#cancelOrders
     * @description cancel multiple orders
     * @see https://www.bitget.com/api-doc/spot/trade/Batch-Cancel-Orders
     * @see https://www.bitget.com/api-doc/contract/trade/Batch-Cancel-Orders
     * @see https://www.bitget.com/api-doc/contract/plan/Cancel-Plan-Order
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Cross-Batch-Cancel-Order
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Batch-Cancel-Orders
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'isolated' or 'cross' for spot margin trading
     * @param {boolean} [params.trigger] *contract only* set to true for canceling trigger orders
     * @returns {object} an array of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitget#cancelAllOrders
     * @description cancel all open orders
     * @see https://www.bitget.com/api-doc/spot/trade/Cancel-Symbol-Orders
     * @see https://www.bitget.com/api-doc/spot/plan/Batch-Cancel-Plan-Order
     * @see https://www.bitget.com/api-doc/contract/trade/Batch-Cancel-Orders
     * @see https://bitgetlimited.github.io/apidoc/en/margin/#isolated-batch-cancel-orders
     * @see https://bitgetlimited.github.io/apidoc/en/margin/#cross-batch-cancel-order
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'isolated' or 'cross' for spot margin trading
     * @param {boolean} [params.trigger] *contract only* set to true for canceling trigger orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitget#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://www.bitget.com/api-doc/spot/trade/Get-Order-Info
     * @see https://www.bitget.com/api-doc/contract/trade/Get-Order-Details
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitget#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://www.bitget.com/api-doc/spot/trade/Get-Unfilled-Orders
     * @see https://www.bitget.com/api-doc/spot/plan/Get-Current-Plan-Order
     * @see https://www.bitget.com/api-doc/contract/trade/Get-Orders-Pending
     * @see https://www.bitget.com/api-doc/contract/plan/get-orders-plan-pending
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Open-Orders
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Open-Orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {string} [params.planType] *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan'
     * @param {boolean} [params.trigger] set to true for fetching trigger orders
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.isPlan] *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan'
     * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitget#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://www.bitget.com/api-doc/spot/trade/Get-History-Orders
     * @see https://www.bitget.com/api-doc/spot/plan/Get-History-Plan-Order
     * @see https://www.bitget.com/api-doc/contract/trade/Get-Orders-History
     * @see https://www.bitget.com/api-doc/contract/plan/orders-plan-history
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-History
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Order-History
     * @param {string} symbol unified market symbol of the closed orders
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the max number of closed orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.isPlan] *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan'
     * @param {string} [params.productType] *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitget#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://www.bitget.com/api-doc/spot/trade/Get-History-Orders
     * @see https://www.bitget.com/api-doc/spot/plan/Get-History-Plan-Order
     * @see https://www.bitget.com/api-doc/contract/trade/Get-Orders-History
     * @see https://www.bitget.com/api-doc/contract/plan/orders-plan-history
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-History
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Order-History
     * @param {string} symbol unified market symbol of the canceled orders
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the max number of canceled orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.isPlan] *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan'
     * @param {string} [params.productType] *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitget#fetchCanceledAndClosedOrders
     * @see https://www.bitget.com/api-doc/spot/trade/Get-History-Orders
     * @see https://www.bitget.com/api-doc/spot/plan/Get-History-Plan-Order
     * @see https://www.bitget.com/api-doc/contract/trade/Get-Orders-History
     * @see https://www.bitget.com/api-doc/contract/plan/orders-plan-history
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-History
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Order-History
     * @description fetches information on multiple canceled and closed orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitget#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://www.bitget.com/api-doc/spot/account/Get-Account-Bills
     * @see https://www.bitget.com/api-doc/contract/account/Get-Account-Bill
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @param {string} [params.symbol] *contract only* unified market symbol
     * @param {string} [params.productType] *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseLedgerType(type: any): string;
    /**
     * @method
     * @name bitget#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://www.bitget.com/api-doc/spot/trade/Get-Fills
     * @see https://www.bitget.com/api-doc/contract/trade/Get-Order-Fills
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-Fills
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Transaction-Details
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitget#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://www.bitget.com/api-doc/contract/position/get-single-position
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    /**
     * @method
     * @name bitget#fetchPositions
     * @description fetch all open positions
     * @see https://www.bitget.com/api-doc/contract/position/get-all-position
     * @see https://www.bitget.com/api-doc/contract/position/Get-History-Position
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginCoin] the settle currency of the positions, needs to match the productType
     * @param {string} [params.productType] 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.useHistoryEndpoint] default false, when true  will use the historic endpoint to fetch positions
     * @param {string} [params.method] either (default) 'privateMixGetV2MixPositionAllPosition' or 'privateMixGetV2MixPositionHistoryPosition'
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name bitget#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://www.bitget.com/api-doc/contract/market/Get-History-Funding-Rate
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of funding rate structures to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    /**
     * @method
     * @name bitget#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://www.bitget.com/api-doc/contract/market/Get-Current-Funding-Rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name bitget#fetchFundingRates
     * @description fetch the current funding rates for all markets
     * @see https://www.bitget.com/api-doc/contract/market/Get-All-Symbol-Ticker
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] *contract only* 'linear', 'inverse'
     * @param {string} [params.productType] *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @returns {object} a dictionary of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexed by market symbols
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    /**
     * @method
     * @name bitget#fetchFundingHistory
     * @description fetch the funding history
     * @see https://www.bitget.com/api-doc/contract/account/Get-Account-Bill
     * @param {string} symbol unified market symbol
     * @param {int} [since] the starting timestamp in milliseconds
     * @param {int} [limit] the number of entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch funding history for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding history structures]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    parseFundingHistory(contract: any, market?: Market): {
        info: any;
        symbol: string;
        timestamp: number;
        datetime: string;
        code: string;
        amount: number;
        id: string;
    };
    parseFundingHistories(contracts: any, market?: any, since?: Int, limit?: Int): FundingHistory[];
    modifyMarginHelper(symbol: string, amount: any, type: any, params?: {}): Promise<MarginModification>;
    parseMarginModification(data: Dict, market?: Market): MarginModification;
    /**
     * @method
     * @name bitget#reduceMargin
     * @description remove margin from a position
     * @see https://www.bitget.com/api-doc/contract/account/Change-Margin
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name bitget#addMargin
     * @description add margin
     * @see https://www.bitget.com/api-doc/contract/account/Change-Margin
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name bitget#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://www.bitget.com/api-doc/contract/account/Get-Single-Account
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    /**
     * @method
     * @name bitget#setLeverage
     * @description set the level of leverage for a market
     * @see https://www.bitget.com/api-doc/contract/account/Change-Leverage
     * @param {int} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.holdSide] *isolated only* position direction, 'long' or 'short'
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name bitget#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://www.bitget.com/api-doc/contract/account/Change-Margin-Mode
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name bitget#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://www.bitget.com/api-doc/contract/account/Change-Hold-Mode
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol not used by bitget setPositionMode ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.productType] required if symbol is undefined: 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @returns {object} response from the exchange
     */
    setPositionMode(hedged: boolean, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name bitget#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @see https://www.bitget.com/api-doc/contract/market/Get-Open-Interest
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    /**
     * @method
     * @name bitget#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://www.bitget.com/api-doc/spot/account/Get-Account-TransferRecords
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    /**
     * @method
     * @name bitget#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://www.bitget.com/api-doc/spot/account/Wallet-Transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.symbol] unified CCXT market symbol, required when transferring to or from an account type that is a leveraged position-by-position account
     * @param {string} [params.clientOid] custom id
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseTransferStatus(status: Str): Str;
    parseDepositWithdrawFee(fee: any, currency?: Currency): Dict;
    /**
     * @method
     * @name bitget#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://www.bitget.com/api-doc/spot/market/Get-Coin-List
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name bitget#borrowCrossMargin
     * @description create a loan to borrow margin
     * @see https://www.bitget.com/api-doc/margin/cross/account/Cross-Borrow
     * @param {string} code unified currency code of the currency to borrow
     * @param {string} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    borrowCrossMargin(code: string, amount: number, params?: {}): Promise<{
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: any;
        datetime: any;
        info: any;
    }>;
    /**
     * @method
     * @name bitget#borrowIsolatedMargin
     * @description create a loan to borrow margin
     * @see https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Borrow
     * @param {string} symbol unified market symbol
     * @param {string} code unified currency code of the currency to borrow
     * @param {string} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    borrowIsolatedMargin(symbol: string, code: string, amount: number, params?: {}): Promise<{
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: any;
        datetime: any;
        info: any;
    }>;
    /**
     * @method
     * @name bitget#repayIsolatedMargin
     * @description repay borrowed margin and interest
     * @see https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Repay
     * @param {string} symbol unified market symbol
     * @param {string} code unified currency code of the currency to repay
     * @param {string} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    repayIsolatedMargin(symbol: string, code: string, amount: any, params?: {}): Promise<{
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: any;
        datetime: any;
        info: any;
    }>;
    /**
     * @method
     * @name bitget#repayCrossMargin
     * @description repay borrowed margin and interest
     * @see https://www.bitget.com/api-doc/margin/cross/account/Cross-Repay
     * @param {string} code unified currency code of the currency to repay
     * @param {string} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    repayCrossMargin(code: string, amount: any, params?: {}): Promise<{
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: any;
        datetime: any;
        info: any;
    }>;
    parseMarginLoan(info: any, currency?: Currency, market?: Market): {
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: any;
        datetime: any;
        info: any;
    };
    /**
     * @method
     * @name bitget#fetchMyLiquidations
     * @description retrieves the users liquidated positions
     * @see https://www.bitget.com/api-doc/margin/cross/record/Get-Cross-Liquidation-Records
     * @see https://www.bitget.com/api-doc/margin/isolated/record/Get-Isolated-Liquidation-Records
     * @param {string} [symbol] unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the bitget api endpoint
     * @param {int} [params.until] timestamp in ms of the latest liquidation
     * @param {string} [params.marginMode] 'cross' or 'isolated' default value is 'cross'
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
     */
    fetchMyLiquidations(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): Liquidation;
    /**
     * @method
     * @name bitget#fetchIsolatedBorrowRate
     * @description fetch the rate of interest to borrow a currency for margin trading
     * @see https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Margin-Interest-Rate-And-Max-Borrowable-Amount
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [isolated borrow rate structure]{@link https://docs.ccxt.com/#/?id=isolated-borrow-rate-structure}
     */
    fetchIsolatedBorrowRate(symbol: string, params?: {}): Promise<IsolatedBorrowRate>;
    parseIsolatedBorrowRate(info: Dict, market?: Market): IsolatedBorrowRate;
    /**
     * @method
     * @name bitget#fetchCrossBorrowRate
     * @description fetch the rate of interest to borrow a currency for margin trading
     * @see https://www.bitget.com/api-doc/margin/cross/account/Get-Cross-Margin-Interest-Rate-And-Borrowable
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.symbol] required for isolated margin
     * @returns {object} a [borrow rate structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#borrow-rate-structure}
     */
    fetchCrossBorrowRate(code: string, params?: {}): Promise<CrossBorrowRate>;
    parseBorrowRate(info: any, currency?: Currency): {
        currency: string;
        rate: number;
        period: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    /**
     * @method
     * @name bitget#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://www.bitget.com/api-doc/margin/cross/record/Get-Cross-Interest-Records
     * @see https://www.bitget.com/api-doc/margin/isolated/record/Get-Isolated-Interest-Records
     * @param {string} [code] unified currency code
     * @param {string} [symbol] unified market symbol when fetching interest in isolated markets
     * @param {int} [since] the earliest time in ms to fetch borrow interest for
     * @param {int} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
     */
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<BorrowInterest[]>;
    parseBorrowInterest(info: Dict, market?: Market): BorrowInterest;
    /**
     * @method
     * @name bitget#closePosition
     * @description closes an open position for a market
     * @see https://www.bitget.com/api-doc/contract/trade/Flash-Close-Position
     * @param {string} symbol unified CCXT market symbol
     * @param {string} [side] one-way mode: 'buy' or 'sell', hedge-mode: 'long' or 'short'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitget#closeAllPositions
     * @description closes all open positions for a market type
     * @see https://www.bitget.com/api-doc/contract/trade/Flash-Close-Position
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.productType] 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @returns {object[]} A list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    closeAllPositions(params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name bitget#fetchMarginMode
     * @description fetches the margin mode of a trading pair
     * @see https://www.bitget.com/api-doc/contract/account/Get-Single-Account
     * @param {string} symbol unified symbol of the market to fetch the margin mode for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/#/?id=margin-mode-structure}
     */
    fetchMarginMode(symbol: string, params?: {}): Promise<MarginMode>;
    parseMarginMode(marginMode: Dict, market?: any): MarginMode;
    /**
     * @method
     * @name bitget#fetchPositionsHistory
     * @description fetches historical positions
     * @see https://www.bitget.com/api-doc/contract/position/Get-History-Position
     * @param {string[]} [symbols] unified contract symbols
     * @param {int} [since] timestamp in ms of the earliest position to fetch, default=3 months ago, max range for params["until"] - since is 3 months
     * @param {int} [limit] the maximum amount of records to fetch, default=20, max=100
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @param {int} [params.until] timestamp in ms of the latest position to fetch, max range for params["until"] - since is 3 months
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.productType] USDT-FUTURES (default), COIN-FUTURES, USDC-FUTURES, SUSDT-FUTURES, SCOIN-FUTURES, or SUSDC-FUTURES
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositionsHistory(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name bitget#fetchConvertQuote
     * @description fetch a quote for converting from one currency to another
     * @see https://www.bitget.com/api-doc/common/convert/Get-Quoted-Price
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} [amount] how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    fetchConvertQuote(fromCode: string, toCode: string, amount?: Num, params?: {}): Promise<Conversion>;
    /**
     * @method
     * @name bitget#createConvertTrade
     * @description convert from one currency to another
     * @see https://www.bitget.com/api-doc/common/convert/Trade
     * @param {string} id the id of the trade that you want to make
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} amount how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.price the price of the conversion, obtained from fetchConvertQuote()
     * @param {string} params.toAmount the amount you want to trade in units of the toCurrency, obtained from fetchConvertQuote()
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    createConvertTrade(id: string, fromCode: string, toCode: string, amount?: Num, params?: {}): Promise<Conversion>;
    /**
     * @method
     * @name bitget#fetchConvertTradeHistory
     * @description fetch the users history of conversion trades
     * @see https://www.bitget.com/api-doc/common/convert/Get-Convert-Record
     * @param {string} [code] the unified currency code
     * @param {int} [since] the earliest time in ms to fetch conversions for
     * @param {int} [limit] the maximum number of conversion structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [conversion structures]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    fetchConvertTradeHistory(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Conversion[]>;
    parseConversion(conversion: Dict, fromCurrency?: Currency, toCurrency?: Currency): Conversion;
    /**
     * @method
     * @name bitget#fetchConvertCurrencies
     * @description fetches all available currencies that can be converted
     * @see https://www.bitget.com/api-doc/common/convert/Get-Convert-Currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchConvertCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name bitget#fetchFundingInterval
     * @description fetch the current funding rate interval
     * @see https://www.bitget.com/api-doc/contract/market/Get-Symbol-Next-Funding-Time
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingInterval(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name bitget#fetchLongShortRatioHistory
     * @description fetches the long short ratio history for a unified market symbol
     * @see https://www.bitget.com/api-doc/common/apidata/Margin-Ls-Ratio
     * @see https://www.bitget.com/api-doc/common/apidata/Account-Long-Short
     * @param {string} symbol unified symbol of the market to fetch the long short ratio for
     * @param {string} [timeframe] the period for the ratio
     * @param {int} [since] the earliest time in ms to fetch ratios for
     * @param {int} [limit] the maximum number of long short ratio structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of [long short ratio structures]{@link https://docs.ccxt.com/#/?id=long-short-ratio-structure}
     */
    fetchLongShortRatioHistory(symbol?: Str, timeframe?: Str, since?: Int, limit?: Int, params?: {}): Promise<LongShortRatio[]>;
    parseLongShortRatio(info: Dict, market?: Market): LongShortRatio;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    nonce(): number;
    sign(path: any, api?: any[], method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
