import Exchange from '../abstract/prediction/jupiter.js';
import { ArgumentsRequired, BadSymbol, ExchangeError, InvalidOrder } from '../base/errors.js';
import { Precise } from '../base/Precise.js';
import { DECIMAL_PLACES } from '../base/functions/number.js';
import type { Dict, Int, int, Market, Num, PredictionEvent, PredictionMarket, PredictionOrder, PredictionOrderBook, PredictionOutcome, PredictionPosition, PredictionTicker, PredictionTrade, Status, Str, Strings } from '../base/types.js';

/**
 * @class jupiter
 * @augments PredictionExchange
 */
export default class jupiter extends Exchange {
    override describe (): Dict {
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
                'closePredictionPosition': true,
                'closeAllPredictionPositions': true,
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
                'secret': false,
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
        //
        // publicGetEventsId ({ 'id': 'POLY-1273034', 'includeMarkets': true })
        //
        //     {
        //         "eventId": "POLY-1273034",
        //         "isActive": true,
        //         "isLive": false,
        //         "category": "economics",
        //         "subcategory": "",
        //         "tags": [ "economics", "economy", "politics", "trump", "finance", "fed-rates", "fed", "fomc", ... ],
        //         "metadata": {
        //             "slug": "fed-decision-in-april-2027",
        //             "title": "Fed Decision in April?",
        //             "isLive": false,
        //             "series": "polymarket",
        //             "eventId": "POLY-1273034",
        //             "imageUrl": "https://polymarket-upload.s3.us-east-2.amazonaws.com/fed-decision-in-september-762-c4RyWuxRPo1L.jpg",
        //             "subtitle": "",
        //             "closeTime": "2027-04-28T23:59:00Z"
        //         },
        //         "volumeUsd": "85679000000",
        //         "volume24hr": "2418000000",
        //         "beginAt": null,
        //         "closeCondition": "This market will close and expire after a winner is declared.",
        //         "rulesPdf": "",
        //         "markets": [
        //             {
        //                 "provider": "polymarket",
        //                 "marketId": "POLY-6353937",
        //                 "status": "open",
        //                 "result": null,
        //                 "marketResultPubkey": null,
        //                 "title": "No change",
        //                 "openTime": 1793210502,
        //                 "closeTime": 1808956740,
        //                 "isTeamMarket": false,
        //                 "rulesPrimary": "The FED interest rates are defined in this market by the upper bound of the target federal funds range. ...",
        //                 "rulesSecondary": "",
        //                 "resolveAt": null,
        //                 "pricing": {
        //                     "buyYesPriceUsd": 600000,
        //                     "sellYesPriceUsd": 580000,
        //                     "sellNoPriceUsd": 400000,
        //                     "buyNoPriceUsd": 420000,
        //                     "volume": 18584
        //                 },
        //                 "imageUrl": null,
        //                 "team": null,
        //                 "outcomes": [ "Yes", "No" ],
        //                 "clobTokenIds": [ "92199856198491275974466415643782357799240104314088671664656875045136906216387", "76119921629324516080602677397464024765019421580812939146552092343123569009356" ],
        //                 "conditionId": "0xa55e6d0a127dc7f882b95cc8aa3027dc4846ba8a08a06a358f637cc03a6002ac",
        //                 "comboStatus": "disabled",
        //                 "marketOptions": [ { "label": "Yes", "buyYes": true }, { "label": "No", "buyYes": false } ],
        //                 "sportsMarketType": null,
        //                 "sportsLine": null,
        //                 "periodType": null,
        //                 "periodNumber": null,
        //                 "gameNumber": null
        //             },
        //             ...
        //         ],
        //         "sportsMarketGroups": []
        //     }
        //
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
        let queryList: Strings = undefined;
        if (query !== undefined) {
            queryList = [ query ];
        }
        return this.applyEventFetchParams (events, params, queryList);
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
        //
        //     {
        //         "eventId": "POLY-1273034",
        //         "isActive": true,
        //         "isLive": false,
        //         "category": "economics",
        //         "subcategory": "",
        //         "tags": [ "economics", "economy", "politics", "trump", "finance", "fed-rates", "fed", "fomc", ... ],
        //         "metadata": {
        //             "slug": "fed-decision-in-april-2027",
        //             "title": "Fed Decision in April?",
        //             "isLive": false,
        //             "series": "polymarket",
        //             "eventId": "POLY-1273034",
        //             "imageUrl": "https://polymarket-upload.s3.us-east-2.amazonaws.com/fed-decision-in-september-762-c4RyWuxRPo1L.jpg",
        //             "subtitle": "",
        //             "closeTime": "2027-04-28T23:59:00Z"
        //         },
        //         "volumeUsd": "85679000000",
        //         "volume24hr": "2418000000",
        //         "beginAt": null,
        //         "closeCondition": "This market will close and expire after a winner is declared.",
        //         "rulesPdf": "",
        //         "markets": [
        //             {
        //                 "provider": "polymarket",
        //                 "marketId": "POLY-6353937",
        //                 "status": "open",
        //                 "result": null,
        //                 "marketResultPubkey": null,
        //                 "title": "No change",
        //                 "openTime": 1793210502,
        //                 "closeTime": 1808956740,
        //                 "isTeamMarket": false,
        //                 "rulesPrimary": "The FED interest rates are defined in this market by the upper bound of the target federal funds range. ...",
        //                 "rulesSecondary": "",
        //                 "resolveAt": null,
        //                 "pricing": {
        //                     "buyYesPriceUsd": 600000,
        //                     "sellYesPriceUsd": 580000,
        //                     "sellNoPriceUsd": 400000,
        //                     "buyNoPriceUsd": 420000,
        //                     "volume": 18584
        //                 },
        //                 "imageUrl": null,
        //                 "team": null,
        //                 "outcomes": [ "Yes", "No" ],
        //                 "clobTokenIds": [ "92199856198491275974466415643782357799240104314088671664656875045136906216387", "76119921629324516080602677397464024765019421580812939146552092343123569009356" ],
        //                 "conditionId": "0xa55e6d0a127dc7f882b95cc8aa3027dc4846ba8a08a06a358f637cc03a6002ac",
        //                 "comboStatus": "disabled",
        //                 "marketOptions": [ { "label": "Yes", "buyYes": true }, { "label": "No", "buyYes": false } ],
        //                 "sportsMarketType": null,
        //                 "sportsLine": null,
        //                 "periodType": null,
        //                 "periodNumber": null,
        //                 "gameNumber": null
        //             },
        //             ...
        //         ],
        //         "sportsMarketGroups": []
        //     }
        //
        const raw = this.safeDict (response, 'data', response);
        const event = this.parseJupiterEvent (raw);
        this.indexEventOutcomes (event);
        const result = this.extend (event, {});
        return result as PredictionEvent;
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
        //
        //     {
        //         "data": [
        //             {
        //                 "provider": "polymarket",
        //                 "marketId": "POLY-6353937",
        //                 "status": "open",
        //                 "result": null,
        //                 "marketResultPubkey": null,
        //                 "title": "No change",
        //                 "openTime": 1793210502,
        //                 "closeTime": 1808956740,
        //                 "isTeamMarket": false,
        //                 "rulesPrimary": "The FED interest rates are defined in this market by the upper bound of the target federal funds range. ...",
        //                 "rulesSecondary": "",
        //                 "resolveAt": null,
        //                 "pricing": {
        //                     "buyYesPriceUsd": 600000,
        //                     "sellYesPriceUsd": 580000,
        //                     "sellNoPriceUsd": 400000,
        //                     "buyNoPriceUsd": 420000,
        //                     "volume": 18584
        //                 },
        //                 "imageUrl": null,
        //                 "team": null,
        //                 "outcomes": [ "Yes", "No" ],
        //                 "clobTokenIds": [ "92199856198491275974466415643782357799240104314088671664656875045136906216387", "76119921629324516080602677397464024765019421580812939146552092343123569009356" ],
        //                 "conditionId": "0xa55e6d0a127dc7f882b95cc8aa3027dc4846ba8a08a06a358f637cc03a6002ac",
        //                 "comboStatus": "disabled",
        //                 "marketOptions": [ { "label": "Yes", "buyYes": true }, { "label": "No", "buyYes": false } ],
        //                 "sportsMarketType": null,
        //                 "sportsLine": null,
        //                 "periodType": null,
        //                 "periodNumber": null,
        //                 "gameNumber": null
        //             },
        //             ...
        //         ]
        //     }
        //
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
        //
        //     {
        //         "provider": "polymarket",
        //         "marketId": "POLY-6353937",
        //         "status": "open",
        //         "result": null,
        //         "marketResultPubkey": null,
        //         "title": "No change",
        //         "openTime": 1793210502,
        //         "closeTime": 1808956740,
        //         "isTeamMarket": false,
        //         "rulesPrimary": "The FED interest rates are defined in this market by the upper bound of the target federal funds range. ...",
        //         "rulesSecondary": "",
        //         "resolveAt": null,
        //         "pricing": {
        //             "buyYesPriceUsd": 600000,
        //             "sellYesPriceUsd": 580000,
        //             "sellNoPriceUsd": 400000,
        //             "buyNoPriceUsd": 420000,
        //             "volume": 18584
        //         },
        //         "imageUrl": null,
        //         "team": null,
        //         "outcomes": [ "Yes", "No" ],
        //         "clobTokenIds": [ "92199856198491275974466415643782357799240104314088671664656875045136906216387", "76119921629324516080602677397464024765019421580812939146552092343123569009356" ],
        //         "conditionId": "0xa55e6d0a127dc7f882b95cc8aa3027dc4846ba8a08a06a358f637cc03a6002ac",
        //         "comboStatus": "disabled",
        //         "marketOptions": [ { "label": "Yes", "buyYes": true }, { "label": "No", "buyYes": false } ],
        //         "sportsMarketType": null,
        //         "sportsLine": null,
        //         "periodType": null,
        //         "periodNumber": null,
        //         "gameNumber": null,
        //         "eventId": "POLY-1273034"
        //     }
        //
        const raw = this.safeDict (response, 'data', response);
        const marketData = this.safeDict (raw, 'market', raw);
        const event = this.parseJupiterEvent ({ 'eventId': eventId, 'markets': [ marketData ] });
        this.indexEventOutcomes (event);
        const markets = event['markets'];
        const marketsLength = markets.length;
        if (marketsLength === 0) {
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
        //
        //     {
        //         "ownerPubkey": "CdzvU3te3u5jJpcKVp769Jcwr9Dd5HNeSh8AVWWSpS5d",
        //         "realizedPnlUsd": "77609182079",
        //         "totalVolumeUsd": "61201646610",
        //         "predictionsCount": "414",
        //         "correctPredictions": "282",
        //         "wrongPredictions": "132",
        //         "trades": "414",
        //         "wins": "282",
        //         "totalActiveContracts": "0",
        //         "totalActiveContractsMicro": "0",
        //         "totalActiveContractsDecimal": "0",
        //         "totalPositionsValueUsd": "0"
        //     }
        //
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
        //
        //     {
        //         "data": [
        //             {
        //                 "ownerPubkey": "ArmhM8HaamfqKGWQn2nT9qrT1QD5RGUEdPKqHZi3ft6Z",
        //                 "realizedPnlUsd": "201665862280",
        //                 "totalVolumeUsd": "313927064940",
        //                 "predictionsCount": 1,
        //                 "correctPredictions": 1,
        //                 "wrongPredictions": 0,
        //                 "winRatePct": "100.00",
        //                 "period": "all_time",
        //                 "periodStart": null,
        //                 "periodEnd": null
        //             },
        //             ...
        //         ],
        //         "summary": {
        //             "all_time": {
        //                 "totalVolumeUsd": "65239451405269",
        //                 "predictionsCount": 558864
        //             },
        //             "weekly": {
        //                 "totalVolumeUsd": "306015109005",
        //                 "predictionsCount": 1868
        //             },
        //             "monthly": {
        //                 "totalVolumeUsd": "3791279754440",
        //                 "predictionsCount": 27666
        //             }
        //         }
        //     }
        //
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
        //
        //     {
        //         "pubkey": "BrTCoKzZoh7waCM3h2MuJKan8fX2A574gedorgPRC3HJ",
        //         "data": {
        //             "settlementMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        //             "currentContracts": "180677000000",
        //             "currentOpenOrders": "0",
        //             "globalMaxContracts": "1035000000000",
        //             "positionMaxContracts": "50000000000",
        //             "positionMaxOrders": "1",
        //             "settlementDelaySeconds": "0",
        //             "depositsDisabled": "false",
        //             "withdrawalsDisabled": "false",
        //             "protocolFeeBps": "0",
        //             "bump": "255",
        //             "tradingDisabled": "false",
        //             "unitVersion": "1",
        //             "feesAccruedUsd": "0"
        //         },
        //         "vaultBalance": "524.558475"
        //     }
        //
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
        //
        //     {
        //         "forecast_history": [
        //             {
        //                 "market_ticker": "POLY-6353937",
        //                 "event_ticker": "POLY-1273034",
        //                 "raw_numerical_forecast": 65.5,
        //                 "numerical_forecast": 65.5,
        //                 "formatted_forecast": "65.50%",
        //                 "end_period_ts": 1794344431,
        //                 "period_interval": 5
        //             },
        //             ...
        //         ]
        //     }
        //
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
        const tagsLength = tags.length;
        const hasScope = query !== undefined || eventId !== undefined || slug !== undefined || category !== undefined || tagsLength > 0;
        let events: PredictionEvent[] = [];
        if (hasScope) {
            events = await this.fetchEvents (params);
        } else {
            const request = this.omit (params, [ 'limit' ]);
            request['limit'] = this.safeInteger (params, 'limit', this.safeInteger (this.options, 'fetchMarketsLimit', 50));
            request['includeMarkets'] = true;
            const response = await this.publicGetEvents (request);
            //
            //     {
            //         "data": [
            //             {
            //                 "eventId": "POLY-1374448",
            //                 "isActive": true,
            //                 "isLive": false,
            //                 "category": "tech",
            //                 "subcategory": "",
            //                 "tags": [ "tech" ],
            //                 "metadata": {
            //                     "slug": "jensen-huang-rejoins-nvidia-byptptpt",
            //                     "title": "Jensen Huang rejoins NVIDIA by...?",
            //                     "isLive": false,
            //                     "series": "polymarket",
            //                     "eventId": "POLY-1374448",
            //                     "imageUrl": "https://polymarket-upload.s3.us-east-2.amazonaws.com/will-jensen-huang-be-richest-person-on-december-31-iU8eWlv0KU_b.jpg",
            //                     "subtitle": "",
            //                     "closeTime": "2028-01-01T04:59:00Z"
            //                 },
            //                 "volumeUsd": "4580281000000",
            //                 "volume24hr": "1836532000000",
            //                 "beginAt": null,
            //                 "closeCondition": "This market will close and expire after a winner is declared.",
            //                 "rulesPdf": "",
            //                 "markets": [
            //                     {
            //                         "provider": "polymarket",
            //                         "marketId": "POLY-6998286",
            //                         "status": "open",
            //                         "result": null,
            //                         "title": "December 31, 2027",
            //                         "openTime": 1794518229,
            //                         "closeTime": 1830315540,
            //                         "pricing": {
            //                             "buyYesPriceUsd": 360000,
            //                             "sellYesPriceUsd": 350000,
            //                             "sellNoPriceUsd": 640000,
            //                             "buyNoPriceUsd": 650000,
            //                             "volume": 305288
            //                         },
            //                         "outcomes": [ "Yes", "No" ],
            //                         "marketOptions": [ { "label": "Yes", "buyYes": true }, { "label": "No", "buyYes": false } ],
            //                         ...
            //                     },
            //                     ...
            //                 ]
            //             },
            //             ...
            //         ]
            //     }
            //
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
                markets.push (eventMarkets[j] as Market);
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
        //
        //     {
        //         "provider": "polymarket",
        //         "marketId": "POLY-6353937",
        //         "status": "open",
        //         "result": null,
        //         "marketResultPubkey": null,
        //         "title": "No change",
        //         "openTime": 1793210502,
        //         "closeTime": 1808956740,
        //         "isTeamMarket": false,
        //         "rulesPrimary": "The FED interest rates are defined in this market by the upper bound of the target federal funds range. ...",
        //         "rulesSecondary": "",
        //         "resolveAt": null,
        //         "pricing": {
        //             "buyYesPriceUsd": 600000,
        //             "sellYesPriceUsd": 580000,
        //             "sellNoPriceUsd": 400000,
        //             "buyNoPriceUsd": 420000,
        //             "volume": 18584
        //         },
        //         "imageUrl": null,
        //         "team": null,
        //         "outcomes": [ "Yes", "No" ],
        //         "clobTokenIds": [ "92199856198491275974466415643782357799240104314088671664656875045136906216387", "76119921629324516080602677397464024765019421580812939146552092343123569009356" ],
        //         "conditionId": "0xa55e6d0a127dc7f882b95cc8aa3027dc4846ba8a08a06a358f637cc03a6002ac",
        //         "comboStatus": "disabled",
        //         "marketOptions": [ { "label": "Yes", "buyYes": true }, { "label": "No", "buyYes": false } ],
        //         "sportsMarketType": null,
        //         "sportsLine": null,
        //         "periodType": null,
        //         "periodNumber": null,
        //         "gameNumber": null,
        //         "eventId": "POLY-1273034"
        //     }
        //
        const raw = this.safeDict (response, 'data', response);
        const outcomeHandle = this.safeString (outcomeMarket, 'outcome', '');
        const isYes = outcomeHandle.endsWith (':YES');
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
        //
        //     {
        //         "trading_active": true
        //     }
        //
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
        //
        //     {
        //         "yes": [ [ 1, 1141573.22 ], [ 2, 156094.75 ], [ 3, 42180.96 ], [ 4, 75365.78 ], [ 5, 28374.98 ], ... ],
        //         "no": [ [ 1, 1126574.6 ], [ 2, 114150.13 ], [ 3, 40249.98 ], [ 4, 78811.14 ], [ 5, 29570.13 ], ... ],
        //         "yes_dollars": [ [ "0.0100", 1141573.22 ], [ "0.0200", 156094.75 ], [ "0.0300", 42180.96 ], ... ],
        //         "no_dollars": [ [ "0.0100", 1126574.6 ], [ "0.0200", 114150.13 ], [ "0.0300", 40249.98 ], ... ]
        //     }
        //
        const raw = this.safeDict (response, 'data', response);
        const outcomeHandle = this.safeString (outcomeMarket, 'outcome', '');
        let side = 'no';
        if (outcomeHandle.endsWith (':YES')) {
            side = 'yes';
        }
        const bidKey = (side === 'yes') ? 'yes_dollars' : 'no_dollars';
        const oppositeBidKey = (side === 'yes') ? 'no_dollars' : 'yes_dollars';
        const bids = this.parsePredictionBookSide (this.safeList (raw, bidKey, []), limit);
        const oppositeBids = this.parsePredictionBookSide (this.safeList (raw, oppositeBidKey, []));
        const oppositeBidsLength = oppositeBids.length;
        let asks: [Num, Num][] = [];
        for (let i = 0; i < oppositeBidsLength; i++) {
            const reverseIndex = oppositeBidsLength - 1 - i;
            const level = oppositeBids[reverseIndex];
            if (level === undefined) {
                continue;
            }
            const oppositePrice = level[0];
            const amount = level[1];
            if (oppositePrice === undefined || amount === undefined) {
                continue;
            }
            const askPrice = this.parseNumber (Precise.stringSub ('1', this.numberToString (oppositePrice)));
            if (askPrice >= 0) {
                asks.push ([ askPrice, amount ]);
            }
        }
        const asksLength = asks.length;
        if (limit !== undefined && asksLength > limit) {
            asks = this.arraySlice (asks, 0, limit);
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
        //
        //     {
        //         "data": [
        //             {
        //                 "id": "order-5048570",
        //                 "ownerPubkey": "CqRes7Fvso7h765yS6Gu3qwvtfCsJWnqV3iXp4rvpe7R",
        //                 "marketId": "POLY-6674178-0",
        //                 "message": "CqRes7Fvso7h765yS6Gu3qwvtfCsJWnqV3iXp4rvpe7R bought Yes for Over at $0.84 ($97.26)",
        //                 "timestamp": 1794949239,
        //                 "action": "buy",
        //                 "side": "yes",
        //                 "eventTitle": "Wales vs. Portugal - More Markets",
        //                 "marketTitle": "Over",
        //                 "amountUsd": "97263599",
        //                 "priceUsd": "839999",
        //                 "eventImageUrl": "https://polymarket-upload.s3.us-east-2.amazonaws.com/soccer-leagues/unl.png",
        //                 "eventId": "POLY-1313366",
        //                 "isTeamMarket": true,
        //                 "marketOptions": [ { "label": "O 4.5", "buyYes": true } ]
        //             },
        //             ...
        //         ]
        //     }
        //
        const rows = this.safeList (response, 'data', []);
        // the trades endpoint returns a global feed and ignores the marketId filter, so drop foreign markets here
        const filtered: Dict[] = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i] as Dict;
            if (this.safeString (row, 'marketId') === marketId) {
                filtered.push (row);
            }
        }
        return this.parsePredictionTrades (filtered, outcomeMarket, since, limit);
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
        //
        //     {
        //         "data": [
        //             {
        //                 "id": 1257717,
        //                 "eventType": "order_closed",
        //                 "signature": "5Ckpg3fB7YE83hKVDBerFMjZTDU6ArTsJkZJk3aw5X84YgJUG2DmwYZdcUvCSPE3Nk5reiEyB1dCxHbZhcVGSGyk",
        //                 "slot": "417542920",
        //                 "timestamp": 1777901989,
        //                 "orderPubkey": "4NJqSjU5quEFJWFgKJ3ii6WMMvaauCwXuN1L68425hXM",
        //                 "positionPubkey": "GTQLdnWgBYbHj2dRtticRzRUKZeYyCz7aELM21pcgM1G",
        //                 "marketId": "POLY-2148276-1",
        //                 "ownerPubkey": "CdzvU3te3u5jJpcKVp769Jcwr9Dd5HNeSh8AVWWSpS5d",
        //                 "keeperPubkey": "",
        //                 "externalOrderId": "a0666159cfe24acaa1876203f215a493",
        //                 "orderId": "",
        //                 "isBuy": true,
        //                 "isYes": true,
        //                 "contracts": "94",
        //                 "contractsMicro": "94000000",
        //                 "contractsDecimal": "94",
        //                 "filledContracts": "0",
        //                 "filledContractsMicro": "0",
        //                 "filledContractsDecimal": "0",
        //                 "contractsSettled": "0",
        //                 "maxFillPriceUsd": "827978",
        //                 "avgFillPriceUsd": "0",
        //                 "maxBuyPriceUsd": "830000",
        //                 "minSellPriceUsd": null,
        //                 "depositAmountUsd": "0",
        //                 "totalCostUsd": "0",
        //                 "feeUsd": null,
        //                 "grossProceedsUsd": "0",
        //                 "netProceedsUsd": "0",
        //                 "transferAmountToken": "82118313",
        //                 "realizedPnl": null,
        //                 "payoutAmountUsd": "0",
        //                 "status": null,
        //                 "eventId": "POLY-444660",
        //                 "marketMetadata": { "marketId": "POLY-2148276-1", "eventId": "POLY-444660", "provider": "polymarket", "title": "Down", "status": "yes", "result": "yes", "closeTime": 1777902000, "openTime": 1777815827, ... },
        //                 "eventMetadata": { "eventId": "POLY-444660", "title": "Ethereum Up or Down - May 4, 9:35AM-9:40AM ET", "category": "crypto", "subcategory": "eth", "closeTime": 1777902000, ... }
        //             },
        //             ...
        //         ],
        //         "pagination": {
        //             "start": 0,
        //             "end": 5,
        //             "total": 4015,
        //             "hasNext": true
        //         }
        //     }
        //
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
            throw new InvalidOrder (this.id + ' createOrder() supports market buy orders only; use closePredictionPosition() to sell held contracts');
        }
        if (side !== 'buy') {
            throw new InvalidOrder (this.id + ' createOrder() supports buy orders only; use closePredictionPosition() to sell held contracts');
        }
        if (amount <= 0) {
            throw new InvalidOrder (this.id + ' createOrder() amount must be positive');
        }
        const outcomeHandle = this.safeString (outcomeMarket, 'outcome', '');
        const isYes = outcomeHandle.endsWith (':YES');
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
        //
        //     {
        //         "transaction": "AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABd170i6swHn7hrtv8OGyqjmCeShqNz...",
        //         "txMeta": {
        //             "blockhash": "57ZFeNYJXuUbQSCQFKs2GhhnKQhMiSQKHauyrtXBgniS",
        //             "lastValidBlockHeight": 448694219
        //         },
        //         "externalOrderId": "b4ea9950786d45bbb0a12602f9093b28",
        //         "requiredSigners": [ "CqRes7Fvso7h765yS6Gu3qwvtfCsJWnqV3iXp4rvpe7R" ],
        //         "isGasless": false,
        //         "order": {
        //             "orderPubkey": "U2a4XFhy8msMinkKYjHie2c1QVkbbAWCEKEyVP9Xpff",
        //             "orderAtaPubkey": "AN7CU4PWNQsXnGehTGnxxv2XdSL9RZn26bgtWRkX3VxL",
        //             "userPubkey": "CqRes7Fvso7h765yS6Gu3qwvtfCsJWnqV3iXp4rvpe7R",
        //             "marketId": "POLY-6353937",
        //             "marketIdHash": "4223ac940daa3d98bd73735f0104dee3",
        //             "positionPubkey": "7uSBoexS5AvPj6UN1ZP4eUjFjjKHoP7zVozbHghMEJec",
        //             "isBuy": true,
        //             "isYes": true,
        //             "contracts": "11",
        //             "contractsMicro": "11200000",
        //             "contractsDecimal": "11.2",
        //             "newContracts": "11",
        //             "newContractsMicro": "11200000",
        //             "newContractsDecimal": "11.2",
        //             "maxBuyPriceUsd": "600000",
        //             "minSellPriceUsd": null,
        //             "slippageBps": 0,
        //             "maxSlippageBps": null,
        //             "externalOrderId": "b4ea9950786d45bbb0a12602f9093b28",
        //             "orderCostUsd": "6995634",
        //             "newAvgPriceUsd": "600000",
        //             "newSizeUsd": "6720000",
        //             "newPayoutUsd": "11200000",
        //             "payoutUsd": "11200000",
        //             "estimatedProtocolFeeUsd": "0",
        //             "estimatedVenueFeeUsd": "268800",
        //             "estimatedIntegratorFeeUsd": "0",
        //             "estimatedTotalFeeUsd": "268800",
        //             "clientOrderId": "b4ea9950786d45bbb0a12602f9093b28"
        //         },
        //         "clientOrderId": "b4ea9950786d45bbb0a12602f9093b28",
        //         "execution": {
        //             "endpoint": "/api/v1/execute",
        //             "context": {
        //                 "type": "create_order"
        //             }
        //         }
        //     }
        //
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
        //
        //     {
        //         "orderPubkey": "4NJqSjU5quEFJWFgKJ3ii6WMMvaauCwXuN1L68425hXM",
        //         "status": "failed",
        //         "latestEventType": "order_closed",
        //         "latestSignature": "5Ckpg3fB7YE83hKVDBerFMjZTDU6ArTsJkZJk3aw5X84YgJUG2DmwYZdcUvCSPE3Nk5reiEyB1dCxHbZhcVGSGyk",
        //         "externalOrderId": "a0666159cfe24acaa1876203f215a493",
        //         "clientOrderId": "a0666159cfe24acaa1876203f215a493",
        //         "orderId": "",
        //         "history": [
        //             {
        //                 "eventType": "order_created",
        //                 "status": "created",
        //                 "rawStatus": "",
        //                 "timestamp": 1777901979,
        //                 "signature": "4XZG7XxQ2dZpnn6EHVWh1mWgksvp21jqfrnBKeg1acsx1tizdpQUYnSMjH5v39Ubd49v5QBo8Lh1mqixd5WAjBV8",
        //                 "externalOrderId": "a0666159cfe24acaa1876203f215a493",
        //                 "clientOrderId": "a0666159cfe24acaa1876203f215a493",
        //                 "orderId": ""
        //             },
        //             ...
        //         ]
        //     }
        //
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
            request['end'] = this.sum (start, limit);
        }
        if (outcome !== undefined) {
            const outcomeMarket = await this.loadOutcome (outcome);
            request['marketId'] = this.safeString (outcomeMarket, 'marketId');
        }
        const response = await this.publicGetOrders (request);
        //
        //     {
        //         "data": [],
        //         "pagination": {
        //             "start": 0,
        //             "end": 0,
        //             "total": 0,
        //             "hasNext": false
        //         }
        //     }
        //
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
        //
        //     {
        //         "data": [
        //             {
        //                 "pubkey": "9vMtMrFnabEQHQEQvKr44TwaGyv8rJn9L9h4MJZicZwm",
        //                 "owner": "8ed2wf1p9KZdvXVMyTpmMvMrBmph7rciWjkahc2pcxEM",
        //                 "market": "2Keiu1EstdmTrwYwXKLQ5WeXYQzCgt6zVixjRyAYW6xu",
        //                 "marketId": "POLY-6964609-0",
        //                 "marketIdHash": "40390948b69a0a67f99cdfa4d66220b6",
        //                 "isYes": true,
        //                 "contracts": "5",
        //                 "contractsMicro": "5440000",
        //                 "contractsDecimal": "5.44",
        //                 "totalCostUsd": "4841599",
        //                 "openOrders": 0,
        //                 "feesPaidUsd": "123660",
        //                 "realizedPnlUsd": 0,
        //                 "claimed": false,
        //                 "claimedUsd": "0",
        //                 "openedAt": 1794949004,
        //                 "updatedAt": 1794949004,
        //                 "bump": 253,
        //                 "ownerPubkey": "8ed2wf1p9KZdvXVMyTpmMvMrBmph7rciWjkahc2pcxEM",
        //                 "eventId": "POLY-1364543",
        //                 "sizeUsd": "4841599",
        //                 "valueUsd": "3264000",
        //                 "avgPriceUsd": "889999",
        //                 "markPriceUsd": "600000",
        //                 "maxSlippageBps": 2500,
        //                 "pnlUsd": "-1577599",
        //                 "pnlUsdPercent": -32.58,
        //                 "pnlUsdAfterFees": "-1701259",
        //                 "pnlUsdAfterFeesPercent": -34.26,
        //                 "eventMetadata": { "eventId": "POLY-1364543", "title": "Barcelona vs. Paris Basketball", "category": "sports", "subcategory": "euroleague", "closeTime": 1794943800, ... },
        //                 "marketMetadata": { "marketId": "POLY-6964609-0", "eventId": "POLY-1364543", "provider": "polymarket", "title": "Barcelona", "status": "open", "result": null, ... },
        //                 "claimable": false,
        //                 "claimableAt": null,
        //                 "payoutUsd": "5440000",
        //                 "settlementDate": 1794943800,
        //                 "sellPriceUsd": "600000",
        //                 "integratorFeeUsd": "0",
        //                 "source": "program"
        //             },
        //             ...
        //         ],
        //         "pagination": {
        //             "start": 0,
        //             "end": 2,
        //             "total": 2,
        //             "hasNext": false
        //         },
        //         "summary": {
        //             "activePositionsCount": 2,
        //             "liveEventsCount": 0,
        //             "nextEventStartTime": null,
        //             "nextEvent": null
        //         }
        //     }
        //
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
        //
        //     {
        //         "pubkey": "9vMtMrFnabEQHQEQvKr44TwaGyv8rJn9L9h4MJZicZwm",
        //         "owner": "8ed2wf1p9KZdvXVMyTpmMvMrBmph7rciWjkahc2pcxEM",
        //         "market": "2Keiu1EstdmTrwYwXKLQ5WeXYQzCgt6zVixjRyAYW6xu",
        //         "marketId": "POLY-6964609-0",
        //         "marketIdHash": "40390948b69a0a67f99cdfa4d66220b6",
        //         "isYes": true,
        //         "contracts": "5",
        //         "contractsMicro": "5440000",
        //         "contractsDecimal": "5.44",
        //         "totalCostUsd": "4841599",
        //         "openOrders": 0,
        //         "feesPaidUsd": "123660",
        //         "realizedPnlUsd": 0,
        //         "claimed": false,
        //         "claimedUsd": "0",
        //         "openedAt": 1794949004,
        //         "updatedAt": 1794949004,
        //         "bump": 253,
        //         "ownerPubkey": "8ed2wf1p9KZdvXVMyTpmMvMrBmph7rciWjkahc2pcxEM",
        //         "eventId": "POLY-1364543",
        //         "sizeUsd": "4841599",
        //         "valueUsd": "3644800",
        //         "avgPriceUsd": "889999",
        //         "markPriceUsd": "670000",
        //         "maxSlippageBps": 2500,
        //         "pnlUsd": "-1196799",
        //         "pnlUsdPercent": -24.71,
        //         "pnlUsdAfterFees": "-1320459",
        //         "pnlUsdAfterFeesPercent": -26.59,
        //         "eventMetadata": { "eventId": "POLY-1364543", "title": "Barcelona vs. Paris Basketball", "category": "sports", "subcategory": "euroleague", "closeTime": 1794943800, ... },
        //         "marketMetadata": { "marketId": "POLY-6964609-0", "eventId": "POLY-1364543", "provider": "polymarket", "title": "Barcelona", "status": "open", "result": null, ... },
        //         "claimable": false,
        //         "claimableAt": null,
        //         "payoutUsd": "5440000",
        //         "settlementDate": 1794943800,
        //         "sellPriceUsd": "670000",
        //         "integratorFeeUsd": "0",
        //         "source": "program"
        //     }
        //
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
        const positionsLength = positions.length;
        if (positionsLength === 0) {
            throw new BadSymbol (this.id + ' fetchPosition() found no position for ' + outcome);
        }
        return this.safeDict (positions, 0) as PredictionPosition;
    }

    /**
     * @method
     * @name jupiter#closePredictionPosition
     * @description builds an unsigned transaction to close one prediction position
     * @see https://developers.jup.ag/docs/prediction/manage-positions
     * @param {string} positionId position public key
     * @param {object} [params] requires ownerPubkey or a configured walletAddress
     * @returns {object} unsigned close transaction for caller signing and submission
     */
    override async closePredictionPosition (positionId: string, params: Dict = {}): Promise<Dict> {
        const ownerPubkey = this.safeString (params, 'ownerPubkey', this.walletAddress);
        if (ownerPubkey === undefined) {
            throw new ArgumentsRequired (this.id + ' closePredictionPosition() requires ownerPubkey or walletAddress');
        }
        const request = this.omit (params, [ 'ownerPubkey' ]);
        request['ownerPubkey'] = ownerPubkey;
        const response = await this.publicDeletePositionsPositionPubkey (this.extend ({ 'positionPubkey': positionId }, request));
        //
        //     {
        //         "transaction": "AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACxqFAwo8fABtEeN/p8XLgjnaSN/jOK...",
        //         "txMeta": {
        //             "blockhash": "JC6kyyi7sFiqJuWxLopo912d5A3mW5ku2m8NKrjYAjiU",
        //             "lastValidBlockHeight": 448694797
        //         },
        //         "externalOrderId": "ee228f74aba14215b6c9360189e01055",
        //         "requiredSigners": [ "8ed2wf1p9KZdvXVMyTpmMvMrBmph7rciWjkahc2pcxEM" ],
        //         "isGasless": false,
        //         "order": {
        //             "orderPubkey": "2MQWKXuMdw4DGNMtBxe41oM7VAX8zdaKLyJUr46vhPoU",
        //             "orderAtaPubkey": "GJCZFQFjb5AzHeJnWq5Ui7b2vGW958jmqKswVJXXfaRQ",
        //             "userPubkey": "8ed2wf1p9KZdvXVMyTpmMvMrBmph7rciWjkahc2pcxEM",
        //             "marketId": "POLY-6964609-0",
        //             "marketIdHash": "40390948b69a0a67f99cdfa4d66220b6",
        //             "positionPubkey": "9vMtMrFnabEQHQEQvKr44TwaGyv8rJn9L9h4MJZicZwm",
        //             "isBuy": false,
        //             "isYes": true,
        //             "contracts": "5",
        //             "contractsMicro": "5440000",
        //             "contractsDecimal": "5.44",
        //             "newContracts": "0",
        //             "newContractsMicro": "0",
        //             "newContractsDecimal": "0",
        //             "maxBuyPriceUsd": null,
        //             "minSellPriceUsd": "530000",
        //             "slippageBps": 0,
        //             "maxSlippageBps": 2500,
        //             "externalOrderId": "ee228f74aba14215b6c9360189e01055",
        //             "orderCostUsd": "0",
        //             "newAvgPriceUsd": "0",
        //             "newSizeUsd": "0",
        //             "newPayoutUsd": "0",
        //             "payoutUsd": "5440000",
        //             "estimatedProtocolFeeUsd": "0",
        //             "estimatedVenueFeeUsd": "133280",
        //             "estimatedIntegratorFeeUsd": "0",
        //             "estimatedTotalFeeUsd": "133280",
        //             "clientOrderId": "ee228f74aba14215b6c9360189e01055"
        //         },
        //         "clientOrderId": "ee228f74aba14215b6c9360189e01055",
        //         "execution": {
        //             "endpoint": "/api/v1/execute",
        //             "context": {
        //                 "type": "create_order"
        //             }
        //         }
        //     }
        //
        return response;
    }

    /**
     * @method
     * @name jupiter#closeAllPredictionPositions
     * @description builds unsigned transactions to close all prediction positions
     * @see https://developers.jup.ag/docs/prediction/manage-positions
     * @param {object} params requires ownerPubkey or a configured walletAddress and minSellPriceSlippageBps
     * @param {string} [params.ownerPubkey] wallet public key
     * @param {int} params.minSellPriceSlippageBps maximum sell price slippage in basis points
     * @returns {object} unsigned close transactions for caller signing and submission
     */
    override async closeAllPredictionPositions (params: Dict = {}): Promise<Dict> {
        const ownerPubkey = this.safeString (params, 'ownerPubkey', this.walletAddress);
        if (ownerPubkey === undefined) {
            throw new ArgumentsRequired (this.id + ' closeAllPredictionPositions() requires ownerPubkey or walletAddress');
        }
        const request = this.omit (params, [ 'ownerPubkey' ]);
        request['ownerPubkey'] = ownerPubkey;
        const response = await this.publicDeletePositions (request);
        //
        //     {
        //         "data": [
        //             {
        //                 "transaction": "AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA...",
        //                 "txMeta": {
        //                     "blockhash": "AYXT9Ueauo41RbaSLjq2tqD8BtbCVxLszWQtMDvrA66M",
        //                     "lastValidBlockHeight": 448694840
        //                 },
        //                 "externalOrderId": "c2d6055277aa4fbf8f7a90bdb5008a40",
        //                 "requiredSigners": [ "8ed2wf1p9KZdvXVMyTpmMvMrBmph7rciWjkahc2pcxEM" ],
        //                 "isGasless": false,
        //                 "order": {
        //                     "orderPubkey": "4iE3fMD43Liq5WqvPtTaqz25bqz5bgYuo7KpYui9vjdi",
        //                     "orderAtaPubkey": "2xbX7Dyh5jXZd6RfPnakJjRzeivaAxJtCy41niyJJp5S",
        //                     "userPubkey": "8ed2wf1p9KZdvXVMyTpmMvMrBmph7rciWjkahc2pcxEM",
        //                     "marketId": "POLY-6964606-1",
        //                     "marketIdHash": "2bde28fc94d78e94a1e7ae681dce89fa",
        //                     "positionPubkey": "8HnGuj3d8U6YJpXi8ffg3UnAXu1JASEQtg9spCbEteTz",
        //                     "isBuy": false,
        //                     "isYes": true,
        //                     "contracts": "6",
        //                     "contractsMicro": "6600000",
        //                     "contractsDecimal": "6.6",
        //                     "newContracts": "0",
        //                     "minSellPriceUsd": "630000",
        //                     "maxSlippageBps": 2500,
        //                     "externalOrderId": "c2d6055277aa4fbf8f7a90bdb5008a40",
        //                     "payoutUsd": "6600000",
        //                     "estimatedVenueFeeUsd": "156120",
        //                     "estimatedTotalFeeUsd": "156120",
        //                     "clientOrderId": "c2d6055277aa4fbf8f7a90bdb5008a40"
        //                 },
        //                 "clientOrderId": "c2d6055277aa4fbf8f7a90bdb5008a40",
        //                 "execution": {
        //                     "endpoint": "/api/v1/execute",
        //                     "context": {
        //                         "type": "create_order"
        //                     }
        //                 }
        //             },
        //             ...
        //         ]
        //     }
        //
        return response;
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
        //
        //     {
        //         "pubkey": "9vMtMrFnabEQHQEQvKr44TwaGyv8rJn9L9h4MJZicZwm",
        //         "owner": "8ed2wf1p9KZdvXVMyTpmMvMrBmph7rciWjkahc2pcxEM",
        //         "market": "2Keiu1EstdmTrwYwXKLQ5WeXYQzCgt6zVixjRyAYW6xu",
        //         "marketId": "POLY-6964609-0",
        //         "marketIdHash": "40390948b69a0a67f99cdfa4d66220b6",
        //         "isYes": true,
        //         "contracts": "5",
        //         "contractsMicro": "5440000",
        //         "contractsDecimal": "5.44",
        //         "totalCostUsd": "4841599",
        //         "openOrders": 0,
        //         "feesPaidUsd": "123660",
        //         "realizedPnlUsd": 0,
        //         "claimed": false,
        //         "claimedUsd": "0",
        //         "openedAt": 1794949004,
        //         "updatedAt": 1794949004,
        //         "ownerPubkey": "8ed2wf1p9KZdvXVMyTpmMvMrBmph7rciWjkahc2pcxEM",
        //         "eventId": "POLY-1364543",
        //         "sizeUsd": "4841599",
        //         "valueUsd": "3264000",
        //         "avgPriceUsd": "889999",
        //         "markPriceUsd": "600000",
        //         "maxSlippageBps": 2500,
        //         "pnlUsd": "-1577599",
        //         "pnlUsdPercent": -32.58,
        //         "eventMetadata": { "eventId": "POLY-1364543", "title": "Barcelona vs. Paris Basketball", "category": "sports", ... },
        //         "marketMetadata": { "marketId": "POLY-6964609-0", "eventId": "POLY-1364543", "provider": "polymarket", "title": "Barcelona", "status": "open", "result": null, ... },
        //         "claimable": false,
        //         "claimableAt": null,
        //         "payoutUsd": "5440000",
        //         "settlementDate": 1794943800,
        //         "sellPriceUsd": "600000",
        //         "integratorFeeUsd": "0",
        //         "source": "program"
        //     }
        //
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
            'timestamp': this.parseJupiterTimestamp (updatedAt),
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
        //
        //     {
        //         "eventId": "POLY-1273034",
        //         "isActive": true,
        //         "isLive": false,
        //         "category": "economics",
        //         "subcategory": "",
        //         "tags": [ "economics", "economy", "politics", "trump", "finance", "fed-rates", "fed", "fomc", ... ],
        //         "metadata": {
        //             "slug": "fed-decision-in-april-2027",
        //             "title": "Fed Decision in April?",
        //             "isLive": false,
        //             "series": "polymarket",
        //             "eventId": "POLY-1273034",
        //             "imageUrl": "https://polymarket-upload.s3.us-east-2.amazonaws.com/fed-decision-in-september-762-c4RyWuxRPo1L.jpg",
        //             "subtitle": "",
        //             "closeTime": "2027-04-28T23:59:00Z"
        //         },
        //         "volumeUsd": "85679000000",
        //         "volume24hr": "2418000000",
        //         "beginAt": null,
        //         "closeCondition": "This market will close and expire after a winner is declared.",
        //         "rulesPdf": "",
        //         "markets": [
        //             {
        //                 "provider": "polymarket",
        //                 "marketId": "POLY-6353937",
        //                 "status": "open",
        //                 "result": null,
        //                 "marketResultPubkey": null,
        //                 "title": "No change",
        //                 "openTime": 1793210502,
        //                 "closeTime": 1808956740,
        //                 "isTeamMarket": false,
        //                 "rulesPrimary": "The FED interest rates are defined in this market by the upper bound of the target federal funds range. ...",
        //                 "rulesSecondary": "",
        //                 "resolveAt": null,
        //                 "pricing": {
        //                     "buyYesPriceUsd": 600000,
        //                     "sellYesPriceUsd": 580000,
        //                     "sellNoPriceUsd": 400000,
        //                     "buyNoPriceUsd": 420000,
        //                     "volume": 18584
        //                 },
        //                 "imageUrl": null,
        //                 "team": null,
        //                 "outcomes": [ "Yes", "No" ],
        //                 "marketOptions": [ { "label": "Yes", "buyYes": true }, { "label": "No", "buyYes": false } ],
        //                 ...
        //             },
        //             ...
        //         ],
        //         "sportsMarketGroups": []
        //     }
        //
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
            const marketStatus = this.safeString (rawMarket, 'status');
            const active = (marketStatus === undefined) ? undefined : (marketStatus === 'open');
            const marketEnd = this.parseJupiterTimestamp (this.safeInteger (rawMarket, 'closeTime'));
            const rawOutcomeLabels = this.safeList (rawMarket, 'outcomes', [ 'Yes', 'No' ]);
            let yesLabel = 'Yes';
            let noLabel = 'No';
            const marketOptions = this.safeList (rawMarket, 'marketOptions', []);
            const marketOptionsLength = marketOptions.length;
            if (marketOptionsLength > 0) {
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
                { 'info': rawMarket, 'outcome': marketHandle + ':YES', 'outcomeId': marketId + ':YES', 'label': yesLabel, 'market': marketHandle, 'marketId': marketId, 'event': id, 'price': (yesPrice !== undefined) ? yesPrice / 1000000 : undefined, 'active': active },
                { 'info': rawMarket, 'outcome': marketHandle + ':NO', 'outcomeId': marketId + ':NO', 'label': noLabel, 'market': marketHandle, 'marketId': marketId, 'event': id, 'price': (noPrice !== undefined) ? noPrice / 1000000 : undefined, 'active': active },
            ];
            const rawMarketMetaData = this.safeDict (rawMarket, 'metadata', {});
            const marketTitleDefault = this.safeString (rawMarketMetaData, 'title');
            let marketClosed = undefined;
            if (marketStatus !== undefined) {
                marketClosed = (marketStatus === 'closed');
            }
            const rawMarketResult = this.safeString (rawMarket, 'result');
            let marketResolved = false;
            if ((rawMarketResult !== undefined) && (rawMarketResult !== '')) {
                marketResolved = true;
            }
            let marketVolumeResponse = undefined;
            if (marketVolume !== undefined) {
                marketVolumeResponse = marketVolume / 1000000;
            }
            markets.push ({
                'info': rawMarket,
                'id': marketId,
                'market': marketHandle,
                'event': id,
                'base': marketId,
                'quote': 'USD',
                'settle': 'USD',
                'baseId': marketId,
                'quoteId': 'USD',
                'settleId': 'USD',
                'type': 'prediction',
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'prediction': true,
                'contract': false,
                'linear': false,
                'inverse': false,
                'expiry': marketEnd,
                'expiryDatetime': this.iso8601 (marketEnd),
                'precision': { 'amount': 0.000001, 'price': 0.000001 },
                'limits': { 'amount': { 'min': undefined, 'max': undefined }, 'cost': { 'min': undefined, 'max': undefined }},
                'percentage': false,
                'tierBased': false,
                'marketType': 'binary',
                'executionModel': 'amm',
                'title': this.safeString (rawMarket, 'title', marketTitleDefault),
                'description': this.safeString (rawMarket, 'description'),
                'outcomes': outcomes,
                'collateral': 'USD',
                'active': active,
                'closed': marketClosed,
                'resolved': marketResolved,
                'volume': marketVolumeResponse,
                'liquidity': this.safeNumber (rawMarket, 'liquidityUsd'),
                'end': marketEnd,
                'endDatetime': this.iso8601 (marketEnd),
            });
        }
        let end = this.parseJupiterTimestamp (this.safeInteger (raw, 'closeTime'));
        if (end === undefined) {
            end = this.parse8601 (this.safeString (metadata, 'closeTime'));
        }
        const status = this.safeString (raw, 'status');
        const resolvedDefault = (status === 'resolved');
        const titleDefault = this.safeString (metadata, 'title');
        const descriptionDefault = this.safeString (metadata, 'description');
        const slugDefault = this.safeString (metadata, 'slug');
        const created = this.safeInteger (raw, 'createdAt');
        return {
            'info': raw,
            'id': id,
            'event': id,
            'title': this.safeString (raw, 'title', titleDefault),
            'description': this.safeString (raw, 'description', descriptionDefault),
            'slug': this.safeString (raw, 'slug', slugDefault),
            'category': this.safeString (raw, 'category'),
            'tags': this.safeList (raw, 'tags'),
            'markets': markets,
            'active': this.safeBool2 (raw, 'active', 'isActive'),
            'resolved': this.safeBool (raw, 'resolved', resolvedDefault),
            'volume': this.safeNumber (raw, 'volumeUsd'),
            'liquidity': this.safeNumber (raw, 'liquidityUsd'),
            'created': this.parseJupiterTimestamp (created),
            'end': end,
            'endDatetime': this.iso8601 (end),
            'image': this.safeString (metadata, 'imageUrl'),
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
        let defaultOutcome = undefined;
        if (marketId !== undefined) {
            const outcomeSide = (isYes) ? 'YES' : 'NO';
            defaultOutcome = marketId + ':' + outcomeSide;
        }
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
        let outcomeId = undefined;
        if (marketId !== undefined) {
            const outcomeSide = (isYes) ? 'YES' : 'NO';
            outcomeId = marketId + ':' + outcomeSide;
        }
        let defaultLabel = 'No';
        if (isYes) {
            defaultLabel = 'Yes';
        }
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
            'outcomeId': this.safeString (market, 'outcomeId', outcomeId),
            'label': this.safeString (market, 'label', defaultLabel),
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
        //
        // publicGetTrades (global feed)
        //
        //     {
        //         "id": "order-5048570",
        //         "ownerPubkey": "CqRes7Fvso7h765yS6Gu3qwvtfCsJWnqV3iXp4rvpe7R",
        //         "marketId": "POLY-6674178-0",
        //         "message": "CqRes7Fvso7h765yS6Gu3qwvtfCsJWnqV3iXp4rvpe7R bought Yes for Over at $0.84 ($97.26)",
        //         "timestamp": 1794949239,
        //         "action": "buy",
        //         "side": "yes",
        //         "eventTitle": "Wales vs. Portugal - More Markets",
        //         "marketTitle": "Over",
        //         "amountUsd": "97263599",
        //         "priceUsd": "839999",
        //         "eventImageUrl": "https://polymarket-upload.s3.us-east-2.amazonaws.com/soccer-leagues/unl.png",
        //         "eventId": "POLY-1313366",
        //         "isTeamMarket": true,
        //         "marketOptions": [ { "label": "O 4.5", "buyYes": true } ]
        //     }
        //
        // publicGetHistory (account history, eventType order_filled)
        //
        //     {
        //         "id": 1257717,
        //         "eventType": "order_closed",
        //         "signature": "5Ckpg3fB7YE83hKVDBerFMjZTDU6ArTsJkZJk3aw5X84YgJUG2DmwYZdcUvCSPE3Nk5reiEyB1dCxHbZhcVGSGyk",
        //         "slot": "417542920",
        //         "timestamp": 1777901989,
        //         "orderPubkey": "4NJqSjU5quEFJWFgKJ3ii6WMMvaauCwXuN1L68425hXM",
        //         "positionPubkey": "GTQLdnWgBYbHj2dRtticRzRUKZeYyCz7aELM21pcgM1G",
        //         "marketId": "POLY-2148276-1",
        //         "ownerPubkey": "CdzvU3te3u5jJpcKVp769Jcwr9Dd5HNeSh8AVWWSpS5d",
        //         "isBuy": true,
        //         "isYes": true,
        //         "contracts": "94",
        //         "contractsMicro": "94000000",
        //         "contractsDecimal": "94",
        //         "filledContracts": "0",
        //         "maxFillPriceUsd": "827978",
        //         "avgFillPriceUsd": "0",
        //         "maxBuyPriceUsd": "830000",
        //         "minSellPriceUsd": null,
        //         "depositAmountUsd": "0",
        //         "totalCostUsd": "0",
        //         "feeUsd": null,
        //         "status": null,
        //         "eventId": "POLY-444660",
        //         "marketMetadata": { "marketId": "POLY-2148276-1", "eventId": "POLY-444660", "provider": "polymarket", "title": "Down", "status": "yes", "result": "yes", ... },
        //         "eventMetadata": { "eventId": "POLY-444660", "title": "Ethereum Up or Down - May 4, 9:35AM-9:40AM ET", "category": "crypto", "subcategory": "eth", ... }
        //     }
        //
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
        const sideString = this.safeString (trade, 'side', '');
        const isYes = this.safeBool (trade, 'isYes', sideString.toLowerCase () === 'yes');
        let defaultSide = 'sell';
        if (this.safeBool (trade, 'isBuy', true)) {
            defaultSide = 'buy';
        }
        let defaultLabel = 'No';
        if (isYes) {
            defaultLabel = 'Yes';
        }
        let defaultOutcome = undefined;
        if (marketId !== undefined) {
            const outcomeSide = (isYes) ? 'YES' : 'NO';
            defaultOutcome = marketId + ':' + outcomeSide;
        }
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
            'side': this.safeString (trade, 'action', defaultSide),
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
            'outcome': outcome,
            'outcomeId': this.safeString (market, 'outcomeId', this.safeString (trade, 'positionPubkey')),
            'label': this.safeString (market, 'label', defaultLabel),
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
        //
        //     [ [ "0.0100", 1141573.22 ], [ "0.0200", 156094.75 ], [ "0.0300", 42180.96 ], [ "0.0400", 75365.78 ], [ "0.0500", 28374.98 ], ... ]
        //
        const result: [Num, Num][] = [];
        const levelsCount = levels.length;
        const levelsLength = (limit === undefined) ? levelsCount : Math.min (levelsCount, limit);
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

    override handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
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
        const url = this.urls['api'][api[0]] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let requestUrl = undefined;
        if (method === 'GET' && Object.keys (query).length > 0) {
            requestUrl = url + '?' + this.urlencode (query);
        } else {
            requestUrl = url;
        }
        const headers: Dict = { 'Accept': 'application/json' };
        if (this.apiKey !== undefined) {
            headers['x-api-key'] = this.apiKey;
        }
        let body: string | undefined = undefined;
        if (method !== 'GET') {
            headers['Content-Type'] = 'application/json';
            body = this.json (query);
        }
        return { 'url': requestUrl, 'method': method, 'body': body, 'headers': headers };
    }
}
