//  ---------------------------------------------------------------------------

import Exchange from './abstract/perpl.js';
import { BadRequest, NotSupported, OperationRejected, PermissionDenied } from './base/errors.js';
import Precise from './base/Precise.js';
import type { Currencies, CurrencyInterface, Dict, Endpoint, Market, NullableDict, Str } from './base/types.js';

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
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchPositions': false,
                'fetchTicker': false,
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

    /**
     * @ignore
     * @param {object} market raw market and its related protocol instance and collateral token
     * @returns {object} a unified market structure
     */
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
