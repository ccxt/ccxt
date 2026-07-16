import Exchange from '../abstract/prediction/myriad.js';
import type { Int, Str, Num, Dict, int, Strings, PredictionOrderRequest, Market, PredictionOrderBook, OHLCV, PredictionTradingFee, PredictionEvent, Balances, fetchEventsParams, PredictionTicker, PredictionTickers, PredictionOrder, PredictionTrade, PredictionPosition } from '../base/types.js';
/**
 * @class myriad
 * @augments Exchange
 */
export default class myriad extends Exchange {
    describe(): any;
    /**
     * @method
     * @name myriad#fetchMarkets
     * @description retrieves data on all markets for myriad, each prediction market becomes one market with its outcome tokens listed under the outcomes key
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {object} [params] extra exchange-specific parameters
     * @param {string} [params.query] a single search term used to filter the fetched markets
     * @param {string[]} [params.queries] multiple search terms (alternative to query)
     * @param {string} [params.state] 'open', 'closed' or 'resolved', the state of the markets to fetch, defaults to 'open'
     * @param {int} [params.limit] max number of markets to collect (defaults to options.fetchMarketsLimit, 1000); stops the pagination once reached
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @ignore
     * @method
     * @name myriad#fetchRawMarketsBySearch
     * @description fetches raw myriad market objects matching the given search terms via the markets keyword filter
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string[]} queries search terms
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.limit] maximum number of markets per query, defaults to 50
     * @param {string} [params.state] 'open', 'closed' or 'resolved', defaults to options.defaultMarketStatus
     * @returns {object[]} an array of raw myriad market objects
     */
    fetchRawMarketsBySearch(queries: any[], params?: {}): Promise<any[]>;
    /**
     * @ignore
     * @method
     * @name myriad#fetchRawMarketsList
     * @description fetches raw myriad market objects from the paginated markets listing
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {object} [params] extra exchange-specific parameters
     * @param {string} [params.state] 'open', 'closed' or 'resolved', defaults to options.defaultMarketStatus
     * @returns {object[]} an array of raw myriad market objects
     */
    fetchRawMarketsList(params?: {}): Promise<any[]>;
    /**
     * @method
     * @name myriad#fetchEvent
     * @description fetches a single prediction-market event by its market id
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string} id the market id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    fetchEvent(id: string, params?: {}): Promise<PredictionEvent>;
    /**
     * @ignore
     * @method
     * @name myriad#fetchRawMarketById
     * @description fetches a single raw myriad market object by its unified event id (a composite networkId:marketId)
     * @param {string} id the unified event/market id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the raw myriad market object
     */
    fetchRawMarketById(id: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name myriad#fetchPositions
     * @description fetch the open outcome-token positions held by a wallet (myriad settles trades on-chain, so only read-only portfolio data is exposed by the API)
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string[]} [outcomes] unified outcomes to filter by
     * @param {object} [params] extra exchange-specific parameters
     * @param {string} [params.address] the wallet address to query, defaults to this.walletAddress
     * @returns {object[]} a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    fetchPositions(outcomes?: Strings, params?: {}): Promise<PredictionPosition[]>;
    /**
     * @ignore
     * @method
     * @name myriad#parsePredictionPosition
     * @description parses a raw myriad portfolio entry into a unified position structure
     * @param {object} position the raw portfolio entry
     * @param {object} [market] not used by myriad
     * @returns {object} a [prediction position structure](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    parsePredictionPosition(position: Dict, market?: Market): PredictionPosition;
    /**
     * @method
     * @name myriad#fetchTradeQuote
     * @description fetches a trade quote — price, shares, fees and the on-chain calldata — for buying or selling an outcome. Myriad settles trades on-chain, so this returns the calldata to submit to the prediction-market contract rather than placing an off-chain order
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string} outcome unified outcome or outcome id
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount for 'buy' the collateral value to spend; for 'sell' the number of shares to sell
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.slippage] maximum slippage tolerance (default 0.005)
     * @returns {object} a quote object with price, shares, fees and the on-chain calldata
     */
    fetchTradeQuote(outcome: string, side: string, amount: number, params?: {}): Promise<Dict>;
    /**
     * @ignore
     * @method
     * @name myriad#parseTradeQuote
     * @description parses a raw myriad quote response into a unified-ish quote object
     * @param {object} quote the raw quote response
     * @param {object} [market] the outcome the quote belongs to
     * @returns {object} a quote object
     */
    parseTradeQuote(quote: Dict, market?: any): Dict;
    signEvmTransaction(tx: Dict, privateKey: string): string;
    ethRpc(rpcUrl: string, method: string, rpcParams: any[]): Promise<any>;
    ensureErc20Allowance(rpcUrl: string, networkId: string, token: string, owner: string, spender: string): Promise<any>;
    /**
     * @method
     * @name myriad#createOrder
     * @description create a trade order. Myriad has two trading models: a gasless order book (CLOB) where an EIP-712 signed order is posted off-chain and settled by the operator, and an on-chain AMM. Order-book markets are used by default; the model can be forced via params.tradingModel
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da8281e2bc49cf4914b07528
     * @param {string} outcome unified outcome or outcome id
     * @param {string} type 'limit' or 'market' (order book); ignored by the AMM path
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount number of outcome shares to trade (AMM 'buy' spends this as collateral value instead)
     * @param {float} [price] price per share as a fraction in [0, 1] (required for order-book limit orders)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tradingModel] 'ob' to force the order book, 'amm' to force the on-chain AMM; defaults to the market's model
     * @param {string} [params.timeInForce] order-book time in force: 'GTC', 'GTD', 'FOK', 'FAK' or 'PO'
     * @param {string} [params.expiration] unix-seconds expiration for a GTD order
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    createOrder(outcome: string, type: Str, side: Str, amount: Num, price?: Num, params?: {}): Promise<PredictionOrder>;
    /**
     * @ignore
     * @method
     * @name myriad#createOrderbookOrder
     * @description signs an EIP-712 order and posts it to the gasless order book; the operator settles the match on-chain
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    createOrderbookOrder(outcome: string, type: Str, side: Str, amount: Num, price?: Num, params?: {}): Promise<PredictionOrder>;
    /**
     * @ignore
     * @method
     * @name myriad#buildOrderbookOrder
     * @description builds and EIP-712 signs a single order-book order; shared by createOrder and createOrders
     * @returns {object} a dict with the signed order, signature, timeInForce and networkId
     */
    buildOrderbookOrder(outcome: string, type: Str, side: Str, amount: Num, price?: Num, params?: {}): Dict;
    /**
     * @method
     * @name myriad#createOrders
     * @description places multiple order book orders. Myriad's batch endpoint is not reliable, so the
     * orders are signed and submitted sequentially (not atomically)
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da8281e2bc49cf4914b07528
     * @param {object[]} orders a list of order requests, each with outcome, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    createOrders(orders: PredictionOrderRequest[], params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name myriad#editOrder
     * @description edits an open order by cancelling it and placing a replacement (gasless). Myriad's
     * batch-modify endpoint is not reliable, so the cancel and replace are submitted sequentially
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da8281b58c5adb2f5998eec8
     * @param {string} id the hash of the order to replace
     * @param {string} outcome unified outcome of the new order
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount number of outcome shares for the new order
     * @param {float} [price] price per share as a fraction in [0, 1]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    editOrder(id: string, outcome: string, type: Str, side: Str, amount?: Num, price?: Num, params?: {}): Promise<PredictionOrder>;
    /**
     * @ignore
     * @method
     * @name myriad#createAmmOrder
     * @description buys or sells outcome shares by submitting the quote's calldata as an on-chain AMM transaction. Requires a privateKey with gas + collateral on the market's network
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    createAmmOrder(outcome: string, type: Str, side: Str, amount: Num, price?: Num, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name myriad#createMarketBuyOrderWithCost
     * @description buys an outcome by spending a fixed collateral amount on the AMM (dollar-sizing)
     * @param {string} outcome unified outcome handle
     * @param {float} cost the collateral (USDC) amount to spend
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    createMarketBuyOrderWithCost(outcome: string, cost: number, params?: {}): Promise<PredictionOrder>;
    /**
     * @ignore
     * @method
     * @name myriad#signOrderbookTypedData
     * @description EIP-712 signs an order-book typed-data message with the wallet private key (returns a 65-byte 0x signature)
     * @returns {string} the hex signature
     */
    signOrderbookTypedData(types: Dict, message: Dict, networkId: string): string;
    /**
     * @ignore
     * @method
     * @name myriad#signClobOrder
     * @description EIP-712 signs the order-book Order struct
     * @returns {string} the hex signature
     */
    signClobOrder(message: Dict, networkId: string): string;
    /**
     * @ignore
     * @method
     * @name myriad#signCancelAll
     * @description EIP-712 signs the order-book CancelAll struct
     * @returns {string} the hex signature
     */
    signCancelAll(message: Dict, networkId: string): string;
    /**
     * @ignore
     * @method
     * @name myriad#clobOrderMessage
     * @description normalises a fetched order-book order into a typed-data message (uint256 fields as strings, uint8 fields as ints)
     * @returns {object} the typed-data message
     */
    clobOrderMessage(rawOrder: Dict): Dict;
    /**
     * @ignore
     * @method
     * @name myriad#toOrderbookWei
     * @description scales a decimal value by 1e18 and truncates to an integer wei string
     * @returns {string} the integer wei string
     */
    toOrderbookWei(value: Num): string;
    parseOrderStatus(status: Str): Str;
    parsePredictionOrder(order: Dict, market?: Market): PredictionOrder;
    /**
     * @method
     * @name myriad#cancelOrder
     * @description cancels an open order book order by its hash (re-signs the original order to prove ownership; gasless)
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da8281b58c5adb2f5998eec8
     * @param {string} id the order hash returned by createOrder
     * @param {string} [outcome] unified outcome the order belongs to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    cancelOrder(id: string, outcome?: Str, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name myriad#cancelAllOrders
     * @description cancels all open order book orders for the wallet, optionally scoped to one market (gasless)
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da8281e7a14cd34e6a716761
     * @param {string} [outcome] unified outcome; when omitted cancels across all markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the raw response with the count of cancelled orders
     */
    cancelAllOrders(outcome?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name myriad#cancelOrders
     * @description cancels multiple open order book orders by hash in one request (gasless)
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828177961fd94a6055966f
     * @param {string[]} ids the order hashes to cancel
     * @param {string} [outcome] not used by myriad cancelOrders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    cancelOrders(ids: string[], outcome?: Str, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name myriad#fetchOrder
     * @description fetches a single order book order by its hash
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828116b8a0d976baea1df0
     * @param {string} id the order hash
     * @param {string} [outcome] unified outcome the order belongs to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOrder(id: string, outcome?: Str, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name myriad#fetchOrders
     * @description fetches order book orders for the wallet (or any trader passed via params.trader)
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828171a003cf996487d008
     * @param {string} [outcome] unified outcome to filter by
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.trader] wallet address to query (defaults to the configured wallet)
     * @param {string} [params.status] 'open', 'filled', 'cancelled' or 'expired'
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name myriad#fetchOpenOrders
     * @description fetches open order book orders for the wallet
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828171a003cf996487d008
     * @param {string} [outcome] unified outcome to filter by
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOpenOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name myriad#fetchClosedOrders
     * @description fetches the wallet's filled order book orders
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828171a003cf996487d008
     * @param {string} [outcome] unified outcome to filter by
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchClosedOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name myriad#fetchCanceledOrders
     * @description fetches the wallet's cancelled order book orders
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828171a003cf996487d008
     * @param {string} [outcome] unified outcome to filter by
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchCanceledOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name myriad#fetchMyTrades
     * @description fetches the wallet's filled order book orders as trades. Note: Myriad's REST exposes the order's
     * limit price, not the per-fill execution price, so the price reflects the order's limit (exact for resting/limit
     * fills, an upper/lower bound for market orders) — use watchTrades for live execution prices
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828171a003cf996487d008
     * @param {string} [outcome] unified outcome to filter by
     * @param {int} [since] timestamp in ms of the earliest trade
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    fetchMyTrades(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    orderToTrade(order: Dict): PredictionTrade;
    /**
     * @method
     * @name myriad#fetchBalance
     * @description fetches the wallet's on-chain collateral balance for the order-book network (USD1 on BNB Chain)
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network_id] the network id (defaults to options.defaultNetworkId, '56')
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    fetchBalance(params?: {}): Promise<Balances>;
    hexToDecimalString(hexValue: string): Str;
    fromWeiWithDecimals(hexValue: string, decimals: Int): Str;
    parseTradeTx(txHash: string, quote: Dict, market: any, side: string): PredictionOrder;
    /**
     * @ignore
     * @method
     * @name myriad#parseMarketToEvent
     * @description wraps a parsed myriad market into a unified event structure
     * @param {object} raw the raw myriad market object
     * @param {object} market the parsed ccxt market
     * @returns {object} an event structure
     */
    parseMarketToEvent(raw: Dict, market: any): any;
    /**
     * @ignore
     * @method
     * @name myriad#parseMyriadMarket
     * @description converts a single raw myriad market into one ccxt market with a list of outcome objects
     * @param {object} raw the raw myriad market object
     * @param {string} [eventSlug] the slug of the parent event
     * @returns {object} a [market structure](https://docs.ccxt.com/#/?id=market-structure)
     */
    parseMyriadMarket(raw: Dict, eventSlug?: string): Market;
    /**
     * @method
     * @name myriad#fetchTicker
     * @description fetches the current price for a single outcome by loading the parent market
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string} outcome unified outcome like TRUMP_WIN:YES or an outcome id like 2741:756/0
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    fetchTicker(outcome: string, params?: {}): Promise<PredictionTicker>;
    /**
     * @method
     * @name myriad#fetchTradingFee
     * @description fetches the buy/sell fee rates for a market outcome
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string} outcome unified outcome or outcome id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)
     */
    fetchTradingFee(outcome: string, params?: {}): Promise<PredictionTradingFee>;
    /**
     * @ignore
     * @method
     * @name myriad#parsePredictionTicker
     * @description parses a raw myriad market object into a unified ticker for the specified outcome
     * @param {object} raw the raw myriad market object
     * @param {object} [market] the outcome object the ticker belongs to
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    parsePredictionTicker(raw: Dict, market?: Market): PredictionTicker;
    /**
     * @method
     * @name myriad#fetchOrderBook
     * @description fetches the real order book for order-book markets, or synthesizes a one-level book from the AMM price otherwise
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da8281bba6aaf24dd61f2bb1
     * @param {string} outcome unified outcome like TRUMP_WIN:YES or an outcome id
     * @param {int} [limit] not used by myriad fetchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)
     */
    fetchOrderBook(outcome: string, limit?: Int, params?: {}): Promise<PredictionOrderBook>;
    /**
     * @ignore
     * @method
     * @name myriad#parseWeiOrderBook
     * @description parses an order book whose price and amount levels are 1e18-scaled integer strings
     * @param {object} response the raw orderbook response with bids and asks arrays
     * @param {string} outcome the unified outcome of the order book
     * @returns {object} a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)
     */
    parseWeiOrderBook(response: Dict, outcome: Str): PredictionOrderBook;
    /**
     * @method
     * @name myriad#fetchOHLCV
     * @description fetches price history for an outcome from the price_charts bucket embedded in the market response
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string} outcome unified outcome like TRUMP_WIN:YES or an outcome id
     * @param {string} timeframe mapped to the closest available chart bucket (24h, 7d or 30d)
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum number of candles to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} a list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(outcome: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @ignore
     * @method
     * @name myriad#parseOHLCV
     * @description parses a single myriad price chart data point into an ohlcv tuple
     * @param {object} ohlcv the raw price chart data point
     * @param {object} [market] the outcome object the candle belongs to
     * @returns {int[]} a candle ordered as timestamp, open, high, low, close, volume
     */
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name myriad#fetchTickers
     * @description fetches tickers for multiple outcomes, grouping requested outcomes by their parent market to fetch each market only once
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string[]} outcomes unified outcomes — required: myriad has no endpoint returning all tickers at once, so an unscoped call is not supported
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure) indexed by outcome
     */
    fetchTickers(outcomes?: Strings, params?: {}): Promise<PredictionTickers>;
    /**
     * @method
     * @name myriad#fetchTrades
     * @description fetches recent public trades for a single outcome from the market action feed
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string} outcome unified outcome like TRUMP_WIN:YES or an outcome id
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    fetchTrades(outcome: string, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @ignore
     * @method
     * @name myriad#parsePredictionTrade
     * @description parses a raw market action feed row into a unified trade object
     * @param {object} trade the raw action feed row
     * @param {object} [market] the outcome object the trade belongs to
     * @returns {object} a [prediction trade structure](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    parsePredictionTrade(trade: Dict, market?: Market): PredictionTrade;
    /**
     * @method
     * @name myriad#fetchEvents
     * @description fetches prediction-market events matching the given scope (query/queries/tags/eventId — required) and caches their markets and outcomes on the instance
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {object} [params] extra exchange-specific parameters
     * @param {string} [params.query] a single search term; an eventId does a direct lookup and tags map to server-side keyword searches
     * @param {string[]} [params.queries] multiple search terms (alternative to query)
     * @param {string[]} [params.tags] tag slugs to scope by (searched as keywords, e.g. ['bitcoin', 'world-cup'])
     * @param {string} [params.eventId] direct lookup by unified event id (composite networkId:marketId)
     * @param {int} [params.limit] maximum number of markets per query, defaults to 50
     * @param {string} [params.state] 'open', 'closed' or 'resolved', defaults to 'open'
     * @returns {object[]} an array of event structures
     */
    fetchEvents(params?: fetchEventsParams): Promise<PredictionEvent[]>;
    /**
     * @ignore
     * @method
     * @name myriad#parseEvent
     * @description parses a raw myriad question object into the unified event shape with a nested markets list
     * @param {object} rawEvent the raw myriad question object
     * @returns {object} an event structure
     */
    parseEvent(rawEvent: Dict): any;
    requestId(url: string): number;
    fromWei(wei: Str): Num;
    marketOutcomeToSymbol(networkId: Str, marketId: Str, outcomeId: Str): Str;
    connectCentrifugo(url: string): Promise<any>;
    pong(client: any, message?: any): Promise<void>;
    subscribeMyriadChannel(messageHash: string, channel: string, params?: {}): Promise<any>;
    handleMessage(client: any, message: any): void;
    handleCentrifugoFrame(client: any, msg: any): void;
    /**
     * @method
     * @name myriad#watchOrderBook
     * @description streams the order book for an outcome over the Centrifugo websocket; the channel is delta-only so the book is seeded from the REST snapshot
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa
     * @param {string} outcome unified outcome
     * @param {int} [limit] the maximum number of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)
     */
    watchOrderBook(outcome: string, limit?: Int, params?: {}): Promise<PredictionOrderBook>;
    seedOrderBook(outcome: string, sym: string, limit?: Int): Promise<void>;
    handleOrderBook(client: any, data: any): void;
    /**
     * @method
     * @name myriad#watchTrades
     * @description streams public trades for an outcome over the Centrifugo websocket
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa
     * @param {string} outcome unified outcome
     * @param {int} [since] timestamp in ms of the earliest trade
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    watchTrades(outcome: string, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @method
     * @name myriad#watchMyTrades
     * @description streams the wallet's own fills for a market over the Centrifugo trades channel (real
     * execution prices, unlike the REST fetchMyTrades); requires a market outcome since the channel is per-market
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa
     * @param {string} outcome unified outcome whose market to watch
     * @param {int} [since] timestamp in ms of the earliest trade
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    watchMyTrades(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    walletAddressOrUndefined(): Str;
    handleTrades(client: any, data: any): void;
    /**
     * @method
     * @name myriad#watchTicker
     * @description streams best bid/ask/last for an outcome over the Centrifugo prices channel
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa
     * @param {string} outcome unified outcome
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    watchTicker(outcome: string, params?: {}): Promise<PredictionTicker>;
    /**
     * @method
     * @name myriad#watchTickers
     * @description streams best bid/ask/last for several outcomes over the Centrifugo prices channels
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa
     * @param {string[]} outcomes unified outcomes to watch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dict of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure) indexed by outcome
     */
    watchTickers(outcomes?: Strings, params?: {}): Promise<PredictionTickers>;
    /**
     * @method
     * @name myriad#watchOHLCV
     * @description streams OHLCV candles for an outcome, synthesised from the live trades channel
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa
     * @param {string} outcome unified outcome
     * @param {string} timeframe the length of each candle (e.g. '1m', '1h', '1d')
     * @param {int} [since] timestamp in ms of the earliest candle
     * @param {int} [limit] the maximum number of candles to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} a list of [timestamp, open, high, low, close, volume] candles
     */
    watchOHLCV(outcome: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleTicker(client: any, data: any): void;
    /**
     * @method
     * @name myriad#watchOrders
     * @description streams the wallet's order lifecycle updates over the Centrifugo orders channel
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa
     * @param {string} [outcome] unified outcome to filter by
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    watchOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    handleOrder(client: any, data: any): void;
    /**
     * @method
     * @name myriad#watchPositions
     * @description streams the wallet's share-balance changes over the Centrifugo positions channel
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa
     * @param {string[]} [outcomes] unified outcomes to filter by
     * @param {int} [since] timestamp in ms of the earliest position update
     * @param {int} [limit] the maximum number of position updates to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    watchPositions(outcomes?: Strings, since?: Int, limit?: Int, params?: {}): Promise<PredictionPosition[]>;
    seedPositionBalances(trader: string): Promise<void>;
    handlePosition(client: any, data: any): void;
    walletAddressFromKeys(): string;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    /**
     * @ignore
     * @method
     * @name myriad#sign
     * @description builds the request url and attaches the x-api-key header for private endpoints
     * @param {string} path the endpoint path
     * @param {string|string[]} api the api group and access level
     * @param {string} method the http method
     * @param {object} params the request parameters
     * @param {object} [headers] request headers
     * @param {string} [body] the request body
     * @returns {object} a dict with url, method, body and headers
     */
    sign(path: any, api?: any, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
