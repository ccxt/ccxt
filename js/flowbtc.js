'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class flowbtc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'flowbtc',
            'name': 'flowBTC',
            'countries': [ 'BR' ], // Brazil
            'version': 'v1',
            'rateLimit': 1000,
            'has': {
                'CORS': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28162465-cd815d4c-67cf-11e7-8e57-438bea0523a2.jpg',
                'api': 'https://publicapi.flowbtc.com.br',
                'www': 'https://www.flowbtc.com.br',
                'doc': 'https://www.flowbtc.com.br/api.html',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'api': {
                'public': {
                    'post': [
                        'GetTicker',
                        'GetTrades',
                        'GetTradesByDate',
                        'GetOrderBook',
                        'GetProductPairs',
                        'GetProducts',
                    ],
                },
                'private': {
                    'post': [
                        'CreateAccount',
                        'GetUserInfo',
                        'SetUserInfo',
                        'GetAccountInfo',
                        'GetAccountTrades',
                        'GetDepositAddresses',
                        'Withdraw',
                        'CreateOrder',
                        'ModifyOrder',
                        'CancelOrder',
                        'CancelAllOrders',
                        'GetAccountOpenOrders',
                        'GetOrderFee',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.0025,
                    'taker': 0.005,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicPostGetProductPairs (params);
        const markets = this.safeValue (response, 'productPairs');
        const result = {};
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'product1Label');
            const quoteId = this.safeString (market, 'product2Label');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const precision = {
                'amount': this.safeInteger (market, 'product1DecimalPlaces'),
                'price': this.safeInteger (market, 'product2DecimalPlaces'),
            };
            const symbol = base + '/' + quote;
            result[symbol] = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': precision,
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
                'info': market,
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostGetAccountInfo (params);
        const balances = this.safeValue (response, 'currencies');
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = balance['name'];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'balance');
            account['total'] = this.safeFloat (balance, 'hold');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'productPair': market['id'],
        };
        const response = await this.publicPostGetOrderBook (this.extend (request, params));
        return this.parseOrderBook (response, undefined, 'bids', 'asks', 'px', 'qty');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'productPair': market['id'],
        };
        const ticker = await this.publicPostGetTicker (this.extend (request, params));
        const timestamp = this.milliseconds ();
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
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
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume24hr'),
            'quoteVolume': this.safeFloat (ticker, 'volume24hrProduct2'),
            'info': ticker,
        };
    }

    parseTrade (trade, market) {
        const timestamp = this.safeTimestamp (trade, 'unixtime');
        const side = (trade['incomingOrderSide'] === 0) ? 'buy' : 'sell';
        const id = this.safeString (trade, 'tid');
        const price = this.safeFloat (trade, 'px');
        const amount = this.safeFloat (trade, 'qty');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': id,
            'order': undefined,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'ins': market['id'],
            'startIndex': -1,
        };
        const response = await this.publicPostGetTrades (this.extend (request, params));
        return this.parseTrades (response['trades'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const orderType = (type === 'market') ? 1 : 0;
        const request = {
            'ins': this.marketId (symbol),
            'side': side,
            'orderType': orderType,
            'qty': amount,
            'px': this.priceToPrecision (symbol, price),
        };
        const response = await this.privatePostCreateOrder (this.extend (request, params));
        return {
            'info': response,
            'id': response['serverOrderId'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if ('ins' in params) {
            const request = {
                'serverOrderId': id,
            };
            return await this.privatePostCancelOrder (this.extend (request, params));
        }
        throw new ExchangeError (this.id + ' requires `ins` symbol parameter for cancelling an order');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const url = this.urls['api'] + '/' + this.version + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                body = this.json (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            const auth = nonce.toString () + this.uid + this.apiKey;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret));
            body = this.json (this.extend ({
                'apiKey': this.apiKey,
                'apiNonce': nonce,
                'apiSig': signature.toUpperCase (),
            }, params));
            headers = {
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if ('isAccepted' in response) {
            if (response['isAccepted']) {
                return response;
            }
        }
        throw new ExchangeError (this.id + ' ' + this.json (response));
    }
};
