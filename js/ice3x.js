'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, ArgumentsRequired } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class ice3x extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ice3x',
            'name': 'ICE3X',
            'countries': [ 'ZA' ], // South Africa
            'rateLimit': 1000,
            'version': 'v1',
            'has': {
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87460809-1dd06c00-c616-11ea-98ad-7d5e1cb7fcdd.jpg',
                'api': 'https://ice3x.com/api',
                'www': 'https://ice3x.com', // 'https://ice3x.co.za',
                'doc': 'https://ice3x.co.za/ice-cubed-bitcoin-exchange-api-documentation-1-june-2017',
                'fees': [
                    'https://help.ice3.com/support/solutions/articles/11000033293-trading-fees',
                    'https://help.ice3.com/support/solutions/articles/11000033288-fees-explained',
                    'https://help.ice3.com/support/solutions/articles/11000008131-what-are-your-fiat-deposit-and-withdrawal-fees-',
                    'https://help.ice3.com/support/solutions/articles/11000033289-deposit-fees',
                ],
                'referral': 'https://ice3x.com?ref=14341802',
            },
            'api': {
                'public': {
                    'get': [
                        'currency/list',
                        'currency/info',
                        'pair/list',
                        'pair/info',
                        'stats/marketdepthfull',
                        'stats/marketdepthbtcav',
                        'stats/marketdepth',
                        'orderbook/info',
                        'trade/list',
                        'trade/info',
                    ],
                },
                'private': {
                    'post': [
                        'balance/list',
                        'balance/info',
                        'order/new',
                        'order/cancel',
                        'order/list',
                        'order/info',
                        'trade/list',
                        'trade/info',
                        'transaction/list',
                        'transaction/info',
                        'invoice/list',
                        'invoice/info',
                        'invoice/pdf',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.005,
                    'taker': 0.005,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencyList (params);
        const currencies = response['response']['entities'];
        const precision = this.precision['amount'];
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'currency_id');
            const currencyId = this.safeString (currency, 'iso');
            const code = this.safeCurrencyCode (currencyId);
            result[code] = {
                'id': id,
                'code': code,
                'name': currency['name'],
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
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
                'fee': undefined,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        if (this.currencies_by_id === undefined) {
            this.currencies = await this.fetchCurrencies ();
            this.currencies_by_id = this.indexBy (this.currencies, 'id');
        }
        const response = await this.publicGetPairList (params);
        const markets = this.safeValue (response['response'], 'entities');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'pair_id');
            const baseId = this.safeString (market, 'currency_id_from');
            const quoteId = this.safeString (market, 'currency_id_to');
            const baseCurrency = this.currencies_by_id[baseId];
            const quoteCurrency = this.currencies_by_id[quoteId];
            const base = baseCurrency['code'];
            const quote = quoteCurrency['code'];
            const symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': undefined,
                'info': market,
                'precision': this.precision,
                'limits': this.limits,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        const symbol = market['symbol'];
        const last = this.safeFloat (ticker, 'last_price');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'max'),
            'low': this.safeFloat (ticker, 'min'),
            'bid': this.safeFloat (ticker, 'max_bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'min_ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeFloat (ticker, 'avg'),
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'vol'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair_id': market['id'],
        };
        const response = await this.publicGetStatsMarketdepthfull (this.extend (request, params));
        const ticker = this.safeValue (response['response'], 'entity');
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetStatsMarketdepthfull (params);
        const tickers = this.safeValue (response['response'], 'entities');
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            const marketId = this.safeString (ticker, 'pair_id');
            const market = this.safeValue (this.marketsById, marketId);
            if (market !== undefined) {
                const symbol = market['symbol'];
                result[symbol] = this.parseTicker (ticker, market);
            }
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair_id': this.marketId (symbol),
        };
        if (limit !== undefined) {
            const type = this.safeString (params, 'type');
            if ((type !== 'ask') && (type !== 'bid')) {
                // eslint-disable-next-line quotes
                throw new ArgumentsRequired (this.id + " fetchOrderBook() requires an exchange-specific extra 'type' param ('bid' or 'ask') when used with a limit");
            } else {
                request['items_per_page'] = limit;
            }
        }
        const response = await this.publicGetOrderbookInfo (this.extend (request, params));
        const orderbook = this.safeValue (response['response'], 'entities');
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'amount');
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'created');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'volume');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': market['quote'],
            };
        }
        const type = 'limit';
        const side = this.safeString (trade, 'type');
        const id = this.safeString (trade, 'trade_id');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair_id': market['id'],
        };
        const response = await this.publicGetTradeList (this.extend (request, params));
        const trades = this.safeValue (response['response'], 'entities');
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostBalanceList (params);
        const result = { 'info': response };
        const balances = this.safeValue (response['response'], 'entities', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            // currency ids are numeric strings
            const currencyId = this.safeString (balance, 'currency_id');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeFloat (balance, 'balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        const pairId = this.safeInteger (order, 'pair_id');
        let symbol = undefined;
        if (pairId && !market && (pairId in this.marketsById)) {
            market = this.marketsById[pairId];
            symbol = market['symbol'];
        }
        const timestamp = this.safeTimestamp (order, 'created');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'volume');
        let status = this.safeInteger (order, 'active');
        let remaining = this.safeFloat (order, 'remaining');
        let filled = undefined;
        if (status === 1) {
            status = 'open';
        } else {
            status = 'closed';
            remaining = 0;
            filled = amount;
        }
        let fee = undefined;
        const feeCost = this.safeFloat (order, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
            };
            if (market !== undefined) {
                fee['currency'] = market['quote'];
            }
        }
        return {
            'id': this.safeString (order, 'order_id'),
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeString (order, 'type'),
            'price': price,
            'stopPrice': undefined,
            'cost': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': fee,
            'info': order,
            'average': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair_id': market['id'],
            'type': side,
            'amount': amount,
            'price': price,
        };
        const response = await this.privatePostOrderNew (this.extend (request, params));
        const order = this.parseOrder ({
            'order_id': response['response']['entity']['order_id'],
            'created': this.seconds (),
            'active': 1,
            'type': side,
            'price': price,
            'volume': amount,
            'remaining': amount,
            'info': response,
        }, market);
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'order_id': id,
        };
        return await this.privatePostOrderCancel (this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order _id': id,
        };
        const response = await this.privatePostOrderInfo (this.extend (request, params));
        const data = this.safeValue (response, 'response', {});
        const order = this.safeValue (data, 'entity');
        return this.parseOrder (order);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostOrderList (params);
        const data = this.safeValue (response, 'response', {});
        const orders = this.safeValue (data, 'entities', []);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair_id': market['id'],
        };
        if (limit !== undefined) {
            request['items_per_page'] = limit;
        }
        if (since !== undefined) {
            request['date_from'] = parseInt (since / 1000);
        }
        const response = await this.privatePostTradeList (this.extend (request, params));
        const data = this.safeValue (response, 'response', {});
        const trades = this.safeValue (data, 'entities', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency_id': currency['id'],
        };
        const response = await this.privatePostBalanceInfo (this.extend (request, params));
        const data = this.safeValue (response, 'response', {});
        const balance = this.safeValue (data, 'entity', {});
        const address = this.safeString (balance, 'address');
        const status = address ? 'ok' : 'none';
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'status': status,
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'nonce': this.nonce (),
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        const errors = this.safeValue (response, 'errors');
        const data = this.safeValue (response, 'response');
        if (errors || !data) {
            const authErrorKeys = [ 'Key', 'user_id', 'Sign' ];
            for (let i = 0; i < authErrorKeys.length; i++) {
                const errorKey = authErrorKeys[i];
                const errorMessage = this.safeString (errors, errorKey);
                if (!errorMessage) {
                    continue;
                }
                if (errorKey === 'user_id' && errorMessage.indexOf ('authorization') < 0) {
                    continue;
                }
                throw new AuthenticationError (errorMessage);
            }
            throw new ExchangeError (this.json (errors));
        }
        return response;
    }
};
