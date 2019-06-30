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
                'doc': 'https://bitsane.com/help/api',
                'fees': 'https://bitsane.com/help/fees',
                'referral': 'https://bitsane.com?ref=CGOvuPA2LR3GcdOUOKjc',
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
        const currencies = await this.publicGetAssetsCurrencies (params);
        const ids = Object.keys (currencies);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = currencies[id];
            const precision = this.safeInteger (currency, 'precision', this.options['defaultCurrencyPrecision']);
            const code = this.commonCurrencyCode (id);
            const canWithdraw = this.safeValue (currency, 'withdrawal', true);
            const canDeposit = this.safeValue (currency, 'deposit', true);
            const active = canWithdraw && canDeposit;
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
        const markets = await this.publicGetAssetsPairs (params);
        const result = [];
        const marketIds = Object.keys (markets);
        for (let i = 0; i < marketIds.length; i++) {
            const id = marketIds[i];
            const market = markets[id];
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const limits = this.safeValue (market, 'limits');
            let minLimit = undefined;
            let maxLimit = undefined;
            if (limits !== undefined) {
                minLimit = this.safeFloat (limits, 'minimum');
                maxLimit = this.safeFloat (limits, 'maximum');
            }
            const precision = {
                'amount': this.safeInteger (market, 'precision'),
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
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.milliseconds ();
        const last = this.safeFloat (ticker, 'last');
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
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'percentChange'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'baseVolume'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        const tickers = await this.fetchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbols) {
            const ids = this.marketIds (symbols);
            request['pairs'] = ids.join (',');
        }
        const response = await this.publicGetTicker (this.extend (request, params));
        const marketIds = Object.keys (response);
        const result = {};
        for (let i = 0; i < marketIds.length; i++) {
            const id = marketIds[i];
            const market = this.safeValue (this.marketsById, id);
            if (market !== undefined) {
                const symbol = market['symbol'];
                result[symbol] = this.parseTicker (response[id], market);
            }
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        const response = await this.publicGetOrderbook (this.extend (request, params));
        return this.parseOrderBook (response['result'], undefined, 'bids', 'asks', 'price', 'amount');
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let timestamp = this.safeInteger (trade, 'timestamp');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = parseFloat (this.costToPrecision (symbol, price * amount));
            }
        }
        const id = this.safeString (trade, 'tid');
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (since !== undefined) {
            request['since'] = parseInt (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response['result'], market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostBalances (params);
        const result = { 'info': response };
        const balances = this.safeValue (response, 'result');
        const ids = Object.keys (balances);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const balance = balances[id];
            let code = id;
            if (id in this.currencies_by_id) {
                code = this.currencies_by_id[id]['code'];
            } else {
                code = this.commonCurrencyCode (code);
            }
            const account = {
                'free': this.safeFloat (balance, 'amount'),
                'used': this.safeFloat (balance, 'locked'),
                'total': this.safeFloat (balance, 'total'),
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        const marketId = this.safeString (order, 'pair');
        market = this.safeValue (this.marketsById, marketId, market);
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeInteger (order, 'timestamp') * 1000;
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'original_amount');
        const filled = this.safeFloat (order, 'executed_amount');
        const remaining = this.safeFloat (order, 'remaining_amount');
        const isCanceled = this.safeValue (order, 'is_cancelled');
        const isLive = this.safeValue (order, 'is_live');
        let status = 'closed';
        if (isCanceled) {
            status = 'canceled';
        } else if (isLive) {
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
        const market = this.market (symbol);
        let order = {
            'pair': market['id'],
            'amount': amount,
            'type': type,
            'side': side,
        };
        if (type !== 'market') {
            order['price'] = price;
        }
        const response = await this.privatePostOrderNew (this.extend (order, params));
        order['id'] = response['result']['order_id'];
        order['timestamp'] = this.seconds ();
        order['original_amount'] = order['amount'];
        order['info'] = response;
        order = this.parseOrder (order, market);
        const id = order['id'];
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privatePostOrderCancel (this.extend (request, params));
        return this.parseOrder (response['result']);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privatePostOrderStatus (this.extend (request, params));
        return this.parseOrder (response['result']);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostOrders (params);
        return this.parseOrders (response['result'], undefined, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostDepositAddress (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        const address = this.safeString (result, 'address');
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        };
        if (tag !== undefined) {
            request['additional'] = tag;
        }
        const response = await this.privatePostWithdraw (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        const id = this.safeString (result, 'withdrawal_id');
        return {
            'id': id,
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + api + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            body = this.extend ({
                'nonce': this.nonce (),
            }, params);
            const payload = this.json (body);
            const payload64 = this.stringToBase64 (this.encode (payload));
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
        if (response === undefined) {
            return; // fallback to default error handler
        }
        const statusCode = this.safeString (response, 'statusCode');
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
    }
};
