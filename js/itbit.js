'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class itbit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'itbit',
            'name': 'itBit',
            'countries': [ 'US' ],
            'rateLimit': 2000,
            'version': 'v1',
            'has': {
                'CORS': true,
                'createMarketOrder': false,
                'fetchMyTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27822159-66153620-60ad-11e7-89e7-005f6d7f3de0.jpg',
                'api': 'https://api.itbit.com',
                'www': 'https://www.itbit.com',
                'doc': [
                    'https://api.itbit.com/docs',
                    'https://www.itbit.com/api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'markets/{symbol}/ticker',
                        'markets/{symbol}/order_book',
                        'markets/{symbol}/trades',
                    ],
                },
                'private': {
                    'get': [
                        'wallets',
                        'wallets/{walletId}',
                        'wallets/{walletId}/balances/{currencyCode}',
                        'wallets/{walletId}/funding_history',
                        'wallets/{walletId}/trades',
                        'wallets/{walletId}/orders',
                        'wallets/{walletId}/orders/{id}',
                    ],
                    'post': [
                        'wallet_transfers',
                        'wallets',
                        'wallets/{walletId}/cryptocurrency_deposits',
                        'wallets/{walletId}/cryptocurrency_withdrawals',
                        'wallets/{walletId}/orders',
                        'wire_withdrawal',
                    ],
                    'delete': [
                        'wallets/{walletId}/orders/{id}',
                    ],
                },
            },
            'markets': {
                'BTC/USD': { 'id': 'XBTUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
                'BTC/SGD': { 'id': 'XBTSGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD' },
                'BTC/EUR': { 'id': 'XBTEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
                'ETH/USD': { 'id': 'ETHUSD', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD' },
                'ETH/EUR': { 'id': 'ETHEUR', 'symbol': 'ETH/EUR', 'base': 'ETH', 'quote': 'EUR' },
                'ETH/SGD': { 'id': 'ETHSGD', 'symbol': 'ETH/SGD', 'base': 'ETH', 'quote': 'SGD' },
            },
            'fees': {
                'trading': {
                    'maker': -0.03 / 100,
                    'taker': 0.35 / 100,
                },
            },
            'commonCurrencies': {
                'XBT': 'BTC',
            },
        });
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        const orderbook = await this.publicGetMarketsSymbolOrderBook (this.extend (request, params));
        return this.parseOrderBook (orderbook);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        const ticker = await this.publicGetMarketsSymbolTicker (this.extend (request, params));
        const serverTimeUTC = this.safeString (ticker, 'serverTimeUTC');
        if (!serverTimeUTC) {
            throw new ExchangeError (this.id + ' fetchTicker returned a bad response: ' + this.json (ticker));
        }
        const timestamp = this.parse8601 (serverTimeUTC);
        const vwap = this.safeFloat (ticker, 'vwap24h');
        const baseVolume = this.safeFloat (ticker, 'volume24h');
        let quoteVolume = undefined;
        if (baseVolume !== undefined && vwap !== undefined) {
            quoteVolume = baseVolume * vwap;
        }
        const last = this.safeFloat (ticker, 'lastPrice');
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
            'vwap': vwap,
            'open': this.safeFloat (ticker, 'openToday'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         timestamp: "2015-05-22T17:45:34.7570000Z",
        //         matchNumber: "5CR1JEUBBM8J",
        //         price: "351.45000000",
        //         amount: "0.00010000"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "orderId": "248ffda4-83a0-4033-a5bb-8929d523f59f",
        //         "timestamp": "2015-05-11T14:48:01.9870000Z",
        //         "instrument": "XBTUSD",
        //         "direction": "buy",                      // buy or sell
        //         "currency1": "XBT",                      // base currency
        //         "currency1Amount": "0.00010000",         // order amount in base currency
        //         "currency2": "USD",                      // quote currency
        //         "currency2Amount": "0.0250530000000000", // order cost in quote currency
        //         "rate": "250.53000000",
        //         "commissionPaid": "0.00000000",   // net trade fee paid after using any available rebate balance
        //         "commissionCurrency": "USD",
        //         "rebatesApplied": "-0.000125265", // negative values represent amount of rebate balance used for trades removing liquidity from order book; positive values represent amount of rebate balance earned from trades adding liquidity to order book
        //         "rebateCurrency": "USD",
        //         "executionId": "23132"
        //     }
        //
        const id = this.safeString2 (trade, 'executionId', 'matchNumber');
        const timestamp = this.parse8601 (this.safeString (trade, 'timestamp'));
        const side = this.safeString (trade, 'direction');
        const orderId = this.safeString (trade, 'orderId');
        let feeCost = this.safeFloat (trade, 'commissionPaid');
        const feeCurrencyId = this.safeString (trade, 'commissionCurrency');
        const feeCurrency = this.safeCurrencyCode (feeCurrencyId);
        let rebatesApplied = this.safeFloat (trade, 'rebatesApplied');
        if (rebatesApplied !== undefined) {
            rebatesApplied = -rebatesApplied;
        }
        const rebateCurrencyId = this.safeString (trade, 'rebateCurrency');
        const rebateCurrency = this.safeCurrencyCode (rebateCurrencyId);
        const price = this.safeFloat2 (trade, 'price', 'rate');
        const amount = this.safeFloat2 (trade, 'currency1Amount', 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        let symbol = undefined;
        const marketId = this.safeString (trade, 'instrument');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const baseId = this.safeString (trade, 'currency1');
                const quoteId = this.safeString (trade, 'currency2');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if (symbol === undefined) {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        const result = {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
        };
        if (feeCost !== undefined) {
            if (rebatesApplied !== undefined) {
                if (feeCurrency === rebateCurrency) {
                    feeCost = this.sum (feeCost, rebatesApplied);
                    result['fee'] = {
                        'cost': feeCost,
                        'currency': feeCurrency,
                    };
                } else {
                    result['fees'] = [
                        {
                            'cost': feeCost,
                            'currency': feeCurrency,
                        },
                        {
                            'cost': rebatesApplied,
                            'currency': rebateCurrency,
                        },
                    ];
                }
            } else {
                result['fee'] = {
                    'cost': feeCost,
                    'currency': feeCurrency,
                };
            }
        }
        if (!('fee' in result)) {
            if (!('fees' in result)) {
                result['fee'] = undefined;
            }
        }
        return result;
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const walletId = this.safeString (params, 'walletId');
        if (walletId === undefined) {
            throw new ExchangeError (this.id + ' fetchMyTrades requires a walletId parameter');
        }
        const request = {
            'walletId': walletId,
        };
        if (limit !== undefined) {
            request['perPage'] = limit; // default 50, max 50
        }
        const response = await this.privateGetWalletsWalletIdFundingHistory (this.extend (request, params));
        //     { bankName: 'USBC (usd)',
        //         withdrawalId: 94740,
        //         holdingPeriodCompletionDate: '2018-04-16T07:57:05.9606869',
        //         time: '2018-04-16T07:57:05.9600000',
        //         currency: 'USD',
        //         transactionType: 'Withdrawal',
        //         amount: '2186.72000000',
        //         walletName: 'Wallet',
        //         status: 'completed' },
        //
        //     { "time": "2018-01-02T19:52:22.4176503",
        //     "amount": "0.50000000",
        //     "status": "completed",
        //     "txnHash": "1b6fff67ed83cb9e9a38ca4976981fc047322bc088430508fe764a127d3ace95",
        //     "currency": "XBT",
        //     "walletName": "Wallet",
        //     "transactionType": "Deposit",
        //     "destinationAddress": "3AAWTH9et4e8o51YKp9qPpmujrNXKwHWNX"}
        const items = response['fundingHistory'];
        const result = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const time = this.safeString (item, 'time');
            const timestamp = this.parse8601 (time);
            const currency = this.safeString (item, 'currency');
            const destinationAddress = this.safeString (item, 'destinationAddress');
            const txnHash = this.safeString (item, 'txnHash');
            const transactionType = this.safeStringLower (item, 'transactionType');
            const transactionStatus = this.safeString (item, 'status');
            const status = this.parseTransferStatus (transactionStatus);
            result.push ({
                'id': this.safeString (item, 'withdrawalId'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'currency': this.safeCurrencyCode (currency),
                'address': destinationAddress,
                'tag': undefined,
                'txid': txnHash,
                'type': transactionType,
                'status': status,
                'amount': this.safeFloat (item, 'amount'),
                'fee': undefined,
                'info': item,
            });
        }
        return result;
    }

    parseTransferStatus (status) {
        const options = {
            'cancelled': 'canceled',
            'completed': 'ok',
        };
        return this.safeString (options, status, 'pending');
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const walletId = this.safeString (params, 'walletId');
        if (walletId === undefined) {
            throw new ExchangeError (this.id + ' fetchMyTrades requires a walletId parameter');
        }
        const request = {
            'walletId': walletId,
        };
        if (since !== undefined) {
            request['rangeStart'] = this.ymdhms (since, 'T');
        }
        if (limit !== undefined) {
            request['perPage'] = limit; // default 50, max 50
        }
        const response = await this.privateGetWalletsWalletIdTrades (this.extend (request, params));
        //
        //     {
        //         "totalNumberOfRecords": "2",
        //         "currentPageNumber": "1",
        //         "latestExecutionId": "332", // most recent execution at time of response
        //         "recordsPerPage": "50",
        //         "tradingHistory": [
        //             {
        //                 "orderId": "248ffda4-83a0-4033-a5bb-8929d523f59f",
        //                 "timestamp": "2015-05-11T14:48:01.9870000Z",
        //                 "instrument": "XBTUSD",
        //                 "direction": "buy",                      // buy or sell
        //                 "currency1": "XBT",                      // base currency
        //                 "currency1Amount": "0.00010000",         // order amount in base currency
        //                 "currency2": "USD",                      // quote currency
        //                 "currency2Amount": "0.0250530000000000", // order cost in quote currency
        //                 "rate": "250.53000000",
        //                 "commissionPaid": "0.00000000",   // net trade fee paid after using any available rebate balance
        //                 "commissionCurrency": "USD",
        //                 "rebatesApplied": "-0.000125265", // negative values represent amount of rebate balance used for trades removing liquidity from order book; positive values represent amount of rebate balance earned from trades adding liquidity to order book
        //                 "rebateCurrency": "USD",
        //                 "executionId": "23132"
        //             },
        //         ],
        //     }
        //
        const trades = this.safeValue (response, 'tradingHistory', []);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketsSymbolTrades (this.extend (request, params));
        //
        //     {
        //         count: 3,
        //         recentTrades: [
        //             {
        //                 timestamp: "2015-05-22T17:45:34.7570000Z",
        //                 matchNumber: "5CR1JEUBBM8J",
        //                 price: "351.45000000",
        //                 amount: "0.00010000"
        //             },
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'recentTrades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.fetchWallets (params);
        const balances = response[0]['balances'];
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'availableBalance');
            account['total'] = this.safeFloat (balance, 'totalBalance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchWallets (params = {}) {
        await this.loadMarkets ();
        if (!this.uid) {
            throw new AuthenticationError (this.id + ' fetchWallets requires uid API credential');
        }
        const request = {
            'userId': this.uid,
        };
        return await this.privateGetWallets (this.extend (request, params));
    }

    async fetchWallet (walletId, params = {}) {
        await this.loadMarkets ();
        const request = {
            'walletId': walletId,
        };
        return await this.privateGetWalletsWalletId (this.extend (request, params));
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'open',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'filled',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const walletIdInParams = ('walletId' in params);
        if (!walletIdInParams) {
            throw new ExchangeError (this.id + ' fetchOrders requires a walletId parameter');
        }
        const walletId = params['walletId'];
        const request = {
            'walletId': walletId,
        };
        const response = await this.privateGetWalletsWalletIdOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'submitted': 'open', // order pending book entry
            'open': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
            'rejected': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const side = order['side'];
        const type = order['type'];
        const symbol = this.markets_by_id[order['instrument']]['symbol'];
        const timestamp = this.parse8601 (order['createdTime']);
        const amount = this.safeFloat (order, 'amount');
        const filled = this.safeFloat (order, 'amountFilled');
        const remaining = amount - filled;
        const fee = undefined;
        const price = this.safeFloat (order, 'price');
        const average = this.safeFloat (order, 'volumeWeightedAveragePrice');
        const cost = filled * average;
        return {
            'id': order['id'],
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': fee,
            // 'trades': this.parseTrades (order['trades'], market),
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        const walletIdInParams = ('walletId' in params);
        if (!walletIdInParams) {
            throw new ExchangeError (this.id + ' createOrder requires a walletId parameter');
        }
        amount = amount.toString ();
        price = price.toString ();
        const market = this.market (symbol);
        const request = {
            'side': side,
            'type': type,
            'currency': market['id'].replace (market['quote'], ''),
            'amount': amount,
            'display': amount,
            'price': price,
            'instrument': market['id'],
        };
        const response = await this.privatePostWalletsWalletIdOrders (this.extend (request, params));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const walletIdInParams = ('walletId' in params);
        if (!walletIdInParams) {
            throw new ExchangeError (this.id + ' fetchOrder requires a walletId parameter');
        }
        const request = {
            'id': id,
        };
        const response = await this.privateGetWalletsWalletIdOrdersId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const walletIdInParams = ('walletId' in params);
        if (!walletIdInParams) {
            throw new ExchangeError (this.id + ' cancelOrder requires a walletId parameter');
        }
        const request = {
            'id': id,
        };
        return await this.privateDeleteWalletsWalletIdOrdersId (this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET' && Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        if (method === 'POST' && Object.keys (query).length) {
            body = this.json (query);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const timestamp = nonce;
            const authBody = (method === 'POST') ? body : '';
            const auth = [ method, url, authBody, nonce, timestamp ];
            const message = nonce + this.json (auth).replace ('\\/', '/');
            const hash = this.hash (this.encode (message), 'sha256', 'binary');
            const binaryUrl = this.stringToBinary (this.encode (url));
            const binhash = this.binaryConcat (binaryUrl, hash);
            const signature = this.hmac (binhash, this.encode (this.secret), 'sha512', 'base64');
            headers = {
                'Authorization': this.apiKey + ':' + this.decode (signature),
                'Content-Type': 'application/json',
                'X-Auth-Timestamp': timestamp,
                'X-Auth-Nonce': nonce,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if ('code' in response) {
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    }
};
