import Exchange from '../abstract/prediction/jupiter.js';
import { ArgumentsRequired, BadSymbol, ExchangeError, InvalidOrder } from '../base/errors.js';
import { DECIMAL_PLACES } from '../base/functions/number.js';
import type { Dict, Int, Market, Num, PredictionEvent, PredictionMarket, PredictionOrder, PredictionOrderBook, PredictionOutcome, PredictionPosition, PredictionTicker, PredictionTrade, Status, Str, Strings } from '../base/types.js';

/**
 * @class jupiter
 * @augments PredictionExchange
 */
export default class jupiter extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'jupiter',
            'name': 'Jupiter Prediction',
            'countries': [],
            'rateLimit': 1000,
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'prediction': true,
                'fetchEvents': true,
                'fetchEvent': true,
                'fetchMarkets': true,
                'fetchTicker': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchMyTrades': true,
                'fetchPositions': true,
                'fetchPosition': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchOrder': true,
                'fetchOrderTrades': true,
                'createOrder': true,
                'fetchStatus': true,
                'closePosition': true,
                'closeAllPositions': true,
                'redeemPosition': true,
            },
            'urls': {
                'logo': 'https://jup.ag/favicon.ico',
                'api': {
                    'public': 'https://api.jup.ag/prediction/v1',
                },
                'www': 'https://jup.ag/prediction',
                'doc': [ 'https://developers.jup.ag/docs/prediction' ],
            },
            'api': {
                'public': {
                    'get': [
                        'events',
                        'events/search',
                        'events/{id}',
                        'events/{eventId}/markets',
                        'events/{eventId}/markets/{marketId}',
                        'events/suggested/{pubkey}',
                        'events/scores',
                        'events/{id}/score',
                        'markets/{marketId}',
                        'orderbook/{marketId}',
                        'trading-status',
                        'orders',
                        'orders/{orderPubkey}',
                        'orders/status/{orderPubkey}',
                        'positions',
                        'positions/{positionPubkey}',
                        'history',
                        'trades',
                        'profiles/{ownerPubkey}',
                        'profiles/{ownerPubkey}/pnl-history',
                        'leaderboards',
                        'vault-info',
                        'forecast',
                    ],
                    'post': [
                        'orders',
                        'execute',
                        'positions/{positionPubkey}/claim',
                    ],
                    'delete': [
                        'positions',
                        'positions/{positionPubkey}',
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': true,
            },
            'precisionMode': DECIMAL_PLACES,
            'options': {
                'defaultType': 'prediction',
                'eventScopeParams': [ 'category' ],
                'fetchMarketsLimit': 50,
            },
        });
    }

    /**
     * @method
     * @name jupiter#fetchEvents
     * @description fetches Jupiter prediction events and their markets
     * @see https://developers.jup.ag/docs/prediction/events-and-markets
     * @param {object} params event query; at least query, eventId, or a supported filter is required
     * @param {string} [params.query] search query
     * @param {int} [params.limit] maximum number of events
     * @returns {object[]} prediction event structures
     */
    override async fetchEvents (params: Dict = {}): Promise<PredictionEvent[]> {
        this.requireEventQuery (params);
        const query = this.safeString (params, 'query');
        const eventId = this.safeString (params, 'eventId');
        const slug = this.safeString (params, 'slug');
        const request = this.omit (params, [ 'query', 'eventId', 'slug' ]);
        request['includeMarkets'] = this.safeBool (request, 'includeMarkets', true);
        if (query !== undefined) {
            request['query'] = query;
        }
        let response = undefined;
        if (eventId !== undefined) {
            response = await this.publicGetEventsId (this.extend ({ 'id': eventId }, request));
        } else if (query !== undefined || slug !== undefined) {
            if (slug !== undefined && query === undefined) {
                request['query'] = slug;
            }
            response = await this.publicGetEventsSearch (request);
        } else {
            response = await this.publicGetEvents (request);
        }
        let rows: any[] = [];
        if (Array.isArray (response)) {
            rows = response;
        } else if (eventId !== undefined) {
            const eventData = this.safeDict (response, 'data', response);
            rows = [ eventData ];
        } else {
            rows = this.safeList (response, 'data', this.safeList (response, 'events', []));
        }
        const events: PredictionEvent[] = [];
        for (let i = 0; i < rows.length; i++) {
            const event = this.parseJupiterEvent (rows[i]);
            this.indexEventOutcomes (event);
            events.push (event);
        }
        return this.applyEventFetchParams (events, params, (query === undefined) ? undefined : [ query ]);
    }

    /**
     * @method
     * @name jupiter#fetchEvent
     * @description fetches one Jupiter prediction event by id
     * @see https://developers.jup.ag/docs/prediction/events-and-markets
     * @param {string} id event id
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} a prediction event structure
     */
    override async fetchEvent (id: string, params: Dict = {}): Promise<PredictionEvent> {
        const response = await this.publicGetEventsId (this.extend ({ 'id': id }, params));
        const raw = this.safeDict (response, 'data', response);
        const event = this.parseJupiterEvent (raw);
        this.indexEventOutcomes (event);
        return event;
    }

    /**
     * @method
     * @name jupiter#fetchEventMarkets
     * @description fetches markets belonging to one Jupiter prediction event
     * @see https://developers.jup.ag/docs/prediction/events-and-markets
     * @param {string} eventId event identifier
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} prediction markets
     */
    async fetchEventMarkets (eventId: string, params: Dict = {}): Promise<PredictionMarket[]> {
        const response = await this.publicGetEventsEventIdMarkets (this.extend ({ 'eventId': eventId }, params));
        const raw = this.safeDict (response, 'data', response);
        const rows = Array.isArray (raw) ? raw : this.safeList (raw, 'markets', this.safeList (raw, 'data', []));
        const event = this.parseJupiterEvent ({ 'eventId': eventId, 'markets': rows });
        this.indexEventOutcomes (event);
        return event['markets'];
    }

    /**
     * @method
     * @name jupiter#fetchEventMarket
     * @description fetches one market belonging to a Jupiter prediction event
     * @see https://developers.jup.ag/docs/prediction/events-and-markets
     * @param {string} eventId event identifier
     * @param {string} marketId market identifier
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} prediction market
     */
    async fetchEventMarket (eventId: string, marketId: string, params: Dict = {}): Promise<PredictionMarket> {
        const response = await this.publicGetEventsEventIdMarketsMarketId (this.extend ({ 'eventId': eventId, 'marketId': marketId }, params));
        const raw = this.safeDict (response, 'data', response);
        const marketData = this.safeDict (raw, 'market', raw);
        const event = this.parseJupiterEvent ({ 'eventId': eventId, 'markets': [ marketData ] });
        this.indexEventOutcomes (event);
        const markets = event['markets'];
        if (markets.length === 0) {
            throw new ExchangeError (this.id + ' fetchEventMarket() returned no market for ' + marketId);
        }
        return markets[0];
    }

    /**
     * @method
     * @name jupiter#fetchSuggestedEvents
     * @description fetches prediction events suggested for a wallet
     * @see https://developers.jup.ag/docs/prediction/events-and-markets
     * @param {string} ownerPubkey wallet public key
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} prediction events
     */
    async fetchSuggestedEvents (ownerPubkey: string, params: Dict = {}): Promise<PredictionEvent[]> {
        const response = await this.publicGetEventsSuggestedPubkey (this.extend ({ 'pubkey': ownerPubkey }, params));
        const rows = this.safeList (response, 'data', this.safeList (response, 'events', []));
        const results: PredictionEvent[] = [];
        for (let i = 0; i < rows.length; i++) {
            const event = this.parseJupiterEvent (rows[i] as Dict);
            this.indexEventOutcomes (event);
            results.push (event);
        }
        return results;
    }

    /**
     * @method
     * @name jupiter#fetchEventScores
     * @description fetches scores for active Jupiter prediction events
     * @see https://developers.jup.ag/docs/prediction/events-and-markets
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} event scores
     */
    async fetchEventScores (params: Dict = {}): Promise<Dict[]> {
        const response = await this.publicGetEventsScores (params);
        return this.safeList (response, 'data', this.safeList (response, 'scores', []));
    }

    /**
     * @method
     * @name jupiter#fetchEventScore
     * @description fetches the score for one Jupiter prediction event
     * @see https://developers.jup.ag/docs/prediction/events-and-markets
     * @param {string} id event identifier
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} event score
     */
    async fetchEventScore (id: string, params: Dict = {}): Promise<Dict> {
        const response = await this.publicGetEventsIdScore (this.extend ({ 'id': id }, params));
        return this.safeDict (response, 'data', response);
    }

    /**
     * @method
     * @name jupiter#fetchPredictionProfile
     * @description fetches a Jupiter prediction profile
     * @see https://developers.jup.ag/docs/prediction/position-data
     * @param {string} ownerPubkey wallet public key
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} profile data
     */
    async fetchPredictionProfile (ownerPubkey: string, params: Dict = {}): Promise<Dict> {
        const response = await this.publicGetProfilesOwnerPubkey (this.extend ({ 'ownerPubkey': ownerPubkey }, params));
        return this.safeDict (response, 'data', response);
    }

    /**
     * @method
     * @name jupiter#fetchPredictionPnlHistory
     * @description fetches profit and loss history for a Jupiter prediction wallet
     * @see https://developers.jup.ag/docs/prediction/position-data
     * @param {string} ownerPubkey wallet public key
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} profile profit and loss history
     */
    async fetchPredictionPnlHistory (ownerPubkey: string, params: Dict = {}): Promise<Dict[]> {
        const response = await this.publicGetProfilesOwnerPubkeyPnlHistory (this.extend ({ 'ownerPubkey': ownerPubkey }, params));
        return this.safeList (response, 'data', this.safeList (response, 'history', []));
    }

    /**
     * @method
     * @name jupiter#fetchPredictionLeaderboards
     * @description fetches Jupiter prediction leaderboards
     * @see https://developers.jup.ag/docs/prediction/position-data
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} leaderboard entries
     */
    async fetchPredictionLeaderboards (params: Dict = {}): Promise<Dict[]> {
        const response = await this.publicGetLeaderboards (params);
        return this.safeList (response, 'data', this.safeList (response, 'leaderboards', []));
    }

    /**
     * @method
     * @name jupiter#fetchPredictionVaultInfo
     * @description fetches Jupiter prediction vault information
     * @see https://developers.jup.ag/docs/prediction
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} vault information
     */
    async fetchPredictionVaultInfo (params: Dict = {}): Promise<Dict> {
        const response = await this.publicGetVaultInfo (params);
        return this.safeDict (response, 'data', response);
    }

    /**
     * @method
     * @name jupiter#fetchPredictionForecast
     * @description fetches Jupiter prediction forecast data
     * @see https://developers.jup.ag/docs/prediction
     * @param {object} [params] endpoint parameters, including marketId
     * @returns {object} forecast data
     */
    async fetchPredictionForecast (params: Dict = {}): Promise<Dict> {
        const marketId = this.safeString (params, 'marketId');
        if (marketId === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchPredictionForecast() requires params.marketId');
        }
        const request = this.omit (params, [ 'marketId' ]);
        request['marketId'] = marketId;
        const response = await this.publicGetForecast (request);
        return this.safeDict (response, 'data', response);
    }

    /**
     * @method
     * @name jupiter#fetchMarkets
     * @description fetches prediction markets from scoped Jupiter prediction events
     * @see https://developers.jup.ag/docs/prediction/events-and-markets
     * @param {object} [params] extra parameters; use query, eventId, or category to scope the request
     * @returns {object[]} prediction market structures
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        const query = this.safeString (params, 'query');
        const eventId = this.safeString (params, 'eventId');
        const slug = this.safeString (params, 'slug');
        const category = this.safeString (params, 'category');
        const tags = this.safeList (params, 'tags', []);
        const hasScope = query !== undefined || eventId !== undefined || slug !== undefined || category !== undefined || tags.length > 0;
        let events: PredictionEvent[] = [];
        if (hasScope) {
            events = await this.fetchEvents (params);
        } else {
            const request = this.omit (params, [ 'limit' ]);
            request['limit'] = this.safeInteger (params, 'limit', this.safeInteger (this.options, 'fetchMarketsLimit', 50));
            request['includeMarkets'] = true;
            const response = await this.publicGetEvents (request);
            let rows: any[] = [];
            if (Array.isArray (response)) {
                rows = response;
            } else {
                rows = this.safeList (response, 'data', this.safeList (response, 'events', []));
            }
            for (let i = 0; i < rows.length; i++) {
                const event = this.parseJupiterEvent (rows[i]);
                this.indexEventOutcomes (event);
                events.push (event);
            }
        }
        const markets: Market[] = [];
        for (let i = 0; i < events.length; i++) {
            const eventMarkets = events[i]['markets'];
            for (let j = 0; j < eventMarkets.length; j++) {
                const market = eventMarkets[j];
                const raw = market['info'] as Dict;
                const id = market['id'];
                const row: Dict = {
                    'id': id,
                    'symbol': market['market'],
                    'base': id,
                    'quote': 'USD',
                    'baseId': id,
                    'quoteId': 'USD',
                    'settle': 'USD',
                    'settleId': 'USD',
                    'active': market['active'],
                    'type': 'prediction',
                    'subType': undefined,
                    'spot': false,
                    'margin': false,
                    'swap': false,
                    'future': false,
                    'option': false,
                    'prediction': true,
                    'contract': false,
                    'contractSize': undefined,
                    'linear': false,
                    'inverse': false,
                    'expiry': undefined,
                    'expiryDatetime': undefined,
                    'strike': undefined,
                    'optionType': undefined,
                    'precision': { 'amount': 0.000001, 'price': 0.000001, 'base': undefined, 'quote': undefined },
                    'limits': { 'amount': { 'min': undefined, 'max': undefined }, 'cost': { 'min': undefined, 'max': undefined }},
                    'created': undefined,
                    'taker': undefined,
                    'maker': undefined,
                    'percentage': false,
                    'tierBased': false,
                    'feeSide': undefined,
                    'info': raw,
                    'market': market['market'],
                    'marketType': market['marketType'],
                    'outcomes': market['outcomes'],
                };
                markets.push (row as Market);
            }
        }
        return markets;
    }

    /**
     * @method
     * @name jupiter#fetchTicker
     * @description fetches current yes or no prices for a prediction outcome
     * @see https://developers.jup.ag/docs/prediction/events-and-markets
     * @param {string} outcome prediction outcome handle
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} a prediction ticker structure
     */
    override async fetchTicker (outcome: string, params: Dict = {}): Promise<PredictionTicker> {
        const outcomeMarket = await this.loadOutcome (outcome);
        const marketId = this.safeString (outcomeMarket, 'marketId');
        if (marketId === undefined) {
            throw new BadSymbol (this.id + ' fetchTicker() could not resolve market id for ' + outcome);
        }
        const response = await this.publicGetMarketsMarketId (this.extend ({ 'marketId': marketId }, params));
        const raw = this.safeDict (response, 'data', response);
        const isYes = this.safeString (outcomeMarket, 'outcome', '').endsWith (':YES');
        const pricing = this.safeDict (raw, 'pricing', raw);
        const priceKey = (isYes) ? 'buyYesPriceUsd' : 'buyNoPriceUsd';
        const price = this.safeNumber (pricing, priceKey);
        const ticker: Dict = {
            'info': raw,
            'timestamp': this.parseJupiterTimestamp (this.safeInteger (raw, 'updatedAt')),
            'last': (price === undefined) ? undefined : price / 1000000,
            'close': (price === undefined) ? undefined : price / 1000000,
            'outcome': outcome,
            'outcomeId': this.safeString (outcomeMarket, 'outcomeId'),
            'market': this.safeString (outcomeMarket, 'market'),
        };
        return this.safePredictionTicker (ticker, outcomeMarket);
    }

    /**
     * @method
     * @name jupiter#fetchStatus
     * @description fetches the Jupiter prediction market trading status
     * @see https://developers.jup.ag/docs/prediction/trading-lifecycle
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} exchange status
     */
    override async fetchStatus (params: Dict = {}): Promise<Status> {
        const response = await this.publicGetTradingStatus (params);
        const raw = this.safeDict (response, 'data', response);
        const active = this.safeBool (raw, 'trading_active');
        return {
            'status': (active) ? 'ok' : 'maintenance',
            'updated': undefined,
            'eta': undefined,
            'url': 'https://developers.jup.ag/docs/prediction',
            'info': response,
        };
    }

    /**
     * @method
     * @name jupiter#fetchOrderBook
     * @description fetches the yes or no order book for a prediction outcome
     * @see https://developers.jup.ag/docs/prediction/events-and-markets
     * @param {string} outcome prediction outcome handle
     * @param {int} [limit] maximum number of book entries
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} a prediction order book structure
     */
    override async fetchOrderBook (outcome: string, limit: Int = undefined, params: Dict = {}): Promise<PredictionOrderBook> {
        const outcomeMarket = await this.loadOutcome (outcome);
        const marketId = this.safeString (outcomeMarket, 'marketId');
        if (marketId === undefined) {
            throw new BadSymbol (this.id + ' fetchOrderBook() could not resolve market id for ' + outcome);
        }
        const request = this.omit (params, [ 'limit' ]);
        request['marketId'] = marketId;
        const response = await this.publicGetOrderbookMarketId (request);
        const raw = this.safeDict (response, 'data', response);
        const side = this.safeString (outcomeMarket, 'outcome', '').endsWith (':YES') ? 'yes' : 'no';
        const bidKey = (side === 'yes') ? 'yes_dollars' : 'no_dollars';
        const oppositeBidKey = (side === 'yes') ? 'no_dollars' : 'yes_dollars';
        const bids = this.parsePredictionBookSide (this.safeList (raw, bidKey, []), limit);
        const oppositeBids = this.parsePredictionBookSide (this.safeList (raw, oppositeBidKey, []));
        const asks: [Num, Num][] = [];
        for (let i = oppositeBids.length - 1; i >= 0; i--) {
            const level = oppositeBids[i];
            if (level === undefined) {
                continue;
            }
            const oppositePrice = level[0];
            const amount = level[1];
            if (oppositePrice === undefined || amount === undefined) {
                continue;
            }
            const askPrice = 1 - oppositePrice;
            if (askPrice >= 0) {
                asks.push ([ askPrice, amount ]);
            }
        }
        if (limit !== undefined && asks.length > limit) {
            asks.splice (limit, asks.length - limit);
        }
        const book: Dict = {
            'bids': bids,
            'asks': asks,
            'timestamp': this.safeInteger (raw, 'timestamp'),
            'datetime': this.iso8601 (this.safeInteger (raw, 'timestamp')),
            'nonce': this.safeInteger (raw, 'nonce'),
            'outcome': outcome,
            'outcomeId': this.safeString (outcomeMarket, 'outcomeId'),
            'market': this.safeString (outcomeMarket, 'market'),
            'info': raw,
        };
        return book as PredictionOrderBook;
    }

    /**
     * @method
     * @name jupiter#fetchTrades
     * @description fetches recent filled prediction trades for one outcome
     * @see https://developers.jup.ag/docs/api-reference/prediction/get-trades
     * @param {string} outcome prediction outcome handle
     * @param {int} [since] earliest trade timestamp in milliseconds
     * @param {int} [limit] maximum number of trades
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} prediction trade structures
     */
    override async fetchTrades (outcome: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionTrade[]> {
        const outcomeMarket = await this.loadOutcome (outcome);
        const marketId = this.safeString (outcomeMarket, 'marketId');
        if (marketId === undefined) {
            throw new BadSymbol (this.id + ' fetchTrades() could not resolve market id for ' + outcome);
        }
        const request = this.omit (params, [ 'since', 'limit' ]);
        request['marketId'] = marketId;
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTrades (request);
        const rows = this.safeList (response, 'data', []);
        return this.parsePredictionTrades (rows, outcomeMarket, since, limit);
    }

    /**
     * @method
     * @name jupiter#fetchMyTrades
     * @description fetches the user's filled prediction trades from account history
     * @see https://developers.jup.ag/docs/api-reference/prediction/get-history
     * @param {string} [outcome] prediction outcome handle
     * @param {int} [since] earliest trade timestamp in milliseconds
     * @param {int} [limit] maximum number of trades
     * @param {object} [params] requires ownerPubkey or a configured walletAddress
     * @returns {object[]} prediction trade structures
     */
    override async fetchMyTrades (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionTrade[]> {
        const ownerPubkey = this.safeString (params, 'ownerPubkey', this.walletAddress);
        if (ownerPubkey === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires ownerPubkey or walletAddress');
        }
        const request = this.omit (params, [ 'ownerPubkey', 'since', 'limit' ]);
        request['ownerPubkey'] = ownerPubkey;
        request['start'] = 0;
        if (limit !== undefined) {
            request['end'] = limit;
        }
        const response = await this.publicGetHistory (request);
        const rows = this.safeList (response, 'data', []);
        const filled: Dict[] = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i] as Dict;
            if (this.safeString (row, 'eventType') === 'order_filled') {
                filled.push (row);
            }
        }
        let outcomeMarket = undefined;
        if (outcome !== undefined) {
            outcomeMarket = await this.loadOutcome (outcome);
        }
        return this.parsePredictionTrades (filled, outcomeMarket, since, limit);
    }

    /**
     * @method
     * @name jupiter#fetchOrderTrades
     * @description fetches fill history associated with one prediction order
     * @see https://developers.jup.ag/docs/api-reference/prediction/get-history
     * @param {string} id order public key
     * @param {string} [outcome] prediction outcome handle
     * @param {int} [since] earliest trade timestamp in milliseconds
     * @param {int} [limit] maximum number of trades
     * @param {object} [params] requires ownerPubkey or a configured walletAddress
     * @returns {object[]} prediction trade structures
     */
    override async fetchOrderTrades (id: string, outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionTrade[]> {
        const trades = await this.fetchMyTrades (outcome, since, limit, params);
        const result: PredictionTrade[] = [];
        for (let i = 0; i < trades.length; i++) {
            if (trades[i]['order'] === id) {
                result.push (trades[i]);
            }
        }
        return result;
    }

    /**
     * @method
     * @name jupiter#createOrder
     * @description creates a prediction order and returns the unsigned transaction for caller signing
     * @see https://developers.jup.ag/docs/prediction/open-positions
     * @param {string} outcome prediction outcome handle
     * @param {string} type order type
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount number of contracts
     * @param {float} [price] outcome probability
     * @param {object} [params] must include ownerPubkey, depositAmount, and depositMint
     * @param {string} [params.ownerPubkey] wallet public key
     * @param {string} [params.depositAmount] collateral amount in token base units
     * @param {string} [params.depositMint] collateral token mint
     * @returns {object} prediction order metadata; info.transaction must be signed and submitted by the caller
     */
    override async createOrder (outcome: string, type: string, side: string, amount: number, price: Num = undefined, params: Dict = {}): Promise<PredictionOrder> {
        const outcomeMarket = await this.loadOutcome (outcome);
        const marketId = this.safeString (outcomeMarket, 'marketId');
        const ownerPubkey = this.safeString (params, 'ownerPubkey', this.walletAddress);
        const depositAmount = this.safeString (params, 'depositAmount');
        const depositMint = this.safeString (params, 'depositMint');
        if (marketId === undefined || ownerPubkey === undefined || depositAmount === undefined || depositMint === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires ownerPubkey, depositAmount, and depositMint');
        }
        if (type !== 'market') {
            throw new InvalidOrder (this.id + ' createOrder() supports market buy orders only; use closePosition() to sell held contracts');
        }
        if (side !== 'buy') {
            throw new InvalidOrder (this.id + ' createOrder() supports buy orders only; use closePosition() to sell held contracts');
        }
        if (amount <= 0) {
            throw new InvalidOrder (this.id + ' createOrder() amount must be positive');
        }
        const isYes = this.safeString (outcomeMarket, 'outcome', '').endsWith (':YES');
        const request: Dict = {
            'ownerPubkey': ownerPubkey,
            'marketId': marketId,
            'isYes': isYes,
            'isBuy': side === 'buy',
            'contracts': this.numberToString (amount),
            'depositAmount': depositAmount,
            'depositMint': depositMint,
        };
        const response = await this.publicPostOrders (request);
        const rawOrder = this.safeDict (response, 'order', {});
        const id = this.safeString (rawOrder, 'orderPubkey');
        const timestamp = this.milliseconds ();
        const result: Dict = {
            'id': id,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': 'pending',
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': 0,
            'remaining': amount,
            'cost': undefined,
            'fee': undefined,
            'reduceOnly': false,
            'postOnly': false,
            'outcome': outcome,
            'outcomeId': this.safeString (outcomeMarket, 'outcomeId'),
            'label': this.safeString (outcomeMarket, 'label'),
            'market': this.safeString (outcomeMarket, 'market'),
            'event': this.safeString (outcomeMarket, 'event'),
            'trades': [],
            'info': response,
        };
        return result as PredictionOrder;
    }

    /**
     * @method
     * @name jupiter#executePredictionTransaction
     * @description submits a caller-signed Jupiter prediction transaction with its original execution context
     * @see https://developers.jup.ag/docs/prediction/trading-lifecycle
     * @param {string} signedTransaction base64-encoded signed Solana transaction
     * @param {object} [executionContext] the unchanged execution.context returned with the unsigned transaction
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} Jupiter transaction execution result
     */
    async executePredictionTransaction (signedTransaction: string, executionContext: Dict | undefined = undefined, params: Dict = {}): Promise<Dict> {
        if (signedTransaction === '') {
            throw new ArgumentsRequired (this.id + ' executePredictionTransaction() requires a signed transaction');
        }
        const request = this.omit (params, [ 'signedTransaction', 'executionContext' ]);
        request['signedTransaction'] = signedTransaction;
        if (executionContext !== undefined) {
            request['context'] = executionContext;
        }
        const response = await this.publicPostExecute (request);
        return this.safeDict (response, 'data', response);
    }

    /**
     * @method
     * @name jupiter#fetchOrder
     * @description fetches prediction order execution status
     * @see https://developers.jup.ag/docs/prediction/open-positions
     * @param {string} id order public key
     * @param {string} [outcome] prediction outcome handle
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} prediction order status
     */
    async fetchOrder (id: string, outcome: Str = undefined, params: Dict = {}): Promise<PredictionOrder> {
        const response = await this.publicGetOrdersOrderPubkey (this.extend ({ 'orderPubkey': id }, params));
        const data = this.safeDict (response, 'data', response);
        const raw = this.safeDict (data, 'order', data);
        const orderData = this.extend ({}, raw);
        if (outcome !== undefined) {
            orderData['outcome'] = outcome;
        } else {
            const marketId = this.safeString (raw, 'marketId');
            const side = (this.safeBool (raw, 'isYes', true)) ? 'YES' : 'NO';
            orderData['outcome'] = (marketId === undefined) ? id : marketId + ':' + side;
        }
        orderData['id'] = id;
        orderData['info'] = response;
        return this.parsePredictionOrder (orderData);
    }

    /**
     * @method
     * @name jupiter#fetchPredictionOrderStatus
     * @description fetches the on-chain execution status of a Jupiter prediction order
     * @see https://developers.jup.ag/docs/prediction/trading-lifecycle
     * @param {string} orderPubkey order public key
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} native Jupiter order status response
     */
    async fetchPredictionOrderStatus (orderPubkey: string, params: Dict = {}): Promise<Dict> {
        const response = await this.publicGetOrdersStatusOrderPubkey (this.extend ({ 'orderPubkey': orderPubkey }, params));
        return this.safeDict (response, 'data', response);
    }

    /**
     * @method
     * @name jupiter#fetchOrders
     * @description fetches prediction orders for a wallet
     * @see https://developers.jup.ag/docs/prediction/position-data
     * @param {string} [outcome] prediction outcome handle
     * @param {int} [since] earliest timestamp
     * @param {int} [limit] maximum number of orders
     * @param {object} [params] requires ownerPubkey or a configured walletAddress
     * @returns {object[]} prediction orders
     */
    override async fetchOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionOrder[]> {
        const ownerPubkey = this.safeString (params, 'ownerPubkey', this.walletAddress);
        if (ownerPubkey === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires ownerPubkey or walletAddress');
        }
        const request = this.omit (params, [ 'ownerPubkey', 'since', 'limit' ]);
        request['ownerPubkey'] = ownerPubkey;
        const start = this.safeInteger (request, 'start', 0);
        if (limit !== undefined && this.safeInteger (request, 'end') === undefined) {
            request['end'] = start + limit;
        }
        if (outcome !== undefined) {
            const outcomeMarket = await this.loadOutcome (outcome);
            request['marketId'] = this.safeString (outcomeMarket, 'marketId');
        }
        const response = await this.publicGetOrders (request);
        const rows = this.safeList (response, 'data', []);
        const orders = this.parsePredictionOrders (rows);
        return this.filterByOutcomeSinceLimit (orders, outcome, since, limit) as PredictionOrder[];
    }

    /**
     * @method
     * @name jupiter#fetchOpenOrders
     * @description fetches open Jupiter prediction orders for a wallet
     * @see https://developers.jup.ag/docs/prediction/position-data
     * @param {string} [outcome] prediction outcome handle
     * @param {int} [since] earliest timestamp
     * @param {int} [limit] maximum number of orders
     * @param {object} [params] requires ownerPubkey or a configured walletAddress
     * @returns {object[]} open prediction orders
     */
    override async fetchOpenOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionOrder[]> {
        const orders = await this.fetchOrders (outcome, undefined, undefined, params);
        return this.filterByValueSinceLimit (orders, 'status', 'open', since, limit, 'timestamp') as PredictionOrder[];
    }

    /**
     * @method
     * @name jupiter#fetchClosedOrders
     * @description fetches filled Jupiter prediction orders for a wallet
     * @see https://developers.jup.ag/docs/prediction/position-data
     * @param {string} [outcome] prediction outcome handle
     * @param {int} [since] earliest timestamp
     * @param {int} [limit] maximum number of orders
     * @param {object} [params] requires ownerPubkey or a configured walletAddress
     * @returns {object[]} filled prediction orders
     */
    override async fetchClosedOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionOrder[]> {
        const orders = await this.fetchOrders (outcome, undefined, undefined, params);
        return this.filterByValueSinceLimit (orders, 'status', 'closed', since, limit, 'timestamp') as PredictionOrder[];
    }

    /**
     * @method
     * @name jupiter#fetchPositions
     * @description fetches Jupiter prediction positions for a wallet
     * @see https://developers.jup.ag/docs/prediction/position-data
     * @param {string[]} [outcomes] prediction outcome handles to filter by
     * @param {object} [params] requires ownerPubkey or a configured walletAddress
     * @returns {object[]} prediction positions
     */
    override async fetchPositions (outcomes: Strings = undefined, params: Dict = {}): Promise<PredictionPosition[]> {
        const ownerPubkey = this.safeString (params, 'ownerPubkey', this.walletAddress);
        if (ownerPubkey === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchPositions() requires ownerPubkey or walletAddress');
        }
        const request = this.omit (params, [ 'ownerPubkey' ]);
        request['ownerPubkey'] = ownerPubkey;
        const response = await this.publicGetPositions (request);
        const rows = this.safeList (response, 'data', []);
        const results: PredictionPosition[] = [];
        let requested: Dict | undefined = undefined;
        if (outcomes !== undefined) {
            requested = {};
            for (let i = 0; i < outcomes.length; i++) {
                requested[outcomes[i]] = true;
            }
        }
        for (let i = 0; i < rows.length; i++) {
            const raw = rows[i] as Dict;
            const parsed = this.parseJupiterPosition (raw);
            if (requested === undefined || requested[parsed['outcome']] !== undefined) {
                results.push (parsed);
            }
        }
        return results;
    }

    /**
     * @method
     * @name jupiter#fetchPositionById
     * @description fetches a Jupiter prediction position by its public key
     * @see https://developers.jup.ag/docs/prediction/position-data
     * @param {string} positionPubkey position public key
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} prediction position
     */
    async fetchPositionById (positionPubkey: string, params: Dict = {}): Promise<PredictionPosition> {
        const request = this.extend ({ 'positionPubkey': positionPubkey }, params);
        const response = await this.publicGetPositionsPositionPubkey (request);
        const rawData = this.safeDict (response, 'data', response);
        const raw = this.safeDict (rawData, 'position', rawData);
        return this.parseJupiterPosition (raw);
    }

    /**
     * @method
     * @name jupiter#fetchPosition
     * @description fetches a position for one prediction outcome
     * @see https://developers.jup.ag/docs/prediction/position-data
     * @param {string} outcome prediction outcome handle
     * @param {object} [params] requires ownerPubkey or a configured walletAddress
     * @returns {object} a prediction position structure
     */
    override async fetchPosition (outcome: string, params: Dict = {}): Promise<PredictionPosition> {
        const positions = await this.fetchPositions ([ outcome ], params);
        if (positions.length === 0) {
            throw new BadSymbol (this.id + ' fetchPosition() found no position for ' + outcome);
        }
        return positions[0];
    }

    /**
     * @method
     * @name jupiter#closePosition
     * @description builds an unsigned transaction to close one prediction position
     * @see https://developers.jup.ag/docs/prediction/manage-positions
     * @param {string} positionId position public key
     * @param {object} [params] requires ownerPubkey or a configured walletAddress
     * @returns {object} unsigned close transaction for caller signing and submission
     */
    override async closePosition (positionId: string, params: Dict = {}): Promise<Dict> {
        const ownerPubkey = this.safeString (params, 'ownerPubkey', this.walletAddress);
        if (ownerPubkey === undefined) {
            throw new ArgumentsRequired (this.id + ' closePosition() requires ownerPubkey or walletAddress');
        }
        const request = this.omit (params, [ 'ownerPubkey' ]);
        request['ownerPubkey'] = ownerPubkey;
        return await this.publicDeletePositionsPositionPubkey (this.extend ({ 'positionPubkey': positionId }, request));
    }

    /**
     * @method
     * @name jupiter#closeAllPositions
     * @description builds unsigned transactions to close all prediction positions
     * @see https://developers.jup.ag/docs/prediction/manage-positions
     * @param {object} params requires ownerPubkey or a configured walletAddress and minSellPriceSlippageBps
     * @param {string} [params.ownerPubkey] wallet public key
     * @param {int} params.minSellPriceSlippageBps maximum sell price slippage in basis points
     * @returns {object} unsigned close transactions for caller signing and submission
     */
    override async closeAllPositions (params: Dict = {}): Promise<Dict> {
        const ownerPubkey = this.safeString (params, 'ownerPubkey', this.walletAddress);
        if (ownerPubkey === undefined) {
            throw new ArgumentsRequired (this.id + ' closeAllPositions() requires ownerPubkey or walletAddress');
        }
        const request = this.omit (params, [ 'ownerPubkey' ]);
        request['ownerPubkey'] = ownerPubkey;
        return await this.publicDeletePositions (request);
    }

    /**
     * @method
     * @name jupiter#redeemPosition
     * @description builds an unsigned transaction to claim a settled winning prediction position
     * @see https://developers.jup.ag/docs/prediction/claim-payouts
     * @param {string} positionId position public key
     * @param {object} [params] requires ownerPubkey or a configured walletAddress
     * @returns {object} unsigned payout transaction for caller signing and submission
     */
    override async redeemPosition (positionId: string, params: Dict = {}): Promise<Dict> {
        const ownerPubkey = this.safeString (params, 'ownerPubkey', this.walletAddress);
        if (ownerPubkey === undefined) {
            throw new ArgumentsRequired (this.id + ' redeemPosition() requires ownerPubkey or walletAddress');
        }
        const request = this.omit (params, [ 'ownerPubkey' ]);
        request['ownerPubkey'] = ownerPubkey;
        return await this.publicPostPositionsPositionPubkeyClaim (this.extend ({ 'positionPubkey': positionId }, request));
    }

    /**
     * @ignore
     * @param {object} raw raw Jupiter prediction position
     * @returns {object} normalized prediction position
     */
    parseJupiterPosition (raw: Dict): PredictionPosition {
        const marketId = this.safeString (raw, 'marketId', '');
        const label = (this.safeBool (raw, 'isYes', false)) ? 'YES' : 'NO';
        const averagePrice = this.safeNumber (raw, 'avgPriceUsd');
        const markPrice = this.safeNumber (raw, 'markPriceUsd');
        const valueUsd = this.safeNumber (raw, 'valueUsd');
        const pnlUsd = this.safeNumber (raw, 'pnlUsd');
        const realizedPnlUsd = this.safeNumber (raw, 'realizedPnlUsd');
        const payoutUsd = this.safeNumber (raw, 'payoutUsd');
        const updatedAt = this.safeInteger (raw, 'updatedAt');
        const metadata = this.safeDict (raw, 'marketMetadata', {});
        const result = this.safeString (metadata, 'result', this.safeString (raw, 'result'));
        const claimable = this.safeBool (raw, 'claimable');
        const resolved = claimable || (result !== undefined && result !== '');
        const won = claimable || (result !== undefined && result.toLowerCase () === label.toLowerCase ());
        return this.safePredictionPosition ({
            'id': this.safeString2 (raw, 'pubkey', 'positionPubkey'),
            'contracts': this.safeNumber (raw, 'contractsDecimal', this.safeNumber (raw, 'contracts')),
            'side': label.toLowerCase (),
            'entryPrice': (averagePrice === undefined) ? undefined : averagePrice / 1000000,
            'markPrice': (markPrice === undefined) ? undefined : markPrice / 1000000,
            'notional': (valueUsd === undefined) ? undefined : valueUsd / 1000000,
            'unrealizedPnl': (pnlUsd === undefined) ? undefined : pnlUsd / 1000000,
            'realizedPnl': (realizedPnlUsd === undefined) ? undefined : realizedPnlUsd / 1000000,
            'resolved': resolved,
            'won': (resolved) ? won : undefined,
            'payout': (payoutUsd === undefined) ? undefined : payoutUsd / 1000000,
            'outcome': marketId + ':' + label,
            'outcomeId': this.safeString (raw, 'pubkey'),
            'market': marketId,
            'timestamp': (updatedAt === undefined) ? undefined : ((updatedAt < 1000000000000) ? updatedAt * 1000 : updatedAt),
            'info': raw,
        });
    }

    /**
     * @ignore
     * @param {int} timestamp Unix timestamp in seconds or milliseconds
     * @returns {int} timestamp in milliseconds
     */
    parseJupiterTimestamp (timestamp: Int): Int {
        if (timestamp === undefined) {
            return undefined;
        }
        return (timestamp < 1000000000000) ? timestamp * 1000 : timestamp;
    }

    /**
     * @ignore
     * @param {object} raw raw Jupiter prediction event
     * @returns {object} parsed prediction event and nested markets
     */
    parseJupiterEvent (raw: Dict): PredictionEvent {
        const id = this.safeString2 (raw, 'eventId', 'id');
        if (id === undefined) {
            throw new ExchangeError (this.id + ' event response is missing eventId');
        }
        const metadata = this.safeDict (raw, 'metadata', {});
        const rawMarkets = this.safeList (raw, 'markets', []);
        const markets: PredictionMarket[] = [];
        for (let i = 0; i < rawMarkets.length; i++) {
            const rawMarket = rawMarkets[i] as Dict;
            const marketId = this.safeString2 (rawMarket, 'marketId', 'id');
            if (marketId === undefined) {
                continue;
            }
            const marketHandle = marketId;
            const pricing = this.safeDict (rawMarket, 'pricing', rawMarket);
            const yesPrice = this.safeNumber (pricing, 'buyYesPriceUsd');
            const noPrice = this.safeNumber (pricing, 'buyNoPriceUsd');
            const marketVolume = this.safeNumber (pricing, 'volume');
            const rawOutcomeLabels = this.safeList (rawMarket, 'outcomes', [ 'Yes', 'No' ]);
            let yesLabel = 'Yes';
            let noLabel = 'No';
            const marketOptions = this.safeList (rawMarket, 'marketOptions', []);
            if (marketOptions.length > 0) {
                const option = marketOptions[0] as Dict;
                const optionLabel = this.safeString (option, 'label');
                const optionIsYes = this.safeBool (option, 'buyYes', true);
                if (optionLabel !== undefined) {
                    if (optionIsYes) {
                        yesLabel = optionLabel;
                    } else {
                        noLabel = optionLabel;
                    }
                }
            }
            for (let j = 0; j < rawOutcomeLabels.length; j++) {
                const rawLabel = rawOutcomeLabels[j];
                if (typeof rawLabel === 'string') {
                    if (rawLabel !== yesLabel && rawLabel !== noLabel && yesLabel === 'Yes') {
                        yesLabel = rawLabel;
                    } else if (rawLabel !== yesLabel && rawLabel !== noLabel && noLabel === 'No') {
                        noLabel = rawLabel;
                    }
                }
            }
            const outcomes: PredictionOutcome[] = [
                { 'info': rawMarket, 'outcome': marketHandle + ':YES', 'outcomeId': marketId + ':YES', 'label': yesLabel, 'market': marketHandle, 'marketId': marketId, 'event': id, 'price': (yesPrice !== undefined) ? yesPrice / 1000000 : undefined, 'active': true },
                { 'info': rawMarket, 'outcome': marketHandle + ':NO', 'outcomeId': marketId + ':NO', 'label': noLabel, 'market': marketHandle, 'marketId': marketId, 'event': id, 'price': (noPrice !== undefined) ? noPrice / 1000000 : undefined, 'active': true },
            ];
            markets.push ({
                'info': rawMarket,
                'id': marketId,
                'market': marketHandle,
                'event': id,
                'marketType': 'binary',
                'executionModel': 'amm',
                'title': this.safeString (rawMarket, 'title', this.safeString (this.safeDict (rawMarket, 'metadata', {}), 'title')),
                'description': this.safeString (rawMarket, 'description'),
                'outcomes': outcomes,
                'collateral': 'USD',
                'active': this.safeString (rawMarket, 'status', 'open') === 'open',
                'closed': this.safeString (rawMarket, 'status') === 'closed',
                'resolved': this.safeString (rawMarket, 'result') !== undefined && this.safeString (rawMarket, 'result') !== '',
                'volume': (marketVolume === undefined) ? undefined : marketVolume / 1000000,
                'liquidity': this.safeNumber (rawMarket, 'liquidityUsd'),
                'end': this.parseJupiterTimestamp (this.safeInteger (rawMarket, 'closeTime')),
                'endDatetime': this.iso8601 (this.parseJupiterTimestamp (this.safeInteger (rawMarket, 'closeTime'))),
            });
        }
        return {
            'info': raw,
            'id': id,
            'event': id,
            'title': this.safeString (raw, 'title', this.safeString (metadata, 'title')),
            'description': this.safeString (raw, 'description', this.safeString (metadata, 'description')),
            'slug': this.safeString (raw, 'slug'),
            'category': this.safeString (raw, 'category'),
            'markets': markets,
            'active': this.safeBool (raw, 'active', this.safeString (raw, 'status', 'open') !== 'closed'),
            'resolved': this.safeBool (raw, 'resolved', this.safeString (raw, 'status') === 'resolved'),
            'volume': this.safeNumber (raw, 'volumeUsd'),
            'liquidity': this.safeNumber (raw, 'liquidityUsd'),
            'created': this.parseJupiterTimestamp (this.safeInteger (raw, 'createdAt')),
            'end': this.parseJupiterTimestamp (this.safeInteger (raw, 'closeTime')),
        };
    }

    /**
     * @ignore
     * @param {object} order raw Jupiter prediction order
     * @param {object} [market] resolved prediction outcome
     * @returns {object} normalized prediction order structure
     */
    override parsePredictionOrder (order: Dict, market: Market = undefined): PredictionOrder {
        const status = this.safeString (order, 'status', 'created');
        let normalizedStatus = 'open';
        if (status === 'filled') {
            normalizedStatus = 'closed';
        } else if (status === 'failed') {
            normalizedStatus = 'rejected';
        } else if (status === 'cancelled' || status === 'canceled') {
            normalizedStatus = 'canceled';
        }
        const marketId = this.safeString (order, 'marketId');
        const isYes = this.safeBool (order, 'isYes', true);
        const defaultOutcome = (marketId === undefined) ? undefined : marketId + ':' + ((isYes) ? 'YES' : 'NO');
        const outcome = this.safeString (order, 'outcome', defaultOutcome);
        if (outcome === undefined) {
            throw new ExchangeError (this.id + ' prediction order response is missing an outcome handle or market id');
        }
        const amount = this.safeNumber (order, 'contractsDecimal', this.safeNumber (order, 'contracts'));
        const filled = this.safeNumber2 (order, 'contractsFilled', 'filledContracts', 0);
        let remaining: Num = undefined;
        if (amount !== undefined && filled !== undefined) {
            remaining = Math.max (0, amount - filled);
        }
        const timestamp = this.parseJupiterTimestamp (this.safeInteger (order, 'createdAt'));
        const priceUsd = this.safeNumber2 (order, 'avgFillPriceUsd', 'maxFillPriceUsd');
        const costUsd = this.safeNumber2 (order, 'sizeUsd', 'depositAmount');
        return {
            'id': this.safeString (order, 'orderPubkey', this.safeString (order, 'pubkey', this.safeString (order, 'id'))),
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': normalizedStatus,
            'type': 'market',
            'side': (this.safeBool (order, 'isBuy', true)) ? 'buy' : 'sell',
            'price': (priceUsd === undefined) ? undefined : priceUsd / 1000000,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': (costUsd === undefined) ? undefined : costUsd / 1000000,
            'fee': undefined,
            'reduceOnly': false,
            'postOnly': false,
            'outcome': this.safeString (market, 'outcome', outcome),
            'outcomeId': this.safeString (market, 'outcomeId', (marketId === undefined) ? undefined : marketId + ':' + ((isYes) ? 'YES' : 'NO')),
            'label': this.safeString (market, 'label', (isYes) ? 'Yes' : 'No'),
            'market': this.safeString (market, 'market', marketId),
            'event': this.safeString (market, 'event'),
            'trades': [],
            'info': this.safeValue (order, 'info', order),
        };
    }

    /**
     * @ignore
     * @param {object} trade raw Jupiter prediction trade or history event
     * @param {object} [market] resolved prediction outcome
     * @returns {object} normalized prediction trade structure
     */
    override parsePredictionTrade (trade: Dict, market: Market = undefined): PredictionTrade {
        const timestampSeconds = this.safeInteger (trade, 'timestamp');
        const timestamp = this.parseJupiterTimestamp (timestampSeconds);
        const priceUsd = this.safeNumber2 (trade, 'priceUsd', 'avgFillPriceUsd');
        const costUsd = this.safeNumber2 (trade, 'amountUsd', 'totalCostUsd');
        const price = (priceUsd === undefined) ? undefined : priceUsd / 1000000;
        const cost = (costUsd === undefined) ? undefined : costUsd / 1000000;
        let amount = this.safeNumber (trade, 'contractsDecimal');
        if (amount === undefined && price !== undefined && price > 0 && cost !== undefined) {
            amount = cost / price;
        }
        const marketId = this.safeString (trade, 'marketId', this.safeString (market, 'marketId'));
        const isYes = this.safeBool (trade, 'isYes', this.safeString (trade, 'side', '').toLowerCase () === 'yes');
        const defaultOutcome = (marketId === undefined) ? undefined : marketId + ':' + ((isYes) ? 'YES' : 'NO');
        const outcome = this.safeString (trade, 'outcome', this.safeString (market, 'outcome', defaultOutcome));
        if (outcome === undefined) {
            throw new ExchangeError (this.id + ' trade response is missing an outcome handle or market id');
        }
        const tradeId = this.safeString2 (trade, 'id', 'orderPubkey');
        if (tradeId === undefined) {
            throw new ExchangeError (this.id + ' trade response is missing its id');
        }
        return {
            'info': trade,
            'id': tradeId,
            'order': this.safeString (trade, 'orderPubkey'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'type': 'market',
            'side': this.safeString (trade, 'action', (this.safeBool (trade, 'isBuy', true)) ? 'buy' : 'sell'),
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
            'outcome': outcome,
            'outcomeId': this.safeString (market, 'outcomeId', this.safeString (trade, 'positionPubkey')),
            'label': this.safeString (market, 'label', (isYes) ? 'Yes' : 'No'),
            'market': this.safeString (market, 'market', marketId),
        };
    }

    /**
     * @ignore
     * @param {object[]} levels raw Jupiter order book levels
     * @param {int} [limit] maximum number of levels to parse
     * @returns {object[]} normalized price and amount pairs
     */
    parsePredictionBookSide (levels: any[], limit: Int = undefined): [Num, Num][] {
        const result: [Num, Num][] = [];
        const levelsLength = (limit === undefined) ? levels.length : Math.min (levels.length, limit);
        for (let i = 0; i < levelsLength; i++) {
            const level = levels[i];
            let price: Num = undefined;
            let amount: Num = undefined;
            if (Array.isArray (level)) {
                price = this.safeNumber (level, 0);
                amount = this.safeNumber (level, 1);
            } else {
                price = this.safeNumber (level, 'price');
                amount = this.safeNumber (level, 'size', this.safeNumber (level, 'amount'));
            }
            if (price !== undefined && amount !== undefined) {
                result.push ([ (price > 1) ? price / 1000000 : price, amount ]);
            }
        }
        return result;
    }

    override handleErrors (httpCode: Int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): undefined {
        if (response === undefined || response === null) {
            return undefined;
        }
        const error = this.safeString2 (response, 'error', 'message');
        if (error !== undefined) {
            throw new ExchangeError (this.id + ' ' + error);
        }
        return undefined;
    }

    override sign (path: string, api: string[] = [ 'public' ], method: string = 'GET', params: Dict = {}): Dict {
        const url = this.urls['api'][api[0]] + '/' + path;
        const requestUrl = (method === 'GET' && Object.keys (params).length > 0) ? url + '?' + this.urlencode (params) : url;
        const headers: Dict = { 'Accept': 'application/json' };
        if (this.apiKey !== undefined) {
            headers['x-api-key'] = this.apiKey;
        }
        let body: string | undefined = undefined;
        if (method !== 'GET') {
            headers['Content-Type'] = 'application/json';
            body = this.json (params);
        }
        return { 'url': requestUrl, 'method': method, 'body': body, 'headers': headers };
    }
}
