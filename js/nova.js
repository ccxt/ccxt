'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class nova extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'nova',
            'name': 'Novaexchange',
            'countries': [ 'TZ' ], // Tanzania
            'rateLimit': 2000,
            'version': 'v2',
            'has': {
                'CORS': false,
                'createMarketOrder': false,
                'createDepositAddress': true,
                'fetchDepositAddress': true,
            },
            'urls': {
                'referral': 'https://novaexchange.com/signup/?re=is8vz2hsl3qxewv1uawd',
                'logo': 'https://user-images.githubusercontent.com/1294454/30518571-78ca0bca-9b8a-11e7-8840-64b83a4a94b2.jpg',
                'api': 'https://novaexchange.com/remote',
                'www': 'https://novaexchange.com',
                'doc': 'https://novaexchange.com/remote/faq',
            },
            'api': {
                'public': {
                    'get': [
                        'markets/',
                        'markets/{basecurrency}/',
                        'market/info/{pair}/',
                        'market/orderhistory/{pair}/',
                        'market/openorders/{pair}/buy/',
                        'market/openorders/{pair}/sell/',
                        'market/openorders/{pair}/both/',
                        'market/openorders/{pair}/{ordertype}/',
                    ],
                },
                'private': {
                    'post': [
                        'getbalances/',
                        'getbalance/{currency}/',
                        'getdeposits/',
                        'getwithdrawals/',
                        'getnewdepositaddress/{currency}/',
                        'getdepositaddress/{currency}/',
                        'myopenorders/',
                        'myopenorders_market/{pair}/',
                        'cancelorder/{orderid}/',
                        'withdraw/{currency}/',
                        'trade/{pair}/',
                        'tradehistory/',
                        'getdeposithistory/',
                        'getwithdrawalhistory/',
                        'walletstatus/',
                        'walletstatus/{currency}/',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        const markets = response['markets'];
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'marketname');
            const [ quoteId, baseId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const disabled = this.safeValue (market, 'disabled', false);
            const active = !disabled;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'info': market,
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        const response = await this.publicGetMarketOpenordersPairBoth (this.extend (request, params));
        return this.parseOrderBook (response, undefined, 'buyorders', 'sellorders', 'price', 'amount');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        const response = await this.publicGetMarketInfoPair (this.extend (request, params));
        const ticker = response['markets'][0];
        const timestamp = this.milliseconds ();
        const last = this.safeFloat (ticker, 'last_price');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24h'),
            'low': this.safeFloat (ticker, 'low24h'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'change24h'),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'volume24h'),
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.safeInteger (trade, 'unix_t_datestamp');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const type = undefined;
        let side = this.safeString (trade, 'tradetype');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = amount * price;
            }
        }
        return {
            'id': undefined,
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
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetMarketOrderhistoryPair (this.extend (request, params));
        return this.parseTrades (response['items'], market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostGetbalances (params);
        const balances = this.safeValue (response, 'balances');
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const lockbox = this.safeFloat (balance, 'amount_lockbox');
            const trades = this.safeFloat (balance, 'amount_trades');
            const account = {
                'free': this.safeFloat (balance, 'amount'),
                'used': this.sum (lockbox, trades),
                'total': this.safeFloat (balance, 'amount_total'),
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        amount = amount.toString ();
        price = price.toString ();
        const market = this.market (symbol);
        const request = {
            'tradetype': side.toUpperCase (),
            'tradeamount': amount,
            'tradeprice': price,
            'tradebase': 1,
            'pair': market['id'],
        };
        const response = await this.privatePostTradePair (this.extend (request, params));
        const tradeItems = this.safeValue (response, 'tradeitems', []);
        const tradeItemsByType = this.indexBy (tradeItems, 'type');
        const created = this.safeValue (tradeItemsByType, 'created', {});
        const orderId = this.safeString (created, 'orderid');
        return {
            'info': response,
            'id': orderId,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'orderid': id,
        };
        return await this.privatePostCancelorder (this.extend (request, params));
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostGetnewdepositaddressCurrency (this.extend (request, params));
        const address = this.safeString (response, 'address');
        this.checkAddress (address);
        const tag = this.safeString (response, 'tag');
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostGetdepositaddressCurrency (this.extend (request, params));
        const address = this.safeString (response, 'address');
        this.checkAddress (address);
        const tag = this.safeString (response, 'tag');
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/';
        if (api === 'private') {
            url += api + '/';
        }
        url += this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            url += '?' + this.urlencode ({ 'nonce': nonce });
            const signature = this.hmac (this.encode (url), this.encode (this.secret), 'sha512', 'base64');
            body = this.urlencode (this.extend ({
                'apikey': this.apiKey,
                'signature': signature,
            }, query));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if ('status' in response) {
            if (response['status'] !== 'success') {
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
        }
        return response;
    }
};
