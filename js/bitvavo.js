'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

// ----------------------------------------------------------------------------
module.exports = class bitvavo extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitvavo',
            'name': 'Bitvavo',
            'countries': [ 'NL' ], // Netherlands
            'rateLimit': 500,
            'version': 'v2',
            'certified': true,
            'has': {
                'CORS': false,
                'publicAPI': true,
                'privateAPI': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/82067900-faeb0f80-96d9-11ea-9f22-0071cfcb9871.jpg',
                'api': {
                    'public': 'https://api.bitvavo.com',
                    'private': 'https://api.bitvavo.com',
                },
                'www': 'https://bitvavo.com/',
                'doc': 'https://docs.bitvavo.com/',
                'fees': 'https://bitvavo.com/en/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'time',
                        'markets',
                        'assets',
                        '{market}/book',
                        '{market}/trades',
                        '{market}/candles',
                        'ticker/price',
                        'ticker/book',
                        'ticker/24h',
                    ],
                },
                'private': {
                    'get': [
                        'order',
                        'orders',
                        'ordersOpen',
                        'trades',
                        'balance',
                        'deposit',
                        'depositHistory',
                        'withdrawalHistory',
                    ],
                    'post': [
                        'order',
                        'withdrawal',
                    ],
                    'put': [
                        'order',
                    ],
                    'delete': [
                        'order',
                        'orders',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.25 / 100,
                    'maker': 0.20 / 100,
                    'tiers': {
                        'taker': [
                            [ 0, 0.0025 ],
                            [ 50000, 0.0024 ],
                            [ 100000, 0.0022 ],
                            [ 250000, 0.0020 ],
                            [ 500000, 0.0018 ],
                            [ 1000000, 0.0016 ],
                            [ 2500000, 0.0014 ],
                            [ 5000000, 0.0012 ],
                            [ 10000000, 0.0010 ],
                        ],
                        'maker': [
                            [ 0, 0.0020 ],
                            [ 50000, 0.0015 ],
                            [ 100000, 0.0010 ],
                            [ 250000, 0.0006 ],
                            [ 500000, 0.0003 ],
                            [ 1000000, 0.0001 ],
                            [ 2500000, -0.0001 ],
                            [ 5000000, -0.0003 ],
                            [ 10000000, -0.0005 ],
                        ],
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        //
        //     { "time": 1590379519148 }
        //
        return this.safeInteger (response, 'time');
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        //
        //     [
        //         {
        //             "market":"ADA-BTC",
        //             "status":"trading", // "trading" "halted" "auction"
        //             "base":"ADA",
        //             "quote":"BTC",
        //             "pricePrecision":5,
        //             "minOrderInBaseAsset":"100",
        //             "minOrderInQuoteAsset":"0.001",
        //             "orderTypes": [ "market", "limit" ]
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = this.parseMarket (response[i]);
            result.push (market);
        }
        return result;
    }

    parseMarket (market) {
        //
        //     {
        //         "market":"ADA-BTC",
        //         "status":"trading", // "trading" "halted" "auction"
        //         "base":"ADA",
        //         "quote":"BTC",
        //         "pricePrecision":5,
        //         "minOrderInBaseAsset":"100",
        //         "minOrderInQuoteAsset":"0.001",
        //         "orderTypes": [ "market", "limit" ]
        //     }
        //
        const id = this.safeString (market, 'market');
        const baseId = this.safeString (market, 'base');
        const quoteId = this.safeString (market, 'quote');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const status = this.safeString (market, 'status');
        const active = (status === 'trading');
        const precision = {
            'price': this.safeInteger (market, 'pricePrecision'),
            'amount': undefined,
        };
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'info': market,
            'active': active,
            'precision': precision,
            'limits': {
                'amount': {
                    'min': this.safeFloat (market, 'minOrderInBaseAsset'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeFloat (market, 'minOrderInQuoteAsset'),
                    'max': undefined,
                },
            },
        };
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetAssets (params);
        //
        //     [
        //         {
        //             "symbol":"ADA",
        //             "name":"Cardano",
        //             "decimals":6,
        //             "depositFee":"0",
        //             "depositConfirmations":15,
        //             "depositStatus":"OK", // "OK", "MAINTENANCE", "DELISTED"
        //             "withdrawalFee":"0.2",
        //             "withdrawalMinAmount":"0.2",
        //             "withdrawalStatus":"OK", // "OK", "MAINTENANCE", "DELISTED"
        //             "networks": [ "Mainnet" ], // "ETH", "NEO", "ONT", "SEPA", "VET"
        //             "message":"",
        //         },
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'symbol');
            const code = this.safeCurrencyCode (id);
            const depositStatus = this.safeValue (currency, 'depositStatus');
            const deposit = (depositStatus === 'OK');
            const withdrawalStatus = this.safeValue (currency, 'withdrawalStatus');
            const withdrawal = (withdrawalStatus === 'OK');
            const active = deposit && withdrawal;
            const name = this.safeString (currency, 'name');
            const precision = this.safeInteger (currency, 'decimals');
            result[code] = {
                'id': id,
                'info': currency,
                'code': code,
                'name': name,
                'active': active,
                'fee': this.safeFloat (currency, 'withdrawalFee'),
                'precision': precision,
                'limits': {
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
                    'withdraw': {
                        'min': this.safeFloat (currency, 'withdrawalMinAmount'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTicker24h (this.extend (request, params));
        //
        //     {
        //         "market":"ETH-BTC",
        //         "open":"0.022578",
        //         "high":"0.023019",
        //         "low":"0.022573",
        //         "last":"0.023019",
        //         "volume":"25.16366324",
        //         "volumeQuote":"0.57333305",
        //         "bid":"0.023039",
        //         "bidSize":"0.53500578",
        //         "ask":"0.023041",
        //         "askSize":"0.47859202",
        //         "timestamp":1590381666900
        //     }
        //
        return this.parseTicker (response, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //         "market":"ETH-BTC",
        //         "open":"0.022578",
        //         "high":"0.023019",
        //         "low":"0.022573",
        //         "last":"0.023019",
        //         "volume":"25.16366324",
        //         "volumeQuote":"0.57333305",
        //         "bid":"0.023039",
        //         "bidSize":"0.53500578",
        //         "ask":"0.023041",
        //         "askSize":"0.47859202",
        //         "timestamp":1590381666900
        //     }
        //
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'market');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const [ baseId, quoteId ] = marketId.split ('-');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const last = this.safeFloat (ticker, 'last');
        const baseVolume = this.safeFloat (ticker, 'volume');
        const quoteVolume = this.safeFloat (ticker, 'volumeQuote');
        let vwap = undefined;
        if ((quoteVolume !== undefined) && (baseVolume !== undefined) && (baseVolume > 0)) {
            vwap = quoteVolume / baseVolume;
        }
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        const open = this.safeFloat (ticker, 'open');
        if ((open !== undefined) && (last !== undefined)) {
            change = last - open;
            if (open > 0) {
                percentage = change / open * 100;
            }
            average = this.sum (open, last) / 2;
        }
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': this.safeFloat (ticker, 'bidSize'),
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': this.safeFloat (ticker, 'askSize'),
            'vwap': vwap,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
        return result;
    }

    parseTickers (tickers, symbols = undefined) {
        const result = [];
        for (let i = 0; i < tickers.length; i++) {
            result.push (this.parseTicker (tickers[i]));
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker24h (params);
        //
        //     [
        //         {
        //             "market":"ADA-BTC",
        //             "open":"0.0000059595",
        //             "high":"0.0000059765",
        //             "low":"0.0000059595",
        //             "last":"0.0000059765",
        //             "volume":"2923.172",
        //             "volumeQuote":"0.01743483",
        //             "bid":"0.0000059515",
        //             "bidSize":"1117.630919",
        //             "ask":"0.0000059585",
        //             "askSize":"809.999739",
        //             "timestamp":1590382266324
        //         }
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            // 'limit': 500, // default 500, max 1000
            // 'start': since,
            // 'end': this.milliseconds (),
            // 'tradeIdFrom': '57b1159b-6bf5-4cde-9e2c-6bd6a5678baf',
            // 'tradeIdTo': '57b1159b-6bf5-4cde-9e2c-6bd6a5678baf',
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        const response = await this.publicGetMarketTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "id":"94154c98-6e8b-4e33-92a8-74e33fc05650",
        //             "timestamp":1590382761859,
        //             "amount":"0.06026079",
        //             "price":"8095.3",
        //             "side":"buy"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, httpHeaders = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = '/' + this.version + '/' + this.implodeParams (path, params);
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': httpHeaders };
    }
};
