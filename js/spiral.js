'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, BadRequest, InvalidOrder, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class spiral extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'spiral',
            'name': 'Spiral',
            'countries': [ 'HK' ], // Hong Kong
            'version': 'v1',
            'rateLimit': 500,
            'has': {
                'CORS': false,
                'cancelOrders': true,
                'fetchOHLCV': true,
                'fetchMyTrades': true,
                'fetchOrder': false,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchCurrencies': true,
                'fetchTicker': false,
            },
            'timeframes': {
                '1m': 1,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '2h': 2 * 60,
                '4h': 4 * 60,
                '6h': 6 * 60,
                '12h': 12 * 60,
                '1d': 24 * 60,
                '1w': 7 * 24 * 60,
            },
            'urls': {
                'logo': 'https://www.spiral.exchange/static/media/logo-dark.ebcfc5ba.svg',
                'api': 'https://api.spiral.exchange',
                'www': 'https://www.spiral.exchange',
                'doc': 'https://docs.spiral.exchange',
                'fees': 'https://support.spiral.exchange/hc/en-us/articles/360006390493-Trading-Fee',
            },
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'products',
                        'klines',
                        'orderbook',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'wallet/balances',
                        'myTrades',
                        'order',
                    ],
                    'post': [
                        'order',
                    ],
                    'delete': [
                        'order',
                        'order/all',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.002,
                },
            },
            'options': {
                'apiExpire': 5, // api auth expires in 5 sec,
                'defaultCount': 10,
            },
        });
    }

    toMilliseconds (microSeconds) {
        return Math.floor (microSeconds / 1000);
    }

    covertSide (side) {
        if (side === 'bid') {
            return 'buy';
        } else if (side === 'ask') {
            return 'sell';
        }
        return undefined;
    }

    async fetchMarkets (params = {}) {
        let response = await this.publicGetProducts ();
        let markets = this.safeValue (response, 'data', []);
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['symbol'];
            let baseId = market['baseAsset'];
            let quoteId = market['quoteAsset'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let active = (market['status'] === 'TRADING');
            let precision = {
                'amount': this.precisionFromString (market['minTrade'] + ''),
                'price': this.precisionFromString (market['tickSize']),
            };
            let entry = {
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
                        'min': this.safeFloat (market, 'minTrade'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
            result.push (entry);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        let response = await this.publicGetCurrencies (params);
        let currencies = this.safeValue (response, 'data', []);
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['coin'];
            let code = this.commonCurrencyCode (id);
            let precision = currency['precision'];
            let canDeposit = currency['can_deposit'];
            let canWithdraw = currency['can_withdrawal'];
            let active = (canDeposit && canWithdraw);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': active,
                'fee': this.safeFloat (currency, 'withdrawal_fee'),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'withdraw_min_amount'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetWalletBalances (params);
        let result = { 'info': response };
        let balances = this.safeValue (response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let currency = balance['currency'];
            if (currency in this.currencies_by_id)
                currency = this.currencies_by_id[currency]['code'];
            let account = {
                'free': parseFloat (balance['available']),
                'used': parseFloat (balance['locked']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    parseOrderBook (orderbook, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1) {
        const orderbooks = orderbook['data'];
        const asks = [];
        let bids = [];
        if (orderbooks) {
            for (let i = 0; i < orderbooks.length; i++) {
                const price = parseFloat (orderbooks[i][0]);
                const amount = parseFloat (orderbooks[i][1]);
                const side = orderbooks[i][2];
                if (side === 'ask') {
                    asks.push ([price, amount]);
                } else {
                    bids.push ([price, amount]);
                }
            }
            bids = this.sortBy (bids, 0, true);
        }
        return {
            'bids': bids,
            'asks': asks,
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': undefined,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit !== undefined)
            request['limit'] = limit; // default = maximum = 100
        let response = await this.publicGetOrderbook (this.extend (request, params));
        let orderbook = this.parseOrderBook (response);
        orderbook['nonce'] = this.safeInteger (response, 'lastUpdateId');
        return orderbook;
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0],
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[5]),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = await this.publicGetKlines (this.extend (request, params));
        const ohlvs = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (ohlvs, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.toMilliseconds (this.safeInteger (trade, 'timestamp'));
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'quantity');
        let id = this.safeString (trade, 'id');
        let side = this.covertSide (this.safeString (trade, 'side'));
        let order = undefined;
        let fee = undefined;
        if ('fee' in trade) {
            fee = {
                'cost': this.safeFloat (trade, 'fee'),
            };
        }
        let takerOrMaker = undefined;
        let symbol = undefined;
        if (market === undefined) {
            let marketId = this.safeString (trade, 'symbol');
            market = this.safeValue (this.markets_by_id, marketId);
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': order,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined)
            request['count'] = limit;
        let response = await this.publicGetTrades (this.extend (request, params));
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOrderStatus (status) {
        let statuses = {
            'submitted': 'open',
            'accepted': 'open',
            'partial_filled': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
            'rejected': 'rejected',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    parseOrder (order, market = undefined) {
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = this.findSymbol (this.safeString (order, 'symbol'), market);
        let timestamp = this.toMilliseconds (order['create_time']);
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'quantity');
        let filled = this.safeFloat (order, 'filled_quantity');
        let remaining = undefined;
        let cost = undefined;
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
                remaining = Math.max (remaining, 0.0);
            }
            if (price !== undefined) {
                cost = price * filled;
            }
        }
        let id = this.safeString (order, 'id');
        let type = this.safeString (order, 'type');
        if (type !== undefined) {
            type = type.toLowerCase ();
            if (type === 'market') {
                if (price === 0.0) {
                    if ((cost !== undefined) && (filled !== undefined)) {
                        if ((cost > 0) && (filled > 0)) {
                            price = cost / filled;
                        }
                    }
                }
            }
        }
        let side = this.safeString (order, 'side');
        if (side !== undefined)
            side = this.covertSide (side.toLowerCase ());
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        type = type.toLowerCase ();
        let order = {
            'symbol': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
            'type': type,
            'side': side,
        };
        let priceIsRequired = false;
        if (type === 'limit') {
            priceIsRequired = true;
        }
        if (priceIsRequired) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder method requires a price argument for a ' + type + ' order');
            }
            order['price'] = this.priceToPrecision (symbol, price);
        }
        let response = await this.privatePostOrder (this.extend (order, params));
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        } else {
            request['count'] = this.options['defaultCount'];
        }
        request = this.deepExtend (request, params);
        if ('filter' in request)
            request['filter'] = this.json (request['filter']);
        let response = await this.privateGetOrder (request);
        const orders = this.safeValue (response, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let filter_params = { 'filter': { 'open': true }};
        return await this.fetchOrders (symbol, since, limit, this.deepExtend (filter_params, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let response = await this.privateDeleteOrder (this.extend ({
            'order_id': id,
        }, params));
        return response;
    }

    async cancelOrders (symbol = undefined, params = {}) {
        let request = {};
        if (symbol !== undefined) {
            await this.loadMarkets ();
            let market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if ('side' in params) {
            request['filter'] = {
                'side': params['side'],
            };
        }
        return await this.privateDeleteOrderAll (request);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        } else {
            request['count'] = this.options['defaultCount'];
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        let response = await this.privateGetMyTrades (this.extend (request, params));
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        path = '/api/' + this.version + '/' + path;
        if (method !== 'POST' && method !== 'PUT') {
            if (Object.keys (params).length) {
                path += '?' + this.urlencode (params);
            }
        }
        let url = this.urls['api'] + path;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let auth = method + path;
            let expire = this.seconds () + this.options['apiExpire'];
            auth += expire;
            if (method === 'POST' || method === 'PUT') {
                if (Object.keys (params).length) {
                    body = this.json (params);
                    auth += body;
                }
            }
            headers = {
                'api-key': this.apiKey,
                'api-expires': expire,
                'api-signature': this.hmac (this.encode (auth), this.encode (this.secret)),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response = undefined) {
        if (code === 429)
            throw new DDoSProtection (this.id + ' ' + body);
        if (code >= 400) {
            if (body) {
                const feedback = this.id + ' ' + body;
                if (code === 400) {
                    throw new BadRequest (feedback);
                }
                throw new ExchangeError (feedback);
            }
        }
    }
};
