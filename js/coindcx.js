'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class coindcx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coindcx',
            'name': 'CoinDCX',
            'countries': ['IN'], // india
            'urls': {
                'api': {
                    'general': 'https://api.coindcx.com',
                    'public': 'https://public.coindcx.com',
                    'private': 'https://api.coindcx.com',
                },
                'www': 'https://coindcx.com/',
                'doc': 'https://coindcx-official.github.io/rest-api/',
                'fees': 'https://coindcx.com/fees',
            },
            'version': 'v1',
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'token': false,
            },
            'api': {
                'general': {
                    'get': [
                        'exchange/ticker',
                        'exchange/v1/markets',
                        'exchange/v1/markets_details',
                    ],
                },
                'public': {
                    'get': [
                        'market_data/trade_history',
                        'market_data/orderbook',
                        'market_data/candles',
                    ],
                },
                'private': {
                    'post': [
                        'exchange/v1/users/balances',
                    ],
                },
            },
            'has': {
                'fetchTicker': 'emulated',
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchOrderBook': true,
                'fetchOHLCV': true,
                'fetchBalance': true,
                'cancelOrder': false,
                'createLimitOrder': false,
                'createMarketOrder': false,
                'createOrder': false,
                'editOrder': false,
                'fetchStatus': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'timeout': 10000,
            'rateLimit': 2000,
        });
    }

    async fetchMarkets (params = {}) {
        // answer example https://coindcx-official.github.io/rest-api/?javascript#markets-details
        const details = await this.generalGetExchangeV1MarketsDetails (params);
        const result = [];
        for (let i = 0; i < details.length; i++) {
            const market = details[i];
            const id = this.safeString (market, 'pair');
            const baseId = this.safeString (market, 'base_currency_short_name');
            const base = this.safeCurrencyCode (baseId);
            const quoteId = this.safeString (market, 'target_currency_short_name');
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            let active = false;
            if (market['status'] === 'active') {
                active = true;
            }
            const precision = {
                'price': this.safeFloat (market, 'base_currency_precision'),
                'amount': this.safeFloat (market, 'target_currency_precision'),
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'min_quantity'),
                    'max': this.safeFloat (market, 'max_quantity'),
                },
                'price': {
                    'min': this.safeFloat (market, 'min_price'),
                    'max': this.safeFloat (market, 'max_price'),
                },
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.generalGetExchangeTicker (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const response = await this.generalGetExchangeTicker (params);
        let result = {};
        const market = this.findMarket (symbol);
        const marketInfo = this.safeValue (market, 'info');
        const marketName = this.safeString (marketInfo, 'symbol');
        if (marketName === undefined) {
            return result;
        }
        for (let i = 0; i < response.length; i++) {
            if (response[i]['market'] !== marketName) {
                continue;
            }
            result = this.parseTicker (response[i]);
            break;
        }
        return result;
    }

    parseTicker (ticker) {
        const timestamp = this.safeTimestamp (ticker, 'timestamp');
        const symbol = this.findSymbol (this.safeString (ticker, 'market'));
        const last = this.safeFloat (ticker, 'lastPrice');
        return {
            'symbol': symbol,
            'info': ticker,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'last_price'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 50, params = {}) {
        // https://coindcx-official.github.io/rest-api/?shell#trades
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': this.safeString (market, 'id'),
            'limit': limit,
        };
        const response = await this.publicGetMarketDataTradeHistory (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 't');
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (trade, 's');
            market = this.safeValue (this.markets_by_id, marketId);
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let takerOrMaker = undefined;
        if ('m' in trade) {
            takerOrMaker = trade['m'] ? 'maker' : 'taker';
        }
        const price = this.safeFloat (trade, 'p');
        const amount = this.safeFloat (trade, 'q');
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': undefined,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'fee': undefined,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        // https://coindcx-official.github.io/rest-api/?shell#order-book
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': this.safeString (market, 'id'),
        };
        const response = await this.publicGetMarketDataOrderbook (this.extend (request, params));
        return this.parseOrderBookData (response);
    }

    parseOrderBookData (orderBook) {
        const bids = this.safeValue (orderBook, 'bids', {});
        const asks = this.safeValue (orderBook, 'asks', {});
        return {
            'bids': this.sortBy (this.parseBidAskData (bids), 0, true),
            'asks': this.sortBy (this.parseBidAskData (asks), 0),
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': undefined,
        };
    }

    parseBidAskData (bidsOrAsks) {
        const priceKeys = Object.keys (bidsOrAsks);
        const parsedData = [];
        for (let i = 0; i < priceKeys.length; i++) {
            const key = priceKeys[i];
            const price = parseFloat (key);
            const amount = parseFloat (bidsOrAsks[key]);
            parsedData.push ([price, amount]);
        }
        return parsedData;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        // https://coindcx-official.github.io/rest-api/?shell#candles
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 500; // coindcx default
        }
        if (limit > 1000) {
            limit = 1000; // coindcx limitation
        }
        const market = this.market (symbol);
        const request = {
            'pair': this.safeString (market, 'id'),
            'interval': this.timeframes[timeframe],
            'limit': limit,
        };
        const response = await this.publicGetMarketDataCandles (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchBalance (params = {}) {
        // https://coindcx-official.github.io/rest-api/?javascript#get-balances
        await this.loadMarkets ();
        const timeStamp = this.now ();
        const body = {
            'timestamp': timeStamp,
        };
        const response = await this.privatePostExchangeV1UsersBalances (this.extend (body, params));
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            if (!(code in result)) {
                const account = this.account ();
                const free = this.safeFloat (balance, 'balance');
                const used = this.safeFloat (balance, 'locked_balance');
                const total = parseFloat (free + used);
                account['free'] = free;
                account['used'] = used;
                account['total'] = total;
                result[code] = account;
            }
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        // console.log (path, api, method, params, headers, body);
        const base = this.urls['api'][api];
        const request = '/' + this.implodeParams (path, params);
        let url = base + request;
        const query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length) {
            const suffix = '?' + this.urlencode (query);
            url += suffix;
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            body = this.json (query);
            const signature = this.hmac (this.encode (body), this.encode (this.secret));
            headers = {
                'X-AUTH-APIKEY': this.apiKey,
                'X-AUTH-SIGNATURE': signature,
            };
        }
        // console.log (url, method, body, headers);
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
