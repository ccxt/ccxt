'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { AuthenticationError, BadRequest, DDoSProtection, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, OrderNotFound, PermissionDenied, ArgumentsRequired, BadSymbol } = require ('./base/errors');
const Precise = require ('./base/Precise');

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
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': undefined,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'createReduceOnlyOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTransactions': 'emulated',
                'fetchTransfer': false,
                'fetchTransfers': false,
                'reduceMargin': undefined,
                'setLeverage': true,
                'setMargin': undefined,
                'setMarginMode': true,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'test': {
                    'public': 'https://testnet.bitmex.com',
                    'private': 'https://testnet.bitmex.com',
                },
                'logo': 'https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg',
                'api': {
                    'public': 'https://www.bitmex.com',
                    'private': 'https://www.bitmex.com',
                },
                'www': 'https://www.bitmex.com',
                'doc': [
                    'https://www.bitmex.com/app/apiOverview',
                    'https://github.com/BitMEX/api-connectors/tree/master/official-http',
                ],
                'fees': 'https://www.bitmex.com/app/fees',
                'referral': 'https://www.bitmex.com/register/upZpOX',
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
                        'user/executionHistory',
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
                    'This key is disabled.': PermissionDenied,
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
                    'Service unavailable': ExchangeNotAvailable, // {"error":{"message":"Service unavailable","name":"HTTPError"}}
                    'Server Error': ExchangeError, // {"error":{"message":"Server Error","name":"HTTPError"}}
                    'Unable to cancel order due to existing state': InvalidOrder,
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                // https://blog.bitmex.com/api_announcement/deprecation-of-api-nonce-header/
                // https://github.com/ccxt/ccxt/issues/4789
                'api-expires': 5, // in seconds
                'fetchOHLCVOpenTimestamp': true,
            },
            'commonCurrencies': {
                'USDt': 'USDT',
                'XBt': 'BTC',
                'XBT': 'BTC',
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bitmex#fetchMarkets
         * @description retrieves data on all markets for bitmex
         * @param {dict} params extra parameters specific to the exchange api endpoint
         * @returns {[dict]} an array of objects representing market data
         */
        const response = await this.publicGetInstrumentActiveAndIndices (params);
        //
        //    {
        //        "symbol": "LTCUSDT",
        //        "rootSymbol": "LTC",
        //        "state": "Open",
        //        "typ": "FFWCSX",
        //        "listing": "2021-11-10T04:00:00.000Z",
        //        "front": "2021-11-10T04:00:00.000Z",
        //        "expiry": null,
        //        "settle": null,
        //        "listedSettle": null,
        //        "relistInterval": null,
        //        "inverseLeg": "",
        //        "sellLeg": "",
        //        "buyLeg": "",
        //        "optionStrikePcnt": null,
        //        "optionStrikeRound": null,
        //        "optionStrikePrice": null,
        //        "optionMultiplier": null,
        //        "positionCurrency": "LTC",
        //        "underlying": "LTC",
        //        "quoteCurrency": "USDT",
        //        "underlyingSymbol": "LTCT=",
        //        "reference": "BMEX",
        //        "referenceSymbol": ".BLTCT",
        //        "calcInterval": null,
        //        "publishInterval": null,
        //        "publishTime": null,
        //        "maxOrderQty": 1000000000,
        //        "maxPrice": 1000000,
        //        "lotSize": 1000,
        //        "tickSize": 0.01,
        //        "multiplier": 100,
        //        "settlCurrency": "USDt",
        //        "underlyingToPositionMultiplier": 10000,
        //        "underlyingToSettleMultiplier": null,
        //        "quoteToSettleMultiplier": 1000000,
        //        "isQuanto": false,
        //        "isInverse": false,
        //        "initMargin": 0.03,
        //        "maintMargin": 0.015,
        //        "riskLimit": 1000000000000,
        //        "riskStep": 1000000000000,
        //        "limit": null,
        //        "capped": false,
        //        "taxed": true,
        //        "deleverage": true,
        //        "makerFee": -0.0001,
        //        "takerFee": 0.0005,
        //        "settlementFee": 0,
        //        "insuranceFee": 0,
        //        "fundingBaseSymbol": ".LTCBON8H",
        //        "fundingQuoteSymbol": ".USDTBON8H",
        //        "fundingPremiumSymbol": ".LTCUSDTPI8H",
        //        "fundingTimestamp": "2022-01-14T20:00:00.000Z",
        //        "fundingInterval": "2000-01-01T08:00:00.000Z",
        //        "fundingRate": 0.0001,
        //        "indicativeFundingRate": 0.0001,
        //        "rebalanceTimestamp": null,
        //        "rebalanceInterval": null,
        //        "openingTimestamp": "2022-01-14T17:00:00.000Z",
        //        "closingTimestamp": "2022-01-14T18:00:00.000Z",
        //        "sessionInterval": "2000-01-01T01:00:00.000Z",
        //        "prevClosePrice": 138.511,
        //        "limitDownPrice": null,
        //        "limitUpPrice": null,
        //        "bankruptLimitDownPrice": null,
        //        "bankruptLimitUpPrice": null,
        //        "prevTotalVolume": 12699024000,
        //        "totalVolume": 12702160000,
        //        "volume": 3136000,
        //        "volume24h": 114251000,
        //        "prevTotalTurnover": 232418052349000,
        //        "totalTurnover": 232463353260000,
        //        "turnover": 45300911000,
        //        "turnover24h": 1604331340000,
        //        "homeNotional24h": 11425.1,
        //        "foreignNotional24h": 1604331.3400000003,
        //        "prevPrice24h": 135.48,
        //        "vwap": 140.42165,
        //        "highPrice": 146.42,
        //        "lowPrice": 135.08,
        //        "lastPrice": 144.36,
        //        "lastPriceProtected": 144.36,
        //        "lastTickDirection": "MinusTick",
        //        "lastChangePcnt": 0.0655,
        //        "bidPrice": 143.75,
        //        "midPrice": 143.855,
        //        "askPrice": 143.96,
        //        "impactBidPrice": 143.75,
        //        "impactMidPrice": 143.855,
        //        "impactAskPrice": 143.96,
        //        "hasLiquidity": true,
        //        "openInterest": 38103000,
        //        "openValue": 547963053300,
        //        "fairMethod": "FundingRate",
        //        "fairBasisRate": 0.1095,
        //        "fairBasis": 0.004,
        //        "fairPrice": 143.811,
        //        "markMethod": "FairPrice",
        //        "markPrice": 143.811,
        //        "indicativeTaxRate": null,
        //        "indicativeSettlePrice": 143.807,
        //        "optionUnderlyingPrice": null,
        //        "settledPriceAdjustmentRate": null,
        //        "settledPrice": null,
        //        "timestamp": "2022-01-14T17:49:55.000Z"
        //    }
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'underlying');
            const quoteId = this.safeString (market, 'quoteCurrency');
            const settleId = this.safeString (market, 'settlCurrency', '');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const basequote = baseId + quoteId;
            const swap = (id === basequote);
            // 'positionCurrency' may be empty ("", as Bitmex currently returns for ETHUSD)
            // so let's take the quote currency first and then adjust if needed
            let type = undefined;
            let future = false;
            let prediction = false;
            let index = false;
            let symbol = base + '/' + quote + ':' + settle;
            const expiryDatetime = this.safeString (market, 'expiry');
            const expiry = this.parse8601 (expiryDatetime);
            const inverse = this.safeValue (market, 'isInverse');
            const status = this.safeString (market, 'state');
            let active = status !== 'Unlisted';
            if (swap) {
                type = 'swap';
            } else if (id.indexOf ('B_') >= 0) {
                prediction = true;
                type = 'prediction';
                symbol = id;
            } else if (expiry !== undefined) {
                future = true;
                type = 'future';
                symbol = symbol + '-' + this.yymmdd (expiry);
            } else {
                index = true;
                type = 'index';
                symbol = id;
                active = false;
            }
            const positionId = this.safeString2 (market, 'positionCurrency', 'quoteCurrency');
            const position = this.safeCurrencyCode (positionId);
            const positionIsQuote = (position === quote);
            const maxOrderQty = this.safeNumber (market, 'maxOrderQty');
            const contract = !index;
            const initMargin = this.safeString (market, 'initMargin', '1');
            const maxLeverage = this.parseNumber (Precise.stringDiv ('1', initMargin));
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'spot': false,
                'margin': false,
                'swap': swap,
                'future': future,
                'option': false,
                'prediction': prediction,
                'index': index,
                'active': active,
                'contract': contract,
                'linear': contract ? !inverse : undefined,
                'inverse': contract ? inverse : undefined,
                'taker': this.safeNumber (market, 'takerFee'),
                'maker': this.safeNumber (market, 'makerFee'),
                'contractSize': this.safeNumber (market, 'multiplier'),
                'expiry': expiry,
                'expiryDatetime': expiryDatetime,
                'strike': this.safeNumber (market, 'optionStrikePrice'),
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'lotSize'),
                    'price': this.safeNumber (market, 'tickSize'),
                },
                'limits': {
                    'leverage': {
                        'min': contract ? this.parseNumber ('1') : undefined,
                        'max': contract ? maxLeverage : undefined,
                    },
                    'amount': {
                        'min': undefined,
                        'max': positionIsQuote ? undefined : maxOrderQty,
                    },
                    'price': {
                        'min': undefined,
                        'max': this.safeNumber (market, 'maxPrice'),
                    },
                    'cost': {
                        'min': undefined,
                        'max': positionIsQuote ? maxOrderQty : undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseBalance (response) {
        //
        //     [
        //         {
        //             "account":1455728,
        //             "currency":"XBt",
        //             "riskLimit":1000000000000,
        //             "prevState":"",
        //             "state":"",
        //             "action":"",
        //             "amount":263542,
        //             "pendingCredit":0,
        //             "pendingDebit":0,
        //             "confirmedDebit":0,
        //             "prevRealisedPnl":0,
        //             "prevUnrealisedPnl":0,
        //             "grossComm":0,
        //             "grossOpenCost":0,
        //             "grossOpenPremium":0,
        //             "grossExecCost":0,
        //             "grossMarkValue":0,
        //             "riskValue":0,
        //             "taxableMargin":0,
        //             "initMargin":0,
        //             "maintMargin":0,
        //             "sessionMargin":0,
        //             "targetExcessMargin":0,
        //             "varMargin":0,
        //             "realisedPnl":0,
        //             "unrealisedPnl":0,
        //             "indicativeTax":0,
        //             "unrealisedProfit":0,
        //             "syntheticMargin":null,
        //             "walletBalance":263542,
        //             "marginBalance":263542,
        //             "marginBalancePcnt":1,
        //             "marginLeverage":0,
        //             "marginUsedPcnt":0,
        //             "excessMargin":263542,
        //             "excessMarginPcnt":1,
        //             "availableMargin":263542,
        //             "withdrawableMargin":263542,
        //             "timestamp":"2020-08-03T12:01:01.246Z",
        //             "grossLastValue":0,
        //             "commission":null
        //         }
        //     ]
        //
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            let free = this.safeString (balance, 'availableMargin');
            let total = this.safeString (balance, 'marginBalance');
            if (code === 'BTC') {
                free = Precise.stringDiv (free, '1e8');
                total = Precise.stringDiv (total, '1e8');
            }
            account['free'] = free;
            account['total'] = total;
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bitmex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {dict} params extra parameters specific to the bitmex api endpoint
         * @returns {dict} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const request = {
            'currency': 'all',
        };
        const response = await this.privateGetUserMargin (this.extend (request, params));
        //
        //     [
        //         {
        //             "account":1455728,
        //             "currency":"XBt",
        //             "riskLimit":1000000000000,
        //             "prevState":"",
        //             "state":"",
        //             "action":"",
        //             "amount":263542,
        //             "pendingCredit":0,
        //             "pendingDebit":0,
        //             "confirmedDebit":0,
        //             "prevRealisedPnl":0,
        //             "prevUnrealisedPnl":0,
        //             "grossComm":0,
        //             "grossOpenCost":0,
        //             "grossOpenPremium":0,
        //             "grossExecCost":0,
        //             "grossMarkValue":0,
        //             "riskValue":0,
        //             "taxableMargin":0,
        //             "initMargin":0,
        //             "maintMargin":0,
        //             "sessionMargin":0,
        //             "targetExcessMargin":0,
        //             "varMargin":0,
        //             "realisedPnl":0,
        //             "unrealisedPnl":0,
        //             "indicativeTax":0,
        //             "unrealisedProfit":0,
        //             "syntheticMargin":null,
        //             "walletBalance":263542,
        //             "marginBalance":263542,
        //             "marginBalancePcnt":1,
        //             "marginLeverage":0,
        //             "marginUsedPcnt":0,
        //             "excessMargin":263542,
        //             "excessMarginPcnt":1,
        //             "availableMargin":263542,
        //             "withdrawableMargin":263542,
        //             "timestamp":"2020-08-03T12:01:01.246Z",
        //             "grossLastValue":0,
        //             "commission":null
        //         }
        //     ]
        //
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {str} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {dict} params extra parameters specific to the bitmex api endpoint
         * @returns {dict} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
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
            'symbol': symbol,
            'bids': [],
            'asks': [],
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const order = response[i];
            const side = (order['side'] === 'Sell') ? 'asks' : 'bids';
            const amount = this.safeNumber (order, 'size');
            const price = this.safeNumber (order, 'price');
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
            'UnrealisedPNL': 'margin',
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
        // ButMEX returns the unrealized pnl from the wallet history endpoint.
        // The unrealized pnl transaction has an empty timestamp.
        // It is not related to historical pnl it has status set to "Pending".
        // Therefore it's not a part of the history at all.
        // https://github.com/ccxt/ccxt/issues/6047
        //
        //     {
        //         "transactID":"00000000-0000-0000-0000-000000000000",
        //         "account":121210,
        //         "currency":"XBt",
        //         "transactType":"UnrealisedPNL",
        //         "amount":-5508,
        //         "fee":0,
        //         "transactStatus":"Pending",
        //         "address":"XBTUSD",
        //         "tx":"",
        //         "text":"",
        //         "transactTime":null,  # ←---------------------------- null
        //         "walletBalance":139198767,
        //         "marginBalance":139193259,
        //         "timestamp":null  # ←---------------------------- null
        //     }
        //
        const id = this.safeString (item, 'transactID');
        const account = this.safeString (item, 'account');
        const referenceId = this.safeString (item, 'tx');
        const referenceAccount = undefined;
        const type = this.parseLedgerEntryType (this.safeString (item, 'transactType'));
        const currencyId = this.safeString (item, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        let amount = this.safeNumber (item, 'amount');
        if (amount !== undefined) {
            amount = amount / 100000000;
        }
        let timestamp = this.parse8601 (this.safeString (item, 'transactTime'));
        if (timestamp === undefined) {
            // https://github.com/ccxt/ccxt/issues/6047
            // set the timestamp to zero, 1970 Jan 1 00:00:00
            // for unrealized pnl and other transactions without a timestamp
            timestamp = 0; // see comments above
        }
        let feeCost = this.safeNumber (item, 'fee', 0);
        if (feeCost !== undefined) {
            feeCost = feeCost / 100000000;
        }
        const fee = {
            'cost': feeCost,
            'currency': code,
        };
        let after = this.safeNumber (item, 'walletBalance');
        if (after !== undefined) {
            after = after / 100000000;
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
        const transactions = this.filterByArray (response, 'transactType', [ 'Withdrawal', 'Deposit' ], false);
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
        const type = this.safeStringLower (transaction, 'transactType');
        // Deposits have no from address or to address, withdrawals have both
        let address = undefined;
        let addressFrom = undefined;
        let addressTo = undefined;
        if (type === 'withdrawal') {
            address = this.safeString (transaction, 'address');
            addressFrom = this.safeString (transaction, 'tx');
            addressTo = address;
        }
        let amountString = this.safeString (transaction, 'amount');
        amountString = Precise.stringDiv (Precise.stringAbs (amountString), '1e8');
        let feeCostString = this.safeString (transaction, 'fee');
        feeCostString = Precise.stringDiv (feeCostString, '1e8');
        const fee = {
            'cost': this.parseNumber (feeCostString),
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
            'network': undefined,
            'addressFrom': addressFrom,
            'address': address,
            'addressTo': addressTo,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'type': type,
            'amount': this.parseNumber (amountString),
            // BTC is the only currency on Bitmex
            'currency': 'BTC',
            'status': status,
            'updated': timestamp,
            'comment': undefined,
            'fee': fee,
        };
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bitmex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {str} symbol unified symbol of the market to fetch the ticker for
         * @param {dict} params extra parameters specific to the bitmex api endpoint
         * @returns {dict} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tickers = await this.fetchTickers ([ market['symbol'] ], params);
        const ticker = this.safeValue (tickers, market['symbol']);
        if (ticker === undefined) {
            throw new BadSymbol (this.id + ' fetchTicker() symbol ' + symbol + ' not found');
        }
        return ticker;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name bitmex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[str]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {dict} params extra parameters specific to the bitmex api endpoint
         * @returns {dict} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetInstrumentActiveAndIndices (params);
        //
        //     [
        //         {
        //             "symbol":".EVOL7D",
        //             "rootSymbol":"EVOL",
        //             "state":"Unlisted",
        //             "typ":"MRIXXX",
        //             "listing":null,
        //             "front":null,
        //             "expiry":null,
        //             "settle":null,
        //             "listedSettle":null,
        //             "relistInterval":null,
        //             "inverseLeg":"",
        //             "sellLeg":"",
        //             "buyLeg":"",
        //             "optionStrikePcnt":null,
        //             "optionStrikeRound":null,
        //             "optionStrikePrice":null,
        //             "optionMultiplier":null,
        //             "positionCurrency":"",
        //             "underlying":"ETH",
        //             "quoteCurrency":"XXX",
        //             "underlyingSymbol":".EVOL7D",
        //             "reference":"BMI",
        //             "referenceSymbol":".BETHXBT",
        //             "calcInterval":"2000-01-08T00:00:00.000Z",
        //             "publishInterval":"2000-01-01T00:05:00.000Z",
        //             "publishTime":null,
        //             "maxOrderQty":null,
        //             "maxPrice":null,
        //             "lotSize":null,
        //             "tickSize":0.01,
        //             "multiplier":null,
        //             "settlCurrency":"",
        //             "underlyingToPositionMultiplier":null,
        //             "underlyingToSettleMultiplier":null,
        //             "quoteToSettleMultiplier":null,
        //             "isQuanto":false,
        //             "isInverse":false,
        //             "initMargin":null,
        //             "maintMargin":null,
        //             "riskLimit":null,
        //             "riskStep":null,
        //             "limit":null,
        //             "capped":false,
        //             "taxed":false,
        //             "deleverage":false,
        //             "makerFee":null,
        //             "takerFee":null,
        //             "settlementFee":null,
        //             "insuranceFee":null,
        //             "fundingBaseSymbol":"",
        //             "fundingQuoteSymbol":"",
        //             "fundingPremiumSymbol":"",
        //             "fundingTimestamp":null,
        //             "fundingInterval":null,
        //             "fundingRate":null,
        //             "indicativeFundingRate":null,
        //             "rebalanceTimestamp":null,
        //             "rebalanceInterval":null,
        //             "openingTimestamp":null,
        //             "closingTimestamp":null,
        //             "sessionInterval":null,
        //             "prevClosePrice":null,
        //             "limitDownPrice":null,
        //             "limitUpPrice":null,
        //             "bankruptLimitDownPrice":null,
        //             "bankruptLimitUpPrice":null,
        //             "prevTotalVolume":null,
        //             "totalVolume":null,
        //             "volume":null,
        //             "volume24h":null,
        //             "prevTotalTurnover":null,
        //             "totalTurnover":null,
        //             "turnover":null,
        //             "turnover24h":null,
        //             "homeNotional24h":null,
        //             "foreignNotional24h":null,
        //             "prevPrice24h":5.27,
        //             "vwap":null,
        //             "highPrice":null,
        //             "lowPrice":null,
        //             "lastPrice":4.72,
        //             "lastPriceProtected":null,
        //             "lastTickDirection":"ZeroMinusTick",
        //             "lastChangePcnt":-0.1044,
        //             "bidPrice":null,
        //             "midPrice":null,
        //             "askPrice":null,
        //             "impactBidPrice":null,
        //             "impactMidPrice":null,
        //             "impactAskPrice":null,
        //             "hasLiquidity":false,
        //             "openInterest":null,
        //             "openValue":0,
        //             "fairMethod":"",
        //             "fairBasisRate":null,
        //             "fairBasis":null,
        //             "fairPrice":null,
        //             "markMethod":"LastPrice",
        //             "markPrice":4.72,
        //             "indicativeTaxRate":null,
        //             "indicativeSettlePrice":null,
        //             "optionUnderlyingPrice":null,
        //             "settledPriceAdjustmentRate":null,
        //             "settledPrice":null,
        //             "timestamp":"2022-05-21T04:30:00.000Z"
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = this.safeString (ticker, 'symbol');
            if (symbol !== undefined) {
                result[symbol] = ticker;
            }
        }
        const uniformSymbols = [];
        if (symbols !== undefined) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const market = this.market (symbol);
                uniformSymbols.push (market['symbol']);
            }
            return this.filterByArray (result, 'symbol', uniformSymbols);
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
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.parse8601 (this.safeString (ticker, 'timestamp'));
        const open = this.safeString (ticker, 'prevPrice24h');
        const last = this.safeString (ticker, 'lastPrice');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'highPrice'),
            'low': this.safeString (ticker, 'lowPrice'),
            'bid': this.safeString (ticker, 'bidPrice'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'askPrice'),
            'askVolume': undefined,
            'vwap': this.safeString (ticker, 'vwap'),
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'homeNotional24h'),
            'quoteVolume': this.safeString (ticker, 'foreignNotional24h'),
            'info': ticker,
        }, market);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "timestamp":"2015-09-25T13:38:00.000Z",
        //         "symbol":"XBTUSD",
        //         "open":237.45,
        //         "high":237.45,
        //         "low":237.45,
        //         "close":237.45,
        //         "trades":0,
        //         "volume":0,
        //         "vwap":null,
        //         "lastSize":null,
        //         "turnover":0,
        //         "homeNotional":0,
        //         "foreignNotional":0
        //     }
        //
        return [
            this.parse8601 (this.safeString (ohlcv, 'timestamp')),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {str} symbol unified symbol of the market to fetch OHLCV data for
         * @param {str} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {dict} params extra parameters specific to the bitmex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
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
        const duration = this.parseTimeframe (timeframe) * 1000;
        const fetchOHLCVOpenTimestamp = this.safeValue (this.options, 'fetchOHLCVOpenTimestamp', true);
        // if since is not set, they will return candles starting from 2017-01-01
        if (since !== undefined) {
            let timestamp = since;
            if (fetchOHLCVOpenTimestamp) {
                timestamp = this.sum (timestamp, duration);
            }
            const ymdhms = this.ymdhms (timestamp);
            request['startTime'] = ymdhms; // starting date filter for results
        } else {
            request['reverse'] = true;
        }
        const response = await this.publicGetTradeBucketed (this.extend (request, params));
        //
        //     [
        //         {"timestamp":"2015-09-25T13:38:00.000Z","symbol":"XBTUSD","open":237.45,"high":237.45,"low":237.45,"close":237.45,"trades":0,"volume":0,"vwap":null,"lastSize":null,"turnover":0,"homeNotional":0,"foreignNotional":0},
        //         {"timestamp":"2015-09-25T13:39:00.000Z","symbol":"XBTUSD","open":237.45,"high":237.45,"low":237.45,"close":237.45,"trades":0,"volume":0,"vwap":null,"lastSize":null,"turnover":0,"homeNotional":0,"foreignNotional":0},
        //         {"timestamp":"2015-09-25T13:40:00.000Z","symbol":"XBTUSD","open":237.45,"high":237.45,"low":237.45,"close":237.45,"trades":0,"volume":0,"vwap":null,"lastSize":null,"turnover":0,"homeNotional":0,"foreignNotional":0}
        //     ]
        //
        const result = this.parseOHLCVs (response, market, timeframe, since, limit);
        if (fetchOHLCVOpenTimestamp) {
            // bitmex returns the candle's close timestamp - https://github.com/ccxt/ccxt/issues/4446
            // we can emulate the open timestamp by shifting all the timestamps one place
            // so the previous close becomes the current open, and we drop the first candle
            for (let i = 0; i < result.length; i++) {
                result[i][0] = result[i][0] - duration;
            }
        }
        return result;
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
        const priceString = this.safeString2 (trade, 'avgPx', 'price');
        const amountString = this.safeString2 (trade, 'size', 'lastQty');
        const execCost = this.safeString (trade, 'execCost');
        const costString = Precise.stringDiv (Precise.stringAbs (execCost), '1e8');
        const id = this.safeString (trade, 'trdMatchID');
        const order = this.safeString (trade, 'orderID');
        const side = this.safeStringLower (trade, 'side');
        // price * amount doesn't work for all symbols (e.g. XBT, ETH)
        let fee = undefined;
        const feeCostString = Precise.stringDiv (this.safeString (trade, 'execComm'), '1e8');
        if (feeCostString !== undefined) {
            const currencyId = this.safeString (trade, 'settlCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (currencyId);
            const feeRateString = this.safeString (trade, 'commission');
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
                'rate': feeRateString,
            };
        }
        // Trade or Funding
        const execType = this.safeString (trade, 'execType');
        let takerOrMaker = undefined;
        if (feeCostString !== undefined && execType === 'Trade') {
            takerOrMaker = Precise.stringLt (feeCostString, '0') ? 'maker' : 'taker';
        }
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const type = this.safeStringLower (trade, 'ordType');
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': order,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': priceString,
            'cost': costString,
            'amount': amountString,
            'fee': fee,
        }, market);
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

    parseTimeInForce (timeInForce) {
        const timeInForces = {
            'Day': 'Day',
            'GoodTillCancel': 'GTC',
            'ImmediateOrCancel': 'IOC',
            'FillOrKill': 'FOK',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "orderID":"56222c7a-9956-413a-82cf-99f4812c214b",
        //         "clOrdID":"",
        //         "clOrdLinkID":"",
        //         "account":1455728,
        //         "symbol":"XBTUSD",
        //         "side":"Sell",
        //         "simpleOrderQty":null,
        //         "orderQty":1,
        //         "price":40000,
        //         "displayQty":null,
        //         "stopPx":null,
        //         "pegOffsetValue":null,
        //         "pegPriceType":"",
        //         "currency":"USD",
        //         "settlCurrency":"XBt",
        //         "ordType":"Limit",
        //         "timeInForce":"GoodTillCancel",
        //         "execInst":"",
        //         "contingencyType":"",
        //         "exDestination":"XBME",
        //         "ordStatus":"New",
        //         "triggered":"",
        //         "workingIndicator":true,
        //         "ordRejReason":"",
        //         "simpleLeavesQty":null,
        //         "leavesQty":1,
        //         "simpleCumQty":null,
        //         "cumQty":0,
        //         "avgPx":null,
        //         "multiLegReportingType":"SingleSecurity",
        //         "text":"Submitted via API.",
        //         "transactTime":"2021-01-02T21:38:49.246Z",
        //         "timestamp":"2021-01-02T21:38:49.246Z"
        //     }
        //
        const status = this.parseOrderStatus (this.safeString (order, 'ordStatus'));
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.parse8601 (this.safeString (order, 'timestamp'));
        const lastTradeTimestamp = this.parse8601 (this.safeString (order, 'transactTime'));
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'orderQty');
        const filled = this.safeString (order, 'cumQty', 0.0);
        const average = this.safeString (order, 'avgPx');
        const id = this.safeString (order, 'orderID');
        const type = this.safeStringLower (order, 'ordType');
        const side = this.safeStringLower (order, 'side');
        const clientOrderId = this.safeString (order, 'clOrdID');
        const timeInForce = this.parseTimeInForce (this.safeString (order, 'timeInForce'));
        const stopPrice = this.safeNumber (order, 'stopPx');
        const execInst = this.safeString (order, 'execInst');
        const postOnly = (execInst === 'ParticipateDoNotInitiate');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {str} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {dict} params extra parameters specific to the bitmex api endpoint
         * @returns {[dict]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = this.iso8601 (since);
        } else {
            // by default reverse=false, i.e. trades are fetched since the time of market inception (year 2015 for XBTUSD)
            request['reverse'] = true;
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
        const market = this.market (symbol);
        const orderType = this.capitalize (type);
        const reduceOnly = this.safeValue (params, 'reduceOnly');
        if (reduceOnly !== undefined) {
            if ((market['type'] !== 'swap') && (market['type'] !== 'future')) {
                throw new InvalidOrder (this.id + ' createOrder() does not support reduceOnly for ' + market['type'] + ' orders, reduceOnly orders are supported for swap and future markets only');
            }
        }
        const request = {
            'symbol': market['id'],
            'side': this.capitalize (side),
            'orderQty': parseFloat (this.amountToPrecision (symbol, amount)), // lot size multiplied by the number of contracts
            'ordType': orderType,
        };
        if (reduceOnly) {
            request['execInst'] = 'ReduceOnly';
        }
        if ((orderType === 'Stop') || (orderType === 'StopLimit') || (orderType === 'MarketIfTouched') || (orderType === 'LimitIfTouched')) {
            const stopPrice = this.safeNumber2 (params, 'stopPx', 'stopPrice');
            if (stopPrice === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a stopPx or stopPrice parameter for the ' + orderType + ' order type');
            } else {
                request['stopPx'] = parseFloat (this.priceToPrecision (symbol, stopPrice));
                params = this.omit (params, [ 'stopPx', 'stopPrice' ]);
            }
        }
        if ((orderType === 'Limit') || (orderType === 'StopLimit') || (orderType === 'LimitIfTouched')) {
            request['price'] = parseFloat (this.priceToPrecision (symbol, price));
        }
        const clientOrderId = this.safeString2 (params, 'clOrdID', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrdID'] = clientOrderId;
            params = this.omit (params, [ 'clOrdID', 'clientOrderId' ]);
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const origClOrdID = this.safeString2 (params, 'origClOrdID', 'clientOrderId');
        if (origClOrdID !== undefined) {
            request['origClOrdID'] = origClOrdID;
            const clientOrderId = this.safeString (params, 'clOrdID', 'clientOrderId');
            if (clientOrderId !== undefined) {
                request['clOrdID'] = clientOrderId;
            }
            params = this.omit (params, [ 'origClOrdID', 'clOrdID', 'clientOrderId' ]);
        } else {
            request['orderID'] = id;
        }
        if (amount !== undefined) {
            request['orderQty'] = amount;
        }
        if (price !== undefined) {
            request['price'] = price;
        }
        const response = await this.privatePutOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        // https://github.com/ccxt/ccxt/issues/6507
        const clientOrderId = this.safeValue2 (params, 'clOrdID', 'clientOrderId');
        const request = {};
        if (clientOrderId === undefined) {
            request['orderID'] = id;
        } else {
            request['clOrdID'] = clientOrderId;
            params = this.omit (params, [ 'clOrdID', 'clientOrderId' ]);
        }
        const response = await this.privateDeleteOrder (this.extend (request, params));
        const order = this.safeValue (response, 0, {});
        const error = this.safeString (order, 'error');
        if (error !== undefined) {
            if (error.indexOf ('Unable to cancel order due to existing state') >= 0) {
                throw new OrderNotFound (this.id + ' cancelOrder() failed: ' + error);
            }
        }
        return this.parseOrder (order);
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        return await this.cancelOrder (ids, symbol, params);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateDeleteOrderAll (this.extend (request, params));
        //
        //     [
        //         {
        //             "orderID": "string",
        //             "clOrdID": "string",
        //             "clOrdLinkID": "string",
        //             "account": 0,
        //             "symbol": "string",
        //             "side": "string",
        //             "simpleOrderQty": 0,
        //             "orderQty": 0,
        //             "price": 0,
        //             "displayQty": 0,
        //             "stopPx": 0,
        //             "pegOffsetValue": 0,
        //             "pegPriceType": "string",
        //             "currency": "string",
        //             "settlCurrency": "string",
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
        //             "multiLegReportingType": "string",
        //             "text": "string",
        //             "transactTime": "2020-06-01T09:36:35.290Z",
        //             "timestamp": "2020-06-01T09:36:35.290Z"
        //         }
        //     ]
        //
        return this.parseOrders (response, market);
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetPosition (params);
        //
        //     [
        //         {
        //             "account": 0,
        //             "symbol": "string",
        //             "currency": "string",
        //             "underlying": "string",
        //             "quoteCurrency": "string",
        //             "commission": 0,
        //             "initMarginReq": 0,
        //             "maintMarginReq": 0,
        //             "riskLimit": 0,
        //             "leverage": 0,
        //             "crossMargin": true,
        //             "deleveragePercentile": 0,
        //             "rebalancedPnl": 0,
        //             "prevRealisedPnl": 0,
        //             "prevUnrealisedPnl": 0,
        //             "prevClosePrice": 0,
        //             "openingTimestamp": "2020-11-09T06:53:59.892Z",
        //             "openingQty": 0,
        //             "openingCost": 0,
        //             "openingComm": 0,
        //             "openOrderBuyQty": 0,
        //             "openOrderBuyCost": 0,
        //             "openOrderBuyPremium": 0,
        //             "openOrderSellQty": 0,
        //             "openOrderSellCost": 0,
        //             "openOrderSellPremium": 0,
        //             "execBuyQty": 0,
        //             "execBuyCost": 0,
        //             "execSellQty": 0,
        //             "execSellCost": 0,
        //             "execQty": 0,
        //             "execCost": 0,
        //             "execComm": 0,
        //             "currentTimestamp": "2020-11-09T06:53:59.893Z",
        //             "currentQty": 0,
        //             "currentCost": 0,
        //             "currentComm": 0,
        //             "realisedCost": 0,
        //             "unrealisedCost": 0,
        //             "grossOpenCost": 0,
        //             "grossOpenPremium": 0,
        //             "grossExecCost": 0,
        //             "isOpen": true,
        //             "markPrice": 0,
        //             "markValue": 0,
        //             "riskValue": 0,
        //             "homeNotional": 0,
        //             "foreignNotional": 0,
        //             "posState": "string",
        //             "posCost": 0,
        //             "posCost2": 0,
        //             "posCross": 0,
        //             "posInit": 0,
        //             "posComm": 0,
        //             "posLoss": 0,
        //             "posMargin": 0,
        //             "posMaint": 0,
        //             "posAllowance": 0,
        //             "taxableMargin": 0,
        //             "initMargin": 0,
        //             "maintMargin": 0,
        //             "sessionMargin": 0,
        //             "targetExcessMargin": 0,
        //             "varMargin": 0,
        //             "realisedGrossPnl": 0,
        //             "realisedTax": 0,
        //             "realisedPnl": 0,
        //             "unrealisedGrossPnl": 0,
        //             "longBankrupt": 0,
        //             "shortBankrupt": 0,
        //             "taxBase": 0,
        //             "indicativeTaxRate": 0,
        //             "indicativeTax": 0,
        //             "unrealisedTax": 0,
        //             "unrealisedPnl": 0,
        //             "unrealisedPnlPcnt": 0,
        //             "unrealisedRoePcnt": 0,
        //             "simpleQty": 0,
        //             "simpleCost": 0,
        //             "simpleValue": 0,
        //             "simplePnl": 0,
        //             "simplePnlPcnt": 0,
        //             "avgCostPrice": 0,
        //             "avgEntryPrice": 0,
        //             "breakEvenPrice": 0,
        //             "marginCallPrice": 0,
        //             "liquidationPrice": 0,
        //             "bankruptPrice": 0,
        //             "timestamp": "2020-11-09T06:53:59.894Z",
        //             "lastPrice": 0,
        //             "lastValue": 0
        //         }
        //     ]
        //
        return this.parsePositions (response, symbols);
    }

    parsePosition (position, market = undefined) {
        //
        //     {
        //         "account": 9371654,
        //         "symbol": "ETHUSDT",
        //         "currency": "USDt",
        //         "underlying": "ETH",
        //         "quoteCurrency": "USDT",
        //         "commission": 0.00075,
        //         "initMarginReq": 0.3333333333333333,
        //         "maintMarginReq": 0.01,
        //         "riskLimit": 1000000000000,
        //         "leverage": 3,
        //         "crossMargin": false,
        //         "deleveragePercentile": 1,
        //         "rebalancedPnl": 0,
        //         "prevRealisedPnl": 0,
        //         "prevUnrealisedPnl": 0,
        //         "prevClosePrice": 2053.738,
        //         "openingTimestamp": "2022-05-21T04:00:00.000Z",
        //         "openingQty": 0,
        //         "openingCost": 0,
        //         "openingComm": 0,
        //         "openOrderBuyQty": 0,
        //         "openOrderBuyCost": 0,
        //         "openOrderBuyPremium": 0,
        //         "openOrderSellQty": 0,
        //         "openOrderSellCost": 0,
        //         "openOrderSellPremium": 0,
        //         "execBuyQty": 2000,
        //         "execBuyCost": 39260000,
        //         "execSellQty": 0,
        //         "execSellCost": 0,
        //         "execQty": 2000,
        //         "execCost": 39260000,
        //         "execComm": 26500,
        //         "currentTimestamp": "2022-05-21T04:35:16.397Z",
        //         "currentQty": 2000,
        //         "currentCost": 39260000,
        //         "currentComm": 26500,
        //         "realisedCost": 0,
        //         "unrealisedCost": 39260000,
        //         "grossOpenCost": 0,
        //         "grossOpenPremium": 0,
        //         "grossExecCost": 39260000,
        //         "isOpen": true,
        //         "markPrice": 1964.195,
        //         "markValue": 39283900,
        //         "riskValue": 39283900,
        //         "homeNotional": 0.02,
        //         "foreignNotional": -39.2839,
        //         "posState": "",
        //         "posCost": 39260000,
        //         "posCost2": 39260000,
        //         "posCross": 0,
        //         "posInit": 13086667,
        //         "posComm": 39261,
        //         "posLoss": 0,
        //         "posMargin": 13125928,
        //         "posMaint": 435787,
        //         "posAllowance": 0,
        //         "taxableMargin": 0,
        //         "initMargin": 0,
        //         "maintMargin": 13149828,
        //         "sessionMargin": 0,
        //         "targetExcessMargin": 0,
        //         "varMargin": 0,
        //         "realisedGrossPnl": 0,
        //         "realisedTax": 0,
        //         "realisedPnl": -26500,
        //         "unrealisedGrossPnl": 23900,
        //         "longBankrupt": 0,
        //         "shortBankrupt": 0,
        //         "taxBase": 0,
        //         "indicativeTaxRate": null,
        //         "indicativeTax": 0,
        //         "unrealisedTax": 0,
        //         "unrealisedPnl": 23900,
        //         "unrealisedPnlPcnt": 0.0006,
        //         "unrealisedRoePcnt": 0.0018,
        //         "simpleQty": null,
        //         "simpleCost": null,
        //         "simpleValue": null,
        //         "simplePnl": null,
        //         "simplePnlPcnt": null,
        //         "avgCostPrice": 1963,
        //         "avgEntryPrice": 1963,
        //         "breakEvenPrice": 1964.35,
        //         "marginCallPrice": 1328.5,
        //         "liquidationPrice": 1328.5,
        //         "bankruptPrice": 1308.7,
        //         "timestamp": "2022-05-21T04:35:16.397Z",
        //         "lastPrice": 1964.195,
        //         "lastValue": 39283900
        //     }
        //
        market = this.safeMarket (this.safeString (position, 'symbol'), market);
        const symbol = market['symbol'];
        const datetime = this.safeString (position, 'timestamp');
        const crossMargin = this.safeValue (position, 'crossMargin');
        const marginMode = (crossMargin === true) ? 'cross' : 'isolated';
        let notional = undefined;
        if (market['quote'] === 'USDT') {
            notional = Precise.stringMul (this.safeString (position, 'foreignNotional'), '-1');
        }
        const maintenanceMargin = this.safeNumber (position, 'maintMargin');
        const unrealisedPnl = this.safeNumber (position, 'unrealisedPnl');
        return {
            'info': position,
            'id': this.safeString (position, 'account'),
            'symbol': symbol,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'hedged': undefined,
            'side': undefined,
            'contracts': undefined,
            'contractSize': undefined,
            'entryPrice': this.safeNumber (position, 'avgEntryPrice'),
            'markPrice': this.safeNumber (position, 'markPrice'),
            'notional': notional,
            'leverage': this.safeNumber (position, 'leverage'),
            'collateral': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': this.safeNumber (position, 'initMarginReq'),
            'maintenanceMargin': this.convertValue (maintenanceMargin, market),
            'maintenanceMarginPercentage': undefined,
            'unrealizedPnl': this.convertValue (unrealisedPnl, market),
            'liquidationPrice': this.safeNumber (position, 'liquidationPrice'),
            'marginMode': marginMode,
            'marginRatio': undefined,
            'percentage': this.safeNumber (position, 'unrealisedPnlPcnt'),
        };
    }

    convertValue (value, market = undefined) {
        if ((value === undefined) || (market === undefined)) {
            return value;
        }
        let resultValue = undefined;
        value = this.numberToString (value);
        if ((market['quote'] === 'USD') || (market['quote'] === 'EUR')) {
            resultValue = Precise.stringMul (value, '0.00000001');
        }
        if (market['quote'] === 'USDT') {
            resultValue = Precise.stringMul (value, '0.000001');
        }
        return parseFloat (resultValue);
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
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        // let currency = this.currency (code);
        if (code !== 'BTC') {
            throw new ExchangeError (this.id + ' supoprts BTC withdrawals only, other currencies coming soon...');
        }
        const currency = this.currency (code);
        const request = {
            'currency': 'XBt', // temporarily
            'amount': amount,
            'address': address,
            // 'otpToken': '123456', // requires if two-factor auth (OTP) is enabled
            // 'fee': 0.001, // bitcoin network fee
        };
        const response = await this.privatePostUserRequestWithdrawal (this.extend (request, params));
        return this.parseTransaction (response, currency);
    }

    async fetchFundingRates (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetInstrumentActiveAndIndices (params);
        //
        //    [
        //        {
        //            "symbol": "LTCUSDT",
        //            "rootSymbol": "LTC",
        //            "state": "Open",
        //            "typ": "FFWCSX",
        //            "listing": "2021-11-10T04:00:00.000Z",
        //            "front": "2021-11-10T04:00:00.000Z",
        //            "expiry": null,
        //            "settle": null,
        //            "listedSettle": null,
        //            "relistInterval": null,
        //            "inverseLeg": "",
        //            "sellLeg": "",
        //            "buyLeg": "",
        //            "optionStrikePcnt": null,
        //            "optionStrikeRound": null,
        //            "optionStrikePrice": null,
        //            "optionMultiplier": null,
        //            "positionCurrency": "LTC",
        //            "underlying": "LTC",
        //            "quoteCurrency": "USDT",
        //            "underlyingSymbol": "LTCT=",
        //            "reference": "BMEX",
        //            "referenceSymbol": ".BLTCT",
        //            "calcInterval": null,
        //            "publishInterval": null,
        //            "publishTime": null,
        //            "maxOrderQty": 1000000000,
        //            "maxPrice": 1000000,
        //            "lotSize": 1000,
        //            "tickSize": 0.01,
        //            "multiplier": 100,
        //            "settlCurrency": "USDt",
        //            "underlyingToPositionMultiplier": 10000,
        //            "underlyingToSettleMultiplier": null,
        //            "quoteToSettleMultiplier": 1000000,
        //            "isQuanto": false,
        //            "isInverse": false,
        //            "initMargin": 0.03,
        //            "maintMargin": 0.015,
        //            "riskLimit": 1000000000000,
        //            "riskStep": 1000000000000,
        //            "limit": null,
        //            "capped": false,
        //            "taxed": true,
        //            "deleverage": true,
        //            "makerFee": -0.0001,
        //            "takerFee": 0.0005,
        //            "settlementFee": 0,
        //            "insuranceFee": 0,
        //            "fundingBaseSymbol": ".LTCBON8H",
        //            "fundingQuoteSymbol": ".USDTBON8H",
        //            "fundingPremiumSymbol": ".LTCUSDTPI8H",
        //            "fundingTimestamp": "2022-01-14T20:00:00.000Z",
        //            "fundingInterval": "2000-01-01T08:00:00.000Z",
        //            "fundingRate": 0.0001,
        //            "indicativeFundingRate": 0.0001,
        //            "rebalanceTimestamp": null,
        //            "rebalanceInterval": null,
        //            "openingTimestamp": "2022-01-14T17:00:00.000Z",
        //            "closingTimestamp": "2022-01-14T18:00:00.000Z",
        //            "sessionInterval": "2000-01-01T01:00:00.000Z",
        //            "prevClosePrice": 138.511,
        //            "limitDownPrice": null,
        //            "limitUpPrice": null,
        //            "bankruptLimitDownPrice": null,
        //            "bankruptLimitUpPrice": null,
        //            "prevTotalVolume": 12699024000,
        //            "totalVolume": 12702160000,
        //            "volume": 3136000,
        //            "volume24h": 114251000,
        //            "prevTotalTurnover": 232418052349000,
        //            "totalTurnover": 232463353260000,
        //            "turnover": 45300911000,
        //            "turnover24h": 1604331340000,
        //            "homeNotional24h": 11425.1,
        //            "foreignNotional24h": 1604331.3400000003,
        //            "prevPrice24h": 135.48,
        //            "vwap": 140.42165,
        //            "highPrice": 146.42,
        //            "lowPrice": 135.08,
        //            "lastPrice": 144.36,
        //            "lastPriceProtected": 144.36,
        //            "lastTickDirection": "MinusTick",
        //            "lastChangePcnt": 0.0655,
        //            "bidPrice": 143.75,
        //            "midPrice": 143.855,
        //            "askPrice": 143.96,
        //            "impactBidPrice": 143.75,
        //            "impactMidPrice": 143.855,
        //            "impactAskPrice": 143.96,
        //            "hasLiquidity": true,
        //            "openInterest": 38103000,
        //            "openValue": 547963053300,
        //            "fairMethod": "FundingRate",
        //            "fairBasisRate": 0.1095,
        //            "fairBasis": 0.004,
        //            "fairPrice": 143.811,
        //            "markMethod": "FairPrice",
        //            "markPrice": 143.811,
        //            "indicativeTaxRate": null,
        //            "indicativeSettlePrice": 143.807,
        //            "optionUnderlyingPrice": null,
        //            "settledPriceAdjustmentRate": null,
        //            "settledPrice": null,
        //            "timestamp": "2022-01-14T17:49:55.000Z"
        //        }
        //    ]
        //
        const filteredResponse = [];
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            const marketId = this.safeString (item, 'symbol');
            const market = this.safeMarket (marketId);
            const swap = this.safeValue (market, 'swap', false);
            if (swap) {
                filteredResponse.push (item);
            }
        }
        return this.parseFundingRates (filteredResponse, symbols);
    }

    parseFundingRate (premiumIndex, market = undefined) {
        //
        //    {
        //        "symbol": "LTCUSDT",
        //        "rootSymbol": "LTC",
        //        "state": "Open",
        //        "typ": "FFWCSX",
        //        "listing": "2021-11-10T04:00:00.000Z",
        //        "front": "2021-11-10T04:00:00.000Z",
        //        "expiry": null,
        //        "settle": null,
        //        "listedSettle": null,
        //        "relistInterval": null,
        //        "inverseLeg": "",
        //        "sellLeg": "",
        //        "buyLeg": "",
        //        "optionStrikePcnt": null,
        //        "optionStrikeRound": null,
        //        "optionStrikePrice": null,
        //        "optionMultiplier": null,
        //        "positionCurrency": "LTC",
        //        "underlying": "LTC",
        //        "quoteCurrency": "USDT",
        //        "underlyingSymbol": "LTCT=",
        //        "reference": "BMEX",
        //        "referenceSymbol": ".BLTCT",
        //        "calcInterval": null,
        //        "publishInterval": null,
        //        "publishTime": null,
        //        "maxOrderQty": 1000000000,
        //        "maxPrice": 1000000,
        //        "lotSize": 1000,
        //        "tickSize": 0.01,
        //        "multiplier": 100,
        //        "settlCurrency": "USDt",
        //        "underlyingToPositionMultiplier": 10000,
        //        "underlyingToSettleMultiplier": null,
        //        "quoteToSettleMultiplier": 1000000,
        //        "isQuanto": false,
        //        "isInverse": false,
        //        "initMargin": 0.03,
        //        "maintMargin": 0.015,
        //        "riskLimit": 1000000000000,
        //        "riskStep": 1000000000000,
        //        "limit": null,
        //        "capped": false,
        //        "taxed": true,
        //        "deleverage": true,
        //        "makerFee": -0.0001,
        //        "takerFee": 0.0005,
        //        "settlementFee": 0,
        //        "insuranceFee": 0,
        //        "fundingBaseSymbol": ".LTCBON8H",
        //        "fundingQuoteSymbol": ".USDTBON8H",
        //        "fundingPremiumSymbol": ".LTCUSDTPI8H",
        //        "fundingTimestamp": "2022-01-14T20:00:00.000Z",
        //        "fundingInterval": "2000-01-01T08:00:00.000Z",
        //        "fundingRate": 0.0001,
        //        "indicativeFundingRate": 0.0001,
        //        "rebalanceTimestamp": null,
        //        "rebalanceInterval": null,
        //        "openingTimestamp": "2022-01-14T17:00:00.000Z",
        //        "closingTimestamp": "2022-01-14T18:00:00.000Z",
        //        "sessionInterval": "2000-01-01T01:00:00.000Z",
        //        "prevClosePrice": 138.511,
        //        "limitDownPrice": null,
        //        "limitUpPrice": null,
        //        "bankruptLimitDownPrice": null,
        //        "bankruptLimitUpPrice": null,
        //        "prevTotalVolume": 12699024000,
        //        "totalVolume": 12702160000,
        //        "volume": 3136000,
        //        "volume24h": 114251000,
        //        "prevTotalTurnover": 232418052349000,
        //        "totalTurnover": 232463353260000,
        //        "turnover": 45300911000,
        //        "turnover24h": 1604331340000,
        //        "homeNotional24h": 11425.1,
        //        "foreignNotional24h": 1604331.3400000003,
        //        "prevPrice24h": 135.48,
        //        "vwap": 140.42165,
        //        "highPrice": 146.42,
        //        "lowPrice": 135.08,
        //        "lastPrice": 144.36,
        //        "lastPriceProtected": 144.36,
        //        "lastTickDirection": "MinusTick",
        //        "lastChangePcnt": 0.0655,
        //        "bidPrice": 143.75,
        //        "midPrice": 143.855,
        //        "askPrice": 143.96,
        //        "impactBidPrice": 143.75,
        //        "impactMidPrice": 143.855,
        //        "impactAskPrice": 143.96,
        //        "hasLiquidity": true,
        //        "openInterest": 38103000,
        //        "openValue": 547963053300,
        //        "fairMethod": "FundingRate",
        //        "fairBasisRate": 0.1095,
        //        "fairBasis": 0.004,
        //        "fairPrice": 143.811,
        //        "markMethod": "FairPrice",
        //        "markPrice": 143.811,
        //        "indicativeTaxRate": null,
        //        "indicativeSettlePrice": 143.807,
        //        "optionUnderlyingPrice": null,
        //        "settledPriceAdjustmentRate": null,
        //        "settledPrice": null,
        //        "timestamp": "2022-01-14T17:49:55.000Z"
        //    }
        //
        const datetime = this.safeString (premiumIndex, 'timestamp');
        const marketId = this.safeString (premiumIndex, 'symbol');
        const fundingDatetime = this.safeString (premiumIndex, 'fundingTimestamp');
        return {
            'info': premiumIndex,
            'symbol': this.safeSymbol (marketId, market),
            'markPrice': this.safeNumber (premiumIndex, 'markPrice'),
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': this.safeNumber (premiumIndex, 'indicativeSettlePrice'),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'fundingRate': this.safeNumber (premiumIndex, 'fundingRate'),
            'fundingTimestamp': this.iso8601 (fundingDatetime),
            'fundingDatetime': fundingDatetime,
            'nextFundingRate': this.safeNumber (premiumIndex, 'indicativeFundingRate'),
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmex#fetchFundingRateHistory
         * @description Fetches the history of funding rates
         * @param {str|undefined} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int|undefined} since timestamp in ms of the earliest funding rate to fetch
         * @param {int|undefined} limit the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure} to fetch
         * @param {dict} params extra parameters specific to the bitmex api endpoint
         * @param {int|undefined} params.till timestamp in ms for ending date filter
         * @param {bool|undefined} params.reverse if true, will sort results newest first
         * @param {int|undefined} params.start starting point for results
         * @param {str|undefined} params.columns array of column names to fetch in info, if omitted, will return all columns
         * @param {str|undefined} params.filter generic table filter, send json key/value pairs, such as {"key": "value"}, you can key on individual fields, and do more advanced querying on timestamps, see the [timestamp docs]{@link https://www.bitmex.com/app/restAPI#Timestamp-Filters} for more details
         * @returns {[dict]} a list of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol in this.currencies) {
            const code = this.currency (symbol);
            request['symbol'] = code['id'];
        } else if (symbol !== undefined) {
            const splitSymbol = symbol.split (':');
            const splitSymbolLength = splitSymbol.length;
            const timeframes = [ 'nearest', 'daily', 'weekly', 'monthly', 'quarterly', 'biquarterly', 'perpetual' ];
            if ((splitSymbolLength > 1) && this.inArray (splitSymbol[1], timeframes)) {
                const code = this.currency (splitSymbol[0]);
                symbol = code['id'] + ':' + splitSymbol[1];
                request['symbol'] = symbol;
            } else {
                market = this.market (symbol);
                request['symbol'] = market['id'];
            }
        }
        if (since !== undefined) {
            request['startTime'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const till = this.safeInteger (params, 'till');
        params = this.omit (params, [ 'till' ]);
        if (till !== undefined) {
            request['endTime'] = this.iso8601 (till);
        }
        const response = await this.publicGetFunding (this.extend (request, params));
        //
        //    [
        //        {
        //            "timestamp": "2016-05-07T12:00:00.000Z",
        //            "symbol": "ETHXBT",
        //            "fundingInterval": "2000-01-02T00:00:00.000Z",
        //            "fundingRate": 0.0010890000000000001,
        //            "fundingRateDaily": 0.0010890000000000001
        //        }
        //    ]
        //
        return this.parseFundingRateHistories (response, market, since, limit);
    }

    parseFundingRateHistory (info, market = undefined) {
        //
        //    {
        //        "timestamp": "2016-05-07T12:00:00.000Z",
        //        "symbol": "ETHXBT",
        //        "fundingInterval": "2000-01-02T00:00:00.000Z",
        //        "fundingRate": 0.0010890000000000001,
        //        "fundingRateDaily": 0.0010890000000000001
        //    }
        //
        const marketId = this.safeString (info, 'symbol');
        const datetime = this.safeString (info, 'timestamp');
        return {
            'info': info,
            'symbol': this.safeSymbol (marketId, market),
            'fundingRate': this.safeNumber (info, 'fundingRate'),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
        };
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        if ((leverage < 0.01) || (leverage > 100)) {
            throw new BadRequest (this.id + ' leverage should be between 0.01 and 100');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['type'] !== 'swap' && market['type'] !== 'future') {
            throw new BadSymbol (this.id + ' setLeverage() supports future and swap contracts only');
        }
        const request = {
            'symbol': market['id'],
            'leverage': leverage,
        };
        return await this.privatePostPositionLeverage (this.extend (request, params));
    }

    async setMarginMode (marginMode, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a symbol argument');
        }
        marginMode = marginMode.toLowerCase ();
        if (marginMode !== 'isolated' && marginMode !== 'cross') {
            throw new BadRequest (this.id + ' setMarginMode() marginMode argument should be isolated or cross');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if ((market['type'] !== 'swap') && (market['type'] !== 'future')) {
            throw new BadSymbol (this.id + ' setMarginMode() supports swap and future contracts only');
        }
        const enabled = (marginMode === 'cross') ? false : true;
        const request = {
            'symbol': market['id'],
            'enabled': enabled,
        };
        return await this.privatePostPositionIsolate (this.extend (request, params));
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
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
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
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
        const url = this.urls['api'][api] + query;
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
