'use strict';

//  ---------------------------------------------------------------------------
const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class excraft extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'excraft',
            'name': 'ExCraft',
            'countries': ['HK', 'UK'],
            'has': {
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
            },
            'urls': {
                'logo': 'https://www.excraft.com/static/images/excraft_2480.png',
                'api': {
                    'rest': 'https://www.excraft.com/apis/trading/v1',
                },
                'www': 'https://www.excraft.com',
                'doc': 'https://github.com/ExCraftExchange/ExCraftExchange-REST-API',
                'fees': 'https://www.excraft.com/faq/fee',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'markets/{market}/status_today',
                        'markets/status_today',
                        'markets/{market}/trades',
                        'markets/{market}/depth',
                    ],
                },
                'private': {
                    'post': [
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.0005,
                        'ETH': 0.01,
                        'BCH': 0.0001,
                        'LTC': 0.001,
                        'HSR': 0.001,
                        'EOS': 0.1,
                        'EXT': 500,
                        'OMG': 1,
                        'ZRX': 10,
                        'BAT': 20,
                        'KNC': 10,
                        'BNT': 2,
                        'MANA': 50,
                        'CTXC': 20,
                        'REP': 0.2,
                        'GNT': 20,
                        'LRC': 50,
                        'ENG': 5,
                        'NPXS': 2000,
                        'PAY': 5,
                    },
                },
            },
            'exceptions': {
            },
            'errorMessages': {
            },
            'options': {
                'quoteIds': ['btc', 'eth'],
            },
        });
    }

    async fetchMarkets () {
        let data = await this.publicGetMarkets ();
        let result = [];
        for (let i = 0; i < data['markets'].length; i++) {
            let item = data['markets'][i];
            let baseId = item['base'];
            let quoteId = item['quote'];
            let market = item['name'];
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            let symbol = base + quote;
            let precision = {
                'amount': 8,
                'price': 8,
            };
            result.push ({
                'id': baseId + quoteId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': Math.pow (10, precision['amount']),
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': Math.pow (10, precision['price']),
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

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let timestamp = this.milliseconds () / 1000;
        let close = this.safeFloat (ticker, 'last');
        let open = this.safeFloat (ticker, 'open');
        let percentage = 0;
        let average = 0;
        let change = 0;
        if (open !== undefined && close !== undefined) {
            let change = close - open;
            average = (open + close) / 2;
            if (close !== undefined && close > 0) {
                percentage = (change / open) * 100;
            }
        }
        let baseVolume = this.safeFloat (ticker, 'volume');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'last'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'last'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': this.safeFloat (ticker, 'last'),
            'last': this.safeFloat (ticker, 'last'),
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = []) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'],
        };
        let response = await this.publicGetMarketsMarketStatusToday (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = []) {
        await this.loadMarkets ();
        let response = await this.publicGetMarketsStatusToday ();
        let result = {};
        let tickers = response['markets'];
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let market = undefined;
            let marketId = this.safeString (ticker, 'name');
            if (marketId in this.markets_by_id) {
                market = this.safeValue (this.markets_by_id, marketId);
            }
            let ticker = this.parseTicker (ticker, market);
            let symbol = ticker['symbol'];
            if (symbol !== undefined) {
                result[symbol] = ticker;
            }
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = []) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'],
        };
        let orderbook = await this.publicGetMarketsMarketDepth (this.extend (request, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'amount');
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.milliseconds ();
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = amount * price;
            }
        }
        let side = trade['side'] === 1) ? 'sell' : 'buy';
        let id = this.safeString (trade, 'id');
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = []) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'],
        };
        let response = await this.publicGetMarketsMarketTrades (this.extend (request, params));
        let trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let apiType = 'rest';
        if (api === 'web') {
            apiType = api;
        }
        let url = this.urls['api'][apiType] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public' || api === 'web') {
            if (api === 'web')
                query['t'] = this.nonce ();
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            query = this.urlencode (this.extend ({
                'key': this.apiKey,
                'nonce': this.nonce (),
            }, query));
            let secret = this.hash (this.encode (this.secret));
            let signature = this.hmac (this.encode (query), this.encode (secret));
            if (method === 'GET') {
                url += '?' + query;
            } else {
                headers = {
                    'Content-type': 'application/x-www-form-urlencoded',
                    'app_key': this.apiKey,
                    'sign': signature,
                };
                body = query;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
