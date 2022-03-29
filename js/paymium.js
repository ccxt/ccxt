'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class paymium extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'paymium',
            'name': 'Paymium',
            'countries': [ 'FR', 'EU' ],
            'rateLimit': 2000,
            'version': 'v1',
            'has': {
                'CORS': true,
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarkOHLCV': false,
                'fetchOrderBook': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87153930-f0f02200-c2c0-11ea-9c0a-40337375ae89.jpg',
                'api': 'https://paymium.com/api',
                'www': 'https://www.paymium.com',
                'fees': 'https://www.paymium.com/page/help/fees',
                'doc': [
                    'https://github.com/Paymium/api-documentation',
                    'https://www.paymium.com/page/developers',
                ],
                'referral': 'https://www.paymium.com/page/sign-up?referral=eDAzPoRQFMvaAB8sf-qj',
            },
            'api': {
                'public': {
                    'get': [
                        'countries',
                        'data/{currency}/ticker',
                        'data/{currency}/trades',
                        'data/{currency}/depth',
                        'bitcoin_charts/{id}/trades',
                        'bitcoin_charts/{id}/depth',
                    ],
                },
                'private': {
                    'get': [
                        'user',
                        'user/addresses',
                        'user/addresses/{address}',
                        'user/orders',
                        'user/orders/{uuid}',
                        'user/price_alerts',
                        'merchant/get_payment/{uuid}',
                    ],
                    'post': [
                        'user/addresses',
                        'user/orders',
                        'user/withdrawals',
                        'user/email_transfers',
                        'user/payment_requests',
                        'user/price_alerts',
                        'merchant/create_payment',
                    ],
                    'delete': [
                        'user/orders/{uuid}',
                        'user/orders/{uuid}/cancel',
                        'user/price_alerts/{id}',
                    ],
                },
            },
            'markets': {
                'BTC/EUR': { 'id': 'eur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR', 'baseId': 'btc', 'quoteId': 'eur', 'type': 'spot', 'spot': true },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('-0.001'),
                    'taker': this.parseNumber ('0.005'),
                },
            },
        });
    }

    parseBalance (response) {
        const result = { 'info': response };
        const currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            const code = currencies[i];
            const currency = this.currency (code);
            const currencyId = currency['id'];
            const free = 'balance_' + currencyId;
            if (free in response) {
                const account = this.account ();
                const used = 'locked_' + currencyId;
                account['free'] = this.safeString (response, free);
                account['used'] = this.safeString (response, used);
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetUser (params);
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currency': this.marketId (symbol),
        };
        const response = await this.publicGetDataCurrencyDepth (this.extend (request, params));
        return this.parseOrderBook (response, symbol, undefined, 'bids', 'asks', 'price', 'amount');
    }

    parseTicker (ticker, market = undefined) {
        //
        // {
        //     "high":"33740.82",
        //     "low":"32185.15",
        //     "volume":"4.7890433",
        //     "bid":"33313.53",
        //     "ask":"33497.97",
        //     "midpoint":"33405.75",
        //     "vwap":"32802.5263553",
        //     "at":1643381654,
        //     "price":"33143.91",
        //     "open":"33116.86",
        //     "variation":"0.0817",
        //     "currency":"EUR",
        //     "trade_id":"ce2f5152-3ac5-412d-9b24-9fa72338474c",
        //     "size":"0.00041087"
        // }
        //
        const symbol = this.safeSymbol (undefined, market);
        const timestamp = this.safeTimestamp (ticker, 'at');
        const vwap = this.safeString (ticker, 'vwap');
        const baseVolume = this.safeString (ticker, 'volume');
        const quoteVolume = Precise.stringMul (baseVolume, vwap);
        const last = this.safeString (ticker, 'price');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'variation'),
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market, false);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
        };
        const ticker = await this.publicGetDataCurrencyTicker (this.extend (request, params));
        //
        // {
        //     "high":"33740.82",
        //     "low":"32185.15",
        //     "volume":"4.7890433",
        //     "bid":"33313.53",
        //     "ask":"33497.97",
        //     "midpoint":"33405.75",
        //     "vwap":"32802.5263553",
        //     "at":1643381654,
        //     "price":"33143.91",
        //     "open":"33116.86",
        //     "variation":"0.0817",
        //     "currency":"EUR",
        //     "trade_id":"ce2f5152-3ac5-412d-9b24-9fa72338474c",
        //     "size":"0.00041087"
        // }
        //
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        const timestamp = this.safeTimestamp (trade, 'created_at_int');
        const id = this.safeString (trade, 'uuid');
        market = this.safeMarket (undefined, market);
        const side = this.safeString (trade, 'side');
        const price = this.safeString (trade, 'price');
        const amountField = 'traded_' + market['base'].toLowerCase ();
        const amount = this.safeString (trade, amountField);
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
        };
        const response = await this.publicGetDataCurrencyTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'type': this.capitalize (type) + 'Order',
            'currency': this.marketId (symbol),
            'direction': side,
            'amount': amount,
        };
        if (type !== 'market') {
            request['price'] = price;
        }
        const response = await this.privatePostUserOrders (this.extend (request, params));
        return {
            'info': response,
            'id': response['uuid'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'uuid': id,
        };
        return await this.privateDeleteUserOrdersUuidCancel (this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            let auth = nonce + url;
            headers = {
                'Api-Key': this.apiKey,
                'Api-Nonce': nonce,
            };
            if (method === 'POST') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    auth += body;
                    headers['Content-Type'] = 'application/json';
                }
            } else {
                if (Object.keys (query).length) {
                    const queryString = this.urlencode (query);
                    auth += queryString;
                    url += '?' + queryString;
                }
            }
            headers['Api-Signature'] = this.hmac (this.encode (auth), this.encode (this.secret));
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const errors = this.safeValue (response, 'errors');
        if (errors !== undefined) {
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
    }
};
