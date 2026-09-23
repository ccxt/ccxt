import Exchange from '../abstract/prediction/sxbet.js';
import type Client from '../base/ws/Client.js';
import type { Balances, Dict, Int, int, Market, Num, PredictionEvent, PredictionOrder, PredictionOrderBook, PredictionPosition, PredictionSettlement, PredictionTicker, PredictionTickers, PredictionTrade, Str, Strings, fetchEventsParams } from '../base/types.js';
/**
 * @class sxbet
 * @augments Exchange
 */
export default class sxbet extends Exchange {
    describe(): any;
    /**
     * @method
     * @name sxbet#fetchMarkets
     * @description retrieves data on all active markets, each becomes one market with its two sides listed under the outcomes key
     * @see https://docs.sx.bet/api-reference/get-markets-active
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] max number of markets to collect (defaults to options.marketsPageSize * options.maxMarketsPages, 5000)
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @ignore
     * @method
     * @name sxbet#fetchRawMarketsPaged
     * @description pages through GET /markets/active (cursor-based via paginationKey/nextKey), stopping once options.maxMarketsPages pages or userLimit raw markets have been collected
     * @param {object} [extra] extra request params merged into every page (e.g. leagueId, sportId, sportXeventId)
     * @param {int} [userLimit] stop collecting once this many raw markets have been gathered
     * @returns {object[]} the raw (unparsed) sx.bet market objects
     */
    fetchRawMarketsPaged(extra?: Dict, userLimit?: Int): Promise<any[]>;
    /**
     * @ignore
     * @method
     * @name sxbet#filterRawMarketsByFixture
     * @description keeps only the raw markets belonging to one fixture — the venue's own sportXeventId filter on /markets/active is unreliable (observed live returning every fixture), so the scope is enforced client-side
     * @param {object[]} rawMarkets the raw sx.bet market objects
     * @param {string} sportXeventId the fixture id to keep
     * @returns {object[]} the raw markets of that fixture only
     */
    filterRawMarketsByFixture(rawMarkets: any[], sportXeventId: string): any[];
    /**
     * @ignore
     * @method
     * @name sxbet#parseSxbetMarket
     * @description converts a single raw sx.bet market into one ccxt market whose two sides become the outcomes
     * @param {object} raw the raw sx.bet market object
     * @returns {object} a [market structure](https://docs.ccxt.com/#/?id=market-structure)
     */
    parseSxbetMarket(raw: Dict): Market;
    /**
     * @method
     * @name sxbet#fetchEvents
     * @description fetches sx.bet fixtures (one fixture = one event, its markets are every moneyline/spread/total line on that fixture) scoped by eventId, leagueId, sportId or a free-text query/tags match against team and league names — always live from the API, never the local cache (it POPULATES the cache for later event()/outcome lookups). query/queries/tags are matched client-side over a bounded scan of /markets/active — the venue's GET /search covers team names only (not league or sport labels) and is not wired here yet
     * @see https://docs.sx.bet/api-reference/get-markets-active
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.eventId] direct lookup by unified event id (the sx.bet sportXeventId, e.g. 'L18870109')
     * @param {string} [params.query] free-text search matched against team and league names
     * @param {string[]} [params.queries] multiple free-text searches (alternative to query, unioned)
     * @param {string[]} [params.tags] matched identically to query/queries (sx.bet has no tag taxonomy)
     * @param {int} [params.leagueId] sx.bet league id (e.g. 243 for NFL) — fetched server-side
     * @param {int} [params.sportId] sx.bet sport id (e.g. 8 for Football) — fetched server-side
     * @param {string} [params.status] 'active' | 'inactive' | 'closed' | 'all'
     * @param {int} [params.limit] max number of events to return
     * @returns {object[]} an array of event structures
     */
    fetchEvents(params?: fetchEventsParams): Promise<PredictionEvent[]>;
    /**
     * @method
     * @name sxbet#fetchEvent
     * @description fetches a single sx.bet fixture (event) by its sportXeventId
     * @see https://docs.sx.bet/api-reference/get-markets-active
     * @param {string} id the sx.bet sportXeventId, e.g. 'L18870109'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    fetchEvent(id: string, params?: {}): Promise<PredictionEvent>;
    /**
     * @ignore
     * @method
     * @name sxbet#matchesEventQuery
     * @description checks a raw market's team/league names against a list of free-text queries, matching in either direction (a short user query inside a long name, or — since fetchEvents derives its fallback test query from an already-slugified handle — a long joined query containing a short name)
     * @param {object} raw the raw sx.bet market object
     * @param {string[]} queries lowercase-insensitive free-text queries
     * @returns {boolean} whether any query matches any of the market's team/league/outcome names
     */
    matchesEventQuery(raw: Dict, queries: string[]): boolean;
    /**
     * @ignore
     * @method
     * @name sxbet#parseEvent
     * @description groups a fixture's raw markets (all sharing one sportXeventId) into one unified event structure
     * @param {string} fixtureId the sx.bet sportXeventId
     * @param {object[]} rawMarkets the raw sx.bet market objects belonging to this fixture
     * @returns {object} an event structure
     */
    parseEvent(fixtureId: string, rawMarkets: any[]): any;
    /**
     * @ignore
     * @method
     * @name sxbet#loadSxObv3Metadata
     * @description fetches and caches GET /metadata/obv3 - the v3 orderbook metadata carrying the ready-made EIP-712 domain, the active base asset and the order size limits
     * @see https://docs.sx.bet/api-reference/get-metadata-obv3
     * @returns {object} the cached obv3 metadata data object
     */
    loadSxObv3Metadata(): Promise<Dict>;
    /**
     * @ignore
     * @method
     * @name sxbet#roundOddsToLadder
     * @description rounds an implied probability (0-1) to sx.bet's odds ladder (oddsLadderStepSize is in units of 1e-5, e.g. 125 -> a 0.125% step) — a maker's percentageOdds is rejected unless it lands exactly on the ladder
     * @param {string} probability the implied probability in decimal-string form (0-1)
     * @param {string} oddsLadderStepSize the raw oddsLadderStepSize from /metadata/obv3 (e.g. '125')
     * @returns {string} the probability rounded to the nearest ladder step, in decimal-string form
     */
    roundOddsToLadder(probability: Str, oddsLadderStepSize: string): string;
    /**
     * @ignore
     * @method
     * @name sxbet#hashEip712Digest
     * @description hashes an EIP-712 encoded payload (domainSeparator‖structHash, prefixed with 0x1901 by ethEncodeStructuredData) down to the final 32-byte digest to sign, used by sx.bet's taker-fill and cancel signatures
     * @param {Uint8Array} encoded the output of this.ethEncodeStructuredData (domain, types, message)
     * @returns {string} the 32-byte digest to ecdsa-sign, in '0x'-prefixed hex form
     */
    hashEip712Digest(encoded: any): string;
    /**
     * @ignore
     * @method
     * @name sxbet#signDigest
     * @description ecdsa-signs a 32-byte digest and assembles the r‖s‖v hex signature sx.bet expects
     * @param {string} digest the '0x'-prefixed 32-byte digest to sign
     * @param {string} privateKey the signer's private key
     * @returns {string} a '0x'-prefixed 65-byte hex signature (r‖s‖v)
     */
    signDigest(digest: string, privateKey: string): string;
    /**
     * @ignore
     * @method
     * @name sxbet#fetchErc20Name
     * @description reads an ERC20 token's name() via eth_call (needed for the Permit EIP-712 domain — must match the token's real on-chain name or the signature fails verification)
     * @param {string} rpcUrl the RPC endpoint to call
     * @param {string} tokenAddress the token contract address
     * @returns {string} the token's on-chain name
     */
    fetchErc20Name(rpcUrl: Str, tokenAddress: string): Promise<string>;
    /**
     * @ignore
     * @method
     * @name sxbet#hexToInt
     * @description parses a hex string (no '0x' prefix) into an integer — plain digit-by-digit, since JS's parseInt (hex, 16) two-argument form has no portable equivalent across languages/transpilers. Only used for small values (byte lengths, permit nonces), safe well within the float-precision range
     * @param {string} hex the hex string, no '0x' prefix
     * @returns {int} the parsed integer
     */
    hexToInt(hex: string): number;
    /**
     * @ignore
     * @method
     * @name sxbet#fetchSxbetProxy
     * @description fetches the account's obv3 proxy wallet state
     * @see https://docs.sx.bet/api-reference/get-user-proxy
     * @returns {object} the raw proxy data ({obv3ProxyWalletAddress, deployed, multisigSafeAddress})
     */
    fetchSxbetProxy(): Promise<Dict>;
    /**
     * @method
     * @name sxbet#approve
     * @description funds the account's obv3 proxy wallet - v3 trading capital must sit inside the proxy. Deploys the proxy first when absent, then moves USDC from the wallet into it via a gasless EIP-2612 Permit signature (POST /user/transfer-to-proxy)
     * @see https://docs.sx.bet/api-reference/post-user-transfer-to-proxy
     * @see https://docs.sx.bet/api-reference/post-user-deploy-proxy
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.amount] the USDC amount to move into the proxy (required)
     * @param {string} [params.tokenAddress] the token to transfer, defaults to the active base token
     * @param {string} [params.spender] the transfer executor granted the permit, defaults to options.transferToProxySpender or the obv3 transferToProxyExecutorAddress
     * @param {int} [params.deadline] unix seconds the permit signature expires at, defaults to options.approveDeadlineSeconds from now
     * @param {string} [params.rpcUrl] overrides the chain's default RPC endpoint (see options.chains)
     * @returns {object} a dict with the raw response and the transfer sessionId
     */
    approve(params?: {}): Promise<any>;
    /**
     * @method
     * @name sxbet#createOrder
     * @description places an order on sx.bet's v3 unified orderbook - a 'limit' order rests with GTC time-in-force, a 'market' order fills immediately with IOC (or FOK via params.timeInForce). sx.bet has no shares - 'amount' is the USDC stake to risk, and 'price' is the implied probability (0-1) of the requested outcome. 'sell' bets the OPPOSITE outcome of the one requested (sx.bet is bilateral: there is no owned position to sell, only the complementary side of the same market)
     * @see https://docs.sx.bet/api-reference/post-orders-v3
     * @param {string} outcome unified outcome or outcome token id
     * @param {string} type 'limit' (GTC resting order) or 'market' (IOC immediate fill)
     * @param {string} side 'buy' backs the requested outcome, 'sell' backs the complementary one
     * @param {float} amount the USDC amount to stake/risk
     * @param {float} [price] implied probability (0-1) of the requested outcome; required for both order types
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] overrides the derived value - 'GTC', 'IOC' or 'FOK'
     * @param {int} [params.expiry] unix seconds the order expires at; must be in the future (zero and past values are rejected, so is anything inside the fixture's betting-delay window - /metadata/obv3 resolves the delay per sport/league, live vs pregame), defaults to options.defaultOrderExpirySeconds from now
     * @param {string} [params.salt] overrides the random salt differentiating this order
     * @param {string} [params.clientOrderId] caller-chosen id echoed back on reads (max 64 chars)
     * @param {boolean} [params.waitForOutcome] wait for the matching outcome inline (default true)
     * @param {boolean} [params.useBetCredits] fund the stake from bet credits instead of the proxy balance (IOC/FOK only)
     * @param {string} [params.externalUserId] partner attribution id echoed back on order, fill and trade reads
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    createOrder(outcome: string, type: Str, side: Str, amount: Num, price?: Num, params?: {}): Promise<PredictionOrder>;
    /**
     * @ignore
     * @method
     * @name sxbet#parseSxbetCancelResponse
     * @description parses the shared v3 cancel response ({cancelled, notCancelled, unconfirmed}) into order structures
     * @param {object} response the raw DELETE /orders-v3 response
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    parseSxbetCancelResponse(response: Dict): PredictionOrder[];
    /**
     * @method
     * @name sxbet#cancelOrder
     * @description cancels one resting maker order - v3 cancels are plain api-key-authenticated DELETE requests, no signature involved
     * @see https://docs.sx.bet/api-reference/delete-orders-v3
     * @param {string} id the order id
     * @param {string} [outcome] not used by sxbet.cancelOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    cancelOrder(id: string, outcome?: Str, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name sxbet#cancelOrders
     * @description cancels multiple resting maker orders in one request - v3 cancels are plain api-key-authenticated DELETE requests, no signature involved
     * @see https://docs.sx.bet/api-reference/delete-orders-v3
     * @param {string[]} ids the order ids to cancel
     * @param {string} [outcome] not used by sxbet.cancelOrders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    cancelOrders(ids: string[], outcome?: Str, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name sxbet#cancelAllOrders
     * @description cancels every resting maker order of the account, or every order of one fixture via params.eventId - v3 cancels are plain api-key-authenticated DELETE requests, no signature involved
     * @see https://docs.sx.bet/api-reference/delete-orders-v3-all
     * @see https://docs.sx.bet/api-reference/delete-orders-v3-event
     * @param {string} [outcome] not used by sxbet.cancelAllOrders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.eventId] cancels every order across every market of this fixture instead of the account-wide path (params.sportXeventId is accepted too)
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    cancelAllOrders(outcome?: Str, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @ignore
     * @method
     * @name sxbet#parsePredictionOrder
     * @description parses one raw GET /orders row into a unified prediction order. every sx.bet maker order is a 'buy' of the outcome it bets on (isMakerBettingOutcomeOne selects the side), priced at the maker's own implied probability
     * @param {object} order the raw sx.bet order object
     * @param {object} [market] the outcome object the order belongs to (resolved from the cache by outcomeId when omitted)
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    parsePredictionOrder(order: Dict, market?: Market): PredictionOrder;
    /**
     * @ignore
     * @method
     * @name sxbet#clampSxbetPerPage
     * @description clamps a user limit to the venue's hard perPage ceiling - every v3 listing route rejects perPage above 100, and deeper history is reachable through the nextKey cursor instead
     * @param {int} limit the user-requested limit
     * @returns {int} the limit clamped to at most 100
     */
    clampSxbetPerPage(limit: Int): Int;
    /**
     * @method
     * @name sxbet#fetchOpenOrders
     * @description fetches the account's resting maker orders via the api-key-authenticated GET /orders-v3 (the route is hardcoded to ACTIVE orders and scoped to the key's account)
     * @see https://docs.sx.bet/api-reference/get-orders-v3
     * @param {string} [outcome] unified outcome or outcomeId — narrows to that outcome's market
     * @param {int} [since] applied client-side (the route has no date filter; rows carry createdAt)
     * @param {int} [limit] the maximum number of orders to return (server-side perPage, max 100, default 50)
     * @param {object} [params] extra parameters specific to the exchange API endpoint (e.g. eventId, sortBy, sortAsc, nextKey)
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOpenOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name sxbet#fetchOrders
     * @description fetches the account's maker orders. sx.bet's GET /orders-v3 listing is hardcoded to ACTIVE orders — filled/cancelled/expired orders leave the listing permanently (their history is only reconstructable from fills), so this returns the same set that fetchOpenOrders returns
     * @see https://docs.sx.bet/api-reference/get-orders-v3
     * @param {string} [outcome] unified outcome or outcomeId — narrows to that outcome's market
     * @param {int} [since] applied client-side (the route has no date filter; rows carry createdAt)
     * @param {int} [limit] the maximum number of orders to return (server-side perPage, max 100, default 50)
     * @param {object} [params] extra parameters specific to the exchange API endpoint (e.g. eventId, sortBy, sortAsc, nextKey)
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name sxbet#fetchOrder
     * @description fetches a single maker order by its order hash - unlike the listing, GET /orders-v3/{orderId} also serves filled, cancelled and expired orders while they still exist. a missing or foreign id 404s with 'Order not found', surfaced through handleErrors's OrderNotFound mapping
     * @see https://docs.sx.bet/api-reference/get-order-v3
     * @param {string} id the order hash
     * @param {string} [outcome] unified outcome or outcomeId (labelling hint only, the request needs just the id)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOrder(id: Str, outcome?: Str, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name sxbet#fetchTrades
     * @description fetches the public trade tape of one outcome's market — every bettor's settled and in-flight bets on that market. the venue requires the trades listing to be scoped, so the outcome argument is mandatory
     * @see https://docs.sx.bet/api-reference/get-trades-v3-public
     * @param {string} outcome unified outcome or outcomeId
     * @param {int} [since] timestamp in ms of the earliest trade to return — applied client-side over the newest page (the public tape serves newest-first and has no date filter; older pages are reachable through params.nextKey)
     * @param {int} [limit] the maximum number of trades to return (server-side perPage, max 100, default 50)
     * @param {object} [params] extra parameters specific to the exchange API endpoint (e.g. eventId, nextKey)
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    fetchTrades(outcome: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @method
     * @name sxbet#fetchMyTrades
     * @description fetches the account's fills (matched legs of its own orders, both taker and maker side) via the api-key-authenticated GET /fills-v3
     * @see https://docs.sx.bet/api-reference/get-fills-v3
     * @param {string} [outcome] unified outcome or outcomeId — narrows to that outcome's market and drops the opposite side's legs
     * @param {int} [since] timestamp in ms of the earliest fill to fetch (server-side startDate)
     * @param {int} [limit] the maximum number of fills to return (server-side perPage, max 100, default 50)
     * @param {object} [params] extra parameters specific to the exchange API endpoint (e.g. tradeId, orderId, endDate, sortAsc, nextKey)
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    fetchMyTrades(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @ignore
     * @method
     * @name sxbet#parseSxbetV3Fill
     * @description parses one GET /fills-v3 row into a unified trade - each fill is one maker/taker match of the wallet's own order
     * @param {object} fill the raw fill row
     * @param {object} [market] the outcome object labelling hint
     * @returns {object} a [prediction trade structure](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    parseSxbetV3Fill(fill: Dict, market?: Market): PredictionTrade;
    /**
     * @method
     * @name sxbet#fetchBalance
     * @description fetches the account's order-spendable proxy balance from GET /user/balance-v3 - v3 trading capital sits inside the obv3 proxy wallet (funded via approve()), and GTC posting is checked against availableAmount. free is the spendable availableAmount, used the escrowedAmount locked behind open bets
     * @see https://docs.sx.bet/api-reference/get-user-balance-v3
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name sxbet#fetchPositions
     * @description fetches the account's open positions from the venue's per-market aggregates (GET /positions-v3, MATCHED and LOCKED bets by default; override with params.status - the enum is MATCHED, LOCKED, SETTLED, FAILED, and pnl is populated only when the filter is exclusively SETTLED). contracts is the total stake at risk, entryPrice the blended implied probability of the market's best-case outcome
     * @see https://docs.sx.bet/api-reference/get-positions-v3
     * @param {string[]} [outcomes] filter by unified outcomes or outcomeIds
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    fetchPositions(outcomes?: Strings, params?: {}): Promise<PredictionPosition[]>;
    /**
     * @ignore
     * @method
     * @name sxbet#parseSxbetV3Position
     * @description parses one GET /positions-v3 row (per-market aggregate) into a unified position on the market's best-case outcome
     * @param {object} raw the raw position row
     * @returns {object} a [prediction position structure](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    parseSxbetV3Position(raw: Dict): PredictionPosition;
    /**
     * @method
     * @name sxbet#fetchSettlements
     * @description fetches the account's settled bets — each settled GET /trades-v3 row becomes one settlement with the resolved winner, the payout (stake / odds when won, the stake back when the market voided, zero when lost) and the realized pnl
     * @see https://docs.sx.bet/api-reference/get-trades-v3
     * @param {string} [outcome] filter to a single unified outcome or outcomeId
     * @param {int} [since] timestamp in ms of the earliest settlement to fetch (server-side startDate on the bet time)
     * @param {int} [limit] the maximum number of settlements to fetch (server-side perPage, max 100, default 50)
     * @param {object} [params] extra parameters specific to the exchange API endpoint (e.g. eventId, endDate, sortAsc, nextKey)
     * @returns {object[]} a list of prediction settlement structures
     */
    fetchSettlements(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionSettlement[]>;
    /**
     * @ignore
     * @method
     * @name sxbet#parseSettlement
     * @description parses one settled GET /trades-v3 row into the unified prediction settlement shape. the raw `outcome` field carries the winner, 1 or 2, with 0 for a voided market, and the full payout of a winning bet is stake / odds (the implied probability the bettor received)
     * @param {object} trade the raw settled sx.bet trade
     * @param {object} [market] a resolved outcome/market hint
     * @returns {object} a prediction settlement structure
     */
    parseSettlement(trade: Dict, market?: Market): any;
    /**
     * @ignore
     * @method
     * @name sxbet#fetchSxbetBookSnapshot
     * @description fetches the v3 aggregated order book snapshot of one market ({outcomeOne, outcomeTwo, version} price levels)
     * @see https://docs.sx.bet/api-reference/get-orderbook-snapshot
     * @param {string} marketHash the market hash
     * @returns {object} the raw snapshot data
     */
    fetchSxbetBookSnapshot(marketHash: Str): Promise<Dict>;
    /**
     * @method
     * @name sxbet#fetchTicker
     * @description fetches the current best resting odds for a single sx.bet outcome. sx.bet is a peer-to-peer odds book (no matched-trade tape or candles), so bid/ask are the best (highest) percentageOdds resting on this outcome's own side and its mirror (1 - best percentageOdds resting on the opposite outcome)
     * @see https://docs.sx.bet/api-reference/get-orderbook-snapshot
     * @param {string} outcome unified outcome handle or outcomeId (marketHash or marketHash + '-2')
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    fetchTicker(outcome: Str, params?: {}): Promise<PredictionTicker>;
    /**
     * @ignore
     * @method
     * @name sxbet#fetchSxbetBestOdds
     * @description fetches the best resting level of both sides for a set of markets in one request
     * @see https://docs.sx.bet/api-reference/get-best-odds-v3
     * @param {string[]} marketHashes the market hashes to query, at most 100 per call
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} the raw bestOdds rows ({marketHash, outcomeOne, outcomeTwo})
     */
    fetchSxbetBestOdds(marketHashes: string[], params?: {}): Promise<any[]>;
    /**
     * @ignore
     * @method
     * @name sxbet#parseSxbetSnapshotBestOdds
     * @description reduces a v3 book snapshot to the legacy best-odds shape the ticker parser consumes ({marketHash, outcomeOne: {percentageOdds}, outcomeTwo: {percentageOdds}})
     * @param {object} snapshot the raw snapshot data
     * @returns {object} the best-odds shaped dict
     */
    parseSxbetSnapshotBestOdds(snapshot: Dict): Dict;
    /**
     * @method
     * @name sxbet#fetchTickers
     * @description fetches the current best resting odds for multiple sx.bet outcomes, one book snapshot per market
     * @see https://docs.sx.bet/api-reference/get-orderbook-snapshot
     * @param {string[]} outcomes unified outcomes - required: sx.bet has thousands of markets and no endpoint returning all of them at once
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure) indexed by outcome
     */
    fetchTickers(outcomes?: Strings, params?: {}): Promise<PredictionTickers>;
    /**
     * @ignore
     * @method
     * @name sxbet#parseSxbetTickersByHash
     * @description assembles the unified tickers dict from best-odds shaped rows keyed by market hash
     * @param {string[]} outcomesList the requested unified outcomes
     * @param {object} rowsByHash best-odds rows indexed by market hash
     * @returns {object} a dictionary of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure) indexed by outcome
     */
    parseSxbetTickersByHash(outcomesList: string[], rowsByHash: Dict): PredictionTickers;
    /**
     * @ignore
     * @method
     * @name sxbet#parsePredictionTicker
     * @description parses one /orders/odds/best entry into a unified ticker for one side of the market
     * @param {object} raw one bestOdds entry ({ marketHash, baseToken, outcomeOne: { percentageOdds, updatedAt }, outcomeTwo: {...} })
     * @param {object} [market] the outcome object the ticker belongs to
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    parsePredictionTicker(raw: Dict, market?: Market): PredictionTicker;
    /**
     * @method
     * @name sxbet#fetchOrderBook
     * @description fetches the resting maker order book for a single sx.bet outcome. bids are maker orders already betting on this outcome (priced at each maker's own implied probability, sized by their remaining stake); asks mirror the opposite outcome's maker orders (price = 1 - their implied probability, sized by how much a taker could bet against them, per sx.bet's remaining-taker-space formula) — the same YES/NO-style mirrored construction used across this codebase's other binary prediction venues
     * @see https://docs.sx.bet/api-reference/get-orderbook-snapshot
     * @param {string} outcome unified outcome handle or outcomeId
     * @param {int} [limit] the maximum number of bids/asks to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)
     */
    fetchOrderBook(outcome: Str, limit?: Int, params?: {}): Promise<PredictionOrderBook>;
    /**
     * @ignore
     * @method
     * @name sxbet#parseSxbetV3BookSides
     * @description converts a v3 aggregated book snapshot into sorted [price, amount] bid/ask levels for one outcome; shared by fetchOrderBook and the websocket book handler
     * @param {object} snapshot the raw snapshot ({outcomeOne, outcomeTwo} level lists of {percentageOdds, size})
     * @param {boolean} isOutcomeOne whether the book is built for the market's outcome one
     * @returns {object} a dict with sorted 'bids' and 'asks' lists
     */
    parseSxbetV3BookSides(snapshot: Dict, isOutcomeOne: boolean): Dict;
    requestId(url: Str): number;
    /**
     * @ignore
     * @method
     * @name sxbet#registerSxbetWsRequest
     * @description tracks an outgoing Centrifugo connect/subscribe command by its request id, so an error reply can be correlated back to the awaiting future and its registered subscription hash (see handleCentrifugoFrame)
     * @param {int} requestId the id sent with the command
     * @param {string} messageHash the future hash the caller awaits
     * @param {string} subscription the subscription hash registered by watch() ('connect' or the channel name)
     */
    registerSxbetWsRequest(requestId: number, messageHash: string, subscription: string): void;
    /**
     * @ignore
     * @method
     * @name sxbet#fetchSxbetRealtimeToken
     * @description fetches the short-lived Centrifugo connection token from the relayer; requires the apiKey credential (X-Api-Key header)
     * @see https://docs.sx.bet/developers/realtime-initialization
     * @returns {string} the JWT connection token
     */
    fetchSxbetRealtimeToken(): Promise<Str>;
    connectSxbetCentrifugo(url: Str): Promise<any>;
    pong(client: Client, message?: any): Promise<void>;
    subscribeSxbetChannel(messageHash: string, channel: string): Promise<any>;
    handleMessage(client: Client, message: any): void;
    handleCentrifugoFrame(client: Client, msg: any): void;
    /**
     * @method
     * @name sxbet#watchOrderBook
     * @description streams the order book of an outcome - the v3 channel publishes the entire aggregated book on every update with a monotonic version, so each message replaces the held book
     * @see https://docs.sx.bet/api-reference/channel-orderbook-v3
     * @param {string} outcome unified outcome or outcome token id
     * @param {int} [limit] the maximum number of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)
     */
    watchOrderBook(outcome: string, limit?: Int, params?: {}): Promise<PredictionOrderBook>;
    /**
     * @ignore
     * @method
     * @name sxbet#applySxbetWsSnapshot
     * @description applies one full v3 book publication ({marketHash, version, outcomeOne, outcomeTwo}) to every watched outcome of that market, honoring the monotonic version
     * @param {object} snapshot the raw book publication
     * @returns {string[]} the outcome handles whose books were refreshed
     */
    applySxbetWsSnapshot(snapshot: Dict): string[];
    handleOrderBook(client: Client, rows: any[]): void;
    /**
     * @method
     * @name sxbet#watchTicker
     * @description streams best-odds updates of an outcome; the venue channel is global, entries are filtered down to the requested outcome's market
     * @see https://docs.sx.bet/api-reference/channel-best-odds-v3
     * @param {string} outcome unified outcome or outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    watchTicker(outcome: string, params?: {}): Promise<PredictionTicker>;
    handleTicker(client: Client, rows: any[]): void;
    /**
     * @method
     * @name sxbet#watchTrades
     * @description streams public bets of an outcome; the venue channel is global, entries are filtered down to the requested outcome
     * @see https://docs.sx.bet/api-reference/channel-recent-trades-v3
     * @param {string} outcome unified outcome or outcome token id
     * @param {int} [since] timestamp in ms of the earliest trade to return
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    watchTrades(outcome: string, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @ignore
     * @method
     * @name sxbet#parseSxbetV3PublicTrade
     * @description parses one recent_trades_v3 publication (public TradeV3 shape) into a unified trade
     * @param {object} trade the raw public trade row
     * @returns {object} a [prediction trade structure](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    parseSxbetV3PublicTrade(trade: Dict): PredictionTrade;
    handleTrades(client: Client, rows: any[]): void;
    /**
     * @method
     * @name sxbet#watchMyTrades
     * @description streams the authenticated wallet's fills over its per-account v3 channel
     * @see https://docs.sx.bet/api-reference/channel-fills-v3
     * @param {string} [outcome] unified outcome or outcome token id to narrow the stream down to
     * @param {int} [since] timestamp in ms of the earliest trade to return
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    watchMyTrades(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    handleMyTrade(client: Client, rows: any[]): void;
    /**
     * @method
     * @name sxbet#watchOrders
     * @description streams updates of the authenticated wallet's orders over its per-account v3 channel
     * @see https://docs.sx.bet/api-reference/channel-orders-v3
     * @param {string} [outcome] unified outcome or outcome token id to narrow the stream down to
     * @param {int} [since] timestamp in ms of the earliest order to return
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    watchOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    handleOrder(client: Client, rows: any[]): void;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): undefined;
    /**
     * @ignore
     * @method
     * @name sxbet#sign
     * @description builds the request url and attaches the x-sx-api-key header; every private v3 route authenticates with the apiKey credential, so its absence fails fast instead of surfacing a raw 401
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
