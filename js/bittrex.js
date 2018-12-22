'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, AuthenticationError, InvalidOrder, InsufficientFunds, OrderNotFound, DDoSProtection, PermissionDenied, AddressPending } = require ('./base/errors');
const { TRUNCATE, DECIMAL_PLACES } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bittrex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bittrex',
            'name': 'Bittrex',
            'countries': [ 'US' ],
            'version': 'v1.1',
            'rateLimit': 1500,
            'certified': true,
            // new metainfo interface
            'has': {
                'CORS': true,
                'createMarketOrder': false,
                'fetchDepositAddress': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchTickers': true,
                'withdraw': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': false,
            },
            'timeframes': {
                '1m': 'oneMin',
                '5m': 'fiveMin',
                '30m': 'thirtyMin',
                '1h': 'hour',
                '1d': 'day',
            },
            'hostname': 'bittrex.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg',
                'api': {
                    'public': 'https://{hostname}/api',
                    'account': 'https://{hostname}/api',
                    'market': 'https://{hostname}/api',
                    'v2': 'https://{hostname}/api/v2.0/pub',
                },
                'www': 'https://bittrex.com',
                'doc': [
                    'https://bittrex.com/Home/Api',
                    'https://www.npmjs.org/package/node.bittrex.api',
                ],
                'fees': [
                    'https://bittrex.com/Fees',
                    'https://support.bittrex.com/hc/en-us/articles/115000199651-What-fees-does-Bittrex-charge-',
                ],
            },
            'api': {
                'v2': {
                    'get': [
                        'currencies/GetBTCPrice',
                        'market/GetTicks',
                        'market/GetLatestTick',
                        'Markets/GetMarketSummaries',
                        'market/GetLatestTick',
                    ],
                },
                'public': {
                    'get': [
                        'currencies',
                        'markethistory',
                        'markets',
                        'marketsummaries',
                        'marketsummary',
                        'orderbook',
                        'ticker',
                    ],
                },
                'account': {
                    'get': [
                        'balance',
                        'balances',
                        'depositaddress',
                        'deposithistory',
                        'order',
                        'orders',
                        'orderhistory',
                        'withdrawalhistory',
                        'withdraw',
                    ],
                },
                'market': {
                    'get': [
                        'buylimit',
                        'buymarket',
                        'cancel',
                        'openorders',
                        'selllimit',
                        'sellmarket',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.0025,
                    'taker': 0.0025,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BTC': 0.001,
                        'LTC': 0.01,
                        'DOGE': 2,
                        'VTC': 0.02,
                        'PPC': 0.02,
                        'FTC': 0.2,
                        'RDD': 2,
                        'NXT': 2,
                        'DASH': 0.002,
                        'POT': 0.002,
                    },
                    'deposit': {
                        'BTC': 0,
                        'LTC': 0,
                        'DOGE': 0,
                        'VTC': 0,
                        'PPC': 0,
                        'FTC': 0,
                        'RDD': 0,
                        'NXT': 0,
                        'DASH': 0,
                        'POT': 0,
                    },
                },
            },
            'exceptions': {
                // 'Call to Cancel was throttled. Try again in 60 seconds.': DDoSProtection,
                // 'Call to GetBalances was throttled. Try again in 60 seconds.': DDoSProtection,
                'APISIGN_NOT_PROVIDED': AuthenticationError,
                'INVALID_SIGNATURE': AuthenticationError,
                'INVALID_CURRENCY': ExchangeError,
                'INVALID_PERMISSION': AuthenticationError,
                'INSUFFICIENT_FUNDS': InsufficientFunds,
                'QUANTITY_NOT_PROVIDED': InvalidOrder,
                'MIN_TRADE_REQUIREMENT_NOT_MET': InvalidOrder,
                'ORDER_NOT_OPEN': OrderNotFound,
                'INVALID_ORDER': InvalidOrder,
                'UUID_INVALID': OrderNotFound,
                'RATE_NOT_PROVIDED': InvalidOrder, // createLimitBuyOrder ('ETH/BTC', 1, 0)
                'WHITELIST_VIOLATION_IP': PermissionDenied,
            },
            'options': {
                // price precision by quote currency code
                'pricePrecisionByCode': {
                    'USD': 3,
                },
                'parseOrderStatus': false,
                'hasAlreadyAuthenticatedSuccessfully': false, // a workaround for APIKEY_INVALID
                'symbolSeparator': '-',
            },
            'commonCurrencies': {
                'BITS': 'SWIFT',
                'CPC': 'CapriCoin',
            },
        });
    }

    costToPrecision (symbol, cost) {
        return this.decimalToPrecision (cost, TRUNCATE, this.markets[symbol]['precision']['price'], DECIMAL_PLACES);
    }

    feeToPrecision (symbol, fee) {
        return this.decimalToPrecision (fee, TRUNCATE, this.markets[symbol]['precision']['price'], DECIMAL_PLACES);
    }

    async fetchMarkets (params = {}) {
        // https://github.com/ccxt/ccxt/commit/866370ba6c9cabaf5995d992c15a82e38b8ca291
        // https://github.com/ccxt/ccxt/pull/4304
        const response = await this.publicGetMarkets ();
        const result = [];
        const markets = this.safeValue (response, 'result');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            let id = market['MarketName'];
            let baseId = market['MarketCurrency'];
            let quoteId = market['BaseCurrency'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let pricePrecision = 8;
            if (quote in this.options['pricePrecisionByCode'])
                pricePrecision = this.options['pricePrecisionByCode'][quote];
            let precision = {
                'amount': 8,
                'price': pricePrecision,
            };
            // bittrex uses boolean values, bleutrade uses strings
            let active = this.safeValue (market, 'IsActive', false);
            if ((active !== 'false') || active) {
                active = true;
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'info': market,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': market['MinTradeSize'],
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.accountGetBalances (params);
        let balances = response['result'];
        let result = { 'info': balances };
        let indexed = this.indexBy (balances, 'Currency');
        let keys = Object.keys (indexed);
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let currency = this.commonCurrencyCode (id);
            let account = this.account ();
            let balance = indexed[id];
            let free = parseFloat (balance['Available']);
            let total = parseFloat (balance['Balance']);
            let used = total - free;
            account['free'] = free;
            account['used'] = used;
            account['total'] = total;
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetOrderbook (this.extend ({
            'market': this.marketId (symbol),
            'type': 'both',
        }, params));
        let orderbook = response['result'];
        if ('type' in params) {
            if (params['type'] === 'buy') {
                orderbook = {
                    'buy': response['result'],
                    'sell': [],
                };
            } else if (params['type'] === 'sell') {
                orderbook = {
                    'buy': [],
                    'sell': response['result'],
                };
            }
        }
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell', 'Rate', 'Quantity');
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.safeString (ticker, 'TimeStamp');
        if (typeof timestamp === 'string') {
            if (timestamp.length > 0) {
                timestamp = this.parse8601 (timestamp);
            }
        }
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let previous = this.safeFloat (ticker, 'PrevDay');
        let last = this.safeFloat (ticker, 'Last');
        let change = undefined;
        let percentage = undefined;
        if (last !== undefined)
            if (previous !== undefined) {
                change = last - previous;
                if (previous > 0)
                    percentage = (change / previous) * 100;
            }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'High'),
            'low': this.safeFloat (ticker, 'Low'),
            'bid': this.safeFloat (ticker, 'Bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'Ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': previous,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'Volume'),
            'quoteVolume': this.safeFloat (ticker, 'BaseVolume'),
            'info': ticker,
        };
    }

    async fetchCurrencies (params = {}) {
        let response = await this.publicGetCurrencies (params);
        let currencies = response['result'];
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['Currency'];
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            let code = this.commonCurrencyCode (id);
            let precision = 8; // default precision, todo: fix "magic constants"
            let address = this.safeValue (currency, 'BaseAddress');
            result[code] = {
                'id': id,
                'code': code,
                'address': address,
                'info': currency,
                'type': currency['CoinType'],
                'name': currency['CurrencyLong'],
                'active': currency['IsActive'],
                'fee': this.safeFloat (currency, 'TxFee'), // todo: redesign
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': currency['TxFee'],
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarketsummaries (params);
        let tickers = response['result'];
        let result = {};
        for (let t = 0; t < tickers.length; t++) {
            let ticker = tickers[t];
            let id = ticker['MarketName'];
            let market = undefined;
            let symbol = id;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                symbol = this.parseSymbol (id);
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketsummary (this.extend ({
            'market': market['id'],
        }, params));
        let ticker = response['result'][0];
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['TimeStamp'] + '+00:00');
        let side = undefined;
        if (trade['OrderType'] === 'BUY') {
            side = 'buy';
        } else if (trade['OrderType'] === 'SELL') {
            side = 'sell';
        }
        let id = this.safeString2 (trade, 'Id', 'ID');
        let symbol = undefined;
        if (market !== undefined)
            symbol = market['symbol'];
        let cost = undefined;
        let price = this.safeFloat (trade, 'Price');
        let amount = this.safeFloat (trade, 'Quantity');
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarkethistory (this.extend ({
            'market': market['id'],
        }, params));
        if ('result' in response) {
            if (response['result'] !== undefined)
                return this.parseTrades (response['result'], market, since, limit);
        }
        throw new ExchangeError (this.id + ' fetchTrades() returned undefined response');
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        let timestamp = this.parse8601 (ohlcv['T'] + '+00:00');
        return [
            timestamp,
            ohlcv['O'],
            ohlcv['H'],
            ohlcv['L'],
            ohlcv['C'],
            ohlcv['V'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'tickInterval': this.timeframes[timeframe],
            'marketName': market['id'],
        };
        let response = await this.v2GetMarketGetTicks (this.extend (request, params));
        if ('result' in response) {
            if (response['result'])
                return this.parseOHLCVs (response['result'], market, timeframe, since, limit);
        }
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let response = await this.marketGetOpenorders (this.extend (request, params));
        let orders = this.parseOrders (response['result'], market, since, limit);
        return this.filterBySymbol (orders, symbol);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'marketGet' + this.capitalize (side) + type;
        let order = {
            'market': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
            'rate': this.priceToPrecision (symbol, price),
        };
        // if (type == 'limit')
        //     order['rate'] = this.priceToPrecision (symbol, price);
        let response = await this[method] (this.extend (order, params));
        let orderIdField = this.getOrderIdField ();
        let result = {
            'info': response,
            'id': response['result'][orderIdField],
            'symbol': symbol,
            'type': type,
            'side': side,
            'status': 'open',
        };
        return result;
    }

    getOrderIdField () {
        return 'uuid';
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let orderIdField = this.getOrderIdField ();
        let request = {};
        request[orderIdField] = id;
        let response = await this.marketGetCancel (this.extend (request, params));
        return this.extend (this.parseOrder (response), {
            'status': 'canceled',
        });
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // https://support.bittrex.com/hc/en-us/articles/115003723911
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        const response = await this.accountGetDeposithistory (this.extend (request, params));
        //
        //     { success:    true,
        //       message:   "",
        //        result: [ {            Id:  22578097,
        //                           Amount:  0.3,
        //                         Currency: "ETH",
        //                    Confirmations:  15,
        //                      LastUpdated: "2018-06-10T07:12:10.57",
        //                             TxId: "0xf50b5ba2ca5438b58f93516eaa523eaf35b4420ca0f24061003df1be7…",
        //                    CryptoAddress: "0xb25f281fa51f1635abd4a60b0870a62d2a7fa404"                    } ] }
        //
        // we cannot filter by `since` timestamp, as it isn't set by Bittrex
        // see https://github.com/ccxt/ccxt/issues/4067
        // return this.parseTransactions (response['result'], currency, since, limit);
        return this.parseTransactions (response['result'], currency, undefined, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // https://support.bittrex.com/hc/en-us/articles/115003723911
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        const response = await this.accountGetWithdrawalhistory (this.extend (request, params));
        //
        //     {
        //         "success" : true,
        //         "message" : "",
        //         "result" : [{
        //                 "PaymentUuid" : "b32c7a5c-90c6-4c6e-835c-e16df12708b1",
        //                 "Currency" : "BTC",
        //                 "Amount" : 17.00000000,
        //                 "Address" : "1DfaaFBdbB5nrHj87x3NHS4onvw1GPNyAu",
        //                 "Opened" : "2014-07-09T04:24:47.217",
        //                 "Authorized" : true,
        //                 "PendingPayment" : false,
        //                 "TxCost" : 0.00020000,
        //                 "TxId" : null,
        //                 "Canceled" : true,
        //                 "InvalidAddress" : false
        //             }, {
        //                 "PaymentUuid" : "d193da98-788c-4188-a8f9-8ec2c33fdfcf",
        //                 "Currency" : "XC",
        //                 "Amount" : 7513.75121715,
        //                 "Address" : "TcnSMgAd7EonF2Dgc4c9K14L12RBaW5S5J",
        //                 "Opened" : "2014-07-08T23:13:31.83",
        //                 "Authorized" : true,
        //                 "PendingPayment" : false,
        //                 "TxCost" : 0.00002000,
        //                 "TxId" : "d8a575c2a71c7e56d02ab8e26bb1ef0a2f6cf2094f6ca2116476a569c1e84f6e",
        //                 "Canceled" : false,
        //                 "InvalidAddress" : false
        //             }
        //         ]
        //     }
        //
        return this.parseTransactions (response['result'], currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //      {            Id:  72578097,
        //               Amount:  0.3,
        //             Currency: "ETH",
        //        Confirmations:  15,
        //          LastUpdated: "2018-06-17T07:12:14.57",
        //                 TxId: "0xb31b5ba2ca5438b58f93516eaa523eaf35b4420ca0f24061003df1be7…",
        //        CryptoAddress: "0x2d5f281fa51f1635abd4a60b0870a62d2a7fa404"                    }
        //
        // fetchWithdrawals
        //
        //     {
        //         "PaymentUuid" : "e293da98-788c-4188-a8f9-8ec2c33fdfcf",
        //         "Currency" : "XC",
        //         "Amount" : 7513.75121715,
        //         "Address" : "EVnSMgAd7EonF2Dgc4c9K14L12RBaW5S5J",
        //         "Opened" : "2014-07-08T23:13:31.83",
        //         "Authorized" : true,
        //         "PendingPayment" : false,
        //         "TxCost" : 0.00002000,
        //         "TxId" : "b4a575c2a71c7e56d02ab8e26bb1ef0a2f6cf2094f6ca2116476a569c1e84f6e",
        //         "Canceled" : false,
        //         "InvalidAddress" : false
        //     }
        //
        const id = this.safeString2 (transaction, 'Id', 'PaymentUuid');
        const amount = this.safeFloat (transaction, 'Amount');
        const address = this.safeString2 (transaction, 'CryptoAddress', 'Address');
        const txid = this.safeString (transaction, 'TxId');
        const updated = this.parse8601 (this.safeValue (transaction, 'LastUpdated'));
        const timestamp = this.parse8601 (this.safeString (transaction, 'Opened', updated));
        const type = (timestamp !== undefined) ? 'withdrawal' : 'deposit';
        let code = undefined;
        let currencyId = this.safeString (transaction, 'Currency');
        currency = this.safeValue (this.currencies_by_id, currencyId);
        if (currency !== undefined) {
            code = currency['code'];
        } else {
            code = this.commonCurrencyCode (currencyId);
        }
        let status = 'pending';
        if (type === 'deposit') {
            if (currency !== undefined) {
                // deposits numConfirmations never reach the minConfirmations number
                // we set all of them to 'ok', otherwise they'd all be 'pending'
                //
                //     const numConfirmations = this.safeInteger (transaction, 'Confirmations', 0);
                //     const minConfirmations = this.safeInteger (currency['info'], 'MinConfirmation');
                //     if (numConfirmations >= minConfirmations) {
                //         status = 'ok';
                //     }
                //
                status = 'ok';
            }
        } else {
            const authorized = this.safeValue (transaction, 'Authorized', false);
            const pendingPayment = this.safeValue (transaction, 'PendingPayment', false);
            const canceled = this.safeValue (transaction, 'Canceled', false);
            const invalidAddress = this.safeValue (transaction, 'InvalidAddress', false);
            if (invalidAddress) {
                status = 'failed';
            } else if (canceled) {
                status = 'canceled';
            } else if (pendingPayment) {
                status = 'pending';
            } else if (authorized && (txid !== undefined)) {
                status = 'ok';
            }
        }
        let feeCost = this.safeFloat (transaction, 'TxCost');
        if (feeCost === undefined) {
            if (type === 'deposit') {
                // according to https://support.bittrex.com/hc/en-us/articles/115000199651-What-fees-does-Bittrex-charge-
                feeCost = 0; // FIXME: remove hardcoded value that may change any time
            } else if (type === 'withdrawal') {
                throw new ExchangeError ('Withdrawal without fee detected!');
            }
        }
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': undefined,
            'status': status,
            'type': type,
            'updated': updated,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }

    parseSymbol (id) {
        let [ quote, base ] = id.split (this.options['symbolSeparator']);
        base = this.commonCurrencyCode (base);
        quote = this.commonCurrencyCode (quote);
        return base + '/' + quote;
    }

    parseOrder (order, market = undefined) {
        let side = this.safeString (order, 'OrderType');
        if (side === undefined)
            side = this.safeString (order, 'Type');
        let isBuyOrder = (side === 'LIMIT_BUY') || (side === 'BUY');
        let isSellOrder = (side === 'LIMIT_SELL') || (side === 'SELL');
        if (isBuyOrder) {
            side = 'buy';
        }
        if (isSellOrder) {
            side = 'sell';
        }
        // We parse different fields in a very specific order.
        // Order might well be closed and then canceled.
        let status = undefined;
        if (('Opened' in order) && order['Opened'])
            status = 'open';
        if (('Closed' in order) && order['Closed'])
            status = 'closed';
        if (('CancelInitiated' in order) && order['CancelInitiated'])
            status = 'canceled';
        if (('Status' in order) && this.options['parseOrderStatus'])
            status = this.parseOrderStatus (this.safeString (order, 'Status'));
        let symbol = undefined;
        if ('Exchange' in order) {
            let marketId = order['Exchange'];
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                symbol = this.parseSymbol (marketId);
            }
        } else {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        let timestamp = undefined;
        if ('Opened' in order)
            timestamp = this.parse8601 (order['Opened'] + '+00:00');
        if ('Created' in order)
            timestamp = this.parse8601 (order['Created'] + '+00:00');
        let lastTradeTimestamp = undefined;
        if (('TimeStamp' in order) && (order['TimeStamp'] !== undefined))
            lastTradeTimestamp = this.parse8601 (order['TimeStamp'] + '+00:00');
        if (('Closed' in order) && (order['Closed'] !== undefined))
            lastTradeTimestamp = this.parse8601 (order['Closed'] + '+00:00');
        if (timestamp === undefined)
            timestamp = lastTradeTimestamp;
        let fee = undefined;
        let commission = undefined;
        if ('Commission' in order) {
            commission = 'Commission';
        } else if ('CommissionPaid' in order) {
            commission = 'CommissionPaid';
        }
        if (commission) {
            fee = {
                'cost': parseFloat (order[commission]),
            };
            if (market !== undefined) {
                fee['currency'] = market['quote'];
            } else if (symbol !== undefined) {
                let currencyIds = symbol.split ('/');
                let quoteCurrencyId = currencyIds[1];
                if (quoteCurrencyId in this.currencies_by_id)
                    fee['currency'] = this.currencies_by_id[quoteCurrencyId]['code'];
                else
                    fee['currency'] = this.commonCurrencyCode (quoteCurrencyId);
            }
        }
        let price = this.safeFloat (order, 'Limit');
        let cost = this.safeFloat (order, 'Price');
        let amount = this.safeFloat (order, 'Quantity');
        let remaining = this.safeFloat (order, 'QuantityRemaining');
        let filled = undefined;
        if (amount !== undefined && remaining !== undefined) {
            filled = amount - remaining;
        }
        if (!cost) {
            if (price && filled)
                cost = price * filled;
        }
        if (!price) {
            if (cost && filled)
                price = cost / filled;
        }
        let average = this.safeFloat (order, 'PricePerUnit');
        let id = this.safeString (order, 'OrderUuid');
        if (id === undefined)
            id = this.safeString (order, 'OrderId');
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            let orderIdField = this.getOrderIdField ();
            let request = {};
            request[orderIdField] = id;
            response = await this.accountGetOrder (this.extend (request, params));
        } catch (e) {
            if (this.last_json_response) {
                let message = this.safeString (this.last_json_response, 'message');
                if (message === 'UUID_INVALID')
                    throw new OrderNotFound (this.id + ' fetchOrder() error: ' + this.last_http_response);
            }
            throw e;
        }
        if (!response['result']) {
            throw new OrderNotFound (this.id + ' order ' + id + ' not found');
        }
        return this.parseOrder (response['result']);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let response = await this.accountGetOrderhistory (this.extend (request, params));
        let orders = this.parseOrders (response['result'], market, since, limit);
        if (symbol !== undefined)
            return this.filterBySymbol (orders, symbol);
        return orders;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.accountGetDepositaddress (this.extend ({
            'currency': currency['id'],
        }, params));
        let address = this.safeString (response['result'], 'Address');
        let message = this.safeString (response, 'message');
        if (!address || message === 'ADDRESS_GENERATING')
            throw new AddressPending (this.id + ' the address for ' + code + ' is being generated (pending, not ready yet, retry again later)');
        let tag = undefined;
        if ((code === 'XRP') || (code === 'XLM') || (code === 'LSK')) {
            tag = address;
            address = currency['address'];
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'currency': currency['id'],
            'quantity': amount,
            'address': address,
        };
        if (tag)
            request['paymentid'] = tag;
        let response = await this.accountGetWithdraw (this.extend (request, params));
        let id = undefined;
        if ('result' in response) {
            if ('uuid' in response['result'])
                id = response['result']['uuid'];
        }
        return {
            'info': response,
            'id': id,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeParams (this.urls['api'][api], {
            'hostname': this.hostname,
        }) + '/';
        if (api !== 'v2')
            url += this.version + '/';
        if (api === 'public') {
            url += api + '/' + method.toLowerCase () + path;
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else if (api === 'v2') {
            url += path;
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            this.checkRequiredCredentials ();
            url += api + '/';
            if (((api === 'account') && (path !== 'withdraw')) || (path === 'openorders'))
                url += method.toLowerCase ();
            const request = {
                'apikey': this.apiKey,
            };
            const disableNonce = this.safeValue (this.options, 'disableNonce');
            if ((disableNonce === undefined) || !disableNonce) {
                request['nonce'] = this.nonce ();
            }
            url += path + '?' + this.urlencode (this.extend (request, params));
            let signature = this.hmac (this.encode (url), this.encode (this.secret), 'sha512');
            headers = { 'apisign': signature };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (body[0] === '{') {
            // { success: false, message: "message" }
            let success = this.safeValue (response, 'success');
            if (success === undefined)
                throw new ExchangeError (this.id + ': malformed response: ' + this.json (response));
            if (typeof success === 'string') {
                // bleutrade uses string instead of boolean
                success = (success === 'true') ? true : false;
            }
            if (!success) {
                const message = this.safeString (response, 'message');
                const feedback = this.id + ' ' + this.json (response);
                const exceptions = this.exceptions;
                if (message === 'APIKEY_INVALID') {
                    if (this.options['hasAlreadyAuthenticatedSuccessfully']) {
                        throw new DDoSProtection (feedback);
                    } else {
                        throw new AuthenticationError (feedback);
                    }
                }
                if (message === 'DUST_TRADE_DISALLOWED_MIN_VALUE_50K_SAT')
                    throw new InvalidOrder (this.id + ' order cost should be over 50k satoshi ' + this.json (response));
                if (message === 'INVALID_ORDER') {
                    // Bittrex will return an ambiguous INVALID_ORDER message
                    // upon canceling already-canceled and closed orders
                    // therefore this special case for cancelOrder
                    // let url = 'https://bittrex.com/api/v1.1/market/cancel?apikey=API_KEY&uuid=ORDER_UUID'
                    let cancel = 'cancel';
                    let indexOfCancel = url.indexOf (cancel);
                    if (indexOfCancel >= 0) {
                        let parts = url.split ('&');
                        let orderId = undefined;
                        for (let i = 0; i < parts.length; i++) {
                            let part = parts[i];
                            let keyValue = part.split ('=');
                            if (keyValue[0] === 'uuid') {
                                orderId = keyValue[1];
                                break;
                            }
                        }
                        if (orderId !== undefined)
                            throw new OrderNotFound (this.id + ' cancelOrder ' + orderId + ' ' + this.json (response));
                        else
                            throw new OrderNotFound (this.id + ' cancelOrder ' + this.json (response));
                    }
                }
                if (message in exceptions)
                    throw new exceptions[message] (feedback);
                if (message !== undefined) {
                    if (message.indexOf ('throttled. Try again') >= 0)
                        throw new DDoSProtection (feedback);
                    if (message.indexOf ('problem') >= 0)
                        throw new ExchangeNotAvailable (feedback); // 'There was a problem processing your request.  If this problem persists, please contact...')
                }
                throw new ExchangeError (feedback);
            }
        }
    }

    appendTimezoneParse8601 (x) {
        let length = x.length;
        let lastSymbol = x[length - 1];
        if ((lastSymbol === 'Z') || (x.indexOf ('+') >= 0)) {
            return this.parse8601 (x);
        }
        return this.parse8601 (x + 'Z');
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        // a workaround for APIKEY_INVALID
        if ((api === 'account') || (api === 'market'))
            this.options['hasAlreadyAuthenticatedSuccessfully'] = true;
        return response;
    }
};
