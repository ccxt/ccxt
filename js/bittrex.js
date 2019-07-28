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
                'fetchMyTrades': 'emulated',
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
                    'v3': 'https://api.bittrex.com/v3',
                    'v3public': 'https://api.bittrex.com/v3',
                },
                'www': 'https://bittrex.com',
                'doc': [
                    'https://bittrex.github.io/api/',
                    'https://bittrex.github.io/api/v3',
                    'https://www.npmjs.com/package/bittrex-node',
                ],
                'fees': [
                    'https://bittrex.zendesk.com/hc/en-us/articles/115003684371-BITTREX-SERVICE-FEES-AND-WITHDRAWAL-LIMITATIONS',
                    'https://bittrex.zendesk.com/hc/en-us/articles/115000199651-What-fees-does-Bittrex-charge-',
                ],
            },
            'api': {
                'v3': {
                    'get': [
                        'account',
                        'addresses',
                        'addresses/{currencySymbol}',
                        'balances',
                        'balances/{currencySymbol}',
                        'currencies',
                        'currencies/{symbol}',
                        'deposits/open',
                        'deposits/closed',
                        'deposits/ByTxId/{txId}',
                        'deposits/{depositId}',
                        'orders/closed',
                        'orders/open',
                        'orders/{orderId}',
                        'ping',
                        'subaccounts/{subaccountId}',
                        'subaccounts',
                        'withdrawals/open',
                        'withdrawals/closed',
                        'withdrawals/ByTxId/{txId}',
                        'withdrawals/{withdrawalId}',
                    ],
                    'post': [
                        'addresses',
                        'orders',
                        'subaccounts',
                        'withdrawals',
                    ],
                    'delete': [
                        'orders/{orderId}',
                        'withdrawals/{withdrawalId}',
                    ],
                },
                'v3public': {
                    'get': [
                        'markets',
                        'markets/summaries',
                        'markets/{marketSymbol}',
                        'markets/{marketSymbol}/summary',
                        'markets/{marketSymbol}/orderbook',
                        'markets/{marketSymbol}/trades',
                        'markets/{marketSymbol}/ticker',
                        'markets/{marketSymbol}/candles',
                    ],
                },
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
                        'BTC': 0.0005,
                        'LTC': 0.01,
                        'DOGE': 2,
                        'VTC': 0.02,
                        'PPC': 0.02,
                        'FTC': 0.2,
                        'RDD': 2,
                        'NXT': 2,
                        'DASH': 0.05,
                        'POT': 0.002,
                        'BLK': 0.02,
                        'EMC2': 0.2,
                        'XMY': 0.2,
                        'GLD': 0.0002,
                        'SLR': 0.2,
                        'GRS': 0.2,
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
                        'BLK': 0,
                        'EMC2': 0,
                        'XMY': 0,
                        'GLD': 0,
                        'SLR': 0,
                        'GRS': 0,
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
                'DUST_TRADE_DISALLOWED_MIN_VALUE': InvalidOrder,
            },
            'options': {
                // price precision by quote currency code
                'pricePrecisionByCode': {
                    'USD': 3,
                },
                'parseOrderStatus': false,
                'hasAlreadyAuthenticatedSuccessfully': false, // a workaround for APIKEY_INVALID
                'symbolSeparator': '-',
                // With certain currencies, like
                // AEON, BTS, GXS, NXT, SBD, STEEM, STR, XEM, XLM, XMR, XRP
                // an additional tag / memo / payment id is usually required by exchanges.
                // With Bittrex some currencies imply the "base address + tag" logic.
                // The base address for depositing is stored on this.currencies[code]
                // The base address identifies the exchange as the recipient
                // while the tag identifies the user account within the exchange
                // and the tag is retrieved with fetchDepositAddress.
                'tag': {
                    'NXT': true, // NXT, BURST
                    'CRYPTO_NOTE_PAYMENTID': true, // AEON, XMR
                    'BITSHAREX': true, // BTS
                    'RIPPLE': true, // XRP
                    'NEM': true, // XEM
                    'STELLAR': true, // XLM
                    'STEEM': true, // SBD, GOLOS
                    // https://github.com/ccxt/ccxt/issues/4794
                    // 'LISK': true, // LSK
                },
                'subaccountId': undefined,
                // see the implementation of fetchClosedOrdersV3 below
                'fetchClosedOrdersMethod': 'fetch_closed_orders_v3',
                'fetchClosedOrdersFilterBySince': true,
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
        const response = await this.publicGetMarkets (params);
        const result = [];
        const markets = this.safeValue (response, 'result');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'MarketName');
            const baseId = this.safeString (market, 'MarketCurrency');
            const quoteId = this.safeString (market, 'BaseCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            let pricePrecision = 8;
            if (quote in this.options['pricePrecisionByCode']) {
                pricePrecision = this.options['pricePrecisionByCode'][quote];
            }
            const precision = {
                'amount': 8,
                'price': pricePrecision,
            };
            // bittrex uses boolean values, bleutrade uses strings
            let active = this.safeValue (market, 'IsActive', false);
            if ((active !== 'false') && active) {
                active = true;
            } else {
                active = false;
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
                        'min': this.safeFloat (market, 'MinTradeSize'),
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
        const response = await this.accountGetBalances (params);
        const balances = this.safeValue (response, 'result');
        const result = { 'info': balances };
        const indexed = this.indexBy (balances, 'Currency');
        const currencyIds = Object.keys (indexed);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const balance = indexed[currencyId];
            account['free'] = this.safeFloat (balance, 'Available');
            account['total'] = this.safeFloat (balance, 'Balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
            'type': 'both',
        };
        const response = await this.publicGetOrderbook (this.extend (request, params));
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
        const timestamp = this.parse8601 (this.safeString (ticker, 'TimeStamp'));
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const previous = this.safeFloat (ticker, 'PrevDay');
        const last = this.safeFloat (ticker, 'Last');
        let change = undefined;
        let percentage = undefined;
        if (last !== undefined) {
            if (previous !== undefined) {
                change = last - previous;
                if (previous > 0) {
                    percentage = (change / previous) * 100;
                }
            }
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
        const response = await this.publicGetCurrencies (params);
        //
        //     {
        //         "success": true,
        //         "message": "",
        //         "result": [
        //             {
        //                 "Currency": "BTC",
        //                 "CurrencyLong":"Bitcoin",
        //                 "MinConfirmation":2,
        //                 "TxFee":0.00050000,
        //                 "IsActive":true,
        //                 "IsRestricted":false,
        //                 "CoinType":"BITCOIN",
        //                 "BaseAddress":"1N52wHoVR79PMDishab2XmRHsbekCdGquK",
        //                 "Notice":null
        //             },
        //             ...,
        //         ]
        //     }
        //
        const currencies = this.safeValue (response, 'result', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'Currency');
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            const code = this.safeCurrencyCode (id);
            const precision = 8; // default precision, todo: fix "magic constants"
            const address = this.safeValue (currency, 'BaseAddress');
            const fee = this.safeFloat (currency, 'TxFee'); // todo: redesign
            result[code] = {
                'id': id,
                'code': code,
                'address': address,
                'info': currency,
                'type': currency['CoinType'],
                'name': currency['CurrencyLong'],
                'active': currency['IsActive'],
                'fee': fee,
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
                        'min': fee,
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetMarketsummaries (params);
        const tickers = this.safeValue (response, 'result');
        const result = {};
        for (let t = 0; t < tickers.length; t++) {
            const ticker = tickers[t];
            const marketId = this.safeString (ticker, 'MarketName');
            let market = undefined;
            let symbol = marketId;
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                symbol = this.parseSymbol (marketId);
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetMarketsummary (this.extend (request, params));
        const ticker = response['result'][0];
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parse8601 (trade['TimeStamp'] + '+00:00');
        let side = undefined;
        if (trade['OrderType'] === 'BUY') {
            side = 'buy';
        } else if (trade['OrderType'] === 'SELL') {
            side = 'sell';
        }
        const id = this.safeString2 (trade, 'Id', 'ID');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let cost = undefined;
        const price = this.safeFloat (trade, 'Price');
        const amount = this.safeFloat (trade, 'Quantity');
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': 'limit',
            'takerOrMaker': undefined,
            'side': side,
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
            'market': market['id'],
        };
        const response = await this.publicGetMarkethistory (this.extend (request, params));
        if ('result' in response) {
            if (response['result'] !== undefined) {
                return this.parseTrades (response['result'], market, since, limit);
            }
        }
        throw new ExchangeError (this.id + ' fetchTrades() returned undefined response');
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        const timestamp = this.parse8601 (ohlcv['T'] + '+00:00');
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
        const market = this.market (symbol);
        const request = {
            'tickInterval': this.timeframes[timeframe],
            'marketName': market['id'],
        };
        const response = await this.v2GetMarketGetTicks (this.extend (request, params));
        if ('result' in response) {
            if (response['result']) {
                return this.parseOHLCVs (response['result'], market, timeframe, since, limit);
            }
        }
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.marketGetOpenorders (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        const orders = this.parseOrders (result, market, since, limit);
        return this.filterBySymbol (orders, symbol);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = 'marketGet' + this.capitalize (side) + type;
        const request = {
            'market': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
            'rate': this.priceToPrecision (symbol, price),
        };
        // if (type == 'limit')
        //     order['rate'] = this.priceToPrecision (symbol, price);
        const response = await this[method] (this.extend (request, params));
        const orderIdField = this.getOrderIdField ();
        const orderId = this.safeString (response['result'], orderIdField);
        return {
            'info': response,
            'id': orderId,
            'symbol': symbol,
            'type': type,
            'side': side,
            'status': 'open',
        };
    }

    getOrderIdField () {
        return 'uuid';
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const orderIdField = this.getOrderIdField ();
        const request = {};
        request[orderIdField] = id;
        const response = await this.marketGetCancel (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "message": "''",
        //         "result": {
        //             "uuid": "614c34e4-8d71-11e3-94b5-425861b86ab6"
        //         }
        //     }
        //
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
        //     {
        //         Id:  72578097,
        //         Amount:  0.3,
        //         Currency: "ETH",
        //         Confirmations:  15,
        //         LastUpdated: "2018-06-17T07:12:14.57",
        //         TxId: "0xb31b5ba2ca5438b58f93516eaa523eaf35b4420ca0f24061003df1be7…",
        //         CryptoAddress: "0x2d5f281fa51f1635abd4a60b0870a62d2a7fa404"
        //     }
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
        const updated = this.parse8601 (this.safeString (transaction, 'LastUpdated'));
        const opened = this.parse8601 (this.safeString (transaction, 'Opened'));
        const timestamp = opened ? opened : updated;
        const type = (opened === undefined) ? 'deposit' : 'withdrawal';
        const currencyId = this.safeString (transaction, 'Currency');
        const code = this.safeCurrencyCode (currencyId, currency);
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
        const [ quoteId, baseId ] = id.split (this.options['symbolSeparator']);
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        return base + '/' + quote;
    }

    parseOrder (order, market = undefined) {
        if ('marketSymbol' in order) {
            return this.parseOrderV3 (order, market);
        } else {
            return this.parseOrderV2 (order, market);
        }
    }

    parseOrders (orders, market = undefined, since = undefined, limit = undefined, params = {}) {
        if (this.options['fetchClosedOrdersFilterBySince']) {
            return super.parseOrders (orders, market, since, limit, params);
        } else {
            return super.parseOrders (orders, market, undefined, limit, params);
        }
    }

    parseOrderStatus (status) {
        const statuses = {
            'CLOSED': 'closed',
            'OPEN': 'open',
            'CANCELLED': 'canceled',
            'CANCELED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderV3 (order, market = undefined) {
        //
        //     {
        //         id: '1be35109-b763-44ce-b6ea-05b6b0735c0c',
        //         marketSymbol: 'LTC-ETH',
        //         direction: 'BUY',
        //         type: 'LIMIT',
        //         quantity: '0.50000000',
        //         limit: '0.17846699',
        //         timeInForce: 'GOOD_TIL_CANCELLED',
        //         fillQuantity: '0.50000000',
        //         commission: '0.00022286',
        //         proceeds: '0.08914915',
        //         status: 'CLOSED',
        //         createdAt: '2018-06-23T13:14:28.613Z',
        //         updatedAt: '2018-06-23T13:14:30.19Z',
        //         closedAt: '2018-06-23T13:14:30.19Z'
        //     }
        //
        const marketSymbol = this.safeString (order, 'marketSymbol');
        let symbol = undefined;
        let feeCurrency = undefined;
        if (marketSymbol !== undefined) {
            const [ baseId, quoteId ] = marketSymbol.split ('-');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            symbol = base + '/' + quote;
            feeCurrency = quote;
        }
        const direction = this.safeString (order, 'direction');
        const createdAt = this.safeString (order, 'createdAt');
        const updatedAt = this.safeString (order, 'updatedAt');
        const closedAt = this.safeString (order, 'closedAt');
        let lastTradeTimestamp = undefined;
        if (closedAt !== undefined) {
            lastTradeTimestamp = this.parse8601 (closedAt);
        } else if (updatedAt) {
            lastTradeTimestamp = this.parse8601 (updatedAt);
        }
        const timestamp = this.parse8601 (createdAt);
        const type = this.safeString (order, 'type');
        const quantity = this.safeFloat (order, 'quantity');
        const limit = this.safeFloat (order, 'limit');
        const fillQuantity = this.safeFloat (order, 'fillQuantity');
        const commission = this.safeFloat (order, 'commission');
        const proceeds = this.safeFloat (order, 'proceeds');
        const status = this.safeString (order, 'status');
        let average = undefined;
        let remaining = undefined;
        if (fillQuantity !== undefined) {
            if (proceeds !== undefined) {
                if (fillQuantity > 0) {
                    average = proceeds / fillQuantity;
                } else if (proceeds === 0) {
                    average = 0;
                }
            }
            if (quantity !== undefined) {
                remaining = quantity - fillQuantity;
            }
        }
        return {
            'id': this.safeString (order, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type.toLowerCase (),
            'side': direction.toLowerCase (),
            'price': limit,
            'cost': proceeds,
            'average': average,
            'amount': quantity,
            'filled': fillQuantity,
            'remaining': remaining,
            'status': status.toLowerCase (),
            'fee': {
                'cost': commission,
                'currency': feeCurrency,
            },
            'info': order,
        };
    }

    parseOrderV2 (order, market = undefined) {
        //
        //     {
        //         "Uuid": "string (uuid)",
        //         "OrderUuid": "8925d746-bc9f-4684-b1aa-e507467aaa99",
        //         "Exchange": "BTC-LTC",
        //         "OrderType": "string",
        //         "Quantity": 100000,
        //         "QuantityRemaining": 100000,
        //         "Limit": 1e-8,
        //         "CommissionPaid": 0,
        //         "Price": 0,
        //         "PricePerUnit": null,
        //         "Opened": "2014-07-09T03:55:48.583",
        //         "Closed": null,
        //         "CancelInitiated": "boolean",
        //         "ImmediateOrCancel": "boolean",
        //         "IsConditional": "boolean"
        //     }
        //
        let side = this.safeString2 (order, 'OrderType', 'Type');
        const isBuyOrder = (side === 'LIMIT_BUY') || (side === 'BUY');
        const isSellOrder = (side === 'LIMIT_SELL') || (side === 'SELL');
        if (isBuyOrder) {
            side = 'buy';
        }
        if (isSellOrder) {
            side = 'sell';
        }
        // We parse different fields in a very specific order.
        // Order might well be closed and then canceled.
        let status = undefined;
        if (('Opened' in order) && order['Opened']) {
            status = 'open';
        }
        if (('Closed' in order) && order['Closed']) {
            status = 'closed';
        }
        if (('CancelInitiated' in order) && order['CancelInitiated']) {
            status = 'canceled';
        }
        if (('Status' in order) && this.options['parseOrderStatus']) {
            status = this.parseOrderStatus (this.safeString (order, 'Status'));
        }
        let symbol = undefined;
        if ('Exchange' in order) {
            const marketId = this.safeString (order, 'Exchange');
            if (marketId !== undefined) {
                if (marketId in this.markets_by_id) {
                    market = this.markets_by_id[marketId];
                    symbol = market['symbol'];
                } else {
                    symbol = this.parseSymbol (marketId);
                }
            }
        } else {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        let timestamp = undefined;
        const opened = this.safeString (order, 'Opened');
        if (opened !== undefined) {
            timestamp = this.parse8601 (opened + '+00:00');
        }
        const created = this.safeString (order, 'Created');
        if (created !== undefined) {
            timestamp = this.parse8601 (created + '+00:00');
        }
        let lastTradeTimestamp = undefined;
        const lastTimestamp = this.safeString (order, 'TimeStamp');
        if (lastTimestamp !== undefined) {
            lastTradeTimestamp = this.parse8601 (lastTimestamp + '+00:00');
        }
        const closed = this.safeString (order, 'Closed');
        if (closed !== undefined) {
            lastTradeTimestamp = this.parse8601 (closed + '+00:00');
        }
        if (timestamp === undefined) {
            timestamp = lastTradeTimestamp;
        }
        let fee = undefined;
        const feeCost = this.safeFloat2 (order, 'Commission', 'CommissionPaid');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
            };
            if (market !== undefined) {
                fee['currency'] = market['quote'];
            } else if (symbol !== undefined) {
                const currencyIds = symbol.split ('/');
                const quoteCurrencyId = currencyIds[1];
                fee['currency'] = this.safeCurrencyCode (quoteCurrencyId);
            }
        }
        let price = this.safeFloat (order, 'Limit');
        let cost = this.safeFloat (order, 'Price');
        const amount = this.safeFloat (order, 'Quantity');
        const remaining = this.safeFloat (order, 'QuantityRemaining');
        let filled = undefined;
        if (amount !== undefined && remaining !== undefined) {
            filled = amount - remaining;
            if ((status === 'closed') && (remaining > 0)) {
                status = 'canceled';
            }
        }
        if (!cost) {
            if (price && filled) {
                cost = price * filled;
            }
        }
        if (!price) {
            if (cost && filled) {
                price = cost / filled;
            }
        }
        const average = this.safeFloat (order, 'PricePerUnit');
        const id = this.safeString2 (order, 'OrderUuid', 'OrderId');
        return {
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
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            const orderIdField = this.getOrderIdField ();
            const request = {};
            request[orderIdField] = id;
            response = await this.accountGetOrder (this.extend (request, params));
        } catch (e) {
            if (this.last_json_response) {
                const message = this.safeString (this.last_json_response, 'message');
                if (message === 'UUID_INVALID') {
                    throw new OrderNotFound (this.id + ' fetchOrder() error: ' + this.last_http_response);
                }
            }
            throw e;
        }
        if (!response['result']) {
            throw new OrderNotFound (this.id + ' order ' + id + ' not found');
        }
        return this.parseOrder (response['result']);
    }

    orderToTrade (order) {
        // this entire method should be moved to the base class
        const timestamp = this.safeInteger2 (order, 'lastTradeTimestamp', 'timestamp');
        return {
            'id': this.safeString (order, 'id'),
            'side': this.safeString (order, 'side'),
            'order': this.safeString (order, 'id'),
            'price': this.safeFloat (order, 'average'),
            'amount': this.safeFloat (order, 'filled'),
            'cost': this.safeFloat (order, 'cost'),
            'symbol': this.safeString (order, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': this.safeValue (order, 'fee'),
            'info': order,
        };
    }

    ordersToTrades (orders) {
        // this entire method should be moved to the base class
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            result.push (this.orderToTrade (orders[i]));
        }
        return result;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchClosedOrders (symbol, since, limit, params);
        return this.ordersToTrades (orders);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const method = this.safeString (this.options, 'fetchClosedOrdersMethod', 'fetch_closed_orders_v3');
        return await this[method] (symbol, since, limit, params);
    }

    async fetchClosedOrdersV2 (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.accountGetOrderhistory (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        const orders = this.parseOrders (result, market, since, limit);
        if (symbol !== undefined) {
            return this.filterBySymbol (orders, symbol);
        }
        return orders;
    }

    async fetchClosedOrdersV3 (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        if (since !== undefined) {
            request['startDate'] = this.ymdhms (since, 'T') + 'Z';
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            // because of this line we will have to rethink the entire v3
            // in other words, markets define all the rest of the API
            // and v3 market ids are reversed in comparison to v2
            // v3 has to be a completely separate implementation
            // otherwise we will have to shuffle symbols and currencies everywhere
            // which is prone to errors, as was shown here
            // https://github.com/ccxt/ccxt/pull/5219#issuecomment-499646209
            request['marketSymbol'] = market['base'] + '-' + market['quote'];
        }
        const response = await this.v3GetOrdersClosed (this.extend (request, params));
        const orders = this.parseOrders (response, market, since, limit);
        if (symbol !== undefined) {
            return this.filterBySymbol (orders, symbol);
        }
        return orders;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.accountGetDepositaddress (this.extend (request, params));
        //
        //     { "success": false, "message": "ADDRESS_GENERATING", "result": null }
        //
        //     { success:    true,
        //       message:   "",
        //        result: { Currency: "INCNT",
        //                   Address: "3PHvQt9bK21f7eVQVdJzrNPcsMzXabEA5Ha" } } }
        //
        let address = this.safeString (response['result'], 'Address');
        const message = this.safeString (response, 'message');
        if (!address || message === 'ADDRESS_GENERATING') {
            throw new AddressPending (this.id + ' the address for ' + code + ' is being generated (pending, not ready yet, retry again later)');
        }
        let tag = undefined;
        if (currency['type'] in this.options['tag']) {
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
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'quantity': amount,
            'address': address,
        };
        if (tag !== undefined) {
            request['paymentid'] = tag;
        }
        const response = await this.accountGetWithdraw (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        const id = this.safeString (result, 'uuid');
        return {
            'info': response,
            'id': id,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeParams (this.urls['api'][api], {
            'hostname': this.hostname,
        }) + '/';
        if (api !== 'v2' && api !== 'v3' && api !== 'v3public') {
            url += this.version + '/';
        }
        if (api === 'public') {
            url += api + '/' + method.toLowerCase () + path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else if (api === 'v3public') {
            url += path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else if (api === 'v2') {
            url += path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else if (api === 'v3') {
            url += path;
            if (Object.keys (params).length) {
                url += '?' + this.rawencode (params);
            }
            const contentHash = this.hash (this.encode (''), 'sha512', 'hex');
            const timestamp = this.milliseconds ().toString ();
            let auth = timestamp + url + method + contentHash;
            const subaccountId = this.safeValue (this.options, 'subaccountId');
            if (subaccountId !== undefined) {
                auth += subaccountId;
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha512');
            headers = {
                'Api-Key': this.apiKey,
                'Api-Timestamp': timestamp,
                'Api-Content-Hash': contentHash,
                'Api-Signature': signature,
            };
            if (subaccountId !== undefined) {
                headers['Api-Subaccount-Id'] = subaccountId;
            }
        } else {
            this.checkRequiredCredentials ();
            url += api + '/';
            if (((api === 'account') && (path !== 'withdraw')) || (path === 'openorders')) {
                url += method.toLowerCase ();
            }
            const request = {
                'apikey': this.apiKey,
            };
            const disableNonce = this.safeValue (this.options, 'disableNonce');
            if ((disableNonce === undefined) || !disableNonce) {
                request['nonce'] = this.nonce ();
            }
            url += path + '?' + this.urlencode (this.extend (request, params));
            const signature = this.hmac (this.encode (url), this.encode (this.secret), 'sha512');
            headers = { 'apisign': signature };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     { success: false, message: "message" }
        //
        if (body[0] === '{') {
            let success = this.safeValue (response, 'success');
            if (success === undefined) {
                throw new ExchangeError (this.id + ': malformed response: ' + this.json (response));
            }
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
                // https://github.com/ccxt/ccxt/issues/4932
                // the following two lines are now redundant, see line 171 in describe()
                //
                //     if (message === 'DUST_TRADE_DISALLOWED_MIN_VALUE_50K_SAT')
                //         throw new InvalidOrder (this.id + ' order cost should be over 50k satoshi ' + this.json (response));
                //
                if (message === 'INVALID_ORDER') {
                    // Bittrex will return an ambiguous INVALID_ORDER message
                    // upon canceling already-canceled and closed orders
                    // therefore this special case for cancelOrder
                    // let url = 'https://bittrex.com/api/v1.1/market/cancel?apikey=API_KEY&uuid=ORDER_UUID'
                    const cancel = 'cancel';
                    const indexOfCancel = url.indexOf (cancel);
                    if (indexOfCancel >= 0) {
                        const urlParts = url.split ('?');
                        const numParts = urlParts.length;
                        if (numParts > 1) {
                            const query = urlParts[1];
                            const params = query.split ('&');
                            const numParams = params.length;
                            let orderId = undefined;
                            for (let i = 0; i < numParams; i++) {
                                const param = params[i];
                                const keyValue = param.split ('=');
                                if (keyValue[0] === 'uuid') {
                                    orderId = keyValue[1];
                                    break;
                                }
                            }
                            if (orderId !== undefined) {
                                throw new OrderNotFound (this.id + ' cancelOrder ' + orderId + ' ' + this.json (response));
                            } else {
                                throw new OrderNotFound (this.id + ' cancelOrder ' + this.json (response));
                            }
                        }
                    }
                }
                if (message in exceptions) {
                    throw new exceptions[message] (feedback);
                }
                if (message !== undefined) {
                    if (message.indexOf ('throttled. Try again') >= 0) {
                        throw new DDoSProtection (feedback);
                    }
                    if (message.indexOf ('problem') >= 0) {
                        throw new ExchangeNotAvailable (feedback); // 'There was a problem processing your request.  If this problem persists, please contact...')
                    }
                }
                throw new ExchangeError (feedback);
            }
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        // a workaround for APIKEY_INVALID
        if ((api === 'account') || (api === 'market')) {
            this.options['hasAlreadyAuthenticatedSuccessfully'] = true;
        }
        return response;
    }
};
