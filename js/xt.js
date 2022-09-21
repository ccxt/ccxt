const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
// const Precise = require ('./base/Precise');
const { ExchangeError } = require ('./base/errors');
// ^^^ BadSymbol, BadRequest, OnMaintenance, InvalidOrder, ArgumentsRequired AccountSuspended, PermissionDenied, RateLimitExceeded, ExchangeNotAvailable, OrderNotFound, InsufficientFunds, AuthenticationError

module.exports = class xt extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'xt',
            'name': 'XT',
            'countries': [ 'SC' ], // Seychelles
            // 10 requests per second => 1000ms / 10 = 100 (All other)
            // 3 requests per second => 1000ms / 3 = 333.333 (get assets -> fetchMarkets)
            // 1000 times per minute for each single IP -> Otherwise account locked for 10min

            'rateLimit': 100, // TODO: optimize https://doc.xt.com/#documentationlimitRules
            'version': '1',
            'pro': false,
            'has': {
                'CORS': false,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': undefined,
                'fetchCurrencies': false,
                'fetchMarkets': true,
                'fetchSpotMarkets': true,
                'fetchUSDTMarkets': true,
                'fetchCOINMarkets': true,
            },
            'precisionMode': TICK_SIZE,
            'urls': {
                'logo': '', // TODO: Add logo
                'api': {
                    'public': 'https://api.xt.com',
                    'private': 'https://api.xt.com', // TODO: Spare url: https://api.xt.pub, where to enter ?
                },
                'www': 'https://xt.com',
                'referral': '', // TODO: Add referral
                'doc': [
                    'https://doc.xt.com/',
                    'https://github.com/xtpub/api-doc',
                ],
                'fees': [
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'data/api/v1/getCoinConfig': 333.33,
                        'data/api/v1/getMarketConfig': 333.33,
                        'data/api/v1/getKLine': 100,
                        'data/api/v1/getTicker': 100,
                        'data/api/v1/getTickers': 100,
                        'data/api/v1/getDepth': 100,
                        'data/api/v1/getTrades': 100,
                        'trade/api/v1/getServerTime': 100,
                        'data/getCoinConfig': 333.33,
                        'data/getMarketConfig': 333.33,
                        'data/getKLine': 100,
                        'data/getTicker': 100,
                        'data/getDepth': 100,
                        'data/getTrades': 100,
                        'trade/getServerTime': 100,
                        'future/market/v1/public/symbol/coins': 333.33,
                        'future/market/v1/public/symbol/detail': 333.33,
                        'future/market/v1/public/symbol/list': 100,
                        'future/market/v1/public/leverage/bracket/detail': 100,
                        'future/market/v1/public/leverage/bracket/list': 100,
                        'future/market/v1/public/q/ticker': 100,
                        'future/market/v1/public/q/tickers': 100,
                        'future/market/v1/public/q/deal': 100,
                        'future/market/v1/public/q/depth': 100,
                        'future/market/v1/public/q/symbol-index-price': 100,
                        'future/market/v1/public/q/index-price': 100,
                        'future/market/v1/public/q/symbol-mark-price': 100,
                        'future/market/v1/public/q/mark-price': 100,
                        'future/market/v1/public/q/kline': 100,
                        'future/market/v1/public/q/agg-ticker': 100,
                        'future/market/v1/public/q/agg-tickers': 100,
                        'future/market/v1/public/q/funding-rate': 100,
                        'future/market/v1/public/q/funding-rate-record': 100,
                        'future/market/v1/public/contract/risk-balance': 100,
                        'future/market/v1/public/contract/open-interest': 100,
                    },
                },
                'private': {
                    'get': {
                        'trade/api/v1/getBalance': 100,
                        'trade/api/v1/getAccounts': 100,
                        'trade/api/v1/getFunds': 100,
                        'trade/api/v1/getOrder': 100,
                        'trade/api/v1/getOpenOrders': 100,
                        'trade/api/v1/getBatchOrders': 100,
                        'trade/api/v1/myTrades': 100,
                    },
                    'post': {
                        'trade/api/v1/order': 100,
                        'trade/api/v1/batchOrder': 100,
                    },
                    'delete': {
                        'trade/api/v1/cancel': 100,
                        'trade/api/v1/batchCancel': 100,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.002'),
                    'maker': this.parseNumber ('0.002'),
                    'tiers': {
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('5000'), this.parseNumber ('0.0018') ],
                            [ this.parseNumber ('10000'), this.parseNumber ('0.0016') ],
                            [ this.parseNumber ('20000'), this.parseNumber ('0.0014') ],
                            [ this.parseNumber ('50000'), this.parseNumber ('0.0012') ],
                            [ this.parseNumber ('150000'), this.parseNumber ('0.0010') ],
                            [ this.parseNumber ('300000'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('600000'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('1200000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('2500000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('6000000'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('15000000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('30000000'), this.parseNumber ('0.0002') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('5000'), this.parseNumber ('0.0018') ],
                            [ this.parseNumber ('10000'), this.parseNumber ('0.0016') ],
                            [ this.parseNumber ('20000'), this.parseNumber ('0.0014') ],
                            [ this.parseNumber ('50000'), this.parseNumber ('0.0012') ],
                            [ this.parseNumber ('150000'), this.parseNumber ('0.0010') ],
                            [ this.parseNumber ('300000'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('600000'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('1200000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('2500000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('6000000'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('15000000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('30000000'), this.parseNumber ('0.0002') ],
                        ],
                    },
                },
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '6h': '6hour',
                '1d': '1day',
                '1w': '7day',
                '1M': '30day',
            },
            'exceptions': {
                'exact': { // TODO: Error codes
                },
                'broad': {},
            },
            'options': { // TODO: options
                'networks': {
                },
                'accountsByType': {
                },
            },
            'commonCurrencies': { // TODO: commonCurrencies
            },
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    async fetchCurrencies (params = {}) {
        // TODO: fetchCurrencies
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name xt#fetchMarkets
         * @description retrieves data on all markets for xt
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const defaultType = this.safeString2 (this.options, 'fetchMarkets', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const spot = (type === 'spot');
        const future = (type === 'future');
        const delivery = (type === 'delivery');
        if ((!spot) && (!future) && (!delivery)) {
            throw new ExchangeError (this.id + " does not support '" + type + "' type, set exchange.options['defaultType'] to 'spot', 'margin', 'delivery' or 'future'"); // eslint-disable-line quotes
        }
        if (future) {
            this.fetchUSDTMarkets (query);
        } else if (delivery) {
            this.fetchCOINMarkets (query);
        } else {
            this.fetchSpotMarkets (query);
        }
    }

    async fetchSpotMarkets (params = {}) {
        const response = await this.publicGetDataApiV1GetMarketConfig (params);
        //
        //    {
        //      "raca_xt": {
        //      "minAmount": 1,
        //      "pricePoint": 7,
        //      "coinPoint": 0,
        //      "maker": 0.002,
        //      "minMoney": 0,
        //      "taker": 0.002
        //    }
        //
        const markets = this.safeValue (response, 'result', []);
        console.log (markets);
    }

    async fetchFuturesUSDTMarkets (params = {}) {
        const response = await this.fapiPublicFutureMarketV1PublicSymbolList (params);
        //
        //    [
        //      {
        //         "symbol": "btc_usdt",
        //         "contractType": "PERPETUAL",
        //         "underlyingType": "U_BASED",
        //         "contractSize": "0.0001",
        //         "tradeSwitch": true,
        //         "state": 0,
        //         "initLeverage": 10,
        //         "initPositionType": "CROSSED",
        //         "baseCoin": "btc",
        //         "quoteCoin": "usdt",
        //         "baseCoinPrecision": 8,
        //         "baseCoinDisplayPrecision": 8,
        //         "quoteCoinPrecision": 8,
        //         "quoteCoinD        let method = 'publicGetDataApiV1GetMarketConfig';rustType": "TAKE_PROFIT,STOP,TAKE_PROFIT_MARKET,STOP_MARKET,TRAILING_STOP_MARKET",
        //         "supportPositionType": "CROSSED,ISOLATED",
        //         "minPrice": null,
        //         "minQty": "1",
        //         "minNotional": "5",
        //         "maxNotional": "100000",
        //         "multiplierDown": "0.005",
        //         "multiplierUp": "0.005",
        //         "maxOpenOrders": 200,
        //         "maxEntrusts": 120,
        //         "makerFee": "0.00015",
        //         "takerFee": "0.0007",
        //         "liquidationFee": "0.015",
        //         "marketTakeBound": "0.005",
        //         "depthPrecisionMerge": 5,
        //         "labels": [
        //         "HOT"
        //         ],
        //         "onboardDate": 1654857001000,
        //         "enName": "BTCUSDT Perpetual",
        //         "cnName": "BTCUSDT 永续",
        //         "minStepPrice": "0.5"
        //       },
        //    ]
        //
        const markets = this.safeValue (response, 'result', []);
        console.log (markets);
    }

    async fetchFuturesCOINMarkets (params = {}) {
        const response = await this.dapiPublicFutureMarketV1PublicSymbolList (params);
        //
        //  [
        //    {
        //      "symbol": "btc_usd",
        //      "contractType": "PERPETUAL",
        //      "underlyingType": "COIN_BASED",
        //      "contractSize": "100",
        //      "tradeSwitch": true,
        //      "state": 0,
        //      "initLeverage": 10,
        //      "initPositionType": "CROSSED",
        //      "baseCoin": "btc",
        //      "quoteCoin": "usd",
        //      "baseCoinPrecision": 8,
        //      "baseCoinDisplayPrecision": 8,
        //      "quoteCoinPrecision": 8,
        //      "quoteCoinDisplayPrecision": 8,
        //      "quantityPrecision": 0,response
        //      "maxEntrusts": 120,
        //      "makerFee": "0.00015",
        //      "takerFee": "0.0007",
        //      "liquidationFee": "0.015",
        //      "marketTakeBound": "0.005",
        //      "depthPrecisionMerge": 5,
        //      "labels": [
        //      "HOT"
        //      ],
        //      "onboardDate": 1654859400000,
        //      "enName": "BTCUSD Perpetual",
        //      "cnName": "BTCUSD 永续",
        //      "minStepPrice": "0.5"
        //    },
        //  ]
        //
        const markets = this.safeValue (response, 'result', []);
        console.log (markets);
    }
};
