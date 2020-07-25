'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
//  ---------------------------------------------------------------------------

module.exports = class multi extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'multi',
            'name': 'multi',
            'countries': [ 'SG' ],
            'version': 'v1',
            'has': {
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchOrderBook': true,
                'fetchOHLCV': true,
                'fetchTradingFees': true,
                'fetchTrades': true,
                'fetchTradingLimits': false,
                'fetchTicker': true,
            },
            'timeframes': {
                '1h': '1h',
                '4h': '4h',
                '8h': '8h',
                '1d': '1d',
                '1w': '1w',
            },
            'urls': {
                'logo': 'https://multi.io/en/static/img/icons/logo_white.svg',
                'api': 'https://api.multi.io/api',
                'www': 'https://multi.io/',
                'doc': 'https://docs.multi.io/',
            },
            'api': {
                'public': {
                    'get': [
                        'market/list',
                        'asset/list',
                        'order/depth',
                        'market/kline',
                        'fee_schedules',
                        'market/trade',
                        'market/status/all',
                    ],
                },
                'private': {
                    'get': [
                        '/asset/balance',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarketList (params);
        return this.parseMarkets (response);
    }

    parseMarkets (markets) {
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const base = this.safeCurrencyCode (market.base);
            const quote = this.safeCurrencyCode (market.pair);
            const symbol = quote + '/' + base;
            const precision = {
                'amount': this.safeInteger (market, 'pairPrec'),
                'price': this.safeInteger (market, 'basePrec'),
            };
            result.push ({
                'id': market['name'],
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': base.toLowerCase (),
                'quoteId': quote.toLowerCase (),
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minAmount'),
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
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetAssetList (params);
        return this.parseCurrencies (response);
    }

    parseCurrencies (currencies) {
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const currencyCode = this.safeString (currency, 'name');
            const id = currencyCode.toLowerCase ();
            const numericId = this.safeInteger (currency, 'id');
            const code = this.safeCurrencyCode (currencyCode);
            const name = this.safeString (currency, 'displayName');
            const active = this.safeValue (currency, 'status');
            const fee = this.safeFloat (currency, 'withdrawFee');
            const precision = this.safeFloat (currency, 'precShow');
            result[code] = {
                'id': id,
                'numericId': numericId,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (currency, 'minAmount'),
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
                        'min': this.safeFloat (currency, 'minWithdrawAmount'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, interval = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 20
        }
        if (interval !== undefined) {
            request['interval'] = interval; // default .01
        }
        const response = await this.publicGetOrderDepth (this.extend (request, params));
        return this.parseOrderBook (response, response['timestamp'] * 1000);
    }

    async fetchOHLCV (symbol, timeframe = '1h', since = 86400000, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const period = this.safeString (this.timeframes, timeframe);
        const intervalInSeconds = this.parseTimeframe (period);
        request['interval'] = intervalInSeconds;
        const now = this.seconds ();
        if (since !== undefined) {
            if (limit !== undefined) {
                const start = now - limit * intervalInSeconds;
                request['start'] = parseInt (start);
                request['end'] = parseInt (now);
            } else {
                const start = now - since / 1000;
                request['start'] = parseInt (start);
                request['end'] = parseInt (now);
            }
        } else {
            request['start'] = parseInt (since / 1000);
            request['end'] = parseInt (now);
        }
        const response = await this.publicGetMarketKline (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetFeeSchedules (params);
        const fees = [];
        for (let i = 0; i < response.length; i++) {
            const fee = response[i];
            fees.push ({
                'minVolume': fee['minVolume'],
                'maker': fee['makerFee'],
                'taker': fee['takerFee'],
            });
        }
        return {
            'info': response,
            'fees': fees,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketTrade (this.extend (request, params));
        return this.parseTrades (response['result'], market, since, limit);
    }

    parseTrade (trade, market) {
        const symbol = market['symbol'];
        const timestamp = this.safeTimestamp (trade, 'time');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        return {
            'info': trade,
            'id': trade['id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': trade['type'],
            'price': price,
            'amount': amount,
            'cost': parseFloat (price * amount),
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const response = await this.publicGetMarketStatusAll (params);
        const { result } = this.getMarketTicket (response, marketId);
        return this.parseTicker (result, symbol);
    }

    getMarketTicket (response, marketId) {
        const marketTicker = {};
        for (let i = 0; i < response.length; i++) {
            if (response[i]['market'] === marketId) {
                marketTicker['result'] = response[i];
                break;
            }
        }
        return marketTicker;
    }

    parseTicker (ticker, symbol) {
        return {
            'symbol': symbol,
            'info': ticker,
            'high': ticker['high'],
            'low': ticker['low'],
            'bid': ticker['bid'],
            'bidVolume': ticker['volume'],
            'ask': ticker['ask'],
            'open': ticker['open'],
            'close': ticker['close'],
            'last': ticker['last'],
            'baseVolume': ticker['baseVolume'],
            'quoteVolume': ticker['pairVolume'],
        };
    }

    _makeQueryString (q) {
        return q ? `?${Object.keys (q).sort ().map ((k) => `${encodeURIComponent (k)}=${encodeURIComponent (q[k])}`).join ('&')}` : '';
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        return response['data'];
    }
};
