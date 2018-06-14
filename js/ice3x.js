'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class ice3x extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ice3x',
            'name': 'ICE3X',
            'countries': 'ZA', // South Africa
            'rateLimit': 1000,
            'has': {
                'fetchCurrencies': true,
                'fetchTickers': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchMyTrades': true,
                'fetchDepositAddress': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38012176-11616c32-3269-11e8-9f05-e65cf885bb15.jpg',
                'api': 'https://ice3x.com/api/v1',
                'www': [
                    'https://ice3x.com',
                    'https://ice3x.co.za',
                ],
                'doc': 'https://ice3x.co.za/ice-cubed-bitcoin-exchange-api-documentation-1-june-2017',
                'fees': [
                    'https://help.ice3.com/support/solutions/articles/11000033293-trading-fees',
                    'https://help.ice3.com/support/solutions/articles/11000033288-fees-explained',
                    'https://help.ice3.com/support/solutions/articles/11000008131-what-are-your-fiat-deposit-and-withdrawal-fees-',
                    'https://help.ice3.com/support/solutions/articles/11000033289-deposit-fees',
                ],
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
                    'maker': 0.01,
                    'taker': 0.01,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
        });
    }

    async fetchCurrencies (params = {}) {
        let response = await this.publicGetCurrencyList (params);
        let currencies = response['response']['entities'];
        let precision = this.precision['amount'];
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['currency_id'];
            let code = this.commonCurrencyCode (currency['iso'].toUpperCase ());
            result[code] = {
                'id': id,
                'code': code,
                'name': currency['name'],
                'active': true,
                'status': 'ok',
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
            };
        }
        return result;
    }

    async fetchMarkets () {
        if (!Object.keys (this.currencies).length) {
            this.currencies = await this.fetchCurrencies ();
        }
        this.currencies_by_id = this.indexBy (this.currencies, 'id');
        let response = await this.publicGetPairList ();
        let markets = response['response']['entities'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['pair_id'];
            let baseId = market['currency_id_from'].toString ();
            let quoteId = market['currency_id_to'].toString ();
            let baseCurrency = this.currencies_by_id[baseId];
            let quoteCurrency = this.currencies_by_id[quoteId];
            let base = this.commonCurrencyCode (baseCurrency['code']);
            let quote = this.commonCurrencyCode (quoteCurrency['code']);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'lot': undefined,
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = market['symbol'];
        let last = this.safeFloat (ticker, 'last_price');
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
        let market = this.market (symbol);
        let response = await this.publicGetStatsMarketdepthfull (this.extend ({
            'pair_id': market['id'],
        }, params));
        return this.parseTicker (response['response']['entity'], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetStatsMarketdepthfull (params);
        let tickers = response['response']['entities'];
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let market = this.marketsById[ticker['pair_id']];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetOrderbookInfo (this.extend ({
            'pair_id': this.marketId (symbol),
        }, params));
        let orderbook = response['response']['entities'];
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'amount');
    }

    parseTrade (trade, market = undefined) {
        let timestamp = parseInt (trade['created']) * 1000;
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'volume');
        let symbol = market['symbol'];
        let cost = parseFloat (this.costToPrecision (symbol, price * amount));
        let fee = this.safeFloat (trade, 'fee');
        if (fee) {
            fee = {
                'cost': fee,
                'currency': market['quote'],
            };
        }
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'trade_id'),
            'order': undefined,
            'type': 'limit',
            'side': trade['type'],
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTradeList (this.extend ({
            'pair_id': market['id'],
        }, params));
        let trades = response['response']['entities'];
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostBalanceList (params);
        let result = { 'info': response };
        let balances = response['response']['entities'];
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let id = balance['currency_id'];
            if (id in this.currencies_by_id) {
                let currency = this.currencies_by_id[id];
                let code = currency['code'];
                result[code] = {
                    'free': 0.0,
                    'used': 0.0,
                    'total': parseFloat (balance['balance']),
                };
            }
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        let pairId = this.safeInteger (order, 'pair_id');
        let symbol = undefined;
        if (pairId && !market && (pairId in this.marketsById)) {
            market = this.marketsById[pairId];
            symbol = market['symbol'];
        }
        let timestamp = this.safeInteger (order, 'created') * 1000;
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'volume');
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
        let fee = this.safeFloat (order, 'fee');
        if (fee) {
            fee = { 'cost': fee };
            if (market)
                fee['currency'] = market['quote'];
        }
        return {
            'id': this.safeString (order, 'order_id'),
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
            'fee': fee,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostOrderNew (this.extend ({
            'pair_id': market['id'],
            'type': side,
            'amount': amount,
            'price': price,
        }, params));
        let order = this.parseOrder ({
            'order_id': response['response']['entity']['order_id'],
            'created': this.seconds (),
            'active': 1,
            'type': side,
            'price': price,
            'volume': amount,
            'remaining': amount,
            'info': response,
        }, market);
        let id = order['id'];
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let response = await this.privatePostOrderCancel (this.extend ({
            'order_id': id,
        }, params));
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrderInfo (this.extend ({
            'order _id': id,
        }, params));
        return this.parseOrder (response['response']['entity']);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrderList ();
        let orders = response['response']['entities'];
        return this.parseOrders (orders, undefined, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair_id': market['id'],
        };
        if (limit)
            request['items_per_page'] = limit;
        if (since)
            request['date_from'] = parseInt (since / 1000);
        let response = await this.privatePostTradeList (this.extend (request, params));
        let trades = response['response']['entities'];
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privatePostBalanceInfo (this.extend ({
            'currency_id': currency['id'],
        }, params));
        let balance = response['response']['entity'];
        let address = this.safeString (balance, 'address');
        let status = address ? 'ok' : 'none';
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'status': status,
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path;
        if (api === 'public') {
            params = this.urlencode (params);
            if (params.length)
                url += '?' + params;
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
        let response = await this.fetch2 (path, api, method, params, headers, body);
        let errors = this.safeValue (response, 'errors');
        let data = this.safeValue (response, 'response');
        if (errors || !data) {
            let authErrorKeys = [ 'Key', 'user_id', 'Sign' ];
            for (let i = 0; i < authErrorKeys.length; i++) {
                let errorKey = authErrorKeys[i];
                let errorMessage = this.safeString (errors, errorKey);
                if (!errorMessage)
                    continue;
                if (errorKey === 'user_id' && errorMessage.indexOf ('authorization') < 0)
                    continue;
                throw new AuthenticationError (errorMessage);
            }
            throw new ExchangeError (this.json (errors));
        }
        return response;
    }
};
