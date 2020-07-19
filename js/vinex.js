'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');
const { TRUNCATE, DECIMAL_PLACES } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class vinex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'vinex',
            'name': 'Vinex Network',
            'countries': ['VG'],
            'version': 'v2',
            'rateLimit': 500,
            'has': {
                'CORS': false,
                'createMarketOrder': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
            },
            'hostname': 'vinex.network',
            'urls': {
                'logo': 'https://storage.googleapis.com/vinex-images/mail-icons/vinex-logo.png',
                'api': 'https://api.vinex.network/api/v2',
                'www': 'https://vinex.network/',
                'doc': 'https://docs.vinex.network/',
                'fees': 'https://vinex.network/fee',
                'referral': 'https://vinex.network/?ref=SJW2h3',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'markets/{marketId}',
                        'get-ticker',
                        'get-order-book',
                        'get-market-history',
                        'candles',
                    ],
                },
                'private': {
                    'get': [
                        'balances',
                        'get-my-orders',
                        'get-my-trading',
                    ],
                    'post': [
                        'place-order',
                        'cancel-order',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': 0.0025,
                    'taker': 0.0025,
                },
            },
            'options': {
                'symbolSeparator': '_',
            },
        });
    }

    costToPrecision (symbol, cost) {
        return this.decimalToPrecision (cost, TRUNCATE, this.markets[symbol]['precision']['price'], DECIMAL_PLACES);
    }

    feeToPrecision (symbol, fee) {
        return this.decimalToPrecision (fee, TRUNCATE, this.markets[symbol]['precision']['price'], DECIMAL_PLACES);
    }

    parseSymbol (id) {
        const [quoteId, baseId] = id.split (this.options['symbolSeparator']);
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        return base + '/' + quote;
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetMarkets (params);
        // [
        //     {
        //         "symbol": "BTC_ETH",
        //         "lastPrice": 0.025897,
        //         "volume": 4.64849624,
        //         "change24h": -0.01265775,
        //         "high24h": 0.026341,
        //         "low24h": 0.02577,
        //         "decPrice": 6,
        //         "decAmount": 4,
        //         "status": true
        //     },
        //     {
        //         "symbol": "ETH_MAS",
        //         "lastPrice": 0.00000888,
        //         "volume": 1.536,
        //         "change24h": 0,
        //         "high24h": 0,
        //         "low24h": 0,
        //         "decPrice": 8,
        //         "decAmount": 4,
        //         "threshold": 0.001,
        //         "status": true
        //     }
        // ]
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const [quoteId, baseId] = id.split (this.options['symbolSeparator']);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const amountPrecision = this.safeInteger (market, 'decAmount', 8);
            const pricePrecision = this.safeInteger (market, 'decPrice', 8);
            const precision = {
                'amount': amountPrecision,
                'price': pricePrecision,
            };
            const status = this.safeValue (market, 'status');
            const active = status;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'info': market,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['price']),
                        // 'min': this.safeFloat (market, 'threshold'),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        // {
        //     "timestamp": 1594810517000,
        //     "symbol": "USDT_BTC",
        //     "lastPrice": 9243.4,
        //     "highPrice": 9275.69,
        //     "lowPrice": 9144.28,
        //     "volume": 87188.02735616,
        //     "quoteVolume": 87188.02735616,
        //     "baseVolume": 9.451877,
        //     "change24h": 0.00831004,
        //     "threshold": 5,
        //     "bidPrice": 9206.36,
        //     "askPrice": 9271.2
        // }
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            const marketId = this.safeString (ticker, 'symbol');
            symbol = this.parseSymbol (marketId);
        }
        const previous = this.safeFloat (ticker, 'PrevDay');
        const last = this.safeFloat (ticker, 'lastPrice');
        const percentage = this.safeFloat (ticker, 'change24h');
        const change = last * (1 - 1 / (1 + percentage));
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highPrice'),
            'low': this.safeFloat (ticker, 'lowPrice'),
            'bid': this.safeFloat (ticker, 'bidPrice'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'askPrice'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': previous,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'baseVolume'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const ticker = await this.publicGetGetTicker (this.extend (request, params));
        // {
        //     "symbol": "USDT_BTC",
        //     "lastPrice": 9243.4,
        //     "highPrice": 9275.69,
        //     "lowPrice": 9144.28,
        //     "volume": 87188.02735616,
        //     "quoteVolume": 87188.02735616,
        //     "baseVolume": 9.451877,
        //     "change24h": 0.00831004,
        //     "threshold": 5,
        //     "bidPrice": 9206.36,
        //     "askPrice": 9271.2
        // }
        return this.parseTicker (ticker, market);
    }

    async fetchOrderBook (symbol, limit = 20, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
            'limit': limit,
        };
        const orderbook = await this.publicGetGetOrderBook (this.extend (request, params));
        const timestamp = this.milliseconds ();
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'quantity');
    }

    parseTrade (trade, market = undefined) {
        const timestamp = trade['createdAt'] * 1000;
        const id = this.safeString (trade, 'id');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        let side = undefined;
        if (trade['actionType'] === 1) {
            side = 'buy';
        } else if (trade['actionType'] === 0) {
            side = 'sell';
        }
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': 'limit',
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 20, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'limit': limit,
        };
        const trades = await this.publicGetGetMarketHistory (this.extend (request, params));
        return this.parseTrades (trades, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        // {
        //     "timestamp": 1557792000,
        //     "open": 169.58,
        //     "close": 169.58,
        //     "hight": 169.58,
        //     "low": 169.58,
        //     "volume": 5.0874
        // }
        return [
            this.safeInteger (ohlcv, 'timestamp') * 1000,
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (since) {
            request['startTime'] = Math.floor (since / 1000);
        }
        const candles = await this.publicGetCandles (this.extend (request, params));
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balances = await this.privateGetBalances (params);
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode (balance['asset']);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'free');
            account['used'] = this.safeFloat (balance, 'locked');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        // {
        //     "id": 5000001,
        //     "uid": "sdnrauah626opk7zu7w7c",
        //     "pairSymbol": "ETH_MAS",
        //     "price": 0.00001679,
        //     "amount": 595.5926,
        //     "remain": 0,
        //     "orderType": "LIMIT",
        //     "actionType": 1,
        //     "status": 1,
        //     "createdAt": 1584687831
        // }
        market = this.marketsById[order['market']];
        const symbol = market['symbol'];
        let side = undefined;
        if (order['actionType'] === 1) {
            side = 'buy';
        } else if (order['actionType'] === 0) {
            side = 'sell';
        }
        let status = undefined;
        if (order['status'] === 10 || order['status'] === 0) {
            status = 'open';
        } else if (order['status'] === 1) {
            status = 'closed';
        } else if (order['status'] === 2) {
            status = 'canceled';
        }
        const timestamp = this.safeInteger (order, 'createdAt') * 1000;
        const type = this.safeStringLower (order, 'orderType');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        const remaining = this.safeFloat (order, 'remain');
        const filled = amount - remaining;
        const cost = price * filled;
        return {
            'id': this.safeString (order, 'uid'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'info': order,
            'trades': undefined,
        };
    }

    async _fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}, status = undefined) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since) {
            request['start'] = Math.floor (since / 1000);
        }
        if (limit) {
            request['limit'] = limit;
        }
        if (status) {
            request['status'] = status;
        }
        const orders = this.privateGetGetMyOrders (this.extend (request, params));
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this._fetchOrders (symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this._fetchOrders (symbol, since, limit, params, 'OPENED');
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this._fetchOrders (symbol, since, limit, params, 'FINISHED');
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
        };
        if (type !== undefined) {
            request['order_type'] = type.toUpperCase ();
        }
        if (side === 'buy') {
            request['type'] = 'BUY';
        } else if (side === 'sell') {
            request['type'] = 'SELL';
        }
        const data = await this.privatePostPlaceOrder (this.extend (request, params));
        return this.parseOrder (data);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'uid': id,
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbol) {
            const market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since) {
            request['startTime'] = Math.floor (since / 1000);
        }
        if (limit) {
            request['limit'] = limit;
        }
        const trades = await this.privateGetGetMyTrading (this.extend (request, params));
        return this.parseTrades (trades);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeParams (this.urls['api'], {
            'hostname': this.hostname,
        }) + '/' + path;
        if (api === 'public') {
            if (params) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const headers = {};
            headers['api-key'] = this.apiKey;
            if (!('time_stamp' in params)) {
                params['time_stamp'] = this.seconds ();
            }
            // query['recv_window'] = 60
            if (method === 'GET') {
                if (params) {
                    url += '?' + this.urlencode (params);
                }
            } else if (params) {
                body = this.urlencode (params);
                const keys = Object.keys (params);
                keys.sort ();
                const keysLength = keys.length;
                let plainText = '';
                for (let i = 0; i < keysLength - 1; i++) {
                    plainText += this.safeString (params, keys[i]) + '_';
                }
                plainText += params[keys[keysLength - 1]];
                headers['signature'] = this.hmac (this.encode (plainText), this.encode (this.secret), 'sha256');
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if (response) {
            if ('data' in response) {
                return response['data'];
            } else {
                const errorMsg = response['message'];
                throw new ExchangeError (errorMsg);
            }
        }
        return response;
    }
};
