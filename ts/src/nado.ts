// ---------------------------------------------------------------------------

import Exchange from './abstract/nado.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Currencies, Currency, Dict, Market, Num, Str } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class nado
 * @augments Exchange
 */
export default class nado extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'nado',
            'name': 'Nado',
            'countries': [ 'KY' ], // Cayman Islands
            'rateLimit': 25,
            'version': 'v1',
            'precisionMode': TICK_SIZE,
            'certified': false,
            'pro': false,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'createOrder': false,
                'fetchBalance': false,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchPositions': false,
                'fetchStatus': true,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
                'withdraw': false,
            },
            'urls': {
                'logo': undefined,
                'api': {
                    'gateway': 'https://gateway.prod.nado.xyz/v1',
                    'gatewayV2': 'https://gateway.prod.nado.xyz/v2',
                    'archive': 'https://archive.prod.nado.xyz/v1',
                    'archiveV2': 'https://archive.prod.nado.xyz/v2',
                    'trigger': 'https://trigger.prod.nado.xyz/v1',
                },
                'test': {
                    'gateway': 'https://gateway.test.nado.xyz/v1',
                    'gatewayV2': 'https://gateway.test.nado.xyz/v2',
                    'archive': 'https://archive.test.nado.xyz/v1',
                    'archiveV2': 'https://archive.test.nado.xyz/v2',
                    'trigger': 'https://trigger.test.nado.xyz/v1',
                },
                'www': 'https://nado.xyz',
                'doc': 'https://docs.nado.xyz/',
            },
            'api': {
                'gateway': {
                    'public': {
                        'get': {
                            'symbols': 2,
                            'query': 1,
                        },
                        'post': {
                            'query': 1,
                        },
                    },
                    'private': {
                        'post': {
                            'execute': 1,
                        },
                    },
                },
                'gatewayV2': {
                    'public': {
                        'get': {
                            'assets': 2,
                            'pairs': 1,
                            'orderbook': 1,
                        },
                    },
                },
                'archive': {
                    'post': {
                        '': 1,
                    },
                },
                'archiveV2': {
                    'public': {
                        'get': {
                            'tickers': 1,
                            'contracts': 1,
                            'trades': 1,
                        },
                    },
                },
                'trigger': {
                    'private': {
                        'post': {
                            'execute': 1,
                            'query': 1,
                        },
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0001'),
                    'taker': this.parseNumber ('0.00035'),
                },
            },
            'options': {
                'defaultType': 'swap',
            },
            'features': {},
            'exceptions': {
                'exact': {},
                'broad': {},
            },
        });
    }

    /**
     * @method
     * @name nado#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.nado.xyz/developer-resources/api/gateway/queries/status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    async fetchStatus (params = {}) {
        const request: Dict = {
            'type': 'status',
        };
        const response = await this.gatewayPublicGetQuery (this.extend (request, params));
        //
        //     {
        //         "status": "success",
        //         "data": "active",
        //         "request_type": "query_status"
        //     }
        //
        const status = this.safeString (response, 'data');
        return {
            'status': (status === 'active') ? 'ok' : 'error',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    /**
     * @method
     * @name nado#fetchMarkets
     * @description retrieves data on all markets for nado
     * @see https://docs.nado.xyz/developer-resources/api/gateway/queries/symbols
     * @see https://docs.nado.xyz/developer-resources/api/v2/pairs
     * @see https://docs.nado.xyz/developer-resources/api/v2/assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const symbolsRequest = this.gatewayPublicGetSymbols (params);
        const pairsRequest = this.gatewayV2PublicGetPairs (params);
        const assetsRequest = this.gatewayV2PublicGetAssets (params);
        const responses = await Promise.all ([ symbolsRequest, pairsRequest, assetsRequest ]);
        const symbols = this.safeList (responses, 0, []);
        const pairs = this.safeList (responses, 1, []);
        const assets = this.safeList (responses, 2, []);
        const pairsById = this.indexBy (pairs, 'product_id');
        const assetsById = this.indexBy (assets, 'product_id');
        const markets = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = symbols[i];
            const id = this.safeString (market, 'product_id');
            const pair = this.safeDict (pairsById, id, {});
            const asset = this.safeDict (assetsById, id, {});
            const rawType = this.safeString (market, 'type');
            const type = (rawType === 'perp') ? 'swap' : rawType;
            const contract = (type === 'swap');
            const tickerId = this.safeString2 (pair, 'ticker_id', 'tickerId');
            if (tickerId === undefined) {
                continue;
            }
            const baseId = this.safeString (market, 'symbol');
            const quoteId = this.safeString (pair, 'quote', 'USDT0');
            const settleId = contract ? quoteId : undefined;
            const base = this.safeCurrencyCode (this.removeMarketSuffix (baseId));
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            let symbol = base + '/' + quote;
            if (contract) {
                symbol += ':' + settle;
            }
            const tradingStatus = this.safeString (market, 'trading_status');
            const active = (tradingStatus !== 'not_tradable');
            const priceIncrement = this.parseX18 (this.safeString (market, 'price_increment_x18'));
            const amountIncrement = this.parseX18 (this.safeString (market, 'size_increment'));
            const minCost = this.parseX18 (this.safeString (market, 'min_size'));
            markets.push ({
                'id': id,
                'lowercaseId': undefined,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'spot': (type === 'spot'),
                'margin': undefined,
                'swap': contract,
                'future': false,
                'option': false,
                'active': active,
                'contract': contract,
                'linear': contract ? true : undefined,
                'inverse': contract ? false : undefined,
                'taker': this.parseX18 (this.safeString (market, 'taker_fee_rate_x18')),
                'maker': this.parseX18 (this.safeString (market, 'maker_fee_rate_x18')),
                'contractSize': contract ? 1 : undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': amountIncrement,
                    'price': priceIncrement,
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
                        'min': minCost,
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': this.extend (market, {
                    'ticker_id': tickerId,
                    'name': this.safeString (asset, 'name'),
                    'v2Pair': pair,
                    'v2Asset': asset,
                }),
            });
        }
        return markets;
    }

    /**
     * @method
     * @name nado#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.nado.xyz/developer-resources/api/v2/assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.gatewayV2PublicGetAssets (params);
        return this.parseCurrencies (response);
    }

    parseCurrency (rawCurrency: Dict): Currency {
        const marketType = this.safeString (rawCurrency, 'market_type');
        const canDeposit = this.safeBool (rawCurrency, 'can_deposit', false);
        const canWithdraw = this.safeBool (rawCurrency, 'can_withdraw', false);
        if ((marketType === 'perp') && !canDeposit && !canWithdraw) {
            return undefined;
        }
        const id = this.safeString (rawCurrency, 'product_id');
        const currencyId = this.safeString (rawCurrency, 'symbol');
        const code = this.safeCurrencyCode (this.removeMarketSuffix (currencyId));
        return this.safeCurrencyStructure ({
            'id': id,
            'name': this.safeString (rawCurrency, 'name'),
            'code': code,
            'precision': undefined,
            'active': undefined,
            'fee': undefined,
            'networks': {},
            'deposit': canDeposit,
            'withdraw': canWithdraw,
            'type': 'crypto',
            'limits': {
                'amount': {
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

    parseX18 (value: Str): Num {
        if (value === undefined) {
            return undefined;
        }
        return this.parseNumber (Precise.stringDiv (value, '1000000000000000000'));
    }

    removeMarketSuffix (marketId: Str): Str {
        if (marketId === undefined) {
            return undefined;
        }
        if (marketId.endsWith ('-PERP')) {
            return marketId.slice (0, -5);
        }
        return marketId;
    }

    sign (path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const endpoint = Array.isArray (api) ? api[0] : api;
        let url = this.urls['api'][endpoint];
        if (path !== '') {
            url += '/' + this.implodeParams (path, params);
        }
        const query = this.omit (params, this.extractParams (path));
        headers = {};
        if (endpoint === 'gateway') {
            headers['Accept-Encoding'] = 'gzip, br, deflate';
        }
        if (method === 'GET') {
            if (Object.keys (query).length > 0) {
                url += '?' + this.urlencode (query);
            }
        } else {
            headers['Content-Type'] = 'application/json';
            body = this.json (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
