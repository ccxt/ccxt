/// <reference lib="es2015" />
// ---------------------------------------------------------------------------
//
// Myriad Protocol CCXT Exchange adapter  (https://myriad.markets)
//
// Hierarchy:  Questions (events) → Markets (multi-chain, multi-outcome)
//
// Each market becomes one CCXT market with an outcomes list:
//   market.id:     {networkId}:{marketId}
//   market.symbol: SLUG_SHORT
//   outcomes[i].symbol: SLUG_SHORT:OUTCOME_LABEL
//
// Supports Abstract (2741), Linea (59144), BNB Chain (56).
//
// ---------------------------------------------------------------------------

import { keccak_256 as keccak } from '@noble/hashes/sha3.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import Exchange from '../abstract/prediction/myriad.js';
import { ecdsa } from '../base/functions/crypto.js';
import { ArrayCache, ArrayCacheByOutcomeById } from '../base/ws/Cache.js';
import type {
    Int, Str, Num, Dict, int,
    Strings, OrderRequest,
    Market, PredictionOrderBook, OHLCV, PredictionTradingFee,
    PredictionEvent, Balances, fetchEventsParams,
    PredictionTicker, PredictionTickers, PredictionOrder, PredictionTrade, PredictionPosition,
} from '../base/types.js';
import { Precise } from '../base/Precise.js';
import { ArgumentsRequired, NotSupported, ExchangeError, InvalidOrder, InsufficientFunds, OrderNotFound, BadSymbol, AuthenticationError, RateLimitExceeded } from '../../ccxt.js';

// ---------------------------------------------------------------------------

/**
 * @class myriad
 * @augments Exchange
 */
export default class myriad extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'myriad',
            'name': 'Myriad',
            'countries': [],
            'rateLimit': 200,
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'createOrders': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchEvent': true,
                'fetchEvents': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'prediction': true,
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
                // Myriad maps timeframes to price_chart bucket keys
                '1m': '24h',
                '5m': '24h',
                '15m': '7d',
                '1h': '7d',
                '6h': '30d',
                '1d': '30d',
            },
            'urls': {
                'logo': 'https://myriad.markets/favicon.ico',
                'api': {
                    'myriad': 'https://api-v2.myriadprotocol.com',
                    'ws': 'wss://ws.myriadprotocol.com/ws',
                },
                'test': {
                    'myriad': 'https://api-v2.staging.myriadprotocol.com',
                    'ws': 'wss://ws.staging.myriadprotocol.com/ws',
                },
                'www': 'https://myriad.markets',
                'doc': [ 'https://docs.myriad.markets' ],
            },
            'api': {
                'myriad': {
                    'public': {
                        'get': {
                            'questions': 1,
                            'questions/{id}': 1,
                            'markets': 1,
                            'markets/{id}': 1,
                            'markets/{networkId}/{id}': 1,
                            'markets/{id}/events': 1,
                            'markets/{id}/orderbook': 1,
                            'markets/{id}/trades': 1,
                            'markets/{id}/holders': 1,
                            'markets/{id}/referrals': 1,
                            'events': 1,
                            'orders': 1,
                            'orders/{hash}': 1,
                            'users/{address}/events': 1,
                            'users/{address}/referrals': 1,
                            'users/{address}/portfolio': 1,
                            'users/{address}/markets': 1,
                            'tags': 1,
                            'topics': 1,
                        },
                        'post': {
                            'markets/quote': 1,
                            'markets/claim': 1,
                            'orders': 1,
                            'orders/cancel-batch': 1,
                            'orders/cancel-all': 1,
                            'positions/split': 1,
                            'positions/merge': 1,
                            'positions/redeem': 1,
                            'positions/redeem-voided': 1,
                            'positions/neg-risk/split': 1,
                            'positions/neg-risk/merge': 1,
                        },
                        'delete': {
                            'orders/{hash}': 1,
                        },
                    },
                    'private': {
                        'post': {
                            'markets/quote_with_fee': 1,
                        },
                    },
                },
            },
            'requiredCredentials': {
                // apiKey is the optional x-api-key header (higher rate limits); trading needs the privateKey
                'apiKey': false,
                'secret': false,
                'walletAddress': false,
                'privateKey': true,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.01,
                    'taker': 0.01,
                },
            },
            'exceptions': {
                'exact': {
                    'Order not found': OrderNotFound,
                    'Market not found': BadSymbol,
                    'Invalid order payload': InvalidOrder,
                },
                'broad': {
                    'Insufficient': InsufficientFunds,
                    'allowance': InsufficientFunds,
                    'not found': OrderNotFound,
                    'Unauthorized': AuthenticationError,
                    'Forbidden': AuthenticationError,
                    'rate limit': RateLimitExceeded,
                    'Too many requests': RateLimitExceeded,
                    'expired': InvalidOrder,
                    'closed': InvalidOrder,
                    'resolved': InvalidOrder,
                    'Invalid': InvalidOrder,
                },
            },
            'options': {
                'defaultFetchMarketsLimit': 50,
                'defaultFetchEventsLimit': 50,
                'defaultMarketStatus': 'open',   // 'open' | 'closed' | 'resolved'
                'defaultTradingModel': 'all',    // 'amm' | 'ob' | 'all' — markets listing includes both models
                // network used for order-book trading when a market does not pin one (OB lives on BNB Chain)
                'defaultNetworkId': '56',
                // EIP-712 domain for order-book order/cancel signing (gasless CLOB)
                'obDomainName': 'MyriadCTFExchange',
                'obDomainVersion': '1',
                'networks': {
                    '2741': 'Abstract',
                    '59144': 'Linea',
                    '56': 'BNB Chain',
                },
                // on-chain config per network id (= chain id); predictionMarket settles the AMM path,
                // obExchangeAddress is the EIP-712 verifyingContract for the gasless order book.
                // rpcUrl can be overridden via params.rpcUrl or options.chains[networkId].rpcUrl
                'chains': {
                    '56': { 'rpcUrl': 'https://bsc-dataseed.binance.org/', 'predictionMarket': '0x39E66eE6b2ddaf4DEfDEd3038E0162180dbeF340', 'obExchangeAddress': '0xa0b6f8ef8EdB64f395018D1933f2273Ce9f0f16A', 'obConditionalTokens': '0x6413734f92248D4B29ae35883290BD93212654Dc', 'collateralToken': '0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d', 'collateralCurrency': 'USD1', 'collateralDecimals': 18 },
                    '2741': { 'rpcUrl': 'https://api.mainnet.abs.xyz', 'predictionMarket': '0x3e0F5F8F5Fb043aBFA475C0308417Bf72c463289' },
                    '59144': { 'rpcUrl': 'https://rpc.linea.build', 'predictionMarket': '0x39e66ee6b2ddaf4defded3038e0162180dbef340' },
                },
            },
        });
    }

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
    async fetchMarkets (params = {}): Promise<Market[]> {
        const queries = this.parseSearchQueries (params) as any[];
        const rest = this.omit (params, [ 'query', 'queries' ]);
        const queriesLength = queries.length;
        let rawMarkets: any[] = [];
        if (queriesLength > 0) {
            rawMarkets = await this.fetchRawMarketsBySearch (queries, rest);
        } else {
            rawMarkets = await this.fetchRawMarketsList (rest);
        }
        const flatMarkets: Market[] = [];
        const eventsDict: Dict = {};
        for (let i = 0; i < rawMarkets.length; i++) {
            const raw = rawMarkets[i];
            const m = this.parseMyriadMarket (raw);
            flatMarkets.push (m);
            const ev = this.parseMarketToEvent (raw, m);
            const evKey = this.safeString (ev, 'event');
            if (evKey !== undefined) {
                eventsDict[evKey] = ev;
            }
        }
        this.events = eventsDict;
        return flatMarkets;
    }

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
    async fetchRawMarketsBySearch (queries: any[], params = {}): Promise<any[]> {
        const limit = this.safeInteger (params, 'limit', this.safeInteger (this.options, 'defaultFetchEventsLimit', 50));
        const state = this.safeString (params, 'state', this.safeString (this.options, 'defaultMarketStatus', 'open'));
        const rest = this.omit (params, [ 'limit', 'state' ]);
        const seen: Dict = {};
        const rawMarkets: any[] = [];
        for (let i = 0; i < queries.length; i++) {
            const q = queries[i];
            const response = await this.myriadPublicGetMarkets (this.extend ({
                'keyword': q,
                'state': state,
                'limit': limit,
            }, rest));
            const foundList = this.safeList (response, 'data', response as any);
            const found = (foundList !== undefined) ? foundList : [];
            for (let j = 0; j < found.length; j++) {
                const raw = found[j];
                const networkId = this.safeString (raw, 'networkId');
                const marketId = this.safeString (raw, 'id');
                const key = networkId + ':' + marketId;
                if (!(key in seen)) {
                    seen[key] = true;
                    rawMarkets.push (raw);
                }
            }
        }
        return rawMarkets;
    }

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
    async fetchRawMarketsList (params = {}): Promise<any[]> {
        const limit = this.safeInteger (this.options, 'defaultFetchMarketsLimit', 50);
        // scope the listing: without a search query loadMarkets would otherwise page through
        // every open myriad market. Cap the total number of markets collected.
        const maxMarkets = this.safeInteger (params, 'limit', this.safeInteger (this.options, 'fetchMarketsLimit', 1000));
        const state = this.safeString2 (params, 'state', 'status', this.safeString (this.options, 'defaultMarketStatus', 'open'));
        // include both AMM and order-book markets so order-book trading methods can resolve their markets
        const tradingModel = this.safeString2 (params, 'tradingModel', 'trading_model', this.safeString (this.options, 'defaultTradingModel', 'all'));
        const rest = this.omit (params, [ 'state', 'status', 'limit', 'tradingModel', 'trading_model' ]);
        const allRawMarkets: any[] = [];
        // track the running count with an explicit counter (avoids inline array .length / .slice,
        // which the regex transpiler otherwise mistakes for string strlen()/mb_substr())
        let collected = 0;
        let page = 1;
        while (true) {
            const response = await this.myriadPublicGetMarkets (this.extend ({
                'state': state,
                'limit': limit,
                'page': page,
                'trading_model': tradingModel,
            }, rest));
            const rawMarketsList = this.safeList (response, 'data', response as any);
            const rawMarkets = (rawMarketsList !== undefined) ? rawMarketsList : [];
            const rawMarketsLength = rawMarkets.length;
            if (rawMarketsLength === 0) {
                break;
            }
            for (let i = 0; i < rawMarketsLength; i++) {
                if (collected < maxMarkets) {
                    allRawMarkets.push (rawMarkets[i]);
                    collected = this.sum (collected, 1);
                }
            }
            page = this.sum (page, 1);
            if (rawMarketsLength < limit || collected >= maxMarkets) {
                break;
            }
        }
        return allRawMarkets;
    }

    /**
     * @method
     * @name myriad#fetchEvent
     * @description fetches a single prediction-market event by its market id
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string} id the market id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    async fetchEvent (id: string, params = {}): Promise<PredictionEvent> {
        // the unified event id is a composite networkId:marketId
        const parts = id.split (':');
        const partsLength = parts.length;
        const request: Dict = {};
        if (partsLength > 1) {
            request['network_id'] = this.safeString (parts, 0);
            request['id'] = this.safeString (parts, 1);
        } else {
            request['id'] = id;
        }
        const response = await this.myriadPublicGetMarketsId (this.extend (request, params));
        const market = this.parseMyriadMarket (response);
        const event: any = this.parseMarketToEvent (response, market);
        return event;
    }

    /**
     * @method
     * @name myriad#fetchPositions
     * @description fetch the open outcome-token positions held by a wallet (myriad settles trades on-chain, so only read-only portfolio data is exposed by the API)
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string[]} [outcomes] unified outcomes to filter by
     * @param {object} [params] extra exchange-specific parameters
     * @param {string} [params.address] the wallet address to query, defaults to this.walletAddress
     * @returns {object[]} a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    async fetchPositions (outcomes: Strings = undefined, params = {}): Promise<PredictionPosition[]> {
        const address = this.safeString2 (params, 'address', 'user', this.walletAddress);
        if (address === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchPositions() requires a walletAddress or an address parameter');
        }
        const rest = this.omit (params, [ 'address', 'user' ]);
        const response = await this.myriadPublicGetUsersAddressPortfolio (this.extend ({ 'address': address }, rest));
        const data = this.safeList (response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            result.push (this.parsePosition (data[i]));
        }
        return this.filterByArrayPositions (result, 'outcome', outcomes, false) as PredictionPosition[];
    }

    /**
     * @ignore
     * @method
     * @name myriad#parsePosition
     * @description parses a raw myriad portfolio entry into a unified position structure
     * @param {object} position the raw portfolio entry
     * @param {object} [market] not used by myriad
     * @returns {object} a [position structure](https://docs.ccxt.com/#/?id=position-structure)
     */
    parsePosition (position: Dict, market: Market = undefined): PredictionPosition {
        const marketSlug = this.safeString (position, 'marketSlug', '');
        const outcomeTitle = this.safeString (position, 'outcomeTitle', '');
        const outcome = this.slugToOutcomeSymbol (marketSlug, marketSlug, outcomeTitle);
        const marketSymbol = this.slugToMarketSymbol (marketSlug, marketSlug);
        const networkId = this.safeString (position, 'networkId');
        const marketId = this.safeString (position, 'marketId');
        const outcomeId = this.safeString (position, 'outcomeId');
        const id = networkId + ':' + marketId + '/' + outcomeId;
        const shares = this.safeNumber (position, 'shares');
        const value = this.safeNumber (position, 'value');
        const profit = this.safeNumber (position, 'profit');
        const roi = this.safeNumber (position, 'roi');
        let percentage: Num = undefined;
        if (roi !== undefined) {
            percentage = roi * 100;
        }
        return this.safePredictionPosition ({
            'info': position,
            'id': id,
            'outcome': outcome,
            'outcomeId': outcomeId,
            'label': outcomeTitle,
            'market': marketSymbol,
            'contracts': shares,
            'side': 'long',
            'notional': value,
            'markPrice': this.safeNumber (position, 'price'),
            'unrealizedPnl': profit,
            'percentage': percentage,
            'marginMode': 'cash',
            'hedged': false,
        });
    }

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
    async fetchTradeQuote (outcome: string, side: string, amount: number, params = {}): Promise<Dict> {
        this.checkEvents (outcome);
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const networkId = this.safeString (info, 'networkId');
        const marketId = this.safeString (info, 'marketId');
        const outcomeId = this.safeInteger (info, 'outcomeId');
        const sideStr = (side as string).toLowerCase ();
        const request: Dict = {
            'market_id': this.parseToInt (marketId),
            'network_id': this.parseToInt (networkId),
            'outcome_id': outcomeId,
            'action': sideStr,
            'slippage': this.safeNumber (params, 'slippage', 0.005),
        };
        if (sideStr === 'buy') {
            request['value'] = amount;
        } else {
            request['shares'] = amount;
        }
        const rest = this.omit (params, [ 'slippage' ]);
        const response = await this.myriadPublicPostMarketsQuote (this.extend (request, rest));
        return this.parseTradeQuote (response, outcomeObj as any);
    }

    /**
     * @ignore
     * @method
     * @name myriad#parseTradeQuote
     * @description parses a raw myriad quote response into a unified-ish quote object
     * @param {object} quote the raw quote response
     * @param {object} [market] the outcome the quote belongs to
     * @returns {object} a quote object
     */
    parseTradeQuote (quote: Dict, market: any = undefined): Dict {
        return {
            'outcome': this.safeString (market, 'outcome'),
            'side': this.safeStringLower (quote, 'action'),
            'value': this.safeNumber (quote, 'value'),
            'shares': this.safeNumber (quote, 'shares'),
            'sharesThreshold': this.safeNumber (quote, 'shares_threshold'),
            'priceAverage': this.safeNumber (quote, 'price_average'),
            'priceBefore': this.safeNumber (quote, 'price_before'),
            'priceAfter': this.safeNumber (quote, 'price_after'),
            'netAmount': this.safeNumber (quote, 'net_amount'),
            'fees': this.safeDict (quote, 'fees'),
            'calldata': this.safeString (quote, 'calldata'),
            'info': quote,
        };
    }

    rlpEncodeBytes (hex: string): string {
        // RLP-encodes a single byte string (hex without 0x) per the Ethereum RLP spec
        const byteLength = this.parseToInt (hex.length / 2);
        if (byteLength === 0) {
            return '80';
        }
        if ((byteLength === 1) && (hex < '80')) {
            return hex;
        }
        if (byteLength < 56) {
            return this.intToBase16 (128 + byteLength) + hex;
        }
        let lengthHex = this.intToBase16 (byteLength);
        if ((lengthHex.length % 2) !== 0) {
            lengthHex = '0' + lengthHex;
        }
        const lengthOfLength = this.parseToInt (lengthHex.length / 2);
        return this.intToBase16 (183 + lengthOfLength) + lengthHex + hex;
    }

    rlpEncodeList (items: string[]): string {
        let concatenated = '';
        for (let i = 0; i < items.length; i++) {
            concatenated = concatenated + items[i];
        }
        const byteLength = this.parseToInt (concatenated.length / 2);
        if (byteLength < 56) {
            return this.intToBase16 (192 + byteLength) + concatenated;
        }
        let lengthHex = this.intToBase16 (byteLength);
        if ((lengthHex.length % 2) !== 0) {
            lengthHex = '0' + lengthHex;
        }
        const lengthOfLength = this.parseToInt (lengthHex.length / 2);
        return this.intToBase16 (247 + lengthOfLength) + lengthHex + concatenated;
    }

    intToRlpHex (value: number): string {
        // an integer as its minimal big-endian byte hex; 0 is the empty byte string
        if (value === 0) {
            return '';
        }
        let hex = this.intToBase16 (value);
        if ((hex.length % 2) !== 0) {
            hex = '0' + hex;
        }
        return hex;
    }

    hexToRlpBytes (hexValue: string): string {
        // a hex value (e.g. an RPC result) as minimal big-endian byte hex; leading zero bytes
        // are stripped and 0 becomes the empty byte string (RLP integer encoding)
        let h = this.remove0xPrefix (hexValue);
        let start = 0;
        const total = h.length;
        while ((start < total) && (h.slice (start, start + 1) === '0')) {
            start = start + 1;
        }
        h = h.slice (start);
        if (h === '') {
            return '';
        }
        if ((h.length % 2) !== 0) {
            h = '0' + h;
        }
        return h;
    }

    signEvmTransaction (tx: Dict, privateKey: string): string {
        // builds and signs an EIP-1559 (type 0x02) transaction, returning the signed raw tx hex.
        // tx fields (nonce/gas/fees/value) are hex strings; chainId is an int. Verified
        // byte-identical to ethers' serialization
        const accessList = this.rlpEncodeList ([]);
        const fields = [
            this.rlpEncodeBytes (this.intToRlpHex (this.safeInteger (tx, 'chainId'))),
            this.rlpEncodeBytes (this.hexToRlpBytes (this.safeString (tx, 'nonce'))),
            this.rlpEncodeBytes (this.hexToRlpBytes (this.safeString (tx, 'maxPriorityFeePerGas'))),
            this.rlpEncodeBytes (this.hexToRlpBytes (this.safeString (tx, 'maxFeePerGas'))),
            this.rlpEncodeBytes (this.hexToRlpBytes (this.safeString (tx, 'gasLimit'))),
            this.rlpEncodeBytes (this.remove0xPrefix (this.safeString (tx, 'to'))),
            this.rlpEncodeBytes (this.hexToRlpBytes (this.safeString (tx, 'value', '0x0'))),
            this.rlpEncodeBytes (this.remove0xPrefix (this.safeString (tx, 'data', '0x'))),
            accessList,
        ];
        const payload = '02' + this.rlpEncodeList (fields);
        const hashHex = this.hash (this.base16ToBinary (payload), keccak, 'hex');
        const signature = ecdsa (hashHex, this.remove0xPrefix (privateKey), secp256k1, undefined);
        let rHex = this.safeString (signature, 'r');
        let sHex = this.safeString (signature, 's');
        if ((rHex.length % 2) !== 0) {
            rHex = '0' + rHex;
        }
        if ((sHex.length % 2) !== 0) {
            sHex = '0' + sHex;
        }
        const yParity = this.safeInteger (signature, 'v');
        const signedFields = [];
        for (let i = 0; i < fields.length; i++) {
            signedFields.push (fields[i]);
        }
        signedFields.push (this.rlpEncodeBytes (this.intToRlpHex (yParity)));
        signedFields.push (this.rlpEncodeBytes (rHex));
        signedFields.push (this.rlpEncodeBytes (sHex));
        return '0x02' + this.rlpEncodeList (signedFields);
    }

    async ethRpc (rpcUrl: string, method: string, rpcParams: any[]) {
        const payload: Dict = { 'jsonrpc': '2.0', 'id': 1, 'method': method, 'params': rpcParams };
        const headers: Dict = { 'Content-Type': 'application/json' };
        const response = await this.fetch (rpcUrl, 'POST', headers, this.json (payload));
        const rpcError = this.safeValue (response, 'error');
        if (rpcError !== undefined) {
            throw new ExchangeError (this.id + ' rpc ' + method + ' error: ' + this.json (rpcError));
        }
        return this.safeString (response, 'result');
    }

    padHexAddress (address: string): string {
        // left-pads a 20-byte address to a 32-byte ABI word (24 leading zero bytes)
        const stripped = this.remove0xPrefix (address);
        return '000000000000000000000000' + stripped;
    }

    async sendEvmTransaction (rpcUrl: string, networkId: string, fromAddress: string, to: string, value: string, data: string, gasLimit: string): Promise<string> {
        const nonce = await this.ethRpc (rpcUrl, 'eth_getTransactionCount', [ fromAddress, 'pending' ]);
        const gasPrice = await this.ethRpc (rpcUrl, 'eth_gasPrice', []);
        const tx: Dict = {
            'chainId': this.parseToInt (networkId),
            'nonce': nonce,
            'maxPriorityFeePerGas': gasPrice,
            'maxFeePerGas': gasPrice,
            'gasLimit': gasLimit,
            'to': to,
            'value': value,
            'data': data,
        };
        const signed = this.signEvmTransaction (tx, this.privateKey);
        return await this.ethRpc (rpcUrl, 'eth_sendRawTransaction', [ signed ]);
    }

    async waitForTransactionReceipt (rpcUrl: string, txHash: string, timeout = 60000): Promise<Dict> {
        const start = this.milliseconds ();
        while ((this.milliseconds () - start) < timeout) {
            const receipt = await this.ethRpc (rpcUrl, 'eth_getTransactionReceipt', [ txHash ]);
            if ((receipt !== undefined) && (receipt !== null)) {
                return receipt as any;
            }
            await this.sleep (2000);
        }
        throw new ExchangeError (this.id + ' transaction ' + txHash + ' not mined within timeout');
    }

    async ensureErc20Allowance (rpcUrl: string, networkId: string, token: string, owner: string, spender: string): Promise<any> {
        // allowance(owner, spender)
        const allowanceData = '0xdd62ed3e' + this.padHexAddress (owner) + this.padHexAddress (spender);
        const current = await this.ethRpc (rpcUrl, 'eth_call', [ { 'to': token, 'data': allowanceData }, 'latest' ]);
        const trimmed = this.hexToRlpBytes (current);
        // a max-approved allowance is ~32 bytes (64 nibbles); anything much smaller needs (re)approval
        if (trimmed.length >= 50) {
            return undefined;
        }
        // approve(spender, maxUint256)
        const maxUint = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
        const approveData = '0x095ea7b3' + this.padHexAddress (spender) + maxUint;
        const approveHash = await this.sendEvmTransaction (rpcUrl, networkId, owner, token, '0x0', approveData, '0x186a0');
        await this.waitForTransactionReceipt (rpcUrl, approveHash);
        return undefined;
    }

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
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async createOrder (outcome: string, type: Str, side: Str, amount: Num, price: Num = undefined, params = {}): Promise<PredictionOrder> {
        this.ensureOutcomesLoaded ();
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const defaultModel = this.safeString (info, 'tradingModel', 'amm');
        const tradingModel = this.safeStringLower (params, 'tradingModel', defaultModel);
        const rest = this.omit (params, [ 'tradingModel' ]);
        if (tradingModel === 'ob') {
            return await this.createOrderbookOrder (outcome, type, side, amount, price, rest);
        }
        // the on-chain AMM path requires native gas and has not been verified end to end; keep it behind
        // an explicit opt-in so callers do not silently hit an untested signing/broadcast path
        const enableAmm = this.safeBool2 (params, 'enableAmm', 'enableAmmOrders', this.safeBool (this.options, 'enableAmmOrders', false));
        if (!enableAmm) {
            throw new NotSupported (this.id + ' createOrder() only supports the gasless order book; this market uses the on-chain AMM (needs native gas and is unverified) — pass params.enableAmm=true to opt in');
        }
        return await this.createAmmOrder (outcome, type, side, amount, price, this.omit (rest, [ 'enableAmm', 'enableAmmOrders' ]));
    }

    /**
     * @ignore
     * @method
     * @name myriad#createOrderbookOrder
     * @description signs an EIP-712 order and posts it to the gasless order book; the operator settles the match on-chain
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async createOrderbookOrder (outcome: string, type: Str, side: Str, amount: Num, price: Num = undefined, params = {}): Promise<PredictionOrder> {
        const built = this.buildOrderbookOrder (outcome, type, side, amount, price, params);
        const order = this.safeDict (built, 'order');
        const networkId = this.safeString (built, 'networkId');
        const timeInForce = this.safeString (built, 'timeInForce');
        const request: Dict = {
            'order': order,
            'signature': this.safeString (built, 'signature'),
            'network_id': this.parseToInt (networkId),
            'time_in_force': timeInForce,
        };
        const response = await this.myriadPublicPostOrders (request);
        const wrapper = this.extend (response, { 'order': order, 'networkId': networkId, 'timeInForce': timeInForce });
        const outcomeObj = this.outcome (outcome);
        const parsed = this.parseOrder (wrapper, outcomeObj as any);
        // the POST /orders response is minimal (hash + status), so backfill the known request values
        // (side/type/price/amount/timeInForce and a creation timestamp) when parseOrder left them empty
        const sideStr = (side === undefined) ? undefined : (side as string).toLowerCase ();
        const typeStr = (type === undefined) ? 'limit' : (type as string).toLowerCase ();
        if (this.safeString (parsed, 'side') === undefined) {
            parsed['side'] = sideStr;
        }
        if (this.safeString (parsed, 'type') === undefined) {
            parsed['type'] = typeStr;
        }
        if (this.safeString (parsed, 'timeInForce') === undefined) {
            parsed['timeInForce'] = timeInForce;
        }
        if ((this.safeNumber (parsed, 'price') === undefined) && (price !== undefined)) {
            parsed['price'] = price;
        }
        if ((this.safeNumber (parsed, 'amount') === undefined) && (amount !== undefined)) {
            parsed['amount'] = amount;
        }
        if (this.safeInteger (parsed, 'timestamp') === undefined) {
            const now = this.milliseconds ();
            parsed['timestamp'] = now;
            parsed['datetime'] = this.iso8601 (now);
        }
        if (this.safeString (parsed, 'status') === undefined) {
            parsed['status'] = 'open';
        }
        return parsed;
    }

    /**
     * @ignore
     * @method
     * @name myriad#buildOrderbookOrder
     * @description builds and EIP-712 signs a single order-book order; shared by createOrder and createOrders
     * @returns {object} a dict with the signed order, signature, timeInForce and networkId
     */
    buildOrderbookOrder (outcome: string, type: Str, side: Str, amount: Num, price: Num = undefined, params = {}): Dict {
        if (this.privateKey === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a privateKey to sign the order');
        }
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const networkId = this.safeString (info, 'networkId', this.safeString (this.options, 'defaultNetworkId', '56'));
        const marketId = this.safeString (info, 'marketId');
        const outcomeId = this.safeInteger (info, 'outcomeId', 0);
        const trader = this.ethGetAddressFromPrivateKey (this.privateKey);
        const typeStr = (type === undefined) ? 'limit' : (type as string).toLowerCase ();
        const sideStr = (side as string).toLowerCase ();
        const sideInt = (sideStr === 'buy') ? 0 : 1;
        const isMarket = (typeStr === 'market');
        const defaultTif = isMarket ? 'FOK' : 'GTC';
        const timeInForce = this.safeStringUpper (params, 'timeInForce', defaultTif);
        let priceValue = price;
        if (priceValue === undefined) {
            if (isMarket) {
                priceValue = (sideInt === 0) ? 1 : 0;
            } else {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price for limit orders');
            }
        }
        let priceWei = this.toOrderbookWei (priceValue);
        if (Precise.stringLt (priceWei, '1')) {
            priceWei = '1';
        }
        // price is a fraction in (0, 1] encoded as 1..1e18 wei (tick is 1 wei); reject out-of-range early
        if (Precise.stringGt (priceWei, '1000000000000000000')) {
            throw new InvalidOrder (this.id + ' createOrder() price must be a fraction between 0 and 1');
        }
        const amountWei = this.toOrderbookWei (amount);
        // shares are integer wei (1e18 = 1 share); a sub-wei amount that rounds to zero is invalid
        if (Precise.stringLt (amountWei, '1')) {
            throw new InvalidOrder (this.id + ' createOrder() amount is too small (rounds to zero shares)');
        }
        const nonce = this.safeString (params, 'nonce', this.numberToString (this.milliseconds ()));
        const expiration = this.safeString (params, 'expiration', '0');
        const minFillAmount = this.safeString (params, 'minFillAmount', '0');
        const order: Dict = {
            'trader': trader,
            'marketId': marketId,
            'outcomeId': outcomeId,
            'side': sideInt,
            'amount': amountWei,
            'price': priceWei,
            'minFillAmount': minFillAmount,
            'nonce': nonce,
            'expiration': expiration,
        };
        const signature = this.signClobOrder (order, networkId);
        return {
            'order': order,
            'signature': signature,
            'timeInForce': timeInForce,
            'networkId': networkId,
        };
    }

    /**
     * @method
     * @name myriad#createOrders
     * @description places multiple order book orders. Myriad's batch endpoint is not reliable, so the
     * orders are signed and submitted sequentially (not atomically)
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da8281e2bc49cf4914b07528
     * @param {object[]} orders a list of order requests, each with outcome, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async createOrders (orders: OrderRequest[], params = {}): Promise<PredictionOrder[]> {
        this.ensureOutcomesLoaded ();
        const ordersLength = orders.length;
        const result = [];
        for (let i = 0; i < ordersLength; i++) {
            const o = orders[i];
            const outcome = this.safeString (o, 'symbol');
            const type = this.safeString (o, 'type');
            const side = this.safeString (o, 'side');
            const amount = this.safeNumber (o, 'amount');
            const price = this.safeNumber (o, 'price');
            const orderParams = this.safeDict (o, 'params', {});
            const placed = await this.createOrderbookOrder (outcome, type, side, amount, price, this.extend (orderParams, params));
            result.push (placed);
        }
        return result;
    }

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
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async editOrder (id: string, outcome: string, type: Str, side: Str, amount: Num = undefined, price: Num = undefined, params = {}): Promise<PredictionOrder> {
        this.ensureOutcomesLoaded ();
        await this.cancelOrder (id, outcome);
        return await this.createOrderbookOrder (outcome, type, side, amount, price, params);
    }

    /**
     * @ignore
     * @method
     * @name myriad#createAmmOrder
     * @description buys or sells outcome shares by submitting the quote's calldata as an on-chain AMM transaction. Requires a privateKey with gas + collateral on the market's network
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async createAmmOrder (outcome: string, type: Str, side: Str, amount: Num, price: Num = undefined, params = {}): Promise<PredictionOrder> {
        if (this.privateKey === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a privateKey to sign the on-chain transaction');
        }
        this.checkEvents (outcome);
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const networkId = this.safeString (info, 'networkId');
        const chains = this.safeDict (this.options, 'chains', {});
        const chainConfig = this.safeDict (chains, networkId);
        if (chainConfig === undefined) {
            throw new NotSupported (this.id + ' createOrder() has no on-chain config for network ' + networkId);
        }
        const rpcUrl = this.safeString2 (params, 'rpcUrl', 'rpc', this.safeString (chainConfig, 'rpcUrl'));
        const predictionMarket = this.safeString (chainConfig, 'predictionMarket');
        const tokenAddress = this.safeString2 (params, 'token', 'tokenAddress', this.safeString (info, 'tokenAddress'));
        const gasLimit = this.safeString (params, 'gasLimit', '0xaae60');
        const sideStr = (side as string).toLowerCase ();
        const quoteParams = this.omit (params, [ 'rpcUrl', 'rpc', 'token', 'tokenAddress', 'gasLimit' ]);
        const quote = await this.fetchTradeQuote (outcome, sideStr, amount, quoteParams);
        const calldata = this.safeString (this.safeDict (quote, 'info', {}), 'calldata');
        const fromAddress = this.ethGetAddressFromPrivateKey (this.privateKey);
        // a buy spends the collateral token, so the prediction-market contract must be approved first
        if ((sideStr === 'buy') && (tokenAddress !== undefined)) {
            await this.ensureErc20Allowance (rpcUrl, networkId, tokenAddress, fromAddress, predictionMarket);
        }
        const txHash = await this.sendEvmTransaction (rpcUrl, networkId, fromAddress, predictionMarket, '0x0', calldata, gasLimit);
        return this.parseTradeTx (txHash, quote, outcomeObj as any, sideStr);
    }

    /**
     * @ignore
     * @method
     * @name myriad#signOrderbookTypedData
     * @description EIP-712 signs an order-book typed-data message with the wallet private key (returns a 65-byte 0x signature)
     * @returns {string} the hex signature
     */
    signOrderbookTypedData (types: Dict, message: Dict, networkId: string): string {
        const chains = this.safeDict (this.options, 'chains', {});
        const chainConfig = this.safeDict (chains, networkId, {});
        const exchangeAddress = this.safeString (chainConfig, 'obExchangeAddress');
        if (exchangeAddress === undefined) {
            throw new NotSupported (this.id + ' order book trading is not configured for network ' + networkId);
        }
        const domainName = this.safeString (this.options, 'obDomainName', 'MyriadCTFExchange');
        const domainVersion = this.safeString (this.options, 'obDomainVersion', '1');
        const domain: Dict = {
            'name': domainName,
            'version': domainVersion,
            'chainId': this.parseToInt (networkId),
            'verifyingContract': exchangeAddress,
        };
        const encoded = this.ethEncodeStructuredData (domain, types, message);
        const digest = this.hash (encoded, keccak, 'hex');
        const signature = ecdsa (digest, this.remove0xPrefix (this.privateKey), secp256k1, undefined);
        const rRaw = signature['r'];
        const sRaw = signature['s'];
        const r = rRaw.padStart (64, '0');
        const s = sRaw.padStart (64, '0');
        const v = this.sum (27, signature['v']);
        const sigHex = '0x' + r + s + this.intToBase16 (v);
        return sigHex.toLowerCase ();
    }

    /**
     * @ignore
     * @method
     * @name myriad#signClobOrder
     * @description EIP-712 signs the order-book Order struct
     * @returns {string} the hex signature
     */
    signClobOrder (message: Dict, networkId: string): string {
        const orderStruct = [
            { 'name': 'trader', 'type': 'address' },
            { 'name': 'marketId', 'type': 'uint256' },
            { 'name': 'outcomeId', 'type': 'uint8' },
            { 'name': 'side', 'type': 'uint8' },
            { 'name': 'amount', 'type': 'uint256' },
            { 'name': 'price', 'type': 'uint256' },
            { 'name': 'minFillAmount', 'type': 'uint256' },
            { 'name': 'nonce', 'type': 'uint256' },
            { 'name': 'expiration', 'type': 'uint256' },
        ];
        return this.signOrderbookTypedData ({ 'Order': orderStruct }, message, networkId);
    }

    /**
     * @ignore
     * @method
     * @name myriad#signCancelAll
     * @description EIP-712 signs the order-book CancelAll struct
     * @returns {string} the hex signature
     */
    signCancelAll (message: Dict, networkId: string): string {
        const cancelStruct = [
            { 'name': 'trader', 'type': 'address' },
            { 'name': 'marketId', 'type': 'uint256' },
            { 'name': 'timestamp', 'type': 'uint256' },
        ];
        return this.signOrderbookTypedData ({ 'CancelAll': cancelStruct }, message, networkId);
    }

    /**
     * @ignore
     * @method
     * @name myriad#clobOrderMessage
     * @description normalises a fetched order-book order into a typed-data message (uint256 fields as strings, uint8 fields as ints)
     * @returns {object} the typed-data message
     */
    clobOrderMessage (rawOrder: Dict): Dict {
        return {
            'trader': this.safeString (rawOrder, 'trader'),
            'marketId': this.safeString (rawOrder, 'marketId'),
            'outcomeId': this.safeInteger (rawOrder, 'outcomeId', 0),
            'side': this.safeInteger (rawOrder, 'side', 0),
            'amount': this.safeString (rawOrder, 'amount'),
            'price': this.safeString (rawOrder, 'price'),
            'minFillAmount': this.safeString (rawOrder, 'minFillAmount', '0'),
            'nonce': this.safeString (rawOrder, 'nonce'),
            'expiration': this.safeString (rawOrder, 'expiration', '0'),
        };
    }

    /**
     * @ignore
     * @method
     * @name myriad#toOrderbookWei
     * @description scales a decimal value by 1e18 and truncates to an integer wei string
     * @returns {string} the integer wei string
     */
    toOrderbookWei (value: Num): string {
        const valueStr = this.numberToString (value);
        const scaled = Precise.stringMul (valueStr, '1000000000000000000');
        // use > -1 (not >= 0): when '.' is absent PHP's mb_strpos returns false, and false >= 0
        // coerces to true (wrongly truncating to empty), whereas false > -1 correctly coerces to false
        const dotIndex = scaled.indexOf ('.');
        if (dotIndex > -1) {
            return scaled.slice (0, dotIndex);
        }
        return scaled;
    }

    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'open': 'open',
            'pending': 'open',
            'partially_filled': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
            'canceled': 'canceled',
            'expired': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order: Dict, market: Market = undefined): PredictionOrder {
        const inner = this.safeDict (order, 'order', {});
        const orderHash = this.safeString2 (order, 'orderHash', 'hash');
        const sideInt = this.safeInteger (inner, 'side');
        const side = (sideInt === 1) ? 'sell' : 'buy';
        const amountWei = this.safeString (inner, 'amount');
        const priceWei = this.safeString (inner, 'price');
        const filledWei = this.safeString (order, 'filledAmount');
        const amount = (amountWei === undefined) ? undefined : this.parseNumber (Precise.stringDiv (amountWei, '1000000000000000000'));
        const price = (priceWei === undefined) ? undefined : this.parseNumber (Precise.stringDiv (priceWei, '1000000000000000000'));
        const filled = (filledWei === undefined) ? undefined : this.parseNumber (Precise.stringDiv (filledWei, '1000000000000000000'));
        const statusRaw = this.safeStringLower (order, 'status');
        const status = this.parseOrderStatus (statusRaw);
        const timestamp = this.parse8601 (this.safeString (order, 'createdAt'));
        const tif = this.safeStringUpper (order, 'timeInForce');
        const isMarketTif = (tif === 'FOK') || (tif === 'FAK');
        // resolve the outcome from market/outcome ids when no market was passed (e.g. fetchOrders without a outcome)
        let outcome = (market === undefined) ? undefined : this.safeString (market, 'outcome');
        let outcomeObj = market;
        if (outcome === undefined) {
            // the REST order has no top-level networkId; order book lives on the default network
            const networkId = this.safeString2 (order, 'networkId', 'network_id', this.safeString (this.options, 'defaultNetworkId', '56'));
            const marketId = this.safeString (inner, 'marketId');
            const outcomeId = this.safeString (inner, 'outcomeId');
            let composite = undefined;
            if ((networkId !== undefined) && (marketId !== undefined) && (outcomeId !== undefined)) {
                composite = networkId + ':' + marketId + '/' + outcomeId;
            }
            outcomeObj = this.safeOutcome (composite, market as any);
            outcome = this.safeString (outcomeObj, 'outcome');
        }
        return this.safePredictionOrder ({
            'id': orderHash,
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'outcome': outcome,
            'outcomeId': this.safeString (outcomeObj, 'id'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'outcome'),
            'type': isMarketTif ? 'market' : 'limit',
            'timeInForce': tif,
            'postOnly': (tif === 'PO'),
            'side': side,
            'price': price,
            'triggerPrice': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': undefined,
            'average': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    /**
     * @method
     * @name myriad#cancelOrder
     * @description cancels an open order book order by its hash (re-signs the original order to prove ownership; gasless)
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da8281b58c5adb2f5998eec8
     * @param {string} id the order hash returned by createOrder
     * @param {string} [outcome] unified outcome the order belongs to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async cancelOrder (id: string, outcome: Str = undefined, params = {}): Promise<PredictionOrder> {
        if (this.privateKey === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a privateKey to sign the cancellation');
        }
        const fetched = await this.myriadPublicGetOrdersHash (this.extend ({ 'hash': id }, params));
        const rawOrder = this.safeDict (fetched, 'order', {});
        const networkId = this.safeString2 (fetched, 'networkId', 'network_id', this.safeString (this.options, 'defaultNetworkId', '56'));
        const message = this.clobOrderMessage (rawOrder);
        const signature = this.signClobOrder (message, networkId);
        const request: Dict = {
            'hash': id,
            'order': message,
            'signature': signature,
            'network_id': this.parseToInt (networkId),
        };
        const response = await this.myriadPublicDeleteOrdersHash (request);
        const status = this.safeString (response, 'status', 'canceled');
        const wrapper = this.extend (fetched, { 'status': status, 'networkId': networkId });
        let market = undefined;
        if (outcome !== undefined) {
            this.ensureOutcomesLoaded ();
            market = this.outcome (outcome);
        }
        return this.parseOrder (wrapper, market as any);
    }

    /**
     * @method
     * @name myriad#cancelAllOrders
     * @description cancels all open order book orders for the wallet, optionally scoped to one market (gasless)
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da8281e7a14cd34e6a716761
     * @param {string} [outcome] unified outcome; when omitted cancels across all markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the raw response with the count of cancelled orders
     */
    async cancelAllOrders (outcome: Str = undefined, params = {}): Promise<any> {
        if (this.privateKey === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a privateKey to sign the cancellation');
        }
        const trader = this.ethGetAddressFromPrivateKey (this.privateKey);
        let marketId = this.safeString (params, 'market_id', '0');
        let networkId = this.safeString (params, 'network_id', this.safeString (this.options, 'defaultNetworkId', '56'));
        if (outcome !== undefined) {
            this.ensureOutcomesLoaded ();
            const outcomeObj = this.outcome (outcome);
            const info = this.safeDict (outcomeObj, 'info', {});
            marketId = this.safeString (info, 'marketId', marketId);
            networkId = this.safeString (info, 'networkId', networkId);
        }
        // timestamp defaults to now (unix seconds) but can be pinned via params for idempotent retries
        const timestamp = this.safeString (params, 'timestamp', this.numberToString (this.seconds ()));
        const message: Dict = {
            'trader': trader,
            'marketId': marketId,
            'timestamp': timestamp,
        };
        const signature = this.signCancelAll (message, networkId);
        const request: Dict = {
            'trader': trader,
            'market_id': this.parseToInt (marketId),
            'timestamp': timestamp,
            'signature': signature,
            'network_id': this.parseToInt (networkId),
        };
        return await this.myriadPublicPostOrdersCancelAll (request);
    }

    /**
     * @method
     * @name myriad#cancelOrders
     * @description cancels multiple open order book orders by hash in one request (gasless)
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828177961fd94a6055966f
     * @param {string[]} ids the order hashes to cancel
     * @param {string} [outcome] not used by myriad cancelOrders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async cancelOrders (ids: string[], outcome: Str = undefined, params = {}): Promise<PredictionOrder[]> {
        if (this.privateKey === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires a privateKey to sign the cancellations');
        }
        const idsLength = ids.length;
        const signedOrders = [];
        const wrappers = [];
        let networkId = this.safeString (this.options, 'defaultNetworkId', '56');
        for (let i = 0; i < idsLength; i++) {
            const id = ids[i];
            const fetched = await this.myriadPublicGetOrdersHash ({ 'hash': id });
            const rawOrder = this.safeDict (fetched, 'order', {});
            networkId = this.safeString2 (fetched, 'networkId', 'network_id', networkId);
            const message = this.clobOrderMessage (rawOrder);
            const signature = this.signClobOrder (message, networkId);
            signedOrders.push ({ 'order': message, 'signature': signature });
            wrappers.push (this.extend (fetched, { 'status': 'canceled', 'networkId': networkId }));
        }
        const request: Dict = {
            'orders': signedOrders,
            'network_id': this.parseToInt (networkId),
        };
        await this.myriadPublicPostOrdersCancelBatch (this.extend (request, params));
        return this.parseOrders (wrappers, undefined, undefined, undefined) as PredictionOrder[];
    }

    /**
     * @method
     * @name myriad#fetchOrder
     * @description fetches a single order book order by its hash
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828116b8a0d976baea1df0
     * @param {string} id the order hash
     * @param {string} [outcome] unified outcome the order belongs to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async fetchOrder (id: string, outcome: Str = undefined, params = {}): Promise<PredictionOrder> {
        const response = await this.myriadPublicGetOrdersHash (this.extend ({ 'hash': id }, params));
        let market = undefined;
        if (outcome !== undefined) {
            this.ensureOutcomesLoaded ();
            market = this.outcome (outcome);
        }
        return this.parseOrder (response, market as any);
    }

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
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async fetchOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        const request: Dict = {};
        const trader = this.safeString (params, 'trader');
        if (trader === undefined) {
            if (this.privateKey !== undefined) {
                request['trader'] = this.ethGetAddressFromPrivateKey (this.privateKey);
            } else if (this.walletAddress !== undefined) {
                request['trader'] = this.walletAddress;
            }
        }
        let outcomeSymbol = undefined;
        if (outcome !== undefined) {
            this.ensureOutcomesLoaded ();
            const outcomeObj = this.outcome (outcome);
            outcomeSymbol = this.safeString (outcomeObj, 'outcome', outcome);
        }
        const response = await this.myriadPublicGetOrders (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        // the /orders endpoint ignores a market_id filter server-side (it returns nothing even for a
        // valid market), so parse every order — each self-resolves its outcome from the network/market/
        // outcome ids — and filter by the requested outcome client-side
        const orders = this.parseOrders (data, undefined, undefined, undefined);
        return this.filterByOutcomeSinceLimit (orders, outcomeSymbol, since, limit) as PredictionOrder[];
    }

    /**
     * @method
     * @name myriad#fetchOpenOrders
     * @description fetches open order book orders for the wallet
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828171a003cf996487d008
     * @param {string} [outcome] unified outcome to filter by
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async fetchOpenOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        const request: Dict = {
            'status': 'open',
        };
        return await this.fetchOrders (outcome, since, limit, this.extend (request, params));
    }

    /**
     * @method
     * @name myriad#fetchClosedOrders
     * @description fetches the wallet's filled order book orders
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828171a003cf996487d008
     * @param {string} [outcome] unified outcome to filter by
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async fetchClosedOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        const request: Dict = {
            'status': 'filled',
        };
        return await this.fetchOrders (outcome, since, limit, this.extend (request, params));
    }

    /**
     * @method
     * @name myriad#fetchCanceledOrders
     * @description fetches the wallet's cancelled order book orders
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828171a003cf996487d008
     * @param {string} [outcome] unified outcome to filter by
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async fetchCanceledOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        const request: Dict = {
            'status': 'cancelled',
        };
        return await this.fetchOrders (outcome, since, limit, this.extend (request, params));
    }

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
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    async fetchMyTrades (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionTrade[]> {
        const request: Dict = {
            'status': 'filled',
        };
        const orders = await this.fetchOrders (outcome, since, limit, this.extend (request, params));
        const trades = [];
        const ordersLength = orders.length;
        for (let i = 0; i < ordersLength; i++) {
            const order = orders[i];
            trades.push (this.orderToTrade (order));
        }
        return this.filterByValueSinceLimit (trades, 'outcome', outcome, since, limit, 'timestamp', true) as PredictionTrade[];
    }

    orderToTrade (order: Dict): PredictionTrade {
        const timestamp = this.safeInteger (order, 'timestamp');
        const orderType = this.safeString (order, 'type');
        // the REST filled-order response carries the order's limit price (= the fill price for limit
        // orders, but only the protective bound for market orders), so omit the price for market orders
        let price = undefined;
        if (orderType !== 'market') {
            price = this.safeNumber (order, 'price');
        }
        return this.safePredictionTrade ({
            'id': this.safeString (order, 'id'),
            'order': this.safeString (order, 'id'),
            'info': this.safeDict (order, 'info', {}),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'outcome': this.safeString (order, 'outcome'),
            'outcomeId': this.safeString (order, 'outcomeId'),
            'label': this.safeString (order, 'label'),
            'market': this.safeString (order, 'market'),
            'type': orderType,
            'side': this.safeString (order, 'side'),
            'takerOrMaker': undefined,
            'price': price,
            'amount': this.safeNumber (order, 'filled'),
            'cost': undefined,
            'fee': undefined,
        });
    }

    /**
     * @method
     * @name myriad#fetchBalance
     * @description fetches the wallet's on-chain collateral balance for the order-book network (USD1 on BNB Chain)
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network_id] the network id (defaults to options.defaultNetworkId, '56')
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    async fetchBalance (params = {}): Promise<Balances> {
        const networkId = this.safeString (params, 'network_id', this.safeString (this.options, 'defaultNetworkId', '56'));
        const chains = this.safeDict (this.options, 'chains', {});
        const chainConfig = this.safeDict (chains, networkId, {});
        const rpcUrl = this.safeString2 (params, 'rpcUrl', 'rpc', this.safeString (chainConfig, 'rpcUrl'));
        const token = this.safeString2 (params, 'token', 'tokenAddress', this.safeString (chainConfig, 'collateralToken'));
        if (token === undefined) {
            throw new NotSupported (this.id + ' fetchBalance() has no collateral token configured for network ' + networkId);
        }
        const currency = this.safeString (chainConfig, 'collateralCurrency', 'USD1');
        const decimals = this.safeInteger (chainConfig, 'collateralDecimals', 18);
        const owner = this.walletAddressFromKeys ();
        // ERC20 balanceOf(owner) = selector 0x70a08231 + the 32-byte left-padded owner address
        const callData = '0x70a08231' + this.padHexAddress (owner);
        const callParams = [ { 'to': token, 'data': callData }, 'latest' ];
        const raw = await this.ethRpc (rpcUrl, 'eth_call', callParams);
        const balanceString = this.fromWeiWithDecimals (raw, decimals);
        const result: Dict = {
            'info': { 'balanceHex': raw, 'token': token, 'networkId': networkId },
        };
        const account = this.account ();
        account['free'] = balanceString;
        account['total'] = balanceString;
        result[currency] = account;
        return this.safeBalance (result);
    }

    hexToDecimalString (hexValue: string): Str {
        // portable hex -> decimal string (avoids convertToBigInt, which is not uniform across languages)
        const stripped = this.remove0xPrefix (hexValue);
        if ((stripped === undefined) || (stripped === '')) {
            return undefined;
        }
        const chars = this.stringToCharsArray (stripped.toLowerCase ());
        const n = chars.length;
        const digits = '0123456789abcdef';
        let result = '0';
        for (let i = 0; i < n; i++) {
            const v = digits.indexOf (chars[i]);
            if (v > -1) {
                result = Precise.stringAdd (Precise.stringMul (result, '16'), this.numberToString (v));
            }
        }
        return result;
    }

    fromWeiWithDecimals (hexValue: string, decimals: Int): Str {
        const decimalString = this.hexToDecimalString (hexValue);
        if (decimalString === undefined) {
            return undefined;
        }
        let scale = '1';
        for (let i = 0; i < decimals; i++) {
            scale = scale + '0';
        }
        return Precise.stringDiv (decimalString, scale);
    }

    parseTradeTx (txHash: string, quote: Dict, market: any, side: string): PredictionOrder {
        return this.safePredictionOrder ({
            'id': txHash,
            'clientOrderId': undefined,
            'info': this.extend ({ 'transactionHash': txHash }, this.safeDict (quote, 'info', {})),
            'outcome': this.safeString (market, 'outcome'),
            'outcomeId': this.safeString (market, 'id'),
            'label': this.safeString (market, 'label'),
            'market': this.safeString (market, 'outcome'),
            'type': 'market',
            'side': side,
            'price': this.safeNumber (quote, 'priceAverage'),
            'amount': this.safeNumber (quote, 'shares'),
            'cost': this.safeNumber (quote, 'value'),
            'status': 'closed',
            'fee': undefined,
        }, market);
    }

    /**
     * @ignore
     * @method
     * @name myriad#parseMarketToEvent
     * @description wraps a parsed myriad market into a unified event structure
     * @param {object} raw the raw myriad market object
     * @param {object} market the parsed ccxt market
     * @returns {object} an event structure
     */
    parseMarketToEvent (raw: Dict, market: any): any {
        const slug = this.safeString (raw, 'slug', this.safeString (raw, 'id'));
        const state = this.safeString (raw, 'state', 'open');
        const endDate = this.safeString (raw, 'expiresAt');
        return {
            'id': market['id'],
            'slug': slug,
            'event': market['symbol'],
            'title': this.safeString2 (raw, 'title', 'shortName'),
            'description': this.safeString (raw, 'description'),
            'markets': [ market ],
            'volume': this.safeNumber2 (raw, 'volumeNotional24h', 'volume24h'),
            'liquidity': this.safeNumber (raw, 'liquidity'),
            'url': undefined,
            'image': this.safeString (raw, 'imageUrl'),
            'active': (state === 'open'),
            'resolved': (state === 'resolved'),
            'category': undefined,
            'tags': this.safeList (raw, 'topics'),
            'created': this.parse8601 (this.safeString (raw, 'publishedAt')),
            'createdDatetime': this.safeString (raw, 'publishedAt'),
            'end': (endDate !== undefined) ? this.parse8601 (endDate) : undefined,
            'endDatetime': endDate,
            'lastUpdatedAt': undefined,
            'resolutionSource': this.safeString (raw, 'resolutionSource'),
            'info': raw,
        };
    }

    /**
     * @ignore
     * @method
     * @name myriad#parseMyriadMarket
     * @description converts a single raw myriad market into one ccxt market with a list of outcome objects
     * @param {object} raw the raw myriad market object
     * @param {string} [eventSlug] the slug of the parent event
     * @returns {object} a [market structure](https://docs.ccxt.com/#/?id=market-structure)
     */
    parseMyriadMarket (raw: Dict, eventSlug: string = undefined): Market {
        const networkId = this.safeString (raw, 'networkId');
        const marketId = this.safeString (raw, 'id');
        const slug = this.safeString (raw, 'slug', marketId);
        const rawOutcomes = this.safeList (raw, 'outcomes', []) as any[];
        const endDate = this.safeString (raw, 'expiresAt');
        const state = this.safeString (raw, 'state', 'open');
        const active = state === 'open';
        const volume24h = this.safeNumber (raw, 'volume24h');
        const slugBase = (eventSlug !== undefined) ? eventSlug : networkId;
        const marketSymbol = this.slugToMarketSymbol (slugBase, slug);
        // the collateral token (outcome + address + decimals) is per-market; carry it for on-chain trading
        const tokenObj = this.safeDict (raw, 'token', {});
        const tokenAddress = this.safeString (tokenObj, 'address');
        const tokenDecimals = this.safeInteger (tokenObj, 'decimals', 18);
        const quoteCurrency = this.safeString (tokenObj, 'symbol', 'USDC');
        // per-side fees: buys are charged the taker fee, sells the maker fee (mirrors fetchTradingFee)
        const feesObj = this.safeDict (raw, 'fees', {});
        const buyFees = this.safeDict (feesObj, 'buy', {});
        const sellFees = this.safeDict (feesObj, 'sell', {});
        const takerFee = this.safeNumber (buyFees, 'fee', 0.01);
        const makerFee = this.safeNumber (sellFees, 'fee', 0);
        const outcomes: any[] = [];
        for (let i = 0; i < rawOutcomes.length; i++) {
            const outcome = this.safeDict (rawOutcomes, i, {});
            const outcomeId = this.safeString (outcome, 'outcomeId', this.safeString (outcome, 'id', i.toString ()));
            const outcomeLabel = this.safeString (outcome, 'label', this.safeString (outcome, 'title', outcomeId));
            const price = this.safeNumber (outcome, 'price');
            const outcomeHandle = this.slugToOutcomeSymbol (slugBase, slug, outcomeLabel);
            const outcomeCompositeId = networkId + ':' + marketId + '/' + outcomeId;
            outcomes.push ({
                'id': outcomeCompositeId,
                'outcomeId': outcomeCompositeId,
                'outcome': outcomeHandle,
                'market': marketSymbol,
                'label': outcomeLabel,
                'active': active,
                'precision': {
                    'amount': 0.01,
                    'price': 0.001,
                },
                'info': {
                    'networkId': networkId,
                    'marketId': marketId,
                    'slug': slug,
                    'outcomeId': outcomeId,
                    'outcomeLabel': outcomeLabel,
                    'outcomePrice': price,
                    'volume24h': volume24h,
                    'state': state,
                    'tradingModel': this.safeString (raw, 'tradingModel', 'amm'),
                    'tokenAddress': tokenAddress,
                    'tokenDecimals': tokenDecimals,
                },
            });
        }
        const marketTradingModel = this.safeString (raw, 'tradingModel', 'amm');
        const marketExecutionModel = (marketTradingModel === 'amm') ? 'amm' : 'clob';
        const outcomesLength = outcomes.length;
        return {
            'id': networkId + ':' + marketId,
            'symbol': marketSymbol,
            'marketType': (outcomesLength > 2) ? 'categorical' : 'binary',
            'executionModel': marketExecutionModel,
            'base': slug,
            'quote': quoteCurrency,
            'settle': undefined,
            'baseId': networkId + ':' + marketId,
            'quoteId': quoteCurrency,
            'settleId': undefined,
            'type': 'prediction',
            'spot': false,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'prediction': true,
            'active': active,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': endDate ? this.parse8601 (endDate) : undefined,
            'expiryDatetime': endDate,
            'strike': undefined,
            'optionType': undefined,
            'taker': takerFee,
            'maker': makerFee,
            'percentage': true,
            'tierBased': false,
            'feeSide': 'get',
            'precision': {
                'amount': 0.01,
                'price': 0.001,
            },
            'limits': {
                'leverage': { 'min': 1, 'max': 1 },
                'amount': { 'min': 0, 'max': undefined },
                'price': { 'min': 0.001, 'max': 0.999 },
                'cost': { 'min': undefined, 'max': undefined },
            },
            'outcomes': outcomes,
            'info': this.extend (raw, {
                'networkId': networkId,
                'marketId': marketId,
                'slug': slug,
                'volume24h': volume24h,
                'state': state,
            }),
            'created': undefined,
        } as unknown as Market;
    }

    /**
     * @method
     * @name myriad#fetchTicker
     * @description fetches the current price for a single outcome by loading the parent market
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string} outcome unified outcome like TRUMP_WIN:YES or an outcome id like 2741:756/0
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    async fetchTicker (outcome: string, params = {}): Promise<PredictionTicker> {
        this.ensureOutcomesLoaded ();
        const outcomeObj = this.outcome (outcome);
        const networkId = this.safeString (outcomeObj['info'], 'networkId');
        const marketId = this.safeString (outcomeObj['info'], 'marketId');
        const request: Dict = {
            'id': marketId,
            'network_id': networkId,
        };
        const response = await this.myriadPublicGetMarketsId (this.extend (request, params));
        //
        //     {
        //         "id": "756",
        //         "networkId": "2741",
        //         "slug": "will-trump-capture-another-president-before-his-birthday",
        //         "title": "Will Trump capture another president before his birthday?",
        //         "description": "string"
        //         "publishedAt": "2026-01-16T18:05:36.000Z",
        //         "expiresAt": "2026-06-14T04:59:00.000Z",
        //         "resolvesAt": null,
        //         "fees": {
        //             "buy": { "fee": "0.01", "treasury_fee": "0.01", "distributor_fee": "0.01" },
        //             "sell": { "fee": "0", "treasury_fee": "0", "distributor_fee": "0" },
        //             "treasury": "0x5E3EbEc100e2294C0EB2264FC96225dF067AAaa3",
        //             "distributor": "0xE44984C586FeBB31605D23b6316cA11B6f4D86b2"
        //         },
        //         "state": "open",
        //         "voided": false,
        //         "resolvedOutcomeId": "-1",
        //         "topics": [ "Politics" ],
        //         "resolutionSource": "https://www.whitehouse.gov/",
        //         "resolutionTitle": "White House",
        //         "token": {
        //             "name": "Bridged USDC (Stargate)",
        //             "address": "0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1",
        //             "symbol": "USDC.e",
        //             "decimals": "6"
        //         },
        //         "imageUrl": "https://cdn.polkamarkets.com/Qma9FAX15kHewT8vm61vykGA9bqQhNdDLvEbQWSp72i3PQ",
        //         "bannerImageUrl": "https://imagedelivery.net/YN1-rdnufJQJCgu3i1CbVw/255d431f-1bb4-4d90-032b-d1f7032e8000/public",
        //         "ogImageUrl": "https://imagedelivery.net/YN1-rdnufJQJCgu3i1CbVw/cf1af79c-07b9-40f0-283b-ed59865b3c00/public",
        //         "liquidity": "2000",
        //         "liquidityPrice": "0.32532445",
        //         "volume": "10891.236893",
        //         "volume24h": "0.939",
        //         "volumeNotional": "13570.426814",
        //         "volumeNotional24h": "1.028382",
        //         "users": "122",
        //         "shares": "4098.474144",
        //         "featured": false,
        //         "featuredAt": null,
        //         "inPlay": false,
        //         "inPlayStartsAt": null,
        //         "perpetual": false,
        //         "moneyline": false,
        //         "executionMode": "0",
        //         "tradingModel": "amm",
        //         "topHolders": [
        //             "0x8A611AEE71b6448a6F99B6001D1234d020f7d546",
        //             "0x2993249A3D107B759c886a4BD4e02B70d471eA9B",
        //             "0x82a5b3BD2A9216369537583f63fa576a1D57c7E7"
        //         ],
        //         "outcomes": [
        //             {
        //                 "id": "0",
        //                 "title": "Yes",
        //                 "shares": "3742.174971",
        //                 "sharesHeld": "138.741271",
        //                 "price": "0.08693459",
        //                 "closingPrice": null,
        //                 "priceChange24h": "0.00045828",
        //                 "imageUrl": "https://cdn.polkamarkets.com/Qma9FAX15kHewT8vm61vykGA9bqQhNdDLvEbQWSp72i3PQ",
        //                 "holders": "7",
        //                 "tokenId": "1512",
        //                 "price_charts": [Array]
        //             },
        //         ],
        //         "eventId": null,
        //         "outcomeIndex": null,
        //         "negRisk": false,
        //         "externalSources": []
        //     }
        //
        return this.parseTicker (response, outcomeObj);
    }

    /**
     * @method
     * @name myriad#fetchTradingFee
     * @description fetches the buy/sell fee rates for a market outcome
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string} outcome unified outcome or outcome id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)
     */
    async fetchTradingFee (outcome: string, params = {}): Promise<PredictionTradingFee> {
        this.ensureOutcomesLoaded ();
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const request: Dict = {
            'id': this.safeString (info, 'marketId'),
            'network_id': this.safeString (info, 'networkId'),
        };
        const response = await this.myriadPublicGetMarketsId (this.extend (request, params));
        //
        //     {
        //         "fees": {
        //             "buy": { "fee": "0.02", "treasury_fee": "0.01", "distributor_fee": "0.01" },
        //             "sell": { "fee": "0", "treasury_fee": "0", "distributor_fee": "0" }
        //         }
        //     }
        //
        const fees = this.safeDict (response, 'fees', {});
        const buy = this.safeDict (fees, 'buy', {});
        const sell = this.safeDict (fees, 'sell', {});
        return {
            'info': response,
            'outcome': this.safeOutcomeSymbol (undefined, outcomeObj as any),
            'outcomeId': this.safeString (outcomeObj, 'outcomeId'),
            'maker': this.safeNumber (sell, 'fee'),
            'taker': this.safeNumber (buy, 'fee'),
            'percentage': true,
            'tierBased': false,
        } as any;
    }

    /**
     * @ignore
     * @method
     * @name myriad#parseTicker
     * @description parses a raw myriad market object into a unified ticker for the specified outcome
     * @param {object} raw the raw myriad market object
     * @param {object} [market] the outcome object the ticker belongs to
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    parseTicker (raw: Dict, market: Market = undefined): PredictionTicker {
        //
        //     {
        //         "id": "756",
        //         "networkId": "2741",
        //         "slug": "will-trump-capture-another-president-before-his-birthday",
        //         "title": "Will Trump capture another president before his birthday?",
        //         "description": "string"
        //         "publishedAt": "2026-01-16T18:05:36.000Z",
        //         "expiresAt": "2026-06-14T04:59:00.000Z",
        //         "resolvesAt": null,
        //         "fees": {
        //             "buy": { "fee": "0.01", "treasury_fee": "0.01", "distributor_fee": "0.01" },
        //             "sell": { "fee": "0", "treasury_fee": "0", "distributor_fee": "0" },
        //             "treasury": "0x5E3EbEc100e2294C0EB2264FC96225dF067AAaa3",
        //             "distributor": "0xE44984C586FeBB31605D23b6316cA11B6f4D86b2"
        //         },
        //         "state": "open",
        //         "voided": false,
        //         "resolvedOutcomeId": "-1",
        //         "topics": [ "Politics" ],
        //         "resolutionSource": "https://www.whitehouse.gov/",
        //         "resolutionTitle": "White House",
        //         "token": {
        //             "name": "Bridged USDC (Stargate)",
        //             "address": "0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1",
        //             "symbol": "USDC.e",
        //             "decimals": "6"
        //         },
        //         "imageUrl": "https://cdn.polkamarkets.com/Qma9FAX15kHewT8vm61vykGA9bqQhNdDLvEbQWSp72i3PQ",
        //         "bannerImageUrl": "https://imagedelivery.net/YN1-rdnufJQJCgu3i1CbVw/255d431f-1bb4-4d90-032b-d1f7032e8000/public",
        //         "ogImageUrl": "https://imagedelivery.net/YN1-rdnufJQJCgu3i1CbVw/cf1af79c-07b9-40f0-283b-ed59865b3c00/public",
        //         "liquidity": "2000",
        //         "liquidityPrice": "0.32532445",
        //         "volume": "10891.236893",
        //         "volume24h": "0.939",
        //         "volumeNotional": "13570.426814",
        //         "volumeNotional24h": "1.028382",
        //         "users": "122",
        //         "shares": "4098.474144",
        //         "featured": false,
        //         "featuredAt": null,
        //         "inPlay": false,
        //         "inPlayStartsAt": null,
        //         "perpetual": false,
        //         "moneyline": false,
        //         "executionMode": "0",
        //         "tradingModel": "amm",
        //         "topHolders": [
        //             "0x8A611AEE71b6448a6F99B6001D1234d020f7d546",
        //             "0x2993249A3D107B759c886a4BD4e02B70d471eA9B",
        //             "0x82a5b3BD2A9216369537583f63fa576a1D57c7E7"
        //         ],
        //         "outcomes": [
        //             {
        //                 "id": "0",
        //                 "title": "Yes",
        //                 "shares": "3742.174971",
        //                 "sharesHeld": "138.741271",
        //                 "price": "0.08693459",
        //                 "closingPrice": null,
        //                 "priceChange24h": "0.00045828",
        //                 "imageUrl": "https://cdn.polkamarkets.com/Qma9FAX15kHewT8vm61vykGA9bqQhNdDLvEbQWSp72i3PQ",
        //                 "holders": "7",
        //                 "tokenId": "1512",
        //                 "price_charts": [Array]
        //             },
        //         ],
        //         "eventId": null,
        //         "outcomeIndex": null,
        //         "negRisk": false,
        //         "externalSources": []
        //     }
        //
        const outcomeId = market ? this.safeString (market['info'], 'outcomeId') : undefined;
        const outcomes = this.safeList (raw, 'outcomes', []) as any[];
        let price = undefined;
        let change = undefined;
        for (let i = 0; i < outcomes.length; i++) {
            const o = outcomes[i];
            if (this.safeString (o, 'outcomeId', this.safeString (o, 'id')) === outcomeId) {
                price = this.safeNumber (o, 'price');
                change = this.safeNumber (o, 'priceChange24h');
                break;
            }
        }
        const now = this.milliseconds ();
        return this.safePredictionTicker ({
            'outcome': this.safeString (market, 'outcome'),
            'outcomeId': this.safeString (market, 'id'),
            'label': this.safeString (market, 'label'),
            'market': this.safeString (market, 'outcome'),
            'timestamp': now,
            'datetime': this.iso8601 (now),
            'high': undefined,
            'low': undefined,
            'bid': price,
            'bidVolume': undefined,
            'ask': price,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': price,
            'last': price,
            'previousClose': undefined,
            'change': change,
            'percentage': change,
            'average': price,
            'baseVolume': this.safeNumber (raw, 'volume24h'),          // 24h volume in outcome shares
            'quoteVolume': this.safeNumber (raw, 'volumeNotional24h'), // 24h volume in USDC notional
            'info': raw,
        }, market);
    }

    /**
     * @method
     * @name myriad#fetchOrderBook
     * @description fetches the real order book for order-book markets, or synthesizes a one-level book from the AMM price otherwise
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da8281bba6aaf24dd61f2bb1
     * @param {string} outcome unified outcome like TRUMP_WIN:YES or an outcome id
     * @param {int} [limit] not used by myriad fetchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    async fetchOrderBook (outcome: string, limit: Int = undefined, params = {}): Promise<PredictionOrderBook> {
        this.ensureOutcomesLoaded ();
        const outcomeObj = this.outcome (outcome);
        const networkId = this.safeString (outcomeObj['info'], 'networkId');
        const marketId = this.safeString (outcomeObj['info'], 'marketId');
        const outcomeId = this.safeString (outcomeObj['info'], 'outcomeId');
        const tradingModel = this.safeString (outcomeObj['info'], 'tradingModel', 'amm');
        if (tradingModel === 'ob') {
            const obRequest: Dict = {
                'id': marketId,
                'network_id': networkId,
                'outcome': outcomeId,
            };
            const obResponse = await this.myriadPublicGetMarketsIdOrderbook (this.extend (obRequest, params));
            //
            //     {
            //         "bids": [ [ "980000000000000000", "258412594752186597376" ] ],
            //         "asks": [ [ "990000000000000000", "151975683890577539072" ] ]
            //     }
            //
            return this.safePredictionOrderBook (this.parseWeiOrderBook (obResponse, this.safeOutcomeSymbol (outcome, outcomeObj)), outcomeObj);
        }
        const request: Dict = {
            'id': marketId,
            'network_id': networkId,
        };
        const response = await this.myriadPublicGetMarketsId (this.extend (request, params));
        //
        //     {
        //         "id": "756",
        //         "networkId": "2741",
        //         "slug": "will-trump-capture-another-president-before-his-birthday",
        //         "title": "Will Trump capture another president before his birthday?",
        //         "shortName": null,
        //         "description": "### **Market Dates:**"
        //         "publishedAt": "2026-01-16T18:05:36.000Z",
        //         "expiresAt": "2026-06-14T04:59:00.000Z",
        //         "resolvesAt": null,
        //         "fees": {
        //             "buy": { "fee": "0.01", "treasury_fee": "0.01", "distributor_fee": "0.01" },
        //             "sell": { "fee": "0", "treasury_fee": "0", "distributor_fee": "0" },
        //             "treasury": "0x5E3EbEc100e2294C0EB2264FC96225dF067AAaa3",
        //             "distributor": "0xE44984C586FeBB31605D23b6316cA11B6f4D86b2"
        //         },
        //         "state": "open",
        //         "voided": false,
        //         "resolvedOutcomeId": "-1",
        //         "topics": [ "Politics" ],
        //         "resolutionSource": "https://www.whitehouse.gov/",
        //         "resolutionTitle": "White House",
        //         "token": {
        //             "name": "Bridged USDC (Stargate)",
        //             "address": "0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1",
        //             "symbol": "USDC.e",
        //             "decimals": "6"
        //         },
        //         "imageUrl": "https://cdn.polkamarkets.com/Qma9FAX15kHewT8vm61vykGA9bqQhNdDLvEbQWSp72i3PQ",
        //         "bannerImageUrl": "https://imagedelivery.net/YN1-rdnufJQJCgu3i1CbVw/255d431f-1bb4-4d90-032b-d1f7032e8000/public",
        //         "ogImageUrl": "https://imagedelivery.net/YN1-rdnufJQJCgu3i1CbVw/d3d60089-3d08-45ac-aa9d-139156e3f900/public",
        //         "liquidity": "2000",
        //         "liquidityPrice": "0.29322839",
        //         "volume": "11396.236893",
        //         "volume24h": "500",
        //         "volumeNotional": "14101.517862",
        //         "volumeNotional24h": "525.779869",
        //         "users": "124",
        //         "shares": "4547.083096",
        //         "featured": false,
        //         "featuredAt": null,
        //         "inPlay": false,
        //         "inPlayStartsAt": null,
        //         "perpetual": false,
        //         "moneyline": false,
        //         "executionMode": "0",
        //         "tradingModel": "amm",
        //         "topHolders": [
        //             "0x8A611AEE71b6448a6F99B6001D1234d020f7d546",
        //             "0x2993249A3D107B759c886a4BD4e02B70d471eA9B"
        //         ],
        //         "outcomes": [
        //             {
        //                 "id": "0",
        //                 "title": "Yes",
        //                 "shares": "4232.024971",
        //                 "sharesHeld": "138.741271",
        //                 "price": "0.06928796",
        //                 "closingPrice": null,
        //                 "priceChange24h": "-0.20109988",
        //                 "imageUrl": "https://cdn.polkamarkets.com/Qma9FAX15kHewT8vm61vykGA9bqQhNdDLvEbQWSp72i3PQ",
        //                 "holders": "7",
        //                 "tokenId": "1512",
        //                 "price_charts": [Array]
        //             }
        //         ],
        //         "eventId": null,
        //         "outcomeIndex": null,
        //         "negRisk": false,
        //         "externalSources": []
        //     }
        //
        const outcomes = this.safeList (response, 'outcomes', []) as any[];
        let price = undefined;
        for (let i = 0; i < outcomes.length; i++) {
            const o = outcomes[i];
            if (this.safeString (o, 'outcomeId', this.safeString (o, 'id')) === outcomeId) {
                price = this.safeNumber (o, 'price');
                break;
            }
        }
        const timestamp = this.milliseconds ();
        // AMM: synthesize a single bid/ask pair around the current implied price, clamped into the valid (0, 1) range
        let bid = undefined;
        let ask = undefined;
        if (price !== undefined) {
            if (price > 0.001) {
                bid = this.parseNumber (Precise.stringSub (this.numberToString (price), '0.001'));
            }
            if (price < 0.999) {
                ask = this.parseNumber (Precise.stringAdd (this.numberToString (price), '0.001'));
            }
        }
        // the synthetic size must be a parsed float, an int literal breaks the typed go wrapper conversion
        const synthSize = this.parseNumber ('9999');
        const bids: any[] = [];
        if (bid !== undefined) {
            bids.push ([ bid, synthSize ]);
        }
        const asks: any[] = [];
        if (ask !== undefined) {
            asks.push ([ ask, synthSize ]);
        }
        const orderbook = {
            'outcome': this.safeOutcomeSymbol (outcome, outcomeObj),
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
        return this.safePredictionOrderBook (orderbook, outcomeObj);
    }

    /**
     * @ignore
     * @method
     * @name myriad#parseWeiOrderBook
     * @description parses an order book whose price and amount levels are 1e18-scaled integer strings
     * @param {object} response the raw orderbook response with bids and asks arrays
     * @param {string} outcome the unified outcome of the order book
     * @returns {object} an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    parseWeiOrderBook (response: Dict, outcome: Str): PredictionOrderBook {
        const rawBids = this.safeList (response, 'bids', []) as any[];
        const rawAsks = this.safeList (response, 'asks', []) as any[];
        const bids: any[] = [];
        for (let i = 0; i < rawBids.length; i++) {
            const row = rawBids[i];
            const rowPrice = Precise.stringDiv (this.safeString (row, 0), '1000000000000000000');
            const rowAmount = Precise.stringDiv (this.safeString (row, 1), '1000000000000000000');
            bids.push ([ this.parseNumber (rowPrice), this.parseNumber (rowAmount) ]);
        }
        const asks: any[] = [];
        for (let i = 0; i < rawAsks.length; i++) {
            const row = rawAsks[i];
            const rowPrice = Precise.stringDiv (this.safeString (row, 0), '1000000000000000000');
            const rowAmount = Precise.stringDiv (this.safeString (row, 1), '1000000000000000000');
            asks.push ([ this.parseNumber (rowPrice), this.parseNumber (rowAmount) ]);
        }
        const timestamp = this.milliseconds ();
        return {
            'outcome': outcome,
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        } as unknown as PredictionOrderBook;
    }

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
    async fetchOHLCV (outcome: string, timeframe = '1d', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        this.ensureOutcomesLoaded ();
        const outcomeObj = this.outcome (outcome);
        const outcomeInfo = this.safeDict (outcomeObj, 'info', {});
        const networkId = this.safeString (outcomeObj['info'], 'networkId');
        const marketId = this.safeString (outcomeObj['info'], 'marketId');
        const outcomeId = this.safeString (outcomeInfo, 'outcomeId', this.safeString (outcomeInfo, 'id'));
        const outcomeTitle = this.safeString (outcomeInfo, 'outcomeLabel', this.safeString (outcomeInfo, 'label', this.safeString (outcomeInfo, 'title')));
        const bucketKey = this.safeString (this.timeframes, timeframe, '30d');
        const response = await this.myriadPublicGetMarketsId (this.extend ({
            'id': marketId,
            'network_id': networkId,
        }, params));
        //
        //     {
        //         "id": "164",
        //         "networkId": "2741",
        //         "slug": "trump-out-as-president-2027",
        //         "title": "Will Trump cease to be President before 2027?",
        //         "state": "open",
        //         "outcomes": [
        //             {
        //                 "id": "0",
        //                 "outcomeId": "0",
        //                 "title": "YES",
        //                 "label": "YES",
        //                 "price": 0.42,
        //                 "priceChange24h": -0.02
        //             }
        //         ],
        //         "price_charts": {
        //             "24h": {
        //                 "timeframe": "24h",
        //                 "prices": [
        //                     {
        //                         "timestamp": 1705318200,
        //                         "open": 0.40,
        //                         "high": 0.45,
        //                         "low": 0.39,
        //                         "close": 0.42,
        //                         "price": 0.42,
        //                         "value": 0.42
        //                     }
        //                 ]
        //             },
        //             "7d": {...},
        //             "30d": {...}
        //         }
        //     }
        //
        const outcomes = this.safeList (response, 'outcomes', []) as any[];
        let selectedOutcome: Dict = undefined;
        for (let i = 0; i < outcomes.length; i++) {
            const oc = outcomes[i];
            const currentId = this.safeString (oc, 'id', this.safeString (oc, 'outcomeId'));
            const currentTitle = this.safeString (oc, 'title', this.safeString (oc, 'label'));
            if ((outcomeId !== undefined) && (currentId === outcomeId)) {
                selectedOutcome = oc;
                break;
            }
            if ((selectedOutcome === undefined) && (outcomeTitle !== undefined) && (currentTitle === outcomeTitle)) {
                selectedOutcome = oc;
            }
        }
        // price_charts is a list of { timeframe, prices } buckets, with a dict variant on some deployments
        let chart = undefined;
        const chartsList = this.safeList (selectedOutcome, 'price_charts');
        if (chartsList !== undefined) {
            for (let i = 0; i < chartsList.length; i++) {
                const chartObj = chartsList[i];
                if (this.safeString (chartObj, 'timeframe') === bucketKey) {
                    chart = chartObj;
                    break;
                }
            }
        } else {
            const chartsDict = this.safeDict (selectedOutcome, 'price_charts', {});
            chart = this.safeValue (chartsDict, bucketKey);
        }
        const pointsList = this.safeList (chart, 'prices', this.safeList (chart, 'data', chart as any));
        let points = (pointsList !== undefined) ? pointsList : [];
        const pointsLength = points.length;
        if (pointsLength === 0) {
            const priceCharts = this.safeDict (response, 'price_charts', {});
            const bucket = this.safeValue (priceCharts, bucketKey, {});
            points = this.safeList (bucket, outcomeId, this.safeList (bucket, 'data', [])) as any[];
        }
        const usablePoints = [];
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const pointOpen = this.safeNumber (point, 'open');
            const pointPrice = this.safeNumber (point, 'price', this.safeNumber (point, 'value'));
            const pointTs = this.safeInteger (point, 'timestamp');
            if (((pointOpen !== undefined) || (pointPrice !== undefined)) && (pointTs !== undefined)) {
                usablePoints.push (point);
            }
        }
        return this.parseOHLCVs (usablePoints, outcomeObj, timeframe, since, limit);
    }

    /**
     * @ignore
     * @method
     * @name myriad#parseOHLCV
     * @description parses a single myriad price chart data point into an ohlcv tuple
     * @param {object} ohlcv the raw price chart data point
     * @param {object} [market] the outcome object the candle belongs to
     * @returns {int[]} a candle ordered as timestamp, open, high, low, close, volume
     */
    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         "timestamp": 1705318200,
        //         "open": 0.40,
        //         "high": 0.45,
        //         "low": 0.39,
        //         "close": 0.42,
        //         "price": 0.42,
        //         "value": 0.42
        //     }
        //
        const open = this.safeNumber (ohlcv, 'open');
        const high = this.safeNumber (ohlcv, 'high');
        const low = this.safeNumber (ohlcv, 'low');
        const close = this.safeNumber (ohlcv, 'close');
        const price = this.safeNumber (ohlcv, 'price', this.safeNumber (ohlcv, 'value'));  // fallback single-value tick
        return [
            this.safeTimestamp (ohlcv, 'timestamp'),
            (open !== undefined) ? open : price,
            (high !== undefined) ? high : price,
            (low !== undefined) ? low : price,
            (close !== undefined) ? close : price,
            0,   // price_charts endpoint has no volume
        ];
    }

    /**
     * @method
     * @name myriad#fetchTickers
     * @description fetches tickers for multiple outcomes, grouping requested outcomes by their parent market to fetch each market only once
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string[]} [outcomes] unified outcomes, refreshes the markets listing and returns tickers for all outcomes when omitted
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure) indexed by outcome
     */
    async fetchTickers (outcomes: Strings = undefined, params = {}): Promise<PredictionTickers> {
        this.ensureOutcomesLoaded ();
        const result: PredictionTickers = {};
        if (outcomes === undefined) {
            const rawMarkets = await this.fetchRawMarketsList (params);
            for (let i = 0; i < rawMarkets.length; i++) {
                const raw = rawMarkets[i];
                const m = this.parseMyriadMarket (raw);
                const outcomesList = this.safeList (m, 'outcomes', []) as any[];
                for (let j = 0; j < outcomesList.length; j++) {
                    const ticker = this.parseTicker (raw, outcomesList[j]);
                    const symbolKey = this.safeString (ticker, 'outcome');
                    if (symbolKey !== undefined) {
                        result[symbolKey] = ticker;
                    }
                }
            }
            return result;
        }
        // group target outcomes by their parent market to fetch each market only once
        const outcomesByMarket: Dict = {};
        const marketKeys: any[] = [];
        for (let i = 0; i < outcomes.length; i++) {
            const outcomeObj = this.outcome (outcomes[i]);
            const info = this.safeDict (outcomeObj, 'info', {});
            const networkId = this.safeString (info, 'networkId');
            const marketId = this.safeString (info, 'marketId');
            const key = networkId + ':' + marketId;
            if (!(key in outcomesByMarket)) {
                outcomesByMarket[key] = [];
                marketKeys.push (key);
            }
            // reassign after push, plain mutation through a local is lost in transpiled php (arrays are value types there)
            const grouped = outcomesByMarket[key];
            grouped.push (outcomeObj);
            outcomesByMarket[key] = grouped;
        }
        const promises: any[] = [];
        for (let i = 0; i < marketKeys.length; i++) {
            const key = marketKeys[i];
            const grouped = outcomesByMarket[key] as any[];
            const firstOutcome = grouped[0];
            const info = this.safeDict (firstOutcome, 'info', {});
            promises.push (this.myriadPublicGetMarketsId (this.extend ({
                'id': this.safeString (info, 'marketId'),
                'network_id': this.safeString (info, 'networkId'),
            }, params)));
        }
        const responses = await Promise.all (promises);
        for (let i = 0; i < marketKeys.length; i++) {
            const key = marketKeys[i];
            const response = responses[i];
            const grouped = outcomesByMarket[key] as any[];
            for (let j = 0; j < grouped.length; j++) {
                const outcomeObj = grouped[j];
                const ticker = this.parseTicker (response, outcomeObj);
                const symbolKey = this.safeString (ticker, 'outcome');
                if (symbolKey !== undefined) {
                    result[symbolKey] = ticker;
                }
            }
        }
        return result;
    }

    /**
     * @method
     * @name myriad#fetchTrades
     * @description fetches recent public trades for a single outcome from the market action feed
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {string} outcome unified outcome like TRUMP_WIN:YES or an outcome id
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)
     */
    async fetchTrades (outcome: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionTrade[]> {
        this.ensureOutcomesLoaded ();
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const networkId = this.safeString (info, 'networkId');
        const marketId = this.safeString (info, 'marketId');
        const outcomeId = this.safeString (info, 'outcomeId');
        const request: Dict = {
            'id': marketId,
            'network_id': networkId,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.myriadPublicGetMarketsIdEvents (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "user": "0xAE7Bfff784EeEe7812D6527B72c77A7Ed773Ed9D",
        //                 "action": "buy",
        //                 "marketTitle": "BNB candles from 10:00 to 10:05 UTC",
        //                 "marketSlug": "bnb-candles-from-10-00-to-10-05-utc",
        //                 "marketId": 218,
        //                 "networkId": 56,
        //                 "outcomeTitle": "More Green",
        //                 "outcomeId": 0,
        //                 "shares": 500,
        //                 "value": 500,
        //                 "timestamp": 1761645928,
        //                 "blockNumber": 66193433,
        //                 "token": "0x55d398326f99059fF775485246999027B3197955",
        //                 "txId": "0x3c81447bd6e5c4c80a6e1425383c0b044ddcb1525d09027c2b371ff84f9b9fa0"
        //             }
        //         ]
        //     }
        //
        const rowsList = this.safeList (response, 'data', response as any);
        const rows = (rowsList !== undefined) ? rowsList : [];
        const trades: any[] = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const action = this.safeString (row, 'action');
            if ((action !== 'buy') && (action !== 'sell')) {
                continue;
            }
            const rowOutcomeId = this.safeString (row, 'outcomeId');
            if ((outcomeId !== undefined) && (rowOutcomeId !== outcomeId)) {
                continue;
            }
            trades.push (row);
        }
        return this.parseTrades (trades, outcomeObj as any, since, limit) as PredictionTrade[];
    }

    /**
     * @ignore
     * @method
     * @name myriad#parseTrade
     * @description parses a raw market action feed row into a unified trade object
     * @param {object} trade the raw action feed row
     * @param {object} [market] the outcome object the trade belongs to
     * @returns {object} a [trade structure](https://docs.ccxt.com/#/?id=public-trades)
     */
    parseTrade (trade: Dict, market: Market = undefined): PredictionTrade {
        const timestamp = this.safeTimestamp (trade, 'timestamp');
        const amountStr = this.safeString (trade, 'shares');
        const costStr = this.safeString (trade, 'value');
        let priceStr = undefined;
        if ((amountStr !== undefined) && (costStr !== undefined) && !Precise.stringEq (amountStr, '0')) {
            priceStr = Precise.stringDiv (costStr, amountStr);
        }
        return this.safePredictionTrade ({
            'id': this.safeString (trade, 'txId'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'outcome': this.safeString (market, 'outcome'),
            'outcomeId': this.safeString (market, 'id'),
            'label': this.safeString (market, 'label'),
            'market': this.safeString (market, 'outcome'),
            'order': undefined,
            'type': undefined,
            'side': this.safeString (trade, 'action'),
            'takerOrMaker': 'taker',
            'price': this.parseNumber (priceStr),
            'amount': this.parseNumber (amountStr),
            'cost': this.parseNumber (costStr),
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name myriad#fetchEvents
     * @description fetches prediction-market events matching the given search terms (or all open markets when omitted) and caches their markets and outcomes on the instance
     * @see https://docs.myriad.markets/builders/myriad-api-reference
     * @param {object} [params] extra exchange-specific parameters
     * @param {string} [params.query] a single search term; when omitted (and no queries) returns the events cached by loadMarkets (capped by options.fetchMarketsLimit)
     * @param {string[]} [params.queries] multiple search terms (alternative to query)
     * @param {int} [params.limit] maximum number of markets per query, defaults to 50
     * @param {string} [params.state] 'open', 'closed' or 'resolved', defaults to 'open'
     * @returns {object[]} an array of event structures
     */
    async fetchEvents (params: fetchEventsParams = {}): Promise<PredictionEvent[]> {
        this.requireEventQuery (params);
        const queries = this.parseSearchQueries (params);
        const rest = this.omit (params, [ 'query', 'queries', 'sort', 'searchIn', 'eventId', 'slug', 'status' ]);
        const queriesLength = queries.length;
        if (queriesLength === 0) {
            this.populateOutcomes ();
            // hoist Object.values to a local — inline as a call argument breaks the php regex transpiler
            const existingEvents = Object.values (this.events as Dict) as any[];
            return this.applyEventFetchParams (existingEvents, params, queries);
        }
        const rawMarkets = await this.fetchRawMarketsBySearch (queries, rest);
        if (!this.events) {
            this.events = {};
        }
        if (!this.markets) {
            this.markets = this.createSafeDictionary ();
        }
        const result: any[] = [];
        for (let i = 0; i < rawMarkets.length; i++) {
            const raw = rawMarkets[i];
            const m = this.parseMyriadMarket (raw);
            this.markets[m['symbol'] as string] = m;
            const ev = this.parseMarketToEvent (raw, m);
            const evKey = this.safeString (ev, 'event');
            if (evKey !== undefined) {
                this.events[evKey] = ev;
                result.push (ev);
            }
        }
        this.populateOutcomes ();
        return this.applyEventFetchParams (result, params, queries);
    }

    /**
     * @ignore
     * @method
     * @name myriad#ensureOutcomesLoaded
     * @description rebuilds the outcome caches from the loaded markets when they are empty
     * @returns {undefined}
     */
    ensureOutcomesLoaded () {
        if ((this.outcomes === undefined) || this.isEmpty (this.outcomes)) {
            this.populateOutcomes ();
        }
    }

    /**
     * @ignore
     * @method
     * @name myriad#populateOutcomes
     * @description rebuilds this.outcomes and this.outcomes_by_id from the outcomes of every loaded market
     * @returns {undefined}
     */
    populateOutcomes () {
        this.outcomes = {};
        this.outcomes_by_id = {};
        const marketKeys = Object.keys (this.markets);
        for (let i = 0; i < marketKeys.length; i++) {
            const market = this.markets[marketKeys[i]] as Dict;
            const outcomesList = this.safeList (market, 'outcomes', []) as any[];
            for (let j = 0; j < outcomesList.length; j++) {
                const oc = outcomesList[j];
                // accept the legacy outcome/id keys too: in Go/C#/Java the prediction
                // setMarkets override is not dispatched, so oc is not pre-normalized
                const ocSymbol = this.safeString2 (oc, 'outcome', 'symbol');
                const ocId = this.safeString2 (oc, 'outcomeId', 'id');
                oc['outcome'] = ocSymbol;
                oc['outcomeId'] = ocId;
                oc['market'] = this.safeString2 (oc, 'market', 'marketSymbol');
                if (ocSymbol !== undefined) {
                    this.outcomes[ocSymbol] = oc;
                }
                if (ocId !== undefined) {
                    this.outcomes_by_id[ocId] = oc;
                }
            }
        }
    }

    /**
     * @ignore
     * @method
     * @name myriad#parseEvent
     * @description parses a raw myriad question object into the unified event shape with a nested markets list
     * @param {object} rawEvent the raw myriad question object
     * @returns {object} an event structure
     */
    parseEvent (rawEvent: Dict): any {
        const questionSlug = this.safeString (rawEvent, 'slug', this.safeString (rawEvent, 'id'));
        const rawMarkets = this.safeList (rawEvent, 'markets', []) as any[];
        const marketsList: Market[] = [];
        for (let i = 0; i < rawMarkets.length; i++) {
            const rawMarket = rawMarkets[i];
            marketsList.push (this.parseMyriadMarket (rawMarket, questionSlug));
        }
        const endDate = this.safeString (rawEvent, 'expiresAt', this.safeString (rawEvent, 'endDate'));
        return this.extend (rawEvent, {
            'id': this.safeString (rawEvent, 'id'),
            'slug': questionSlug,
            'event': questionSlug ? this.shortenSlug (questionSlug) : undefined,
            'title': this.safeString (rawEvent, 'title'),
            'description': this.safeString (rawEvent, 'description'),
            'markets': marketsList,
            'volume': this.safeNumber2 (rawEvent, 'volumeNotional24h', 'volume24h'),
            'liquidity': this.safeNumber (rawEvent, 'liquidity'),
            'url': this.safeString (rawEvent, 'url'),
            'image': this.safeString (rawEvent, 'imageUrl', this.safeString (rawEvent, 'image')),
            'active': this.safeBool (rawEvent, 'active'),
            'resolved': this.safeBool (rawEvent, 'resolved', false),
            'category': this.safeString (rawEvent, 'category'),
            'tags': this.safeList (rawEvent, 'tags'),
            'created': this.parse8601 (this.safeString (rawEvent, 'createdAt')),
            'createdDatetime': this.safeString (rawEvent, 'createdAt'),
            'end': endDate ? this.parse8601 (endDate) : undefined,
            'endDatetime': endDate,
            'lastUpdatedAt': this.parse8601 (this.safeString (rawEvent, 'updatedAt')),
            'resolutionSource': this.safeString (rawEvent, 'resolutionSource'),
            'info': rawEvent,
        }) as any;
    }

    requestId (url: string): number {
        const existing = this.safeValue (this.options, 'requestId');
        if (existing === undefined) {
            this.options['requestId'] = this.createSafeDictionary ();
        }
        const options = this.options['requestId'];
        const previousValue = this.safeInteger (options, url, 0);
        const newValue = this.sum (previousValue, 1);
        this.options['requestId'][url] = newValue;
        return newValue;
    }

    fromWei (wei: Str): Num {
        if (wei === undefined) {
            return undefined;
        }
        return this.parseNumber (Precise.stringDiv (wei, '1000000000000000000'));
    }

    marketOutcomeToSymbol (networkId: Str, marketId: Str, outcomeId: Str): Str {
        // guard the ids before concatenating: a missing id would crash on string + None in Python/PHP
        if ((networkId === undefined) || (marketId === undefined) || (outcomeId === undefined)) {
            return undefined;
        }
        const ocId = networkId + ':' + marketId + '/' + outcomeId;
        const outcomeObj = this.safeDict (this.outcomes_by_id, ocId);
        return this.safeString (outcomeObj, 'outcome');
    }

    async connectCentrifugo (url: string): Promise<any> {
        // Centrifugo requires an anonymous connect command before any subscribe. This sends it once per
        // connection and resolves when the connect reply arrives (see handleCentrifugoFrame). The base
        // clears client.subscriptions on reconnect, so an absent 'connect' marker means a fresh handshake.
        const client = this.client (url);
        const connectSent = this.safeValue (client.subscriptions, 'connect');
        if (connectSent === undefined) {
            this.options['wsConnected'] = false;
            const requestId = this.requestId (url);
            // give the anonymous connect a name so the params object is non-empty (PHP serialises an
            // empty array as a JSON array, which Centrifugo rejects)
            const connectMsg: Dict = { 'connect': { 'name': 'ccxt' }, 'id': requestId };
            return await this.watch (url, 'centrifugoConnected', connectMsg, 'connect');
        }
        if (this.safeBool (this.options, 'wsConnected', false)) {
            // the connect reply already arrived on this connection — safe to subscribe immediately
            return undefined;
        }
        // connect is in flight (sent by a concurrent subscribe) — wait on the shared reply future
        return await client.future ('centrifugoConnected');
    }

    async pong (client, message = undefined) {
        // Centrifugo server pings are empty frames; reply with the same empty frame to keep the link alive
        await client.send ('{}');
    }

    async subscribeMyriadChannel (messageHash: string, channel: string, params = {}): Promise<any> {
        const url = this.safeString (this.urls['api'] as Dict, 'ws');
        // finish the connect handshake first so the subscribe frame is sent after the connect reply
        await this.connectCentrifugo (url);
        const requestId = this.requestId (url);
        const subscribeMsg: Dict = { 'subscribe': { 'channel': channel }, 'id': requestId };
        return await this.watch (url, messageHash, subscribeMsg, channel);
    }

    handleMessage (client, message) {
        // Centrifugo packs several commands per frame joined by \n; a multi-command frame fails the
        // base JSON.parse and arrives here as a raw string, a single command arrives already parsed
        if (typeof message === 'string') {
            const lines = message.split ('\n');
            const linesLength = lines.length;
            for (let i = 0; i < linesLength; i++) {
                const line = lines[i];
                if (line.length > 0) {
                    const parsed = JSON.parse (line);
                    this.handleCentrifugoFrame (client, parsed);
                }
            }
            return;
        }
        this.handleCentrifugoFrame (client, message);
    }

    handleCentrifugoFrame (client, msg) {
        const keys = Object.keys (msg);
        const keysLength = keys.length;
        if (keysLength === 0) {
            this.spawn (this.pong, client, msg);
            return;
        }
        const connectReply = this.safeDict (msg, 'connect');
        if (connectReply !== undefined) {
            // connect acknowledged — unblock connectCentrifugo so channel subscribes can be sent
            this.options['wsConnected'] = true;
            client.resolve (true, 'centrifugoConnected');
            return;
        }
        const push = this.safeDict (msg, 'push');
        if (push === undefined) {
            return;
        }
        const channel = this.safeString (push, 'channel');
        if (channel === undefined) {
            return;
        }
        const pub = this.safeDict (push, 'pub', {});
        const data = this.safeDict (pub, 'data', {});
        const parts = channel.split (':');
        const channelType = this.safeString (parts, 0);
        if (channelType === 'orderbook') {
            this.handleOrderBook (client, data);
        } else if (channelType === 'trades') {
            this.handleTrades (client, data);
        } else if (channelType === 'prices') {
            this.handleTicker (client, data);
        } else if (channelType === 'orders') {
            this.handleOrder (client, data);
        } else if (channelType === 'positions') {
            this.handlePosition (client, data);
        }
    }

    /**
     * @method
     * @name myriad#watchOrderBook
     * @description streams the order book for an outcome over the Centrifugo websocket; the channel is delta-only so the book is seeded from the REST snapshot
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa
     * @param {string} outcome unified outcome
     * @param {int} [limit] the maximum number of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    async watchOrderBook (outcome: string, limit: Int = undefined, params = {}): Promise<PredictionOrderBook> {
        this.ensureOutcomesLoaded ();
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const networkId = this.safeString (info, 'networkId');
        const marketId = this.safeString (info, 'marketId');
        const sym = this.safeOutcomeSymbol (outcome, outcomeObj);
        const channel = 'orderbook:' + networkId + ':' + marketId;
        const messageHash = 'orderbook::' + sym;
        const url = this.safeString (this.urls['api'] as Dict, 'ws');
        // finish the connect handshake first so the client exists and the subscribe follows the connect reply
        await this.connectCentrifugo (url);
        const client = this.client (url);
        const isNewSubscription = this.safeValue (client.subscriptions, channel) === undefined;
        if (isNewSubscription) {
            // the channel only streams deltas, so (re)seed the live book from the REST snapshot on a
            // fresh subscription (first call or after a reconnect that cleared client.subscriptions)
            await this.seedOrderBook (outcome, sym, limit);
        }
        const requestId = this.requestId (url);
        const subscribeMsg: Dict = { 'subscribe': { 'channel': channel }, 'id': requestId };
        const future = this.watch (url, messageHash, subscribeMsg, channel);
        if (isNewSubscription) {
            // return the freshly-seeded book immediately instead of blocking until the next delta
            client.resolve (this.orderbooks[sym], messageHash);
        }
        const orderbook = await future;
        return orderbook.limit ();
    }

    async seedOrderBook (outcome: string, sym: string, limit: Int = undefined) {
        // the order book channel streams deltas only, so seed the live book from the REST snapshot
        const snapshot = await this.fetchOrderBook (outcome, limit);
        const orderbook = this.orderBook ({});
        orderbook.reset (snapshot);
        this.orderbooks[sym] = orderbook;
    }

    handleOrderBook (client, data) {
        const networkId = this.safeString (data, 'networkId');
        const marketId = this.safeString (data, 'marketId');
        const ts = this.safeInteger (data, 'ts');
        const changes = this.safeList (data, 'changes', []);
        const changesLength = changes.length;
        const updated: Dict = {};
        for (let i = 0; i < changesLength; i++) {
            const change = changes[i];
            const outcomeId = this.safeString (change, 'outcome');
            const sym = this.marketOutcomeToSymbol (networkId, marketId, outcomeId);
            if (sym === undefined) {
                continue;
            }
            if (this.safeValue (this.orderbooks, sym) === undefined) {
                continue;
            }
            const orderbook = this.orderbooks[sym];
            const price = this.fromWei (this.safeString (change, 'price'));
            const amount = this.fromWei (this.safeString (change, 'amount'));
            const sideStr = this.safeString (change, 'side');
            const bookSide = (sideStr === 'bid') ? orderbook['bids'] : orderbook['asks'];
            bookSide.storeArray ([ price, amount ]);
            orderbook['timestamp'] = ts;
            orderbook['datetime'] = this.iso8601 (ts);
            updated[sym] = true;
        }
        const updatedSymbols = Object.keys (updated);
        const updatedLength = updatedSymbols.length;
        for (let k = 0; k < updatedLength; k++) {
            const sym = updatedSymbols[k];
            client.resolve (this.orderbooks[sym], 'orderbook::' + sym);
        }
    }

    /**
     * @method
     * @name myriad#watchTrades
     * @description streams public trades for an outcome over the Centrifugo websocket
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa
     * @param {string} outcome unified outcome
     * @param {int} [since] timestamp in ms of the earliest trade
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)
     */
    async watchTrades (outcome: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionTrade[]> {
        this.ensureOutcomesLoaded ();
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const networkId = this.safeString (info, 'networkId');
        const marketId = this.safeString (info, 'marketId');
        const sym = this.safeOutcomeSymbol (outcome, outcomeObj);
        const channel = 'trades:' + networkId + ':' + marketId;
        const messageHash = 'trades::' + sym;
        const trades = await this.subscribeMyriadChannel (messageHash, channel, params);
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true) as PredictionTrade[];
    }

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
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    async watchMyTrades (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionTrade[]> {
        if (outcome === undefined) {
            throw new ArgumentsRequired (this.id + ' watchMyTrades() requires a outcome (the trades channel is per-market)');
        }
        this.ensureOutcomesLoaded ();
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const networkId = this.safeString (info, 'networkId');
        const marketId = this.safeString (info, 'marketId');
        const sym = this.safeOutcomeSymbol (outcome, outcomeObj);
        const channel = 'trades:' + networkId + ':' + marketId;
        const messageHash = 'myTrades';
        const trades = await this.subscribeMyriadChannel (messageHash, channel, params);
        return this.filterByValueSinceLimit (trades, 'outcome', sym, since, limit, 'timestamp', true) as PredictionTrade[];
    }

    walletAddressOrUndefined (): Str {
        // like walletAddressFromKeys but returns undefined instead of throwing when no wallet is configured
        if ((this.walletAddress !== undefined) && (this.walletAddress.length > 0)) {
            return this.walletAddress.toLowerCase ();
        }
        if (this.privateKey !== undefined) {
            return this.ethGetAddressFromPrivateKey (this.privateKey).toLowerCase ();
        }
        return undefined;
    }

    handleTrades (client, data) {
        const networkId = this.safeString (data, 'networkId');
        const marketId = this.safeString (data, 'marketId');
        const ts = this.safeInteger (data, 'ts');
        const txHash = this.safeString (data, 'txHash');
        const taker = this.safeDict (data, 'taker', {});
        const outcomeId = this.safeString (taker, 'outcome');
        const sym = this.marketOutcomeToSymbol (networkId, marketId, outcomeId);
        if (sym === undefined) {
            return;
        }
        const market = this.safeMarket (sym);
        const outcomeObj = this.safeOutcome (sym);
        // the trades channel reports human-decimal values (averagePrice "0.14", totalAmount "1"),
        // unlike the orders channel which is 1e18-scaled — so read them directly without fromWei
        const fees = this.safeDict (taker, 'totalFees', {});
        const trade = this.safePredictionTrade ({
            'id': txHash,
            'info': data,
            'timestamp': ts,
            'datetime': this.iso8601 (ts),
            'outcome': sym,
            'outcomeId': this.safeString (outcomeObj, 'id'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'outcome'),
            'order': this.safeString (taker, 'orderHash'),
            'type': undefined,
            'side': this.safeStringLower (taker, 'side'),
            'takerOrMaker': 'taker',
            'price': this.safeNumber (taker, 'averagePrice'),
            'amount': this.safeNumber (taker, 'totalAmount'),
            'cost': undefined,
            'fee': {
                'cost': this.safeNumber (fees, 'total'),
                'currency': this.safeString (market, 'quote'),
            },
        }, market);
        if (this.trades === undefined) {
            this.trades = this.createSafeDictionary ();
        }
        if (this.safeValue (this.trades, sym) === undefined) {
            const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[sym] = new ArrayCache (tradesLimit);
        }
        const stored = this.trades[sym];
        stored.append (trade);
        client.resolve (stored, 'trades::' + sym);
        // also surface the wallet's own fills (taker or maker leg) with their real execution prices
        const myWallet = this.walletAddressOrUndefined ();
        if (myWallet !== undefined) {
            const myLegs = [];
            const takerTrader = this.safeStringLower (taker, 'trader');
            if (takerTrader === myWallet) {
                myLegs.push (trade);
            }
            const makers = this.safeList (data, 'makers', []);
            const makersLength = makers.length;
            for (let i = 0; i < makersLength; i++) {
                const maker = makers[i];
                const makerTrader = this.safeStringLower (maker, 'trader');
                if (makerTrader === myWallet) {
                    const makerSym = this.marketOutcomeToSymbol (networkId, marketId, this.safeString (maker, 'outcome'));
                    const makerMarket = this.safeMarket (makerSym);
                    const makerOutcomeObj = this.safeOutcome (makerSym);
                    const makerFees = this.safeDict (maker, 'fees', {});
                    const makerTrade = this.safePredictionTrade ({
                        'id': txHash,
                        'info': maker,
                        'timestamp': ts,
                        'datetime': this.iso8601 (ts),
                        'outcome': makerSym,
                        'outcomeId': this.safeString (makerOutcomeObj, 'id'),
                        'label': this.safeString (makerOutcomeObj, 'label'),
                        'market': this.safeString (makerOutcomeObj, 'outcome'),
                        'order': this.safeString (maker, 'orderHash'),
                        'type': undefined,
                        'side': this.safeStringLower (maker, 'side'),
                        'takerOrMaker': 'maker',
                        'price': this.safeNumber (maker, 'price'),
                        'amount': this.safeNumber (maker, 'amount'),
                        'cost': undefined,
                        'fee': {
                            'cost': this.safeNumber (makerFees, 'total'),
                            'currency': this.safeString (makerMarket, 'quote'),
                        },
                    }, makerMarket);
                    myLegs.push (makerTrade);
                }
            }
            const myLegsLength = myLegs.length;
            if (myLegsLength > 0) {
                if (this.myTrades === undefined) {
                    const myTradesLimit = this.safeInteger (this.options, 'myTradesLimit', 1000);
                    this.myTrades = new ArrayCacheByOutcomeById (myTradesLimit);
                }
                const myStored = this.myTrades;
                for (let k = 0; k < myLegsLength; k++) {
                    myStored.append (myLegs[k]);
                }
                client.resolve (myStored, 'myTrades');
            }
        }
    }

    /**
     * @method
     * @name myriad#watchTicker
     * @description streams best bid/ask/last for an outcome over the Centrifugo prices channel
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa
     * @param {string} outcome unified outcome
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    async watchTicker (outcome: string, params = {}): Promise<PredictionTicker> {
        this.ensureOutcomesLoaded ();
        const outcomeObj = this.outcome (outcome);
        const info = this.safeDict (outcomeObj, 'info', {});
        const networkId = this.safeString (info, 'networkId');
        const marketId = this.safeString (info, 'marketId');
        const sym = this.safeOutcomeSymbol (outcome, outcomeObj);
        const channel = 'prices:' + networkId + ':' + marketId;
        const messageHash = 'ticker::' + sym;
        return await this.subscribeMyriadChannel (messageHash, channel, params);
    }

    /**
     * @method
     * @name myriad#watchTickers
     * @description streams best bid/ask/last for several outcomes over the Centrifugo prices channels
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa
     * @param {string[]} outcomes unified outcomes to watch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dict of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure) indexed by outcome
     */
    async watchTickers (outcomes: Strings = undefined, params = {}): Promise<PredictionTickers> {
        this.ensureOutcomesLoaded ();
        if (outcomes === undefined) {
            throw new ArgumentsRequired (this.id + ' watchTickers() requires a list of outcomes (the prices channel is per-market)');
        }
        const symbolsLength = outcomes.length;
        const url = this.safeString (this.urls['api'] as Dict, 'ws');
        await this.connectCentrifugo (url);
        const client = this.client (url);
        const seenChannels: Dict = {};
        const resolvedSymbols = [];
        for (let i = 0; i < symbolsLength; i++) {
            const outcomeObj = this.outcome (outcomes[i]);
            const info = this.safeDict (outcomeObj, 'info', {});
            const networkId = this.safeString (info, 'networkId');
            const marketId = this.safeString (info, 'marketId');
            const channel = 'prices:' + networkId + ':' + marketId;
            resolvedSymbols.push (this.safeOutcomeSymbol (outcomes[i], outcomeObj));
            if (this.safeValue (seenChannels, channel) === undefined) {
                seenChannels[channel] = true;
                const requestId = this.requestId (url);
                const subscribeMsg: Dict = { 'subscribe': { 'channel': channel }, 'id': requestId };
                this.watch (url, 'tickers', subscribeMsg, channel);
            }
        }
        const tickers = await client.future ('tickers');
        return this.filterByArray (tickers, 'outcome', resolvedSymbols, true) as PredictionTickers;
    }

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
    async watchOHLCV (outcome: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        // Myriad has no OHLCV websocket channel, so build candles from the live trade stream
        const trades = await this.watchTrades (outcome, since, limit, params);
        const ohlcvc = this.buildOHLCVC (trades, timeframe, 0, 2147483647);
        const result = [];
        const ohlcvcLength = ohlcvc.length;
        for (let i = 0; i < ohlcvcLength; i++) {
            const candle = ohlcvc[i];
            result.push ([ candle[0], candle[1], candle[2], candle[3], candle[4], candle[5] ]);
        }
        return this.filterBySinceLimit (result, since, limit, 0, true);
    }

    handleTicker (client, data) {
        const networkId = this.safeString (data, 'networkId');
        const marketId = this.safeString (data, 'marketId');
        const ts = this.safeInteger (data, 'ts');
        const outcomes = this.safeList (data, 'outcomes', []);
        const outcomesLength = outcomes.length;
        if (this.tickers === undefined) {
            this.tickers = this.createSafeDictionary ();
        }
        for (let i = 0; i < outcomesLength; i++) {
            const oc = outcomes[i];
            const outcomeId = this.safeString (oc, 'outcome');
            const sym = this.marketOutcomeToSymbol (networkId, marketId, outcomeId);
            if (sym === undefined) {
                continue;
            }
            const market = this.safeMarket (sym);
            const outcomeObj = this.safeOutcome (sym);
            const last = this.fromWei (this.safeString (oc, 'last'));
            const ticker = this.safePredictionTicker ({
                'outcome': sym,
                'outcomeId': this.safeString (outcomeObj, 'id'),
                'label': this.safeString (outcomeObj, 'label'),
                'market': this.safeString (outcomeObj, 'outcome'),
                'timestamp': ts,
                'datetime': this.iso8601 (ts),
                'high': undefined,
                'low': undefined,
                'bid': this.fromWei (this.safeString (oc, 'bestBid')),
                'bidVolume': undefined,
                'ask': this.fromWei (this.safeString (oc, 'bestAsk')),
                'askVolume': undefined,
                'vwap': undefined,
                'open': undefined,
                'close': last,
                'last': last,
                'previousClose': undefined,
                'change': undefined,
                'percentage': undefined,
                'average': undefined,
                'baseVolume': undefined,
                'quoteVolume': undefined,
                'info': oc,
            }, market);
            this.tickers[sym] = ticker;
            client.resolve (ticker, 'ticker::' + sym);
        }
        client.resolve (this.tickers, 'tickers');
    }

    /**
     * @method
     * @name myriad#watchOrders
     * @description streams the wallet's order lifecycle updates over the Centrifugo orders channel
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa
     * @param {string} [outcome] unified outcome to filter by
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async watchOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        this.ensureOutcomesLoaded ();
        const trader = this.walletAddressFromKeys ();
        let networkId = this.safeString (this.options, 'defaultNetworkId', '56');
        if (outcome !== undefined) {
            const outcomeObj = this.outcome (outcome);
            const info = this.safeDict (outcomeObj, 'info', {});
            networkId = this.safeString (info, 'networkId', networkId);
            outcome = this.safeOutcomeSymbol (outcome, outcomeObj);
        }
        const channel = 'orders:' + networkId + ':' + trader;
        const messageHash = 'orders';
        const orders = await this.subscribeMyriadChannel (messageHash, channel, params);
        return this.filterByValueSinceLimit (orders, 'outcome', outcome, since, limit, 'timestamp', true) as PredictionOrder[];
    }

    handleOrder (client, data) {
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheByOutcomeById (limit);
        }
        const networkId = this.safeString (data, 'networkId');
        const marketId = this.safeString (data, 'marketId');
        const outcomeId = this.safeString (data, 'outcome');
        const sym = this.marketOutcomeToSymbol (networkId, marketId, outcomeId);
        const outcomeObj = this.safeOutcome (sym);
        const price = this.fromWei (this.safeString (data, 'price'));
        const amount = this.fromWei (this.safeString (data, 'amount'));
        const filled = this.fromWei (this.safeString (data, 'filledAmount'));
        const status = this.parseOrderStatus (this.safeStringLower (data, 'status'));
        const tif = this.safeStringUpper (data, 'timeInForce');
        const isMarketTif = (tif === 'FOK') || (tif === 'FAK');
        const timestamp = this.parse8601 (this.safeString2 (data, 'updatedAt', 'createdAt'));
        const parsed = this.safePredictionOrder ({
            'id': this.safeString (data, 'orderHash'),
            'clientOrderId': undefined,
            'info': data,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'outcome': sym,
            'outcomeId': this.safeString (outcomeObj, 'id'),
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'outcome'),
            'type': isMarketTif ? 'market' : 'limit',
            'timeInForce': tif,
            'side': this.safeStringLower (data, 'side'),
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'average': undefined,
            'cost': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        });
        const stored = this.orders;
        stored.append (parsed);
        client.resolve (stored, 'orders');
        if (sym !== undefined) {
            client.resolve (stored, 'orders::' + sym);
        }
    }

    /**
     * @method
     * @name myriad#watchPositions
     * @description streams the wallet's share-balance changes over the Centrifugo positions channel
     * @see https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa
     * @param {string[]} [outcomes] unified outcomes to filter by
     * @param {int} [since] timestamp in ms of the earliest position update
     * @param {int} [limit] the maximum number of position updates to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    async watchPositions (outcomes: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionPosition[]> {
        this.ensureOutcomesLoaded ();
        const trader = this.walletAddressFromKeys ();
        const networkId = this.safeString (this.options, 'defaultNetworkId', '56');
        const channel = 'positions:' + networkId + ':' + trader;
        const messageHash = 'positions';
        const url = this.safeString (this.urls['api'] as Dict, 'ws');
        await this.connectCentrifugo (url);
        const client = this.client (url);
        const isNewSubscription = this.safeValue (client.subscriptions, channel) === undefined;
        if (isNewSubscription) {
            // the channel pushes only signed deltas; seed absolute share balances from REST so
            // handlePosition can maintain a running contracts figure
            await this.seedPositionBalances (trader);
        }
        const requestId = this.requestId (url);
        const subscribeMsg: Dict = { 'subscribe': { 'channel': channel }, 'id': requestId };
        const positions = await this.watch (url, messageHash, subscribeMsg, channel);
        if (this.newUpdates) {
            return positions;
        }
        return this.filterByOutcomesSinceLimit (positions, outcomes, since, limit, true) as PredictionPosition[];
    }

    async seedPositionBalances (trader: string) {
        const positions = await this.fetchPositions (undefined, { 'address': trader });
        const balances: Dict = {};
        const positionsLength = positions.length;
        for (let i = 0; i < positionsLength; i++) {
            const p = positions[i];
            const id = this.safeString (p, 'id');
            if (id !== undefined) {
                balances[id] = this.numberToString (this.safeNumber (p, 'contracts', 0));
            }
        }
        this.options['positionBalances'] = balances;
    }

    handlePosition (client, data) {
        if (this.positions === undefined) {
            const limit = this.safeInteger (this.options, 'positionsLimit', 1000);
            this.positions = new ArrayCacheByOutcomeById (limit);
        }
        const networkId = this.safeString (data, 'networkId');
        const marketId = this.safeString (data, 'marketId');
        const outcomeId = this.safeString (data, 'outcome');
        const sym = this.marketOutcomeToSymbol (networkId, marketId, outcomeId);
        const outcomeObj = this.safeOutcome (sym);
        const ts = this.safeInteger (data, 'ts');
        // the channel pushes a signed share delta per fill/redeem/split/merge (no absolute balance);
        // apply it to the REST-seeded balance keyed by outcome id to maintain a running contracts figure
        let deltaStr = this.safeString (data, 'delta', '0');
        const firstChar = deltaStr.slice (0, 1);
        if (firstChar === '+') {
            deltaStr = deltaStr.slice (1);
        }
        const deltaShares = Precise.stringDiv (deltaStr, '1000000000000000000');
        let contracts = undefined;
        let posId = undefined;
        if ((networkId !== undefined) && (marketId !== undefined) && (outcomeId !== undefined)) {
            posId = networkId + ':' + marketId + '/' + outcomeId;
            const balances = this.safeDict (this.options, 'positionBalances', {});
            const prior = this.safeString (balances, posId, '0');
            const updated = Precise.stringAdd (prior, deltaShares);
            balances[posId] = updated;
            this.options['positionBalances'] = balances;
            contracts = this.parseNumber (updated);
        }
        const parsed = this.safePredictionPosition ({
            'info': data,
            'id': posId,
            'outcome': sym,
            'outcomeId': posId,
            'label': this.safeString (outcomeObj, 'label'),
            'market': this.safeString (outcomeObj, 'outcome'),
            'timestamp': ts,
            'datetime': this.iso8601 (ts),
            'side': 'long',
            'contracts': contracts,
            'entryPrice': undefined,
            'markPrice': undefined,
            'notional': undefined,
            'collateral': undefined,
            'unrealizedPnl': undefined,
        });
        const stored = this.positions;
        stored.append (parsed);
        client.resolve (stored, 'positions');
    }

    walletAddressFromKeys (): string {
        // the orders/positions channels are keyed by the lowercase trader address (Centrifugo channels
        // are case-sensitive); lowercase here so the channel matches regardless of the address checksum.
        // check length too: an unset walletAddress is an empty string (not undefined) in some languages
        let address = this.walletAddress;
        const hasWallet = (address !== undefined) && (this.walletAddress.length > 0);
        if (!hasWallet) {
            if (this.privateKey === undefined) {
                throw new ArgumentsRequired (this.id + ' requires a walletAddress or privateKey to watch private channels');
            }
            address = this.ethGetAddressFromPrivateKey (this.privateKey);
        }
        return address.toLowerCase ();
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        // Myriad error responses are { "error": "<message>", "details": [...] } with a 4xx status
        if (response === undefined) {
            return undefined;
        }
        const error = this.safeString (response, 'error');
        if ((error === undefined) || (error === '')) {
            return undefined;
        }
        const feedback = this.id + ' ' + body;
        this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
        throw new ExchangeError (feedback);
    }

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
    sign (path: any, api: any = 'myriad', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        const apiGroup: string = typeof api === 'string' ? api : api[0];
        const baseUrls = this.urls['api'] as Dict;
        const baseUrl = this.safeString (baseUrls, apiGroup, baseUrls['myriad'] as string);
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            const querystring = this.urlencode (query);
            if (querystring) {
                url += '?' + querystring;
            }
        }
        const existingHeaders = (headers !== undefined) ? headers : {};
        headers = this.extend ({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }, existingHeaders);
        // non-GET requests carry the params as a JSON body (public POSTs like markets/quote
        // included — the previous logic only sent a body for authenticated requests)
        if (method !== 'GET') {
            const queryKeys = Object.keys (query);
            const queryKeysLength = queryKeys.length;
            if (queryKeysLength > 0) {
                body = this.json (query);
            }
        }
        if (this.apiKey) {
            headers = this.extend (headers, { 'x-api-key': this.apiKey });
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
