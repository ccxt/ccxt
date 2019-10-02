'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class whitebit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'whitebit',
            'name': 'WhiteBit',
            'version': '1',
            'countries': [ 'EE' ],
            'rateLimit': 500,
            'has': {
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'CORS': false,
                'createDepositAddress': false,
                'createLimitOrder': false,
                'createMarketOrder': false,
                'createOrder': false,
                'deposit': false,
                'editOrder': false,
                'fetchBalance': false,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchL2OrderBook': false,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'privateAPI': false,
                'publicAPI': true,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://images-wb-cf.s3.amazonaws.com/logos/wb_logo_85x25_dark.jpg',
                'api': {
                    'web': 'https://whitebit.com/',
                    'publicV2': 'https://whitebit.com/api/v2/public',
                    'publicV1': 'https://whitebit.com/api/v1/public',
                },
                'www': 'https://www.whitebit.com',
                'doc': 'https://documenter.getpostman.com/view/7473075/SVSPomwS?version=latest#intro',
                'fees': 'https://whitebit.com/fee-schedule',
            },
            'api': {
                'web': {
                    'get': [
                        'v1/healthcheck',
                    ],
                },
                'publicV1': {
                    'get': [
                        'markets',
                        'tickers',
                        'ticker',
                        'symbols',
                        'depth/result',
                        'history',
                        'kline',
                    ],
                },
                'publicV2': {
                    'get': [
                        'markets',
                        'ticker',
                        'assets',
                        'fee',
                        'depth/{pair}',
                        'trades/{pair}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
                },
            },
            'commonCurrencies': {},
            // exchange-specific options
            'options': {},
            'exceptions': {},
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicV2GetMarkets (params);
        const markets = this.safeValue (response, 'result');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const baseId = market['stock'];
            const quoteId = market['money'];
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': market['tradesEnabled'],
                'precision': {
                    'base': this.safeInteger (market, 'stockPrec'),
                    'quote': this.safeInteger (market, 'moneyPrec'),
                    'amount': this.safeInteger (market, 'stockPrec'),
                    'price': this.safeInteger (market, 'moneyPrec'),
                },
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
                        'min': this.safeFloat (market, 'minTotal'),
                        'max': undefined,
                    },
                },
            };
            result.push (entry);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicV2GetAssets (params);
        const data = this.safeValue (response, 'result');
        const ids = Object.keys (data);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = data[id];
            const name = this.safeString (currency, 'name');
            const code = this.safeCurrencyCode (id);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency, // the original payload
                'name': name,
                'active': true,
                'fee': undefined,
                'precision': undefined,
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
                        'min': this.safeFloat (currency, 'minWithdrawal'),
                        'max': this.safeFloat (currency, 'maxWithdrawal'),
                    },
                },
            };
        }
        return result;
    }

    async fetchTradingFees (params = {}) {
        const response = await this.publicV2GetFee (params);
        const fees = this.safeValue (response, 'result');
        return {
            'maker': this.safeFloat (fees, 'makerFee'),
            'taker': this.safeFloat (fees, 'takerFee'),
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicV1GetTicker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTicker (ticker, market = undefined) {
        const symbol = this.findSymbol (this.safeString (ticker, 'market'), market);
        const last = this.safeFloat (ticker, 'last');
        const time = this.milliseconds ();
        const change = this.safeFloat (ticker, 'change') || 0;
        return {
            'symbol': symbol,
            'timestamp': time,
            'datetime': this.iso8601 (time),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change * 0.01,
            'percentage': change,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'deal'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicV1GetTickers (params);
        const data = this.safeValue (response, 'result');
        const ids = Object.keys (data);
        const result = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const tickerData = data[id];
            result.push (this.extend (tickerData, { 'market': id }));
        }
        return this.parseTickers (result, symbols);
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 50, maximum = 100
        }
        const response = await this.publicV2GetDepthPair (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        const timestamp = this.parseDate (this.safeString (result, 'lastUpdateTimestamp'));
        const orderbook = this.parseOrderBook (result, timestamp);
        orderbook['nonce'] = this.safeInteger (result, timestamp);
        return orderbook;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'lastId': 1, // todo add since
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 50, maximum = 10000
        }
        const response = await this.publicV1GetHistory (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        return this.parseTrades (result, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger (trade, 'time') * 1000;
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        const id = this.safeString (trade, 'id');
        const side = this.safeString (trade, 'type');
        const symbol = market['symbol'];
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': amount * price,
            'fee': undefined,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1H', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default == max == 500
        }
        const response = await this.publicV1GetKline (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000,
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[5]),
        ];
    }

    async fetchStatus (params = {}) {
        const response = await this.webGetV1Healthcheck ();
        const status = this.safeInteger (response, 'status');
        this.status = this.extend (this.status, {
            'status': status !== 503 ? 'ok' : 'maintenance',
            'updated': this.milliseconds (),
        });
        return this.status;
    }

    sign (path, api = 'publicV1', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        if (Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if ((code === 418) || (code === 429)) {
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        if (body.length > 0) {
            if (body[0] === '{') {
                const success = this.safeValue (response, 'success');
                if (!success) {
                    const message = response['message'];
                    if (message) {
                        throw new ExchangeError (message);
                    } else {
                        const feedback = this.id + ' ' + this.json (response);
                        throw new ExchangeError (feedback);
                    }
                }
            }
        }
    }
};
