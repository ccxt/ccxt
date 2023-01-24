'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { BadSymbol } = require ('./base/errors');
// const { AuthenticationError, BadRequest, DDoSProtection, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, OrderNotFound, PermissionDenied, ArgumentsRequired, BadSymbol } = require ('./base/errors');
// const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class derivadex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'derivadex',
            'name': 'DerivaDEX',
            'countries': [ 'SG' ], // Singapore
            'version': 'v1',
            'rateLimit': 200, // TODO: add documentation for tiered rate limiting
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTransactions': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'reduceMargin': false,
                'setLeverage': true,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'test': {
                    'public': 'https://beta.derivadex.io',
                    'private': 'https://beta.derivadex.io',
                    'stats': 'https://beta.derivadex.io/stats',
                    'v2': 'https://beta.derivadex.io/v2',
                    'op1': 'http://op1.ddx.one:15080/stats', // TODO: delete this before submitting
                },
                'logo': 'https://gitlab.com/dexlabs/assets/-/raw/main/light-round.png',
                'api': {
                    'public': 'https://exchange.derivadex.com',
                    'private': 'https://exchange.derivadex.com',
                    'stats': 'https://exchange.derivadex.com/stats',
                    'v2': 'https://exchange.derivadex.com/v2',
                },
                'www': 'https://exchange.derivadex.com',
                'doc': [
                    'https://docs.derivadex.io',
                    'http://api.derivadex.io/',
                    'https://exchange.derivadex.com/api-docs',
                ],
                'fees': 'https://docs.derivadex.io/trading/fees',
            },
            'api': {
                'public': {
                    'get': {
                        // TODO: FIX THE API COSTS
                        'account/{trader}/strategy/{strategyId}/adls': 1,
                        'account/{trader}/strategy/{strategyId}/fills': 1,
                        'account/{trader}/strategy/{strategyId}/': 1,
                        'account/{trader}/strategy/{strategyId}/liquidations': 1,
                        'account/{trader}/strategy/{strategyId}/order_book': 1,
                        'account/{trader}/strategy/{strategyId}/order_intents': 1,
                        'account/{trader}/strategy/{strategyId}/positions': 1,
                        'account/{trader}/strategy/{strategyId}/strategy_updates': 1,
                        'account/{trader}': 1,
                        'account/{trader}/trader_updates': 1,
                        'adl': 1,
                        'ddx_fee_pool': 1,
                        'epochs': 1,
                        'fills': 1,
                        'insurance_fund': 1,
                        'liquidations': 1,
                        'order_book': 1,
                        'order_intents': 1,
                        'positions': 1,
                        'prices': 1,
                        'specs': 1,
                        'strategies': 1,
                        'startegy_updates': 1,
                        'trader_updates': 1,
                        'traders': 1,
                        'tx_logs': 1,
                        'aggregations/collateral': 1,
                        'aggregations/volume': 1,
                        'aggregations/markets': 1,
                        'aggregations/order_book/L2/{symbol}': 1,
                    },
                },
                'private': {
                    'get': {
                        'apiKey': 5,
                    },
                    'post': {
                        'apiKey': 5,
                    },
                },
            },
            // TODO: FILL OUT EXCEPTIONS
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'defaultType': 'swap',
                'defaultNetwork': 'ERC20',
                'networks': {
                    'ETH': 'ERC20',
                },
                'networksById': {
                    'ETH': 'ERC20',
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.002,
                    'maker': 0.0,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name derivadex#fetchMarkets
         * @description retrieves data on all markets for derivadex
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        params['kind'] = 0;
        const response = await this.publicGetSpecs (params);
        // {
        //     "value": [
        //         {
        //             "kind": 0,
        //             "name": "DDXPERP",
        //             "expr": "\n(Market :name "DDXPERP"\n :tick-size 0.1\n :max-order-notional 0\n :max-taker-price-deviation 0.02\n :min-order-size 0.0001\n)",
        //             "value": {
        //                 "tickSize": "0.1",
        //                 "minOrderSize": "0.0001",
        //                 "maxOrderNotional": "0",
        //                 "maxTakerPriceDeviation": "0.02"
        //             }
        //         },
        //         {
        //             "kind": 0,
        //             "name": "BTCPERP",
        //             "expr": "\n(Market :name "BTCPERP"\n :tick-size 1\n :max-order-notional 1000000\n :max-taker-price-deviation 0.02\n :min-order-size 0.00001\n)",
        //             "value": {
        //                 "tickSize": "1",
        //                 "minOrderSize": "0.00001",
        //                 "maxOrderNotional": "1000000",
        //                 "maxTakerPriceDeviation": "0.02"
        //             }
        //         },
        //         {
        //             "kind": 0,
        //             "name": "ETHPERP",
        //             "expr": "\n(Market :name "ETHPERP"\n :tick-size 0.1\n :max-order-notional 1000000\n :max-taker-price-deviation 0.02\n :min-order-size 0.0001\n)",
        //             "value": {
        //                 "tickSize": "0.1",
        //                 "minOrderSize": "0.0001",
        //                 "maxOrderNotional": "1000000",
        //                 "maxTakerPriceDeviation": "0.02"
        //             }
        //         }
        //     ],
        //         "timestamp": 1674260369,
        //         "success": true
        // }
        const markets = response['value'];
        return [
            {
                'id': 'BTCPERP',
                'symbol': 'BTCPERP',
                'base': 'BTC',
                'quote': 'USD',
                'settle': 'USDC',
                'baseId': 'btc',
                'quoteId': 'usd',
                'settleId': 'usdc',
                'type': 'swap',
                'spot': 'false',
                'margin': 'false',
                'swap': 'true',
                'future': 'false',
                'option': 'swap',
                'active': 'true',
                'contract': 'true',
                'linear': 'true',
                'inverse': 'false',
                'taker': '0.002',
                'maker': '0.000',
                'precision': {
                    'amount': '0.0001',
                    'price': '0.1',
                    'quote': '0.0001',
                },
                'limits': {
                    'leverage': {
                        'min': 1,
                        'max': 3,
                    },
                    'amount': {
                        'min': 0.00001,
                        'max': undefined,
                    },
                    'price': {
                        'min': 1,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': 1000000,
                    },
                },
                'info': markets,
            },
            {
                'id': 'ETHPERP',
                'symbol': 'ETHPERP',
                'base': 'ETH',
                'quote': 'USD',
                'settle': 'USDC',
                'baseId': 'eth',
                'quoteId': 'usd',
                'settleId': 'usdc',
                'type': 'swap',
                'spot': 'false',
                'margin': 'false',
                'swap': 'true',
                'future': 'false',
                'option': 'swap',
                'active': 'true',
                'contract': 'true',
                'linear': 'true',
                'inverse': 'false',
                'taker': '0.002',
                'maker': '0.000',
                'precision': {
                    'amount': '0.0001',
                    'price': '0.1',
                    'quote': '0.0001',
                },
                'limits': {
                    'leverage': {
                        'min': 1,
                        'max': 3,
                    },
                    'amount': {
                        'min': 0.0001,
                        'max': undefined,
                    },
                    'price': {
                        'min': 0.1,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': 1000000,
                    },
                },
                'info': markets,
            },
        ];
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name derivadex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const networks = {};
        networks['ERC20'] = {
            'info': undefined,
            'id': 'ETH',
            'network': this.networkIdToCode ('ETH'),
            'active': true,
            'deposit': true,
            'withdraw': true,
            'fee': undefined,
        };
        return [
            {
                'id': 'usdc',
                'code': 'USDC',
                'name': 'USDC',
                'active': true,
                'fee': 0,
                'precision': 2,
                'deposit': true,
                'withdraw': true,
                'limits': {
                    'deposit': {
                        'min': 1000,
                        'max': 1000000,
                    },
                },
                'networks': networks,
                'info': undefined,
            },
            {
                'id': 'ddx',
                'code': 'DDX',
                'name': 'DDX',
                'active': false,
                'fee': 0,
                'precision': 2,
                'deposit': true,
                'withdraw': true,
                'networks': networks,
                'info': undefined,
            },
        ];
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name derivadex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tickers = await this.fetchTickers ([ market['symbol'] ], params);
        const ticker = this.safeValue (tickers, market['symbol']);
        if (ticker === undefined) {
            throw new BadSymbol (this.id + ' fetchTicker() symbol ' + symbol + ' not found');
        }
        return ticker;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const result = {};
        for (let i = 0; i < symbols.length; i++) {
            const ticker = await this.constructTicker (symbols[i]);
            if (ticker !== undefined) {
                result[symbols[i]] = ticker;
            }
        }
        return result;
    }

    async constructTicker (symbol) {
        const params = {};
        params['symbol'] = symbol;
        const marketsResponse = await this.publicGetAggregationsMarkets (params); // aggregations/markets endpoint response is cached for 30 minutes
        params['limit'] = 1;
        params['priceAggregation'] = symbol === 'BTCPERP' ? 1 : 0.1; // set aggregation to minimum tick size for the market
        const request = {
            'symbol': symbol,
        };
        const orderBookResponse = await this.publicGetAggregationsOrderBookL2Symbol (this.extend (request, params)); // aggregations/order_book endpoint response is cached for 30 minutes
        const marketsValue = marketsResponse['value'][0];
        const orderBookValue = orderBookResponse['value'];
        const quoteVolume = this.safeString (marketsValue, 'volume');
        const timestamp = this.safeString (marketsResponse, 'timestamp');
        const close = this.safeString (marketsValue, 'price');
        const bid = this.safeString (orderBookValue[0], 'price');
        const bidVolume = this.safeString (orderBookValue[0], 'amount');
        const ask = this.safeString (orderBookValue[1], 'price');
        const askVolume = this.safeString (orderBookValue[1], 'amount');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': undefined,
            'high': undefined,
            'low': undefined,
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': undefined,
            'open': undefined,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': quoteVolume,
            'info': marketsResponse,
        };
    }

    sign (path, api = 'stats', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const implodedPath = this.implodeParams (path, params);
        let query = '/api/' + this.version + '/' + implodedPath;
        if (method === 'GET') {
            if (Object.keys (params).length) {
                query += '?' + this.urlencode (params);
            }
        } else {
            const format = this.safeString (params, '_format');
            if (format !== undefined) {
                query += '?' + this.urlencode ({ '_format': format });
                params = this.omit (params, '_format');
            }
        }
        const url = this.urls['test']['op1'] + query; // TODO: SWITCH TO MAINNET URL
        const isAuthenticated = this.checkRequiredCredentials (false);
        if (api === 'private' || (api === 'public' && isAuthenticated)) {
            this.checkRequiredCredentials ();
            let auth = method + query;
            let expires = this.safeInteger (this.options, 'api-expires');
            headers = {
                'Content-Type': 'application/json',
                'api-key': this.apiKey,
            };
            expires = this.sum (this.seconds (), expires);
            expires = expires.toString ();
            auth += expires;
            headers['api-expires'] = expires;
            if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
                if (Object.keys (params).length) {
                    body = this.json (params);
                    auth += body;
                }
            }
            headers['api-signature'] = this.hmac (this.encode (auth), this.encode (this.secret));
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
