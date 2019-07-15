'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { AuthenticationError, BadRequest, DDoSProtection, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, OrderNotFound, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitmex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitmex',
            'name': 'BitMEX',
            'countries': [ 'SC' ], // Seychelles
            'version': 'v1',
            'userAgent': undefined,
            'rateLimit': 2000,
            'has': {
                'CORS': false,
                'fetchOHLCV': true,
                'withdraw': true,
                'editOrder': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchLedger': true,
                'fetchTransactions': 'emulated',
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'test': 'https://testnet.bitmex.com',
                'logo': 'https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg',
                'api': 'https://www.bitmex.com',
                'www': 'https://www.bitmex.com',
                'doc': [
                    'https://www.bitmex.com/app/apiOverview',
                    'https://github.com/BitMEX/api-connectors/tree/master/official-http',
                ],
                'fees': 'https://www.bitmex.com/app/fees',
                'referral': 'https://www.bitmex.com/register/rm3C16',
            },
            'api': {
                'public': {
                    'get': [
                        'announcement',
                        'announcement/urgent',
                        'funding',
                        'instrument',
                        'instrument/active',
                        'instrument/activeAndIndices',
                        'instrument/activeIntervals',
                        'instrument/compositeIndex',
                        'instrument/indices',
                        'insurance',
                        'leaderboard',
                        'liquidation',
                        'orderBook',
                        'orderBook/L2',
                        'quote',
                        'quote/bucketed',
                        'schema',
                        'schema/websocketHelp',
                        'settlement',
                        'stats',
                        'stats/history',
                        'trade',
                        'trade/bucketed',
                    ],
                },
                'private': {
                    'get': [
                        'apiKey',
                        'chat',
                        'chat/channels',
                        'chat/connected',
                        'execution',
                        'execution/tradeHistory',
                        'notification',
                        'order',
                        'position',
                        'user',
                        'user/affiliateStatus',
                        'user/checkReferralCode',
                        'user/commission',
                        'user/depositAddress',
                        'user/margin',
                        'user/minWithdrawalFee',
                        'user/wallet',
                        'user/walletHistory',
                        'user/walletSummary',
                    ],
                    'post': [
                        'apiKey',
                        'apiKey/disable',
                        'apiKey/enable',
                        'chat',
                        'order',
                        'order/bulk',
                        'order/cancelAllAfter',
                        'order/closePosition',
                        'position/isolate',
                        'position/leverage',
                        'position/riskLimit',
                        'position/transferMargin',
                        'user/cancelWithdrawal',
                        'user/confirmEmail',
                        'user/confirmEnableTFA',
                        'user/confirmWithdrawal',
                        'user/disableTFA',
                        'user/logout',
                        'user/logoutAll',
                        'user/preferences',
                        'user/requestEnableTFA',
                        'user/requestWithdrawal',
                    ],
                    'put': [
                        'order',
                        'order/bulk',
                        'user',
                    ],
                    'delete': [
                        'apiKey',
                        'order',
                        'order/all',
                    ],
                },
            },
            'exceptions': {
                'exact': {
                    'Invalid API Key.': AuthenticationError,
                    'Access Denied': PermissionDenied,
                    'Duplicate clOrdID': InvalidOrder,
                    'orderQty is invalid': InvalidOrder,
                    'Invalid price': InvalidOrder,
                    'Invalid stopPx for ordType': InvalidOrder,
                },
                'broad': {
                    'Signature not valid': AuthenticationError,
                    'overloaded': ExchangeNotAvailable,
                    'Account has insufficient Available Balance': InsufficientFunds,
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                // https://blog.bitmex.com/api_announcement/deprecation-of-api-nonce-header/
                // https://github.com/ccxt/ccxt/issues/4789
                'api-expires': 5, // in seconds
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetInstrumentActiveAndIndices (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const active = (market['state'] !== 'Unlisted');
            const id = market['symbol'];
            const baseId = market['underlying'];
            const quoteId = market['quoteCurrency'];
            const basequote = baseId + quoteId;
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const swap = (id === basequote);
            // 'positionCurrency' may be empty ("", as Bitmex currently returns for ETHUSD)
            // so let's take the quote currency first and then adjust if needed
            const positionId = this.safeString2 (market, 'positionCurrency', 'quoteCurrency');
            let type = undefined;
            let future = false;
            let prediction = false;
            const position = this.safeCurrencyCode (positionId);
            let symbol = id;
            if (swap) {
                type = 'swap';
                symbol = base + '/' + quote;
            } else if (id.indexOf ('B_') >= 0) {
                prediction = true;
                type = 'prediction';
            } else {
                future = true;
                type = 'future';
            }
            const precision = {
                'amount': undefined,
                'price': undefined,
            };
            const lotSize = this.safeFloat (market, 'lotSize');
            const tickSize = this.safeFloat (market, 'tickSize');
            if (lotSize !== undefined) {
                precision['amount'] = lotSize;
            }
            if (tickSize !== undefined) {
                precision['price'] = tickSize;
            }
            const limits = {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': tickSize,
                    'max': this.safeFloat (market, 'maxPrice'),
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            const limitField = (position === quote) ? 'cost' : 'amount';
            limits[limitField] = {
                'min': lotSize,
                'max': this.safeFloat (market, 'maxOrderQty'),
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': limits,
                'taker': this.safeFloat (market, 'takerFee'),
                'maker': this.safeFloat (market, 'makerFee'),
                'type': type,
                'spot': false,
                'swap': swap,
                'future': future,
                'prediction': prediction,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {
            'currency': 'all',
        };
        const response = await this.privateGetUserMargin (this.extend (request, params));
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'availableMargin');
            account['total'] = this.safeFloat (balance, 'marginBalance');
            if (code === 'BTC') {
                account['free'] = account['free'] * 0.00000001;
                account['total'] = account['total'] * 0.00000001;
            }
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetOrderBookL2 (this.extend (request, params));
        const result = {
            'bids': [],
            'asks': [],
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const order = response[i];
            const side = (order['side'] === 'Sell') ? 'asks' : 'bids';
            const amount = this.safeFloat (order, 'size');
            const price = this.safeFloat (order, 'price');
            // https://github.com/ccxt/ccxt/issues/4926
            // https://github.com/ccxt/ccxt/issues/4927
            // the exchange sometimes returns null price in the orderbook
            if (price !== undefined) {
                result[side].push ([ price, amount ]);
            }
        }
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const filter = {
            'filter': {
                'orderID': id,
            },
        };
        const response = await this.fetchOrders (symbol, undefined, undefined, this.deepExtend (filter, params));
        const numResults = response.length;
        if (numResults === 1) {
            return response[0];
        }
        throw new OrderNotFound (this.id + ': The order ' + id + ' not found.');
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        request = this.deepExtend (request, params);
        // why the hassle? urlencode in python is kinda broken for nested dicts.
        // E.g. self.urlencode({"filter": {"open": True}}) will return "filter={'open':+True}"
        // Bitmex doesn't like that. Hence resorting to this hack.
        if ('filter' in request) {
            request['filter'] = this.json (request['filter']);
        }
        const response = await this.privateGetOrder (request);
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'filter': {
                'open': true,
            },
        };
        return await this.fetchOrders (symbol, since, limit, this.deepExtend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // Bitmex barfs if you set 'open': false in the filter...
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        request = this.deepExtend (request, params);
        // why the hassle? urlencode in python is kinda broken for nested dicts.
        // E.g. self.urlencode({"filter": {"open": True}}) will return "filter={'open':+True}"
        // Bitmex doesn't like that. Hence resorting to this hack.
        if ('filter' in request) {
            request['filter'] = this.json (request['filter']);
        }
        const response = await this.privateGetExecutionTradeHistory (request);
        //
        //     [
        //         {
        //             "execID": "string",
        //             "orderID": "string",
        //             "clOrdID": "string",
        //             "clOrdLinkID": "string",
        //             "account": 0,
        //             "symbol": "string",
        //             "side": "string",
        //             "lastQty": 0,
        //             "lastPx": 0,
        //             "underlyingLastPx": 0,
        //             "lastMkt": "string",
        //             "lastLiquidityInd": "string",
        //             "simpleOrderQty": 0,
        //             "orderQty": 0,
        //             "price": 0,
        //             "displayQty": 0,
        //             "stopPx": 0,
        //             "pegOffsetValue": 0,
        //             "pegPriceType": "string",
        //             "currency": "string",
        //             "settlCurrency": "string",
        //             "execType": "string",
        //             "ordType": "string",
        //             "timeInForce": "string",
        //             "execInst": "string",
        //             "contingencyType": "string",
        //             "exDestination": "string",
        //             "ordStatus": "string",
        //             "triggered": "string",
        //             "workingIndicator": true,
        //             "ordRejReason": "string",
        //             "simpleLeavesQty": 0,
        //             "leavesQty": 0,
        //             "simpleCumQty": 0,
        //             "cumQty": 0,
        //             "avgPx": 0,
        //             "commission": 0,
        //             "tradePublishIndicator": "string",
        //             "multiLegReportingType": "string",
        //             "text": "string",
        //             "trdMatchID": "string",
        //             "execCost": 0,
        //             "execComm": 0,
        //             "homeNotional": 0,
        //             "foreignNotional": 0,
        //             "transactTime": "2019-03-05T12:47:02.762Z",
        //             "timestamp": "2019-03-05T12:47:02.762Z"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseLedgerEntryType (type) {
        const types = {
            'Withdrawal': 'transaction',
            'RealisedPNL': 'margin',
            'Deposit': 'transaction',
            'Transfer': 'transfer',
            'AffiliatePayout': 'referral',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //     {
        //         transactID: "69573da3-7744-5467-3207-89fd6efe7a47",
        //         account:  24321,
        //         currency: "XBt",
        //         transactType: "Withdrawal", // "AffiliatePayout", "Transfer", "Deposit", "RealisedPNL", ...
        //         amount:  -1000000,
        //         fee:  300000,
        //         transactStatus: "Completed", // "Canceled", ...
        //         address: "1Ex4fkF4NhQaQdRWNoYpqiPbDBbq18Kdd9",
        //         tx: "3BMEX91ZhhKoWtsH9QRb5dNXnmnGpiEetA",
        //         text: "",
        //         transactTime: "2017-03-21T20:05:14.388Z",
        //         walletBalance:  0, // balance after
        //         marginBalance:  null,
        //         timestamp: "2017-03-22T13:09:23.514Z"
        //     }
        //
        const id = this.safeString (item, 'transactID');
        const account = this.safeString (item, 'account');
        const referenceId = this.safeString (item, 'tx');
        const referenceAccount = undefined;
        const type = this.parseLedgerEntryType (this.safeString (item, 'transactType'));
        const currencyId = this.safeString (item, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        let amount = this.safeFloat (item, 'amount');
        if (amount !== undefined) {
            amount = amount * 1e-8;
        }
        const timestamp = this.parse8601 (this.safeString (item, 'transactTime'));
        let feeCost = this.safeFloat (item, 'fee', 0);
        if (feeCost !== undefined) {
            feeCost = feeCost * 1e-8;
        }
        const fee = {
            'cost': feeCost,
            'currency': code,
        };
        let after = this.safeFloat (item, 'walletBalance');
        if (after !== undefined) {
            after = after * 1e-8;
        }
        const before = this.sum (after, -amount);
        let direction = undefined;
        if (amount < 0) {
            direction = 'out';
            amount = Math.abs (amount);
        } else {
            direction = 'in';
        }
        const status = this.parseTransactionStatus (this.safeString (item, 'transactStatus'));
        return {
            'id': id,
            'info': item,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': direction,
            'account': account,
            'referenceId': referenceId,
            'referenceAccount': referenceAccount,
            'type': type,
            'currency': code,
            'amount': amount,
            'before': before,
            'after': after,
            'status': status,
            'fee': fee,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const request = {
            // 'start': 123,
        };
        //
        //     if (since !== undefined) {
        //         // date-based pagination not supported
        //     }
        //
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privateGetUserWalletHistory (this.extend (request, params));
        //
        //     [
        //         {
        //             transactID: "69573da3-7744-5467-3207-89fd6efe7a47",
        //             account:  24321,
        //             currency: "XBt",
        //             transactType: "Withdrawal", // "AffiliatePayout", "Transfer", "Deposit", "RealisedPNL", ...
        //             amount:  -1000000,
        //             fee:  300000,
        //             transactStatus: "Completed", // "Canceled", ...
        //             address: "1Ex4fkF4NhQaQdRWNoYpqiPbDBbq18Kdd9",
        //             tx: "3BMEX91ZhhKoWtsH9QRb5dNXnmnGpiEetA",
        //             text: "",
        //             transactTime: "2017-03-21T20:05:14.388Z",
        //             walletBalance:  0, // balance after
        //             marginBalance:  null,
        //             timestamp: "2017-03-22T13:09:23.514Z"
        //         }
        //     ]
        //
        return this.parseLedger (response, currency, since, limit);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'start': 123,
        };
        //
        //     if (since !== undefined) {
        //         // date-based pagination not supported
        //     }
        //
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privateGetUserWalletHistory (this.extend (request, params));
        const transactions = this.filterByArray (response, [ 'Withdrawal', 'Deposit' ], false);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (transactions, currency, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'Canceled': 'canceled',
            'Completed': 'ok',
            'Pending': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //   {
        //      'transactID': 'ffe699c2-95ee-4c13-91f9-0faf41daec25',
        //      'account': 123456,
        //      'currency': 'XBt',
        //      'transactType': 'Withdrawal',
        //      'amount': -100100000,
        //      'fee': 100000,
        //      'transactStatus': 'Completed',
        //      'address': '385cR5DM96n1HvBDMzLHPYcw89fZAXULJP',
        //      'tx': '3BMEXabcdefghijklmnopqrstuvwxyz123',
        //      'text': '',
        //      'transactTime': '2019-01-02T01:00:00.000Z',
        //      'walletBalance': 99900000,
        //      'marginBalance': None,
        //      'timestamp': '2019-01-02T13:00:00.000Z'
        //   }
        //
        const id = this.safeString (transaction, 'transactID');
        // For deposits, transactTime == timestamp
        // For withdrawals, transactTime is submission, timestamp is processed
        const transactTime = this.parse8601 (this.safeString (transaction, 'transactTime'));
        const timestamp = this.parse8601 (this.safeString (transaction, 'timestamp'));
        let type = this.safeString (transaction, 'transactType');
        if (type !== undefined) {
            type = type.toLowerCase ();
        }
        // Deposits have no from address or to address, withdrawals have both
        let address = undefined;
        let addressFrom = undefined;
        let addressTo = undefined;
        if (type === 'withdrawal') {
            address = this.safeString (transaction, 'address');
            addressFrom = this.safeString (transaction, 'tx');
            addressTo = address;
        }
        let amount = this.safeInteger (transaction, 'amount');
        if (amount !== undefined) {
            amount = Math.abs (amount) * 1e-8;
        }
        let feeCost = this.safeInteger (transaction, 'fee');
        if (feeCost !== undefined) {
            feeCost = feeCost * 1e-8;
        }
        const fee = {
            'cost': feeCost,
            'currency': 'BTC',
        };
        let status = this.safeString (transaction, 'transactStatus');
        if (status !== undefined) {
            status = this.parseTransactionStatus (status);
        }
        return {
            'info': transaction,
            'id': id,
            'txid': undefined,
            'timestamp': transactTime,
            'datetime': this.iso8601 (transactTime),
            'addressFrom': addressFrom,
            'address': address,
            'addressTo': addressTo,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'type': type,
            'amount': amount,
            // BTC is the only currency on Bitmex
            'currency': 'BTC',
            'status': status,
            'updated': timestamp,
            'comment': undefined,
            'fee': fee,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['active']) {
            throw new ExchangeError (this.id + ': symbol ' + symbol + ' is delisted');
        }
        const tickers = await this.fetchTickers ([ symbol ], params);
        const ticker = this.safeValue (tickers, symbol);
        if (ticker === undefined) {
            throw new ExchangeError (this.id + ' ticker symbol ' + symbol + ' not found');
        }
        return ticker;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetInstrumentActiveAndIndices (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = this.safeString (ticker, 'symbol');
            if (symbol !== undefined) {
                result[symbol] = ticker;
            }
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {                         symbol: "ETHH19",
        //                           rootSymbol: "ETH",
        //                                state: "Open",
        //                                  typ: "FFCCSX",
        //                              listing: "2018-12-17T04:00:00.000Z",
        //                                front: "2019-02-22T12:00:00.000Z",
        //                               expiry: "2019-03-29T12:00:00.000Z",
        //                               settle: "2019-03-29T12:00:00.000Z",
        //                       relistInterval:  null,
        //                           inverseLeg: "",
        //                              sellLeg: "",
        //                               buyLeg: "",
        //                     optionStrikePcnt:  null,
        //                    optionStrikeRound:  null,
        //                    optionStrikePrice:  null,
        //                     optionMultiplier:  null,
        //                     positionCurrency: "ETH",
        //                           underlying: "ETH",
        //                        quoteCurrency: "XBT",
        //                     underlyingSymbol: "ETHXBT=",
        //                            reference: "BMEX",
        //                      referenceSymbol: ".BETHXBT30M",
        //                         calcInterval:  null,
        //                      publishInterval:  null,
        //                          publishTime:  null,
        //                          maxOrderQty:  100000000,
        //                             maxPrice:  10,
        //                              lotSize:  1,
        //                             tickSize:  0.00001,
        //                           multiplier:  100000000,
        //                        settlCurrency: "XBt",
        //       underlyingToPositionMultiplier:  1,
        //         underlyingToSettleMultiplier:  null,
        //              quoteToSettleMultiplier:  100000000,
        //                             isQuanto:  false,
        //                            isInverse:  false,
        //                           initMargin:  0.02,
        //                          maintMargin:  0.01,
        //                            riskLimit:  5000000000,
        //                             riskStep:  5000000000,
        //                                limit:  null,
        //                               capped:  false,
        //                                taxed:  true,
        //                           deleverage:  true,
        //                             makerFee:  -0.0005,
        //                             takerFee:  0.0025,
        //                        settlementFee:  0,
        //                         insuranceFee:  0,
        //                    fundingBaseSymbol: "",
        //                   fundingQuoteSymbol: "",
        //                 fundingPremiumSymbol: "",
        //                     fundingTimestamp:  null,
        //                      fundingInterval:  null,
        //                          fundingRate:  null,
        //                indicativeFundingRate:  null,
        //                   rebalanceTimestamp:  null,
        //                    rebalanceInterval:  null,
        //                     openingTimestamp: "2019-02-13T08:00:00.000Z",
        //                     closingTimestamp: "2019-02-13T09:00:00.000Z",
        //                      sessionInterval: "2000-01-01T01:00:00.000Z",
        //                       prevClosePrice:  0.03347,
        //                       limitDownPrice:  null,
        //                         limitUpPrice:  null,
        //               bankruptLimitDownPrice:  null,
        //                 bankruptLimitUpPrice:  null,
        //                      prevTotalVolume:  1386531,
        //                          totalVolume:  1387062,
        //                               volume:  531,
        //                            volume24h:  17118,
        //                    prevTotalTurnover:  4741294246000,
        //                        totalTurnover:  4743103466000,
        //                             turnover:  1809220000,
        //                          turnover24h:  57919845000,
        //                      homeNotional24h:  17118,
        //                   foreignNotional24h:  579.19845,
        //                         prevPrice24h:  0.03349,
        //                                 vwap:  0.03383564,
        //                            highPrice:  0.03458,
        //                             lowPrice:  0.03329,
        //                            lastPrice:  0.03406,
        //                   lastPriceProtected:  0.03406,
        //                    lastTickDirection: "ZeroMinusTick",
        //                       lastChangePcnt:  0.017,
        //                             bidPrice:  0.03406,
        //                             midPrice:  0.034065,
        //                             askPrice:  0.03407,
        //                       impactBidPrice:  0.03406,
        //                       impactMidPrice:  0.034065,
        //                       impactAskPrice:  0.03407,
        //                         hasLiquidity:  true,
        //                         openInterest:  83679,
        //                            openValue:  285010674000,
        //                           fairMethod: "ImpactMidPrice",
        //                        fairBasisRate:  0,
        //                            fairBasis:  0,
        //                            fairPrice:  0.03406,
        //                           markMethod: "FairPrice",
        //                            markPrice:  0.03406,
        //                    indicativeTaxRate:  0,
        //                indicativeSettlePrice:  0.03406,
        //                optionUnderlyingPrice:  null,
        //                         settledPrice:  null,
        //                            timestamp: "2019-02-13T08:40:30.000Z",
        //     }
        //
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeValue (this.markets_by_id, marketId, market);
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.parse8601 (this.safeString (ticker, 'timestamp'));
        const open = this.safeFloat (ticker, 'prevPrice24h');
        const last = this.safeFloat (ticker, 'lastPrice');
        let change = undefined;
        let percentage = undefined;
        if (last !== undefined && open !== undefined) {
            change = last - open;
            if (open > 0) {
                percentage = change / open * 100;
            }
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highPrice'),
            'low': this.safeFloat (ticker, 'lowPrice'),
            'bid': this.safeFloat (ticker, 'bidPrice'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'askPrice'),
            'askVolume': undefined,
            'vwap': this.safeFloat (ticker, 'vwap'),
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': this.sum (open, last) / 2,
            'baseVolume': this.safeFloat (ticker, 'homeNotional24h'),
            'quoteVolume': this.safeFloat (ticker, 'foreignNotional24h'),
            'info': ticker,
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        const timestamp = this.parse8601 (this.safeString (ohlcv, 'timestamp'));
        return [
            timestamp,
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // send JSON key/value pairs, such as {"key": "value"}
        // filter by individual fields and do advanced queries on timestamps
        // let filter = { 'key': 'value' };
        // send a bare series (e.g. XBU) to nearest expiring contract in that series
        // you can also send a timeframe, e.g. XBU:monthly
        // timeframes: daily, weekly, monthly, quarterly, and biquarterly
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'binSize': this.timeframes[timeframe],
            'partial': true,     // true == include yet-incomplete current bins
            // 'filter': filter, // filter by individual fields and do advanced queries
            // 'columns': [],    // will return all columns if omitted
            // 'start': 0,       // starting point for results (wtf?)
            // 'reverse': false, // true == newest first
            // 'endTime': '',    // ending date filter for results
        };
        if (limit !== undefined) {
            request['count'] = limit; // default 100, max 500
        }
        // if since is not set, they will return candles starting from 2017-01-01
        if (since !== undefined) {
            const ymdhms = this.ymdhms (since);
            request['startTime'] = ymdhms; // starting date filter for results
        }
        const response = await this.publicGetTradeBucketed (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         timestamp: '2018-08-28T00:00:02.735Z',
        //         symbol: 'XBTUSD',
        //         side: 'Buy',
        //         size: 2000,
        //         price: 6906.5,
        //         tickDirection: 'PlusTick',
        //         trdMatchID: 'b9a42432-0a46-6a2f-5ecc-c32e9ca4baf8',
        //         grossValue: 28958000,
        //         homeNotional: 0.28958,
        //         foreignNotional: 2000
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "execID": "string",
        //         "orderID": "string",
        //         "clOrdID": "string",
        //         "clOrdLinkID": "string",
        //         "account": 0,
        //         "symbol": "string",
        //         "side": "string",
        //         "lastQty": 0,
        //         "lastPx": 0,
        //         "underlyingLastPx": 0,
        //         "lastMkt": "string",
        //         "lastLiquidityInd": "string",
        //         "simpleOrderQty": 0,
        //         "orderQty": 0,
        //         "price": 0,
        //         "displayQty": 0,
        //         "stopPx": 0,
        //         "pegOffsetValue": 0,
        //         "pegPriceType": "string",
        //         "currency": "string",
        //         "settlCurrency": "string",
        //         "execType": "string",
        //         "ordType": "string",
        //         "timeInForce": "string",
        //         "execInst": "string",
        //         "contingencyType": "string",
        //         "exDestination": "string",
        //         "ordStatus": "string",
        //         "triggered": "string",
        //         "workingIndicator": true,
        //         "ordRejReason": "string",
        //         "simpleLeavesQty": 0,
        //         "leavesQty": 0,
        //         "simpleCumQty": 0,
        //         "cumQty": 0,
        //         "avgPx": 0,
        //         "commission": 0,
        //         "tradePublishIndicator": "string",
        //         "multiLegReportingType": "string",
        //         "text": "string",
        //         "trdMatchID": "string",
        //         "execCost": 0,
        //         "execComm": 0,
        //         "homeNotional": 0,
        //         "foreignNotional": 0,
        //         "transactTime": "2019-03-05T12:47:02.762Z",
        //         "timestamp": "2019-03-05T12:47:02.762Z"
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (trade, 'timestamp'));
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat2 (trade, 'size', 'lastQty');
        const id = this.safeString (trade, 'trdMatchID');
        const order = this.safeString (trade, 'orderID');
        const side = this.safeString (trade, 'side').toLowerCase ();
        // price * amount doesn't work for all symbols (e.g. XBT, ETH)
        let cost = this.safeFloat (trade, 'execCost');
        if (cost !== undefined) {
            cost = Math.abs (cost) / 100000000;
        }
        let fee = undefined;
        if ('execComm' in trade) {
            let feeCost = this.safeFloat (trade, 'execComm');
            feeCost = feeCost / 100000000;
            const currencyId = this.safeString (trade, 'settlCurrency');
            const feeCurrency = this.safeCurrencyCode (currencyId);
            const feeRate = this.safeFloat (trade, 'commission');
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
                'rate': feeRate,
            };
        }
        let takerOrMaker = undefined;
        if (fee !== undefined) {
            takerOrMaker = fee['cost'] < 0 ? 'maker' : 'taker';
        }
        let symbol = undefined;
        const marketId = this.safeString (trade, 'symbol');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                symbol = marketId;
            }
        }
        let type = this.safeString (trade, 'ordType');
        if (type !== undefined) {
            type = type.toLowerCase ();
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': order,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'fee': fee,
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            'New': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'DoneForDay': 'open',
            'Canceled': 'canceled',
            'PendingCancel': 'open',
            'PendingNew': 'open',
            'Rejected': 'rejected',
            'Expired': 'expired',
            'Stopped': 'open',
            'Untriggered': 'open',
            'Triggered': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const status = this.parseOrderStatus (this.safeString (order, 'ordStatus'));
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            const marketId = this.safeString (order, 'symbol');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
        }
        const timestamp = this.parse8601 (this.safeString (order, 'timestamp'));
        const lastTradeTimestamp = this.parse8601 (this.safeString (order, 'transactTime'));
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'orderQty');
        const filled = this.safeFloat (order, 'cumQty', 0.0);
        let remaining = undefined;
        if (amount !== undefined) {
            if (filled !== undefined) {
                remaining = Math.max (amount - filled, 0.0);
            }
        }
        const average = this.safeFloat (order, 'avgPx');
        let cost = undefined;
        if (filled !== undefined) {
            if (average !== undefined) {
                cost = average * filled;
            } else if (price !== undefined) {
                cost = price * filled;
            }
        }
        const id = this.safeString (order, 'orderID');
        let type = this.safeString (order, 'ordType');
        if (type !== undefined) {
            type = type.toLowerCase ();
        }
        let side = this.safeString (order, 'side');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.publicGetTrade (this.extend (request, params));
        //
        //     [
        //         {
        //             timestamp: '2018-08-28T00:00:02.735Z',
        //             symbol: 'XBTUSD',
        //             side: 'Buy',
        //             size: 2000,
        //             price: 6906.5,
        //             tickDirection: 'PlusTick',
        //             trdMatchID: 'b9a42432-0a46-6a2f-5ecc-c32e9ca4baf8',
        //             grossValue: 28958000,
        //             homeNotional: 0.28958,
        //             foreignNotional: 2000
        //         },
        //         {
        //             timestamp: '2018-08-28T00:00:03.778Z',
        //             symbol: 'XBTUSD',
        //             side: 'Sell',
        //             size: 1000,
        //             price: 6906,
        //             tickDirection: 'MinusTick',
        //             trdMatchID: '0d4f1682-5270-a800-569b-4a0eb92db97c',
        //             grossValue: 14480000,
        //             homeNotional: 0.1448,
        //             foreignNotional: 1000
        //         },
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
            'side': this.capitalize (side),
            'orderQty': amount,
            'ordType': this.capitalize (type),
        };
        if (price !== undefined) {
            request['price'] = price;
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        const order = this.parseOrder (response);
        const id = this.safeString (order, 'id');
        this.orders[id] = order;
        return this.extend ({ 'info': response }, order);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderID': id,
        };
        if (amount !== undefined) {
            request['orderQty'] = amount;
        }
        if (price !== undefined) {
            request['price'] = price;
        }
        const response = await this.privatePutOrder (this.extend (request, params));
        const order = this.parseOrder (response);
        this.orders[order['id']] = order;
        return this.extend ({ 'info': response }, order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateDeleteOrder (this.extend ({ 'orderID': id }, params));
        let order = response[0];
        const error = this.safeString (order, 'error');
        if (error !== undefined) {
            if (error.indexOf ('Unable to cancel order due to existing state') >= 0) {
                throw new OrderNotFound (this.id + ' cancelOrder() failed: ' + error);
            }
        }
        order = this.parseOrder (order);
        this.orders[order['id']] = order;
        return this.extend ({ 'info': response }, order);
    }

    isFiat (currency) {
        if (currency === 'EUR') {
            return true;
        }
        if (currency === 'PLN') {
            return true;
        }
        return false;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        // let currency = this.currency (code);
        if (code !== 'BTC') {
            throw new ExchangeError (this.id + ' supoprts BTC withdrawals only, other currencies coming soon...');
        }
        const request = {
            'currency': 'XBt', // temporarily
            'amount': amount,
            'address': address,
            // 'otpToken': '123456', // requires if two-factor auth (OTP) is enabled
            // 'fee': 0.001, // bitcoin network fee
        };
        const response = await this.privatePostUserRequestWithdrawal (this.extend (request, params));
        return {
            'info': response,
            'id': response['transactID'],
        };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return;
        }
        if (code === 429) {
            throw new DDoSProtection (this.id + ' ' + body);
        }
        if (code >= 400) {
            const error = this.safeValue (response, 'error', {});
            const message = this.safeString (error, 'message');
            const feedback = this.id + ' ' + body;
            const exact = this.exceptions['exact'];
            if (message in exact) {
                throw new exact[message] (feedback);
            }
            const broad = this.exceptions['broad'];
            const broadKey = this.findBroadlyMatchedKey (broad, message);
            if (broadKey !== undefined) {
                throw new broad[broadKey] (feedback);
            }
            if (code === 400) {
                throw new BadRequest (feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = '/api/' + this.version + '/' + path;
        if (method === 'GET') {
            if (Object.keys (params).length) {
                query += '?' + this.urlencode (params);
            }
        } else {
            const format = this.safeString (params, '_format');
            if (format !== undefined) {
                query += '?' + this.urlencode ({ '_format': format });
                params = this.omit (params, '_format');
            }
        }
        const url = this.urls['api'] + query;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let auth = method + query;
            let expires = this.safeInteger (this.options, 'api-expires');
            headers = {
                'Content-Type': 'application/json',
                'api-key': this.apiKey,
            };
            expires = this.sum (this.seconds (), expires);
            expires = expires.toString ();
            auth += expires;
            headers['api-expires'] = expires;
            if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
                if (Object.keys (params).length) {
                    body = this.json (params);
                    auth += body;
                }
            }
            headers['api-signature'] = this.hmac (this.encode (auth), this.encode (this.secret));
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
