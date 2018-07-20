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
            },
            'urls': {
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
        });
    }

    async fetchMarkets () {
        let markets = await this.privateGetSymbol ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['Symbol'];
            let base = market['MarginCurrency'];
            let quote = market['ProfitCurrency'];
            if (base === 'DSH')
                base = 'DASH';
            let symbol = base + '/' + quote;
            symbol = market['IsTradeAllowed'] ? symbol : id;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetAsset ();
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['Currency'];
            let uppercase = currency.toUpperCase ();
            // xbtce names DASH incorrectly as DSH
            if (uppercase === 'DSH')
                uppercase = 'DASH';
            let account = {
                'free': balance['FreeAmount'],
                'used': balance['LockedAmount'],
                'total': balance['Amount'],
            };
            result[uppercase] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderbook = await this.privateGetLevel2Filter (this.extend ({
            'filter': market['id'],
        }, params));
        orderbook = orderbook[0];
        let timestamp = orderbook['Timestamp'];
        return this.parseOrderBook (orderbook, timestamp, 'Bids', 'Asks', 'Price', 'Volume');
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = 0;
        let last = undefined;
        if ('LastBuyTimestamp' in ticker)
            if (timestamp < ticker['LastBuyTimestamp']) {
                timestamp = ticker['LastBuyTimestamp'];
                last = ticker['LastBuyPrice'];
            }
        if ('LastSellTimestamp' in ticker)
            if (timestamp < ticker['LastSellTimestamp']) {
                timestamp = ticker['LastSellTimestamp'];
                last = ticker['LastSellPrice'];
            }
        if (!timestamp)
            timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
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
        let tickers = await this.publicGetTicker (params);
        tickers = this.indexBy (tickers, 'Symbol');
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = undefined;
            let symbol = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                let base = id.slice (0, 3);
                let quote = id.slice (3, 6);
                if (base === 'DSH')
                    base = 'DASH';
                if (quote === 'DSH')
                    quote = 'DASH';
                symbol = base + '/' + quote;
            }
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let tickers = await this.publicGetTickerFilter (this.extend ({
            'filter': market['id'],
        }, params));
        let length = tickers.length;
        if (length < 1)
            throw new ExchangeError (this.id + ' fetchTicker returned empty response, xBTCe public API error');
        tickers = this.indexBy (tickers, 'Symbol');
        let ticker = tickers[market['id']];
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
        //     if (typeof since === 'undefined')
        //         since = this.seconds () - 86400 * 7; // last day by defulat
        //     if (typeof limit === 'undefined')
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
        if (type === 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        let response = await this.privatePostTrade (this.extend ({
            'pair': this.marketId (symbol),
            'type': side,
            'amount': amount,
            'rate': price,
        }, params));
        return {
            'info': response,
            'id': response['Id'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privateDeleteTrade (this.extend ({
            'Type': 'Cancel',
            'Id': id,
        }, params));
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (!this.apiKey)
            throw new AuthenticationError (this.id + ' requires apiKey for all requests, their public API is always busy');
        if (!this.uid)
            throw new AuthenticationError (this.id + ' requires uid property for authentication and trading, their public API is always busy');
        let url = this.urls['api'] + '/' + this.version;
        if (api === 'public')
            url += '/' + api;
        url += '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            headers = { 'Accept-Encoding': 'gzip, deflate' };
            let nonce = this.nonce ().toString ();
            if (method === 'POST') {
                if (Object.keys (query).length) {
                    headers['Content-Type'] = 'application/json';
                    body = this.json (query);
                } else {
                    url += '?' + this.urlencode (query);
                }
            }
            let auth = nonce + this.uid + this.apiKey + method + url;
            if (body)
                auth += body;
            let signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
            let credentials = this.uid + ':' + this.apiKey + ':' + nonce + ':' + this.binaryToString (signature);
            headers['Authorization'] = 'HMAC ' + credentials;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
