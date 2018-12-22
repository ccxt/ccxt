'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, AuthenticationError, InvalidNonce, InsufficientFunds, InvalidOrder, OrderNotFound, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinegg extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinegg',
            'name': 'CoinEgg',
            'countries': [ 'CN', 'UK' ],
            'has': {
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': 'emulated',
                'fetchMyTrades': true,
                'fetchTickers': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/36770310-adfa764e-1c5a-11e8-8e09-449daac3d2fb.jpg',
                'api': {
                    'web': 'https://www.coinegg.com/coin',
                    'rest': 'https://api.coinegg.com/api/v1',
                },
                'www': 'https://www.coinegg.com',
                'doc': 'https://www.coinegg.com/explain.api.html',
                'fees': 'https://www.coinegg.com/fee.html',
            },
            'api': {
                'web': {
                    'get': [
                        '{quote}/allcoin',
                        '{quote}/trends',
                        '{quote}/{base}/order',
                        '{quote}/{base}/trades',
                        '{quote}/{base}/depth.js',
                    ],
                },
                'public': {
                    'get': [
                        'ticker/region/{quote}',
                        'depth/region/{quote}',
                        'orders/region/{quote}',
                    ],
                },
                'private': {
                    'post': [
                        'balance',
                        'trade_add/region/{quote}',
                        'trade_cancel/region/{quote}',
                        'trade_view/region/{quote}',
                        'trade_list/region/{quote}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.1 / 100,
                    'taker': 0.1 / 100,
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.008,
                        'BCH': 0.002,
                        'LTC': 0.001,
                        'ETH': 0.01,
                        'ETC': 0.01,
                        'NEO': 0,
                        'QTUM': '1%',
                        'XRP': '1%',
                        'DOGE': '1%',
                        'LSK': '1%',
                        'XAS': '1%',
                        'BTS': '1%',
                        'GAME': '1%',
                        'GOOC': '1%',
                        'NXT': '1%',
                        'IFC': '1%',
                        'DNC': '1%',
                        'BLK': '1%',
                        'VRC': '1%',
                        'XPM': '1%',
                        'VTC': '1%',
                        'TFC': '1%',
                        'PLC': '1%',
                        'EAC': '1%',
                        'PPC': '1%',
                        'FZ': '1%',
                        'ZET': '1%',
                        'RSS': '1%',
                        'PGC': '1%',
                        'SKT': '1%',
                        'JBC': '1%',
                        'RIO': '1%',
                        'LKC': '1%',
                        'ZCC': '1%',
                        'MCC': '1%',
                        'QEC': '1%',
                        'MET': '1%',
                        'YTC': '1%',
                        'HLB': '1%',
                        'MRYC': '1%',
                        'MTC': '1%',
                        'KTC': 0,
                    },
                },
            },
            'exceptions': {
                '103': AuthenticationError,
                '104': AuthenticationError,
                '105': AuthenticationError,
                '106': InvalidNonce,
                '200': InsufficientFunds,
                '201': InvalidOrder,
                '202': InvalidOrder,
                '203': OrderNotFound,
                '402': DDoSProtection,
            },
            'errorMessages': {
                '100': 'Required parameters can not be empty',
                '101': 'Illegal parameter',
                '102': 'coin does not exist',
                '103': 'Key does not exist',
                '104': 'Signature does not match',
                '105': 'Insufficient permissions',
                '106': 'Request expired(nonce error)',
                '200': 'Lack of balance',
                '201': 'Too small for the number of trading',
                '202': 'Price must be in 0 - 1000000',
                '203': 'Order does not exist',
                '204': 'Pending order amount must be above 0.001 BTC',
                '205': 'Restrict pending order prices',
                '206': 'Decimal place error',
                '401': 'System error',
                '402': 'Requests are too frequent',
                '403': 'Non-open API',
                '404': 'IP restriction does not request the resource',
                '405': 'Currency transactions are temporarily closed',
            },
            'options': {
                'quoteIds': [ 'btc', 'eth', 'usc', 'usdt' ],
            },
            'commonCurrencies': {
                'JBC': 'JubaoCoin',
            },
        });
    }

    async fetchMarkets (params = {}) {
        let quoteIds = this.options['quoteIds'];
        let result = [];
        for (let b = 0; b < quoteIds.length; b++) {
            let quoteId = quoteIds[b];
            let bases = await this.webGetQuoteAllcoin ({
                'quote': quoteId,
            });
            if (bases === undefined)
                throw new ExchangeNotAvailable (this.id + ' fetchMarkets() for "' + quoteId + '" returned: "' + this.json (bases) + '"');
            let baseIds = Object.keys (bases);
            let numBaseIds = baseIds.length;
            if (numBaseIds < 1)
                throw new ExchangeNotAvailable (this.id + ' fetchMarkets() for "' + quoteId + '" returned: "' + this.json (bases) + '"');
            for (let i = 0; i < baseIds.length; i++) {
                let baseId = baseIds[i];
                let market = bases[baseId];
                let base = baseId.toUpperCase ();
                let quote = quoteId.toUpperCase ();
                base = this.commonCurrencyCode (base);
                quote = this.commonCurrencyCode (quote);
                let id = baseId + quoteId;
                let symbol = base + '/' + quote;
                let precision = {
                    'amount': 8,
                    'price': 8,
                };
                result.push ({
                    'id': id,
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
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let symbol = market['symbol'];
        let timestamp = this.milliseconds ();
        let last = this.safeFloat (ticker, 'last');
        let percentage = this.safeFloat (ticker, 'change');
        let open = undefined;
        let change = undefined;
        let average = undefined;
        if (percentage !== undefined) {
            let relativeChange = percentage / 100;
            open = last / this.sum (1, relativeChange);
            change = last - open;
            average = this.sum (last, open) / 2;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVol'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetTickerRegionQuote (this.extend ({
            'coin': market['baseId'],
            'quote': market['quoteId'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let quoteIds = this.options['quoteIds'];
        let result = {};
        for (let b = 0; b < quoteIds.length; b++) {
            let quoteId = quoteIds[b];
            let tickers = await this.webGetQuoteAllcoin ({
                'quote': quoteId,
            });
            let baseIds = Object.keys (tickers);
            if (!baseIds.length) {
                throw new ExchangeError ('fetchTickers failed');
            }
            for (let i = 0; i < baseIds.length; i++) {
                let baseId = baseIds[i];
                let ticker = tickers[baseId];
                let id = baseId + quoteId;
                if (id in this.markets_by_id) {
                    let market = this.marketsById[id];
                    let symbol = market['symbol'];
                    result[symbol] = this.parseTicker ({
                        'high': ticker[4],
                        'low': ticker[5],
                        'buy': ticker[2],
                        'sell': ticker[3],
                        'last': ticker[1],
                        'change': ticker[8],
                        'vol': ticker[6],
                        'quoteVol': ticker[7],
                    }, market);
                }
            }
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderbook = await this.publicGetDepthRegionQuote (this.extend ({
            'coin': market['baseId'],
            'quote': market['quoteId'],
        }, params));
        return this.parseOrderBook (orderbook);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = parseInt (trade['date']) * 1000;
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        let symbol = market['symbol'];
        let cost = this.costToPrecision (symbol, price * amount);
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'tid'),
            'order': undefined,
            'type': 'limit',
            'side': trade['type'],
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let trades = await this.publicGetOrdersRegionQuote (this.extend ({
            'coin': market['baseId'],
            'quote': market['quoteId'],
        }, params));
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostBalance (params);
        let result = {};
        let balances = this.omit (response['data'], 'uid');
        let keys = Object.keys (balances);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let [ currencyId, accountType ] = key.split ('_');
            let code = currencyId;
            if (currencyId in this.currencies_by_id) {
                code = this.currencies_by_id[currencyId]['code'];
            }
            if (!(code in result)) {
                result[code] = {
                    'free': undefined,
                    'used': undefined,
                    'total': undefined,
                };
            }
            accountType = (accountType === 'lock') ? 'used' : 'free';
            result[code][accountType] = parseFloat (balances[key]);
        }
        let currencies = Object.keys (result);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            result[currency]['total'] = this.sum (result[currency]['free'], result[currency]['used']);
        }
        return this.parseBalance (this.extend ({ 'info': response }, result));
    }

    parseOrder (order, market = undefined) {
        let symbol = market['symbol'];
        let timestamp = this.parse8601 (order['datetime']);
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'amount_original');
        let remaining = this.safeFloat (order, 'amount_outstanding');
        let filled = amount - remaining;
        let status = this.safeString (order, 'status');
        if (status === 'cancelled') {
            status = 'canceled';
        } else {
            status = remaining ? 'open' : 'closed';
        }
        let info = this.safeValue (order, 'info', order);
        return {
            'id': this.safeString (order, 'id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'side': order['type'],
            'price': price,
            'cost': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': undefined,
            'info': info,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostTradeAddRegionQuote (this.extend ({
            'coin': market['baseId'],
            'quote': market['quoteId'],
            'type': side,
            'amount': amount,
            'price': price,
        }, params));
        let id = response['id'].toString ();
        let order = this.parseOrder ({
            'id': id,
            'datetime': this.ymdhms (this.milliseconds ()),
            'amount_original': amount,
            'amount_outstanding': amount,
            'price': price,
            'type': side,
            'info': response,
        }, market);
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostTradeCancelRegionQuote (this.extend ({
            'id': id,
            'coin': market['baseId'],
            'quote': market['quoteId'],
        }, params));
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostTradeViewRegionQuote (this.extend ({
            'id': id,
            'coin': market['baseId'],
            'quote': market['quoteId'],
        }, params));
        return this.parseOrder (response['data'], market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'coin': market['baseId'],
            'quote': market['quoteId'],
        };
        if (since !== undefined)
            request['since'] = since / 1000;
        let orders = await this.privatePostTradeListRegionQuote (this.extend (request, params));
        return this.parseOrders (orders['data'], market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let result = await this.fetchOrders (symbol, since, limit, this.extend ({
            'type': 'open',
        }, params));
        return result;
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
            query += '&' + 'signature=' + signature;
            if (method === 'GET') {
                url += '?' + query;
            } else {
                headers = {
                    'Content-type': 'application/x-www-form-urlencoded',
                };
                body = query;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        // checks against error codes
        if (typeof body !== 'string')
            return;
        if (body.length === 0)
            return;
        if (body[0] !== '{')
            return;
        // private endpoints return the following structure:
        // {"result":true,"data":{...}} - success
        // {"result":false,"code":"103"} - failure
        // {"code":0,"msg":"Suceess","data":{"uid":"2716039","btc_balance":"0.00000000","btc_lock":"0.00000000","xrp_balance":"0.00000000","xrp_lock":"0.00000000"}}
        let result = this.safeValue (response, 'result');
        if (result === undefined)
            // public endpoint ← this comment left here by the contributor, in fact a missing result does not necessarily mean a public endpoint...
            // we should just check the code and don't rely on the result at all here...
            return;
        if (result === true)
            // success
            return;
        const errorCode = this.safeString (response, 'code');
        const errorMessages = this.errorMessages;
        const message = this.safeString (errorMessages, errorCode, 'Unknown Error');
        if (errorCode in this.exceptions) {
            throw new this.exceptions[errorCode] (this.id + ' ' + message);
        } else {
            throw new ExchangeError (this.id + ' ' + message);
        }
    }
};
