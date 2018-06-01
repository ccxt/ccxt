'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bithumb extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bithumb',
            'name': 'Bithumb',
            'countries': 'KR', // South Korea
            'rateLimit': 500,
            'has': {
                'CORS': true,
                'fetchTickers': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30597177-ea800172-9d5e-11e7-804c-b9d4fa9b56b0.jpg',
                'api': {
                    'public': 'https://api.bithumb.com/public',
                    'private': 'https://api.bithumb.com',
                },
                'www': 'https://www.bithumb.com',
                'doc': 'https://www.bithumb.com/u1/US127',
            },
            'api': {
                'public': {
                    'get': [
                        'ticker/{currency}',
                        'ticker/all',
                        'orderbook/{currency}',
                        'orderbook/all',
                        'transaction_history/{currency}',
                        'transaction_history/all',
                    ],
                },
                'private': {
                    'post': [
                        'info/account',
                        'info/balance',
                        'info/wallet_address',
                        'info/ticker',
                        'info/orders',
                        'info/user_transactions',
                        'trade/place',
                        'info/order_detail',
                        'trade/cancel',
                        'trade/btc_withdrawal',
                        'trade/krw_deposit',
                        'trade/krw_withdrawal',
                        'trade/market_buy',
                        'trade/market_sell',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.15 / 100,
                    'taker': 0.15 / 100,
                },
            },
            'exceptions': {
                '5100': ExchangeError, // {"status":"5100","message":"After May 23th, recent_transactions is no longer, hence users will not be able to connect to recent_transactions"}
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetTickerAll ();
        let currencies = Object.keys (markets['data']);
        let result = [];
        for (let i = 0; i < currencies.length; i++) {
            let id = currencies[i];
            if (id !== 'date') {
                let market = markets['data'][id];
                let base = id;
                let quote = 'KRW';
                let symbol = id + '/' + quote;
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'info': market,
                    'lot': undefined,
                    'active': true,
                    'precision': {
                        'amount': undefined,
                        'price': undefined,
                    },
                    'limits': {
                        'amount': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'price': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'cost': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                });
            }
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostInfoBalance (this.extend ({
            'currency': 'ALL',
        }, params));
        let result = { 'info': response };
        let balances = response['data'];
        let currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let account = this.account ();
            let lowercase = currency.toLowerCase ();
            account['total'] = this.safeFloat (balances, 'total_' + lowercase);
            account['used'] = this.safeFloat (balances, 'in_use_' + lowercase);
            account['free'] = this.safeFloat (balances, 'available_' + lowercase);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'currency': market['base'],
        };
        if (typeof limit !== 'undefined')
            request['count'] = limit; // max = 50
        let response = await this.publicGetOrderbookCurrency (this.extend (request, params));
        let orderbook = response['data'];
        let timestamp = parseInt (orderbook['timestamp']);
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'quantity');
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = parseInt (ticker['date']);
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let open = this.safeFloat (ticker, 'opening_price');
        let close = this.safeFloat (ticker, 'closing_price');
        let change = close - open;
        let vwap = this.safeFloat (ticker, 'average_price');
        let baseVolume = this.safeFloat (ticker, 'volume_1day');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'max_price'),
            'low': this.safeFloat (ticker, 'min_price'),
            'bid': this.safeFloat (ticker, 'buy_price'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell_price'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': change,
            'percentage': change / open * 100,
            'average': this.sum (open, close) / 2,
            'baseVolume': baseVolume,
            'quoteVolume': baseVolume * vwap,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTickerAll (params);
        let result = {};
        let timestamp = response['data']['date'];
        let tickers = this.omit (response['data'], 'date');
        let ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let symbol = id;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
            let ticker = tickers[id];
            ticker['date'] = timestamp;
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTickerCurrency (this.extend ({
            'currency': market['base'],
        }, params));
        return this.parseTicker (response['data'], market);
    }

    parseTrade (trade, market) {
        // a workaround for their bug in date format, hours are not 0-padded
        let [ transaction_date, transaction_time ] = trade['transaction_date'].split (' ');
        if (transaction_time.length < 8)
            transaction_time = '0' + transaction_time;
        let timestamp = this.parse8601 (transaction_date + ' ' + transaction_time);
        timestamp -= 9 * 3600000; // they report UTC + 9 hours (server in Korean timezone)
        let side = (trade['type'] === 'ask') ? 'sell' : 'buy';
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': side,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'units_traded'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTransactionHistoryCurrency (this.extend ({
            'currency': market['base'],
            'count': 100, // max = 100
        }, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = undefined;
        let method = 'privatePostTrade';
        if (type === 'limit') {
            request = {
                'order_currency': market['id'],
                'Payment_currency': market['quote'],
                'units': amount,
                'price': price,
                'type': (side === 'buy') ? 'bid' : 'ask',
            };
            method += 'Place';
        } else if (type === 'market') {
            request = {
                'currency': market['id'],
                'units': amount,
            };
            method += 'Market' + this.capitalize (side);
        }
        let response = await this[method] (this.extend (request, params));
        let id = undefined;
        if ('order_id' in response) {
            if (response['order_id'])
                id = response['order_id'].toString ();
        }
        return {
            'info': response,
            'id': id,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let side_in_params = ('side' in params);
        if (!side_in_params)
            throw new ExchangeError (this.id + ' cancelOrder requires a side parameter (sell or buy) and a currency parameter');
        let currency = ('currency' in params);
        if (!currency)
            throw new ExchangeError (this.id + ' cancelOrder requires a currency parameter');
        let side = (params['side'] === 'buy') ? 'bid' : 'ask';
        return await this.privatePostTradeCancel ({
            'order_id': id,
            'type': side,
            'currency': params['currency'],
        });
    }

    async withdraw (currency, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        let request = {
            'units': amount,
            'address': address,
            'currency': currency,
        };
        if (currency === 'XRP' || currency === 'XMR') {
            let destination = ('destination' in params);
            if (!destination)
                throw new ExchangeError (this.id + ' ' + currency + ' withdraw requires an extra destination param');
        }
        let response = await this.privatePostTradeBtcWithdrawal (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'endpoint': endpoint,
            }, query));
            let nonce = this.nonce ().toString ();
            let auth = endpoint + '\0' + body + '\0' + nonce;
            let signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha512');
            let signature64 = this.decode (this.stringToBase64 (this.encode (signature)));
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Api-Key': this.apiKey,
                'Api-Sign': signature64.toString (),
                'Api-Nonce': nonce,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            if ('status' in response) {
                //
                //     {"status":"5100","message":"After May 23th, recent_transactions is no longer, hence users will not be able to connect to recent_transactions"}
                //
                let status = this.safeString (response, 'status');
                if (typeof status !== 'undefined') {
                    if (status === '0000')
                        return; // no error
                    const feedback = this.id + ' ' + this.json (response);
                    const exceptions = this.exceptions;
                    if (status in exceptions) {
                        throw new exceptions[status] (feedback);
                    } else {
                        throw new ExchangeError (feedback);
                    }
                }
            }
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('status' in response) {
            if (response['status'] === '0000')
                return response;
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    }
};
