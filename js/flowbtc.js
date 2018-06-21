'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class flowbtc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'flowbtc',
            'name': 'flowBTC',
            'countries': 'BR', // Brazil
            'version': 'v1',
            'rateLimit': 1000,
            'has': {
                'CORS': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28162465-cd815d4c-67cf-11e7-8e57-438bea0523a2.jpg',
                'api': 'https://api.flowbtc.com:8405/ajax',
                'www': 'https://trader.flowbtc.com',
                'doc': 'http://www.flowbtc.com.br/api/',
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
                    'maker': 0.0035,
                    'taker': 0.0035,
                },
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicPostGetProductPairs ();
        let markets = response['productPairs'];
        let result = {};
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['name'];
            let base = market['product1Label'];
            let quote = market['product2Label'];
            let precision = {
                'amount': this.safeInteger (market, 'product1DecimalPlaces'),
                'price': this.safeInteger (market, 'product2DecimalPlaces'),
            };
            let symbol = base + '/' + quote;
            result[symbol] = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
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
        let response = await this.privatePostGetAccountInfo ();
        let balances = response['currencies'];
        let result = { 'info': response };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['name'];
            let account = {
                'free': balance['balance'],
                'used': balance['hold'],
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderbook = await this.publicPostGetOrderBook (this.extend ({
            'productPair': market['id'],
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'px', 'qty');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicPostGetTicker (this.extend ({
            'productPair': market['id'],
        }, params));
        let timestamp = this.milliseconds ();
        let last = this.safeFloat (ticker, 'last');
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
        let timestamp = trade['unixtime'] * 1000;
        let side = (trade['incomingOrderSide'] === 0) ? 'buy' : 'sell';
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': trade['tid'].toString (),
            'order': undefined,
            'type': undefined,
            'side': side,
            'price': trade['px'],
            'amount': trade['qty'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicPostGetTrades (this.extend ({
            'ins': market['id'],
            'startIndex': -1,
        }, params));
        return this.parseTrades (response['trades'], market, since, limit);
    }

    priceToPrecision (symbol, price) {
        return this.decimalToPrecision (price, ROUND, this.markets[symbol]['precision']['price'], this.precisionMode);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let orderType = (type === 'market') ? 1 : 0;
        let order = {
            'ins': this.marketId (symbol),
            'side': side,
            'orderType': orderType,
            'qty': amount,
            'px': this.priceToPrecision (symbol, price),
        };
        let response = await this.privatePostCreateOrder (this.extend (order, params));
        return {
            'info': response,
            'id': response['serverOrderId'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if ('ins' in params) {
            return await this.privatePostCancelOrder (this.extend ({
                'serverOrderId': id,
            }, params));
        }
        throw new ExchangeError (this.id + ' requires `ins` symbol parameter for cancelling an order');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                body = this.json (params);
            }
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            let auth = nonce.toString () + this.uid + this.apiKey;
            let signature = this.hmac (this.encode (auth), this.encode (this.secret));
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
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('isAccepted' in response)
            if (response['isAccepted'])
                return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    }
};
