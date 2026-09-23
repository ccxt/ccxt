import Exchange from '../abstract/prediction/predictfun.js';
import type { Dict, fetchEventsParams, Int, Market, Num, OrderSide, OrderType, PredictionEvent, PredictionOrder, PredictionOrderBook, PredictionPosition, PredictionTicker, PredictionTrade, Str, Strings } from '../base/types.js';
import type Client from '../base/ws/Client.js';
/**
 * @class predictfun
 * @augments Exchange
 */
export default class predictfun extends Exchange {
    describe(): any;
    /**
     * @method
     * @name predictfun#fetchMarkets
     * @description Retrieves all outcome markets from outcomeMeta.
     * Each binary outcome becomes one CCXT prediction market with two outcomes: YES and NO.
     * @see https://dev.predict.fun/get-categories-25326910e0
     * @see https://dev.predict.fun/search-categories-and-markets-27399810e0
     * @param {object} [params] extra parameters
     * @param {string} [params.query] a single search term — routes the call through the search endpoint and returns only the matching markets
     * @param {string[]} [params.queries] multiple search terms (alternative to query), the results are merged and deduplicated
     * @param {string[]} [params.tags] predictfun tag ids
     * @param {string} [params.slug] direct lookup by event slug
     * @param {int} [params.limit] the maximum number of events to collect markets from
     * @returns {Market[]} array of market structures
     */
    fetchMarkets(params?: Dict): Promise<Market[]>;
    /**
     * @method
     * @name predictfun#fetchEvent
     * @description fetches a single prediction-market event (market topic)
     * @see https://dev.predict.fun/get-category-by-slug-25326911e0
     * @param {string} id event slug
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.slug] event slug, overrides the id argument when both are given
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    fetchEvent(id: string, params?: Dict): Promise<PredictionEvent>;
    /**
     * @method
     * @name predictfun#fetchEvents
     * @description fetches prediction-market events (market topics); the call must be scoped by query/queries/tags, eventId, or an l1Category/l2Category listing filter
     * @see https://dev.predict.fun/get-categories-25326910e0
     * @see https://dev.predict.fun/search-categories-and-markets-27399810e0
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.query] a single search term — routes the call through GET /v1/search instead of the categories listing
     * @param {string[]} [params.queries] multiple search terms (alternative to query), searched one by one and merged deduplicated by event slug
     * @param {string[]} [params.tags] predictfun tag ids
     * @param {string} [params.slug] direct lookup by event slug
     * @param {int} [params.limit] the maximum number of events to return, capped at 25 per search term when searching
     * @param {string} [params.sort] 'VOLUME_24H_DESC' | 'VOLUME_ALL_DESC' | 'PUBLISHED_AT_ASC' | 'PUBLISHED_AT_DESC'
     * @param {string} [params.status] 'OPEN' | 'RESOLVED'
     * @param {string} [params.marketVariant] predictfun enum value ('SPORTS_MATCH', 'CRYPTO_UP_DOWN' etc.)
     * @returns {object[]} a list of [prediction event structures](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    fetchEvents(params?: fetchEventsParams): Promise<PredictionEvent[]>;
    /**
     * @ignore
     * @method
     * @name predictfun#fetchRawTopicsByQueries
     * @description searches categories and markets for every query term and returns the raw market topics, deduplicated by slug
     * @see https://dev.predict.fun/search-categories-and-markets-27399810e0
     * @param {string[]} queries the search terms
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.status] anything other than 'active' asks the venue to include resolved rows
     * @returns {object[]} an array of raw market topics, each with a nested markets list
     */
    fetchRawTopicsByQueries(queries: string[], params?: Dict): Promise<any[]>;
    /**
     * @ignore
     * @method
     * @name predictfun#parseEvent
     * @description parses a raw predictfun market topic (with nested markets) into the unified event shape
     * @param {object} rawTopic the raw market topic object
     * @returns {object} an event structure
     */
    parseEvent(rawTopic: Dict): any;
    /**
     * @ignore
     * @method
     * @name predictfun#stripPriceFormatting
     * @description drops the formatting the venue puts in a price but not in its slug - the currency sign, and a comma that sits between two digits
     * @param {string} [text] the raw title or outcome label
     * @returns {string} the same text with '$' removed and thousands separators closed up
     */
    stripPriceFormatting(text: Str): Str;
    /**
     * @ignore
     * @method
     * @name predictfun#titleForMarketSymbol
     * @description decides what of a market title belongs in the unified symbol, given how many markets its topic holds
     * @param {string} [topicSlug] the slug of the enclosing topic
     * @param {string} [title] the market title
     * @param {int} [marketCount] how many markets the topic carries
     * @returns {string} the title to append, or the slug itself when the topic holds a single market
     */
    titleForMarketSymbol(topicSlug: Str, title: Str, marketCount?: Int): Str;
    /**
     * @ignore
     * @method
     * @name predictfun#parseTopicMarket
     * @description parses one nested market of a market topic into the unified market shape, building its outcome tokens
     * @param {object} rawMarket the nested market object
     * @param {object} rawTopic the enclosing raw market topic (carries slug/vendor/fees/dates)
     * @returns {object} a market structure
     */
    parseTopicMarket(rawMarket: Dict, rawTopic: Dict): Market;
    /**
     * @method
     * @name predictfun#fetchOrderBook
     * @description fetches the order book for a single prediction outcome token
     * @see https://dev.predict.fun/get-the-orderbook-for-a-market-25326908e0
     * @param {string} outcome unified outcome handle, or an outcome token id
     * @param {int} [limit] not used by predictfun fetchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    fetchOrderBook(outcome: Str, limit?: Int, params?: Dict): Promise<PredictionOrderBook>;
    /**
     * @method
     * @name predictfun#fetchTicker
     * @description fetches the best bid and ask for a single prediction outcome token
     * @see https://dev.predict.fun/get-market-by-id-25552989e0
     * @param {string} outcome unified outcome handle, or an outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    fetchTicker(outcome: Str, params?: Dict): Promise<PredictionTicker>;
    /**
     * @ignore
     * @method
     * @name predictfun#parsePredictionTicker
     * @description parses a raw market detail into a unified prediction ticker for one of its outcomes
     * @param {object} ticker the raw market object, with a nested outcomes list
     * @param {object} [market] the outcome the ticker belongs to
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    parsePredictionTicker(ticker: Dict, market?: Market): PredictionTicker;
    /**
     * @method
     * @name predictfun#fetchMyTrades
     * @description fetches the settled matches the wallet took part in, on either side of the book
     * @see https://dev.predict.fun/get-order-match-events-25663812e0
     * @param {string} [outcome] unified outcome handle, restricts the call to that outcome's market
     * @param {int} [since] timestamp in ms of the earliest trade to return, applied client side
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.after] cursor from a previous response, the venue pages back from the most recent match
     * @param {bool} [params.isSignerMaker] true keeps only the matches the wallet rested, false only the ones it took
     * @param {string} [params.signerAddress] read another wallet's matches instead of the configured one
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    fetchMyTrades(outcome?: Str, since?: Int, limit?: Int, params?: Dict): Promise<PredictionTrade[]>;
    /**
     * @method
     * @name predictfun#fetchTrades
     * @description fetches the most recent settled matches for a single prediction outcome token
     * @see https://dev.predict.fun/get-order-match-events-25663812e0
     * @param {string} outcome unified outcome handle, or an outcome token id
     * @param {int} [since] timestamp in ms of the earliest trade to return, applied client side
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.after] cursor from a previous response, the venue pages back from the most recent match
     * @param {string} [params.minValueUsdtWei] only return matches worth at least this many wei
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    fetchTrades(outcome: Str, since?: Int, limit?: Int, params?: Dict): Promise<PredictionTrade[]>;
    /**
     * @ignore
     * @method
     * @name predictfun#parsePredictionTrade
     * @description parses a raw order match event into a unified prediction trade for one of the two outcomes
     * @param {object} trade the raw match event
     * @param {object} [market] the outcome the trade belongs to
     * @returns {object} a [prediction trade structure](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    parsePredictionTrade(trade: Dict, market?: Market): PredictionTrade;
    /**
     * @method
     * @name predictfun#setSandboxMode
     * @description switches between BNB mainnet and the BNB testnet
     * @param {bool} enable whether to use the testnet
     * @returns {undefined}
     */
    setSandboxMode(enable: boolean): void;
    /**
     * @ignore
     * @method
     * @name predictfun#hashMessage
     * @description hashes a message the way eth_personal_sign does, prefixing it before the keccak
     * @param {string} message the message to hash
     * @returns {string} the 0x prefixed hash
     */
    hashMessage(message: string): string;
    /**
     * @ignore
     * @method
     * @name predictfun#signHash
     * @description signs a 32 byte hash with the wallet's private key
     * @param {string} hash the hash to sign
     * @param {string} privateKey the wallet private key
     * @returns {string} the 65 byte signature, 0x prefixed
     */
    signHash(hash: string, privateKey: string): string;
    /**
     * @ignore
     * @method
     * @name predictfun#authenticate
     * @description exchanges a wallet signature for the JWT that authorises order actions, and caches it
     * @see https://dev.predict.fun/get-auth-message-25326899e0
     * @see https://dev.predict.fun/get-jwt-with-valid-signature-25326900e0
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {string} the JWT
     */
    authenticate(params?: Dict): Promise<Str>;
    /**
     * @ignore
     * @method
     * @name predictfun#signPredictfunOrder
     * @description signs a contract order with the EIP-712 scheme of the exchange that settles it
     * @param {object} order the contract order, as sent to the venue
     * @param {bool} isNegRisk whether the market settles through the negative risk exchange
     * @param {bool} isYieldBearing whether the market settles through the yield bearing exchange
     * @returns {object} a dictionary with the order hash and the signature
     */
    signPredictfunOrder(order: Dict, isNegRisk: boolean, isYieldBearing: boolean): Dict;
    /**
     * @method
     * @name predictfun#createOrder
     * @description creates a LIMIT or MARKET order on a single prediction outcome token
     * @see https://dev.predict.fun/create-an-order-32534694e0
     * @param {string} outcome unified outcome handle, or an outcome token id
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the number of outcome shares
     * @param {float} [price] the price per share between 0 and 1, required for a limit order, and for a market order too unless warnOnMarketOrderWithoutPrice is turned off
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.expiration] unix timestamp in seconds the limit order expires at
     * @param {bool} [params.postOnly] reject the order if it would take liquidity
     * @param {bool} [params.isFillOrKill] fill the order completely or cancel it
     * @param {string} [params.slippageBps] slippage tolerance for a market order, in basis points
     * @param {bool} [params.warnOnMarketOrderWithoutPrice] set to false to sign a priceless market order at 0.99 to buy or 0.01 to sell, the worst price it accepts
     * @param {string} [params.selfTradePrevention] 'CANCEL_MAKER' | 'CANCEL_TAKER' | 'CANCEL_BOTH'
     * @param {string} [params.salt] order salt, pin it to retry an order idempotently
     * @param {string} [params.nonce] the maker's on chain nonce, defaults to 0
     * @param {string} [params.feeRateBps] fee in basis points, read from the market when omitted
     * @param {bool} [params.isNegRisk] override the market's negative risk flag
     * @param {bool} [params.isYieldBearing] override the market's yield bearing flag
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    createOrder(outcome: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: Dict): Promise<PredictionOrder>;
    /**
     * @method
     * @name predictfun#fetchPositions
     * @description fetches the outcome shares the wallet holds
     * @see https://dev.predict.fun/get-positions-32675933e0
     * @see https://dev.predict.fun/get-positions-by-address-32675934e0
     * @param {string[]} [outcomes] unified outcome handles to keep, all of them when omitted
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] read another wallet's positions, which needs no JWT
     * @param {string} [params.marketId] only positions on this market
     * @param {bool} [params.isResolved] only resolved, or only unresolved, positions
     * @param {string} [params.sort] 'AMOUNT_DESC' | 'EVENT_BLOCK_ASC' | 'EVENT_BLOCK_DESC' | 'SHARES_VALUE_DESC' | 'RETURN_DESC'
     * @param {int} [params.first] the maximum number of positions to return
     * @param {string} [params.after] cursor from a previous response
     * @returns {object[]} a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    fetchPositions(outcomes?: Strings, params?: Dict): Promise<PredictionPosition[]>;
    /**
     * @method
     * @name predictfun#fetchPosition
     * @description fetches the shares the wallet holds of a single outcome
     * @see https://dev.predict.fun/get-positions-32675933e0
     * @param {string} outcome unified outcome handle, or an outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] read another wallet's position, which needs no JWT
     * @returns {object} a [position structure](https://docs.ccxt.com/#/?id=position-structure)
     */
    fetchPosition(outcome: string, params?: Dict): Promise<PredictionPosition>;
    /**
     * @ignore
     * @method
     * @name predictfun#parsePredictionPosition
     * @description parses a raw position row into the unified position structure
     * @param {object} position the raw position row
     * @param {object} [market] not used by predictfun parsePredictionPosition
     * @returns {object} a [position structure](https://docs.ccxt.com/#/?id=position-structure)
     */
    parsePredictionPosition(position: Dict, market?: Market): PredictionPosition;
    /**
     * @method
     * @name predictfun#cancelOrder
     * @description removes one of your own orders from the order book
     * @see https://dev.predict.fun/remove-orders-by-hash-38139973e0
     * @param {string} id the order hash, as returned by createOrder
     * @param {string} [outcome] unified outcome handle the order belongs to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    cancelOrder(id: string, outcome?: Str, params?: Dict): Promise<PredictionOrder>;
    /**
     * @method
     * @name predictfun#cancelOrders
     * @description removes several of your own orders from the order book, up to a hundred at a time
     * @see https://dev.predict.fun/remove-orders-by-hash-38139973e0
     * @param {string[]} ids the order hashes, as returned by createOrder
     * @param {string} [outcome] unified outcome handle the orders belong to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    cancelOrders(ids: string[], outcome?: Str, params?: Dict): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name predictfun#fetchOrder
     * @description fetches one of your own orders by its hash
     * @see https://dev.predict.fun/get-order-by-hash-25326901e0
     * @param {string} id the order hash
     * @param {string} [outcome] unified outcome handle the order belongs to, resolved from the order when omitted
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOrder(id: Str, outcome?: Str, params?: Dict): Promise<PredictionOrder>;
    /**
     * @method
     * @name predictfun#fetchOpenOrders
     * @description fetches your own orders that are still resting on the book (only limit orders can be fetched)
     * @see https://dev.predict.fun/get-orders-25326902e0
     * @param {string} [outcome] unified outcome handle to filter by, all outcomes when omitted
     * @param {int} [since] not used by predictfun fetchOpenOrders, the venue returns no order timestamps
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.after] cursor from a previous response, the venue pages back from the newest order
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOpenOrders(outcome?: Str, since?: Int, limit?: Int, params?: Dict): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name predictfun#fetchClosedOrders
     * @description fetches your own orders that filled (only limit orders can be fetched)
     * @see https://dev.predict.fun/get-orders-25326902e0
     * @param {string} [outcome] unified outcome handle to filter by, all outcomes when omitted
     * @param {int} [since] not used by predictfun fetchClosedOrders, the venue returns no order timestamps
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.after] cursor from a previous response, the venue pages back from the newest order
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchClosedOrders(outcome?: Str, since?: Int, limit?: Int, params?: Dict): Promise<PredictionOrder[]>;
    /**
     * @ignore
     * @method
     * @name predictfun#fetchOrdersHelper
     * @description fetches your own orders - the venue answers with the open ones unless a status is named, so each public method passes its own
     * @see https://dev.predict.fun/get-orders-25326902e0
     * @param {string} [outcome] unified outcome handle to filter by, all outcomes when omitted
     * @param {int} [since] not used by predictfun, the venue returns no order timestamps
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.status] 'OPEN' | 'FILLED' | 'EXPIRED' | 'CANCELLED'
     * @param {string} [params.after] cursor from a previous response, the venue pages back from the newest order
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOrdersHelper(outcome?: Str, since?: Int, limit?: Int, params?: Dict): Promise<PredictionOrder[]>;
    /**
     * @ignore
     * @method
     * @name predictfun#parsePredictionOrder
     * @description parses a raw order, as returned by the create and the fetch endpoints, into a unified order
     * @param {object} order the raw order, with the signed contract order nested under 'order'
     * @param {object} [market] the outcome the order belongs to, resolved from the token id when omitted
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    parsePredictionOrder(order: Dict, market?: Market): PredictionOrder;
    /**
     * @ignore
     * @method
     * @name predictfun#parseOrderStatus
     * @description maps a venue order status onto the unified vocabulary
     * @param {string} [status] the raw status
     * @returns {string} the unified status
     */
    parseOrderStatus(status: Str): Str;
    /**
     * @ignore
     * @method
     * @name predictfun#handleErrors
     * @description maps the venue's error slugs and messages onto the unified exceptions
     * @param {int} statusCode the http status code
     * @param {string} statusText the http status text
     * @param {string} url the request url
     * @param {string} method the http method
     * @param {object} responseHeaders the response headers
     * @param {string} responseBody the raw response body
     * @param {object} response the parsed response
     * @param {object} requestHeaders the request headers
     * @param {object} requestBody the request body
     * @returns {undefined} nothing, it throws when the venue reported a failure
     */
    handleErrors(statusCode: Int, statusText: string, url: string, method: string, responseHeaders: Dict, responseBody: string, response: any, requestHeaders: any, requestBody: any): undefined;
    /**
     * @ignore
     * @method
     * @name predictfun#exchangeAddress
     * @description the exchange contract a market settles through, which is what its orders are signed against and what its collateral has to be approved to
     * @param {bool} isNegRisk whether the market settles through the negative risk exchange
     * @param {bool} isYieldBearing whether the market settles through the yield bearing exchange
     * @returns {string} the contract address on the active chain
     */
    exchangeAddress(isNegRisk: boolean, isYieldBearing: boolean): Str;
    /**
     * @ignore
     * @method
     * @name predictfun#conditionalTokensAddress
     * @description the ERC-1155 contract a market's outcome shares live in, which is the contract a seller grants the approval on
     * @param {bool} isNegRisk whether the market settles through the negative risk exchange
     * @param {bool} isYieldBearing whether the market settles through the yield bearing exchange
     * @returns {string} the contract address on the active chain
     */
    conditionalTokensAddress(isNegRisk: boolean, isYieldBearing: boolean): Str;
    /**
     * @ignore
     * @method
     * @name predictfun#adapterAddress
     * @description the negative risk adapter, which moves a seller's shares itself when a neg risk match mints or merges
     * @param {bool} isYieldBearing whether the market settles through the yield bearing exchange
     * @returns {string} the contract address on the active chain
     */
    adapterAddress(isYieldBearing: boolean): Str;
    /**
     * @ignore
     * @method
     * @name predictfun#signEvmTransaction
     * @description builds and signs an EIP-1559 transaction, returning the raw signed hex
     * @param {object} tx the transaction fields
     * @param {string} privateKey the wallet private key
     * @returns {string} the signed raw transaction
     */
    signEvmTransaction(tx: Dict, privateKey: string): string;
    /**
     * @method
     * @name predictfun#approve
     * @description grants the on-chain approvals a wallet needs before it can trade. The buy side is the USDT allowance the exchange spends, without which every order is refused with create_order_insufficient_collateral_allowance; the sell side is the ERC-1155 approval over the outcome shares themselves. WITHOUT params.amount THE BUY SIDE GRANTS AN UNLIMITED (max uint256) ALLOWANCE, pass params.amount to bound it. sends real transactions signed with the privateKey and waits for each receipt, so the wallet needs BNB for gas
     * @see https://dev.predict.fun/how-to-create-or-cancel-orders-679306m0
     * @param {string} [outcome] unified outcome handle, used to pick the contracts its market settles through
     * @param {object} [params] extra parameters
     * @param {string} [params.side] 'buy' for the collateral allowance (the default), 'sell' for the outcome share approval
     * @param {string} [params.spender] approve this contract instead of resolving it from the outcome
     * @param {string} [params.token] the contract to grant on, defaults to USDT when buying and to the market's conditional tokens when selling
     * @param {float} [params.amount] the allowance in USDT, unlimited when omitted, buy side only
     * @param {bool} [params.approved] pass false to revoke instead of grant, sell side only
     * @param {string} [params.owner] the token holder, defaults to walletAddress or the address of the privateKey
     * @param {string} [params.rpcUrl] the rpc to broadcast through, defaults to the public endpoint for the chain
     * @param {string} [params.gasLimit] gas limit as hex, defaults to 0x186a0
     * @returns {object} the transaction receipt when buying, and the list of receipts when selling - a neg risk market needs two
     */
    approve(outcome?: Str, params?: Dict): Promise<any>;
    /**
     * @method
     * @name predictfun#watchOrderBook
     * @description subscribes to the live order book of an outcome and returns it as it updates
     * @see https://dev.predict.fun/subscription-topics-1915507m0
     * @param {string} outcome unified outcome handle
     * @param {int} [limit] the maximum number of price levels to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)
     */
    watchOrderBook(outcome: string, limit?: Int, params?: Dict): Promise<PredictionOrderBook>;
    /**
     * @method
     * @name predictfun#unWatchOrderBook
     * @description stops watching the order book of an outcome. the venue publishes one book per market and both of its outcomes read it, so the sibling outcome is released with it
     * @see https://dev.predict.fun/subscription-topics-1915507m0
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} the venue's acknowledgement
     */
    unWatchOrderBook(outcome: string, params?: Dict): Promise<any>;
    /**
     * @ignore
     * @method
     * @name predictfun#orderBookMessageHashes
     * @description the hashes every waiter on a market's book is parked on, one per outcome
     * @param {string} [marketId] the venue market id
     * @returns {string[]} the message hashes
     */
    orderBookMessageHashes(marketId: Str): string[];
    /**
     * @ignore
     * @method
     * @name predictfun#handleSubscriptionError
     * @description releases the one request the venue turned down and leaves the rest of the connection alone
     * @param {Client} client the websocket client
     * @param {object} message the raw rejection
     * @param {object} subscription the subscription that request registered, empty when it cannot be attributed
     */
    handleSubscriptionError(client: Client, message: Dict, subscription: Dict): void;
    /**
     * @ignore
     * @method
     * @name predictfun#handleUnSubscription
     * @description tears down what an acknowledged unsubscribe leaves behind
     * @param {Client} client the websocket client
     * @param {object} subscription the subscription the acknowledged request id belongs to
     */
    handleUnSubscription(client: Client, subscription: Dict): void;
    /**
     * @method
     * @name predictfun#watchOrders
     * @description watches the wallet's own orders as the venue accepts, fills, expires or cancels them
     * @see https://dev.predict.fun/subscription-topics-1915507m0
     * @param {string} [outcome] unified outcome handle to narrow the stream to
     * @param {int} [since] timestamp in ms of the earliest order to return
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    watchOrders(outcome?: Str, since?: Int, limit?: Int, params?: Dict): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name predictfun#watchMyTrades
     * @description watches the wallet's own fills as they settle on chain
     * @see https://dev.predict.fun/subscription-topics-1915507m0
     * @param {string} [outcome] unified outcome handle to narrow the stream to
     * @param {int} [since] timestamp in ms of the earliest trade to return
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    watchMyTrades(outcome?: Str, since?: Int, limit?: Int, params?: Dict): Promise<PredictionTrade[]>;
    /**
     * @method
     * @name predictfun#unWatchOrders
     * @description stops watching the wallet's orders. one wallet topic carries orders and fills alike, so both streams are released together
     * @see https://dev.predict.fun/subscription-topics-1915507m0
     * @param {string} [outcome] not used by predictfun.unWatchOrders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} the venue's acknowledgement
     */
    unWatchOrders(outcome?: Str, params?: Dict): Promise<any>;
    /**
     * @method
     * @name predictfun#unWatchMyTrades
     * @description stops watching the wallet's fills. one wallet topic carries orders and fills alike, so both streams are released together
     * @see https://dev.predict.fun/subscription-topics-1915507m0
     * @param {string} [outcome] not used by predictfun.unWatchMyTrades
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} the venue's acknowledgement
     */
    unWatchMyTrades(outcome?: Str, params?: Dict): Promise<any>;
    /**
     * @ignore
     * @method
     * @name predictfun#walletEventsTopic
     * @description the wallet topic, which carries the jwt inside the topic string itself
     * @returns {string} the topic to subscribe to
     */
    walletEventsTopic(): Promise<string>;
    /**
     * @ignore
     * @method
     * @name predictfun#watchWalletEvents
     * @description subscribes to the wallet topic and waits on the hash the caller's method reads
     * @param {string} messageHash the hash the caller waits on
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} whatever the channel resolves with
     */
    watchWalletEvents(messageHash: string, params?: Dict): Promise<any>;
    /**
     * @ignore
     * @method
     * @name predictfun#walletEventMessageHashes
     * @description the hashes every waiter on the wallet topic is parked on, the narrowed ones included
     * @param {Client} client the websocket client
     * @param {string} [messageHash] the hash this call is about to park on, not registered yet
     * @returns {string[]} the message hashes
     */
    walletEventMessageHashes(client: Client, messageHash?: Str): string[];
    /**
     * @ignore
     * @method
     * @name predictfun#unWatchWalletEvents
     * @description drops the wallet topic, releasing both the order and the fill stream
     * @param {string} channel 'orders' or 'myTrades'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} the venue's acknowledgement
     */
    unWatchWalletEvents(channel: string, params?: Dict): Promise<any>;
    /**
     * @ignore
     * @method
     * @name predictfun#socketUrl
     * @description the socket endpoint carrying the api key the venue demands on the handshake
     * @returns {string} the url to connect to
     */
    socketUrl(): string;
    /**
     * @ignore
     * @method
     * @name predictfun#requestId
     * @description a monotonic id the venue echoes back so a subscription reply can be matched to its request
     * @returns {int} the next request id
     */
    requestId(): number;
    /**
     * @ignore
     * @method
     * @name predictfun#outcomeForToken
     * @description resolves the outcome a row belongs to from its own token id, taking the caller's outcome only when it names that same token
     * @param {string} [tokenId] the on chain token id the row carries
     * @param {object} [market] the outcome the caller asked about
     * @returns {object} the outcome object, or a stub keyed by the token id when it is not cached
     */
    outcomeForToken(tokenId: Str, market?: any): any;
    /**
     * @ignore
     * @method
     * @name predictfun#outcomesByMarketId
     * @description the cached outcomes that belong to one venue market id
     * @param {string} [marketId] the venue market id
     * @returns {object[]} the outcome objects
     */
    outcomesByMarketId(marketId: Str): any[];
    /**
     * @ignore
     * @method
     * @name predictfun#handleOrderBook
     * @description turns a book message into the two complementary outcome books of its market
     * @param {Client} client the websocket client
     * @param {object} message the raw message
     */
    handleOrderBook(client: Client, message: Dict): void;
    /**
     * @ignore
     * @method
     * @name predictfun#handleWalletEvent
     * @description turns one wallet event into the order it describes, and into a trade when it settled
     * @param {Client} client the websocket client
     * @param {object} message the raw message
     */
    handleWalletEvent(client: Client, message: Dict): void;
    /**
     * @ignore
     * @method
     * @name predictfun#handleWalletEventOrder
     * @description stores the order a wallet event describes and wakes whoever waits on it
     * @param {Client} client the websocket client
     * @param {object} order the parsed order
     */
    handleWalletEventOrder(client: Client, order: PredictionOrder): void;
    /**
     * @ignore
     * @method
     * @name predictfun#handleWalletEventTrade
     * @description stores the settled fill a wallet event carries and wakes whoever waits on it
     * @param {Client} client the websocket client
     * @param {object} event the raw event
     * @param {object} order the order the same event was parsed into
     */
    handleWalletEventTrade(client: Client, event: Dict, order: PredictionOrder): void;
    /**
     * @ignore
     * @method
     * @name predictfun#walletEventOutcome
     * @description resolves the cached outcome a wallet event refers to, by market and outcome index
     * @param {object} details the event's details block
     * @returns {object} the outcome object, or a stub when the market is not cached
     */
    walletEventOutcome(details: Dict): any;
    /**
     * @ignore
     * @method
     * @name predictfun#parseWalletEventOrder
     * @description parses a wallet event into the unified order it describes
     * @param {object} event the raw event
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    parseWalletEventOrder(event: Dict): PredictionOrder;
    /**
     * @ignore
     * @method
     * @name predictfun#parseWalletEventTrade
     * @description parses the settled fill a wallet event carries
     * @param {object} event the raw event
     * @param {object} order the order the same event was parsed into
     * @returns {object} a [prediction trade structure](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    parseWalletEventTrade(event: Dict, order: PredictionOrder): PredictionTrade;
    /**
     * @ignore
     * @method
     * @name predictfun#handleHeartbeat
     * @description echoes the probe timestamp back, which is what keeps the connection open
     * @param {Client} client the websocket client
     * @param {object} message the raw message
     */
    handleHeartbeat(client: Client, message: Dict): void;
    /**
     * @ignore
     * @method
     * @name predictfun#pong
     * @description echoes the probe timestamp back, which is what keeps the connection open
     * @param {Client} client the websocket client
     * @param {object} message the raw probe
     */
    pong(client: Client, message: Dict): Promise<void>;
    /**
     * @ignore
     * @method
     * @name predictfun#handleMessage
     * @description routes a socket message to the handler of its topic
     * @param {Client} client the websocket client
     * @param {object} message the raw message
     */
    handleMessage(client: Client, message: Dict): void;
    nonce(): number;
    /**
     * @ignore
     * @method
     * @name predictfun#sign
     * @description builds the request URL and attaches the API key header required by every endpoint
     * @param {string} path the endpoint path
     * @param {string|string[]} [api] the API group and access level
     * @param {string} [method] HTTP method
     * @param {object} [params] request parameters
     * @param {object} [headers] request headers
     * @param {object} [body] request body
     * @returns {object} a dictionary with url, method, body and headers
     */
    sign(path: any, api?: any, method?: string, params?: Dict, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
