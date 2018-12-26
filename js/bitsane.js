'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, InvalidNonce } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitsane extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitsane',
            'name': 'Bitsane',
            'countries': [ 'IE' ], // Ireland
            'has': {
                'fetchCurrencies': true,
                'fetchTickers': true,
                'fetchOpenOrders': true,
                'fetchDepositAddress': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/41387105-d86bf4c6-6f8d-11e8-95ea-2fa943872955.jpg',
                'api': 'https://bitsane.com/api',
                'www': 'https://bitsane.com',
                'doc': 'https://bitsane.com/info-api',
                'fees': 'https://bitsane.com/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'assets/currencies',
                        'assets/pairs',
                        'ticker',
                        'orderbook',
                        'trades',
                    ],
                },
                'private': {
                    'post': [
                        'balances',
                        'order/cancel',
                        'order/new',
                        'order/status',
                        'orders',
                        'orders/history',
                        'deposit/address',
                        'withdraw',
                        'withdrawal/status',
                        'transactions/history',
                        'vouchers',
                        'vouchers/create',
                        'vouchers/redeem',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.15 / 100,
                    'taker': 0.25 / 100,
                },
            },
            'exceptions': {
                '3': AuthenticationError,
                '4': AuthenticationError,
                '5': AuthenticationError,
                '6': InvalidNonce,
                '7': AuthenticationError,
                '8': InvalidNonce,
                '9': AuthenticationError,
                '10': AuthenticationError,
                '11': AuthenticationError,
            },
            'options': {
                'defaultCurrencyPrecision': 2,
            },
        });
    }

    async fetchCurrencies (params = {}) {
        let currencies = await this.publicGetAssetsCurrencies (params);
        let ids = Object.keys (currencies);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let currency = currencies[id];
            let precision = this.safeInteger (currency, 'precision', this.options['defaultCurrencyPrecision']);
            let code = this.commonCurrencyCode (id);
            let canWithdraw = this.safeValue (currency, 'withdrawal', true);
            let canDeposit = this.safeValue (currency, 'deposit', true);
            let active = true;
            if (!canWithdraw || !canDeposit)
                active = false;
            result[code] = {
                'id': id,
                'code': code,
                'name': this.safeString (currency, 'full_name', code),
                'active': active,
                'precision': precision,
                'funding': {
                    'withdraw': {
                        'active': canWithdraw,
                        'fee': this.safeValue (currency, 'withdrawal_fee'),
                    },
                    'deposit': {
                        'active': canDeposit,
                        'fee': this.safeValue (currency, 'deposit_fee'),
                    },
                },
                'limits': {
                    'amount': {
                        'min': this.safeFloat (currency, 'minAmountTrade'),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetAssetsPairs ();
        let result = [];
        let marketIds = Object.keys (markets);
        for (let i = 0; i < marketIds.length; i++) {
            let id = marketIds[i];
            let market = markets[id];
            let base = this.commonCurrencyCode (market['base']);
            let quote = this.commonCurrencyCode (market['quote']);
            let symbol = base + '/' + quote;
            let limits = this.safeValue (market, 'limits');
            let minLimit = undefined;
            let maxLimit = undefined;
            if (limits !== undefined) {
                minLimit = this.safeFloat (limits, 'minimum');
                maxLimit = this.safeFloat (limits, 'maximum');
            }
            let precision = {
                'amount': parseInt (market['precision']),
                'price': 8,
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': market['base'],
                'quoteId': market['quote'],
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minLimit,
                        'max': maxLimit,
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
                'info': id,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let symbol = market['symbol'];
        let timestamp = this.milliseconds ();
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24hr'),
            'low': this.safeFloat (ticker, 'low24hr'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'percentChange'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'baseVolume'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        let tickers = await this.fetchTickers ([symbol], params);
        return tickers[symbol];
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        if (symbols) {
            let ids = this.marketIds (symbols);
            request['pairs'] = ids.join (',');
        }
        let tickers = await this.publicGetTicker (this.extend (request, params));
        let marketIds = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < marketIds.length; i++) {
            let id = marketIds[i];
            let market = this.safeValue (this.marketsById, id);
            if (market === undefined) {
                continue;
            }
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetOrderbook (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (response['result'], undefined, 'bids', 'asks', 'price', 'amount');
    }

    parseTrade (trade, market = undefined) {
        let symbol = market['symbol'];
        let timestamp = parseInt (trade['timestamp']) * 1000;
        let price = parseFloat (trade['price']);
        let amount = parseFloat (trade['amount']);
        let cost = this.costToPrecision (symbol, price * amount);
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'tid'),
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'price': price,
            'amount': amount,
            'cost': parseFloat (cost),
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
        };
        if (since !== undefined)
            request['since'] = parseInt (since / 1000);
        if (limit !== undefined)
            request['limit'] = limit;
        let response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response['result'], market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostBalances (params);
        let result = { 'info': response };
        let balances = response['result'];
        let ids = Object.keys (balances);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let balance = balances[id];
            let code = id;
            if (id in this.currencies_by_id) {
                code = this.currencies_by_id[id]['code'];
            } else {
                code = this.commonCurrencyCode (code);
            }
            let account = {
                'free': parseFloat (balance['amount']),
                'used': parseFloat (balance['locked']),
                'total': parseFloat (balance['total']),
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (!market)
            market = this.safeValue (this.marketsById, order['pair']);
        if (market)
            symbol = market['symbol'];
        let timestamp = this.safeInteger (order, 'timestamp') * 1000;
        let price = parseFloat (order['price']);
        let amount = this.safeFloat (order, 'original_amount');
        let filled = this.safeFloat (order, 'executed_amount');
        let remaining = this.safeFloat (order, 'remaining_amount');
        let status = 'closed';
        if (order['is_cancelled']) {
            status = 'canceled';
        } else if (order['is_live']) {
            status = 'open';
        }
        return {
            'id': this.safeString (order, 'id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': this.safeString (order, 'type'),
            'side': this.safeString (order, 'side'),
            'price': price,
            'cost': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': undefined,
            'info': this.safeValue (order, 'info', order),
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            'pair': market['id'],
            'amount': amount,
            'type': type,
            'side': side,
        };
        if (type !== 'market')
            order['price'] = price;
        let response = await this.privatePostOrderNew (this.extend (order, params));
        order['id'] = response['result']['order_id'];
        order['timestamp'] = this.seconds ();
        order['original_amount'] = order['amount'];
        order['info'] = response;
        order = this.parseOrder (order, market);
        let id = order['id'];
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let response = await this.privatePostOrderCancel (this.extend ({
            'order_id': id,
        }, params));
        return this.parseOrder (response['result']);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrderStatus (this.extend ({
            'order_id': id,
        }, params));
        return this.parseOrder (response['result']);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrders ();
        return this.parseOrders (response['result'], undefined, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privatePostDepositAddress (this.extend ({
            'currency': currency['id'],
        }, params));
        let address = this.safeString (response['result'], 'address');
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        };
        if (tag)
            request['additional'] = tag;
        let response = await this.privatePostWithdraw (this.extend (request, params));
        return {
            'id': response['result']['withdrawal_id'],
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + api + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            this.checkRequiredCredentials ();
            body = this.extend ({
                'nonce': this.nonce (),
            }, params);
            let payload = this.json (body);
            let payload64 = this.stringToBase64 (this.encode (payload));
            body = this.decode (payload64);
            headers = {
                'X-BS-APIKEY': this.apiKey,
                'X-BS-PAYLOAD': body,
                'X-BS-SIGNATURE': this.hmac (payload64, this.encode (this.secret), 'sha384'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let statusCode = this.safeString (response, 'statusCode');
            if (statusCode !== undefined) {
                if (statusCode !== '0') {
                    const feedback = this.id + ' ' + this.json (response);
                    const exceptions = this.exceptions;
                    if (statusCode in exceptions) {
                        throw new exceptions[statusCode] (feedback);
                    } else {
                        throw new ExchangeError (this.id + ' ' + this.json (response));
                    }
                }
            }
            return response;
        }
    }
};
