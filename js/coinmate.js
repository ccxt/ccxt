'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InvalidOrder, OrderNotFound, RateLimitExceeded, InsufficientFunds } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinmate extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinmate',
            'name': 'CoinMate',
            'countries': [ 'GB', 'CZ', 'EU' ], // UK, Czech Republic
            'rateLimit': 1000,
            'has': {
                'cancelOrder': true,
                'CORS': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchTransactions': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87460806-1c9f3f00-c616-11ea-8c46-a77018a8f3f4.jpg',
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
                        'orderById',
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
                    'tierBased': true,
                    'percentage': true,
                    'maker': 0.12 / 100,
                    'taker': 0.25 / 100,
                    'tiers': {
                        'taker': [
                            [0, 0.25 / 100],
                            [10000, 0.23 / 100],
                            [100000, 0.21 / 100],
                            [250000, 0.20 / 100],
                            [500000, 0.15 / 100],
                            [1000000, 0.13 / 100],
                            [3000000, 0.10 / 100],
                            [15000000, 0.05 / 100],
                        ],
                        'maker': [
                            [0, 0.12 / 100],
                            [10000, 0.11 / 100],
                            [1000000, 0.10 / 100],
                            [250000, 0.08 / 100],
                            [500000, 0.05 / 100],
                            [1000000, 0.03 / 100],
                            [3000000, 0.02 / 100],
                            [15000000, 0],
                        ],
                    },
                },
                'promotional': {
                    'trading': {
                        'maker': 0.05 / 100,
                        'taker': 0.15 / 100,
                        'tiers': {
                            'taker': [
                                [0, 0.15 / 100],
                                [10000, 0.14 / 100],
                                [100000, 0.13 / 100],
                                [250000, 0.12 / 100],
                                [500000, 0.11 / 100],
                                [1000000, 0.1 / 100],
                                [3000000, 0.08 / 100],
                                [15000000, 0.05 / 100],
                            ],
                            'maker': [
                                [0, 0.05 / 100],
                                [10000, 0.04 / 100],
                                [1000000, 0.03 / 100],
                                [250000, 0.02 / 100],
                                [500000, 0],
                                [1000000, 0],
                                [3000000, 0],
                                [15000000, 0],
                            ],
                        },
                    },
                },
            },
            'options': {
                'promotionalMarkets': ['ETH/EUR', 'ETH/CZK', 'ETH/BTC', 'XRP/EUR', 'XRP/CZK', 'XRP/BTC', 'DASH/EUR', 'DASH/CZK', 'DASH/BTC', 'BCH/EUR', 'BCH/CZK', 'BCH/BTC'],
            },
            'exceptions': {
                'exact': {
                    'No order with given ID': OrderNotFound,
                },
                'broad': {
                    'Not enough account balance available': InsufficientFunds,
                    'Incorrect order ID': InvalidOrder,
                    'Minimum Order Size ': InvalidOrder,
                    'TOO MANY REQUESTS': RateLimitExceeded,
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
            const promotionalMarkets = this.safeValue (this.options, 'promotionalMarkets', []);
            let fees = this.safeValue (this.fees, 'trading');
            if (this.inArray (symbol, promotionalMarkets)) {
                const promotionalFees = this.safeValue (this.fees, 'promotional', {});
                fees = this.safeValue (promotionalFees, 'trading', fees);
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': undefined,
                'maker': fees['maker'],
                'taker': fees['taker'],
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
                'currency': code,
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
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['currencyPair'] = market['id'];
        }
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
        const marketId = this.safeString (trade, 'currencyPair');
        market = this.safeMarket (marketId, market, '_');
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
                'currency': market['quote'],
            };
        }
        let takerOrMaker = this.safeString (trade, 'feeType');
        takerOrMaker = (takerOrMaker === 'MAKER') ? 'maker' : 'taker';
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
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

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.privatePostOpenOrders (this.extend ({}, params));
        const extension = { 'status': 'open' };
        return this.parseOrders (response['data'], undefined, since, limit, extension);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPair': market['id'],
        };
        // offset param that appears in other parts of the API doesn't appear to be supported here
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostOrderHistory (this.extend (request, params));
        return this.parseOrders (response['data'], market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'FILLED': 'closed',
            'CANCELLED': 'canceled',
            'PARTIALLY_FILLED': 'open',
            'OPEN': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type) {
        const types = {
            'LIMIT': 'limit',
            'MARKET': 'market',
        };
        return this.safeString (types, type, type);
    }

    parseOrder (order, market = undefined) {
        //
        // limit sell
        //
        //     {
        //         id: 781246605,
        //         timestamp: 1584480015133,
        //         trailingUpdatedTimestamp: null,
        //         type: 'SELL',
        //         currencyPair: 'ETH_BTC',
        //         price: 0.0345,
        //         amount: 0.01,
        //         stopPrice: null,
        //         originalStopPrice: null,
        //         marketPriceAtLastUpdate: null,
        //         marketPriceAtOrderCreation: null,
        //         orderTradeType: 'LIMIT',
        //         hidden: false,
        //         trailing: false,
        //         clientOrderId: null
        //     }
        //
        // limit buy
        //
        //     {
        //         id: 67527001,
        //         timestamp: 1517931722613,
        //         trailingUpdatedTimestamp: null,
        //         type: 'BUY',
        //         price: 5897.24,
        //         remainingAmount: 0.002367,
        //         originalAmount: 0.1,
        //         stopPrice: null,
        //         originalStopPrice: null,
        //         marketPriceAtLastUpdate: null,
        //         marketPriceAtOrderCreation: null,
        //         status: 'CANCELLED',
        //         orderTradeType: 'LIMIT',
        //         hidden: false,
        //         avgPrice: null,
        //         trailing: false,
        //     }
        //
        const id = this.safeString (order, 'id');
        const timestamp = this.safeInteger (order, 'timestamp');
        const side = this.safeStringLower (order, 'type');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'originalAmount');
        let remaining = this.safeFloat (order, 'remainingAmount');
        if (remaining === undefined) {
            remaining = this.safeFloat (order, 'amount');
        }
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        const type = this.parseOrderType (this.safeString (order, 'orderTradeType'));
        let filled = undefined;
        let cost = undefined;
        if ((amount !== undefined) && (remaining !== undefined)) {
            filled = Math.max (amount - remaining, 0);
            if (remaining === 0) {
                status = 'closed';
            }
            if (price !== undefined) {
                cost = filled * price;
            }
        }
        const average = this.safeFloat (order, 'avgPrice');
        const marketId = this.safeString (order, 'currencyPair');
        const symbol = this.safeSymbol (marketId, market, '_');
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const stopPrice = this.safeFloat (order, 'stopPrice');
        return {
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'trades': undefined,
            'info': order,
            'fee': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'privatePost' + this.capitalize (side);
        const request = {
            'currencyPair': this.marketId (symbol),
        };
        if (type === 'market') {
            if (side === 'buy') {
                request['total'] = this.amountToPrecision (symbol, amount); // amount in fiat
            } else {
                request['amount'] = this.amountToPrecision (symbol, amount); // amount in fiat
            }
            method += 'Instant';
        } else {
            request['amount'] = this.amountToPrecision (symbol, amount); // amount in crypto
            request['price'] = this.priceToPrecision (symbol, price);
            method += this.capitalize (type);
        }
        const response = await this[method] (this.extend (request, params));
        const id = this.safeString (response, 'data');
        return {
            'info': response,
            'id': id,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
        }
        const response = await this.privatePostOrderById (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        //   {"error":false,"errorMessage":null,"data":{"success":true,"remainingAmount":0.01}}
        const request = { 'orderId': id };
        const response = await this.privatePostCancelOrderWithInfo (this.extend (request, params));
        return {
            'info': response,
        };
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

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response !== undefined) {
            if ('error' in response) {
                // {"error":true,"errorMessage":"Minimum Order Size 0.01 ETH","data":null}
                if (response['error']) {
                    const message = this.safeString (response, 'errorMessage');
                    const feedback = this.id + ' ' + message;
                    this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                    this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
                    throw new ExchangeError (this.id + ' ' + this.json (response));
                }
            }
        }
        if (code > 400) {
            if (body) {
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions['exact'], body, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
                throw new ExchangeError (feedback); // unknown message
            }
            throw new ExchangeError (this.id + ' ' + body);
        }
    }
};
