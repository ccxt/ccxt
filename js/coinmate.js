'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinmate extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinmate',
            'name': 'CoinMate',
            'countries': [ 'GB', 'CZ', 'EU' ], // UK, Czech Republic
            'rateLimit': 1000,
            'has': {
                'CORS': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27811229-c1efb510-606c-11e7-9a36-84ba2ce412d8.jpg',
                'api': 'https://coinmate.io/api',
                'www': 'https://coinmate.io',
                'fees': 'https://coinmate.io/fees',
                'doc': [
                    'https://coinmate.docs.apiary.io',
                    'https://coinmate.io/developers',
                ],
                'referral': 'https://coinmate.io?referral=YTFkM1RsOWFObVpmY1ZjMGREQmpTRnBsWjJJNVp3PT0',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'api': {
                'public': {
                    'get': [
                        'orderBook',
                        'ticker',
                        'transactions',
                        'tradingPairs',
                    ],
                },
                'private': {
                    'post': [
                        'balances',
                        'bitcoinWithdrawal',
                        'bitcoinDepositAddresses',
                        'buyInstant',
                        'buyLimit',
                        'cancelOrder',
                        'cancelOrderWithInfo',
                        'createVoucher',
                        'openOrders',
                        'redeemVoucher',
                        'sellInstant',
                        'sellLimit',
                        'transactionHistory',
                        'unconfirmedBitcoinDeposits',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.05 / 100,
                    'taker': 0.15 / 100,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetTradingPairs (params);
        //
        //     {
        //         "error":false,
        //         "errorMessage":null,
        //         "data": [
        //             {
        //                 "name":"BTC_EUR",
        //                 "firstCurrency":"BTC",
        //                 "secondCurrency":"EUR",
        //                 "priceDecimals":2,
        //                 "lotDecimals":8,
        //                 "minAmount":0.0002,
        //                 "tradesWebSocketChannelId":"trades-BTC_EUR",
        //                 "orderBookWebSocketChannelId":"order_book-BTC_EUR",
        //                 "tradeStatisticsWebSocketChannelId":"statistics-BTC_EUR"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'firstCurrency');
            const quoteId = this.safeString (market, 'secondCurrency');
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
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
                'precision': {
                    'price': this.safeInteger (market, 'priceDecimals'),
                    'amount': this.safeInteger (market, 'lotDecimals'),
                },
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minAmount'),
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
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostBalances (params);
        const balances = this.safeValue (response, 'data');
        const result = { 'info': response };
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.commonCurrencyCode (currencyId);
            const balance = this.safeValue (balances, currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['used'] = this.safeFloat (balance, 'reserved');
            account['total'] = this.safeFloat (balance, 'balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currencyPair': this.marketId (symbol),
            'groupByPriceLimit': 'False',
        };
        const response = await this.publicGetOrderBook (this.extend (request, params));
        const orderbook = response['data'];
        let timestamp = this.safeInteger (orderbook, 'timestamp');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'amount');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currencyPair': this.marketId (symbol),
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        const ticker = this.safeValue (response, 'data');
        let timestamp = this.safeInteger (ticker, 'timestamp');
        if (timestamp !== undefined) {
            timestamp = timestamp * 1000;
        }
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
            'vwap': undefined,
            'askVolume': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'amount'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (trade, 'currencyPair');
            if (marketId in this.markets_by_id[marketId]) {
                market = this.markets_by_id[marketId];
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        const id = this.safeString (trade, 'transactionId');
        const timestamp = this.safeInteger (trade, 'timestamp');
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': undefined,
            'order': undefined,
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
            'currencyPair': market['id'],
            'minutesIntoHistory': 10,
        };
        const response = await this.publicGetTransactions (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'privatePost' + this.capitalize (side);
        const request = {
            'currencyPair': this.marketId (symbol),
        };
        if (type === 'market') {
            if (side === 'buy') {
                request['total'] = amount; // amount in fiat
            } else {
                request['amount'] = amount; // amount in fiat
            }
            method += 'Instant';
        } else {
            request['amount'] = amount; // amount in crypto
            request['price'] = price;
            method += this.capitalize (type);
        }
        const response = await this[method] (this.extend (request, params));
        return {
            'info': response,
            'id': response['data'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder ({ 'orderId': id });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const auth = nonce + this.uid + this.apiKey;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret));
            body = this.urlencode (this.extend ({
                'clientId': this.uid,
                'nonce': nonce,
                'publicKey': this.apiKey,
                'signature': signature.toUpperCase (),
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response) {
            if (response['error']) {
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
        }
        return response;
    }
};
