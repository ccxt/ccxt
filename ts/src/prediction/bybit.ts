import { sha256 } from '@noble/hashes/sha2.js';
import Exchange from '../abstract/prediction/bybit.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, ExchangeError, InvalidNonce, PermissionDenied, RateLimitExceeded, InsufficientFunds, OrderNotFound } from '../base/errors.js';
import type { Int, Str, Dict, Strings, Num, Market, OrderType, OrderSide, PredictionOrderBook, PredictionOrder, PredictionTrade, PredictionPosition, PredictionSettlement, PredictionEvent, fetchEventsParams, Endpoint, NullableDict, Fee } from '../base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class bybit
 * @augments Exchange
 * @description Bybit Event Contract trading — a maker-quote-driven structured product where
 * each listed symbol (e.g. BTCUSDT-15MIN-DOWN) is a single tradable binary outcome with a
 * defined payout ratio. Access to every endpoint (including market data) is restricted to
 * approved Event Contract market makers
 */
export default class bybit extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'bybit',
            'name': 'Bybit',
            'countries': [ 'VG' ], // British Virgin Islands
            'hostname': 'bybit.com', // bybit.com, bytick.com, bybit.nl, bybit.com.hk
            'rateLimit': 20,
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchEvent': true,
                'fetchEvents': true,
                'fetchMarkets': true,
                'fetchOutcome': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchSettlements': true,
                'prediction': true,
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/97a5d0b3-de10-423d-90e1-6620960025ed',
                'api': {
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
                },
                'test': {
                    'public': 'https://api-testnet.{hostname}',
                    'private': 'https://api-testnet.{hostname}',
                },
                'www': 'https://www.bybit.com',
                'doc': [
                    'https://bybit-exchange.github.io/docs/v5/event/introduction',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'v5/event/instruments-info': { 'cost': 5 } as Endpoint<Dict>,
                        'v5/event/orderbook': { 'cost': 5 } as Endpoint<Dict>,
                    },
                },
                'private': {
                    'get': {
                        'v5/event/order-list': { 'cost': 5 } as Endpoint<Dict>,
                        'v5/event/order-realtime': { 'cost': 5 } as Endpoint<Dict>,
                        'v5/event/positions': { 'cost': 5 } as Endpoint<Dict>,
                        'v5/event/settlements': { 'cost': 5 } as Endpoint<Dict>,
                        'v5/event/trades': { 'cost': 5 } as Endpoint<Dict>,
                    },
                    'post': {
                        'v5/event/quotes': { 'cost': 5 } as Endpoint<Dict>,
                        'v5/event/cancel': { 'cost': 5 } as Endpoint<Dict>,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0,
                    'taker': 0,   // bybit reports the real per-symbol takerFeeRate/makerFeeRate on every instrument
                },
            },
            'exceptions': {
                'exact': {
                    '10001': BadRequest,
                    '10002': InvalidNonce,
                    '10003': AuthenticationError, // invalid api key
                    '10004': AuthenticationError, // invalid sign
                    '10005': PermissionDenied,
                    '10006': RateLimitExceeded,
                    '110001': OrderNotFound,
                    '110012': InsufficientFunds,
                },
                'broad': {
                    'insufficient balance': InsufficientFunds,
                    'order not exists': OrderNotFound,
                },
            },
            'options': {
                'recvWindow': 5000,
                'instrumentsPageLimit': 100,   // v5/event/instruments-info page size (max 100)
                'maxFetchMarketsLimit': 2000,  // cap on instruments collected by an unscoped fetchMarkets
            },
        });
    }

    override nonce (): number {
        return this.milliseconds ();
    }

    /**
     * @method
     * @name bybit#fetchEvents
     * @description fetches Bybit Event Contract events grouped from instrument metadata
     * @see https://bybit-exchange.github.io/docs/v5/event/market/instrument-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.status] 'active', 'closed' or 'all'; maps to Bybit instrument status
     * @param {int} [params.limit] the maximum number of instruments to inspect
     * @param {string} [params.query] filters the derived event id and title client-side
     * @returns {object[]} a list of [prediction event structures](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    override async fetchEvents (params: fetchEventsParams = {}): Promise<PredictionEvent[]> {
        const status = this.safeStringLower (params, 'status', 'active');
        let instrumentStatus = this.safeString (params, 'instrumentStatus');
        if (instrumentStatus === undefined) {
            if (status === 'active') {
                instrumentStatus = 'Trading';
            } else if (status === 'closed' || status === 'inactive') {
                instrumentStatus = 'Closed';
            }
        }
        const request: Dict = this.omit (params, [ 'query', 'queries', 'tags', 'status', 'sort', 'searchIn', 'eventId', 'slug', 'instrumentStatus' ]);
        if (instrumentStatus !== undefined) {
            request['status'] = instrumentStatus;
        }
        const rawMarkets = await this.fetchMarkets (request);
        const eventsById: Dict = {};
        const query = this.safeStringLower (params, 'query');
        const queries = this.parseSearchQueries (params);
        const wantedQueries: string[] = [];
        if (query !== undefined) {
            wantedQueries.push (query);
        }
        for (let i = 0; i < queries.length; i++) {
            wantedQueries.push (queries[i].toLowerCase ());
        }
        for (let i = 0; i < rawMarkets.length; i++) {
            const market = rawMarkets[i];
            if (market === undefined) {
                continue;
            }
            const eventId = this.safeString (market, 'event', this.safeString (market, 'market'));
            if (eventId === undefined) {
                continue;
            }
            const eventText = (eventId + ' ' + this.safeString (market, 'market', '')).toLowerCase ();
            let matched = true;
            for (let qi = 0; qi < wantedQueries.length; qi++) {
                if (eventText.indexOf (wantedQueries[qi]) < 0) {
                    matched = false;
                    break;
                }
            }
            if (!matched) {
                continue;
            }
            if (!(eventId in eventsById)) {
                eventsById[eventId] = {
                    'info': market['info'],
                    'id': eventId,
                    'event': eventId,
                    'slug': eventId,
                    'title': eventId,
                    'markets': [],
                    'active': false,
                    'resolved': true,
                };
            }
            const event = eventsById[eventId];
            event['markets'].push (market);
            if (this.safeBool (market, 'active', false)) {
                event['active'] = true;
            }
            if (!this.safeBool (market, 'resolved', false)) {
                event['resolved'] = false;
            }
        }
        const events: PredictionEvent[] = [];
        const eventKeys = Object.keys (eventsById);
        for (let i = 0; i < eventKeys.length; i++) {
            events.push (eventsById[eventKeys[i]] as PredictionEvent);
        }
        const filtered = this.applyEventFetchParams (events, params, wantedQueries);
        this.setMarkets (rawMarkets);
        return filtered as PredictionEvent[];
    }

    /**
     * @method
     * @name bybit#fetchEvent
     * @description fetches a derived Bybit Event Contract event by its event handle
     * @see https://bybit-exchange.github.io/docs/v5/event/market/instrument-info
     * @param {string} id the derived event handle, e.g. BTCUSDT-15MIN
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    override async fetchEvent (id: string, params = {}): Promise<PredictionEvent> {
        const events = await this.fetchEvents (this.extend ({ 'eventId': id, 'status': 'all' }, params));
        for (let i = 0; i < events.length; i++) {
            if (events[i]['id'] === id || events[i]['event'] === id || events[i]['slug'] === id) {
                return events[i];
            }
        }
        throw new ExchangeError (this.id + ' fetchEvent() could not find event ' + id);
    }

    /**
     * @method
     * @name bybit#fetchOutcome
     * @description resolves a Bybit Event Contract outcome by handle or instrument symbol id
     * @see https://bybit-exchange.github.io/docs/v5/event/market/instrument-info
     * @param {string} outcomeSymbol a unified outcome handle or Bybit symbol id
     * @returns {object} a prediction outcome structure
     */
    override async fetchOutcome (outcomeSymbol: string): Promise<any> {
        const colonIndex = outcomeSymbol.indexOf (':');
        const marketSymbol = (colonIndex >= 0) ? outcomeSymbol.slice (0, colonIndex) : outcomeSymbol;
        const statuses = [ 'Trading', 'PreLaunch', 'Delivering', 'Closed' ];
        for (let i = 0; i < statuses.length; i++) {
            const markets = await this.fetchMarkets ({ 'symbol': marketSymbol, 'status': statuses[i], 'limit': 1 });
            if (markets.length > 0) {
                this.setMarkets (markets);
                if (this.hasOutcome (outcomeSymbol)) {
                    return this.safeOutcome (outcomeSymbol);
                }
            }
        }
        await this.loadMarkets (false);
        if (this.hasOutcome (outcomeSymbol)) {
            return this.safeOutcome (outcomeSymbol);
        }
        throw new ExchangeError (this.id + ' fetchOutcome() could not resolve outcome ' + outcomeSymbol);
    }

    /**
     * @method
     * @name bybit#fetchMarkets
     * @description fetches bybit Event Contract instruments (each instrument is a single tradable outcome, e.g. BTCUSDT-15MIN-DOWN)
     * @see https://bybit-exchange.github.io/docs/v5/event/market/instrument-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.symbol] fetch a single instrument by its exact symbol
     * @param {string} [params.status] 'PreLaunch', 'Trading', 'Delivering' or 'Closed'; defaults to 'Trading'
     * @param {int} [params.limit] the maximum number of instruments to collect (defaults to options.maxFetchMarketsLimit, 2000)
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params = {}): Promise<Market[]> {
        const maxInstruments = this.safeInteger (params, 'limit', this.safeInteger (this.options, 'maxFetchMarketsLimit', 2000));
        const rest = this.omit (params, 'limit');
        if (this.safeString (rest, 'status') === undefined) {
            rest['status'] = 'Trading';
        }
        const configuredPageLimit = this.safeInteger (this.options, 'instrumentsPageLimit', 100);
        const pageLimit = (maxInstruments < configuredPageLimit) ? maxInstruments : configuredPageLimit;
        const flatMarkets: Market[] = [];
        let cursor: Str = undefined;
        while (true) {
            const request: Dict = { 'limit': pageLimit };
            if (cursor !== undefined) {
                request['cursor'] = cursor;
            }
            const response = await this.publicGetV5EventInstrumentsInfo (this.extend (request, rest));
            const result = this.safeDict (response, 'result', {});
            const rawInstruments = this.safeList (result, 'list', []);
            const rawInstrumentsLength = rawInstruments.length;
            for (let i = 0; i < rawInstrumentsLength; i++) {
                flatMarkets.push (this.parseMarket (rawInstruments[i]));
            }
            cursor = this.safeString (result, 'nextPageCursor');
            const collectedLength = flatMarkets.length;
            if ((cursor === undefined) || (cursor === '') || (rawInstrumentsLength < pageLimit) || (collectedLength >= maxInstruments)) {
                break;
            }
        }
        const flatMarketsLength = flatMarkets.length;
        if (flatMarketsLength > maxInstruments) {
            return this.arraySlice (flatMarkets, 0, maxInstruments);
        }
        return flatMarkets;
    }

    /**
     * @ignore
     * @method
     * @name bybit#parseOutcomeLabel
     * @description derives the outcome label from an event-contract symbol's trailing direction segment
     * @param {string} symbol the raw bybit event-contract symbol, e.g. BTCUSDT-15MIN-DOWN
     * @param {string} contractType Up_Down, Target or Range
     * @returns {string} the outcome label, e.g. UP, DOWN, ABOVE, BELOW, IN, OUT
     */
    parseOutcomeLabel (symbol: Str, contractType: Str): string {
        const knownLabels = [ 'UP', 'DOWN', 'ABOVE', 'BELOW', 'IN', 'OUT' ];
        if (symbol !== undefined) {
            const parts = symbol.split ('-');
            const partsLength = parts.length;
            if (partsLength > 1) {
                const lastPart = parts[partsLength - 1];
                if (this.inArray (lastPart, knownLabels)) {
                    return lastPart;
                }
            }
        }
        if (contractType === 'Target') {
            return 'ABOVE';
        } else if (contractType === 'Range') {
            return 'OUT';
        }
        return 'UP';
    }

    override parseMarket (raw: Dict): Market {
        //
        //     {
        //         "symbolId": 500017,
        //         "symbol": "BTCUSDT-15MIN-DOWN",
        //         "baseCoin": "BTC",
        //         "quoteCoin": "USDT",
        //         "settleCoin": "USDT",
        //         "eventContractType": "Up_Down",
        //         "durationWindow": 900,
        //         "rvThreshold": "0.60",
        //         "rebate": "0",
        //         "takerFeeRate": "0.0088",
        //         "makerFeeRate": "0",
        //         "launchTime": "1786000980000",
        //         "deliveryTime": "1798779602000",
        //         "status": "Trading",
        //         "targetPrice": "0",
        //         "lowerBound": "0",
        //         "upperBound": "0",
        //         "callOptionSymbolId": 0,
        //         "putOptionSymbolId": 0,
        //         "feeRateRule": [ { "minSecToDelivery": 0, "maxSecToDelivery": 315360000, "baseMarkup": "0.0600" } ],
        //         "quotationLimit": [ { "minSecToDelivery": 0, "maxSecToDelivery": 315360000, "quoteMaxAmountPerUser": "20000", "quoteMinAmountPerUser": "10000", "quoteMinAmount": "50" } ],
        //         "lotSizeFilter": { "minOrderAmount": "5", "maxOrderAmount": "800", "orderAmountTickSize": "1", "quoteMaxValidMs": 60000, "quoteMinIntervalPerUserMs": 200 }
        //     }
        //
        const symbol = this.safeString (raw, 'symbol');
        if (symbol === undefined) {
            throw new ExchangeError (this.id + ' parseMarket() received an instrument without a symbol');
        }
        const symbolId = this.safeString (raw, 'symbolId');
        const baseCoin = this.safeString (raw, 'baseCoin');
        const quoteCoin = this.safeString (raw, 'quoteCoin');
        const settleCoin = this.safeString (raw, 'settleCoin');
        const contractType = this.safeString (raw, 'eventContractType');
        const status = this.safeString (raw, 'status');
        const active = (status === 'Trading');
        const resolved = (status === 'Closed');
        const launchTime = this.safeInteger (raw, 'launchTime');
        const deliveryTime = this.safeInteger (raw, 'deliveryTime');
        const takerFeeRate = this.safeNumber (raw, 'takerFeeRate');
        const makerFeeRate = this.safeNumber (raw, 'makerFeeRate');
        const targetPrice = this.omitZero (this.safeString (raw, 'targetPrice'));
        const lotSizeFilter = this.safeDict (raw, 'lotSizeFilter', {});
        const precision = {
            'amount': this.safeNumber (lotSizeFilter, 'orderAmountTickSize'),
            'price': undefined,
        };
        const symbolParts = symbol.split ('-');
        const symbolPartsLength = symbolParts.length;
        const eventId = (symbolPartsLength > 1) ? this.arraySlice (symbolParts, 0, symbolPartsLength - 1).join ('-') : symbol;
        const label = this.parseOutcomeLabel (symbol, contractType);
        const outcomeHandle = symbol + ':' + label;
        const outcomes: any[] = [
            {
                'id': symbolId,
                'outcomeId': symbolId,
                'outcome': outcomeHandle,
                'market': symbol,
                'event': eventId,
                'label': label,
                'active': active,
                'winner': undefined,
                'settleFraction': undefined,
                'precision': precision,
                'info': raw,
            },
        ];
        return {
            'id': symbol,
            'market': symbol,
            'event': eventId,
            'base': baseCoin,
            'quote': quoteCoin,
            'settle': settleCoin,
            'baseId': baseCoin,
            'quoteId': quoteCoin,
            'settleId': settleCoin,
            'type': 'prediction',
            'marketType': 'binary',
            'executionModel': 'quote', // maker-submitted payout-ratio quotes, not a resting CLOB
            'spot': false,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'prediction': true,
            'active': active,
            'resolved': resolved,
            'resolvedOutcome': undefined,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': deliveryTime,
            'expiryDatetime': (deliveryTime !== undefined) ? this.iso8601 (deliveryTime) : undefined,
            'strike': this.parseNumber (targetPrice),
            'optionType': undefined,
            'taker': takerFeeRate,
            'maker': makerFeeRate,
            'percentage': true,
            'tierBased': false,
            'feeSide': 'quote',
            'precision': precision,
            'limits': {
                'leverage': { 'min': 1, 'max': 1 },
                'amount': {
                    'min': this.safeNumber (lotSizeFilter, 'minOrderAmount'),
                    'max': this.safeNumber (lotSizeFilter, 'maxOrderAmount'),
                },
                'price': { 'min': 0, 'max': 1 },
                'cost': { 'min': undefined, 'max': undefined },
            },
            'outcomes': outcomes,
            'info': raw,
            'created': launchTime,
        } as unknown as Market;
    }

    /**
     * @method
     * @name bybit#fetchOrderBook
     * @description fetches the 25-level payout-ratio orderbook for a single bybit event-contract outcome
     * @see https://bybit-exchange.github.io/docs/v5/event/market/orderbook
     * @param {string} outcome unified outcome handle or the raw bybit symbol
     * @param {int} [limit] not enforced by bybit's API (always up to 25 levels)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)
     */
    override async fetchOrderBook (outcome: Str, limit: Int = undefined, params = {}): Promise<PredictionOrderBook> {
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const marketSymbol = this.safeString (outcomeObj, 'market');
        const request: Dict = { 'symbol': marketSymbol };
        const response = await this.publicGetV5EventOrderbook (this.extend (request, params));
        const result = this.safeDict (response, 'result', {});
        return this.parsePredictionOrderBook (result, outcomeObj);
    }

    parsePredictionOrderBook (book: Dict, outcomeObj: Market = undefined): PredictionOrderBook {
        //
        //     {
        //         "s": "BTCUSDT-5MIN-UP",
        //         "r": [ [ "0.90", "50000" ] ],
        //         "ts": 1716863719031,
        //         "u": 230704,
        //         "seq": 1432604333,
        //         "cts": 1716863718905
        //     }
        //
        // bybit's event-contract book is a single maker-quote ladder (payoutRatio, orderValue) — the
        // resting offers a taker can buy against. there is no separate bid ladder documented, so the
        // levels are surfaced as asks and the bid side is left empty
        const rawLevels = this.safeList (book, 'r', []);
        const asks: [Num, Num][] = [];
        const rawLevelsLength = rawLevels.length;
        for (let i = 0; i < rawLevelsLength; i++) {
            const level = rawLevels[i];
            asks.push ([ this.safeNumber (level, 0), this.safeNumber (level, 1) ]);
        }
        const timestamp = this.safeInteger (book, 'ts', this.milliseconds ());
        const orderbook: Dict = {
            'bids': [],
            'asks': asks,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': this.safeInteger (book, 'u'),
            'outcome': undefined,
            'market': undefined,
            'info': book,
        };
        return this.safePredictionOrderBook (orderbook, outcomeObj);
    }

    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'New': 'open',
            'PartiallyFilled': 'open',
            'Untriggered': 'open',
            'Filled': 'closed',
            'Cancelled': 'canceled',
            'PartiallyFilledCanceled': 'canceled',
            'Rejected': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    override parsePredictionOrder (order: Dict, market: Market = undefined): PredictionOrder {
        //
        // v5/event/order-list (history)
        //     {
        //         "orderId": "1234567890", "orderLinkId": "", "orderStatus": "Filled",
        //         "symbol": "ETHUSDT-28AUG26-2450-2570-OUT", "symbolId": "100001",
        //         "baseCoin": "BTC", "quoteCoin": "USDT", "settleCoin": "USDT",
        //         "ecDirection": "UP", "ecDurationWindow": "300", "ecTargetPrice": "",
        //         "ecContractType": "UpDown", "ecLowerBound": "", "ecUpperBound": "",
        //         "settleTimeMs": "1694515498753", "ecOrderValue": "50", "ecIndexPrice": "26000.5",
        //         "orderAvgPayoutRatio": "1.85", "cumExecValue": "50", "payoutRatio": "1.95",
        //         "tradeFee": "0.5", "transTime": "1694402559843", "createTime": "1694402559843",
        //         "updateTime": "1694515498753", "cumPayout": "92.5", "cumExecFee": "0.5",
        //         "cancelType": "", "createType": "CreateByUser", "rejectReason": "", "extraFees": ""
        //     }
        //
        // v5/event/order-realtime (open orders)
        //     {
        //         "orderId": "1234567890", "orderLinkId": "my-order-001",
        //         "symbol": "ETHUSDT-28AUG26-2450-2570-OUT", "symbolId": "100001",
        //         "side": "Buy", "orderStatus": "New", "payoutRatio": "1.95",
        //         "cumExecValue": "0", "cumExecFee": "0", "leavesValue": "50",
        //         "ecContractType": "UpDown", "ecDirection": "UP", "ecOrderValue": "50",
        //         "ecSettleTime": "1694515498753", "createType": "CreateByUser",
        //         "createdTime": "1694402559843", "updatedTime": "1694402559843"
        //     }
        //
        const id = this.safeString (order, 'orderId');
        const clientOrderId = this.omitZero (this.safeString (order, 'orderLinkId'));
        const symbol = this.safeString (order, 'symbol');
        const outcomeObj = this.safeOutcome (undefined, market);
        const status = this.parseOrderStatus (this.safeString (order, 'orderStatus'));
        const side = this.safeStringLower (order, 'side');
        const price = this.safeString2 (order, 'payoutRatio', 'orderAvgPayoutRatio');
        const average = this.safeString (order, 'orderAvgPayoutRatio');
        // bybit event contracts are value-denominated (settle-currency amount), not share-count based
        const amount = this.safeString (order, 'ecOrderValue');
        const filled = this.safeString (order, 'cumExecValue');
        const remaining = this.safeString (order, 'leavesValue');
        const feeCost = this.safeString2 (order, 'cumExecFee', 'tradeFee');
        const settleCoin = this.safeString (order, 'settleCoin');
        let fee: Fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'cost': this.parseNumber (feeCost), 'currency': settleCoin };
        }
        const timestamp = this.safeIntegerN (order, [ 'createTime', 'createdTime' ]);
        const lastUpdateTimestamp = this.safeIntegerN (order, [ 'updateTime', 'updatedTime' ]);
        return this.safePredictionOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'status': status,
            'type': 'limit',
            'side': side,
            'price': this.parseNumber (price),
            'average': this.parseNumber (average),
            'amount': this.parseNumber (amount),
            'filled': this.parseNumber (filled),
            'remaining': this.parseNumber (remaining),
            'cost': this.parseNumber (filled),
            'fee': fee,
            'trades': [],
            'outcome': this.safeString (outcomeObj, 'outcome', symbol),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market', symbol),
            'info': order,
        }, outcomeObj);
    }

    /**
     * @method
     * @name bybit#fetchOrders
     * @description fetches the maker's historical Event Contract orders (past 2 years)
     * @see https://bybit-exchange.github.io/docs/v5/event/trade/order-list
     * @param {string} [outcome] unified outcome handle or raw bybit symbol
     * @param {int} [since] not supported directly; use params.startTime
     * @param {int} [limit] the maximum number of orders to fetch, default 50, max 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.startTime] start time in ms, default 7 days ago
     * @param {int} [params.endTime] end time in ms, default now
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async fetchOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        let outcomeObj: Market = undefined;
        const request: Dict = {};
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
            outcomeObj = this.outcome (outcome);
            request['symbol'] = this.safeString (outcomeObj, 'market');
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.privateGetV5EventOrderList (this.extend (request, params));
        const result = this.safeDict (response, 'result', {});
        const rawOrders = this.safeList (result, 'list', []);
        return this.parsePredictionOrders (rawOrders, outcomeObj, since, limit);
    }

    /**
     * @method
     * @name bybit#fetchOpenOrders
     * @description fetches the maker's real-time unfilled or partially filled Event Contract orders
     * @see https://bybit-exchange.github.io/docs/v5/event/trade/open-order
     * @param {string} [outcome] unified outcome handle or raw bybit symbol
     * @param {int} [since] not supported by this endpoint, used for client-side filtering only
     * @param {int} [limit] the maximum number of orders to fetch, default 20, max 50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async fetchOpenOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        let outcomeObj: Market = undefined;
        const request: Dict = {};
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
            outcomeObj = this.outcome (outcome);
            request['symbol'] = this.safeString (outcomeObj, 'market');
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV5EventOrderRealtime (this.extend (request, params));
        const result = this.safeDict (response, 'result', {});
        const rawOrders = this.safeList (result, 'list', []);
        return this.parsePredictionOrders (rawOrders, outcomeObj, since, limit);
    }

    override parsePredictionTrade (trade: Dict, market: Market = undefined): PredictionTrade {
        //
        //     {
        //         "orderId": "1234567890", "orderLinkId": "my-order-001", "execId": "exec-001",
        //         "symbol": "ETHUSDT-28AUG26-2450-2570-OUT", "baseCoin": "BTC", "settleCoin": "USDT",
        //         "side": "Buy", "execType": "Trade", "execPrice": "1.95", "execValue": "50",
        //         "execFee": "0.5", "execFeeRate": "0.01", "orderPrice": "1.95", "feeCoin": "USDT",
        //         "transTime": "1694402559843", "timeInForce": "GTC", "crossSeq": "31413030",
        //         "ecPayout": "0", "ecDurationWindow": "300", "settleTimeMs": "1694515498753",
        //         "ecOrderValue": "50", "ecContractType": "UpDown", "ecDirection": "UP",
        //         "ecTargetPrice": "", "ecLowerBound": "", "ecUpperBound": "", "extraFees": ""
        //     }
        //
        const symbol = this.safeString (trade, 'symbol');
        const outcomeObj = this.safeOutcome (undefined, market);
        const id = this.safeString (trade, 'execId');
        const orderId = this.safeString (trade, 'orderId');
        const side = this.safeStringLower (trade, 'side');
        const execType = this.safeString (trade, 'execType');
        const takerOrMaker = (execType === 'Settle') ? undefined : 'taker';
        const price = this.safeString (trade, 'execPrice');
        const amount = this.safeString (trade, 'execValue');
        const timestamp = this.safeInteger (trade, 'transTime');
        const feeCost = this.safeString (trade, 'execFee');
        const feeCoin = this.safeString (trade, 'feeCoin');
        let fee: Fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'cost': this.parseNumber (feeCost), 'currency': feeCoin };
        }
        return this.safePredictionTrade ({
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'type': 'limit',
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.parseNumber (price),
            'amount': this.parseNumber (amount),
            'cost': this.parseNumber (amount),
            'fee': fee,
            'outcome': this.safeString (outcomeObj, 'outcome', symbol),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market', symbol),
            'info': trade,
        }, outcomeObj);
    }

    /**
     * @method
     * @name bybit#fetchMyTrades
     * @description fetches the maker's Event Contract trade (execution) history (past 2 years)
     * @see https://bybit-exchange.github.io/docs/v5/event/trade/execution
     * @param {string} [outcome] unified outcome handle or raw bybit symbol
     * @param {int} [since] start time in ms, default 7 days ago (passed as params.startTime)
     * @param {int} [limit] the maximum number of trades to fetch, default 50, max 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    override async fetchMyTrades (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionTrade[]> {
        if (outcome === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires an outcome argument (bybit requires a symbol for v5/event/trades)');
        }
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const request: Dict = { 'symbol': this.safeString (outcomeObj, 'market') };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.privateGetV5EventTrades (this.extend (request, params));
        const result = this.safeDict (response, 'result', {});
        const rawTrades = this.safeList (result, 'list', []);
        return this.parsePredictionTrades (rawTrades, outcomeObj, since, limit);
    }

    override parsePredictionPosition (position: Dict, market: Market = undefined): PredictionPosition {
        //
        //     {
        //         "symbol": "ETHUSDT-28AUG26-2450-2570-OUT", "baseCoin": "BTC", "settleCoin": "USDT",
        //         "side": "Buy", "ecContractType": "UpDown", "ecDirection": "UP",
        //         "avgPayoutRatio": "1.85", "positionValue": "100", "ecSettleTime": "1694515498753",
        //         "cumClosedPnl": "50.5", "createdTime": "1694402559843", "updatedTime": "1694515498753",
        //         "seq": 31413030
        //     }
        //
        const symbol = this.safeString (position, 'symbol');
        const outcomeObj = this.safeOutcome (symbol, market);
        const side = this.safeStringLower (position, 'side');
        const positionSide = (side === 'sell') ? 'short' : 'long';
        const timestamp = this.safeInteger (position, 'createdTime');
        return this.safePredictionPosition ({
            'id': undefined,
            'timestamp': timestamp,
            'contracts': this.safeNumber (position, 'positionValue'),
            'contractSize': 1,
            'side': positionSide,
            'notional': this.safeNumber (position, 'positionValue'),
            'unrealizedPnl': undefined,
            'realizedPnl': this.safeNumber (position, 'cumClosedPnl'),
            'collateral': undefined,
            'entryPrice': this.safeNumber (position, 'avgPayoutRatio'),
            'markPrice': undefined,
            'lastPrice': undefined,
            'percentage': undefined,
            'outcome': this.safeString (outcomeObj, 'outcome', symbol),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market', symbol),
            'info': position,
        });
    }

    /**
     * @method
     * @name bybit#fetchPositions
     * @description fetches the maker's real-time Event Contract positions
     * @see https://bybit-exchange.github.io/docs/v5/event/trade/position
     * @param {string[]} [outcomes] unified outcome handles or raw bybit symbols to filter by; when a single outcome is given, it scopes the request server-side
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.baseCoin] filter by base coin, e.g. BTC
     * @param {string} [params.settleCoin] filter by settle coin, e.g. USDT
     * @param {int} [params.limit] the maximum number of positions to fetch, default 20, max 50
     * @returns {object[]} a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    override async fetchPositions (outcomes: Strings = undefined, params = {}): Promise<PredictionPosition[]> {
        const request: Dict = {};
        const outcomesList: string[] = (outcomes !== undefined) ? outcomes : [];
        const outcomesLength = outcomesList.length;
        if (outcomesLength === 1) {
            await this.loadOutcome (outcomesList[0]);
            const outcomeObj = this.outcome (outcomesList[0]);
            request['symbol'] = this.safeString (outcomeObj, 'market');
        }
        let cursor: Str = undefined;
        const positions: PredictionPosition[] = [];
        while (true) {
            if (cursor !== undefined) {
                request['cursor'] = cursor;
            }
            const response = await this.privateGetV5EventPositions (this.extend (request, params));
            const result = this.safeDict (response, 'result', {});
            const rawPositions = this.safeList (result, 'list', []);
            const rawPositionsLength = rawPositions.length;
            for (let i = 0; i < rawPositionsLength; i++) {
                positions.push (this.parsePredictionPosition (rawPositions[i]));
            }
            cursor = this.safeString (result, 'nextPageCursor');
            if ((cursor === undefined) || (cursor === '')) {
                break;
            }
        }
        if (outcomesLength <= 1) {
            return positions;
        }
        const wanted: Dict = {};
        for (let i = 0; i < outcomesLength; i++) {
            await this.loadOutcome (outcomesList[i]);
            const outcomeObj = this.outcome (outcomesList[i]);
            const wantedMarket = this.safeString (outcomeObj, 'market');
            if (wantedMarket !== undefined) {
                wanted[wantedMarket] = true;
            }
        }
        const filtered: PredictionPosition[] = [];
        const positionsLength = positions.length;
        for (let i = 0; i < positionsLength; i++) {
            const position = positions[i];
            const positionMarket = this.safeString (position, 'market');
            if ((positionMarket !== undefined) && (positionMarket in wanted)) {
                filtered.push (position);
            }
        }
        return filtered;
    }

    parseSettlement (settlement: Dict, market: Market = undefined): PredictionSettlement {
        //
        //     {
        //         "transId": "tx-001", "symbol": "ETHUSDT-28AUG26-2450-2570-OUT", "symbolId": "100001",
        //         "baseCoin": "BTC", "settleCoin": "USDT", "side": "Buy", "ecContractType": "UpDown",
        //         "ecDirection": "UP", "settlePrice": "26500", "entryPrice": "26000.5",
        //         "grossPayoutRatio": "1.85", "ecDurationWindow": "300", "ecTargetPrice": "",
        //         "ecLowerBound": "", "ecUpperBound": "", "transTime": "1694515498753",
        //         "crossSeq": "31413030", "execFee": "0.5", "execFeeRate": "0.01", "payout": "92.5",
        //         "sessionRpl": "42.5", "orderId": "1234567890"
        //     }
        //
        const symbol = this.safeString (settlement, 'symbol');
        const outcomeObj = this.safeOutcome (symbol, market);
        const timestamp = this.safeInteger (settlement, 'transTime');
        const payout = this.safeNumber (settlement, 'payout');
        const rpl = this.safeNumber (settlement, 'sessionRpl');
        const won = (rpl !== undefined) ? (rpl > 0) : undefined;
        return {
            'info': settlement,
            'id': this.safeString (settlement, 'transId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'outcome': this.safeString (outcomeObj, 'outcome', symbol),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
            'market': this.safeString (outcomeObj, 'market', symbol),
            'event': undefined,
            'result': this.safeString (settlement, 'settlePrice'),
            'won': won,
            'amount': undefined,
            'price': this.safeNumber (settlement, 'grossPayoutRatio'),
            'cost': undefined,
            'payout': payout,
            'pnl': rpl,
        } as PredictionSettlement;
    }

    /**
     * @method
     * @name bybit#fetchSettlements
     * @description fetches the maker's Event Contract settlement records (past 2 years)
     * @see https://bybit-exchange.github.io/docs/v5/event/trade/settlement
     * @param {string} outcome unified outcome handle or raw bybit symbol — required by bybit
     * @param {int} [since] start time in ms, default 7 days ago (passed as params.startTime)
     * @param {int} [limit] the maximum number of settlements to fetch, default 50, max 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of prediction settlement structures
     */
    override async fetchSettlements (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionSettlement[]> {
        if (outcome === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchSettlements() requires an outcome argument (bybit requires a symbol for v5/event/settlements)');
        }
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const request: Dict = { 'symbol': this.safeString (outcomeObj, 'market') };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.privateGetV5EventSettlements (this.extend (request, params));
        const result = this.safeDict (response, 'result', {});
        const rawSettlements = this.safeList (result, 'list', []);
        const rawSettlementsLength = rawSettlements.length;
        const parsed: PredictionSettlement[] = [];
        for (let i = 0; i < rawSettlementsLength; i++) {
            parsed.push (this.parseSettlement (rawSettlements[i], outcomeObj));
        }
        return this.filterBySinceLimit (parsed, since, limit, 'timestamp') as PredictionSettlement[];
    }

    /**
     * @method
     * @name bybit#createOrder
     * @description submits a payout-ratio quote for a bybit Event Contract symbol; bybit's Event Contract API is maker-quote driven — there is no resting limit/market order, only a quote a maker offers into the book
     * @see https://bybit-exchange.github.io/docs/v5/event/trade/submit-quote
     * @param {string} outcome unified outcome handle or raw bybit symbol
     * @param {string} type not used by bybit event contracts; every quote is submitted the same way
     * @param {string} side not sent to bybit's quote endpoint; direction is implied by the quoted symbol
     * @param {float} amount the quote amount, in settle-currency terms
     * @param {float} price the gross payout ratio being quoted (required)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.orderLinkId] a user-defined order id; a uuid is generated if omitted
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async createOrder (outcome: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<PredictionOrder> {
        if (price === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument — the gross payout ratio being quoted');
        }
        await this.loadOutcome (outcome);
        const outcomeObj = this.outcome (outcome);
        const marketSymbol = this.safeString (outcomeObj, 'market');
        let clientOrderId = this.safeString2 (params, 'orderLinkId', 'clientOrderId');
        if (clientOrderId === undefined) {
            clientOrderId = this.uuid ();
        }
        params = this.omit (params, [ 'orderLinkId', 'clientOrderId' ]);
        const request: Dict = {
            'symbol': marketSymbol,
            'orderLinkId': clientOrderId,
            'grossPayoutRatio': this.numberToString (price),
            'amount': this.numberToString (amount),
        };
        const response = await this.privatePostV5EventQuotes (this.extend (request, params));
        const result = this.safeDict (response, 'result', {});
        return this.safePredictionOrder ({
            'id': this.safeString (result, 'orderId'),
            'clientOrderId': this.safeString (result, 'orderLinkId', clientOrderId),
            'timestamp': this.milliseconds (),
            'status': 'open',
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'filled': 0,
            'remaining': amount,
            'cost': 0,
            'trades': [],
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': marketSymbol,
            'info': result,
        }, outcomeObj);
    }

    /**
     * @method
     * @name bybit#cancelOrder
     * @description cancels a previously submitted Event Contract quote
     * @see https://bybit-exchange.github.io/docs/v5/event/trade/cancel-quote
     * @param {string} id the order id to cancel
     * @param {string} [outcome] unified outcome handle or raw bybit symbol (labelling hint only)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.orderLinkId] cancel by user-defined order id instead of/alongside id
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async cancelOrder (id: string, outcome: Str = undefined, params = {}): Promise<PredictionOrder> {
        let outcomeObj: Market = undefined;
        if (outcome !== undefined) {
            await this.loadOutcome (outcome);
            outcomeObj = this.outcome (outcome);
        }
        const request: Dict = {};
        if (id !== undefined) {
            request['orderId'] = id;
        }
        const orderLinkId = this.safeString (params, 'orderLinkId');
        if (orderLinkId !== undefined) {
            request['orderLinkId'] = orderLinkId;
        }
        params = this.omit (params, 'orderLinkId');
        const response = await this.privatePostV5EventCancel (this.extend (request, params));
        const result = this.safeDict (response, 'result', {});
        return this.safePredictionOrder ({
            'id': this.safeString (result, 'orderId', id),
            'clientOrderId': this.safeString (result, 'orderLinkId', orderLinkId),
            'timestamp': this.milliseconds (),
            'status': 'canceled',
            'trades': [],
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market'),
            'info': result,
        }, outcomeObj);
    }

    override sign (path: any, api: any = 'public', method = 'GET', params = {}, headers: NullableDict = undefined, body: any = undefined) {
        let url = this.implodeHostname (this.urls['api'][api]) + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length > 0) {
                url += '?' + this.rawencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const timestamp = this.nonce ().toString ();
            const recvWindow = this.safeString (this.options, 'recvWindow', '5000');
            headers = {
                'Content-Type': 'application/json',
                'X-BAPI-API-KEY': this.apiKey,
                'X-BAPI-TIMESTAMP': timestamp,
                'X-BAPI-RECV-WINDOW': recvWindow,
            };
            const query = this.extend ({}, params);
            const queryEncoded = this.rawencode (query);
            const authBase = timestamp + this.apiKey + recvWindow;
            let authFull: Str = undefined;
            if (method === 'POST') {
                body = this.json (query);
                authFull = authBase + body;
            } else {
                authFull = authBase + queryEncoded;
                if (queryEncoded.length > 0) {
                    url += '?' + queryEncoded;
                }
            }
            const signature = this.hmac (this.encode (authFull), this.encode (this.secret), sha256);
            headers['X-BAPI-SIGN'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    override handleErrors (httpCode: any, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined;
        }
        //
        //     { "retCode": 10001, "retMsg": "symbol params err", "result": {}, "retExtInfo": {}, "time": 1694402560000 }
        //
        const errorCode = this.safeString (response, 'retCode');
        if ((errorCode !== undefined) && (errorCode !== '0')) {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
