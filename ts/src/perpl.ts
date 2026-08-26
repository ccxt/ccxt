//  ---------------------------------------------------------------------------

import { sha256 } from '@noble/hashes/sha2.js';
import { ed25519 } from '@noble/curves/ed25519.js';
import Exchange from './abstract/perpl.js';
import { AuthenticationError, BadRequest, BadSymbol, OperationRejected, PermissionDenied } from './base/errors.js';
import Precise from './base/Precise.js';
import { eddsa } from './base/functions/crypto.js';
import type { Currencies, Currency, CurrencyInterface, Dict, Endpoint, FundingHistory, FundingRate, FundingRateHistory, FundingRates, Int, LastPrice, LastPrices, LedgerEntry, MarginModification, Market, NullableDict, Num, OHLCV, OpenInterest, OpenInterests, Order, Position, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class perpl
 * @augments Exchange
 */
export default class perpl extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'perpl',
            'name': 'Perpl',
            'countries': [],
            'version': 'v1',
            'rateLimit': 1000, // REST limits are unpublished and may change without notice
            'certified': false,
            'pro': false,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'cancelOrder': false,
                'cancelOrderWs': false,
                'createLimitOrder': false,
                'createMarketOrder': false,
                'createMarketOrderWs': false,
                'createOrder': false,
                'createOrderWs': false,
                'editOrder': false,
                'editOrderWs': false,
                'fetchBalance': false,
                'fetchBidsAsks': 'emulated',
                'fetchCanceledOrders': 'emulated',
                'fetchClosedOrders': 'emulated',
                'fetchCurrencies': true,
                'fetchCurrenciesWs': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': true,
                'fetchFundingHistory': true,
                'fetchFundingIntervals': 'emulated',
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchL2OrderBook': false,
                'fetchLastPrices': true,
                'fetchLedger': true,
                'fetchMarginAdjustmentHistory': true,
                'fetchMarkets': true,
                'fetchMarkPrices': 'emulated',
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': 'emulated',
                'fetchOpenInterests': true,
                'fetchOpenOrders': 'emulated',
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': true,
                'fetchPositions': false,
                'fetchPositionsHistory': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': false,
                'fetchTransactions': 'emulated',
                'fetchWithdrawals': true,
                'sandbox': true,
                'watchBalance': false,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': false,
                'watchOrders': false,
                'watchPositions': false,
                'watchTicker': false,
                'watchTrades': false,
                'ws': false,
            },
            'timeframes': {
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '30m': '1800',
                '1h': '3600',
                '2h': '7200',
                '4h': '14400',
                '8h': '28800',
                '12h': '43200',
                '1d': '86400',
            },
            'urls': {
                'api': {
                    'public': 'https://app.perpl.xyz/api',
                    'private': 'https://app.perpl.xyz/api',
                },
                'test': {
                    'public': 'https://testnet.perpl.xyz/api',
                    'private': 'https://testnet.perpl.xyz/api',
                },
                'www': 'https://perpl.xyz',
                'doc': [
                    'https://docs.perpl.xyz/',
                    'https://github.com/PerplFoundation/api-docs',
                ],
                'fees': 'https://docs.perpl.xyz/exchange/fees',
            },
            'api': {
                // relative costs only, REST limits are not published
                'public': {
                    'get': {
                        'v1/pub/context': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market-data/{market_id}/candles/{resolution}/{from}-{to}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market-data/{market_id}/funding/{from}-{to}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market-data/funding/{from}-{to}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/profile/announcements': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'post': {
                        'v1/api-key/payload': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api-key/enroll': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
                'private': {
                    'get': {
                        'v1/profile/ref-code': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trading/account-history': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trading/fills': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trading/order-history': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trading/position-history': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'httpExceptions': {
                '400': BadRequest, // Bad Request
                '401': AuthenticationError, // Missing/invalid headers, bad or stale signature, replayed nonce, revoked/expired key, IP not allowed
                '403': PermissionDenied, // Forbidden - scope insufficient
                '409': OperationRejected, // Public key already registered
                '423': OperationRejected, // Per-profile key limit reached
            },
            'options': {
                'defaultType': 'swap',
                'chainId': 143,
                'sandboxChainId': 10143,
            },
            'features': {},
        });
    }

    /**
     * @method
     * @name perpl#fetchMarkets
     * @description retrieves data on all markets for perpl
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1pubcontext
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetV1PubContext (params);
        //
        //     {
        //         "instances": [
        //             {
        //                 "ver": 150,
        //                 "id": 1,
        //                 "address": "0x34b6552d57a35a1d042ccae1951bd1c370112a6f",
        //                 "collateral_token_id": 1,
        //                 "min_account_open_amount": "10000000",
        //                 "min_deposit_amount": "10000000",
        //                 "min_withdraw_amount": "10000",
        //                 "max_account_equity": "1000000000000",
        //                 "max_account_trigger_orders": 16
        //             }
        //         ],
        //         "tokens": [
        //             {
        //                 "ver": 150,
        //                 "id": 1,
        //                 "address": "0x00000000efe302beaa2b3e6e1b18d08d69a9012a",
        //                 "symbol": "AUSD",
        //                 "name": "AUSD",
        //                 "decimals": 6,
        //                 "display_precision": 2,
        //                 "usd_index": "<index_name>"
        //             }
        //         ],
        //         "markets": [
        //             {
        //                 "ver": 150,
        //                 "id": 1,
        //                 "instance_id": 1,
        //                 "perpetual_id": 1,
        //                 "symbol": "",
        //                 "name": "BTC",
        //                 "size_units": "BTC",
        //                 "funding_interval_sec": 2580,
        //                 "funding_interval_blocks": 8571,
        //                 "order_ttl_blocks": 20,
        //                 "order_retry_blocks": 22,
        //                 "order_max_market_slippage_bps": 100,
        //                 "config": {
        //                     "is_open": true,
        //                     "price_decimals": 1,
        //                     "size_decimals": 5,
        //                     "initial_margin": 1500,
        //                     "maintenance_margin": 2500,
        //                     "maker_fee": 90,
        //                     "taker_fee": 690
        //                 }
        //             }
        //         ]
        //     }
        //
        const instances = this.safeList (response, 'instances', []);
        const tokens = this.safeList (response, 'tokens', []);
        const markets = this.safeList (response, 'markets', []);
        const instancesById: Dict = {};
        for (let i = 0; i < instances.length; i++) {
            const instance = instances[i];
            const instanceId = this.safeString (instance, 'id');
            if (instanceId !== undefined) {
                instancesById[instanceId] = instance;
            }
        }
        const tokensById: Dict = {};
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const tokenId = this.safeString (token, 'id');
            if (tokenId !== undefined) {
                tokensById[tokenId] = token;
            }
        }
        const result: Market[] = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const instanceId = this.safeString (market, 'instance_id');
            const instance = this.safeDict (instancesById, instanceId, {});
            const collateralTokenId = this.safeString (instance, 'collateral_token_id');
            const collateralToken = this.safeDict (tokensById, collateralTokenId, {});
            const marketWithContext: Dict = {
                'market': market,
                'instance': instance,
                'collateralToken': collateralToken,
            };
            const parsedMarket = this.parseMarket (marketWithContext);
            if (parsedMarket !== undefined) {
                result.push (parsedMarket);
            }
        }
        return result;
    }

    override parseMarket (market: Dict): Market {
        //
        //     {
        //         "market": {
        //             "ver": 150,
        //             "id": 1,
        //             "instance_id": 1,
        //             "perpetual_id": 1,
        //             "symbol": "",
        //             "name": "BTC",
        //             "size_units": "BTC",
        //             "funding_interval_sec": 2580,
        //             "funding_interval_blocks": 8571,
        //             "order_ttl_blocks": 20,
        //             "order_retry_blocks": 22,
        //             "order_max_market_slippage_bps": 100,
        //             "config": {
        //                 "is_open": true,
        //                 "price_decimals": 1,
        //                 "size_decimals": 5,
        //                 "initial_margin": 1500,
        //                 "maintenance_margin": 2500,
        //                 "maker_fee": 90,
        //                 "taker_fee": 690
        //             }
        //         },
        //         "instance": {
        //             "ver": 150,
        //             "id": 1,
        //             "address": "0x34b6552d57a35a1d042ccae1951bd1c370112a6f",
        //             "collateral_token_id": 1
        //         },
        //         "collateralToken": {
        //             "ver": 150,
        //             "id": 1,
        //             "address": "0x00000000efe302beaa2b3e6e1b18d08d69a9012a",
        //             "symbol": "AUSD",
        //             "name": "AUSD",
        //             "decimals": 6,
        //             "display_precision": 2
        //         }
        //     }
        //
        const rawMarket = this.safeDict (market, 'market', {});
        const instance = this.safeDict (market, 'instance', {});
        const quoteId = this.safeString (instance, 'collateral_token_id');
        const quoteToken = this.safeDict (market, 'collateralToken', {});
        const id = this.safeString (rawMarket, 'id');
        const rawQuote = this.safeString (quoteToken, 'symbol');
        const quote = this.safeCurrencyCode (rawQuote);
        if (quote === undefined) {
            return undefined;
        }
        let baseId = this.safeString (rawMarket, 'symbol');
        if (baseId === undefined || baseId.length === 0) {
            baseId = this.safeString2 (rawMarket, 'name', 'size_units');
        }
        const base = this.safeCurrencyCode (baseId);
        if (base === undefined) {
            return undefined;
        }
        const settleId = quoteId;
        const settle = quote;
        const symbol = base + '/' + quote + ':' + settle;
        const config = this.safeDict (rawMarket, 'config', {});
        const amountDecimals = this.safeString (config, 'size_decimals');
        const priceDecimals = this.safeString (config, 'price_decimals');
        const amountPrecision = (amountDecimals === undefined) ? undefined : this.parseNumber (this.parsePrecision (amountDecimals));
        const pricePrecision = (priceDecimals === undefined) ? undefined : this.parseNumber (this.parsePrecision (priceDecimals));
        const makerFee = this.safeString (config, 'maker_fee');
        const takerFee = this.safeString (config, 'taker_fee');
        const maker = (makerFee === undefined) ? undefined : this.parseNumber (Precise.stringDiv (makerFee, '1000000'));
        const taker = (takerFee === undefined) ? undefined : this.parseNumber (Precise.stringDiv (takerFee, '1000000'));
        return this.safeMarketStructure ({
            'id': id,
            'lowercaseId': undefined,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': 'swap',
            'spot': false,
            'margin': false,
            'swap': true,
            'future': false,
            'option': false,
            'active': this.safeBool (config, 'is_open'),
            'contract': true,
            'linear': true,
            'inverse': false,
            'taker': taker,
            'maker': maker,
            'contractSize': 1,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': amountPrecision,
                'price': pricePrecision,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': rawMarket,
        });
    }

    /**
     * @method
     * @name perpl#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1pubcontext
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    override async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetV1PubContext (params);
        //
        //     {
        //         "tokens": [
        //             {
        //                 "ver": 150,
        //                 "id": 1,
        //                 "address": "0x00000000efe302beaa2b3e6e1b18d08d69a9012a",
        //                 "symbol": "AUSD",
        //                 "name": "AUSD",
        //                 "decimals": 6,
        //                 "display_precision": 2,
        //                 "usd_index": "<index_name>"
        //             }
        //         ]
        //     }
        //
        const tokens = this.safeList (response, 'tokens', []);
        return this.parseCurrencies (tokens);
    }

    override parseCurrency (rawCurrency: Dict): CurrencyInterface {
        //
        //     {
        //         "ver": 150,
        //         "id": 1,
        //         "address": "0x00000000efe302beaa2b3e6e1b18d08d69a9012a",
        //         "symbol": "AUSD",
        //         "name": "AUSD",
        //         "decimals": 6,
        //         "display_precision": 2,
        //         "usd_index": "<index_name>"
        //     }
        //
        let id = this.safeString (rawCurrency, 'id');
        if (id === undefined) {
            id = this.safeString (rawCurrency, 'address');
        }
        const code = this.safeCurrencyCode (this.safeString (rawCurrency, 'symbol'));
        const decimals = this.safeString (rawCurrency, 'decimals');
        const precision = (decimals === undefined) ? undefined : this.parseNumber (this.parsePrecision (decimals));
        return this.safeCurrencyStructure ({
            'id': id,
            'name': this.safeString (rawCurrency, 'name'),
            'code': code,
            'precision': precision,
            'active': undefined,
            'deposit': undefined,
            'withdraw': undefined,
            'fee': undefined,
            'networks': {},
            'type': 'crypto',
            'limits': {
                'deposit': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'info': rawCurrency,
        });
    }

    /**
     * @method
     * @name perpl#fetchFundingRate
     * @description fetch the current funding rate for a symbol
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1pubcontext
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    override async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const rates = await this.fetchFundingRates ([ market['symbol'] ], params);
        const rate = this.safeDict (rates, market['symbol']);
        if (rate === undefined) {
            throw new BadSymbol (this.id + ' fetchFundingRate() funding rate not found for ' + symbol);
        }
        return rate as FundingRate;
    }

    /**
     * @method
     * @name perpl#fetchFundingRates
     * @description fetch the current funding rates for multiple markets
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1pubcontext
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    override async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetV1PubContext (params);
        //
        //     {
        //         "markets": [
        //             {
        //                 "id": 1,
        //                 "funding_interval_sec": 2580,
        //                 "state": {
        //                     "at": { "b": 97001267, "t": 1787037820000 },
        //                     "orl": 642508,
        //                     "mrk": 642693
        //                 },
        //                 "funding": {
        //                     "at": { "b": 97001410, "t": 1787037900000 },
        //                     "feb": 97001410,
        //                     "rate": 125,
        //                     "idx": 642508,
        //                     "ppl": 42,
        //                     "sum": 123456,
        //                     "div": 1000000
        //                 }
        //             }
        //         ]
        //     }
        //
        const markets = this.safeList (response, 'markets', []);
        return this.parseFundingRates (markets, symbols);
    }

    /**
     * @method
     * @name perpl#fetchFundingIntervals
     * @description fetch the funding rate interval for multiple markets
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1pubcontext
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    override async fetchFundingIntervals (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        return await this.fetchFundingRates (symbols, params);
    }

    override parseFundingRate (info: any, market: Market = undefined): FundingRate {
        //
        //     {
        //         "id": 1,
        //         "funding_interval_sec": 2580,
        //         "state": {
        //             "at": { "b": 97001267, "t": 1787037820000 },
        //             "orl": 642508,
        //             "mrk": 642693
        //         },
        //         "funding": {
        //             "at": { "b": 97001410, "t": 1787037900000 },
        //             "feb": 97001410,
        //             "rate": 125,
        //             "idx": 642508,
        //             "ppl": 42,
        //             "sum": 123456,
        //             "div": 1000000
        //         }
        //     }
        //
        const marketId = this.safeString (info, 'id');
        market = this.safeMarket (marketId, market);
        const state = this.safeDict (info, 'state', {});
        const stateAt = this.safeDict (state, 'at', {});
        const funding = this.safeDict (info, 'funding', {});
        const fundingAt = this.safeDict (funding, 'at', {});
        const timestamp = this.safeInteger (stateAt, 't');
        const fundingTimestamp = this.safeInteger (fundingAt, 't');
        const pricePrecision = this.numberToString (market['precision']['price']);
        const intervalSeconds = this.safeString (info, 'funding_interval_sec');
        const interval = (intervalSeconds === undefined) ? undefined : intervalSeconds + 's';
        return {
            'info': info,
            'symbol': market['symbol'],
            'markPrice': this.parseNumber (Precise.stringMul (this.safeString (state, 'mrk'), pricePrecision)),
            'indexPrice': this.parseNumber (Precise.stringMul (this.safeString (state, 'orl'), pricePrecision)),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.parseNumber (Precise.stringMul (this.safeString (funding, 'rate'), '0.000001')),
            'fundingTimestamp': fundingTimestamp,
            'fundingDatetime': this.iso8601 (fundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': interval,
        } as FundingRate;
    }

    /**
     * @method
     * @name perpl#fetchFundingRateHistory
     * @description fetches historical funding rates for one market or all markets
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1market-datamarket_idfundingfrom-to // one market
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1market-datafundingfrom-to // all markets
     * @param {string} [symbol] unified symbol of the market to fetch funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of funding rate structures to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate to fetch
     * @returns {object[]} a list of [funding rate history structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    override async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<FundingRateHistory[]> {
        await this.loadMarkets ();
        const originalSince = since;
        let market: Market = undefined;
        let fundingIntervalSeconds: Int = undefined;
        let requestLimit = 128;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            const marketInfo = this.safeDict (market, 'info', {});
            fundingIntervalSeconds = this.safeInteger (marketInfo, 'funding_interval_sec');
            requestLimit = 1024;
        } else {
            const marketSymbols = this.symbols;
            for (let i = 0; i < marketSymbols.length; i++) {
                const currentMarket = this.market (marketSymbols[i]);
                const marketInfo = this.safeDict (currentMarket, 'info', {});
                const currentInterval = this.safeInteger (marketInfo, 'funding_interval_sec');
                if ((currentInterval !== undefined) && ((fundingIntervalSeconds === undefined) || (currentInterval < fundingIntervalSeconds))) {
                    fundingIntervalSeconds = currentInterval;
                }
            }
        }
        if (fundingIntervalSeconds === undefined) {
            fundingIntervalSeconds = 3600;
        }
        if (limit !== undefined) {
            requestLimit = Math.min (limit, requestLimit);
        }
        const duration = (fundingIntervalSeconds as number) * 1000 * (requestLimit - 1);
        let until = this.safeInteger (params, 'until');
        params = this.omit (params, 'until');
        if (since === undefined) {
            if (until === undefined) {
                until = this.milliseconds ();
            }
            since = (until as number) - duration;
        } else if (until === undefined) {
            until = Math.min (this.milliseconds (), since + duration);
        }
        const request: Dict = {
            'from': since,
            'to': until,
        };
        let response: Dict;
        if (market !== undefined) {
            request['market_id'] = market['id'];
            response = await this.publicGetV1MarketDataMarketIdFundingFromTo (this.extend (request, params));
        } else {
            response = await this.publicGetV1MarketDataFundingFromTo (this.extend (request, params));
        }
        //
        //     // one market
        //     {
        //         "mt": 8,
        //         "at": { "b": 97001410, "t": 1787037900000 },
        //         "m": 1,
        //         "d": [
        //             { "at": { "b": 97001410, "t": 1787037900000 }, "feb": 97001410, "rate": 125, "idx": 642508, "ppl": 42, "sum": 123456, "div": 1000000 }
        //         ]
        //     }
        //
        //     // all markets
        //     {
        //         "mt": 8,
        //         "at": { "b": 97001410, "t": 1787037900000 },
        //         "d": {
        //             "1": [
        //                 { "at": { "b": 97001410, "t": 1787037900000 }, "feb": 97001410, "rate": 125, "idx": 642508, "ppl": 42, "sum": 123456, "div": 1000000 }
        //             ]
        //         }
        //     }
        //
        const histories: FundingRateHistory[] = [];
        if (market !== undefined) {
            const fundingEvents = this.safeList (response, 'd', []);
            for (let i = 0; i < fundingEvents.length; i++) {
                histories.push (this.parseFundingRateHistory (fundingEvents[i], market));
            }
        } else {
            const fundingByMarket = this.safeDict (response, 'd', {});
            const marketIds = Object.keys (fundingByMarket);
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const currentMarket = this.safeMarket (marketId);
                const fundingEvents = this.safeList (fundingByMarket, marketId, []);
                for (let j = 0; j < fundingEvents.length; j++) {
                    histories.push (this.parseFundingRateHistory (fundingEvents[j], currentMarket));
                }
            }
        }
        const sorted = this.sortBy (histories, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, originalSince, limit) as FundingRateHistory[];
    }

    override parseFundingRateHistory (info: any, market: Market = undefined): FundingRateHistory {
        //
        //     {
        //         "at": { "b": 97001410, "t": 1787037900000 },
        //         "feb": 97001410,
        //         "rate": 125,
        //         "idx": 642508,
        //         "ppl": 42,
        //         "sum": 123456,
        //         "div": 1000000
        //     }
        //
        market = this.safeMarket (undefined, market);
        const at = this.safeDict (info, 'at', {});
        const timestamp = this.safeInteger (at, 't');
        return {
            'info': info,
            'symbol': market['symbol'],
            'fundingRate': this.parseNumber (Precise.stringMul (this.safeString (info, 'rate'), '0.000001')),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        } as FundingRateHistory;
    }

    /**
     * @ignore
     * @method
     * @description fetches and filters Perpl account history rows without stopping pagination on pages that contain unrelated event types
     * @param {string} methodName unified method name used for pagination options
     * @param {int[]} eventTypes Perpl account event types to retain
     * @param {string} [marketId] Perpl market id to retain
     * @param {string[]} [instanceIds] Perpl instance ids to retain
     * @param {int} [since] timestamp in ms of the earliest event to retain
     * @param {int} [limit] maximum number of matching events to retain
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.page] pagination cursor from the previous response
     * @param {int} [params.count] number of account events to return per request, maximum 100
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times
     * @param {int} [params.paginationCalls] maximum number of pagination calls, default 10
     * @returns {object[]} filtered Perpl account history rows
     */
    async fetchAccountHistoryRows (methodName: string, eventTypes: number[], marketId: Str = undefined, instanceIds: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Dict[]> {
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, methodName, 'paginate', false);
        let paginationCalls = 10;
        [ paginationCalls, params ] = this.handleOptionAndParams (params, methodName, 'paginationCalls', 10);
        const requestCount = Math.min (this.safeInteger (params, 'count', 100), 100);
        let page = this.safeString (params, 'page');
        params = this.omit (params, [ 'count', 'page' ]);
        const result: Dict[] = [];
        let paginationCursor: Str = undefined;
        let calls = 0;
        while (calls < paginationCalls) {
            const request: Dict = {
                'count': requestCount,
            };
            if (page !== undefined) {
                request['page'] = page;
            }
            const response = await this.privateGetV1TradingAccountHistory (this.extend (request, params));
            //
            //     {
            //         "d": [
            //             {
            //                 "at": { "b": 97001410, "t": 1787037900000, "tx": 3, "txid": "0x1234", "l": 3 },
            //                 "in": 1,
            //                 "id": 42,
            //                 "et": 8,
            //                 "m": 1,
            //                 "p": 7654321,
            //                 "a": "-1250000",
            //                 "b": "676750000",
            //                 "lb": "0",
            //                 "f": "0",
            //                 "bfa": "0"
            //             }
            //         ],
            //         "np": "next-page-cursor"
            //     }
            //
            const data = this.safeList (response, 'd', []);
            for (let i = 0; i < data.length; i++) {
                const event = data[i];
                const eventType = this.safeInteger (event, 'et');
                const eventMarketId = this.safeString (event, 'm');
                const eventInstanceId = this.safeString (event, 'in');
                const matchesEventType = (eventType !== undefined) && this.inArray (eventType, eventTypes);
                const matchesMarket = (marketId === undefined) || (eventMarketId === marketId);
                const matchesInstance = (instanceIds === undefined) || this.inArray (eventInstanceId, instanceIds);
                if (matchesEventType && matchesMarket && matchesInstance) {
                    result.push (event);
                }
            }
            const nextPage = this.safeString (response, 'np');
            paginationCursor = nextPage;
            if (!paginate) {
                break;
            }
            if ((nextPage === undefined) || (nextPage.length === 0) || (nextPage === page)) {
                break;
            }
            const dataLength = data.length;
            if (dataLength > 0) {
                const last = data[dataLength - 1];
                const at = this.safeDict (last, 'at', {});
                const lastTimestamp = this.safeInteger (at, 't');
                if ((since !== undefined) && (lastTimestamp !== undefined) && (lastTimestamp < since)) {
                    break;
                }
            }
            if ((since === undefined) && (limit !== undefined) && (result.length >= limit)) {
                break;
            }
            page = nextPage;
            calls += 1;
        }
        const resultLength = result.length;
        if ((paginationCursor !== undefined) && (paginationCursor.length > 0) && (resultLength > 0)) {
            const last = result[resultLength - 1];
            last['np'] = paginationCursor;
            result[resultLength - 1] = last;
        }
        return result;
    }

    /**
     * @method
     * @name perpl#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1tradingaccount-history
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] the maximum number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.page] pagination cursor from the previous response
     * @param {int} [params.count] number of account events to return per request, maximum 100
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times
     * @param {int} [params.paginationCalls] maximum number of pagination calls, default 10
     * @returns {object[]} a list of [ledger structures]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
     */
    override async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LedgerEntry[]> {
        await this.loadMarkets ();
        let currency: Currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            code = currency['code'];
        }
        let instanceIds: Strings = undefined;
        if (code !== undefined) {
            instanceIds = [];
            const marketSymbols = this.symbols;
            for (let i = 0; i < marketSymbols.length; i++) {
                const market = this.market (marketSymbols[i]);
                if (market['settle'] === code) {
                    const marketInfo = this.safeDict (market, 'info', {});
                    const instanceId = this.safeString (marketInfo, 'instance_id');
                    if ((instanceId !== undefined) && !this.inArray (instanceId, instanceIds)) {
                        instanceIds.push (instanceId);
                    }
                }
            }
        }
        const rows = await this.fetchAccountHistoryRows ('fetchLedger', [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ], undefined, instanceIds, since, limit, params);
        return this.parseLedger (rows, currency, since, limit);
    }

    override parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
        //
        //     {
        //         "at": { "b": 97001410, "t": 1787037900000, "tx": 3, "txid": "0x1234", "l": 3 },
        //         "in": 1,
        //         "id": 42,
        //         "et": 3,
        //         "m": 1,
        //         "p": 7654321,
        //         "a": "-10000000",
        //         "b": "60000000",
        //         "lb": "0",
        //         "f": "0",
        //         "bfa": "0"
        //     }
        //
        let code = this.safeCurrencyCode (undefined, currency);
        if (code === undefined) {
            const marketId = this.safeString (item, 'm');
            if (marketId !== undefined) {
                const market = this.safeMarket (marketId);
                code = market['settle'];
            } else {
                const instanceId = this.safeString (item, 'in');
                const marketSymbols = this.symbols;
                for (let i = 0; i < marketSymbols.length; i++) {
                    const market = this.market (marketSymbols[i]);
                    const marketInfo = this.safeDict (market, 'info', {});
                    if (this.safeString (marketInfo, 'instance_id') === instanceId) {
                        code = market['settle'];
                        break;
                    }
                }
            }
        }
        if ((currency === undefined) && (code !== undefined)) {
            currency = this.currency (code);
        }
        const precision = (currency === undefined) ? undefined : this.numberToString (currency['precision']);
        const eventTypeString = this.safeString (item, 'et');
        const types: Dict = {
            '1': 'transaction',
            '2': 'transaction',
            '3': 'margin',
            '4': 'trade',
            '5': 'trade',
            '6': 'transfer',
            '7': 'transfer',
            '8': 'fee',
            '9': 'trade',
            '10': 'trade',
            '11': 'margin',
        };
        const rawAmount = this.safeString (item, 'a');
        const rawFee = this.safeString (item, 'f');
        const direction = Precise.stringLt (rawAmount, '0') ? 'out' : 'in';
        const grossAmount = Precise.stringAdd (rawAmount, rawFee);
        const amount = Precise.stringAbs (grossAmount);
        const rawAfter = this.safeString (item, 'b');
        const rawBefore = Precise.stringSub (rawAfter, rawAmount);
        const at = this.safeDict (item, 'at', {});
        const timestamp = this.safeInteger (at, 't');
        const transactionId = this.safeString (at, 'txid');
        const logIndex = this.safeString (at, 'l');
        let id = transactionId;
        if ((id !== undefined) && (logIndex !== undefined)) {
            id = id + ':' + logIndex;
        }
        return this.safeLedgerEntry ({
            'info': item,
            'id': id,
            'direction': direction,
            'account': this.safeString (item, 'id'),
            'referenceId': this.safeString2 (item, 'o', 'p'),
            'referenceAccount': undefined,
            'type': this.safeString (types, eventTypeString as string),
            'currency': code,
            'amount': this.parseNumber (Precise.stringMul (amount, precision)),
            'before': this.parseNumber (Precise.stringMul (rawBefore, precision)),
            'after': this.parseNumber (Precise.stringMul (rawAfter, precision)),
            'status': 'ok',
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'cost': this.parseNumber (Precise.stringMul (rawFee, precision)),
                'currency': code,
            },
        }, currency) as LedgerEntry;
    }

    /**
     * @method
     * @name perpl#fetchMarginAdjustmentHistory
     * @description fetches the history of margin added or reduced from contract isolated positions
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1tradingaccount-history
     * @param {string} [symbol] unified market symbol
     * @param {string} [type] "add" or "reduce"
     * @param {int} [since] timestamp in ms of the earliest change to fetch
     * @param {int} [limit] the maximum number of changes to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.page] pagination cursor from the previous response
     * @param {int} [params.count] number of account events to return per request, maximum 100
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times
     * @param {int} [params.paginationCalls] maximum number of pagination calls, default 10
     * @returns {object[]} a list of [margin structures]{@link https://docs.ccxt.com/?id=margin-loan-structure}
     */
    override async fetchMarginAdjustmentHistory (symbol: Str = undefined, type: Str = undefined, since: Num = undefined, limit: Num = undefined, params = {}): Promise<MarginModification[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        let marketId: Str = undefined;
        let symbols: Strings = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            marketId = market['id'];
            symbols = [ symbol ];
        }
        let eventTypes = [ 3, 11 ];
        if (type === 'add') {
            eventTypes = [ 3 ];
        } else if (type === 'reduce') {
            eventTypes = [ 11 ];
        } else if (type !== undefined) {
            throw new BadRequest (this.id + ' fetchMarginAdjustmentHistory() type must be add or reduce');
        }
        const rows = await this.fetchAccountHistoryRows ('fetchMarginAdjustmentHistory', eventTypes, marketId, undefined, since as Int, limit as Int, params);
        const modifications = this.parseMarginModifications (rows, symbols, 'm', 'swap');
        const sorted = this.sortBy (modifications, 'timestamp');
        return this.filterBySinceLimit (sorted, since as Int, limit as Int) as MarginModification[];
    }

    override parseMarginModification (info: Dict, market: Market = undefined): MarginModification {
        //
        //     {
        //         "at": { "b": 97001410, "t": 1787037900000, "tx": 3, "txid": "0x1234", "l": 3 },
        //         "in": 1,
        //         "id": 42,
        //         "et": 3,
        //         "m": 1,
        //         "p": 7654321,
        //         "a": "-10000000",
        //         "b": "60000000",
        //         "lb": "0",
        //         "f": "0",
        //         "bfa": "0"
        //     }
        //
        const marketId = this.safeString (info, 'm');
        market = this.safeMarket (marketId, market, undefined, 'swap');
        const currency = this.currency (market['settle']);
        const precision = this.numberToString (currency['precision']);
        const eventType = this.safeInteger (info, 'et');
        const at = this.safeDict (info, 'at', {});
        const timestamp = this.safeInteger (at, 't');
        return {
            'info': info,
            'symbol': market['symbol'],
            'type': (eventType === 3) ? 'add' : 'reduce',
            'marginMode': 'isolated',
            'amount': this.parseNumber (Precise.stringMul (Precise.stringAbs (this.safeString (info, 'a')), precision)),
            'total': undefined,
            'code': currency['code'],
            'status': 'ok',
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    /**
     * @method
     * @name perpl#fetchFundingHistory
     * @description fetches the history of funding payments paid and received on this account
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1tradingaccount-history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.page] pagination cursor from the previous response
     * @param {int} [params.count] number of account events to return per request, maximum 100
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times
     * @param {int} [params.paginationCalls] maximum number of pagination calls, default 10
     * @returns {object[]} a list of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
     */
    override async fetchFundingHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<FundingHistory[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        let marketId: Str = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            marketId = market['id'];
        }
        const rows = await this.fetchAccountHistoryRows ('fetchFundingHistory', [ 8 ], marketId, undefined, since, limit, params);
        return this.parseIncomes (rows, market, since, limit);
    }

    override parseIncome (info: any, market: Market = undefined): object {
        //
        //     {
        //         "at": { "b": 97001410, "t": 1787037900000, "tx": 3, "txid": "0x1234", "l": 3 },
        //         "in": 1,
        //         "id": 42,
        //         "et": 8,
        //         "m": 1,
        //         "p": 7654321,
        //         "a": "-1250000",
        //         "b": "676750000",
        //         "lb": "0",
        //         "f": "0",
        //         "bfa": "0"
        //     }
        //
        const marketId = this.safeString (info, 'm');
        market = this.safeMarket (marketId, market);
        const at = this.safeDict (info, 'at', {});
        const timestamp = this.safeInteger (at, 't');
        const transactionId = this.safeString (at, 'txid');
        const logIndex = this.safeString (at, 'l');
        let id = transactionId;
        if ((id !== undefined) && (logIndex !== undefined)) {
            id = id + ':' + logIndex;
        }
        const currency = this.currency (market['settle']);
        const precision = this.numberToString (currency['precision']);
        return {
            'info': info,
            'symbol': market['symbol'],
            'code': currency['code'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': id,
            'amount': this.parseNumber (Precise.stringMul (this.safeString (info, 'a'), precision)),
        } as FundingHistory;
    }

    /**
     * @method
     * @name perpl#fetchDepositsWithdrawals
     * @description fetches the history of deposits and withdrawals
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1tradingaccount-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits and withdrawals for
     * @param {int} [limit] the maximum number of transaction structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.page] pagination cursor from the previous response
     * @param {int} [params.count] number of account events to return per request, maximum 100
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times
     * @param {int} [params.paginationCalls] maximum number of pagination calls, default 10
     * @param {string} [params.type] 'deposit' or 'withdrawal' to filter transactions by type
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    override async fetchDepositsWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        let callerMethodName: Str = undefined;
        [ callerMethodName, params ] = this.handleParamString (params, 'callerMethodName', 'fetchDepositsWithdrawals');
        let currency: Currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            code = currency['code'];
        }
        let instanceIds: Strings = undefined;
        if (code !== undefined) {
            instanceIds = [];
            const marketSymbols = this.symbols;
            for (let i = 0; i < marketSymbols.length; i++) {
                const market = this.market (marketSymbols[i]);
                if (market['settle'] === code) {
                    const marketInfo = this.safeDict (market, 'info', {});
                    const instanceId = this.safeString (marketInfo, 'instance_id');
                    if ((instanceId !== undefined) && !this.inArray (instanceId, instanceIds)) {
                        instanceIds.push (instanceId);
                    }
                }
            }
        }
        let transactionType: Str = undefined;
        [ transactionType, params ] = this.handleOptionAndParams (params, callerMethodName, 'type');
        let eventTypes = [ 1, 2 ];
        if (transactionType === 'deposit') {
            eventTypes = [ 1 ];
        } else if (transactionType === 'withdrawal') {
            eventTypes = [ 2 ];
        }
        const rows = await this.fetchAccountHistoryRows (callerMethodName, eventTypes, undefined, instanceIds, since, limit, params);
        return this.parseTransactions (rows, currency, since, limit);
    }

    /**
     * @method
     * @name perpl#fetchDeposits
     * @description fetches all deposits made to an account
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1tradingaccount-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposit structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.page] pagination cursor from the previous response
     * @param {int} [params.count] number of account events to return per request, maximum 100
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times
     * @param {int} [params.paginationCalls] maximum number of pagination calls, default 10
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    override async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        return await this.fetchDepositsWithdrawals (code, since, limit, this.extend (params, {
            'type': 'deposit',
            'callerMethodName': 'fetchDeposits',
        }));
    }

    /**
     * @method
     * @name perpl#fetchWithdrawals
     * @description fetches all withdrawals made from an account
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1tradingaccount-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.page] pagination cursor from the previous response
     * @param {int} [params.count] number of account events to return per request, maximum 100
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times
     * @param {int} [params.paginationCalls] maximum number of pagination calls, default 10
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    override async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        return await this.fetchDepositsWithdrawals (code, since, limit, this.extend (params, {
            'type': 'withdrawal',
            'callerMethodName': 'fetchWithdrawals',
        }));
    }

    override parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        //     {
        //         "at": { "b": 97000001, "t": 1787036914000, "tx": 2, "txid": "0x1234", "l": 4 },
        //         "in": 1,
        //         "id": 42,
        //         "et": 2,
        //         "a": "-10100000",
        //         "b": "667900000",
        //         "lb": "0",
        //         "f": "100000",
        //         "bfa": "0"
        //     }
        //
        let code = this.safeCurrencyCode (undefined, currency);
        if (code === undefined) {
            const instanceId = this.safeString (transaction, 'in');
            const marketSymbols = this.symbols;
            for (let i = 0; i < marketSymbols.length; i++) {
                const market = this.market (marketSymbols[i]);
                const marketInfo = this.safeDict (market, 'info', {});
                if (this.safeString (marketInfo, 'instance_id') === instanceId) {
                    code = market['settle'];
                    break;
                }
            }
        }
        if ((currency === undefined) && (code !== undefined)) {
            currency = this.currency (code);
        }
        const precision = (currency === undefined) ? undefined : this.numberToString (currency['precision']);
        const eventType = this.safeInteger (transaction, 'et');
        const type = (eventType === 1) ? 'deposit' : 'withdrawal';
        const rawAmount = Precise.stringAbs (this.safeString (transaction, 'a'));
        const rawFee = Precise.stringAbs (this.safeString (transaction, 'f'));
        let amount = rawAmount;
        if (eventType === 1) {
            amount = Precise.stringAdd (rawAmount, rawFee);
        } else if (eventType === 2) {
            amount = Precise.stringSub (rawAmount, rawFee);
        }
        const at = this.safeDict (transaction, 'at', {});
        const timestamp = this.safeInteger (at, 't');
        const transactionId = this.safeString (at, 'txid');
        const logIndex = this.safeString (at, 'l');
        let id = transactionId;
        if ((id !== undefined) && (logIndex !== undefined)) {
            id = id + ':' + logIndex;
        }
        return {
            'info': transaction,
            'id': id,
            'txid': transactionId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': undefined,
            'addressFrom': undefined,
            'addressTo': undefined,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': type,
            'amount': this.parseNumber (Precise.stringMul (amount, precision)),
            'currency': code,
            'status': 'ok',
            'updated': timestamp,
            'fee': {
                'currency': code,
                'cost': this.parseNumber (Precise.stringMul (rawFee, precision)),
            },
            'network': undefined,
            'comment': undefined,
            'internal': false,
        } as Transaction;
    }

    /**
     * @method
     * @name perpl#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1tradingorder-history
     * @param {string} [symbol] unified market symbol of the orders
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.page] pagination cursor from the previous response
     * @param {int} [params.count] number of order events to return per request, maximum 100
     * @param {string} [params.status] client-side unified order status filter for the returned page, use params.paginate to search multiple pages
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times
     * @param {int} [params.paginationCalls] maximum number of pagination calls, default 10
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
        }
        let callerMethodName = 'fetchOrders';
        [ callerMethodName, params ] = this.handleParamString (params, 'callerMethodName', 'fetchOrders');
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, callerMethodName, 'paginate', false);
        let paginationCalls = 10;
        [ paginationCalls, params ] = this.handleOptionAndParams (params, callerMethodName, 'paginationCalls', 10);
        const requestCount = Math.min (this.safeInteger (params, 'count', 100), 100);
        const status = this.safeString (params, 'status');
        let page = this.safeString (params, 'page');
        params = this.omit (params, [ 'count', 'page', 'status' ]);
        const uniqueById: Dict = {};
        const uniqueData: Dict[] = [];
        let matchingOrders = 0;
        let calls = 0;
        while (calls < paginationCalls) {
            const request: Dict = {
                'count': requestCount,
            };
            if (page !== undefined) {
                request['page'] = page;
            }
            const response = await this.privateGetV1TradingOrderHistory (this.extend (request, params));
            //
            //     {
            //         "d": [
            //             {
            //                 "at": { "b": 55563772, "t": 1787288849000, "tx": 1, "txid": "<redacted>", "l": 4 },
            //                 "c": {},
            //                 "rq": 123456,
            //                 "mkt": 16,
            //                 "acc": 42,
            //                 "oid": 789012,
            //                 "scid": 345678,
            //                 "st": 4,
            //                 "sr": 43,
            //                 "t": 1,
            //                 "os": 1591,
            //                 "fp": 751164,
            //                 "fs": 1591,
            //                 "f": "824621",
            //                 "bfa": "0",
            //                 "fl": 4,
            //                 "mm": 10,
            //                 "lv": 1500
            //             }
            //         ],
            //         "np": "next-page-cursor"
            //     }
            //
            const data = this.safeList (response, 'd', []);
            for (let i = 0; i < data.length; i++) {
                const order = data[i];
                const orderId = this.safeString (order, 'oid');
                if ((orderId === undefined) || !(orderId in uniqueById)) {
                    if (orderId !== undefined) {
                        uniqueById[orderId] = true;
                    }
                    uniqueData.push (order);
                    const orderMarketId = this.safeString (order, 'mkt');
                    const matchesMarket = (market === undefined) || (orderMarketId === market['id']);
                    const orderStatus = this.parseOrderStatus (this.safeString (order, 'st'));
                    const matchesStatus = (status === undefined) || (orderStatus === status);
                    const created = this.safeDict (order, 'c', {});
                    const at = this.safeDict (order, 'at', {});
                    const orderTimestamp = this.safeInteger (created, 't', this.safeInteger (at, 't'));
                    const matchesSince = (since === undefined) || ((orderTimestamp !== undefined) && (orderTimestamp >= since));
                    if (matchesMarket && matchesStatus && matchesSince) {
                        matchingOrders += 1;
                    }
                }
            }
            const nextPage = this.safeString (response, 'np');
            const uniqueDataLength = uniqueData.length;
            if ((nextPage !== undefined) && (nextPage.length > 0) && (uniqueDataLength > 0)) {
                const last = uniqueData[uniqueDataLength - 1];
                last['np'] = nextPage;
                uniqueData[uniqueDataLength - 1] = last;
            }
            if (!paginate || (nextPage === undefined) || (nextPage.length === 0) || (nextPage === page)) {
                break;
            }
            const dataLength = data.length;
            if (dataLength > 0) {
                const last = data[dataLength - 1];
                const lastAt = this.safeDict (last, 'at', {});
                const lastTimestamp = this.safeInteger (lastAt, 't');
                if ((since !== undefined) && (lastTimestamp !== undefined) && (lastTimestamp < since)) {
                    break;
                }
            }
            if ((since === undefined) && (limit !== undefined) && (matchingOrders >= limit)) {
                break;
            }
            page = nextPage;
            calls += 1;
        }
        const orders = this.parseOrders (uniqueData, market, since, undefined);
        const filteredOrders = (status === undefined) ? orders : this.filterBy (orders, 'status', status) as Order[];
        return this.filterByLimit (filteredOrders, limit, 'timestamp', since !== undefined) as Order[];
    }

    /**
     * @method
     * @name perpl#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1tradingorder-history
     * @param {string} [symbol] unified market symbol of the orders
     * @param {int} [since] the earliest time in ms to fetch canceled orders for
     * @param {int} [limit] the maximum number of canceled order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.page] pagination cursor from the previous response
     * @param {int} [params.count] number of order events to return per request, maximum 100
     * @param {boolean} [params.paginate] not used by perpl.fetchCanceledOrders, this method always paginates because the status filter is applied client-side
     * @param {int} [params.paginationCalls] maximum number of pagination calls, default 10
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        params = this.extend (params, {
            'status': 'canceled',
            'paginate': true,
            'callerMethodName': 'fetchCanceledOrders',
        });
        return await this.fetchOrders (symbol, since, limit, params);
    }

    /**
     * @method
     * @name perpl#fetchOpenOrders
     * @description fetches information on multiple open orders made by the user
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1tradingorder-history
     * @param {string} [symbol] unified market symbol of the orders
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.page] pagination cursor from the previous response
     * @param {int} [params.count] number of order events to return per request, maximum 100
     * @param {boolean} [params.paginate] not used by perpl.fetchOpenOrders, this method always paginates because the status filter is applied client-side
     * @param {int} [params.paginationCalls] maximum number of pagination calls, default 10
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        params = this.extend (params, {
            'status': 'open',
            'paginate': true,
            'callerMethodName': 'fetchOpenOrders',
        });
        return await this.fetchOrders (symbol, since, limit, params);
    }

    /**
     * @method
     * @name perpl#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1tradingorder-history
     * @param {string} [symbol] unified market symbol of the orders
     * @param {int} [since] the earliest time in ms to fetch closed orders for
     * @param {int} [limit] the maximum number of closed order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.page] pagination cursor from the previous response
     * @param {int} [params.count] number of order events to return per request, maximum 100
     * @param {boolean} [params.paginate] not used by perpl.fetchClosedOrders, this method always paginates because the status filter is applied client-side
     * @param {int} [params.paginationCalls] maximum number of pagination calls, default 10
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        params = this.extend (params, {
            'status': 'closed',
            'paginate': true,
            'callerMethodName': 'fetchClosedOrders',
        });
        return await this.fetchOrders (symbol, since, limit, params);
    }

    /**
     * @ignore
     * @method
     * @description converts a Perpl order status code to a unified order status
     * @param {string} status Perpl order status code
     * @returns {string} unified order status
     */
    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            '1': 'open',
            '2': 'open',
            '3': 'open',
            '4': 'closed',
            '5': 'canceled',
            '6': 'expired',
            '7': 'rejected',
            '8': 'open',
            '9': 'open',
            '10': 'closed',
        };
        return this.safeString (statuses, status as string, status);
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //     {
        //         "at": { "b": 55563772, "t": 1787288849000, "tx": 1, "txid": "<redacted>", "l": 4 },
        //         "c": {},
        //         "rq": 123456,
        //         "mkt": 16,
        //         "acc": 42,
        //         "oid": 789012,
        //         "scid": 345678,
        //         "st": 4,
        //         "sr": 43,
        //         "t": 1,
        //         "os": 1591,
        //         "fp": 751164,
        //         "fs": 1591,
        //         "f": "824621",
        //         "bfa": "0",
        //         "fl": 4,
        //         "mm": 10,
        //         "lv": 1500
        //     }
        //
        const marketId = this.safeString (order, 'mkt');
        market = this.safeMarket (marketId, market);
        const at = this.safeDict (order, 'at', {});
        const created = this.safeDict (order, 'c', {});
        const lastUpdateTimestamp = this.safeInteger (at, 't');
        const timestamp = this.safeInteger (created, 't', lastUpdateTimestamp);
        const pricePrecision = this.numberToString (market['precision']['price']);
        const amountPrecision = this.numberToString (market['precision']['amount']);
        const quoteCurrency = this.currency (market['settle']);
        const quotePrecision = this.numberToString (quoteCurrency['precision']);
        const rawOrderType = this.safeInteger (order, 't');
        let side: Str = undefined;
        if ((rawOrderType === 1) || (rawOrderType === 4)) {
            side = 'buy';
        } else if ((rawOrderType === 2) || (rawOrderType === 3)) {
            side = 'sell';
        }
        const reduceOnly = (rawOrderType === 3) || (rawOrderType === 4);
        const rawPrice = this.safeString (order, 'p');
        let type = 'limit';
        let price: Str = undefined;
        if ((rawPrice === undefined) || Precise.stringEquals (rawPrice, '0')) {
            type = 'market';
        } else {
            price = Precise.stringMul (rawPrice, pricePrecision);
        }
        const rawAverage = this.safeString (order, 'fp');
        let average: Str = undefined;
        if ((rawAverage !== undefined) && !Precise.stringEquals (rawAverage, '0')) {
            average = Precise.stringMul (rawAverage, pricePrecision);
        }
        const amount = Precise.stringMul (this.safeString (order, 'os'), amountPrecision);
        const filled = Precise.stringMul (this.safeString (order, 'fs'), amountPrecision);
        const rawTriggerPrice = this.safeString (order, 'tp');
        const triggerPrice = (rawTriggerPrice === undefined) ? undefined : Precise.stringMul (rawTriggerPrice, pricePrecision);
        const flags = this.safeInteger (order, 'fl', 0);
        let timeInForce = 'GTC';
        if (flags === 1) {
            timeInForce = 'PO';
        } else if (flags === 2) {
            timeInForce = 'FOK';
        } else if (flags === 4) {
            timeInForce = 'IOC';
        }
        const feeCost = Precise.stringMul (this.safeString (order, 'f'), quotePrecision);
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'oid'),
            'clientOrderId': this.safeString (order, 'rq'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': flags === 1,
            'reduceOnly': reduceOnly,
            'side': side,
            'price': this.parseNumber (price),
            'triggerPrice': this.parseNumber (triggerPrice),
            'amount': this.parseNumber (amount),
            'cost': undefined,
            'average': this.parseNumber (average),
            'filled': this.parseNumber (filled),
            'remaining': undefined,
            'status': this.parseOrderStatus (this.safeString (order, 'st')),
            'fee': {
                'cost': this.parseNumber (feeCost),
                'currency': market['settle'],
            },
            'trades': undefined,
        }, market);
    }

    /**
     * @method
     * @name perpl#fetchPositionsHistory
     * @description fetches historical positions
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1tradingposition-history
     * @param {string[]|undefined} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of position structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.page] pagination cursor from the previous response
     * @param {int} [params.count] number of position events to return per request, maximum 100
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times
     * @param {int} [params.paginationCalls] maximum number of pagination calls, default 10
     * @returns {Position[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    override async fetchPositionsHistory (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchPositionsHistory', 'paginate', false);
        let paginationCalls = 10;
        [ paginationCalls, params ] = this.handleOptionAndParams (params, 'fetchPositionsHistory', 'paginationCalls', 10);
        const requestCount = Math.min (this.safeInteger (params, 'count', 100), 100);
        let page = this.safeString (params, 'page');
        params = this.omit (params, [ 'count', 'page' ]);
        const uniqueById: Dict = {};
        const uniqueData: Dict[] = [];
        let calls = 0;
        while (calls < paginationCalls) {
            const request: Dict = {
                'count': requestCount,
            };
            if (page !== undefined) {
                request['page'] = page;
            }
            const response = await this.privateGetV1TradingPositionHistory (this.extend (request, params));
            //
            //     {
            //         "d": [
            //             {
            //                 "at": { "b": 55563772, "t": 1787288849000, "tx": 1, "txid": "<redacted>", "l": 3 },
            //                 "mkt": 16,
            //                 "acc": 42,
            //                 "pid": 123456,
            //                 "rq": 789012,
            //                 "oid": 345678,
            //                 "st": 1,
            //                 "sr": 21,
            //                 "sd": 1,
            //                 "c": "80026664",
            //                 "ep": 751164,
            //                 "s": 1591,
            //                 "fee": "824621",
            //                 "efs": 93442,
            //                 "lv": 1500,
            //                 "cpnl": "353202",
            //                 "dpnl": "0",
            //                 "fnd": "0",
            //                 "pay": "0",
            //                 "xfs": 0,
            //                 "ots": {}
            //             }
            //         ],
            //         "np": "next-page-cursor"
            //     }
            //
            const data = this.safeList (response, 'd', []);
            for (let i = 0; i < data.length; i++) {
                const position = data[i];
                const positionId = this.safeString (position, 'pid');
                if ((positionId === undefined) || !(positionId in uniqueById)) {
                    if (positionId !== undefined) {
                        uniqueById[positionId] = true;
                    }
                    uniqueData.push (position);
                }
            }
            const nextPage = this.safeString (response, 'np');
            const uniqueDataLength = uniqueData.length;
            if ((nextPage !== undefined) && (nextPage.length > 0) && (uniqueDataLength > 0)) {
                const last = uniqueData[uniqueDataLength - 1];
                last['np'] = nextPage;
                uniqueData[uniqueDataLength - 1] = last;
            }
            if (!paginate || (nextPage === undefined) || (nextPage.length === 0) || (nextPage === page)) {
                break;
            }
            const dataLength = data.length;
            if (dataLength > 0) {
                const last = data[dataLength - 1];
                const lastAt = this.safeDict (last, 'at', {});
                const lastTimestamp = this.safeInteger (lastAt, 't');
                if ((since !== undefined) && (lastTimestamp !== undefined) && (lastTimestamp < since)) {
                    break;
                }
            }
            page = nextPage;
            calls += 1;
        }
        const positions = this.parsePositions (uniqueData, symbols);
        const sortedPositions = this.sortBy (positions, 'timestamp');
        return this.filterBySinceLimit (sortedPositions, since, limit) as Position[];
    }

    override parsePosition (position: Dict, market: Market = undefined): Position {
        //
        //     {
        //         "at": { "b": 55570000, "t": 1787636835000, "tx": 1, "txid": "<redacted>", "l": 3 },
        //         "mkt": 1,
        //         "acc": 42,
        //         "pid": 123456,
        //         "rq": 789012,
        //         "oid": 345678,
        //         "st": 2,
        //         "sr": 13,
        //         "sd": 1,
        //         "c": "-80026664",
        //         "ep": 751164,
        //         "s": 1591,
        //         "fee": "824621",
        //         "efs": 93442,
        //         "lv": 1500,
        //         "cpnl": "0",
        //         "dpnl": "88101625",
        //         "fnd": "-3368147",
        //         "pay": "0",
        //         "xp": 806539,
        //         "xfs": 0,
        //         "ots": {}
        //     }
        //
        const marketId = this.safeString (position, 'mkt');
        market = this.safeMarket (marketId, market);
        const at = this.safeDict (position, 'at', {});
        const openTimestamp = this.safeDict (position, 'ots', {});
        const lastUpdateTimestamp = this.safeInteger (at, 't');
        const timestamp = this.safeInteger (openTimestamp, 't', lastUpdateTimestamp);
        const amountPrecision = this.numberToString (market['precision']['amount']);
        const pricePrecision = this.numberToString (market['precision']['price']);
        const settleCurrency = this.currency (market['settle']);
        const settlePrecision = this.numberToString (settleCurrency['precision']);
        const contracts = Precise.stringMul (this.safeString (position, 's'), amountPrecision);
        const entryPrice = Precise.stringMul (this.safeString (position, 'ep'), pricePrecision);
        const exitPrice = Precise.stringMul (this.safeString (position, 'xp'), pricePrecision);
        const positionCollateral = Precise.stringMul (this.safeString (position, 'c'), settlePrecision);
        const unrealizedPnl = Precise.stringMul (this.safeString (position, 'cpnl'), settlePrecision);
        let realizedPnl = this.safeString (position, 'dpnl');
        const fundingPnl = this.safeString (position, 'fnd');
        if (fundingPnl !== undefined) {
            realizedPnl = (realizedPnl === undefined) ? fundingPnl : Precise.stringAdd (realizedPnl, fundingPnl);
        }
        realizedPnl = Precise.stringMul (realizedPnl, settlePrecision);
        const leverage = Precise.stringDiv (this.safeString (position, 'lv'), '100');
        const notional = Precise.stringMul (contracts, entryPrice);
        const initialMargin = Precise.stringDiv (notional, leverage);
        const positionStatus = this.safeInteger (position, 'st');
        const collateral = (positionStatus === 1) ? positionCollateral : undefined;
        const rawSide = this.safeInteger (position, 'sd');
        let side: Str = undefined;
        if (rawSide === 1) {
            side = 'long';
        } else if (rawSide === 2) {
            side = 'short';
        }
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'pid'),
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'initialMargin': this.parseNumber (initialMargin),
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.parseNumber (entryPrice),
            'notional': this.parseNumber (notional),
            'leverage': this.parseNumber (leverage),
            'unrealizedPnl': this.parseNumber (unrealizedPnl),
            'realizedPnl': this.parseNumber (realizedPnl),
            'contracts': this.parseNumber (contracts),
            'contractSize': market['contractSize'],
            'marginRatio': undefined,
            'liquidationPrice': undefined,
            'markPrice': undefined,
            'lastPrice': this.parseNumber (exitPrice),
            'collateral': this.parseNumber (collateral),
            'marginMode': undefined,
            'side': side,
            'percentage': undefined,
            'hedged': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }

    /**
     * @method
     * @name perpl#fetchOpenInterests
     * @description retrieves the open interest for a list of symbols
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1pubcontext
     * @param {string[]} [symbols] unified CCXT market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [open interest structures]{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    override async fetchOpenInterests (symbols: Strings = undefined, params = {}): Promise<OpenInterests> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetV1PubContext (params);
        //
        //     {
        //         "markets": [
        //             {
        //                 "id": 1,
        //                 "state": {
        //                     "at": { "b": 97001267, "t": 1787037820000 },
        //                     "oi": 4056609
        //                 }
        //             }
        //         ]
        //     }
        //
        const markets = this.safeList (response, 'markets', []);
        return this.parseOpenInterests (markets, symbols) as OpenInterests;
    }

    override parseOpenInterest (interest: any, market: Market = undefined): OpenInterest {
        //
        //     {
        //         "id": 1,
        //         "state": {
        //             "at": { "b": 97001267, "t": 1787037820000 },
        //             "oi": 4056609
        //         }
        //     }
        //
        const marketId = this.safeString (interest, 'id');
        market = this.safeMarket (marketId, market);
        const state = this.safeDict (interest, 'state', {});
        const at = this.safeDict (state, 'at', {});
        const timestamp = this.safeInteger (at, 't');
        const amountPrecision = this.numberToString (market['precision']['amount']);
        return {
            'symbol': market['symbol'],
            'openInterestAmount': this.parseNumber (Precise.stringMul (this.safeString (state, 'oi'), amountPrecision)),
            'openInterestValue': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': interest,
        } as OpenInterest;
    }

    /**
     * @method
     * @name perpl#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1tradingfills
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve, maximum 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.page] pagination cursor from the previous response
     * @param {int} [params.count] number of entries to return, maximum 100
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
        }
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'paginate', false);
        if (paginate) {
            const paginatedTrades = await this.fetchPaginatedCallCursor ('fetchMyTrades', undefined, since, undefined, params, 'np', 'page', undefined, 100) as Trade[];
            return this.filterBySymbolSinceLimit (paginatedTrades, symbol, since, limit) as Trade[];
        }
        const request: Dict = {};
        let defaultCount = 50;
        if (limit !== undefined) {
            defaultCount = Math.min (limit, 100);
        }
        const count = this.safeInteger (params, 'count', defaultCount);
        request['count'] = Math.min (count, 100);
        params = this.omit (params, 'count');
        const response = await this.privateGetV1TradingFills (this.extend (request, params));
        //
        //     {
        //         "d": [
        //             {
        //                 "at": { "b": 97001267, "t": 1787037820000, "tx": 3, "txid": "0x1234", "l": 7 },
        //                 "mkt": 1,
        //                 "acc": 42,
        //                 "oid": 123456,
        //                 "t": 1,
        //                 "l": 2,
        //                 "p": 642517,
        //                 "s": 40566,
        //                 "f": "17731"
        //             }
        //         ],
        //         "np": "next-page-cursor"
        //     }
        //
        const data = this.addPaginationCursorToResult (response);
        const trades = this.parseTrades (data);
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit) as Trade[];
    }

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //     {
        //         "at": { "b": 97001267, "t": 1787037820000, "tx": 3, "txid": "0x1234", "l": 7 },
        //         "mkt": 1,
        //         "acc": 42,
        //         "oid": 123456,
        //         "t": 1,
        //         "l": 2,
        //         "p": 642517,
        //         "s": 40566,
        //         "f": "17731"
        //     }
        //
        const marketId = this.safeString (trade, 'mkt');
        market = this.safeMarket (marketId, market);
        const at = this.safeDict (trade, 'at', {});
        const timestamp = this.safeInteger (at, 't');
        const pricePrecision = this.numberToString (market['precision']['price']);
        const amountPrecision = this.numberToString (market['precision']['amount']);
        const quoteCurrency = this.currency (market['quote']);
        const quotePrecision = this.numberToString (quoteCurrency['precision']);
        const orderType = this.safeInteger (trade, 't');
        let side: Str = undefined;
        if ((orderType === 1) || (orderType === 4)) {
            side = 'buy';
        } else if ((orderType === 2) || (orderType === 3)) {
            side = 'sell';
        }
        const liquiditySide = this.safeInteger (trade, 'l');
        let takerOrMaker: Str = undefined;
        if (liquiditySide === 1) {
            takerOrMaker = 'maker';
        } else if (liquiditySide === 2) {
            takerOrMaker = 'taker';
        }
        const transactionId = this.safeString (at, 'txid');
        const logIndex = this.safeString (at, 'l');
        let id = transactionId;
        if ((id !== undefined) && (logIndex !== undefined)) {
            id = id + ':' + logIndex;
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': id,
            'order': this.safeString (trade, 'oid'),
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.parseNumber (Precise.stringMul (this.safeString (trade, 'p'), pricePrecision)),
            'amount': this.parseNumber (Precise.stringMul (this.safeString (trade, 's'), amountPrecision)),
            'cost': undefined,
            'fee': {
                'cost': this.parseNumber (Precise.stringMul (this.safeString (trade, 'f'), quotePrecision)),
                'currency': market['quote'],
            },
        }, market);
    }

    /**
     * @ignore
     * @method
     * @description adds the top-level Perpl history cursor to the last result for CCXT cursor pagination
     * @param {object} response raw Perpl history response
     * @returns {object[]} the history data with pagination context
     */
    addPaginationCursorToResult (response: any): Dict[] {
        const data = this.safeList (response, 'd', []);
        const paginationCursor = this.safeString (response, 'np');
        const dataLength = data.length;
        if ((paginationCursor !== undefined) && (paginationCursor.length > 0) && (dataLength > 0)) {
            const last = data[dataLength - 1];
            last['np'] = paginationCursor;
            data[dataLength - 1] = last;
        }
        return data;
    }

    /**
     * @method
     * @name perpl#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1market-datamarket_idcandlesresolutionfrom-to
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, maximum 1024
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} a list of [OHLCV structures]{@link https://docs.ccxt.com/#/?id=ohlcv-structure}
     */
    override async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const resolution = this.safeString (this.timeframes, timeframe, timeframe);
        const timeframeMilliseconds = this.parseTimeframe (timeframe) * 1000;
        let requestLimit = 1024;
        if (limit !== undefined) {
            requestLimit = Math.min (limit, 1024);
        }
        const duration = timeframeMilliseconds * (requestLimit - 1);
        let until = this.safeInteger (params, 'until');
        params = this.omit (params, 'until');
        if (since === undefined) {
            if (until === undefined) {
                until = this.milliseconds ();
            }
            since = (until as number) - duration;
        } else if (until === undefined) {
            until = Math.min (this.milliseconds (), since + duration);
        }
        const request: Dict = {
            'market_id': market['id'],
            'resolution': resolution,
            'from': since,
            'to': until,
        };
        const response = await this.publicGetV1MarketDataMarketIdCandlesResolutionFromTo (this.extend (request, params));
        //
        //     {
        //         "mt": 12,
        //         "sn": 97001532,
        //         "at": { "b": 97001532, "t": 1787037900000 },
        //         "r": 60,
        //         "d": [
        //             { "t": 1787037000000, "o": 642835, "c": 642821, "h": 642835, "l": 642786, "v": "52037259999", "n": 110 }
        //         ]
        //     }
        //
        const candles = this.safeList (response, 'd', []);
        return this.parseOHLCVs (candles, market, timeframe, since, requestLimit);
    }

    override parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        //
        //     {
        //         "t": 1787037000000,
        //         "o": 642835,
        //         "c": 642821,
        //         "h": 642835,
        //         "l": 642786,
        //         "v": "52037259999",
        //         "n": 110
        //     }
        //
        market = this.safeMarket (undefined, market);
        const pricePrecision = this.numberToString (market['precision']['price']);
        const quoteCurrency = this.currency (market['quote']);
        const quotePrecision = this.numberToString (quoteCurrency['precision']);
        return [
            this.safeInteger (ohlcv, 't'),
            this.parseNumber (Precise.stringMul (this.safeString (ohlcv, 'o'), pricePrecision)),
            this.parseNumber (Precise.stringMul (this.safeString (ohlcv, 'h'), pricePrecision)),
            this.parseNumber (Precise.stringMul (this.safeString (ohlcv, 'l'), pricePrecision)),
            this.parseNumber (Precise.stringMul (this.safeString (ohlcv, 'c'), pricePrecision)),
            this.parseNumber (Precise.stringMul (this.safeString (ohlcv, 'v'), quotePrecision)),
        ];
    }

    /**
     * @method
     * @name perpl#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1pubcontext
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetV1PubContext (params);
        //
        //     {
        //         "markets": [
        //             {
        //                 "id": 1,
        //                 "config": { "price_decimals": 1, "size_decimals": 5 },
        //                 "state": {
        //                     "at": { "b": 97001267, "t": 1787037820000 },
        //                     "orl": 642508,
        //                     "mrk": 642693,
        //                     "lst": 642517,
        //                     "mid": 642516,
        //                     "bid": 642516,
        //                     "ask": 642517,
        //                     "prv": 634970,
        //                     "dv": 127119980,
        //                     "dva": "81324722336080",
        //                     "oi": 4056609,
        //                     "tvl": "933252571361"
        //                 }
        //             }
        //         ]
        //     }
        //
        const markets = this.safeList (response, 'markets', []);
        const result: Tickers = {};
        for (let i = 0; i < markets.length; i++) {
            const rawTicker = markets[i];
            const marketId = this.safeString (rawTicker, 'id');
            const market = this.safeMarket (marketId);
            const ticker = this.parseTicker (rawTicker, market);
            const tickerSymbol = this.safeString (ticker, 'symbol');
            if (tickerSymbol !== undefined) {
                result[tickerSymbol] = ticker;
            }
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    /**
     * @method
     * @name perpl#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1pubcontext
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tickers = await this.fetchTickers ([ market['symbol'] ], params);
        const ticker = this.safeDict (tickers, market['symbol']);
        if (ticker === undefined) {
            throw new BadSymbol (this.id + ' fetchTicker() ticker not found for ' + symbol);
        }
        return ticker as Ticker;
    }

    /**
     * @method
     * @name perpl#fetchMarkPrices
     * @description fetches mark prices for multiple markets
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1pubcontext
     * @param {string[]} [symbols] unified symbols of the markets to fetch the mark prices for, all market mark prices are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchMarkPrices (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        return await this.fetchTickers (symbols, params);
    }

    /**
     * @method
     * @name perpl#fetchLastPrices
     * @description fetches the last price for multiple markets
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1pubcontext
     * @param {string[]} [symbols] unified symbols of the markets to fetch the last prices for, all market last prices are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of last price structures
     */
    override async fetchLastPrices (symbols: Strings = undefined, params = {}): Promise<LastPrices> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetV1PubContext (params);
        //
        //     {
        //         "markets": [
        //             {
        //                 "id": 1,
        //                 "state": {
        //                     "at": { "b": 97001267, "t": 1787037820000 },
        //                     "lst": 642517
        //                 }
        //             }
        //         ]
        //     }
        //
        const markets = this.safeList (response, 'markets', []);
        return this.parseLastPrices (markets, symbols);
    }

    override parseLastPrice (info: any, market: Market = undefined): LastPrice {
        //
        //     {
        //         "id": 1,
        //         "state": {
        //             "at": { "b": 97001267, "t": 1787037820000 },
        //             "lst": 642517
        //         }
        //     }
        //
        const marketId = this.safeString (info, 'id');
        market = this.safeMarket (marketId, market);
        const state = this.safeDict (info, 'state', {});
        const at = this.safeDict (state, 'at', {});
        const timestamp = this.safeInteger (at, 't');
        const pricePrecision = this.numberToString (market['precision']['price']);
        return {
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'price': this.parseNumber (Precise.stringMul (this.safeString (state, 'lst'), pricePrecision)),
            'side': undefined,
            'info': info,
        } as LastPrice;
    }

    /**
     * @method
     * @name perpl#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://github.com/PerplFoundation/api-docs/blob/main/rest-endpoints.md#get-apiv1pubcontext
     * @param {string[]} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        return await this.fetchTickers (symbols, params);
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "id": 1,
        //         "config": { "price_decimals": 1, "size_decimals": 5 },
        //         "state": {
        //             "at": { "b": 97001267, "t": 1787037820000 },
        //             "orl": 642508,
        //             "mrk": 642693,
        //             "lst": 642517,
        //             "mid": 642516,
        //             "bid": 642516,
        //             "ask": 642517,
        //             "prv": 634970,
        //             "dv": 127119980,
        //             "dva": "81324722336080",
        //             "oi": 4056609,
        //             "tvl": "933252571361"
        //         }
        //     }
        //
        const marketId = this.safeString (ticker, 'id');
        market = this.safeMarket (marketId, market);
        const state = this.safeDict (ticker, 'state', {});
        const at = this.safeDict (state, 'at', {});
        const timestamp = this.safeInteger (at, 't');
        const pricePrecision = this.numberToString (market['precision']['price']);
        const amountPrecision = this.numberToString (market['precision']['amount']);
        const quoteCurrency = this.currency (market['quote']);
        const quotePrecision = this.numberToString (quoteCurrency['precision']);
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.parseNumber (Precise.stringMul (this.safeString (state, 'bid'), pricePrecision)),
            'bidVolume': undefined,
            'ask': this.parseNumber (Precise.stringMul (this.safeString (state, 'ask'), pricePrecision)),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.parseNumber (Precise.stringMul (this.safeString (state, 'prv'), pricePrecision)),
            // prv is the price 24h ago, see https://github.com/PerplFoundation/api-docs/blob/main/types.md#marketstate
            'close': this.parseNumber (Precise.stringMul (this.safeString (state, 'lst'), pricePrecision)),
            'last': this.parseNumber (Precise.stringMul (this.safeString (state, 'lst'), pricePrecision)),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.parseNumber (Precise.stringMul (this.safeString (state, 'dv'), amountPrecision)),
            'quoteVolume': this.parseNumber (Precise.stringMul (this.safeString (state, 'dva'), quotePrecision)),
            'markPrice': this.parseNumber (Precise.stringMul (this.safeString (state, 'mrk'), pricePrecision)),
            'indexPrice': this.parseNumber (Precise.stringMul (this.safeString (state, 'orl'), pricePrecision)),
            'info': ticker,
        }, market);
    }

    override sign (path: any, api: any = 'public', method = 'GET', params = {}, headers: NullableDict = undefined, body: Str = undefined): Dict {
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        params = this.omit (params, this.extractParams (path));
        const paramsKeys = Object.keys (params);
        const paramsLength = paramsKeys.length;
        let query = '';
        if (method === 'GET' && paramsLength > 0) {
            query = this.urlencode (params);
            url += '?' + query;
        } else if (method === 'POST') {
            headers = {
                'Content-Type': 'application/json',
            };
            body = this.json (params);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const secret = this.remove0xPrefix (this.secret);
            if (secret.length !== 64) {
                throw new AuthenticationError (this.id + ' private key must be 32 bytes encoded as 64 hexadecimal characters');
            }
            const timestamp = this.milliseconds ().toString ();
            const nonceHex = this.uuid16 () + this.uuid16 ();
            const nonce = this.urlencodeBase64 (this.base16ToBinary (nonceHex));
            let requestTarget = endpoint;
            if (query.length > 0) {
                requestTarget += '?' + query;
            }
            const bodyPayload = (body === undefined) ? '' : body;
            const bodyHash = this.hash (this.encode (bodyPayload), sha256, 'hex');
            let chainIdKey = 'chainId';
            if (this.isSandboxModeEnabled) {
                chainIdKey = 'sandboxChainId';
            }
            const chainId = this.safeInteger (this.options, chainIdKey);
            const payloadArray = [ (chainId as number).toString (), method.toUpperCase (), requestTarget, timestamp, nonce, bodyHash ];
            // eslint-disable-next-line quotes
            const payload = payloadArray.join ("\n");
            const signatureBase64 = eddsa (this.encode (payload), this.base16ToBinary (secret), ed25519);
            const signature = this.urlencodeBase64 (this.base64ToBinary (signatureBase64));
            if (headers === undefined) {
                headers = {};
            }
            headers = this.extend (headers, {
                'X-API-Key': this.apiKey,
                'X-API-Timestamp': timestamp,
                'X-API-Nonce': nonce,
                'X-API-Signature': signature,
            });
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
