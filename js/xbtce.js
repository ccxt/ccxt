'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, NotSupported, AuthenticationError } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class xbtce extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'xbtce',
            'name': 'xBTCe',
            'countries': [ 'RU' ],
            'rateLimit': 2000, // responses are cached every 2 seconds
            'version': 'v1',
            'has': {
                'CORS': false,
                'fetchTickers': true,
                'createMarketOrder': false,
                'fetchOHLCV': false,
            },
            'urls': {
                'referral': 'https://xbtce.com/?agent=XX97BTCXXXG687021000B',
                'logo': 'https://user-images.githubusercontent.com/1294454/28059414-e235970c-662c-11e7-8c3a-08e31f78684b.jpg',
                'api': 'https://cryptottlivewebapi.xbtce.net:8443/api',
                'www': 'https://www.xbtce.com',
                'doc': [
                    'https://www.xbtce.com/tradeapi',
                    'https://support.xbtce.info/Knowledgebase/Article/View/52/25/xbtce-exchange-api',
                ],
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'api': {
                'public': {
                    'get': [
                        'currency',
                        'currency/{filter}',
                        'level2',
                        'level2/{filter}',
                        'quotehistory/{symbol}/{periodicity}/bars/ask',
                        'quotehistory/{symbol}/{periodicity}/bars/bid',
                        'quotehistory/{symbol}/level2',
                        'quotehistory/{symbol}/ticks',
                        'symbol',
                        'symbol/{filter}',
                        'tick',
                        'tick/{filter}',
                        'ticker',
                        'ticker/{filter}',
                        'tradesession',
                    ],
                },
                'private': {
                    'get': [
                        'tradeserverinfo',
                        'tradesession',
                        'currency',
                        'currency/{filter}',
                        'level2',
                        'level2/{filter}',
                        'symbol',
                        'symbol/{filter}',
                        'tick',
                        'tick/{filter}',
                        'account',
                        'asset',
                        'asset/{id}',
                        'position',
                        'position/{id}',
                        'trade',
                        'trade/{id}',
                        'quotehistory/{symbol}/{periodicity}/bars/ask',
                        'quotehistory/{symbol}/{periodicity}/bars/ask/info',
                        'quotehistory/{symbol}/{periodicity}/bars/bid',
                        'quotehistory/{symbol}/{periodicity}/bars/bid/info',
                        'quotehistory/{symbol}/level2',
                        'quotehistory/{symbol}/level2/info',
                        'quotehistory/{symbol}/periodicities',
                        'quotehistory/{symbol}/ticks',
                        'quotehistory/{symbol}/ticks/info',
                        'quotehistory/cache/{symbol}/{periodicity}/bars/ask',
                        'quotehistory/cache/{symbol}/{periodicity}/bars/bid',
                        'quotehistory/cache/{symbol}/level2',
                        'quotehistory/cache/{symbol}/ticks',
                        'quotehistory/symbols',
                        'quotehistory/version',
                    ],
                    'post': [
                        'trade',
                        'tradehistory',
                    ],
                    'put': [
                        'trade',
                    ],
                    'delete': [
                        'trade',
                    ],
                },
            },
            'commonCurrencies': {
                'DSH': 'DASH',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.privateGetSymbol (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'Symbol');
            const baseId = this.safeString (market, 'MarginCurrency');
            const quoteId = this.safeString (market, 'ProfitCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            symbol = market['IsTradeAllowed'] ? symbol : id;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balances = await this.privateGetAsset (params);
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'Currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = {
                'free': this.safeFloat (balance, 'FreeAmount'),
                'used': this.safeFloat (balance, 'LockedAmount'),
                'total': this.safeFloat (balance, 'Amount'),
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'filter': market['id'],
        };
        const response = await this.privateGetLevel2Filter (this.extend (request, params));
        const orderbook = response[0];
        const timestamp = this.safeInteger (orderbook, 'Timestamp');
        return this.parseOrderBook (orderbook, timestamp, 'Bids', 'Asks', 'Price', 'Volume');
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = 0;
        let last = undefined;
        if ('LastBuyTimestamp' in ticker) {
            if (timestamp < ticker['LastBuyTimestamp']) {
                timestamp = ticker['LastBuyTimestamp'];
                last = ticker['LastBuyPrice'];
            }
        }
        if ('LastSellTimestamp' in ticker) {
            if (timestamp < ticker['LastSellTimestamp']) {
                timestamp = ticker['LastSellTimestamp'];
                last = ticker['LastSellPrice'];
            }
        }
        if (!timestamp) {
            timestamp = this.milliseconds ();
        }
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': ticker['DailyBestBuyPrice'],
            'low': ticker['DailyBestSellPrice'],
            'bid': ticker['BestBid'],
            'bidVolume': undefined,
            'ask': ticker['BestAsk'],
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': ticker['DailyTradedTotalVolume'],
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker (params);
        const tickers = this.indexBy (response, 'Symbol');
        const ids = Object.keys (tickers);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let market = undefined;
            let symbol = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                const baseId = id.slice (0, 3);
                const quoteId = id.slice (3, 6);
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
            const ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'filter': market['id'],
        };
        const response = await this.publicGetTickerFilter (this.extend (request, params));
        const length = response.length;
        if (length < 1) {
            throw new ExchangeError (this.id + ' fetchTicker returned empty response, xBTCe public API error');
        }
        const tickers = this.indexBy (response, 'Symbol');
        const ticker = tickers[market['id']];
        return this.parseTicker (ticker, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // no method for trades?
        return await this.privateGetTrade (params);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv['Timestamp'],
            ohlcv['Open'],
            ohlcv['High'],
            ohlcv['Low'],
            ohlcv['Close'],
            ohlcv['Volume'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        //     let minutes = parseInt (timeframe / 60); // 1 minute by default
        //     let periodicity = minutes.toString ();
        //     await this.loadMarkets ();
        //     let market = this.market (symbol);
        //     if (since === undefined)
        //         since = this.seconds () - 86400 * 7; // last day by defulat
        //     if (limit === undefined)
        //         limit = 1000; // default
        //     let response = await this.privateGetQuotehistorySymbolPeriodicityBarsBid (this.extend ({
        //         'symbol': market['id'],
        //         'periodicity': periodicity,
        //         'timestamp': since,
        //         'count': limit,
        //     }, params));
        //     return this.parseOHLCVs (response['Bars'], market, timeframe, since, limit);
        throw new NotSupported (this.id + ' fetchOHLCV is disabled by the exchange');
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        const request = {
            'pair': this.marketId (symbol),
            'type': side,
            'amount': amount,
            'rate': price,
        };
        const response = await this.privatePostTrade (this.extend (request, params));
        return {
            'info': response,
            'id': response['Id'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'Type': 'Cancel',
            'Id': id,
        };
        return await this.privateDeleteTrade (this.extend (request, params));
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (!this.apiKey) {
            throw new AuthenticationError (this.id + ' requires apiKey for all requests, their public API is always busy');
        }
        if (!this.uid) {
            throw new AuthenticationError (this.id + ' requires uid property for authentication and trading, their public API is always busy');
        }
        let url = this.urls['api'] + '/' + this.version;
        if (api === 'public') {
            url += '/' + api;
        }
        url += '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            headers = { 'Accept-Encoding': 'gzip, deflate' };
            const nonce = this.nonce ().toString ();
            if (method === 'POST') {
                if (Object.keys (query).length) {
                    headers['Content-Type'] = 'application/json';
                    body = this.json (query);
                } else {
                    url += '?' + this.urlencode (query);
                }
            }
            let auth = nonce + this.uid + this.apiKey + method + url;
            if (body) {
                auth += body;
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
            const credentials = this.uid + ':' + this.apiKey + ':' + nonce + ':' + this.decode (signature);
            headers['Authorization'] = 'HMAC ' + credentials;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
