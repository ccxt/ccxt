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
                'fetchMyTrades': true,
                'fetchTransactions': true,
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
                        'bitcoinCashWithdrawal',
                        'bitcoinCashDepositAddresses',
                        'bitcoinDepositAddresses',
                        'bitcoinWithdrawal',
                        'bitcoinWithdrawalFees',
                        'buyInstant',
                        'buyLimit',
                        'cancelOrder',
                        'cancelOrderWithInfo',
                        'createVoucher',
                        'dashDepositAddresses',
                        'dashWithdrawal',
                        'ethereumWithdrawal',
                        'ethereumDepositAddresses',
                        'litecoinWithdrawal',
                        'litecoinDepositAddresses',
                        'openOrders',
                        'order',
                        'orderHistory',
                        'pusherAuth',
                        'redeemVoucher',
                        'replaceByBuyLimit',
                        'replaceByBuyInstant',
                        'replaceBySellLimit',
                        'replaceBySellInstant',
                        'rippleDepositAddresses',
                        'rippleWithdrawal',
                        'sellInstant',
                        'sellLimit',
                        'transactionHistory',
                        'traderFees',
                        'tradeHistory',
                        'transfer',
                        'transferHistory',
                        'unconfirmedBitcoinDeposits',
                        'unconfirmedBitcoinCashDeposits',
                        'unconfirmedDashDeposits',
                        'unconfirmedEthereumDeposits',
                        'unconfirmedLitecoinDeposits',
                        'unconfirmedRippleDeposits',
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
            const code = this.safeCurrencyCode (currencyId);
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
        const timestamp = this.safeTimestamp (orderbook, 'timestamp');
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'amount');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currencyPair': this.marketId (symbol),
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        const ticker = this.safeValue (response, 'data');
        const timestamp = this.safeTimestamp (ticker, 'timestamp');
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

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'limit': 1000,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['timestampFrom'] = since;
        }
        if (code !== undefined) {
            request['currency'] = this.currencyId (code);
        }
        const response = await this.privatePostTransferHistory (this.extend (request, params));
        const items = response['data'];
        return this.parseTransactions (items, undefined, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            // any other types ?
            'COMPLETED': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (item, currency = undefined) {
        //
        // deposits
        //
        //     {
        //         transactionId: 1862815,
        //         timestamp: 1516803982388,
        //         amountCurrency: 'LTC',
        //         amount: 1,
        //         fee: 0,
        //         walletType: 'LTC',
        //         transferType: 'DEPOSIT',
        //         transferStatus: 'COMPLETED',
        //         txid:
        //         'ccb9255dfa874e6c28f1a64179769164025329d65e5201849c2400abd6bce245',
        //         destination: 'LQrtSKA6LnhcwRrEuiborQJnjFF56xqsFn',
        //         destinationTag: null
        //     }
        //
        // withdrawals
        //
        //     {
        //         transactionId: 2140966,
        //         timestamp: 1519314282976,
        //         amountCurrency: 'EUR',
        //         amount: 8421.7228,
        //         fee: 16.8772,
        //         walletType: 'BANK_WIRE',
        //         transferType: 'WITHDRAWAL',
        //         transferStatus: 'COMPLETED',
        //         txid: null,
        //         destination: null,
        //         destinationTag: null
        //     }
        //
        const timestamp = this.safeInteger (item, 'timestamp');
        const amount = this.safeFloat (item, 'amount');
        const fee = this.safeFloat (item, 'fee');
        const txid = this.safeString (item, 'txid');
        const address = this.safeString (item, 'destination');
        const tag = this.safeString (item, 'destinationTag');
        const currencyId = this.safeString (item, 'amountCurrency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const type = this.safeStringLower (item, 'transferType');
        const status = this.parseTransactionStatus (this.safeString (item, 'transferStatus'));
        const id = this.safeString (item, 'transactionId');
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': code,
            'amount': amount,
            'type': type,
            'txid': txid,
            'address': address,
            'tag': tag,
            'status': status,
            'fee': {
                'cost': fee,
                'currency': currency,
            },
            'info': item,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 1000;
        }
        const request = {
            'limit': limit,
        };
        if (since !== undefined) {
            request['timestampFrom'] = since;
        }
        const response = await this.privatePostTradeHistory (this.extend (request, params));
        const items = response['data'];
        return this.parseTrades (items, undefined, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchMyTrades (private)
        //
        //     {
        //         transactionId: 2671819,
        //         createdTimestamp: 1529649127605,
        //         currencyPair: 'LTC_BTC',
        //         type: 'BUY',
        //         orderType: 'LIMIT',
        //         orderId: 101810227,
        //         amount: 0.01,
        //         price: 0.01406,
        //         fee: 0,
        //         feeType: 'MAKER'
        //     }
        //
        // fetchTrades (public)
        //
        //     {
        //         "timestamp":1561598833416,
        //         "transactionId":"4156303",
        //         "price":10950.41,
        //         "amount":0.004,
        //         "currencyPair":"BTC_EUR",
        //         "tradeType":"BUY"
        //     }
        //
        let symbol = undefined;
        const marketId = this.safeString (trade, 'currencyPair');
        let quote = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id[marketId]) {
                market = this.markets_by_id[marketId];
                quote = market['quote'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if (symbol === undefined) {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        const side = this.safeStringLower2 (trade, 'type', 'tradeType');
        const type = this.safeStringLower (trade, 'orderType');
        const orderId = this.safeString (trade, 'orderId');
        const id = this.safeString (trade, 'transactionId');
        const timestamp = this.safeInteger2 (trade, 'timestamp', 'createdTimestamp');
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': quote,
            };
        }
        let takerOrMaker = this.safeString (trade, 'feeType');
        takerOrMaker = (takerOrMaker === 'MAKER') ? 'maker' : 'taker';
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'order': orderId,
            'takerOrMaker': takerOrMaker,
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
            'currencyPair': market['id'],
            'minutesIntoHistory': 10,
        };
        const response = await this.publicGetTransactions (this.extend (request, params));
        //
        //     {
        //         "error":false,
        //         "errorMessage":null,
        //         "data":[
        //             {
        //                 "timestamp":1561598833416,
        //                 "transactionId":"4156303",
        //                 "price":10950.41,
        //                 "amount":0.004,
        //                 "currencyPair":"BTC_EUR",
        //                 "tradeType":"BUY"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
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

    nonce () {
        return this.milliseconds ();
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
