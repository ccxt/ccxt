//  ---------------------------------------------------------------------------

import Exchange from './abstract/perpl.js';
import { BadRequest, BadSymbol, NotSupported, OperationRejected, PermissionDenied } from './base/errors.js';
import Precise from './base/Precise.js';
import type { Currencies, CurrencyInterface, Dict, Endpoint, FundingRate, FundingRateHistory, FundingRates, Int, Market, NullableDict, OHLCV, Str, Strings, Ticker, Tickers } from './base/types.js';

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
                'fetchCurrencies': true,
                'fetchCurrenciesWs': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchPositions': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': false,
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

    override sign (path: any, api: any = 'public', method = 'GET', params = {}, headers: NullableDict = undefined, body: Str = undefined) {
        if (api === 'private') {
            throw new NotSupported (this.id + ' private API authentication is not implemented yet');
        }
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        const paramsKeys = Object.keys (params);
        const paramsLength = paramsKeys.length;
        if (method === 'GET' && paramsLength > 0) {
            url += '?' + this.urlencode (params);
        } else if (method === 'POST') {
            headers = {
                'Content-Type': 'application/json',
            };
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
