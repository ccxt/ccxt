
// ---------------------------------------------------------------------------

import { sha256 } from '@noble/hashes/sha2.js';
import { keccak_256 as keccak } from '@noble/hashes/sha3.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import Exchange from '../abstract/prediction/calibri.js';
import { ecdsa } from '../base/functions/crypto.js';
import { ROUND, DECIMAL_PLACES } from '../base/functions/number.js';
import { Precise } from '../base/Precise.js';
import { ArrayCacheByOutcomeById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type Client from '../base/ws/Client.js';
import type { OrderSide, OrderType, Int, int, Str, Num, Dict, Bool, Market, OHLCV, Balances, Strings, Endpoint, List, NullableDict,
    Account, Currencies, Currency, Transaction, LedgerEntry, PredictionSettlement,
    PredictionTickers, PredictionOrderBook, PredictionOrderRequest, PredictionOpenInterest, PredictionTradingFee,
    PredictionEvent, PredictionTicker, PredictionOrder, PredictionTrade, PredictionPosition, fetchEventsParams } from '../base/types.js';
import { ArgumentsRequired, BadRequest, BadResponse, AuthenticationError, BadSymbol, InvalidOrder, InsufficientFunds, PermissionDenied, OrderNotFound, ExchangeError, InvalidNonce, DuplicateOrderId, AccountNotEnabled, AccountSuspended, RateLimitExceeded, NotSupported, OrderNotFillable, ExchangeNotAvailable, OnMaintenance, OperationFailed, MarketClosed } from '../base/errors.js';

// ---------------------------------------------------------------------------

/**
 * @class calibri
 * @augments Exchange
 */
export default class calibri extends Exchange {
    override describe (): Dict {
        return this.deepExtend (super.describe (), {
            'id': 'calibri',
            'name': 'Calibri',
            'countries': [ 'ZA' ],
            'rateLimit': 100,
            'certified': false,
            'pro': true,
            'streaming': {
                'ping': this.ping,
                'keepAlive': 30000,
            },
            'version': 'v2',
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'approve': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createMarketBuyOrderWithCost': true,
                'createOrder': true,
                'createOrders': true,
                'editOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposits': true,
                'fetchEvent': true,
                'fetchEvents': true,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrdersByIds': true,
                'fetchOrderTrades': true,
                'fetchOutcome': true,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchSettlements': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchWithdrawals': true,
                'prediction': true,
                'redeem': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchPositions': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1440',
                '3d': '4320',
                '1w': '10080',
            },
            'urls': {
                'logo': 'https://calibri.io/favicon.svg',
                'api': {
                    'rest': 'https://calibri.io',
                    'ws': 'wss://calibri.io/api/v2/websocket',
                },
                'www': 'https://calibri.io',
                'doc': [ 'https://docs.calibri.io' ],
                'fees': 'https://docs.calibri.io/concepts/fees',
            },
            'api': {
                'platform': {
                    'public': {
                        'get': {
                            'status': { 'cost': 1 } as Endpoint<Dict>,
                        },
                    },
                },
                'pythia': {
                    'public': {
                        'get': {
                            'public/events': { 'cost': 1 } as Endpoint<List>,
                            'public/events/{slug}': { 'cost': 1 } as Endpoint<Dict>,
                            'public/markets': { 'cost': 1 } as Endpoint<List>,
                            'public/markets/{market}': { 'cost': 1 } as Endpoint<Dict>,
                            'public/markets/{market}/ticker': { 'cost': 1 } as Endpoint<Dict>,
                            'public/markets/{market}/order-book': { 'cost': 1 } as Endpoint<Dict>,
                            'public/markets/{market}/depth': { 'cost': 1 } as Endpoint<Dict>,
                            'public/markets/{market}/k-line': { 'cost': 1 } as Endpoint<List>,
                            'public/markets/{market}/contracts/recent': { 'cost': 1 } as Endpoint<List>,
                            'public/tickers': { 'cost': 1 } as Endpoint<Dict>,
                            'public/categories': { 'cost': 1 } as Endpoint<List>,
                            'public/tags': { 'cost': 1 } as Endpoint<List>,
                            'public/series': { 'cost': 1 } as Endpoint<List>,
                        },
                    },
                    'private': {
                        'get': {
                            'orders': { 'cost': 1 } as Endpoint<List>,
                            'orders/{id}': { 'cost': 1 } as Endpoint<Dict>,
                        },
                        'post': {
                            'orders/{id}/cancel': { 'cost': 1 } as Endpoint<Dict>,
                            'orders/cancel': { 'cost': 1 } as Endpoint<Dict>,
                            'orders/cancel/batch': { 'cost': 1 } as Endpoint<Dict>,
                        },
                    },
                },
                'atlas': {
                    'public': {
                        'get': {
                            'public/timestamp': { 'cost': 1 } as Endpoint<Dict>,
                            'public/health/alive': { 'cost': 1 } as Endpoint<string>,
                            'public/currencies': { 'cost': 1 } as Endpoint<List>,
                        },
                    },
                    'private': {
                        'get': {
                            'account/wallet': { 'cost': 1 } as Endpoint<Dict>,
                            'account/wallet/markets/{id}': { 'cost': 1 } as Endpoint<Dict>,
                            'account/balances': { 'cost': 1 } as Endpoint<List>,
                            'account/positions': { 'cost': 1 } as Endpoint<List>,
                            'account/contracts': { 'cost': 1 } as Endpoint<List>,
                            'account/contracts/{id}': { 'cost': 1 } as Endpoint<Dict>,
                            'account/deposits': { 'cost': 1 } as Endpoint<List>,
                            'account/withdraws': { 'cost': 1 } as Endpoint<List>,
                            'account/transactions': { 'cost': 1 } as Endpoint<List>,
                            'account/settled': { 'cost': 1 } as Endpoint<List>,
                            'account/wallet/redeemable': { 'cost': 1 } as Endpoint<Dict>,
                            'account/wallet/nonce': { 'cost': 1 } as Endpoint<Dict>,
                        },
                        'post': {
                            'account/orders': { 'cost': 1 } as Endpoint<Dict>,
                            'account/orders/batch': { 'cost': 1 } as Endpoint<List>,
                            'account/orders/{id}/replace': { 'cost': 1 } as Endpoint<Dict>,
                            'account/wallet/relay': { 'cost': 1 } as Endpoint<Dict>,
                        },
                    },
                },
            },
            'exceptions': {
                // calibri returns { "errors": [ "<dot.code or sentence>", ... ] }
                'exact': {
                    'authz.nonce_expired': InvalidNonce,
                    'authz.nonce_reused': InvalidNonce,
                    'authz.invalid_permission_scope': PermissionDenied,
                    'authz.invalid_permission': PermissionDenied,
                    'authz.permission_denied': PermissionDenied,
                    'authz.service_unavailable': ExchangeNotAvailable,
                    'auth.required': AuthenticationError,
                    'market.order.invalid_price_precision': InvalidOrder,
                    'market.order.invalid_volume_precision': InvalidOrder,
                    'market.order.invalid_price': InvalidOrder,
                    'market.order.price_too_high': InvalidOrder,
                    'market.order.price_too_low': InvalidOrder,
                    'market.order.invalid_volume': InvalidOrder,
                    'market.order.invalid_side': InvalidOrder,
                    'market.order.invalid_direction': InvalidOrder,
                    'market.order.missing_market': InvalidOrder,
                    'market.order.missing_volume': InvalidOrder,
                    'market.order.missing_price': InvalidOrder,
                    'market.order.invalid_ord_type': InvalidOrder,
                    'market.order.amount_too_small': InvalidOrder,
                    'market.order.amount_too_large': InvalidOrder,
                    'market.order.expired': InvalidOrder,
                    'market.order.ioc_requires_limit': InvalidOrder,
                    'market.order.post_only_requires_limit': InvalidOrder,
                    'market.order.invalid_client_order_id': InvalidOrder,
                    'market.order.invalid_id': InvalidOrder,
                    'market.order.missing_max_spend': InvalidOrder,
                    'market.order.invalid_max_spend': InvalidOrder,
                    // the event or market is hidden for review; new orders are paused until it is cleared
                    'market.order.under_review': MarketClosed,
                    'market.order.custodial_disabled': PermissionDenied,
                    'market.order.post_only_would_match': OrderNotFillable,
                    'market.order.insufficient_market_liquidity': OrderNotFillable,
                    'market.order.insufficient_balance': InsufficientFunds,
                    // the engine refused the order: most often collateral (stake plus the taker-fee reserve) or a sell above sellable_volume
                    'market.order.create_failed': InsufficientFunds,
                    // a sell of shares still settling on-chain; it succeeds once the match confirms
                    'market.order.tokens_settling': OperationFailed,
                    'market.order.account_not_active': AccountNotEnabled,
                    'market.order.member_frozen': AccountSuspended,
                    'market.order.kyc_required': PermissionDenied,
                    'market.order.cannot_cancel': OrderNotFound,
                    // cancel refused: the order is already terminal or fully matched
                    'market.order.invalid_state': OrderNotFound,
                    'market.order.not_found': OrderNotFound,
                    'market.order.rate_limited': RateLimitExceeded,
                    'market.market.doesnt_exist': BadSymbol,
                    'market.market.disabled': MarketClosed,
                    'market.engine.not_found': BadSymbol,
                    'market.engine.busy': ExchangeNotAvailable,
                    'public.market.doesnt_exist': BadSymbol,
                    'prediction.event.not_found': BadSymbol,
                    'public.k_line.invalid_period': BadRequest,
                    'public.k_line.non_integer_period': BadRequest,
                    'order.duplicate_client_order_id': DuplicateOrderId,
                    'order.not_open': OrderNotFound,
                    'order.not_found': OrderNotFound,
                    'engine.order.not_found': OrderNotFound,
                    'order.replace_market_mismatch': InvalidOrder,
                    // retryable: the Safe's current state or a new trading key is not final yet
                    'wallet.state_pending': OperationFailed,
                    'session.pending': OperationFailed,
                    'wallet.deploying': OperationFailed,
                    'wallet.deposit_required': AccountNotEnabled,
                    // the relayed SafeTx signature does not sign the nonce sent
                    'relay.nonce_mismatch': BadRequest,
                    // retryable: read account/wallet/nonce and sign again (another relay holds the nonce, or it is spent)
                    'relay.nonce_in_use': InvalidNonce,
                    'relay.nonce_spent': InvalidNonce,
                    'wallet.not_registered': AccountNotEnabled,
                    // a USDC burn to another network is relayed only with its quote_id; DELEGATECALL only to MultiSend
                    'bridge_quote_required': BadRequest,
                    'delegatecall_not_allowed': BadRequest,
                    'Market CTF token ids are not configured': BadSymbol,
                    'Member is not a self-custodial wallet member': AccountNotEnabled,
                    'safe is not registered to this member': AccountNotEnabled,
                    // retryable: the check could not be completed, nothing was placed
                    'Unable to verify member safe readiness': OperationFailed,
                    'Unable to verify signed_order signature': OperationFailed,
                    // signature type 3: the signature is not one the Safe accepts (e.g. the order hash signed instead of the SafeMessage)
                    'Invalid signed_order signature': AuthenticationError,
                    'Non-custodial orders must be limit orders': InvalidOrder,
                    'server.error': ExchangeNotAvailable,
                    'Internal server error': ExchangeNotAvailable,
                    'maintenance': OnMaintenance,
                },
                'broad': {
                    'Member safe is not settlement-ready': AccountNotEnabled,
                    'This wallet is not registered to your account yet': AccountNotEnabled,
                    'This wallet is not set up for trading': AccountNotEnabled,
                    'Quick trading is not set up on this wallet': AccountNotEnabled,
                    'This wallet needs more than one signature': NotSupported,
                    'Market is not CTF-registered': BadSymbol,
                    'is not a Safe registered to this member': AuthenticationError,
                    'maker must be the member safe wallet': AuthenticationError,
                    'signature does not match the signer': AuthenticationError,
                    'trading key has expired or been revoked': AuthenticationError,
                    'no longer signs for this wallet': AuthenticationError,
                    'no longer able to sign for this wallet': AuthenticationError,
                    'is a passkey wallet': AuthenticationError,
                    'signed_order': InvalidOrder,
                    // "Invalid order price|side|volume|direction"
                    'Invalid order ': InvalidOrder,
                    'authz.': AuthenticationError,
                    'too_many_requests': RateLimitExceeded,
                    // "Rate limit exceeded. Try again in N seconds"
                    'Rate limit exceeded': RateLimitExceeded,
                    'Too many requests': RateLimitExceeded,
                },
            },
            'requiredCredentials': {
                // privateKey signs orders only: the Safe owner EOA (signature type 2) or an added owner key (type 3)
                'apiKey': true,
                'secret': true,
                'privateKey': false,
                'walletAddress': false,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0'),
                    'taker': this.parseNumber ('0'),
                },
            },
            'options': {
                'eventScopeParams': [ 'category', 'series', 'subcategory', 'frequency' ],
                // /public/events caps a page at 100 events
                'eventsPageSize': 100,
                'maxEventPages': 10,
                // list each window of a rolling series as its own event; the windows count toward fetchMarketsLimit
                'expandSeries': true,
                'fetchMarketsLimit': 200,
                'adjustForTimeDifference': false,
                'timeDifference': 0,
                // signature lifetime in seconds for resting orders and for IOC orders
                'orderExpiration': 2592000,
                'marketOrderExpiration': 120,
                'fetchPositions': {
                    'markPrice': false,
                },
                // cached account/wallet config; set it to skip the request
                'wallet': undefined,
                // a taker rate for a market whose event and category set none (the engine's default, 7%)
                'defaultTakerFeeRateBps': '700',
                // Polygon mainnet contracts, see https://docs.calibri.io/smart-contracts/deployed-addresses; orders and Safe transactions are signed only for these
                'networks': {
                    'MATIC': 'polygon',
                    'ETH': 'ethereum',
                },
                'chainId': 137,
                'ctfExchangeName': 'Calibri CTF Prediction Markets',
                'ctfExchangeVersion': '1',
                'exchangeAddress': '0xA06be29A9077DA70c70601156aac9F2cE0E3b595',
                'conditionalTokensAddress': '0x53aB2e11ea7a7e90a11F002FAa859124729611F4',
                'usdcAddress': '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
                // CalibriMatcher settles each match and takes the taker fee in the same transaction; setup grants it an unlimited USDC allowance
                'matcherAddress': '0x974533370a52DDfBeBAFf98e6C12f232485A0293',
                // setup sets the operator's USDC allowance to zero
                'operatorAddress': '0xf3CD4c4B456d1bCaaDB7782c3F552731F33264eE',
            },
        });
    }

    /**
     * @method
     * @name calibri#fetchTime
     * @description fetches the current server time, which the HMAC nonce must be within 10 seconds of
     * @see https://docs.calibri.io/api-reference/authentication
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current server time in milliseconds
     */
    override async fetchTime (params: Dict = {}): Promise<Int> {
        const response = await this.atlasPublicGetPublicTimestamp (params);
        //
        //     { "timestamp": 1792362902 }
        //
        return this.safeTimestamp (response, 'timestamp');
    }

    /**
     * @method
     * @name calibri#fetchStatus
     * @description the platform status: ok, maintenance (with an eta when one was announced) or error
     * @see https://docs.calibri.io/api-reference/status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)
     */
    override async fetchStatus (params: Dict = {}): Promise<any> {
        const response = await this.platformPublicGetStatus (params);
        //
        //     {
        //         "status": "maintenance",
        //         "eta": "2026-10-20T14:00:00Z",
        //         "message": "Upgrading the matching engine.",
        //         "updated_at": "2026-10-19T11:22:23Z"
        //     }
        //
        return {
            'status': this.safeString (response, 'status'),
            'updated': this.parse8601 (this.safeString (response, 'updated_at')),
            'eta': this.parse8601 (this.safeString (response, 'eta')),
            'url': undefined,
            'info': response,
        };
    }

    /**
     * @method
     * @name calibri#fetchMarkets
     * @description retrieves the markets of the listed events; each calibri market is binary, with a YES and a NO outcome under the outcomes key
     * @see https://docs.calibri.io/api-reference/endpoints/events/list-events
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.status] event status filter passed to the listing, e.g. 'active', 'closed', 'resolved'
     * @param {string} [params.category] filter by category
     * @param {int} [params.limit] max number of events to list, defaults to options.fetchMarketsLimit (200)
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        if (this.safeBool (this.options, 'adjustForTimeDifference', false)) {
            await this.loadTimeDifference ();
        }
        const maxEvents = this.safeInteger (params, 'limit', this.safeInteger (this.options, 'fetchMarketsLimit', 200));
        const request = this.omit (params, [ 'limit' ]);
        const rawEvents = await this.fetchRawEventsPaged (request, maxEvents, undefined);
        const events = this.parseEvents (rawEvents);
        this.setEvents (events);
        const result: Market[] = [];
        for (let i = 0; i < events.length; i++) {
            const markets = this.safeList (events[i], 'markets', []);
            for (let j = 0; j < markets.length; j++) {
                result.push (markets[j] as Market);
            }
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name calibri#fetchRawEventsPaged
     * @description pages through /public/events until maxEvents matching events are collected, a short page arrives or a page adds no new event
     * @param {object} request the listing filters (status, category, tag, q, ...)
     * @param {int} [maxEvents] stop once this many matching events are collected
     * @param {string[]} [queries] when given, keep only events whose text contains every word of one of the queries
     * @returns {object[]} raw calibri event objects
     */
    async fetchRawEventsPaged (request: Dict, maxEvents: Int = undefined, queries: Strings = undefined): Promise<any[]> {
        const pageSize = this.safeInteger (this.options, 'eventsPageSize', 100);
        const maxPages = this.safeInteger (this.options, 'maxEventPages', 10);
        const seen: Dict = {};
        const result: any[] = [];
        let listRequest = request;
        if (this.safeBool (this.options, 'expandSeries', true)) {
            listRequest = this.extend ({ 'expand_series': 'true' }, request);
        }
        for (let page = 1; page <= maxPages; page++) {
            const pageRequest = this.extend (listRequest, { 'page': page, 'limit': pageSize });
            const response = await this.pythiaPublicGetPublicEvents (pageRequest);
            //
            //     [
            //         {
            //             "id": 6351,
            //             "slug": "gtm-sarb-repo-nov-2026",
            //             "title": "SARB repo rate decision — November 2026",
            //             "status": "active",
            //             "effective_taker_fee_rate_bps": 500,
            //             "markets": [ { "id": 993714, "title": "Cut", "yes_token_id": "...", ... } ],
            //             ...
            //         }
            //     ]
            //
            let rows: any[] = [];
            if (Array.isArray (response)) {
                rows = response;
            }
            const rowsLength = rows.length;
            let added = 0;
            for (let i = 0; i < rowsLength; i++) {
                const row = rows[i];
                const eventId = this.safeString (row, 'id');
                if ((eventId === undefined) || (eventId in seen)) {
                    continue;
                }
                seen[eventId] = true;
                added = added + 1;
                if ((queries === undefined) || this.rawEventMatchesQueries (row, queries)) {
                    result.push (row);
                }
            }
            if ((added === 0) || (rowsLength < pageSize)) {
                break;
            }
            const resultLength = result.length;
            if ((maxEvents !== undefined) && (resultLength >= maxEvents)) {
                break;
            }
        }
        const collected = result.length;
        if ((maxEvents !== undefined) && (collected > maxEvents)) {
            return this.arraySlice (result, 0, maxEvents);
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name calibri#rawEventMatchesQueries
     * @description whether a raw event's title, description, slug or market titles contain every word of at least one query (case-insensitive)
     * @param {object} rawEvent a raw calibri event
     * @param {string[]} queries the search queries
     * @returns {boolean} true when the event matches
     */
    rawEventMatchesQueries (rawEvent: Dict, queries: string[]): boolean {
        let text = this.safeStringLower (rawEvent, 'title', '') + ' ' + this.safeStringLower (rawEvent, 'description', '') + ' ' + this.safeStringLower (rawEvent, 'slug', '');
        const markets = this.safeList (rawEvent, 'markets', []);
        for (let i = 0; i < markets.length; i++) {
            text = text + ' ' + this.safeStringLower (markets[i], 'title', '');
        }
        for (let qi = 0; qi < queries.length; qi++) {
            const query = queries[qi].toLowerCase ();
            const words = query.split (' ');
            let matchedAll = true;
            let wordCount = 0;
            for (let wi = 0; wi < words.length; wi++) {
                const word = words[wi];
                if (word === '') {
                    continue;
                }
                wordCount = wordCount + 1;
                if (text.indexOf (word) < 0) {
                    matchedAll = false;
                    break;
                }
            }
            if (matchedAll && (wordCount > 0)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @ignore
     * @method
     * @name calibri#tagToSlug
     * @description converts a tag label into slug form, "Fed Rates" -> "fed-rates"
     * @param {string} tag the tag label or slug
     * @returns {string} the tag slug
     */
    tagToSlug (tag: string): string {
        const lower = tag.toLowerCase ();
        const allowed = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const chars = this.stringToCharsArray (lower);
        let slug = '';
        let pendingSep = false;
        for (let i = 0; i < chars.length; i++) {
            const ch = chars[i];
            if (allowed.indexOf (ch) >= 0) {
                if (pendingSep && (slug !== '')) {
                    slug = slug + '-';
                }
                slug = slug + ch;
                pendingSep = false;
            } else {
                pendingSep = true;
            }
        }
        if (slug === '') {
            return lower;
        }
        return slug;
    }

    /**
     * @method
     * @name calibri#fetchEvents
     * @description fetches events matching a query, tags, an event id or slug, or a category filter
     * @see https://docs.calibri.io/api-reference/endpoints/events/list-events
     * @param {object} [params] extra exchange-specific parameters
     * @param {string} [params.query] a search term, sent as the server-side `q` and re-checked client-side (title, description, slug and market titles must contain every word)
     * @param {string[]} [params.queries] several search terms, an event matching any one of them is kept
     * @param {string[]} [params.tags] tag labels or slugs, one listing per tag, unioned
     * @param {string} [params.eventId] the numeric event id
     * @param {string} [params.slug] the event slug
     * @param {string} [params.category] filter by category
     * @param {string} [params.series] a series slug, to list only that series' windows
     * @param {string} [params.subcategory] a sub-category slug, e.g. 'tennis'
     * @param {string} [params.frequency] a series cadence, e.g. 'daily', 'weekly' or 'monthly'
     * @param {int} [params.limit] max number of events to return
     * @param {string} [params.status] 'active', 'inactive', 'closed', 'resolved' or 'all'
     * @param {string} [params.sort] 'volume', 'liquidity' or 'newest'
     * @param {string} [params.searchIn] additionally restrict the query match to 'title', 'description' or 'both'
     * @returns {object[]} an array of event structures
     */
    override async fetchEvents (params: fetchEventsParams = {}): Promise<PredictionEvent[]> {
        this.requireEventQuery (params);
        const slug = this.safeString (params, 'slug');
        const eventId = this.safeString (params, 'eventId');
        const limit = this.safeInteger (params, 'limit');
        const queries = this.parseSearchQueries (params);
        const queriesLength = queries.length;
        let rawEvents: any[] = [];
        if ((slug !== undefined) || (eventId !== undefined)) {
            let key = slug;
            if (key === undefined) {
                key = eventId;
            }
            const response = await this.pythiaPublicGetPublicEventsSlug ({ 'slug': key });
            rawEvents = [ response ];
        } else {
            const request: Dict = this.omit (params, [ 'query', 'queries', 'tags', 'eventId', 'slug', 'limit', 'status', 'sort', 'searchIn' ]);
            const status = this.safeString (params, 'status');
            if (status !== undefined) {
                // a missing status is the server's "active"; "all" has to be sent to mean all
                if ((status === 'closed') || (status === 'inactive')) {
                    request['status'] = 'closed';
                } else {
                    request['status'] = status;
                }
            }
            const sort = this.safeString (params, 'sort');
            if (sort === 'newest') {
                request['sort'] = 'newest';
            }
            const maxEvents = limit;
            let matchQueries: Strings = undefined;
            if (queriesLength > 0) {
                matchQueries = queries;
            }
            const tags = this.safeList (params, 'tags', []);
            const tagsLength = tags.length;
            const seen: Dict = {};
            if (tagsLength > 0) {
                for (let ti = 0; ti < tagsLength; ti++) {
                    const tagRequest = this.extend (request, { 'tag': this.tagToSlug (this.safeString (tags, ti) as string) });
                    const tagEvents = await this.fetchEventsForQueries (tagRequest, maxEvents, matchQueries);
                    for (let ei = 0; ei < tagEvents.length; ei++) {
                        const tagEventId = this.safeString (tagEvents[ei], 'id');
                        if ((tagEventId !== undefined) && !(tagEventId in seen)) {
                            seen[tagEventId] = true;
                            rawEvents.push (tagEvents[ei]);
                        }
                    }
                }
            } else {
                rawEvents = await this.fetchEventsForQueries (request, maxEvents, matchQueries);
            }
        }
        const events = this.parseEvents (rawEvents);
        this.registerEventMarkets (events);
        // applyEventFetchParams re-applies eventId / slug / searchIn / sort / limit
        const effectiveParams = this.omit (params, [ 'tags', 'status', 'query', 'queries' ]);
        let searchQueries: Strings = undefined;
        if (this.safeString (params, 'searchIn') !== undefined) {
            searchQueries = queries;
        }
        return this.applyEventFetchParams (events, effectiveParams, searchQueries) as PredictionEvent[];
    }

    /**
     * @ignore
     * @method
     * @name calibri#fetchEventsForQueries
     * @description runs one paged listing per query (sent as `q`) and unions the matches, or a single listing when no query is given
     * @param {object} request the listing filters
     * @param {int} [maxEvents] max matching events per listing
     * @param {string[]} [queries] the search queries
     * @returns {object[]} raw calibri event objects
     */
    async fetchEventsForQueries (request: Dict, maxEvents: Int = undefined, queries: Strings = undefined): Promise<any[]> {
        if (queries === undefined) {
            return await this.fetchRawEventsPaged (request, maxEvents, undefined);
        }
        const result: any[] = [];
        const seen: Dict = {};
        for (let qi = 0; qi < queries.length; qi++) {
            const query = queries[qi];
            const queryRequest = this.extend (request, { 'q': query });
            const rows = await this.fetchRawEventsPaged (queryRequest, maxEvents, [ query ]);
            for (let i = 0; i < rows.length; i++) {
                const rowId = this.safeString (rows[i], 'id');
                if ((rowId !== undefined) && !(rowId in seen)) {
                    seen[rowId] = true;
                    result.push (rows[i]);
                }
            }
        }
        return result;
    }

    /**
     * @method
     * @name calibri#fetchEvent
     * @description fetches a single event by its slug or numeric id
     * @see https://docs.calibri.io/api-reference/endpoints/events/event-by-slug
     * @param {string} id the event slug or numeric event id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    override async fetchEvent (id: string, params: Dict = {}): Promise<PredictionEvent> {
        const response = await this.pythiaPublicGetPublicEventsSlug (this.extend ({ 'slug': id }, params));
        const event = this.parseEvent (response);
        this.indexEventOutcomes (event);
        this.setEvents ([ event ]);
        return event as PredictionEvent;
    }

    /**
     * @ignore
     * @method
     * @name calibri#isNumericString
     * @description whether a string is made of decimal digits only
     * @param {string} value the string to test
     * @returns {boolean} true for a non-empty all-digit string
     */
    isNumericString (value: Str): boolean {
        if ((value === undefined) || (value === '')) {
            return false;
        }
        const digits = '0123456789';
        const chars = this.stringToCharsArray (value);
        for (let i = 0; i < chars.length; i++) {
            if (digits.indexOf (chars[i]) < 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * @ignore
     * @method
     * @name calibri#registerEventMarkets
     * @description stores the markets of parsed events in this.markets and rebuilds the outcome cache
     * @param {object[]} events parsed events
     */
    registerEventMarkets (events: any[]) {
        if (this.markets === undefined) {
            this.markets = this.createSafeDictionary ();
        }
        for (let i = 0; i < events.length; i++) {
            const markets = this.safeList (events[i], 'markets', []);
            for (let j = 0; j < markets.length; j++) {
                const market = markets[j];
                const handle = this.safeString (market, 'market');
                if (handle !== undefined) {
                    this.markets[handle] = market;
                }
            }
        }
        this.populateOutcomes ();
    }

    /**
     * @ignore
     * @method
     * @name calibri#parseEvents
     * @description parses a list of raw calibri events
     * @param {object[]} rawEvents raw calibri events
     * @returns {object[]} a list of event structures
     */
    parseEvents (rawEvents: any[]): any[] {
        const result: any[] = [];
        for (let i = 0; i < rawEvents.length; i++) {
            result.push (this.parseEvent (rawEvents[i]));
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name calibri#parseEvent
     * @description parses a raw calibri event with its nested markets
     * @param {object} rawEvent a raw calibri event
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    parseEvent (rawEvent: Dict): Dict {
        //
        //     {
        //         "id": 6351,
        //         "slug": "gtm-sarb-repo-nov-2026",
        //         "title": "SARB repo rate decision — November 2026",
        //         "description": "...",
        //         "category": "Economics",
        //         "image_url": null,
        //         "outcome_structure": "one_winner",
        //         "status": "active",
        //         "tags": [],
        //         "created_at": "2026-09-10T20:57:18Z",
        //         "effective_taker_fee_rate_bps": 500,
        //         "markets": [ ... ],
        //         "total_volume": "83.49",
        //         "end_at": "2026-11-19T13:00:00Z"
        //     }
        //
        const slug = this.safeString (rawEvent, 'slug');
        const eventHandle = this.shortenSlug (slug);
        const rawMarkets = this.safeList (rawEvent, 'markets', []);
        const markets: Dict[] = [];
        for (let i = 0; i < rawMarkets.length; i++) {
            markets.push (this.parseCalibriMarket (rawMarkets[i], rawEvent));
        }
        const rawTags = this.safeList (rawEvent, 'tags', []);
        const tags: string[] = [];
        for (let i = 0; i < rawTags.length; i++) {
            const rawTag = rawTags[i];
            let tagLabel: Str = undefined;
            if (typeof rawTag === 'string') {
                tagLabel = rawTag;
            } else {
                tagLabel = this.safeStringN (rawTag, [ 'label', 'name', 'title', 'slug' ]);
            }
            if (tagLabel !== undefined) {
                tags.push (tagLabel);
            }
        }
        const status = this.safeString (rawEvent, 'status');
        const createdAt = this.safeString (rawEvent, 'created_at');
        const endAt = this.safeString (rawEvent, 'end_at');
        const outcomeStructure = this.safeString (rawEvent, 'outcome_structure');
        let url: Str = undefined;
        if (slug !== undefined) {
            url = this.urls['www'] + '/event/' + slug;
        }
        return {
            'info': rawEvent,
            'id': this.safeString (rawEvent, 'id'),
            'event': eventHandle,
            'title': this.safeString (rawEvent, 'title'),
            'description': this.safeString (rawEvent, 'description'),
            'slug': slug,
            'category': this.safeString (rawEvent, 'category'),
            'tags': tags,
            'markets': markets,
            'mutuallyExclusive': (outcomeStructure === 'one_winner'),
            'active': (status === 'active'),
            'resolved': this.isResolvedStatus (status),
            'volume': this.safeNumber2 (rawEvent, 'total_volume', 'volume'),
            'liquidity': undefined,
            'created': this.parse8601 (createdAt),
            'createdDatetime': createdAt,
            'end': this.parse8601 (endAt),
            'endDatetime': endAt,
            'image': this.safeString (rawEvent, 'image_url'),
            'url': url,
        };
    }

    /**
     * @ignore
     * @method
     * @name calibri#isResolvedStatus
     * @description whether a calibri event or market status means the outcome has been determined
     * @param {string} status the raw status
     * @returns {boolean} true for resolved, determined, settling and settled
     */
    isResolvedStatus (status: Str): boolean {
        const resolved = (status === 'resolved') || (status === 'determined') || (status === 'settling') || (status === 'settled');
        return resolved;
    }

    /**
     * @ignore
     * @method
     * @name calibri#parseCalibriMarket
     * @description parses a raw calibri market (nested in an event, or from /public/markets/{id}) into a prediction market row with its YES and NO outcomes
     * @param {object} rawMarket the raw calibri market
     * @param {object} [rawEvent] the raw parent event, for the slug and the taker fee rate
     * @returns {object} a prediction market row
     */
    parseCalibriMarket (rawMarket: Dict, rawEvent: Dict = {}): Dict {
        //
        //     {
        //         "id": 993714,
        //         "event_id": 6351,
        //         "title": "Cut",
        //         "status": "active",
        //         "result": null,
        //         "open_at": "2026-09-10T20:56:17Z",
        //         "close_at": "2026-11-19T13:00:00Z",
        //         "market_id": 993714,
        //         "outcome_labels": [ "Yes", "No" ],
        //         "yes_token_id": "3385435844907299310780239151922435978643932736241333450519890188243976082871",
        //         "no_token_id": "56117804364142373074919148400268198406202348078678452246765344789609008084552",
        //         "event_slug": "gtm-sarb-repo-nov-2026",
        //         "yes_price": "0.32",
        //         "no_price": "0.68",
        //         "volume": "39.85",
        //         "price_precision": 2,
        //         "amount_precision": 2,
        //         "min_amount": "1",
        //         "min_price": "0.01",
        //         "max_price": "0.99"
        //     }
        //
        const marketId = this.safeString (rawMarket, 'id');
        const eventSlug = this.safeString2 (rawMarket, 'event_slug', 'slug', this.safeString (rawEvent, 'slug'));
        const title = this.safeString (rawMarket, 'title');
        const marketHandle = this.slugToMarketSymbol (eventSlug, title);
        const eventHandle = this.shortenSlug (eventSlug);
        const status = this.safeString (rawMarket, 'status');
        const active = (status === 'active');
        const resolved = this.isResolvedStatus (status);
        const result = this.safeStringLower (rawMarket, 'result');
        const pricePrecision = this.parseNumber (this.parsePrecision (this.safeString (rawMarket, 'price_precision', '2')));
        const amountPrecision = this.parseNumber (this.parsePrecision (this.safeString (rawMarket, 'amount_precision', '2')));
        const minAmount = this.safeNumber (rawMarket, 'min_amount', 1);
        const minPrice = this.safeNumber (rawMarket, 'min_price', 0.01);
        const maxPrice = this.safeNumber (rawMarket, 'max_price', 0.99);
        let feeRateBps = this.safeString (rawMarket, 'effective_taker_fee_rate_bps');
        if (feeRateBps === undefined) {
            feeRateBps = this.safeString (rawEvent, 'effective_taker_fee_rate_bps');
        }
        let takerRate: Num = undefined;
        if (feeRateBps !== undefined) {
            takerRate = this.parseNumber (Precise.stringDiv (feeRateBps, '10000'));
        }
        const labels = this.safeList (rawMarket, 'outcome_labels', [ 'Yes', 'No' ]);
        const yesLabel = this.safeString (labels, 0, 'Yes');
        const noLabel = this.safeString (labels, 1, 'No');
        let yesTokenId = this.safeString (rawMarket, 'yes_token_id');
        let noTokenId = this.safeString (rawMarket, 'no_token_id');
        // a market not registered on-chain has no token ids; keep it addressable as {market_id}:yes|no
        if ((yesTokenId === undefined) || (yesTokenId === '')) {
            yesTokenId = marketId + ':yes';
        }
        if ((noTokenId === undefined) || (noTokenId === '')) {
            noTokenId = marketId + ':no';
        }
        const precision: Dict = {
            'amount': amountPrecision,
            'price': pricePrecision,
        };
        let yesWinner: Bool = undefined;
        let noWinner: Bool = undefined;
        if (result === 'yes') {
            yesWinner = true;
            noWinner = false;
        } else if (result === 'no') {
            yesWinner = false;
            noWinner = true;
        }
        const yesHandle = this.slugToOutcomeSymbol (eventSlug, title, yesLabel);
        const noHandle = this.slugToOutcomeSymbol (eventSlug, title, noLabel);
        let resolvedOutcome: Str = undefined;
        if (yesWinner === true) {
            resolvedOutcome = yesHandle;
        } else if (noWinner === true) {
            resolvedOutcome = noHandle;
        }
        const outcomes: Dict[] = [
            {
                'outcome': yesHandle,
                'outcomeId': yesTokenId,
                'id': yesTokenId,
                'market': marketHandle,
                'marketId': marketId,
                'event': eventHandle,
                'label': yesLabel,
                'price': this.safeNumber (rawMarket, 'yes_price'),
                'active': active,
                'winner': yesWinner,
                'precision': precision,
                'info': rawMarket,
            },
            {
                'outcome': noHandle,
                'outcomeId': noTokenId,
                'id': noTokenId,
                'market': marketHandle,
                'marketId': marketId,
                'event': eventHandle,
                'label': noLabel,
                'price': this.safeNumber (rawMarket, 'no_price'),
                'active': active,
                'winner': noWinner,
                'precision': precision,
                'info': rawMarket,
            },
        ];
        const openAt = this.safeString (rawMarket, 'open_at');
        const closeAt = this.safeString (rawMarket, 'close_at');
        return {
            'id': marketId,
            'market': marketHandle,
            'event': eventHandle,
            'title': title,
            'description': this.safeString (rawMarket, 'description'),
            'marketType': 'binary',
            'executionModel': 'clob',
            'collateral': 'USDC',
            'base': 'USDC',
            'quote': 'USDC',
            'settle': undefined,
            'baseId': marketId,
            'quoteId': this.safeString (rawMarket, 'quote_currency', 'usdc'),
            'settleId': undefined,
            'type': 'prediction',
            'spot': false,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'prediction': true,
            'active': active,
            'closed': !active,
            'resolved': resolved,
            'resolvedOutcome': resolvedOutcome,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': this.parse8601 (closeAt),
            'expiryDatetime': closeAt,
            'strike': undefined,
            'optionType': undefined,
            'created': this.parse8601 (openAt),
            'createdDatetime': openAt,
            'end': this.parse8601 (closeAt),
            'endDatetime': closeAt,
            'volume': this.safeNumber (rawMarket, 'volume'),
            'openInterest': this.safeNumber (rawMarket, 'open_interest'),
            'tickSize': pricePrecision,
            'resolutionSource': this.safeString (rawMarket, 'resolution_source'),
            'image': this.safeString (rawMarket, 'image_url'),
            'taker': takerRate,
            'maker': this.parseNumber ('0'),
            'percentage': true,
            'tierBased': false,
            'feeSide': 'quote',
            'fees': {
                'trading': takerRate,
            },
            'precision': precision,
            'limits': {
                'leverage': { 'min': 1, 'max': 1 },
                'amount': { 'min': minAmount, 'max': undefined },
                'price': { 'min': minPrice, 'max': maxPrice },
                'cost': { 'min': undefined, 'max': undefined },
            },
            'outcomes': outcomes,
            'info': rawMarket,
        };
    }

    /**
     * @ignore
     * @method
     * @name calibri#parseMarketRef
     * @description splits a "{market_id}:yes|no" outcome reference
     * @param {string} value the outcome reference
     * @returns {object|undefined} { marketId, side } or undefined when the value is not a market reference
     */
    parseMarketRef (value: Str): NullableDict {
        if (value === undefined) {
            return undefined;
        }
        const parts = value.split (':');
        const partsLength = parts.length;
        if (partsLength !== 2) {
            return undefined;
        }
        const marketId = parts[0];
        const side = parts[1].toLowerCase ();
        if (!this.isNumericString (marketId)) {
            return undefined;
        }
        if ((side !== 'yes') && (side !== 'no')) {
            return undefined;
        }
        return { 'marketId': marketId, 'side': side };
    }

    /**
     * @ignore
     * @method
     * @name calibri#findOutcomeByMarketSide
     * @description looks up a cached outcome by its calibri market id and side, without a request
     * @param {string} marketId the calibri market id
     * @param {string} side 'yes' or 'no'
     * @returns {object|undefined} the cached outcome, or undefined
     */
    findOutcomeByMarketSide (marketId: Str, side: Str): NullableDict {
        const key = this.outcomeKeyByMarketSide (marketId, side);
        if (key === undefined) {
            return undefined;
        }
        return this.safeDict (this.outcomes_by_id, key);
    }

    /**
     * @ignore
     * @method
     * @name calibri#outcomeKeyByMarketSide
     * @description the outcomes_by_id key of a cached outcome, by its calibri market id and side
     * @param {string} marketId the calibri market id
     * @param {string} side 'yes' or 'no'
     * @returns {string|undefined} the key, or undefined when the outcome is not cached
     */
    outcomeKeyByMarketSide (marketId: Str, side: Str): Str {
        if ((marketId === undefined) || (side === undefined) || (this.outcomes_by_id === undefined)) {
            return undefined;
        }
        const keys = Object.keys (this.outcomes_by_id);
        for (let i = 0; i < keys.length; i++) {
            const oc = this.outcomes_by_id[keys[i]];
            if ((this.safeString (oc, 'marketId') === marketId) && (this.outcomeSide (oc) === side)) {
                return keys[i];
            }
        }
        return undefined;
    }

    /**
     * @ignore
     * @method
     * @name calibri#lookupOutcome
     * @description resolves an outcome handle, token id or "{market_id}:yes|no" reference from the cache, without a request
     * @param {string} outcome the outcome reference
     * @returns {object} the cached outcome; throws BadSymbol when it is not cached
     */
    lookupOutcome (outcome: string): any {
        if (this.hasOutcome (outcome)) {
            return this.safeOutcome (outcome);
        }
        const marketRef = this.parseMarketRef (outcome);
        if (marketRef !== undefined) {
            const found = this.findOutcomeByMarketSide (this.safeString (marketRef, 'marketId'), this.safeString (marketRef, 'side'));
            if (found !== undefined) {
                return found;
            }
        }
        return this.outcome (outcome);
    }

    /**
     * @ignore
     * @method
     * @name calibri#outcomeSide
     * @description the calibri side of an outcome object, 'yes' or 'no'
     * @param {object} outcomeObj an outcome object
     * @param {string} [defaultSide] returned when the side cannot be determined
     * @returns {string} 'yes' or 'no'
     */
    outcomeSide (outcomeObj: any, defaultSide: Str = undefined): Str {
        const side = this.safeString (outcomeObj, 'side');
        if (side !== undefined) {
            return side;
        }
        const outcomeId = this.safeString (outcomeObj, 'outcomeId');
        if (outcomeId === undefined) {
            return defaultSide;
        }
        const marketId = this.safeString (outcomeObj, 'marketId');
        const info = this.safeDict (outcomeObj, 'info', {});
        if ((outcomeId === this.safeString (info, 'no_token_id')) || (outcomeId === marketId + ':no')) {
            return 'no';
        }
        if ((outcomeId === this.safeString (info, 'yes_token_id')) || (outcomeId === marketId + ':yes')) {
            return 'yes';
        }
        return defaultSide;
    }

    /**
     * @ignore
     * @method
     * @name calibri#resolveRowOutcome
     * @description the outcome of an order, fill or position row, built from the row when it is not cached
     * @param {string} marketId the calibri market id
     * @param {string} side 'yes' or 'no'
     * @param {object} [hint] an outcome object passed by the caller
     * @param {string} [tokenId] the row's token_id
     * @param {object} [row] the row itself: one that carries event_slug, market_title and outcome_labels names its outcome without the market being loaded
     * @returns {object} an outcome object
     */
    resolveRowOutcome (marketId: Str, side: Str, hint: any = undefined, tokenId: Str = undefined, row: any = undefined): any {
        if (hint !== undefined) {
            const hintMarketId = this.safeString (hint, 'marketId');
            const hintSide = this.outcomeSide (hint);
            if (((marketId === undefined) || (hintMarketId === marketId)) && ((side === undefined) || (hintSide === side))) {
                return hint;
            }
        }
        if ((tokenId !== undefined) && (this.outcomes_by_id !== undefined) && (tokenId in this.outcomes_by_id)) {
            return this.outcomes_by_id[tokenId];
        }
        const cached = this.findOutcomeByMarketSide (marketId, side);
        if (cached !== undefined) {
            return cached;
        }
        // the row names its own market (as a kalshi row carries its ticker): the handle is built from the same fields
        // parseCalibriMarket builds it from, so it is the handle loadMarkets would give, with no request
        const eventSlug = this.safeString (row, 'event_slug');
        const marketTitle = this.safeString (row, 'market_title');
        const labels = this.safeList (row, 'outcome_labels');
        if ((eventSlug !== undefined) && (marketTitle !== undefined) && (labels !== undefined) && ((side === 'yes') || (side === 'no'))) {
            let label = this.safeString (labels, 0);
            if (side === 'no') {
                label = this.safeString (labels, 1);
            }
            if (label !== undefined) {
                let rowTokenId = tokenId;
                if (rowTokenId === undefined) {
                    rowTokenId = this.safeString (row, 'token_id');
                }
                return {
                    'outcome': this.slugToOutcomeSymbol (eventSlug, marketTitle, label),
                    'outcomeId': rowTokenId,
                    'market': this.slugToMarketSymbol (eventSlug, marketTitle),
                    'marketId': marketId,
                    'side': side,
                    'label': label,
                    'event': this.shortenSlug (eventSlug),
                    'info': {},
                };
            }
        }
        let marketRef: Str = undefined;
        if ((marketId !== undefined) && (side !== undefined)) {
            marketRef = marketId + ':' + side;
        }
        return {
            'outcome': marketRef,
            'outcomeId': tokenId,
            'market': undefined,
            'marketId': marketId,
            'side': side,
            'label': undefined,
            'event': undefined,
            'info': {},
        };
    }

    /**
     * @ignore
     * @method
     * @name calibri#registerMarketRow
     * @description caches one market read from /public/markets and indexes its outcomes
     * @param {object} rawMarket a calibri market payload
     */
    registerMarketRow (rawMarket: Dict) {
        const marketRow = this.parseCalibriMarket (rawMarket);
        if (this.markets === undefined) {
            this.markets = this.createSafeDictionary ();
        }
        this.markets[marketRow['market']] = marketRow;
        this.populateOutcomes ();
    }

    /**
     * @ignore
     * @method
     * @name calibri#fetchOutcome
     * @description resolves an uncached outcome handle, token id or "{market_id}:yes|no" reference
     * @param {string} outcomeSymbol the outcome handle, token id or market reference
     * @returns {object} the resolved outcome
     */
    override async fetchOutcome (outcomeSymbol: string): Promise<any> {
        const marketRef = this.parseMarketRef (outcomeSymbol);
        if (marketRef !== undefined) {
            const refMarketId = this.safeString (marketRef, 'marketId');
            const refSide = this.safeString (marketRef, 'side');
            // read through safeDict: the go port types fetchOutcome's result channel and accepts a safeDict local
            const cached = this.safeDict (this.outcomes_by_id, this.outcomeKeyByMarketSide (refMarketId, refSide));
            if (cached !== undefined) {
                return cached;
            }
            const response = await this.pythiaPublicGetPublicMarketsMarket ({ 'market': refMarketId });
            this.registerMarketRow (response);
            const found = this.safeDict (this.outcomes_by_id, this.outcomeKeyByMarketSide (refMarketId, refSide));
            if (found !== undefined) {
                return found;
            }
            throw new BadSymbol (this.id + ' could not resolve outcome ' + outcomeSymbol);
        }
        if (this.isNumericString (outcomeSymbol)) {
            const response = await this.pythiaPublicGetPublicMarkets ({ 'token_id': outcomeSymbol });
            //
            //     [ { "id": 993715, "yes_token_id": "3385...", "no_token_id": "5611...", ... } ]
            //
            let rows: any[] = [];
            if (Array.isArray (response)) {
                rows = response;
            }
            const rowsLength = rows.length;
            if (rowsLength > 0) {
                this.registerMarketRow (rows[0]);
                if (this.hasOutcome (outcomeSymbol)) {
                    return this.safeOutcome (outcomeSymbol);
                }
            }
            throw new BadSymbol (this.id + ' could not resolve outcome ' + outcomeSymbol + ' — no live market has this token id');
        }
        if (outcomeSymbol.indexOf (':') < 0) {
            throw new BadSymbol (this.id + ' could not resolve outcome ' + outcomeSymbol + " — pass an outcome handle, a token id or '{market_id}:yes' / '{market_id}:no'");
        }
        // the base fetchOutcome search, inline: the go port routes super calls to the crypto base
        const searchQuery = this.outcomeSearchQuery (outcomeSymbol);
        if (searchQuery !== undefined) {
            const searchLimit = this.safeInteger (this.options, 'fetchOutcomeSearchLimit', 10);
            // live events first, then every status: a handle from a closed market is still a valid name for it
            const statuses = [ undefined, 'all' ];
            for (let i = 0; i < statuses.length; i++) {
                const searchParams: Dict = { 'query': searchQuery, 'limit': searchLimit };
                if (statuses[i] !== undefined) {
                    searchParams['status'] = statuses[i];
                }
                try {
                    await this.fetchEvents (searchParams);
                } catch (e) {
                    if (!(e instanceof BadSymbol)) {
                        throw e;
                    }
                }
                if (this.hasOutcome (outcomeSymbol)) {
                    return this.safeOutcome (outcomeSymbol);
                }
            }
        }
        // fall back to the plain listing: series-window handles carry slug timestamps the text search does not match
        const limit = this.safeInteger (this.options, 'fetchMarketsLimit', 200);
        const rawEvents = await this.fetchRawEventsPaged ({}, limit, undefined);
        const events = this.parseEvents (rawEvents);
        this.registerEventMarkets (events);
        this.setEvents (events);
        if (this.hasOutcome (outcomeSymbol)) {
            return this.safeOutcome (outcomeSymbol);
        }
        throw new BadSymbol (this.id + ' could not resolve outcome ' + outcomeSymbol + " — call fetchEvents ({ 'query': ... }) first, or pass '{market_id}:yes' / '{market_id}:no'");
    }

    /**
     * @method
     * @name calibri#fetchTicker
     * @description fetches the ticker of one outcome; calibri publishes it in YES price space and the NO ticker is its complement
     * @see https://docs.calibri.io/api-reference/endpoints/market-data/ticker
     * @param {string} outcome unified outcome handle, token id or "{market_id}:yes|no"
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    override async fetchTicker (outcome: string, params: Dict = {}): Promise<PredictionTicker> {
        const outcomeObj = await this.loadOutcome (outcome);
        const request: Dict = {
            'market': this.safeString (outcomeObj, 'marketId'),
        };
        const response = await this.pythiaPublicGetPublicMarketsMarketTicker (this.extend (request, params));
        //
        //     {
        //         "timestamp": 1792362944,
        //         "ticker": {
        //             "buy": "0.65",
        //             "sell": null,
        //             "low": "0.35",
        //             "high": "0.35",
        //             "last": "0.35",
        //             "open": "0.35",
        //             "volume": "0",
        //             "quote_volume": "0",
        //             "avg_price": "0.35",
        //             "change_24h": "0"
        //         }
        //     }
        //
        return this.parsePredictionTicker (response, outcomeObj);
    }

    /**
     * @method
     * @name calibri#fetchTickers
     * @description fetches the tickers of several outcomes from the all-markets tickers endpoint
     * @see https://docs.calibri.io/api-reference/endpoints/market-data/all-tickers
     * @param {string[]} outcomes unified outcome handles
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure) indexed by outcome
     */
    override async fetchTickers (outcomes: Strings = undefined, params: Dict = {}): Promise<PredictionTickers> {
        if (outcomes === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTickers() requires an outcomes argument; pass the outcome handles to fetch (discover them via fetchEvents ())');
        }
        await this.loadOutcomes (outcomes);
        const targets: any[] = [];
        for (let i = 0; i < outcomes.length; i++) {
            targets.push (this.lookupOutcome (outcomes[i]));
        }
        const response = await this.pythiaPublicGetPublicTickers (params);
        //
        //     {
        //         "993715": { "timestamp": 1792362944, "ticker": { "buy": "0.65", "sell": null, ... } },
        //         ...
        //     }
        //
        const result: PredictionTickers = {};
        for (let i = 0; i < targets.length; i++) {
            const outcomeObj = targets[i];
            const marketId = this.safeString (outcomeObj, 'marketId');
            const entry = this.safeDict (response, marketId);
            if (entry === undefined) {
                continue;
            }
            const ticker = this.parsePredictionTicker (entry, outcomeObj);
            const key = this.safeString (ticker, 'outcome', marketId);
            if (key !== undefined) {
                result[key] = ticker;
            }
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name calibri#complementPrice
     * @description converts a YES price into the NO price (1 - price)
     * @param {string} [price] the YES price
     * @returns {string|undefined} the NO price
     */
    complementPrice (price: Str): Str {
        if (price === undefined) {
            return undefined;
        }
        return Precise.stringSub ('1', price);
    }

    /**
     * @ignore
     * @method
     * @name calibri#parsePredictionTicker
     * @description parses a calibri market ticker into the ticker of one outcome
     * @param {object} ticker the raw { at, ticker } object
     * @param {object} [market] the outcome object
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    override parsePredictionTicker (ticker: Dict, market: Market = undefined): PredictionTicker {
        //
        //     {
        //         "timestamp": 1792362944,
        //         "ticker": {
        //             "buy": "0.65",
        //             "sell": null,
        //             "buy_volume": "15",
        //             "sell_volume": null,
        //             "low": "0.35",
        //             "high": "0.35",
        //             "last": "0.35",
        //             "open": "0.35",
        //             "volume": "0",
        //             "quote_volume": "0",
        //             "avg_price": "0.35",
        //             "change_24h": "0"
        //         }
        //     }
        //
        const data = this.safeDict (ticker, 'ticker', ticker);
        const timestamp = this.safeTimestamp (ticker, 'timestamp');
        const side = this.outcomeSide (market, 'yes');
        let bid = this.omitZero (this.safeString (data, 'buy'));
        let ask = this.omitZero (this.safeString (data, 'sell'));
        let bidVolume = this.safeString (data, 'buy_volume');
        let askVolume = this.safeString (data, 'sell_volume');
        let last = this.omitZero (this.safeString (data, 'last'));
        let open = this.omitZero (this.safeString (data, 'open'));
        let high = this.omitZero (this.safeString (data, 'high'));
        let low = this.omitZero (this.safeString (data, 'low'));
        let average = this.omitZero (this.safeString (data, 'avg_price'));
        const baseVolume = this.safeString (data, 'volume');
        // the sum of price * volume, in YES price space
        let quoteVolume = this.safeString (data, 'quote_volume');
        let percentage: Str = undefined;
        if (side === 'no') {
            const yesBid = bid;
            const yesAsk = ask;
            const yesBidVolume = bidVolume;
            const yesHigh = high;
            bid = this.complementPrice (yesAsk);
            ask = this.complementPrice (yesBid);
            bidVolume = askVolume;
            askVolume = yesBidVolume;
            last = this.complementPrice (last);
            open = this.complementPrice (open);
            high = this.complementPrice (low);
            low = this.complementPrice (yesHigh);
            average = this.complementPrice (average);
            // the sum of (1 - price) * volume is the volume less the YES sum
            if ((baseVolume !== undefined) && (quoteVolume !== undefined)) {
                quoteVolume = Precise.stringSub (baseVolume, quoteVolume);
            }
        } else {
            // change_24h is a fraction of the open, YES side only
            const change = this.safeString (data, 'change_24h');
            if (change !== undefined) {
                percentage = Precise.stringMul (change, '100');
            }
        }
        return this.safePredictionTicker ({
            'info': ticker,
            'outcome': this.safeString (market, 'outcome'),
            'outcomeId': this.safeString (market, 'outcomeId'),
            'label': this.safeString (market, 'label'),
            'market': this.safeString (market, 'market'),
            'event': this.safeString (market, 'event'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'open': open,
            'close': last,
            'last': last,
            'change': undefined,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
        }, market);
    }

    /**
     * @method
     * @name calibri#fetchOrderBook
     * @description fetches the order book of one outcome (calibri publishes the YES and NO books together)
     * @see https://docs.calibri.io/api-reference/endpoints/market-data/order-book
     * @param {string} outcome unified outcome handle, token id or "{market_id}:yes|no"
     * @param {int} [limit] the number of levels per side, 1-200
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)
     */
    override async fetchOrderBook (outcome: string, limit: Int = undefined, params: Dict = {}): Promise<PredictionOrderBook> {
        const outcomeObj = await this.loadOutcome (outcome);
        const request: Dict = {
            'market': this.safeString (outcomeObj, 'marketId'),
        };
        if (limit !== undefined) {
            request['asks_limit'] = limit;
            request['bids_limit'] = limit;
        }
        const response = await this.pythiaPublicGetPublicMarketsMarketOrderBook (this.extend (request, params));
        //
        //     {
        //         "yes_bids": [ { "side": "yes", "price": "0.65", "volume": "15" }, ... ],
        //         "no_bids": [],
        //         "yes_asks": [],
        //         "no_asks": [ { "side": "no", "price": "0.65", "volume": "5" }, ... ]
        //     }
        //
        const side = this.outcomeSide (outcomeObj, 'yes');
        const book: Dict = {
            'bids': this.safeList (response, side + '_bids', []),
            'asks': this.safeList (response, side + '_asks', []),
        };
        const orderbook = this.parseOrderBook (book, this.safeString (outcomeObj, 'outcome'), undefined, 'bids', 'asks', 'price', 'volume');
        return this.safePredictionOrderBook (orderbook, outcomeObj);
    }

    /**
     * @method
     * @name calibri#fetchOHLCV
     * @description fetches candles of one outcome; calibri publishes YES-price candles and the NO candle is the complement (high and low swapped)
     * @see https://docs.calibri.io/api-reference/endpoints/market-data/k-line-candles
     * @param {string} outcome unified outcome handle, token id or "{market_id}:yes|no"
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum number of candles to fetch, 1-10000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} a list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async fetchOHLCV (outcome: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        const outcomeObj = await this.loadOutcome (outcome);
        const period = this.safeString (this.timeframes, timeframe);
        if (period === undefined) {
            throw new BadRequest (this.id + ' fetchOHLCV() unsupported timeframe ' + timeframe);
        }
        const request: Dict = {
            'market': this.safeString (outcomeObj, 'marketId'),
            'period': this.parseToInt (period),
        };
        if (since !== undefined) {
            request['time_from'] = this.parseToInt (since / 1000);
            // the server reads time_from with limit as a fixed window of limit periods, so a market that opened after
            // since would answer nothing; ask for a wide window and keep the first limit candles below
            let window = this.safeInteger (this.options, 'fetchOHLCVSinceWindow', 1000);
            if ((limit !== undefined) && (limit > window)) {
                window = limit;
            }
            request['limit'] = window;
        } else if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['time_to'] = this.parseToInt (until / 1000);
        }
        const response = await this.pythiaPublicGetPublicMarketsMarketKLine (this.extend (request, this.omit (params, 'until')));
        //
        //     [
        //         [ 1792350000, 0.35, 0.35, 0.35, 0.35, 0 ],
        //         [ 1792353600, 0.35, 0.36, 0.34, 0.36, 12 ]
        //     ]
        //
        const side = this.outcomeSide (outcomeObj, 'yes');
        let rows: any[] = [];
        if (Array.isArray (response)) {
            rows = response;
        }
        const result: OHLCV[] = [];
        for (let i = 0; i < rows.length; i++) {
            result.push (this.parseCalibriCandle (rows[i], side));
        }
        const sorted = this.sortBy (result, 0);
        return this.filterBySinceLimit (sorted, since, limit, 0) as OHLCV[];
    }

    /**
     * @ignore
     * @method
     * @name calibri#parseCalibriCandle
     * @description parses one YES-space candle row for an outcome; a NO candle is the complement, with high and low swapped
     * @param {any[]} row [ timestamp, open, high, low, close, volume ]
     * @param {string} side 'yes' or 'no'
     * @returns {int[]} the candle
     */
    parseCalibriCandle (row: any, side: Str): OHLCV {
        const ts = this.safeTimestamp (row, 0);
        let o = this.safeString (row, 1);
        let h = this.safeString (row, 2);
        let l = this.safeString (row, 3);
        let c = this.safeString (row, 4);
        if (side === 'no') {
            const yesHigh = h;
            o = this.complementPrice (o);
            h = this.complementPrice (l);
            l = this.complementPrice (yesHigh);
            c = this.complementPrice (c);
        }
        return [
            ts,
            this.parseNumber (o),
            this.parseNumber (h),
            this.parseNumber (l),
            this.parseNumber (c),
            this.safeNumber (row, 5),
        ];
    }

    /**
     * @method
     * @name calibri#fetchTrades
     * @description fetches the public trade tape of one outcome; voided trades are dropped and NO prices are the complement of the YES price
     * @see https://docs.calibri.io/api-reference/endpoints/market-data/recent-contracts
     * @param {string} outcome unified outcome handle, token id or "{market_id}:yes|no"
     * @param {int} [since] timestamp in ms of the earliest trade to fetch (sent as time_from, filtered client-side as well)
     * @param {int} [limit] the maximum number of trades to fetch, 1-1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.from_id] only trades with an id greater than this, oldest first
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    override async fetchTrades (outcome: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionTrade[]> {
        const outcomeObj = await this.loadOutcome (outcome);
        const request: Dict = {
            'market': this.safeString (outcomeObj, 'marketId'),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['time_from'] = this.parseToInt (since / 1000);
        }
        const response = await this.pythiaPublicGetPublicMarketsMarketContractsRecent (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 244869,
        //             "market_id": 993715,
        //             "price": "0.35",
        //             "volume": "3",
        //             "state": "active",
        //             "taker_side": "yes",
        //             "created_at": "2026-09-27T06:50:27Z"
        //         }
        //     ]
        //
        const rows = this.filterOutVoided (response);
        return this.parsePredictionTrades (rows, outcomeObj, since, limit);
    }

    /**
     * @ignore
     * @method
     * @name calibri#filterOutVoided
     * @description drops rows whose state is voided (a reversed trade, not a fill)
     * @param {object[]} rows raw trade or fill rows
     * @returns {object[]} the rows that are not voided
     */
    filterOutVoided (rows: any): any[] {
        const result: any[] = [];
        if (!Array.isArray (rows)) {
            return result;
        }
        for (let i = 0; i < rows.length; i++) {
            if (this.safeString (rows[i], 'state') !== 'voided') {
                result.push (rows[i]);
            }
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name calibri#parsePredictionTrade
     * @description parses a public tape row or an account fill (contract) row
     * @param {object} trade the raw row
     * @param {object} [market] the outcome object
     * @returns {object} a [prediction trade structure](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    override parsePredictionTrade (trade: Dict, market: Market = undefined): PredictionTrade {
        //
        // public tape
        //
        //     {
        //         "id": 244869,
        //         "market_id": 993715,
        //         "price": "0.35",
        //         "volume": "3",
        //         "state": "active",
        //         "taker_side": "yes",
        //         "created_at": "2026-09-27T06:50:27Z"
        //     }
        //
        // account fill
        //
        //     {
        //         "id": 90210,
        //         "market_id": 993715,
        //         "side": "no",
        //         "direction": "buy",
        //         "match_type": "mint",
        //         "order_id": 99326754,
        //         "price": 0.35,
        //         "avg_price": 0.65,
        //         "volume": 10,
        //         "funds_spent": 6.5,
        //         "proceeds": 0,
        //         "taker_fee_amount": "0.091",
        //         "taker_or_maker": "taker",
        //         "fee": "0.091",
        //         "state": "active",
        //         "created_at": "2026-09-27T06:50:27Z"
        //     }
        //
        const marketId = this.safeString (trade, 'market_id');
        const timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        const direction = this.safeStringLower (trade, 'direction');
        const amount = this.safeString (trade, 'volume');
        if (direction !== undefined) {
            const rowSide = this.safeStringLower (trade, 'side');
            const fillOutcome = this.resolveRowOutcome (marketId, rowSide, market, this.safeString (trade, 'token_id'), trade);
            let fillPrice = this.safeString (trade, 'avg_price');
            if (fillPrice === undefined) {
                fillPrice = this.safeString (trade, 'price');
                if (rowSide === 'no') {
                    fillPrice = this.complementPrice (fillPrice);
                }
            }
            let cost: Str = undefined;
            if (direction === 'buy') {
                cost = this.omitZero (this.safeString (trade, 'funds_spent'));
            } else {
                cost = this.omitZero (this.safeString (trade, 'proceeds'));
            }
            const takerOrMaker = this.safeStringLower (trade, 'taker_or_maker');
            let fee: NullableDict = undefined;
            const feeCost = this.safeString (trade, 'fee');
            if (feeCost !== undefined) {
                fee = { 'cost': this.parseNumber (feeCost), 'currency': 'USDC' };
            } else if (takerOrMaker === 'maker') {
                fee = { 'cost': this.parseNumber ('0'), 'currency': 'USDC' };
            }
            return this.safePredictionTrade ({
                'info': trade,
                'id': this.safeString (trade, 'id'),
                'order': this.safeString (trade, 'order_id'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'outcome': this.safeString (fillOutcome, 'outcome'),
                'outcomeId': this.safeString (fillOutcome, 'outcomeId'),
                'label': this.safeString (fillOutcome, 'label'),
                'market': this.safeString (fillOutcome, 'market'),
                'type': 'limit',
                'side': direction,
                'takerOrMaker': takerOrMaker,
                'price': fillPrice,
                'amount': amount,
                'cost': cost,
                'fee': fee,
            }, fillOutcome);
        }
        // a public tape row is the same trade seen from either outcome: the aggressor bought taker_side
        const outcomeSide = this.outcomeSide (market, 'yes');
        const outcomeObj = this.resolveRowOutcome (marketId, outcomeSide, market);
        const takerSide = this.safeStringLower (trade, 'taker_side');
        let price = this.safeString (trade, 'price');
        if (outcomeSide === 'no') {
            price = this.complementPrice (price);
        }
        let side: Str = undefined;
        if (takerSide !== undefined) {
            if (takerSide === outcomeSide) {
                side = 'buy';
            } else {
                side = 'sell';
            }
        }
        return this.safePredictionTrade ({
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market'),
            'type': undefined,
            'side': side,
            'takerOrMaker': 'taker',
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, outcomeObj);
    }

    /**
     * @method
     * @name calibri#fetchTradingFee
     * @description fetches the trading fee of an outcome: takers pay taker * p * (1 - p) per share, makers pay nothing
     * @see https://docs.calibri.io/api-reference/endpoints/markets/market-detail
     * @param {string} outcome unified outcome handle, token id or "{market_id}:yes|no"
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)
     */
    override async fetchTradingFee (outcome: string, params: Dict = {}): Promise<PredictionTradingFee> {
        const outcomeObj = await this.loadOutcome (outcome);
        // the market carries the rate it is charged (a member's market in a platform event has its own), so the market
        // is read, not its event and every market in it
        const request: Dict = {
            'market': this.safeString (outcomeObj, 'marketId'),
        };
        const response = await this.pythiaPublicGetPublicMarketsMarket (this.extend (request, params));
        //
        //     { "id": 993715, "event_slug": "gtm-sarb-repo-nov-2026", "effective_taker_fee_rate_bps": 500, ... }
        //
        // null: neither the event nor its category sets a rate, and trades are charged the default
        const rateBps = this.safeString (response, 'effective_taker_fee_rate_bps', this.safeString (this.options, 'defaultTakerFeeRateBps', '700'));
        const taker = this.parseNumber (Precise.stringDiv (rateBps, '10000'));
        return {
            'info': response,
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
            'market': this.safeString (outcomeObj, 'market'),
            'maker': this.parseNumber ('0'),
            'taker': taker,
            'percentage': true,
            'tierBased': false,
        } as PredictionTradingFee;
    }

    /**
     * @method
     * @name calibri#fetchOpenInterest
     * @description fetches the open interest of an outcome's market (outstanding YES/NO pairs, one USDC of collateral each)
     * @see https://docs.calibri.io/api-reference/endpoints/markets/market-detail
     * @param {string} outcome unified outcome handle, token id or "{market_id}:yes|no"
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [open interest structure](https://docs.ccxt.com/#/?id=open-interest-structure)
     */
    override async fetchOpenInterest (outcome: string, params: Dict = {}): Promise<PredictionOpenInterest> {
        const outcomeObj = await this.loadOutcome (outcome);
        const request: Dict = {
            'market': this.safeString (outcomeObj, 'marketId'),
        };
        const response = await this.pythiaPublicGetPublicMarketsMarket (this.extend (request, params));
        //
        //     { "id": 993714, "title": "Cut", "open_interest": "120", ... }
        //
        return this.parsePredictionOpenInterest (response, outcomeObj);
    }

    override parsePredictionOpenInterest (interest: Dict, market: Market = undefined): PredictionOpenInterest {
        const amount = this.safeNumber (interest, 'open_interest');
        return {
            'info': interest,
            'outcome': this.safeString (market, 'outcome'),
            'outcomeId': this.safeString (market, 'outcomeId'),
            'market': this.safeString (market, 'market'),
            'openInterestAmount': amount,
            'openInterestValue': undefined,
            'timestamp': undefined,
            'datetime': undefined,
        } as PredictionOpenInterest;
    }

    /**
     * @method
     * @name calibri#fetchBalance
     * @description fetches the USDC balance: free is what is available (balance_safe for a self-custody account, balance for a custodial one) and used what resting orders reserve
     * @see https://docs.calibri.io/non-custodial/balances
     * @see https://docs.calibri.io/api-reference/endpoints/account/all-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    override async fetchBalance (params: Dict = {}): Promise<Balances> {
        const response = await this.atlasPrivateGetAccountBalances (params);
        //
        //     [
        //         {
        //             "currency": "usdc",
        //             "balance": "0",
        //             "locked": "0",
        //             "balance_safe": "125.5",
        //             "locked_safe": "20",
        //             "redeemable_safe": "0",
        //             "balance_eoa": "0"
        //         }
        //     ]
        //
        const result: Dict = { 'info': response };
        let rows: any[] = [];
        if (Array.isArray (response)) {
            rows = response;
        }
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            let code = this.safeCurrencyCode (this.safeString (row, 'currency'));
            if (code === undefined) {
                code = 'USDC';
            }
            const account = this.account ();
            // two pools, each zero when unused: balance/locked custodial, balance_safe/locked_safe the Safe. balance is
            // what is available and locked what resting orders reserve, so free and used each sum the two pools
            account['free'] = Precise.stringAdd (this.safeString (row, 'balance', '0'), this.safeString (row, 'balance_safe', '0'));
            account['used'] = Precise.stringAdd (this.safeString (row, 'locked', '0'), this.safeString (row, 'locked_safe', '0'));
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name calibri#fetchPositions
     * @description fetches the account's outcome positions
     * @see https://docs.calibri.io/api-reference/endpoints/positions/your-positions
     * @param {string[]} [outcomes] unified outcome handles to filter by
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.open_only] only positions with a non-zero quantity, default true
     * @param {boolean} [params.markPrice] also fill markPrice and unrealizedPnl from the all-markets tickers (one extra public request), default false
     * @returns {object[]} a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    override async fetchPositions (outcomes: Strings = undefined, params: Dict = {}): Promise<PredictionPosition[]> {
        let markPrice = false;
        let query: Dict = {};
        [ markPrice, query ] = this.handleOptionAndParams (params, 'fetchPositions', 'markPrice', false);
        const request: Dict = {
            'open_only': true,
        };
        let wanted: NullableDict = undefined;
        if (outcomes !== undefined) {
            await this.loadOutcomes (outcomes);
            wanted = {};
            const marketIds: string[] = [];
            for (let i = 0; i < outcomes.length; i++) {
                const outcomeObj = this.lookupOutcome (outcomes[i]);
                const marketId = this.safeString (outcomeObj, 'marketId');
                wanted[marketId + ':' + this.outcomeSide (outcomeObj)] = true;
                if ((marketId !== undefined) && !this.inArray (marketId, marketIds)) {
                    marketIds.push (marketId);
                }
            }
            request['market_ids'] = marketIds.join (',');
        }
        const response = await this.atlasPrivateGetAccountPositions (this.extend (request, query));
        //
        //     [
        //         {
        //             "market_id": 993715,
        //             "side": "yes",
        //             "outcome_label": "Yes",
        //             "volume": "10",
        //             "sellable_volume": "10",
        //             "locked_volume": "0",
        //             "avg_price": "0.35",
        //             "cost_basis": "3.5",
        //             "realized_pnl": "0",
        //             "custody": "self",
        //             "quote_currency": "usdc",
        //             "updated_at": "2026-09-27T06:50:27Z"
        //         }
        //     ]
        //
        let rows: any[] = [];
        if (Array.isArray (response)) {
            rows = response;
        }
        const filtered: any[] = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const key = this.safeString (row, 'market_id') + ':' + this.safeStringLower (row, 'side');
            if ((wanted === undefined) || (key in wanted)) {
                filtered.push (row);
            }
        }
        const positions = this.parsePredictionPositions (filtered);
        const positionsLength = positions.length;
        if ((positionsLength > 0) && markPrice) {
            const markIds: string[] = [];
            for (let i = 0; i < positionsLength; i++) {
                const markId = this.safeString (filtered[i], 'market_id');
                if ((markId !== undefined) && !this.inArray (markId, markIds)) {
                    markIds.push (markId);
                }
            }
            // only these markets' tickers, not the whole board
            const tickers = await this.pythiaPublicGetPublicTickers ({ 'market_ids': markIds.join (',') });
            for (let i = 0; i < positionsLength; i++) {
                const raw = filtered[i];
                const entry = this.safeDict (tickers, this.safeString (raw, 'market_id'));
                const ticker = this.safeDict (entry, 'ticker', {});
                let mark = this.omitZero (this.safeString (ticker, 'last'));
                if ((mark !== undefined) && (this.safeStringLower (raw, 'side') === 'no')) {
                    mark = this.complementPrice (mark);
                }
                if (mark !== undefined) {
                    const qty = this.safeString (raw, 'volume');
                    const avgCost = this.safeString (raw, 'avg_price');
                    const costBasis = this.safeString (raw, 'cost_basis');
                    positions[i]['markPrice'] = this.parseNumber (mark);
                    positions[i]['lastPrice'] = this.parseNumber (mark);
                    if (qty !== undefined) {
                        positions[i]['notional'] = this.parseNumber (Precise.stringMul (qty, mark));
                        if (avgCost !== undefined) {
                            const unrealized = Precise.stringMul (Precise.stringSub (mark, avgCost), qty);
                            positions[i]['unrealizedPnl'] = this.parseNumber (unrealized);
                            if ((costBasis !== undefined) && Precise.stringGt (costBasis, '0')) {
                                positions[i]['percentage'] = this.parseNumber (Precise.stringMul (Precise.stringDiv (unrealized, costBasis), '100'));
                            }
                        }
                    }
                }
            }
        }
        return positions;
    }

    /**
     * @method
     * @name calibri#fetchPosition
     * @description fetches the position on one outcome
     * @see https://docs.calibri.io/api-reference/endpoints/positions/your-positions
     * @param {string} outcome unified outcome handle, token id or "{market_id}:yes|no"
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction position structure](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    override async fetchPosition (outcome: string, params: Dict = {}): Promise<PredictionPosition> {
        const positions = await this.fetchPositions ([ outcome ], params);
        return this.safeDict (positions, 0) as PredictionPosition;
    }

    override parsePredictionPosition (position: Dict, market: Market = undefined): PredictionPosition {
        const marketId = this.safeString (position, 'market_id');
        const side = this.safeStringLower (position, 'side');
        const outcomeObj = this.resolveRowOutcome (marketId, side, market, this.safeString (position, 'token_id'), position);
        let label = this.safeString (outcomeObj, 'label');
        if (label === undefined) {
            label = this.safeString (position, 'outcome_label');
        }
        const timestamp = this.parse8601 (this.safeString (position, 'updated_at'));
        // a row without side still names its outcome by token id
        let resolvedSide = side;
        if (resolvedSide === undefined) {
            resolvedSide = this.outcomeSide (outcomeObj);
        }
        let id: Str = undefined;
        if ((marketId !== undefined) && (resolvedSide !== undefined)) {
            id = marketId + ':' + resolvedSide;
        }
        const custody = this.safeString (position, 'custody');
        if ((id !== undefined) && (custody !== undefined)) {
            id = id + ':' + custody;
        }
        return this.safePredictionPosition ({
            'info': position,
            'id': id,
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
            'label': label,
            'market': this.safeString (outcomeObj, 'market'),
            'event': this.safeString (outcomeObj, 'event'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'side': 'long',
            'contracts': this.safeNumber (position, 'volume'),
            'contractSize': 1,
            'notional': undefined,
            'entryPrice': this.safeNumber (position, 'avg_price'),
            'markPrice': undefined,
            'lastPrice': undefined,
            'unrealizedPnl': undefined,
            'realizedPnl': this.safeNumber (position, 'realized_pnl'),
            'percentage': undefined,
            'collateral': this.safeNumber (position, 'cost_basis'),
            // fully collateralised outcome shares: no leverage, nothing to liquidate
            'marginMode': 'cross',
            'resolved': undefined,
            'won': undefined,
        });
    }

    /**
     * @method
     * @name calibri#fetchOrders
     * @description fetches the account's orders in every state, open and closed
     * @see https://docs.calibri.io/api-reference/endpoints/trade/your-orders
     * @param {string} [outcome] unified outcome handle to filter by
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to return, 1-100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.page] page number, default 1
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async fetchOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionOrder[]> {
        return await this.fetchOrdersInState ('wait,done,cancel,reject', outcome, since, limit, params);
    }

    /**
     * @method
     * @name calibri#fetchOpenOrders
     * @description fetches the account's resting orders
     * @see https://docs.calibri.io/api-reference/endpoints/trade/your-orders
     * @param {string} [outcome] unified outcome handle to filter by
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to return, 1-100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.page] page number, default 1
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async fetchOpenOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionOrder[]> {
        return await this.fetchOrdersInState ('wait', outcome, since, limit, params);
    }

    /**
     * @method
     * @name calibri#fetchClosedOrders
     * @description fetches the account's fully filled orders
     * @see https://docs.calibri.io/api-reference/endpoints/trade/your-orders
     * @param {string} [outcome] unified outcome handle to filter by
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to return, 1-100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.page] page number, default 1
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async fetchClosedOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionOrder[]> {
        return await this.fetchOrdersInState ('done', outcome, since, limit, params);
    }

    /**
     * @method
     * @name calibri#fetchCanceledOrders
     * @description fetches the account's cancelled orders (including expired ones and the unfilled rest of IOC orders)
     * @see https://docs.calibri.io/api-reference/endpoints/trade/your-orders
     * @param {string} [outcome] unified outcome handle to filter by
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to return, 1-100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.page] page number, default 1
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async fetchCanceledOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionOrder[]> {
        const orders = await this.fetchOrdersInState ('cancel', outcome, since, limit, params);
        // filterBySinceLimit returns a typed list, which the go port needs to carry this method's result
        return this.filterBySinceLimit (orders, since, limit) as PredictionOrder[];
    }

    /**
     * @ignore
     * @method
     * @name calibri#fetchOrdersInState
     * @description fetches one page of the account's orders in the given states
     * @param {string} state wait, done, cancel or reject, or several comma-separated
     * @param {string} [outcome] unified outcome handle to filter by
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to return, 1-100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async fetchOrdersInState (state: string, outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionOrder[]> {
        const request: Dict = {
            'state': state,
        };
        let outcomeObj: any = undefined;
        if (outcome !== undefined) {
            outcomeObj = await this.loadOutcome (outcome);
            request['market_id'] = this.safeString (outcomeObj, 'marketId');
            request['side'] = this.outcomeSide (outcomeObj);
        }
        if (since !== undefined) {
            request['time_from'] = this.parseToInt (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.pythiaPrivateGetOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 99326754,
        //             "side": "yes",
        //             "direction": "buy",
        //             "client_order_id": "bot-7f3a-0001",
        //             "ord_type": "limit",
        //             "price": "0.6",
        //             "state": "wait",
        //             "market_id": 993715,
        //             "volume": "100",
        //             "origin_volume": "100",
        //             "remaining_volume": "100",
        //             "filled_volume": "0",
        //             "contracts_count": 0,
        //             "locked": "60",
        //             "origin_locked": "60",
        //             "quote_currency": "usdc",
        //             "created_at": "2026-10-19T00:20:02Z",
        //             "updated_at": "2026-10-19T00:20:02Z"
        //         }
        //     ]
        //
        let rows: any[] = [];
        if (Array.isArray (response)) {
            rows = response;
        }
        const orders = this.parsePredictionOrders (rows, outcomeObj);
        return this.filterBySinceLimit (orders, since, limit) as PredictionOrder[];
    }

    /**
     * @method
     * @name calibri#fetchOrder
     * @description fetches one order by id
     * @see https://docs.calibri.io/api-reference/endpoints/trade/order-by-id
     * @param {string} id the order id
     * @param {string} [outcome] not used by calibri fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async fetchOrder (id: string, outcome: Str = undefined, params: Dict = {}): Promise<PredictionOrder> {
        const request: Dict = {
            'id': id,
        };
        const response = await this.pythiaPrivateGetOrdersId (this.extend (request, params));
        return this.parsePredictionOrder (response);
    }

    /**
     * @ignore
     * @method
     * @name calibri#parseOrderStatus
     * @description maps a calibri order state to the unified order status
     * @param {string} status the raw state
     * @returns {string} the unified status
     */
    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'wait': 'open',
            'pending': 'open',
            'done': 'closed',
            'cancel': 'canceled',
            'reject': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    override parsePredictionOrder (order: Dict, market: Market = undefined): PredictionOrder {
        //
        //     {
        //         "id": 99326754,
        //         "side": "yes",
        //         "direction": "buy",
        //         "client_order_id": "bot-7f3a-0001",
        //         "ord_type": "limit",
        //         "price": "0.6",
        //         "avg_price": "0.6",
        //         "filled_cost": "6",
        //         "fee": "0",
        //         "ioc": false,
        //         "post_only": false,
        //         "expires_at": "2026-11-18T00:20:02Z",
        //         "state": "wait",
        //         "market_id": 993715,
        //         "origin_volume": "100",
        //         "remaining_volume": "90",
        //         "filled_volume": "10",
        //         "created_at": "2026-10-19T00:20:02Z",
        //         "updated_at": "2026-10-19T00:20:02Z"
        //     }
        //
        const marketId = this.safeString (order, 'market_id');
        const side = this.safeStringLower (order, 'side');
        const outcomeObj = this.resolveRowOutcome (marketId, side, market, this.safeString (order, 'token_id'), order);
        let timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        if (timestamp === undefined) {
            // the websocket create frame carries epoch seconds as timestamp
            timestamp = this.safeTimestamp (order, 'timestamp');
        }
        const updated = this.parse8601 (this.safeString (order, 'updated_at'));
        const ioc = this.safeBool (order, 'ioc');
        const postOnly = this.safeBool (order, 'post_only');
        let timeInForce: Str = undefined;
        if (ioc === true) {
            timeInForce = 'IOC';
        } else if (postOnly === true) {
            timeInForce = 'PO';
        } else if ((ioc === false) && (postOnly === false)) {
            timeInForce = 'GTC';
        }
        let fee: NullableDict = undefined;
        const feeCost = this.safeString (order, 'fee');
        if (feeCost !== undefined) {
            fee = { 'cost': this.parseNumber (feeCost), 'currency': 'USDC' };
        }
        return this.safePredictionOrder ({
            'info': order,
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'client_order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': updated,
            'status': this.parseOrderStatus (this.safeString (order, 'state')),
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market'),
            'event': this.safeString (outcomeObj, 'event'),
            'type': this.safeString (order, 'ord_type', 'limit'),
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': this.safeStringLower (order, 'direction', 'buy'),
            'price': this.safeString (order, 'price'),
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'average': this.safeString (order, 'avg_price'),
            'amount': this.safeString2 (order, 'origin_volume', 'volume'),
            'filled': this.safeString (order, 'filled_volume'),
            'remaining': this.safeString (order, 'remaining_volume'),
            'cost': this.omitZero (this.safeString (order, 'filled_cost')),
            'fee': fee,
            'trades': [],
        }, outcomeObj);
    }

    /**
     * @method
     * @name calibri#fetchMyTrades
     * @description fetches the account's fills (contracts), newest first
     * @see https://docs.calibri.io/api-reference/endpoints/positions/your-contracts
     * @param {string} [outcome] unified outcome handle to filter by
     * @param {int} [since] timestamp in ms of the earliest fill
     * @param {int} [limit] the maximum number of fills to return, 1-200
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.page] page number, default 1
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    override async fetchMyTrades (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionTrade[]> {
        const request: Dict = {};
        let outcomeObj: any = undefined;
        if (outcome !== undefined) {
            outcomeObj = await this.loadOutcome (outcome);
            request['market_id'] = this.safeString (outcomeObj, 'marketId');
            request['side'] = this.outcomeSide (outcomeObj);
        }
        // voided fills (a settlement that failed on-chain) are not trades; leaving them out on the server keeps `limit`
        // counting only fills
        if (this.safeString (params, 'state') === undefined) {
            request['state'] = 'active,settled';
        }
        if (since !== undefined) {
            request['time_from'] = this.parseToInt (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.atlasPrivateGetAccountContracts (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 90210,
        //             "market_id": 993715,
        //             "side": "yes",
        //             "direction": "buy",
        //             "match_type": "mint",
        //             "order_id": 99326754,
        //             "price": 0.35,
        //             "avg_price": 0.35,
        //             "volume": 10,
        //             "funds_spent": 3.5,
        //             "proceeds": 0,
        //             "taker_fee_amount": "0.0455",
        //             "state": "active",
        //             "created_at": "2026-09-27T06:50:27Z"
        //         }
        //     ]
        //
        let rows: any[] = [];
        if (Array.isArray (response)) {
            rows = response;
        }
        const filtered = this.filterContractsByOutcome (rows, outcomeObj);
        return this.parsePredictionTrades (filtered, outcomeObj, since, limit);
    }

    /**
     * @method
     * @name calibri#fetchOrderTrades
     * @description fetches the fills of one order
     * @see https://docs.calibri.io/api-reference/endpoints/positions/your-contracts
     * @param {string} id the order id
     * @param {string} [outcome] not used by calibri fetchOrderTrades
     * @param {int} [since] timestamp in ms of the earliest fill
     * @param {int} [limit] the maximum number of fills to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    override async fetchOrderTrades (id: string, outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionTrade[]> {
        const request: Dict = {
            'order_id': id,
        };
        if (since !== undefined) {
            request['time_from'] = this.parseToInt (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.atlasPrivateGetAccountContracts (this.extend (request, params));
        let rows: any[] = [];
        if (Array.isArray (response)) {
            rows = response;
        }
        const filtered = this.filterContractsByOutcome (rows, undefined);
        return this.parsePredictionTrades (filtered, undefined, since, limit);
    }

    /**
     * @ignore
     * @method
     * @name calibri#filterContractsByOutcome
     * @description drops voided fills and, when an outcome is given, the fills on the other side of its market
     * @param {object[]} rows raw contract rows
     * @param {object} [outcomeObj] the outcome to keep
     * @returns {object[]} the kept rows
     */
    filterContractsByOutcome (rows: any[], outcomeObj: any = undefined): any[] {
        const result: any[] = [];
        const wantedSide = this.outcomeSide (outcomeObj);
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (this.safeString (row, 'state') === 'voided') {
                continue;
            }
            if ((wantedSide !== undefined) && (this.safeStringLower (row, 'side') !== wantedSide)) {
                continue;
            }
            result.push (row);
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name calibri#checkWalletConfig
     * @description refuses a wallet config whose chain, contracts or Safe differ from the pinned options, so nothing is signed for a contract the options do not name
     * @param {object} wallet an account/wallet or account/wallet/redeemable response
     * @returns {boolean} true
     */
    checkWalletConfig (wallet: Dict): boolean {
        const pinned: Dict = {
            'chain_id': this.numberToString (this.safeInteger (this.options, 'chainId')),
            'exchange_address': this.safeStringLower (this.options, 'exchangeAddress'),
            'conditional_tokens_address': this.safeStringLower (this.options, 'conditionalTokensAddress'),
            'usdc_address': this.safeStringLower (this.options, 'usdcAddress'),
            'domain_name': this.safeStringLower (this.options, 'ctfExchangeName'),
        };
        const keys = Object.keys (pinned);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const served = this.safeStringLower (wallet, key);
            if ((served !== undefined) && (served !== pinned[key])) {
                throw new BadResponse (this.id + ' the account wallet ' + key + ' ' + served + ' does not match the pinned ' + pinned[key] + ', refusing to sign');
            }
        }
        const proxy = this.safeStringLower (wallet, 'proxy_address');
        const configured = this.walletAddress;
        const pinsSafe = (configured !== undefined) && (configured.indexOf ('0x') === 0);
        if (pinsSafe && (proxy !== undefined) && (proxy !== configured.toLowerCase ())) {
            throw new BadResponse (this.id + ' the account Safe ' + proxy + ' is not the configured walletAddress ' + configured + ', refusing to sign');
        }
        return true;
    }

    /**
     * @ignore
     * @method
     * @name calibri#loadWallet
     * @description fetches and caches the account's signing config (exchange address, chain id, EIP-712 domain name, Safe, signature type, Safe status)
     * @see https://docs.calibri.io/non-custodial/signed-orders
     * @param {boolean} [reload] refetch even when cached
     * @returns {object} the account/wallet response
     */
    async loadWallet (reload = false): Promise<Dict> {
        const cached = this.safeDict (this.options, 'wallet');
        if (!reload && (cached !== undefined) && (this.safeString (cached, 'exchange_address') !== undefined)) {
            this.checkWalletConfig (cached);
            return cached;
        }
        const response = await this.atlasPrivateGetAccountWallet ();
        this.checkWalletConfig (response);
        //
        //     {
        //         "exchange_address": "0xA06be29A9077DA70c70601156aac9F2cE0E3b595",
        //         "conditional_tokens_address": "0x53aB2e11ea7a7e90a11F002FAa859124729611F4",
        //         "usdc_address": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        //         "chain_id": 137,
        //         "domain_name": "Calibri CTF Prediction Markets",
        //         "proxy_address": "0xFFB7Cce73cF1346EA374C276320227BeA3996AcF",
        //         "owner_address": "0x...",
        //         "signature_type": 2,
        //         "safe_status": "ready",
        //         ...
        //     }
        //
        // safe_status moves on (deposit_required -> deploying -> setup_required -> ready), so only a ready wallet is cached
        const safeStatus = this.safeString (response, 'safe_status');
        if ((safeStatus === undefined) || (safeStatus === 'ready')) {
            this.options['wallet'] = response;
        }
        return response;
    }

    /**
     * @ignore
     * @method
     * @name calibri#checkWalletForSigning
     * @description throws unless the cached wallet config and the credentials can sign an order
     * @param {object} wallet the account/wallet config
     */
    checkWalletForSigning (wallet: Dict) {
        if (this.privateKey === undefined) {
            throw new ArgumentsRequired (this.id + ' requires a privateKey to sign orders — the EOA that owns your Safe (signature type 2) or a signing key added to it (type 3)');
        }
        const safeStatus = this.safeString (wallet, 'safe_status');
        if ((safeStatus !== undefined) && (safeStatus !== 'ready')) {
            throw new AccountNotEnabled (this.id + ' the Safe is not trade-ready (safe_status ' + safeStatus + '); finish its setup before placing orders');
        }
        let proxy = this.safeString (wallet, 'proxy_address');
        if (proxy === undefined) {
            proxy = this.walletAddress;
        }
        if (proxy === undefined) {
            throw new AccountNotEnabled (this.id + ' the account has no Safe (account/wallet proxy_address is empty)');
        }
        const sigType = this.safeInteger (wallet, 'signature_type');
        if ((sigType !== 2) && (sigType !== 3)) {
            throw new NotSupported (this.id + ' cannot sign orders for signature_type ' + this.numberToString (sigType));
        }
        if (sigType === 2) {
            const owner = this.safeStringLower (wallet, 'owner_address');
            const eoa = this.ethGetAddressFromPrivateKey (this.privateKey).toLowerCase ();
            if ((owner === undefined) || (owner !== eoa)) {
                throw new AuthenticationError (this.id + ' the privateKey address ' + eoa + ' is not the owner of the Safe (' + owner + ')');
            }
        }
        return true;
    }

    /**
     * @ignore
     * @method
     * @name calibri#buildOrderRequest
     * @description builds and signs one order body for POST /account/orders (shared by createOrder, createOrders and editOrder); synchronous, no network
     * @param {object} outcomeObj the resolved outcome
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount number of shares
     * @param {float} price the limit price, or the price ceiling (buy) / floor (sell) of a market order
     * @param {object} wallet the account/wallet config
     * @param {object} [params] createOrder params
     * @returns {object} { body, request } where request echoes the submitted terms
     */
    buildOrderRequest (outcomeObj: any, type: Str, side: Str, amount: Num, price: Num, wallet: Dict, params: Dict = {}): Dict {
        if ((side !== 'buy') && (side !== 'sell')) {
            throw new InvalidOrder (this.id + ' side must be buy or sell');
        }
        if (price === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a price');
        }
        const tokenId = this.safeString (outcomeObj, 'outcomeId');
        if ((tokenId === undefined) || !this.isNumericString (tokenId)) {
            throw new BadSymbol (this.id + ' market ' + this.safeString (outcomeObj, 'marketId') + ' is not registered on-chain and cannot take signed orders');
        }
        const handle = this.safeString (outcomeObj, 'outcome') as string;
        const priceString = this.priceToPredictionPrecision (handle, this.parseNumber (price));
        const amountString = this.amountToPredictionPrecision (handle, this.parseNumber (amount));
        const isMarket = (type === 'market');
        const timeInForce = this.safeStringUpper (params, 'timeInForce');
        let ioc = this.safeBool (params, 'ioc', false);
        if (isMarket || (timeInForce === 'IOC')) {
            ioc = true;
        }
        let postOnly = this.safeBool2 (params, 'postOnly', 'post_only', false);
        if (timeInForce === 'PO') {
            postOnly = true;
        }
        if (ioc && postOnly) {
            throw new InvalidOrder (this.id + ' an order cannot be both immediate-or-cancel and post-only');
        }
        let expiration = this.safeString (params, 'expiration');
        if (expiration === undefined) {
            let lifetime = this.safeInteger (this.options, 'orderExpiration', 2592000);
            if (ioc) {
                lifetime = this.safeInteger (this.options, 'marketOrderExpiration', 120);
            }
            expiration = this.numberToString (this.sum (this.seconds (), lifetime));
        }
        const defaultSalt = this.incrementingNonce ();
        const salt = this.safeString (params, 'salt', this.numberToString (defaultSalt));
        // shares and USDC both use 6-decimal base units
        const tokenUnits = this.decimalToPrecision (Precise.stringMul (amountString, '1000000'), ROUND, 0, DECIMAL_PLACES);
        const collateralUnits = this.decimalToPrecision (Precise.stringMul (Precise.stringMul (priceString, amountString), '1000000'), ROUND, 0, DECIMAL_PLACES);
        let makerAmount = collateralUnits;
        let takerAmount = tokenUnits;
        let sideInt = 0;
        if (side === 'sell') {
            makerAmount = tokenUnits;
            takerAmount = collateralUnits;
            sideInt = 1;
        }
        const sigType = this.safeInteger (wallet, 'signature_type');
        let proxy = this.safeString (wallet, 'proxy_address');
        if (proxy === undefined) {
            proxy = this.walletAddress;
        }
        const maker = this.ethChecksumAddress (proxy);
        let signer = maker;
        if (sigType === 2) {
            signer = this.ethChecksumAddress (this.ethGetAddressFromPrivateKey (this.privateKey));
        }
        const zeroAddress = '0x0000000000000000000000000000000000000000';
        const orderMessage: Dict = {
            'salt': salt,
            'maker': maker,
            'signer': signer,
            'taker': zeroAddress,
            'tokenId': tokenId,
            'makerAmount': makerAmount,
            'takerAmount': takerAmount,
            'expiration': expiration,
            'nonce': '0',
            'feeRateBps': '0',
            'side': sideInt,
            'signatureType': sigType,
        };
        const signature = this.signCalibriOrder (orderMessage, wallet);
        const signedOrder: Dict = {
            'salt': salt,
            'maker': maker,
            'signer': signer,
            'taker': zeroAddress,
            'token_id': tokenId,
            'maker_amount': makerAmount,
            'taker_amount': takerAmount,
            'expiration': expiration,
            'nonce': '0',
            'fee_rate_bps': '0',
            'side': sideInt,
            'signature_type': sigType,
            'signature': signature,
        };
        const outcomeSide = this.outcomeSide (outcomeObj);
        const body: Dict = {
            'market_id': this.parseToInt (this.safeString (outcomeObj, 'marketId')),
            'side': outcomeSide,
            'direction': side,
            'ord_type': 'limit',
            'price': priceString,
            'volume': amountString,
            'post_only': postOnly,
            'ioc': ioc,
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            body['client_order_id'] = clientOrderId;
        }
        body['signed_order'] = signedOrder;
        const rest = this.omit (params, [ 'clientOrderId', 'client_order_id', 'timeInForce', 'ioc', 'postOnly', 'post_only', 'expiration', 'salt' ]);
        const requestEcho: Dict = {
            'market_id': this.safeString (outcomeObj, 'marketId'),
            'side': outcomeSide,
            'direction': side,
            'ord_type': 'limit',
            'price': priceString,
            'origin_volume': amountString,
            'client_order_id': clientOrderId,
            'ioc': ioc,
            'post_only': postOnly,
        };
        return {
            // body last so leftover params cannot override the signed terms
            'body': this.extend (rest, body),
            'request': requestEcho,
        };
    }

    /**
     * @ignore
     * @method
     * @name calibri#signCalibriOrder
     * @description signs an EIP-712 order, as the Safe owner EOA (signature type 2) or an added owner key (type 3)
     * @see https://docs.calibri.io/non-custodial/signed-orders
     * @param {object} orderMessage the Order struct values
     * @param {object} wallet the account/wallet config
     * @returns {string} the 65-byte signature as 0x-prefixed hex
     */
    signCalibriOrder (orderMessage: Dict, wallet: Dict): string {
        const chainIdValue = this.safeInteger (this.options, 'chainId');
        const chainIdString = this.numberToString (chainIdValue) as string;
        // the EIP-712 domain name is served by account/wallet; checkWalletConfig has already matched it against the pinned name
        const domainName = this.safeString (wallet, 'domain_name', this.safeString (this.options, 'ctfExchangeName'));
        const domainVersion = this.safeString (this.options, 'ctfExchangeVersion', '1');
        const exchangeAddress = this.ethChecksumAddress (this.safeString (this.options, 'exchangeAddress'));
        const sigType = this.safeInteger (wallet, 'signature_type');
        const orderDomain: Dict = {
            'name': domainName,
            'version': domainVersion,
            'chainId': chainIdValue,
            'verifyingContract': exchangeAddress,
        };
        const orderStruct = [
            { 'name': 'salt', 'type': 'uint256' },
            { 'name': 'maker', 'type': 'address' },
            { 'name': 'signer', 'type': 'address' },
            { 'name': 'taker', 'type': 'address' },
            { 'name': 'tokenId', 'type': 'uint256' },
            { 'name': 'makerAmount', 'type': 'uint256' },
            { 'name': 'takerAmount', 'type': 'uint256' },
            { 'name': 'expiration', 'type': 'uint256' },
            { 'name': 'nonce', 'type': 'uint256' },
            { 'name': 'feeRateBps', 'type': 'uint256' },
            { 'name': 'side', 'type': 'uint8' },
            { 'name': 'signatureType', 'type': 'uint8' },
        ];
        const encoded = this.ethEncodeStructuredData (orderDomain, { 'Order': orderStruct }, orderMessage);
        let digest: Str = undefined;
        if (this.parseToInt (sigType) === 3) {
            // signature type 3: the Safe checks isValidSignature (orderHash) against a SafeMessage digest under its own
            // domain (chainId + verifyingContract), so the owner key signs that digest
            const orderHash = this.hash (encoded, keccak, 'binary');
            const safeAddress = this.safeString (orderMessage, 'maker');
            const domainTypeHash = this.hash (this.encode ('EIP712Domain(uint256 chainId,address verifyingContract)'), keccak, 'binary');
            const domainData = this.ethAbiEncode ([ 'bytes32', 'uint256', 'address' ], [ domainTypeHash, this.convertToBigInt (chainIdString), safeAddress ]);
            const domainSeparator = this.hash (domainData, keccak, 'hex');
            const safeMessageTypeHash = this.hash (this.encode ('SafeMessage(bytes message)'), keccak, 'binary');
            // abi.encode (bytes32) is the 32 bytes themselves, so keccak (message) = keccak (orderHash)
            const messageHash = this.hash (orderHash, keccak, 'binary');
            const structData = this.ethAbiEncode ([ 'bytes32', 'bytes32' ], [ safeMessageTypeHash, messageHash ]);
            const structHash = this.hash (structData, keccak, 'hex');
            const prefixed = this.base16ToBinary ('1901' + this.remove0xPrefix (domainSeparator) + this.remove0xPrefix (structHash));
            digest = '0x' + this.hash (prefixed, keccak, 'hex');
        } else {
            digest = '0x' + this.hash (encoded, keccak, 'hex');
        }
        const sig = this.signHash (digest, this.privateKey);
        const signature = '0x' + this.remove0xPrefix (sig['r']) + this.remove0xPrefix (sig['s']) + this.intToBase16 (sig['v']);
        // lowercase: intToBase16 emits uppercase hex in some target languages
        return signature.toLowerCase ();
    }

    /**
     * @ignore
     * @method
     * @name calibri#signHash
     * @description secp256k1-signs a 32-byte digest
     * @param {string} hash the 0x-prefixed digest
     * @param {string} privateKey the private key
     * @returns {object} { r, s, v } with v in {27, 28}
     */
    signHash (hash: string, privateKey: string): Dict {
        const signature = ecdsa (hash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
        // assign before padStart so the PHP str_pad regex matches (it only handles a bare identifier)
        const rRaw = signature['r'];
        const sRaw = signature['s'];
        const r = rRaw.padStart (64, '0');
        const s = sRaw.padStart (64, '0');
        return {
            'r': '0x' + r,
            's': '0x' + s,
            'v': this.sum (27, signature['v']),
        };
    }

    /**
     * @ignore
     * @method
     * @name calibri#ethChecksumAddress
     * @description EIP-55 mixed-case checksum of an address
     * @param {string} address the address
     * @returns {string} the checksummed address
     */
    ethChecksumAddress (address: Str): string {
        const cleaned = this.remove0xPrefix (address).toLowerCase ();
        const hashHex = this.hash (this.encode (cleaned), keccak, 'hex');
        const addrChars = this.stringToCharsArray (cleaned);
        const hashChars = this.stringToCharsArray (hashHex);
        const upperNibbles = '89abcdef';
        let result = '';
        for (let i = 0; i < addrChars.length; i++) {
            const ch = addrChars[i];
            if (upperNibbles.indexOf (hashChars[i]) >= 0) {
                result = result + ch.toUpperCase ();
            } else {
                result = result + ch;
            }
        }
        return '0x' + result;
    }

    /**
     * @ignore
     * @method
     * @name calibri#marketOrderPrice
     * @description the price ceiling (buy) or floor (sell) that sweeps `amount` shares from the current book
     * @param {string} outcome the outcome handle
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount number of shares
     * @param {object} [orderbook] the outcome's book, when the caller already read it
     * @returns {float} the worst price the order needs
     */
    async marketOrderPrice (outcome: string, side: Str, amount: Num, orderbook: any = undefined): Promise<Num> {
        // a new local, not the parameter: the java port needs parameters effectively final
        let book = orderbook;
        if (book === undefined) {
            book = await this.fetchOrderBook (outcome);
        }
        let levels: any[] = [];
        if (side === 'buy') {
            levels = this.safeList (book, 'asks', []);
        } else {
            levels = this.safeList (book, 'bids', []);
        }
        const levelsLength = levels.length;
        if (levelsLength === 0) {
            throw new OrderNotFillable (this.id + ' createOrder() market ' + side + ' on ' + outcome + ' has no resting liquidity; pass a price');
        }
        let remaining = this.numberToString (amount);
        let worst: Num = undefined;
        for (let i = 0; i < levelsLength; i++) {
            const level = levels[i];
            worst = this.safeNumber (level, 0);
            remaining = Precise.stringSub (remaining, this.safeString (level, 1));
            if (!Precise.stringGt (remaining, '0')) {
                break;
            }
        }
        return worst;
    }

    /**
     * @method
     * @name calibri#createOrder
     * @description places a signed (EIP-712) order on an outcome. a market order is an immediate-or-cancel limit at a price ceiling (buy) or floor (sell) with a short expiration
     * @see https://docs.calibri.io/non-custodial/signed-orders
     * @see https://docs.calibri.io/api-reference/endpoints/trade/place-a-signed-order
     * @param {string} outcome unified outcome handle, token id or "{market_id}:yes|no"
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell' (sell offers outcome tokens you hold)
     * @param {float} amount number of shares, within the market's amount precision
     * @param {float} [price] whole-cent price 0.01-0.99; for a market order the worst acceptable price, by default the price that sweeps the current book for `amount`
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] your own id, 1-64 characters of A-Z a-z 0-9 _ -, unique for 7 days
     * @param {boolean} [params.postOnly] reject instead of taking liquidity
     * @param {string} [params.timeInForce] 'GTC', 'IOC' or 'PO'
     * @param {int} [params.expiration] signature expiry in unix seconds; defaults to now + options.orderExpiration (30 days) for resting orders and now + options.marketOrderExpiration (120 s) for IOC orders
     * @param {string} [params.salt] the order salt; pin it to reproduce a signature
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async createOrder (outcome: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Promise<PredictionOrder> {
        const outcomeObj = await this.loadOutcome (outcome);
        const wallet = await this.loadWallet ();
        this.checkWalletForSigning (wallet);
        let orderPrice = price;
        if (orderPrice === undefined) {
            if (type !== 'market') {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price for a limit order');
            }
            orderPrice = await this.marketOrderPrice (outcome, side, amount);
        }
        const built = this.buildOrderRequest (outcomeObj, type, side, amount, orderPrice, wallet, params);
        const response = await this.atlasPrivatePostAccountOrders (this.safeDict (built, 'body'));
        //
        //     {
        //         "id": 99326754,
        //         "market_id": 993715,
        //         "side": "yes",
        //         "ord_type": "limit",
        //         "price": "0.6",
        //         "state": "wait",
        //         "origin_volume": "100",
        //         "remaining_volume": "100",
        //         "filled_volume": "0",
        //         "contracts_count": 0,
        //         "locked": "60",
        //         "created_at": "2026-10-19T00:20:02Z",
        //         "updated_at": "2026-10-19T00:20:02Z"
        //     }
        //
        const enriched = this.extend (this.safeDict (built, 'request'), response);
        this.rememberOrderFrame (enriched);
        const order = this.parsePredictionOrder (enriched, outcomeObj);
        order['info'] = response;
        return order;
    }

    /**
     * @method
     * @name calibri#createOrders
     * @description places up to 20 signed orders in one request; a rejected entry comes back with status 'rejected' and the error in info
     * @see https://docs.calibri.io/non-custodial/signed-orders
     * @param {object[]} orders a list of order requests, each with outcome, type, side, amount, price and optional params (as createOrder)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async createOrders (orders: PredictionOrderRequest[], params: Dict = {}): Promise<PredictionOrder[]> {
        const ordersLength = orders.length;
        if (ordersLength > 20) {
            throw new BadRequest (this.id + ' createOrders() accepts at most 20 orders per request');
        }
        const handles: string[] = [];
        for (let i = 0; i < ordersLength; i++) {
            const handle = this.safeString (orders[i], 'outcome');
            if (handle === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrders() requires an outcome on every order');
            }
            handles.push (handle);
        }
        await this.loadOutcomes (handles);
        const wallet = await this.loadWallet ();
        this.checkWalletForSigning (wallet);
        const bodies: Dict[] = [];
        const echoes: Dict[] = [];
        const outcomeObjs: any[] = [];
        // market orders on one outcome price off one read of its book
        const books: Dict = {};
        for (let i = 0; i < ordersLength; i++) {
            const o = orders[i];
            const handle = handles[i];
            const outcomeObj = this.lookupOutcome (handle);
            const orderType = this.safeString (o, 'type', 'limit');
            const orderSide = this.safeString (o, 'side');
            const orderAmount = this.safeNumber (o, 'amount');
            let orderPrice = this.safeNumber (o, 'price');
            if (orderPrice === undefined) {
                if (orderType !== 'market') {
                    throw new ArgumentsRequired (this.id + ' createOrders() requires a price for a limit order');
                }
                if (!(handle in books)) {
                    books[handle] = await this.fetchOrderBook (handle);
                }
                orderPrice = await this.marketOrderPrice (handle, orderSide, orderAmount, books[handle]);
            }
            let orderParams = this.safeDict (o, 'params', {});
            if (this.safeString (orderParams, 'salt') === undefined) {
                const orderSalt = this.incrementingNonce ();
                orderParams = this.extend (orderParams, { 'salt': this.numberToString (orderSalt) });
            }
            const built = this.buildOrderRequest (outcomeObj, orderType, orderSide, orderAmount, orderPrice, wallet, orderParams);
            bodies.push (this.safeDict (built, 'body', {}));
            echoes.push (this.safeDict (built, 'request', {}));
            outcomeObjs.push (outcomeObj);
        }
        const request: Dict = {
            'orders': bodies,
        };
        const response = await this.atlasPrivatePostAccountOrdersBatch (this.extend (request, params));
        //
        //     [
        //         { "order": { "id": 99326754, "state": "wait", ... } },
        //         { "error": { "status": 422, "errors": [ "market.order.invalid_price_precision" ] } }
        //     ]
        //
        let rows: any[] = [];
        if (Array.isArray (response)) {
            rows = response;
        }
        const result: PredictionOrder[] = [];
        for (let i = 0; i < rows.length; i++) {
            const entry = rows[i];
            const outcomeObj = this.safeDict (outcomeObjs, i) as any;
            const echo = this.safeDict (echoes, i, {});
            const failure = this.safeDict (entry, 'error');
            if (failure !== undefined) {
                const rejected = this.parsePredictionOrder (this.extend (echo, { 'state': 'reject' }), outcomeObj);
                rejected['info'] = entry;
                result.push (rejected);
            } else {
                const raw = this.safeDict (entry, 'order', entry);
                this.rememberOrderFrame (this.extend (echo, raw));
                const parsed = this.parsePredictionOrder (this.extend (echo, raw), outcomeObj);
                parsed['info'] = entry;
                result.push (parsed);
            }
        }
        return result;
    }

    /**
     * @method
     * @name calibri#editOrder
     * @description replaces a resting order with a newly signed one (cancel and place in one request); the new order has a new id
     * @see https://docs.calibri.io/non-custodial/signed-orders
     * @param {string} id the id of the order to replace
     * @param {string} outcome unified outcome handle of the order
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the new number of shares
     * @param {float} [price] the new price
     * @param {object} [params] extra parameters specific to the exchange API endpoint (same as createOrder)
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async editOrder (id: string, outcome: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params: Dict = {}): Promise<PredictionOrder> {
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an amount — the replacement is a newly signed order');
        }
        const outcomeObj = await this.loadOutcome (outcome);
        const wallet = await this.loadWallet ();
        this.checkWalletForSigning (wallet);
        let orderPrice = price;
        if (orderPrice === undefined) {
            if (type !== 'market') {
                throw new ArgumentsRequired (this.id + ' editOrder() requires a price for a limit order');
            }
            orderPrice = await this.marketOrderPrice (outcome, side, amount);
        }
        const built = this.buildOrderRequest (outcomeObj, type, side, amount, orderPrice, wallet, params);
        const request = this.extend (this.safeDict (built, 'body'), { 'id': id });
        const response = await this.atlasPrivatePostAccountOrdersIdReplace (request);
        //
        //     { "id": 99326760, "replaced_order_id": 99326754, "state": "wait", ... }
        //
        const enriched = this.extend (this.safeDict (built, 'request'), response);
        this.rememberOrderFrame (enriched);
        const order = this.parsePredictionOrder (enriched, outcomeObj);
        order['info'] = response;
        return order;
    }

    /**
     * @method
     * @name calibri#cancelOrder
     * @description cancels one order; the response carries the order id and state only
     * @see https://docs.calibri.io/api-reference/endpoints/trade/cancel-an-order
     * @param {string} id the order id
     * @param {string} [outcome] unified outcome handle, used only to label the result
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async cancelOrder (id: string, outcome: Str = undefined, params: Dict = {}): Promise<PredictionOrder> {
        const request: Dict = {
            'id': id,
        };
        const response = await this.pythiaPrivatePostOrdersIdCancel (this.extend (request, params));
        //
        //     { "id": 99326754, "state": "cancel" }
        //
        let outcomeObj: any = undefined;
        if ((outcome !== undefined) && this.hasOutcome (outcome)) {
            outcomeObj = this.safeOutcome (outcome);
        }
        const order = this.safePredictionOrder ({
            'info': response,
            'id': this.safeString (response, 'id', id),
            'status': this.parseOrderStatus (this.safeString (response, 'state')),
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'market'),
            'event': this.safeString (outcomeObj, 'event'),
        });
        return order;
    }

    /**
     * @method
     * @name calibri#cancelOrders
     * @description cancels several orders in one request; an order that is not open any more comes back in its current state
     * @see https://docs.calibri.io/api-reference/endpoints/trade/cancel-several-orders
     * @param {string[]} ids the order ids, up to 100
     * @param {string} [outcome] unified outcome handle, used only to label the results
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure), one per id
     */
    override async cancelOrders (ids: string[], outcome: Str = undefined, params: Dict = {}): Promise<PredictionOrder[]> {
        const idsLength = ids.length;
        if (idsLength === 0) {
            return [];
        }
        if (idsLength > 100) {
            throw new BadRequest (this.id + ' cancelOrders() accepts at most 100 ids per request');
        }
        let outcomeObj: any = undefined;
        if (outcome !== undefined) {
            outcomeObj = await this.loadOutcome (outcome);
        }
        const request: Dict = {
            'ids': ids.join (','),
        };
        const response = await this.pythiaPrivatePostOrdersCancelBatch (this.extend (request, params));
        //
        //     { "cancelled": 2, "failed": 0, "total": 2, "orders": [ { "id": 1967481, "state": "cancel", ... } ] }
        //
        const cancelled: Dict = {};
        const rows = this.safeList (response, 'orders', []);
        for (let i = 0; i < rows.length; i++) {
            const parsed = this.parsePredictionOrder (rows[i], outcomeObj);
            if (parsed['status'] === undefined) {
                parsed['status'] = 'canceled';
            }
            cancelled[this.safeString (parsed, 'id') as string] = parsed;
        }
        // an id not cancelled was not open (filled, already cancelled, or not yours): one read reports where each is
        const missing: string[] = [];
        for (let i = 0; i < idsLength; i++) {
            const id = this.safeString (ids, i) as string;
            if (!(id in cancelled)) {
                missing.push (id);
            }
        }
        const others: Dict = {};
        const missingLength = missing.length;
        if (missingLength > 0) {
            const current = await this.fetchOrdersByIdsRows (missing);
            for (let i = 0; i < current.length; i++) {
                others[this.safeString (current[i], 'id') as string] = current[i];
            }
        }
        const result: PredictionOrder[] = [];
        for (let i = 0; i < idsLength; i++) {
            const id = this.safeString (ids, i) as string;
            if (id in cancelled) {
                result.push (cancelled[id]);
            } else if (id in others) {
                result.push (others[id]);
            } else {
                const unknown: Dict = { 'id': id, 'info': {}};
                result.push (this.safePredictionOrder (unknown));
            }
        }
        return result;
    }

    /**
     * @method
     * @name calibri#cancelAllOrders
     * @description cancels every open order, or those on one outcome
     * @see https://docs.calibri.io/api-reference/introduction
     * @param {string} [outcome] unified outcome handle to scope the cancellation to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure) of the cancelled orders
     */
    async cancelAllOrders (outcome: Str = undefined, params: Dict = {}): Promise<PredictionOrder[]> {
        const request: Dict = {};
        let outcomeObj: any = undefined;
        if (outcome !== undefined) {
            outcomeObj = await this.loadOutcome (outcome);
            request['market_id'] = this.safeString (outcomeObj, 'marketId');
            request['side'] = this.outcomeSide (outcomeObj);
        }
        const response = await this.pythiaPrivatePostOrdersCancel (this.extend (request, params));
        //
        //     { "cancelled": 3, "failed": 0, "total": 3, "orders": [ ... ] }
        //
        const orders = this.safeList (response, 'orders', []);
        const result: PredictionOrder[] = [];
        for (let i = 0; i < orders.length; i++) {
            const entry = orders[i];
            if (this.isDictionary (entry)) {
                const parsed = this.parsePredictionOrder (entry, outcomeObj);
                if (parsed['status'] === undefined) {
                    parsed['status'] = 'canceled';
                }
                result.push (parsed);
            } else {
                result.push (this.safePredictionOrder ({ 'id': this.safeString (orders, i), 'status': 'canceled', 'info': response }));
            }
        }
        return result;
    }

    /**
     * @method
     * @name calibri#createMarketBuyOrderWithCost
     * @description buys an outcome for at most `cost` USDC with an immediate-or-cancel order; the taker fee is charged on top of `cost`
     * @see https://docs.calibri.io/non-custodial/signed-orders
     * @param {string} outcome unified outcome handle, token id or "{market_id}:yes|no"
     * @param {float} cost the USDC to spend on shares
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async createMarketBuyOrderWithCost (outcome: string, cost: number, params: Dict = {}): Promise<PredictionOrder> {
        const outcomeObj = await this.loadOutcome (outcome);
        const handle = this.safeString (outcomeObj, 'outcome');
        const orderbook = await this.fetchOrderBook (outcome);
        const asks = this.safeList (orderbook, 'asks', []);
        const asksLength = asks.length;
        let budget: Str = this.numberToString (cost);
        let shares: Str = '0';
        let worst: Str = undefined;
        for (let i = 0; i < asksLength; i++) {
            const levelPrice = this.safeString (asks[i], 0);
            const levelAmount = this.safeString (asks[i], 1);
            const levelCost = Precise.stringMul (levelPrice, levelAmount);
            worst = levelPrice;
            if (Precise.stringGe (budget, levelCost)) {
                shares = Precise.stringAdd (shares, levelAmount);
                budget = Precise.stringSub (budget, levelCost);
            } else {
                shares = Precise.stringAdd (shares, Precise.stringDiv (budget, levelPrice, 8));
                break;
            }
        }
        if (worst === undefined) {
            throw new OrderNotFillable (this.id + ' createMarketBuyOrderWithCost() ' + handle + ' has no resting asks');
        }
        const maxShares = Precise.stringDiv (this.numberToString (cost), worst, 8);
        if (Precise.stringGt (shares, maxShares)) {
            shares = maxShares;
        }
        const amountString = this.amountToPredictionPrecision (handle, this.parseNumber (shares));
        if (!Precise.stringGt (amountString, '0')) {
            throw new InvalidOrder (this.id + ' createMarketBuyOrderWithCost() cost ' + this.numberToString (cost) + ' does not buy one share of ' + handle);
        }
        return await this.createOrder (outcome, 'market', 'buy', this.parseNumber (amountString), this.parseNumber (worst), params);
    }

    /**
     * @method
     * @name calibri#fetchOrdersByIds
     * @description fetches several orders by id in one request, whatever their state
     * @see https://docs.calibri.io/api-reference/endpoints/trade/your-orders
     * @param {string[]} ids the order ids, up to 100
     * @param {string} [outcome] not used by calibri fetchOrdersByIds
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async fetchOrdersByIds (ids: string[], outcome: Str = undefined, params: Dict = {}): Promise<PredictionOrder[]> {
        return await this.fetchOrdersByIdsRows (ids, params);
    }

    /**
     * @ignore
     * @method
     * @name calibri#fetchOrdersByIdsRows
     * @description fetchOrdersByIds without the typed result: cancelOrders reads through this, because the go port's typed PredictionOrder round trip drops each order's info
     * @param {string[]} ids the order ids, up to 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    async fetchOrdersByIdsRows (ids: string[], params: Dict = {}): Promise<any[]> {
        const idsLength = ids.length;
        if (idsLength === 0) {
            return [];
        }
        if (idsLength > 100) {
            throw new BadRequest (this.id + ' fetchOrdersByIds() accepts at most 100 ids per request');
        }
        // without a state, the server looks each id up in open orders and then in history
        const request: Dict = {
            'ids': ids.join (','),
            'limit': 100,
        };
        const response = await this.pythiaPrivateGetOrders (this.extend (request, params));
        let rows: any[] = [];
        if (Array.isArray (response)) {
            rows = response;
        }
        const byId: Dict = {};
        for (let i = 0; i < rows.length; i++) {
            const parsed = this.parsePredictionOrder (rows[i]);
            byId[this.safeString (parsed, 'id') as string] = parsed;
        }
        // in the order asked for; an id that is not yours is left out
        const result: any[] = [];
        for (let i = 0; i < idsLength; i++) {
            const id = this.safeString (ids, i) as string;
            if (id in byId) {
                result.push (byId[id]);
            }
        }
        return result;
    }

    /**
     * @method
     * @name calibri#fetchAccounts
     * @description the account the credentials belong to: one USDC account, held in the Safe
     * @see https://docs.calibri.io/non-custodial/the-safe
     * @see https://docs.calibri.io/api-reference/endpoints/wallet/ctf-wallet
     * @param {object} [params] not used by calibri fetchAccounts
     * @returns {object[]} a list of [account structures](https://docs.ccxt.com/#/?id=account-structure)
     */
    override async fetchAccounts (params: Dict = {}): Promise<Account[]> {
        const wallet = await this.loadWallet (true);
        return [
            {
                'id': this.safeString (wallet, 'proxy_address'),
                'type': 'safe',
                'code': 'USDC',
                'name': undefined,
                'info': wallet,
            } as Account,
        ];
    }

    /**
     * @method
     * @name calibri#fetchCurrencies
     * @description fetches the currencies the account can deposit and withdraw
     * @see https://docs.calibri.io/api-reference/endpoints/currencies/list-currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    override async fetchCurrencies (params: Dict = {}): Promise<Currencies> {
        const response = await this.atlasPublicGetPublicCurrencies (params);
        //
        //     [
        //         {
        //             "id": "usdc",
        //             "name": "USDC",
        //             "precision": 6,
        //             "withdraw_fee": "0",
        //             "deposit_fee": "0",
        //             "deposit_enabled": true,
        //             "withdrawal_enabled": true,
        //             "blockchain_key": "polygon",
        //             "min_withdraw_amount": "0",
        //             "min_deposit_amount": "0.01"
        //         }
        //     ]
        //
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'id');
            const code = this.safeCurrencyCode (id) as string;
            const depositEnabled = this.safeBool (currency, 'deposit_enabled');
            const withdrawEnabled = this.safeBool (currency, 'withdrawal_enabled');
            const networkId = this.safeString (currency, 'blockchain_key');
            const networks: Dict = {};
            if (networkId !== undefined) {
                const networkCode = this.networkIdToCode (networkId) as string;
                networks[networkCode] = {
                    'id': networkId,
                    'network': networkCode,
                    'active': undefined,
                    'deposit': depositEnabled,
                    'withdraw': withdrawEnabled,
                    'fee': this.safeNumber (currency, 'withdraw_fee'),
                    'precision': this.parseNumber (this.parsePrecision (this.safeString (currency, 'precision'))),
                    'limits': {
                        'deposit': { 'min': this.safeNumber (currency, 'min_deposit_amount'), 'max': undefined },
                        'withdraw': { 'min': this.safeNumber (currency, 'min_withdraw_amount'), 'max': undefined },
                    },
                    'info': currency,
                };
            }
            result[code] = this.safeCurrencyStructure ({
                'id': id,
                'code': code,
                'name': this.safeString (currency, 'name'),
                'type': 'crypto',
                'active': undefined,
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
                'fee': this.safeNumber (currency, 'withdraw_fee'),
                'precision': this.parseNumber (this.parsePrecision (this.safeString (currency, 'precision'))),
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'deposit': { 'min': this.safeNumber (currency, 'min_deposit_amount'), 'max': undefined },
                    'withdraw': { 'min': this.safeNumber (currency, 'min_withdraw_amount'), 'max': undefined },
                },
                'networks': networks,
                'info': currency,
            });
        }
        return result;
    }

    /**
     * @method
     * @name calibri#fetchDeposits
     * @description fetches the account's deposits, newest first
     * @see https://docs.calibri.io/wallet-deposits
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest deposit
     * @param {int} [limit] the maximum number of deposits to return (default 25, at most 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)
     */
    override async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Transaction[]> {
        const request: Dict = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.atlasPrivateGetAccountDeposits (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 130,
        //             "currency": "usdc",
        //             "amount": "8.112",
        //             "fee": "0",
        //             "txid": "0x7dfd9aecad65347dcddcad1b89c46821528ae958ccc126ec8e70e70e8d548996",
        //             "created_at": "2026-10-19T11:32:23Z",
        //             "type": "safe",
        //             "state": "confirmed",
        //             "blockchain_key": "polygon",
        //             "address": "0xffb7cce73cf1346ea374c276320227bea3996acf",
        //             "from_address": "0x...",
        //             "completed_at": "2026-10-19T11:32:23Z"
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit, { 'type': 'deposit' });
    }

    /**
     * @method
     * @name calibri#fetchWithdrawals
     * @description fetches the account's withdrawals, newest first
     * @see https://docs.calibri.io/non-custodial/withdrawals-to-other-networks
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest withdrawal
     * @param {int} [limit] the maximum number of withdrawals to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)
     */
    override async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Transaction[]> {
        const request: Dict = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.atlasPrivateGetAccountWithdraws (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 21,
        //             "currency": "usdc",
        //             "amount": "25",
        //             "fee": "0",
        //             "txid": "0x2f9c...",
        //             "state": "succeed",
        //             "type": "safe",
        //             "blockchain_key": "polygon",
        //             "address": "0x5b38da6a701c568545dcfcb03fcb875f56beddc4",
        //             "created_at": "2026-10-19T11:40:02Z",
        //             "updated_at": "2026-10-19T11:40:31Z",
        //             "completed_at": "2026-10-19T11:40:31Z"
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit, { 'type': 'withdrawal' });
    }

    override parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.parse8601 (this.safeString (transaction, 'created_at'));
        const updated = this.parse8601 (this.safeString2 (transaction, 'completed_at', 'updated_at'));
        const networkId = this.safeString (transaction, 'blockchain_key');
        // a withdrawal's destination is always rid; address is added only for a coin withdrawal
        const address = this.safeString2 (transaction, 'address', 'rid');
        const amount = this.safeString (transaction, 'amount');
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString2 (transaction, 'txid', 'blockchain_txid'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': this.networkIdToCode (networkId),
            'address': address,
            'addressTo': address,
            'addressFrom': this.safeString (transaction, 'from_address'),
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': undefined,
            'amount': this.parseNumber (amount),
            'currency': code,
            'status': this.parseTransactionStatus (this.safeString (transaction, 'state')),
            'updated': updated,
            'comment': undefined,
            'internal': false,
            'fee': {
                'cost': this.safeNumber (transaction, 'fee'),
                'currency': code,
            },
        } as Transaction;
    }

    parseTransactionStatus (status: Str): Str {
        const statuses: Dict = {
            'submitted': 'pending',
            'accepted': 'pending',
            'aml_processing': 'pending',
            'fee_processing': 'pending',
            'processing': 'pending',
            'prepared': 'pending',
            'under_review': 'pending',
            'confirming': 'pending',
            'pending': 'pending',
            'confirmed': 'ok',
            'collected': 'ok',
            'skipped': 'ok',
            'succeed': 'ok',
            'success': 'ok',
            'completed': 'ok',
            'failed': 'failed',
            'rejected': 'failed',
            'errored': 'failed',
            'canceled': 'canceled',
            'cancelled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name calibri#fetchLedger
     * @description fetches the account's ledger: deposits, withdrawals, trades, settlements and rewards, newest first
     * @see https://docs.calibri.io/api-reference/endpoints/account/transaction-history
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest entry
     * @param {int} [limit] the maximum number of entries to return, 1-1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.page] page number, default 1
     * @param {string} [params.type] deposit, withdraw, trade, settlement, maker_reward, referral_reward or lp_reward
     * @param {int} [params.until] timestamp in ms of the latest entry
     * @returns {object[]} a list of [ledger structures](https://docs.ccxt.com/#/?id=ledger-structure)
     */
    override async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<LedgerEntry[]> {
        const request: Dict = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['time_from'] = this.parseToInt (since / 1000);
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['time_to'] = this.parseToInt (until / 1000);
        }
        const query = this.omit (params, 'until');
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.atlasPrivateGetAccountTransactions (this.extend (request, query));
        //
        //     [
        //         {
        //             "id": 330299,
        //             "type": "trade",
        //             "reference_type": "contract",
        //             "reference_id": 245125,
        //             "credit_currency": null,
        //             "credit_amount": null,
        //             "debit_currency": "usdc",
        //             "debit_amount": "5",
        //             "fee": "0.175",
        //             "fee_currency": "usdc",
        //             "market_id": 1001288,
        //             "state": "completed",
        //             "created_at": "2026-10-19T11:32:31Z"
        //         }
        //     ]
        //
        let rows: any[] = [];
        if (Array.isArray (response)) {
            rows = response;
        }
        return this.parseLedger (rows, currency, since, limit);
    }

    override parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
        const creditAmount = this.safeString (item, 'credit_amount');
        let direction = 'out';
        let amount = this.safeString (item, 'debit_amount');
        let currencyId = this.safeString (item, 'debit_currency');
        if (creditAmount !== undefined) {
            direction = 'in';
            amount = creditAmount;
            currencyId = this.safeString (item, 'credit_currency');
        }
        const resolvedCurrency = this.safeCurrency (currencyId, currency);
        const code = this.safeString (resolvedCurrency, 'code');
        const timestamp = this.parse8601 (this.safeString (item, 'created_at'));
        return this.safeLedgerEntry ({
            'info': item,
            'id': this.safeString (item, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': direction,
            'account': undefined,
            'referenceId': this.safeString (item, 'reference_id'),
            'referenceAccount': undefined,
            'type': this.parseLedgerEntryType (this.safeString (item, 'type')),
            'currency': code,
            'amount': this.parseNumber (amount),
            'before': undefined,
            'after': undefined,
            'status': this.parseTransactionStatus (this.safeString (item, 'state')),
            'fee': {
                'cost': this.safeNumber (item, 'fee'),
                'currency': this.safeCurrencyCode (this.safeString (item, 'fee_currency')),
            },
        }, resolvedCurrency) as LedgerEntry;
    }

    parseLedgerEntryType (type: Str): Str {
        const types: Dict = {
            'deposit': 'transaction',
            'withdraw': 'transaction',
            'trade': 'trade',
            'settlement': 'settlement',
            'maker reward': 'rebate',
            'referral reward': 'referral',
            'liquidity reward': 'rebate',
            'internal_transfer': 'transfer',
        };
        return this.safeString (types, type, type);
    }

    /**
     * @method
     * @name calibri#fetchSettlements
     * @description fetches the account's settled markets: every market it held when the market resolved, including the losing ones, with the payout and the cost of the holding
     * @see https://docs.calibri.io/non-custodial/redeeming-winnings
     * @see https://docs.calibri.io/api-reference/endpoints/positions/settled-markets
     * @param {string} [outcome] unified outcome handle to filter by
     * @param {int} [since] timestamp in ms of the earliest settlement
     * @param {int} [limit] the maximum number of settlements to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of prediction settlement structures
     */
    override async fetchSettlements (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionSettlement[]> {
        let outcomeObj: any = undefined;
        if (outcome !== undefined) {
            outcomeObj = await this.loadOutcome (outcome);
        }
        const request: Dict = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.atlasPrivateGetAccountSettled (this.extend (request, params));
        //
        //     [
        //         {
        //             "market_id": 1000363,
        //             "market_title": "Will Solana trade above $500 before 18 October 2026?",
        //             "event_id": 17724,
        //             "event_slug": "solana-price-outlook-1792250154",
        //             "result": "yes",
        //             "side": "no",
        //             "volume": "19",
        //             "cost": "13.294073",
        //             "fees": "0.374073",
        //             "payout": "5",
        //             "proceeds": "0",
        //             "quote_currency": "usdc",
        //             "settled_at": "2026-10-18T15:16:00Z"
        //         }
        //     ]
        //
        const result: any[] = [];
        for (let i = 0; i < response.length; i++) {
            const settlement = this.parseSettlement (response[i]);
            if ((outcomeObj === undefined) || (this.safeString (settlement, 'outcome') === this.safeString (outcomeObj, 'outcome'))) {
                result.push (settlement);
            }
        }
        return this.filterBySinceLimit (result, since, limit, 'timestamp') as PredictionSettlement[];
    }

    /**
     * @ignore
     * @method
     * @name calibri#parseSettlement
     * @description parses one settled-market row into a prediction settlement structure
     * @param {object} settlement the settled-market row
     * @returns {object} a prediction settlement structure
     */
    parseSettlement (settlement: Dict): any {
        const marketId = this.safeString (settlement, 'market_id');
        // "both" is a member who held both outcomes of the market: there is no one outcome to name
        const side = this.safeStringLower (settlement, 'side');
        const isBoth = (side === 'both');
        let outcomeObj: any = undefined;
        if (!isBoth) {
            outcomeObj = this.resolveRowOutcome (marketId, side, undefined, undefined, settlement);
        }
        const result = this.safeStringLower (settlement, 'result');
        const timestamp = this.parse8601 (this.safeString (settlement, 'settled_at'));
        // cost is every purchase plus fees; what selling before resolution brought in is proceeds, beside the payout
        const cost = this.safeString (settlement, 'cost');
        const payout = this.safeString (settlement, 'payout');
        const proceeds = this.safeString (settlement, 'proceeds', '0');
        let price: Str = undefined;
        if (result === 'void') {
            price = '0.5';
        } else if ((result !== undefined) && !isBoth) {
            price = (result === side) ? '1' : '0';
        }
        let won: Bool = undefined;
        if (isBoth) {
            won = (payout !== undefined) && Precise.stringGt (payout, '0');
        } else if (result !== undefined) {
            won = (result === side);
        }
        let pnl: Str = undefined;
        if ((cost !== undefined) && (payout !== undefined)) {
            pnl = Precise.stringSub (Precise.stringAdd (payout, proceeds), cost);
        }
        return {
            'info': settlement,
            'id': marketId + ':' + side,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'outcome': this.safeString (outcomeObj, 'outcome'),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
            'market': this.safeString (outcomeObj, 'market', this.safeString (this.resolveRowOutcome (marketId, 'yes', undefined, undefined, settlement), 'market')),
            'event': this.shortenSlug (this.safeString (settlement, 'event_slug')),
            'result': this.safeStringUpper (settlement, 'result'),
            'won': won,
            'amount': this.safeNumber (settlement, 'volume'),
            'price': this.parseNumber (price),
            'cost': this.parseNumber (cost),
            'payout': this.parseNumber (payout),
            'pnl': this.parseNumber (pnl),
        };
    }

    /**
     * @method
     * @name calibri#approve
     * @description signs and relays the Safe's one-time setup approvals so it can trade
     * @see https://docs.calibri.io/non-custodial/the-safe
     * @see https://docs.calibri.io/api-reference/endpoints/wallet/ctf-wallet
     * @see https://docs.calibri.io/api-reference/endpoints/wallet/relay-a-safe-transaction
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} { transactions } — the relay responses, one per approval
     */
    async approve (params: Dict = {}): Promise<Dict> {
        // ?setup=1 asks for the setup batch: refused with 409 wallet.deposit_required before the first deposit,
        // wallet.deploying until the Safe exists and wallet.state_pending while a relayed transaction is not final yet
        const config = await this.atlasPrivateGetAccountWallet (this.extend ({ 'setup': 1 }, params));
        //
        //     {
        //         "exchange_address": "0xA06be29A9077DA70c70601156aac9F2cE0E3b595",
        //         "proxy_address": "0xFFB7Cce73cF1346EA374C276320227BeA3996AcF",
        //         "chain_id": 137,
        //         "signature_type": 2,
        //         "safe_status": "setup_required",
        //         "safe_setup": {
        //             "ready": false,
        //             "calls": [
        //                 { "to": "0xd092...", "data": "0x8d80ff0a...", "operation": 1, "nonce": 0, "hash": "0x9ab1..." }
        //             ]
        //         }
        //     }
        //
        this.checkWalletConfig (config);
        const setup = this.safeDict (config, 'safe_setup', {});
        const results: Dict[] = [];
        if (this.safeBool (setup, 'ready') === true) {
            return { 'transactions': results };
        }
        // a passkey wallet's setup also switches the Safe's fallback handler (a call to the Safe itself), which this
        // connector does not sign; the app's setup does both, and adding a signing key already goes through the app
        if (this.safeInteger (config, 'signature_type') === 3) {
            throw new AccountNotEnabled (this.id + ' approve() cannot set up a passkey wallet; finish wallet setup in the Calibri app (Wallet page, Finish setup), then retry');
        }
        const exchangeAddress = this.safeString (this.options, 'exchangeAddress');
        const matcherAddress = this.safeString (this.options, 'matcherAddress');
        const usdcAddress = this.safeString (this.options, 'usdcAddress');
        const ctfAddress = this.safeString (this.options, 'conditionalTokensAddress');
        // the matcher gets an unlimited allowance, so it is the pinned address and nothing else: a served matcher that
        // differs is refused rather than approved
        const servedMatcher = this.safeStringLower (config, 'matcher_address');
        if ((servedMatcher !== undefined) && (servedMatcher !== this.safeStringLower (this.options, 'matcherAddress'))) {
            throw new BadResponse (this.id + ' approve() the account wallet matcher_address ' + servedMatcher + ' does not match the pinned ' + matcherAddress + ', refusing to sign');
        }
        // the operator's allowance is set to zero, which grants nothing, so the served operator is used when there is
        // one: it follows a rotation the pin would miss
        const operatorAddress = this.safeString (config, 'operator_address', this.safeString (this.options, 'operatorAddress'));
        const maxUint = this.convertToBigInt ('115792089237316195423570985008687907853269984665640564039457584007913129639935');
        const calls: Dict[] = [
            // approve (exchange, max)
            { 'to': usdcAddress, 'data': '0x095ea7b3' + this.binaryToBase16 (this.ethAbiEncode ([ 'address', 'uint256' ], [ exchangeAddress, maxUint ])) },
            // setApprovalForAll (exchange, true)
            { 'to': ctfAddress, 'data': '0xa22cb465' + this.binaryToBase16 (this.ethAbiEncode ([ 'address', 'uint256' ], [ exchangeAddress, this.convertToBigInt ('1') ])) },
            // approve (matcher, max)
            { 'to': usdcAddress, 'data': '0x095ea7b3' + this.binaryToBase16 (this.ethAbiEncode ([ 'address', 'uint256' ], [ matcherAddress, maxUint ])) },
            // approve (operator, 0)
            { 'to': usdcAddress, 'data': '0x095ea7b3' + this.binaryToBase16 (this.ethAbiEncode ([ 'address', 'uint256' ], [ operatorAddress, this.convertToBigInt ('0') ])) },
        ];
        let nonce = await this.fetchSafeNonce (this.safeString (config, 'proxy_address'));
        this.options['wallet'] = undefined;
        for (let i = 0; i < calls.length; i++) {
            const call = this.extend (calls[i], { 'nonce': this.numberToString (nonce) });
            const relayed = await this.relaySafeCall (config, call);
            results.push (relayed);
            // the next call is signed at the next nonce, which only works once this one has executed
            const status = this.safeString (relayed, 'status');
            if (status === 'reverted') {
                throw new ExchangeError (this.id + ' approve() setup call ' + this.numberToString (i + 1) + ' of ' + this.numberToString (calls.length) + ' reverted: ' + this.json (relayed));
            }
            if (this.safeString (relayed, 'tx') === undefined) {
                // a 202: sent, outcome not known yet. The rest cannot be signed until it executes; approve () again once
                // it is final (?setup=1 answers wallet.state_pending until then), and it relays what is still missing
                throw new OperationFailed (this.id + ' approve() setup call ' + this.numberToString (i + 1) + ' of ' + this.numberToString (calls.length) + ' is still confirming; call approve() again in a moment to finish the setup: ' + this.json (relayed));
            }
            nonce = nonce + 1;
        }
        return { 'transactions': results };
    }

    /**
     * @method
     * @name calibri#redeem
     * @description redeems resolved winnings held in the Safe into USDC: signs a redeemPositions call per market and relays it gaslessly
     * @see https://docs.calibri.io/non-custodial/redeeming-winnings
     * @see https://docs.calibri.io/api-reference/endpoints/wallet/redeemable-winnings
     * @see https://docs.calibri.io/api-reference/endpoints/wallet/relay-a-safe-transaction
     * @param {string} [outcome] unified outcome handle of the resolved market to redeem; every redeemable market when omitted
     * @param {object} [params] not used by calibri redeem
     * @returns {object} { transactions } — the relay responses, one per market
     */
    async redeem (outcome: Str = undefined, params: Dict = {}): Promise<Dict> {
        let marketId: Str = undefined;
        if (outcome !== undefined) {
            const outcomeObj = await this.loadOutcome (outcome);
            marketId = this.safeString (outcomeObj, 'marketId');
        }
        const response = await this.atlasPrivateGetAccountWalletRedeemable ();
        //
        //     {
        //         "conditional_tokens_address": "0x53aB2e11ea7a7e90a11F002FAa859124729611F4",
        //         "usdc_address": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        //         "proxy_address": "0xFFB7Cce73cF1346EA374C276320227BeA3996AcF",
        //         "chain_id": 137,
        //         "signature_type": 2,
        //         "markets": [
        //             {
        //                 "market_id": 1000363,
        //                 "result": "no",
        //                 "condition_id": "0x8f3a...",
        //                 "redeemable": "19",
        //                 "settled_at": "2026-10-18T15:15:00Z"
        //             }
        //         ]
        //     }
        //
        const markets = this.safeList (response, 'markets', []);
        const wanted: any[] = [];
        for (let i = 0; i < markets.length; i++) {
            if ((marketId === undefined) || (this.safeString (markets[i], 'market_id') === marketId)) {
                wanted.push (markets[i]);
            }
        }
        const results: Dict[] = [];
        const wantedLength = wanted.length;
        if (wantedLength === 0) {
            return { 'transactions': results };
        }
        this.checkWalletConfig (response);
        let nonce = await this.fetchSafeNonce (this.safeString (response, 'proxy_address'));
        const ctf = this.safeString (this.options, 'conditionalTokensAddress');
        const usdc = this.remove0xPrefix (this.safeStringLower (this.options, 'usdcAddress'));
        for (let i = 0; i < wantedLength; i++) {
            const conditionId = this.remove0xPrefix (this.safeStringLower (wanted[i], 'condition_id'));
            // redeemPositions (collateral, parentCollectionId = 0, conditionId, indexSets = [1, 2])
            const zeroWord = '0000000000000000000000000000000000000000000000000000000000000000';
            const indexSets = '0000000000000000000000000000000000000000000000000000000000000080' + '0000000000000000000000000000000000000000000000000000000000000002' + '0000000000000000000000000000000000000000000000000000000000000001' + '0000000000000000000000000000000000000000000000000000000000000002';
            const data = '0x01b7037c' + '000000000000000000000000' + usdc + zeroWord + conditionId + indexSets;
            const call: Dict = { 'to': ctf, 'data': data, 'nonce': this.numberToString (nonce) };
            const relayed = await this.relaySafeCall (response, call);
            results.push (this.extend ({ 'market_id': this.safeString (wanted[i], 'market_id') }, relayed));
            // the next redemption is signed at the next nonce, which only works once this one has executed
            if ((this.safeString (relayed, 'status') === 'reverted') || (this.safeString (relayed, 'tx') === undefined)) {
                break;
            }
            nonce = nonce + 1;
        }
        return { 'transactions': results };
    }

    /**
     * @ignore
     * @method
     * @name calibri#fetchSafeNonce
     * @description the nonce to sign the Safe's next transaction at
     * @see https://docs.calibri.io/api-reference/endpoints/wallet/relay-a-safe-transaction
     * @param {string} safe the Safe address
     * @returns {int} the nonce
     */
    async fetchSafeNonce (safe: Str): Promise<number> {
        const request: Dict = {};
        if (safe !== undefined) {
            request['safe'] = safe;
        }
        const response = await this.atlasPrivateGetAccountWalletNonce (request);
        //
        //     { "safe": "0xFFB7Cce73cF1346EA374C276320227BeA3996AcF", "nonce": "3" }
        //
        const nonce = this.safeInteger (response, 'nonce');
        if (nonce === undefined) {
            throw new BadResponse (this.id + ' account/wallet/nonce answered without a nonce: ' + this.json (response));
        }
        return nonce;
    }

    /**
     * @ignore
     * @method
     * @name calibri#relaySafeCall
     * @description signs one Safe transaction with the owner key and relays it through the account's wallet relay
     * @param {object} wallet a wallet config carrying proxy_address and chain_id
     * @param {object} call { to, data, operation, nonce }
     * @returns {object} the relay response
     */
    async relaySafeCall (wallet: Dict, call: Dict): Promise<Dict> {
        if (this.privateKey === undefined) {
            throw new ArgumentsRequired (this.id + ' requires a privateKey (an owner of the Safe) to sign Safe transactions');
        }
        const safe = this.ethChecksumAddress (this.safeString (wallet, 'proxy_address'));
        const to = this.ethChecksumAddress (this.safeString (call, 'to'));
        const targets = [ this.safeStringLower (this.options, 'usdcAddress'), this.safeStringLower (this.options, 'conditionalTokensAddress') ];
        if (!this.inArray (to.toLowerCase (), targets)) {
            throw new BadRequest (this.id + ' refusing to sign a Safe transaction to ' + to + ', which is not the pinned USDC or ConditionalTokens contract');
        }
        const data = this.safeString (call, 'data');
        const nonce = this.safeString (call, 'nonce');
        const zeroAddress = '0x0000000000000000000000000000000000000000';
        const domain: Dict = {
            'chainId': this.safeInteger (this.options, 'chainId'),
            'verifyingContract': safe,
        };
        const safeTxStruct = [
            { 'name': 'to', 'type': 'address' },
            { 'name': 'value', 'type': 'uint256' },
            { 'name': 'data', 'type': 'bytes' },
            { 'name': 'operation', 'type': 'uint8' },
            { 'name': 'safeTxGas', 'type': 'uint256' },
            { 'name': 'baseGas', 'type': 'uint256' },
            { 'name': 'gasPrice', 'type': 'uint256' },
            { 'name': 'gasToken', 'type': 'address' },
            { 'name': 'refundReceiver', 'type': 'address' },
            { 'name': 'nonce', 'type': 'uint256' },
        ];
        const message: Dict = {
            'to': to,
            'value': '0',
            'data': data,
            'operation': 0,
            'safeTxGas': '0',
            'baseGas': '0',
            'gasPrice': '0',
            'gasToken': zeroAddress,
            'refundReceiver': zeroAddress,
            'nonce': nonce,
        };
        const encoded = this.ethEncodeStructuredData (domain, { 'SafeTx': safeTxStruct }, message);
        const digest = '0x' + this.hash (encoded, keccak, 'hex');
        const sig = this.signHash (digest, this.privateKey);
        const signature = '0x' + this.remove0xPrefix (sig['r']) + this.remove0xPrefix (sig['s']) + this.intToBase16 (sig['v']);
        const request: Dict = {
            'safe': safe,
            'to': to,
            'value': '0',
            'data': data,
            'operation': 0,
            'signature': signature.toLowerCase (),
            // the nonce the signature was made at; a signature over a different nonce is refused with 422 relay.nonce_mismatch
            'nonce': nonce,
        };
        const response = await this.atlasPrivatePostAccountWalletRelay (request);
        //
        //     { "tx": "0x979a3c3b3d05e78ff0607ff27b97138bef3f1b2214bbd88eee6e3b65795c8075", "status": "mined", "state": "pending", "relay_id": "1842" }
        //
        // a 202 (sent, outcome not known yet) wraps its body in data
        //
        //     { "data": { "relay_id": "1842", "state": "pending", "tx": null } }
        //
        return this.safeDict (response, 'data', response);
    }

    override nonce (): int {
        // the HMAC nonce must be within 10 s of server time; timeDifference corrects a skewed clock
        return this.milliseconds () - this.safeInteger (this.options, 'timeDifference', 0);
    }

    override handleErrors (code: Int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined;
        }
        //
        //     { "errors": [ "market.order.invalid_price_precision" ] }
        //     { "errors": [ "Another transaction from your wallet is still confirming. Try again in a moment." ], "code": "relay.nonce_in_use" }
        //
        const errors = this.safeList (response, 'errors');
        if (errors === undefined) {
            return undefined;
        }
        const errorsLength = errors.length;
        if (errorsLength === 0) {
            return undefined;
        }
        const feedback = this.id + ' ' + body;
        // a coded refusal carries a sentence in errors and its code beside it
        const errorCode = this.safeString (response, 'code');
        if (errorCode !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
        for (let i = 0; i < errorsLength; i++) {
            const message = this.safeString (errors, i);
            if (message !== undefined) {
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            }
        }
        throw new ExchangeError (feedback);
    }

    /**
     * @ignore
     * @method
     * @name calibri#sign
     * @description builds the request url and, for private endpoints, the HMAC-SHA256 X-Auth headers
     * @see https://docs.calibri.io/api-reference/authentication
     * @param {string} path the endpoint path
     * @param {string[]} api the api section and access level
     * @param {string} method the http method
     * @param {object} params the request parameters
     * @returns {object} a dict with url, method, body and headers
     */
    override sign (path: string, api: string[] = [ 'pythia' ], method: string = 'GET', params: Dict = {}) {
        const service = api[0];
        const access = this.safeString (api, 1, 'public');
        const query = this.omit (params, this.extractParams (path));
        let requestPath = '/api/' + this.version + '/' + service + '/' + this.implodeParams (path, params);
        if (service === 'platform') {
            requestPath = '/api/' + this.version + '/' + this.implodeParams (path, params);
        }
        let requestBody: Str = undefined;
        // the two cancel routes take their filters and ids on the query string even though they are POSTs
        const queryOnPost = (path === 'orders/cancel') || (path === 'orders/cancel/batch');
        if ((method === 'GET') || queryOnPost) {
            const queryString = this.urlencode (query);
            if (queryString !== '') {
                requestPath = requestPath + '?' + queryString;
            }
        } else if (method === 'POST') {
            const queryKeys = Object.keys (query);
            const queryKeysLength = queryKeys.length;
            if (queryKeysLength > 0) {
                requestBody = this.json (query);
            }
        }
        const url = this.urls['api']['rest'] + requestPath;
        let requestHeaders: Dict = {
            'Accept': 'application/json',
        };
        if (requestBody !== undefined) {
            requestHeaders['Content-Type'] = 'application/json';
        }
        if (access === 'private') {
            this.checkRequiredCredentials ();
            const nonceString = this.incrementingNonce ().toString ();
            let auth = nonceString + this.apiKey + method + requestPath;
            if (requestBody !== undefined) {
                auth = auth + requestBody;
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256, 'hex');
            requestHeaders = this.extend (requestHeaders, {
                'X-Auth-Apikey': this.apiKey,
                'X-Auth-Nonce': nonceString,
                'X-Auth-Signature': signature,
            });
        }
        return { 'url': url, 'method': method, 'body': requestBody, 'headers': requestHeaders };
    }

    override ping (client: any) {
        return 'ping';
    }

    /**
     * @ignore
     * @method
     * @name calibri#watchStream
     * @description subscribes to one stream; with credentials every stream rides the authenticated connection, which has no lifetime cap
     * @see https://docs.calibri.io/api-reference/websockets
     * @param {string} stream the stream name, e.g. "12.ob-inc" or "order"
     * @param {string} messageHash the hash the result resolves under
     * @param {boolean} [isPrivate] the stream needs an authenticated connection
     * @returns {object} the resolved value
     */
    async watchStream (stream: string, messageHash: string, isPrivate = false): Promise<any> {
        const url = this.wsUrl (isPrivate);
        const request: Dict = {
            'event': 'subscribe',
            'streams': [ stream ],
        };
        return await this.watch (url, messageHash, request, stream);
    }

    /**
     * @ignore
     * @method
     * @name calibri#wsUrl
     * @description the websocket url to use, creating the authenticated client when credentials are set
     * @param {boolean} [isPrivate] the stream needs an authenticated connection
     * @returns {string} the url
     */
    wsUrl (isPrivate = false): string {
        if (isPrivate) {
            this.checkRequiredCredentials ();
        }
        const base = this.urls['api']['ws'];
        let url = base + '/public';
        const hasCredentials = (this.apiKey !== undefined) && (this.secret !== undefined);
        if (isPrivate || hasCredentials) {
            url = base + '/private';
            this.authenticate (url);
        }
        return url;
    }

    /**
     * @ignore
     * @method
     * @name calibri#authenticate
     * @description signs the upgrade of the next authenticated connection: the upgrade request carries the same HMAC headers as a signed GET
     * @see https://docs.calibri.io/api-reference/websockets
     * @param {string} url the private websocket url
     */
    authenticate (url: string) {
        if ((this.clients !== undefined) && (url in this.clients)) {
            return;
        }
        this.checkRequiredCredentials ();
        const path = '/api/' + this.version + '/websocket/private';
        const nonceString = this.nonce ().toString ();
        const auth = nonceString + this.apiKey + 'GET' + path;
        const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256, 'hex');
        const headers: Dict = {
            'X-Auth-Apikey': this.apiKey,
            'X-Auth-Nonce': nonceString,
            'X-Auth-Signature': signature,
        };
        // the client is not created here: watch () creates it, and only a client it creates itself gets the reconnect
        // backoff. The headers wait in the shared ws options for that, and a fresh nonce replaces them before each new
        // connection; every stream rides this connection once credentials are set, so no public client picks them up
        const ws = this.safeDict (this.options, 'ws', {});
        const clientOptions = this.extend (this.safeDict (ws, 'options', {}), { 'headers': headers });
        this.options['ws'] = this.extend (ws, { 'options': clientOptions });
    }

    override handleTextMessage (client: any, message: string) {
        // the gateway answers a text ping with a text frame, so the client's onPong never fires:
        // refresh lastPong here, or the keepalive times the connection out after maxPingPongMisses
        client.lastPong = this.milliseconds ();
    }

    override handleMessage (client: any, message: Dict) {
        //
        //     { "12.ob-inc": { "bids": [ [ "0.6", "0" ] ], "sequence": 9713, "timestamp": 1795000124 } }
        //     { "order": { "id": 173757, "market_id": 12, "side": "yes", "state": "wait", ... } }
        //     { "success": { "message": "subscribed", "streams": [ "12.ob-inc", "order" ] } }
        //
        const keys = Object.keys (message);
        for (let i = 0; i < keys.length; i++) {
            const stream = keys[i];
            const data = message[stream];
            if (stream === 'error') {
                this.handleWsError (client, message);
            } else if (stream === 'order') {
                this.handleOrder (client, data);
            } else if (stream === 'contract') {
                this.handleMyTrade (client, data);
            } else if (stream === 'position') {
                this.handlePosition (client, data);
            } else if (stream.indexOf ('.') >= 0) {
                const parts = stream.split ('.');
                const marketId = this.safeString (parts, 0);
                const channel = this.safeString (parts, 1, '');
                if ((channel === 'ob-snap') || (channel === 'ob-inc')) {
                    this.handleOrderBook (client, marketId, stream, channel, data);
                } else if (channel === 'trades') {
                    this.handleTrade (client, marketId, this.safeDict (data, 'trade', data));
                } else if (channel === 'ticker') {
                    this.handleTicker (client, marketId, data);
                } else if (channel.indexOf ('kline-') === 0) {
                    this.handleOHLCV (client, marketId, channel.slice (6), data);
                }
            }
        }
    }

    handleWsError (client: any, message: Dict) {
        //
        //     { "error": { "message": "unknown stream" } }
        //
        const error = this.safeDict (message, 'error', {});
        const text = this.safeString (error, 'message', this.json (error));
        client.reject (new ExchangeError (this.id + ' ' + text));
    }

    /**
     * @ignore
     * @method
     * @name calibri#marketOutcomes
     * @description the cached YES and NO outcomes of one market
     * @param {string} marketId the market id
     * @returns {object[]} [ yes, no ]
     */
    marketOutcomes (marketId: Str): any[] {
        return [
            this.resolveRowOutcome (marketId, 'yes', undefined),
            this.resolveRowOutcome (marketId, 'no', undefined),
        ];
    }

    /**
     * @method
     * @name calibri#watchOrderBook
     * @description streams the order book of an outcome
     * @see https://docs.calibri.io/api-reference/websockets
     * @param {string} outcome unified outcome handle, token id or "{market_id}:yes|no"
     * @param {int} [limit] not used by calibri watchOrderBook
     * @param {object} [params] not used by calibri watchOrderBook
     * @returns {object} a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)
     */
    override async watchOrderBook (outcome: string, limit: Int = undefined, params: Dict = {}): Promise<PredictionOrderBook> {
        const outcomeObj = await this.loadOutcome (outcome);
        const handle = this.safeString (outcomeObj, 'outcome') as string;
        const stream = this.safeString (outcomeObj, 'marketId') + '.ob-inc';
        // one stream carries both books and only a subscribe delivers the snapshot; the other side may already be built
        // looked up, not created: a client created here would skip the reconnect backoff watch () applies to its own
        const client: Client = this.safeValue (this.clients, this.wsUrl ());
        const resync = this.safeDict (this.options, 'wsBooksResync', {});
        if (this.safeBool (resync, stream) === true) {
            delete resync[stream];
            this.options['wsBooksResync'] = resync;
            if (client !== undefined) {
                const unsubscribe: Dict = {
                    'event': 'unsubscribe',
                    'streams': [ stream ],
                };
                try {
                    await client.send (unsubscribe);
                } catch (e) {
                    // a socket still connecting holds no subscription to drop; the subscribe below goes out once it opens
                    delete client.subscriptions[stream];
                }
            }
        }
        const returned = this.safeDict (this.options, 'wsBooksReturned', {});
        let orderbook: any = undefined;
        const subscribed = (client !== undefined) && (this.safeValue (client.subscriptions, stream) !== undefined);
        if (subscribed && (handle in this.orderbooks) && !(handle in returned)) {
            orderbook = this.orderbooks[handle];
        } else {
            orderbook = await this.watchStream (stream, 'orderbook::' + handle);
        }
        returned[handle] = true;
        this.options['wsBooksReturned'] = returned;
        return orderbook.limit ();
    }

    handleOrderBook (client: any, marketId: Str, stream: string, channel: string, data: Dict) {
        //
        //     { "bids": [ [ "0.6", "100" ] ], "asks": [ [ "0.63", "25" ] ], "sequence": 9712, "timestamp": 1795000123 }
        //
        const outcomes = this.marketOutcomes (marketId);
        const yesHandle = this.safeString (outcomes[0], 'outcome');
        const noHandle = this.safeString (outcomes[1], 'outcome');
        if ((yesHandle === undefined) || (noHandle === undefined)) {
            return;
        }
        if (channel === 'ob-inc') {
            if (!(yesHandle in this.orderbooks)) {
                return;
            }
            const orderbook = this.orderbooks[yesHandle];
            const previous = this.safeInteger (orderbook, 'nonce');
            const sequence = this.safeInteger (data, 'sequence');
            // a repeated sequence is applied, not treated as a gap: levels carry absolute volumes, so applying one twice is
            // harmless, and a snapshot can share its sequence with the increment after it
            if ((previous !== undefined) && (sequence !== undefined) && ((sequence > previous + 1) || (sequence < previous))) {
                // a skipped sequence leaves the book stale, and a lower one means the engine restarted its counter; the
                // server sends nothing for a repeated subscribe, so the next watchOrderBook unsubscribes first and then
                // subscribes for a fresh snapshot
                delete this.orderbooks[yesHandle];
                delete this.orderbooks[noHandle];
                delete client.subscriptions[stream];
                const resync = this.safeDict (this.options, 'wsBooksResync', {});
                resync[stream] = true;
                this.options['wsBooksResync'] = resync;
                const returned = this.safeDict (this.options, 'wsBooksReturned', {});
                delete returned[yesHandle];
                delete returned[noHandle];
                const error = new InvalidNonce (this.id + ' order book ' + stream + ' skipped from sequence ' + this.numberToString (previous) + ' to ' + this.numberToString (sequence));
                client.reject (error, 'orderbook::' + yesHandle);
                client.reject (error, 'orderbook::' + noHandle);
                return;
            }
        }
        for (let i = 0; i < outcomes.length; i++) {
            this.applyOrderBookFrame (client, outcomes[i], channel, data);
        }
    }

    applyOrderBookFrame (client: any, outcomeObj: Dict, channel: string, data: Dict) {
        const handle = this.safeString (outcomeObj, 'outcome') as string;
        const isNo = (this.outcomeSide (outcomeObj) === 'no');
        const sequence = this.safeInteger (data, 'sequence');
        const timestamp = this.safeTimestamp (data, 'timestamp');
        let rawBids = this.safeList (data, 'bids', []);
        let rawAsks = this.safeList (data, 'asks', []);
        if (isNo) {
            rawBids = this.safeList (data, 'asks', []);
            rawAsks = this.safeList (data, 'bids', []);
        }
        const bids: any[] = [];
        for (let i = 0; i < rawBids.length; i++) {
            let price = this.safeString (rawBids[i], 0);
            if (isNo) {
                price = this.complementPrice (price);
            }
            bids.push ([ this.parseNumber (price), this.safeNumber (rawBids[i], 1) ]);
        }
        const asks: any[] = [];
        for (let i = 0; i < rawAsks.length; i++) {
            let price = this.safeString (rawAsks[i], 0);
            if (isNo) {
                price = this.complementPrice (price);
            }
            asks.push ([ this.parseNumber (price), this.safeNumber (rawAsks[i], 1) ]);
        }
        if (channel === 'ob-snap') {
            this.orderbooks[handle] = this.orderBook ({});
        } else if (!(handle in this.orderbooks)) {
            return;
        }
        const orderbook = this.orderbooks[handle];
        if (channel === 'ob-snap') {
            orderbook.reset ({
                'bids': bids,
                'asks': asks,
                'nonce': sequence,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'outcome': handle,
                'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
                'market': this.safeString (outcomeObj, 'market'),
            });
            client.resolve (orderbook, 'orderbook::' + handle);
            return;
        }
        for (let i = 0; i < bids.length; i++) {
            const bookSide = orderbook['bids'];
            bookSide.storeArray (bids[i]);
        }
        for (let i = 0; i < asks.length; i++) {
            const bookSide = orderbook['asks'];
            bookSide.storeArray (asks[i]);
        }
        orderbook['nonce'] = sequence;
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        client.resolve (orderbook, 'orderbook::' + handle);
    }

    /**
     * @method
     * @name calibri#watchTrades
     * @description streams the public trades of an outcome
     * @see https://docs.calibri.io/api-reference/websockets
     * @param {string} outcome unified outcome handle, token id or "{market_id}:yes|no"
     * @param {int} [since] timestamp in ms of the earliest trade
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] not used by calibri watchTrades
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    override async watchTrades (outcome: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionTrade[]> {
        const outcomeObj = await this.loadOutcome (outcome);
        const handle = this.safeString (outcomeObj, 'outcome');
        const stream = this.safeString (outcomeObj, 'marketId') + '.trades';
        const trades = await this.watchStream (stream, 'trades::' + handle);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = trades.getLimit (handle, limitResolved);
        }
        return this.filterBySinceLimit (trades, since, limitResolved, 'timestamp', true);
    }

    handleTrade (client: any, marketId: Str, data: Dict) {
        //
        //     { "id": 244869, "market_id": 12, "price": "0.35", "volume": "3", "taker_side": "yes", "created_at": "2026-09-27T06:50:27Z" }
        //
        const outcomes = this.marketOutcomes (marketId);
        if (this.trades === undefined) {
            this.trades = {};
        }
        for (let i = 0; i < outcomes.length; i++) {
            const outcomeObj = outcomes[i];
            const handle = this.safeString (outcomeObj, 'outcome');
            if (handle === undefined) {
                continue;
            }
            let stored = this.safeValue (this.trades, handle);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                // keyed by outcome: the c# plain cache counts updates by symbol, which a prediction trade does not carry
                stored = new ArrayCacheByOutcomeById (limit);
                this.trades[handle] = stored;
            }
            stored.append (this.parsePredictionTrade (data, outcomeObj));
            client.resolve (stored, 'trades::' + handle);
        }
    }

    /**
     * @method
     * @name calibri#watchTicker
     * @description streams the 24h ticker of an outcome
     * @see https://docs.calibri.io/api-reference/websockets
     * @param {string} outcome unified outcome handle, token id or "{market_id}:yes|no"
     * @param {object} [params] not used by calibri watchTicker
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    override async watchTicker (outcome: string, params: Dict = {}): Promise<PredictionTicker> {
        const outcomeObj = await this.loadOutcome (outcome);
        const handle = this.safeString (outcomeObj, 'outcome');
        const stream = this.safeString (outcomeObj, 'marketId') + '.ticker';
        return await this.watchStream (stream, 'ticker::' + handle);
    }

    /**
     * @method
     * @name calibri#watchTickers
     * @description streams the 24h tickers of several outcomes
     * @see https://docs.calibri.io/api-reference/websockets
     * @param {string[]} outcomes unified outcome handles
     * @param {object} [params] not used by calibri watchTickers
     * @returns {object} a dictionary of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure) keyed by outcome
     */
    override async watchTickers (outcomes: Strings = undefined, params: Dict = {}): Promise<PredictionTickers> {
        if (outcomes === undefined) {
            throw new ArgumentsRequired (this.id + ' watchTickers() requires a list of outcomes');
        }
        const url = this.wsUrl ();
        const messageHashes: string[] = [];
        const streams: string[] = [];
        const handles: string[] = [];
        for (let i = 0; i < outcomes.length; i++) {
            const outcomeObj = await this.loadOutcome (outcomes[i]);
            const handle = this.safeString (outcomeObj, 'outcome') as string;
            handles.push (handle);
            messageHashes.push ('ticker::' + handle);
            streams.push (this.safeString (outcomeObj, 'marketId') + '.ticker');
        }
        const request: Dict = {
            'event': 'subscribe',
            'streams': streams,
        };
        const ticker = await this.watchMultiple (url, messageHashes, request, streams);
        if (this.newUpdates) {
            const result: Dict = {};
            result[this.safeString (ticker, 'outcome') as string] = ticker;
            return result as PredictionTickers;
        }
        return this.filterByArray (this.tickers, 'outcome', handles) as PredictionTickers;
    }

    handleTicker (client: any, marketId: Str, data: Dict) {
        //
        //     { "timestamp": 1795000123, "ticker": { "buy": "0.58", "sell": "0.68", "last": "0.62", "volume": "1500.25", ... } }
        //
        const outcomes = this.marketOutcomes (marketId);
        for (let i = 0; i < outcomes.length; i++) {
            const outcomeObj = outcomes[i];
            const handle = this.safeString (outcomeObj, 'outcome');
            if (handle === undefined) {
                continue;
            }
            const ticker = this.parsePredictionTicker (data, outcomeObj);
            this.tickers[handle] = ticker as any;
            client.resolve (ticker, 'ticker::' + handle);
        }
    }

    /**
     * @method
     * @name calibri#watchOHLCV
     * @description streams the candles of an outcome
     * @see https://docs.calibri.io/api-reference/websockets
     * @param {string} outcome unified outcome handle, token id or "{market_id}:yes|no"
     * @param {string} [timeframe] the candle length, 1m to 1w
     * @param {int} [since] timestamp in ms of the earliest candle
     * @param {int} [limit] the maximum number of candles to return
     * @param {object} [params] not used by calibri watchOHLCV
     * @returns {int[][]} a list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async watchOHLCV (outcome: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        if (!(timeframe in this.timeframes)) {
            throw new BadRequest (this.id + ' watchOHLCV() does not support timeframe ' + timeframe);
        }
        const outcomeObj = await this.loadOutcome (outcome);
        const handle = this.safeString (outcomeObj, 'outcome');
        const stream = this.safeString (outcomeObj, 'marketId') + '.kline-' + timeframe;
        const ohlcv = await this.watchStream (stream, 'ohlcv::' + handle + '::' + timeframe);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = ohlcv.getLimit (handle, limitResolved);
        }
        return this.filterBySinceLimit (ohlcv, since, limitResolved, 0, true);
    }

    handleOHLCV (client: any, marketId: Str, timeframe: string, data: any) {
        //
        //     [ 1795000000, 0.6, 0.7, 0.58, 0.65, 240 ]
        //
        const outcomes = this.marketOutcomes (marketId);
        for (let i = 0; i < outcomes.length; i++) {
            const outcomeObj = outcomes[i];
            const handle = this.safeString (outcomeObj, 'outcome');
            if (handle === undefined) {
                continue;
            }
            const candle = this.parseCalibriCandle (data, this.outcomeSide (outcomeObj, 'yes'));
            if (!(handle in this.ohlcvs)) {
                this.ohlcvs[handle] = {};
            }
            let stored = this.safeValue (this.ohlcvs[handle], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[handle][timeframe] = stored;
            }
            stored.append (candle);
            client.resolve (stored, 'ohlcv::' + handle + '::' + timeframe);
        }
    }

    /**
     * @method
     * @name calibri#watchOrders
     * @description streams the account's order updates
     * @see https://docs.calibri.io/api-reference/websockets
     * @param {string} [outcome] unified outcome handle to filter by
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] not used by calibri watchOrders
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    override async watchOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionOrder[]> {
        let messageHash = 'orders';
        let handle: Str = undefined;
        if (outcome !== undefined) {
            const outcomeObj = await this.loadOutcome (outcome);
            handle = this.safeString (outcomeObj, 'outcome');
            messageHash = 'orders::' + handle;
        }
        const orders = await this.watchStream ('order', messageHash, true);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = orders.getLimit (handle, limitResolved);
        }
        return this.filterByOutcomeSinceLimit (orders, handle, since, limitResolved, true);
    }

    /**
     * @ignore
     * @method
     * @name calibri#rememberOrderFrame
     * @description keeps the price, size and type of an order placed over REST so watchOrders can complete its fill frames
     * @param {object} raw the order as placed
     */
    rememberOrderFrame (raw: Dict) {
        if ((this.orders === undefined) || !this.safeBool (this.options, 'ordersByOutcome', false)) {
            return;
        }
        const id = this.safeString (raw, 'id');
        const state = this.safeString (raw, 'state');
        if ((id === undefined) || (state === 'done') || (state === 'cancel') || (state === 'reject')) {
            return;
        }
        const keys = [ 'id', 'market_id', 'token_id', 'side', 'direction', 'price', 'origin_volume', 'ord_type', 'client_order_id', 'post_only', 'ioc', 'created_at' ];
        const known: Dict = {};
        for (let i = 0; i < keys.length; i++) {
            const value = this.safeValue (raw, keys[i]);
            if (value !== undefined) {
                known[keys[i]] = value;
            }
        }
        const seen = this.safeDict (this.options, 'wsOrderFrames', {});
        // a frame that already arrived is newer than the placement reply
        seen[id] = this.extend (known, this.safeDict (seen, id, {}));
        this.options['wsOrderFrames'] = seen;
    }

    handleOrder (client: any, data: Dict) {
        //
        //     {
        //         "id": 173757,
        //         "market_id": 12,
        //         "side": "yes",
        //         "direction": "buy",
        //         "state": "wait",
        //         "remaining_volume": "40",
        //         "contracts_count": 2,
        //         "updated_at": "2026-08-07T08:47:03Z"
        //     }
        //
        // the flag, not undefined: the go base creates a symbol-keyed orders cache up front
        if ((this.orders === undefined) || !this.safeBool (this.options, 'ordersByOutcome', false)) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheByOutcomeById (limit);
            this.options['ordersByOutcome'] = true;
        }
        // order updates contain only changed fields
        const id = this.safeString (data, 'id') as string;
        const seen = this.safeDict (this.options, 'wsOrderFrames', {});
        const merged = this.extend (this.safeDict (seen, id, {}), data);
        seen[id] = merged;
        const state = this.safeString (merged, 'state');
        if ((state === 'done') || (state === 'cancel') || (state === 'reject')) {
            delete seen[id];
        }
        this.options['wsOrderFrames'] = seen;
        const outcomeObj = this.resolveRowOutcome (this.safeString (merged, 'market_id'), this.safeStringLower (merged, 'side'), undefined, this.safeString (merged, 'token_id'), merged);
        const order = this.parsePredictionOrder (merged, outcomeObj);
        const stored = this.orders;
        stored.append (order);
        client.resolve (stored, 'orders');
        const handle = this.safeString (order, 'outcome');
        if (handle !== undefined) {
            client.resolve (stored, 'orders::' + handle);
        }
    }

    /**
     * @method
     * @name calibri#watchMyTrades
     * @description streams the account's fills
     * @see https://docs.calibri.io/api-reference/websockets
     * @param {string} [outcome] unified outcome handle to filter by
     * @param {int} [since] timestamp in ms of the earliest fill
     * @param {int} [limit] the maximum number of fills to return
     * @param {object} [params] not used by calibri watchMyTrades
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    override async watchMyTrades (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionTrade[]> {
        let messageHash = 'myTrades';
        let handle: Str = undefined;
        if (outcome !== undefined) {
            const outcomeObj = await this.loadOutcome (outcome);
            handle = this.safeString (outcomeObj, 'outcome');
            messageHash = 'myTrades::' + handle;
        }
        const trades = await this.watchStream ('contract', messageHash, true);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = trades.getLimit (handle, limitResolved);
        }
        return this.filterByOutcomeSinceLimit (trades, handle, since, limitResolved, true);
    }

    handleMyTrade (client: any, data: Dict) {
        //
        //     {
        //         "id": 41276,
        //         "market_id": 12,
        //         "order_id": 173757,
        //         "side": "yes",
        //         "direction": "buy",
        //         "taker_or_maker": "taker",
        //         "fee": "0.0168",
        //         "price": "0.56",
        //         "volume": "1",
        //         "state": "active",
        //         "created_at": "2026-08-07T08:47:03Z"
        //     }
        //
        if (this.safeString (data, 'direction') === undefined) {
            return;
        }
        if ((this.myTrades === undefined) || !this.safeBool (this.options, 'myTradesByOutcome', false)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheByOutcomeById (limit);
            this.options['myTradesByOutcome'] = true;
        }
        const trade = this.parsePredictionTrade (data);
        const stored = this.myTrades;
        stored.append (trade);
        client.resolve (stored, 'myTrades');
        const handle = this.safeString (trade, 'outcome');
        if (handle !== undefined) {
            client.resolve (stored, 'myTrades::' + handle);
        }
    }

    /**
     * @method
     * @name calibri#watchPositions
     * @description streams the account's positions, one update per change to a holding
     * @see https://docs.calibri.io/api-reference/websockets
     * @param {string[]} [outcomes] unified outcome handles to filter by
     * @param {int} [since] timestamp in ms of the earliest update
     * @param {int} [limit] the maximum number of positions to return
     * @param {object} [params] not used by calibri watchPositions
     * @returns {object[]} a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    override async watchPositions (outcomes: Strings = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<PredictionPosition[]> {
        let handles: Strings = undefined;
        if (outcomes !== undefined) {
            handles = [];
            for (let i = 0; i < outcomes.length; i++) {
                const outcomeObj = await this.loadOutcome (outcomes[i]);
                handles.push (this.safeString (outcomeObj, 'outcome') as string);
            }
        }
        const newPositions = await this.watchStream ('position', 'positions', true);
        if (this.newUpdates) {
            return this.filterByOutcomesSinceLimit (newPositions, handles, since, limit, true) as PredictionPosition[];
        }
        return this.filterByOutcomesSinceLimit (this.positions, handles, since, limit, true) as PredictionPosition[];
    }

    handlePosition (client: any, data: Dict) {
        //
        //     {
        //         "market_id": 12,
        //         "side": "yes",
        //         "volume": "100",
        //         "locked_volume": "0",
        //         "sellable_volume": "100",
        //         "avg_price": "0.6",
        //         "realized_pnl": "0",
        //         "updated_at": "2026-08-07T08:46:59Z"
        //     }
        //
        if (this.positions === undefined) {
            const limit = this.safeInteger (this.options, 'positionsLimit', 1000);
            this.positions = new ArrayCacheByOutcomeById (limit);
        }
        const position = this.parsePredictionPosition (data);
        const stored = this.positions;
        stored.append (position);
        client.resolve ([ position ], 'positions');
    }
}
