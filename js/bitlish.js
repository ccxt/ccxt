'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitlish extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitlish',
            'name': 'Bitlish',
            'countries': [ 'GB', 'EU', 'RU' ],
            'rateLimit': 1500,
            'version': 'v1',
            'has': {
                'CORS': false,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'withdraw': true,
            },
            'timeframes': {
                '1h': 3600,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766275-dcfc6c30-5ed3-11e7-839d-00a846385d0b.jpg',
                'api': 'https://bitlish.com/api',
                'www': 'https://bitlish.com',
                'doc': 'https://bitlish.com/api',
                'fees': 'https://bitlish.com/fees',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.3 / 100, // anonymous 0.3%, verified 0.2%
                    'maker': 0.2 / 100, // anonymous 0.2%, verified 0.1%
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BTC': 0.001,
                        'LTC': 0.001,
                        'DOGE': 0.001,
                        'ETH': 0.001,
                        'XMR': 0,
                        'ZEC': 0.001,
                        'DASH': 0.0001,
                        'EUR': 50,
                    },
                    'deposit': {
                        'BTC': 0,
                        'LTC': 0,
                        'DOGE': 0,
                        'ETH': 0,
                        'XMR': 0,
                        'ZEC': 0,
                        'DASH': 0,
                        'EUR': 0,
                    },
                },
            },
            'api': {
                'public': {
                    'get': [
                        'instruments',
                        'ohlcv',
                        'pairs',
                        'tickers',
                        'trades_depth',
                        'trades_history',
                    ],
                    'post': [
                        'instruments',
                        'ohlcv',
                        'pairs',
                        'tickers',
                        'trades_depth',
                        'trades_history',
                    ],
                },
                'private': {
                    'post': [
                        'accounts_operations',
                        'balance',
                        'cancel_trade',
                        'cancel_trades_by_ids',
                        'cancel_all_trades',
                        'create_bcode',
                        'create_template_wallet',
                        'create_trade',
                        'deposit',
                        'list_accounts_operations_from_ts',
                        'list_active_trades',
                        'list_bcodes',
                        'list_my_matches_from_ts',
                        'list_my_trades',
                        'list_my_trads_from_ts',
                        'list_payment_methods',
                        'list_payments',
                        'redeem_code',
                        'resign',
                        'signin',
                        'signout',
                        'trade_details',
                        'trade_options',
                        'withdraw',
                        'withdraw_by_id',
                    ],
                },
            },
            'commonCurrencies': {
                'DSH': 'DASH',
                'XDG': 'DOGE',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetPairs (params);
        const result = [];
        const keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const market = response[key];
            const id = this.safeString (market, 'id');
            const name = this.safeString (market, 'name');
            const [ baseId, quoteId ] = name.split ('/');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'high': this.safeFloat (ticker, 'max'),
            'low': this.safeFloat (ticker, 'min'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'first'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'prc') * 100,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'sum'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.publicGetTickers (params);
        const ids = Object.keys (tickers);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.safeValue (this.markets_by_id, id);
            let symbol = undefined;
            if (market !== undefined) {
                symbol = market['symbol'];
            } else {
                const baseId = id.slice (0, 3);
                const quoteId = id.slice (3, 6);
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
            const ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetTickers (params);
        const marketId = market['id'];
        return this.parseTicker (response[marketId], market);
    }

    async fetchOHLCV (symbol, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // let market = this.market (symbol);
        const now = this.seconds ();
        let start = now - 86400 * 30; // last 30 days
        if (since !== undefined) {
            start = parseInt (since / 1000);
        }
        const interval = [ start.toString (), undefined ];
        const request = {
            'time_range': interval,
        };
        return await this.publicPostOhlcv (this.extend (request, params));
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair_id': this.marketId (symbol),
        };
        const response = await this.publicGetTradesDepth (this.extend (request, params));
        let timestamp = undefined;
        const last = this.safeInteger (response, 'last');
        if (last !== undefined) {
            timestamp = parseInt (last / 1000);
        }
        return this.parseOrderBook (response, timestamp, 'bid', 'ask', 'price', 'volume');
    }

    parseTrade (trade, market = undefined) {
        const side = (trade['dir'] === 'bid') ? 'buy' : 'sell';
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let timestamp = this.safeInteger (trade, 'created');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp / 1000);
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetTradesHistory (this.extend ({
            'pair_id': market['id'],
        }, params));
        return this.parseTrades (response['list'], market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostBalance (params);
        const result = { 'info': response };
        const currencyIds = Object.keys (response);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const balance = this.safeValue (response, currencyId, {});
            account['free'] = this.safeFloat (balance, 'funds');
            account['used'] = this.safeFloat (balance, 'holded');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async signIn (params = {}) {
        const request = {
            'login': this.login,
            'passwd': this.password,
        };
        return await this.privatePostSignin (this.extend (request, params));
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair_id': this.marketId (symbol),
            'dir': (side === 'buy') ? 'bid' : 'ask',
            'amount': amount,
        };
        if (type === 'limit') {
            request['price'] = price;
        }
        const response = await this.privatePostCreateTrade (this.extend (request, params));
        const id = this.safeString (response, 'id');
        return {
            'info': response,
            'id': id,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        return await this.privatePostCancelTrade (this.extend (request, params));
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        if (code !== 'BTC') {
            // they did not document other types...
            throw new NotSupported (this.id + ' currently supports BTC withdrawals only, until they document other currencies...');
        }
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': parseFloat (amount),
            'account': address,
            'payment_method': 'bitcoin', // they did not document other types...
        };
        const response = await this.privatePostWithdraw (this.extend (request, params));
        return {
            'info': response,
            'id': response['message_id'],
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (api === 'public') {
            if (method === 'GET') {
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            } else {
                body = this.json (params);
                headers = { 'Content-Type': 'application/json' };
            }
        } else {
            this.checkRequiredCredentials ();
            body = this.json (this.extend ({ 'token': this.apiKey }, params));
            headers = { 'Content-Type': 'application/json' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
