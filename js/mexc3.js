'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadRequest, ExchangeError, ArgumentsRequired, InsufficientFunds } = require ('./base/errors');
const Precise = require ('./base/Precise');

// ---------------------------------------------------------------------------

module.exports = class mexc3 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mexc3',
            'name': 'MEXC Global',
            'countries': [ 'SC' ], // Seychelles
            'rateLimit': 50, // default rate limit is 20 times per second
            'version': 'v3',
            'certified': true,
            'has': {
                'CORS': undefined,
                'spot': undefined,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'addMargin': undefined,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': undefined,
                'createDepositAddress': undefined,
                'createLimitOrder': undefined,
                'createMarketOrder': undefined,
                'createOrder': true,
                'deposit': undefined,
                'editOrder': undefined,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowRate': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchBorrowRates': undefined,
                'fetchBorrowRatesPerSymbol': undefined,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': undefined,
                'fetchCurrencies': undefined,
                'fetchDeposit': undefined,
                'fetchDepositAddress': undefined,
                'fetchDepositAddresses': undefined,
                'fetchDepositAddressesByNetwork': undefined,
                'fetchDeposits': undefined,
                'fetchFundingFee': undefined,
                'fetchFundingFees': undefined,
                'fetchFundingHistory': undefined,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': undefined,
                'fetchFundingRates': undefined,
                'fetchIndexOHLCV': true,
                'fetchL2OrderBook': undefined,
                'fetchLedger': undefined,
                'fetchLedgerEntry': undefined,
                'fetchLeverageTiers': undefined,
                'fetchMarketLeverageTiers': undefined,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': undefined,
                'fetchOrders': undefined,
                'fetchOrderTrades': true,
                'fetchPosition': undefined,
                'fetchPositions': undefined,
                'fetchPositionsRisk': undefined,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': undefined,
                'fetchTradingFees': true,
                'fetchTradingLimits': undefined,
                'fetchTransactions': undefined,
                'fetchTransfers': undefined,
                'fetchWithdrawal': undefined,
                'fetchWithdrawals': undefined,
                'loadMarkets': undefined,
                'privateAPI': true,
                'publicAPI': true,
                'reduceMargin': undefined,
                'setLeverage': undefined,
                'setMarginMode': undefined,
                'setPositionMode': undefined,
                'signIn': undefined,
                'transfer': undefined,
                'withdraw': undefined,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/137283979-8b2a818d-8633-461b-bfca-de89e8c446b2.jpg',
                'api': {
                    'spot': {
                        'public': 'https://api.mexc.com',
                        'private': 'https://api.mexc.com',
                    },
                    'contract': {
                        'public': 'https://contract.mexc.com',
                        'private': 'https://contract.mexc.com',
                    },
                },
                'www': 'https://www.mexc.com/',
                'doc': [
                    'https://mxcdevelop.github.io/apidocs/spot_v3_en/',
                    'https://mxcdevelop.github.io/APIDoc/', // v1 & v2 : soon to be deprecated
                ],
                'fees': [
                    'https://www.mexc.com/fee',
                ],
                'referral': 'https://m.mexc.com/auth/signup?inviteCode=1FQ1G',
            },
            'api': {
                'spot': {
                    'public': {
                        'get': {
                            'ping': 1,
                            'time': 1,
                            'exchangeInfo': 1,
                            'depth': 1,
                            'trades': 1,
                            'historicalTrades': 1,
                            'aggTrades': 1,
                            'klines': 1,
                            'avgPrice': 1,
                            'ticker/24hr': 1,
                            'ticker/price': 1,
                            'ticker/bookTicker': 1,
                            'etf/info': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'order': 1,
                            'openOrders': 1,
                            'allOrders': 1,
                            'account': 1,
                            'myTrades': 1,
                        },
                        'post': {
                            'order': 1,
                            'order/test': 1,
                        },
                        'delete': {
                            'order': 1,
                            'openOrders': 1,
                        },
                    },
                },
                'contract': {
                    'public': {
                        'get': {
                            'ping': 2,
                            'detail': 2,
                            'support_currencies': 2, // TODO: should we implement 'fetchCurrencies' solely for swap? because spot doesnt have it atm
                            'depth/{symbol}': 2,
                            'depth_commits/{symbol}/{limit}': 2,
                            'index_price/{symbol}': 2,
                            'fair_price/{symbol}': 2,
                            'funding_rate/{symbol}': 2,
                            'kline/{symbol}': 2,
                            'kline/index_price/{symbol}': 2,
                            'kline/fair_price/{symbol}': 2,
                            'deals/{symbol}': 2,
                            'ticker': 2,
                            'risk_reverse': 2,
                            'risk_reverse/history': 2,
                            'funding_rate/history': 2,
                        },
                    },
                    'private': {
                        'get': {
                            'account/assets': 2,
                            'account/asset/{currency}': 2,
                            'account/transfer_record': 2,
                            'position/list/history_positions': 2,
                            'position/open_positions': 2,
                            'position/funding_records': 2,
                            'order/list/open_orders/{symbol}': 2,
                            'order/list/history_orders': 2,
                            'order/external/{symbol}/{external_oid}': 2,
                            'order/get/{order_id}': 2,
                            'order/batch_query': 8,
                            'order/deal_details/{order_id}': 2,
                            'order/list/order_deals': 2,
                            'planorder/list/orders': 2,
                            'stoporder/list/orders': 2,
                            'stoporder/order_details/{stop_order_id}': 2,
                            'account/risk_limit': 2,
                            'account/tiered_fee_rate': 2,
                        },
                        'post': {
                            'position/change_margin': 2,
                            'position/change_leverage': 2,
                            'order/submit': 2,
                            'order/submit_batch': 40,
                            'order/cancel': 2,
                            'order/cancel_with_external': 2,
                            'order/cancel_all': 2,
                            'account/change_risk_level': 2,
                            'planorder/place': 2,
                            'planorder/cancel': 2,
                            'planorder/cancel_all': 2,
                            'stoporder/cancel': 2,
                            'stoporder/cancel_all': 2,
                            'stoporder/change_price': 2,
                            'stoporder/change_plan_price': 2,
                        },
                    },
                },
            },
            'timeframes': {
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.2 / 100, // maker / taker
                    'taker': 0.2 / 100,
                },
            },
            'options': {
                'fetchMarkets': {
                    'types': {
                        'spot': true,
                        'future': {
                            'linear': false,
                            'inverse': false,
                        },
                        'swap': {
                            'linear': false,
                            'inverse': false,
                        },
                    },
                },
                'timeframes': {
                    'spot': {
                        '1m': '1m',
                        '3m': '3m',
                        '5m': '5m',
                        '15m': '15m',
                        '30m': '30m',
                        '1h': '1h',
                        '2h': '2h',
                        '4h': '4h',
                        '6h': '6h',
                        '8h': '8h',
                        '12h': '12h',
                        '1d': '1d',
                        '3d': '3d',
                        '1w': '1w',
                        '1M': '1M',
                    },
                    'contract': {
                        '1m': 'Min1',
                        '5m': 'Min5',
                        '15m': 'Min15',
                        '30m': 'Min30',
                        '1h': 'Min60',
                        '4h': 'Hour4',
                        '8h': 'Hour8',
                        '1d': 'Day1',
                        '1w': 'Week1',
                        '1M': 'Month1',
                    },
                },
                'defaultType': 'spot', // spot, swap
                'networks': {
                    'TRX': 'TRC-20',
                    'TRC20': 'TRC-20',
                    'ETH': 'ERC-20',
                    'ERC20': 'ERC-20',
                    'BEP20': 'BEP20(BSC)',
                },
                'recvWindow': 5 * 1000, // 5 sec, default
            },
            'commonCurrencies': {
                'BEYONDPROTOCOL': 'BEYOND',
                'BIFI': 'BIFIF',
                'BYN': 'BeyondFi',
                'COFI': 'COFIX', // conflict with CoinFi
                'DFI': 'DfiStarter',
                'DFT': 'dFuture',
                'DRK': 'DRK',
                'EGC': 'Egoras Credit',
                'FLUX1': 'FLUX', // switched places
                'FLUX': 'FLUX1', // switched places
                'FREE': 'FreeRossDAO', // conflict with FREE Coin
                'HERO': 'Step Hero', // conflict with Metahero
                'MIMO': 'Mimosa',
                'PROS': 'Pros.Finance', // conflict with Prosper
                'SIN': 'Sin City Token',
            },
            'exceptions': {
                'exact': {
                    '-1128': BadRequest,
                    '-2011': BadRequest,
                    '30004': InsufficientFunds,
                    '30019': BadRequest,
                },
                'broad': {
                    'Combination of optional parameters invalid': BadRequest, // {"msg":"Combination of optional parameters invalid.","code":-1128,"_extend":null}
                    'Insufficient position': InsufficientFunds,
                    'Unknown order sent': BadRequest,
                    'api market order is disabled': BadRequest,
                },
            },
        });
    }

    async fetchStatus (params = {}) {
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchStatus', undefined, params);
        let response = undefined;
        let status = undefined;
        if (marketType === 'swap') {
            response = await this.contractPublicGetPing (query);
            //
            //     {}
            //
            const length = Object.keys (response).length;
            status = (length === 0 || this.safeValue (response, 'success')) ? 'ok' : 'maintenance';
        } else {
            response = await this.spotPublicGetPing (query);
            //
            //     {"success":true,"code":"0","data":"1648124374985"}
            //
            status = this.safeValue (response, 'success') ? 'ok' : 'maintenance';
        }
        this.status = this.extend (this.status, {
            'status': status,
            'updated': this.milliseconds (),
        });
        return this.status;
    }

    async fetchTime (params = {}) {
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTime', undefined, params);
        let response = undefined;
        if (marketType === 'swap') {
            response = await this.contractPublicGetPing (query);
            //
            //     {"success":true,"code":"0","data":"1648124374985"}
            //
            return this.safeInteger (response, 'data');
        } else {
            response = await this.spotPublicGetTime (query);
            //
            //     {"serverTime": "1647519277579"}
            //
            return this.safeInteger (response, 'serverTime');
        }
    }

    async fetchMarkets (params = {}) {
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchMarkets', undefined, params);
        if (marketType === 'spot') {
            return await this.fetchSpotMarkets (query);
        } else {
            return await this.fetchSwapMarkets (query);
        }
    }

    async fetchSpotMarkets (params = {}) {
        const response = await this.spotPublicGetExchangeInfo (params);
        //
        //     {
        //         "timezone": "CST",
        //         "serverTime": 1647521860402,
        //         "rateLimits": [],
        //         "exchangeFilters": [],
        //         "symbols": [
        //           {
        //             "symbol": "BTCUSDT",
        //             "status": "ENABLED",
        //             "baseAsset": "BTC",
        //             "baseAssetPrecision": 6,
        //             "quoteAsset": "USDT",
        //             "quotePrecision": 2,
        //             "quoteAssetPrecision": 2,
        //             "baseCommissionPrecision": 6,
        //             "quoteCommissionPrecision": 2,
        //             "orderTypes": [
        //               "LIMIT",
        //               "LIMIT_MAKER"
        //             ],
        //             "icebergAllowed": false,
        //             "ocoAllowed": false,
        //             "quoteOrderQtyMarketAllowed": false,
        //             "isSpotTradingAllowed": true,
        //             "isMarginTradingAllowed": false,
        //             "permissions": [
        //               "SPOT"
        //             ],
        //             "filters": []
        //           },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'symbols', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const status = this.safeString (market, 'status');
            result.push ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': (status === 'ENABLED'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': undefined,
                'maker': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': undefined,
                    'price': this.safeInteger (market, 'quotePrecision'),
                    'base': this.safeInteger (market, 'baseAssetPrecision'),
                    'quote': this.safeInteger (market, 'quoteAssetPrecision'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
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
            });
        }
        return result;
    }

    async fetchSwapMarkets (params = {}) {
        const response = await this.contractPublicGetDetail (params);
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol":"BTC_USDT",
        //                 "displayName":"BTC_USDT永续",
        //                 "displayNameEn":"BTC_USDT SWAP",
        //                 "positionOpenType":3,
        //                 "baseCoin":"BTC",
        //                 "quoteCoin":"USDT",
        //                 "settleCoin":"USDT",
        //                 "contractSize":0.0001,
        //                 "minLeverage":1,
        //                 "maxLeverage":125,
        //                 "priceScale":2,
        //                 "volScale":0,
        //                 "amountScale":4,
        //                 "priceUnit":0.5,
        //                 "volUnit":1,
        //                 "minVol":1,
        //                 "maxVol":1000000,
        //                 "bidLimitPriceRate":0.1,
        //                 "askLimitPriceRate":0.1,
        //                 "takerFeeRate":0.0006,
        //                 "makerFeeRate":0.0002,
        //                 "maintenanceMarginRate":0.004,
        //                 "initialMarginRate":0.008,
        //                 "riskBaseVol":10000,
        //                 "riskIncrVol":200000,
        //                 "riskIncrMmr":0.004,
        //                 "riskIncrImr":0.004,
        //                 "riskLevelLimit":5,
        //                 "priceCoefficientVariation":0.1,
        //                 "indexOrigin":["BINANCE","GATEIO","HUOBI","MXC"],
        //                 "state":0, // 0 enabled, 1 delivery, 2 completed, 3 offline, 4 pause
        //                 "isNew":false,
        //                 "isHot":true,
        //                 "isHidden":false
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseCoin');
            const quoteId = this.safeString (market, 'quoteCoin');
            const settleId = this.safeString (market, 'settleCoin');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const state = this.safeString (market, 'state');
            result.push ({
                'id': id,
                'symbol': base + '/' + quote + ':' + settle,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': 'swap',
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'active': (state === '0'),
                'contract': true,
                'linear': true,
                'inverse': false,
                'taker': this.safeNumber (market, 'takerFeeRate'),
                'maker': this.safeNumber (market, 'makerFeeRate'),
                'contractSize': this.safeNumber (market, 'contractSize'),
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'volUnit'),
                    'price': this.safeNumber (market, 'priceUnit'),
                },
                'limits': {
                    'leverage': {
                        'min': this.safeNumber (market, 'minLeverage'),
                        'max': this.safeNumber (market, 'maxLeverage'),
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minVol'),
                        'max': this.safeNumber (market, 'maxVol'),
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
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let orderbook = undefined;
        if (market['spot']) {
            const response = await this.spotPublicGetDepth (this.extend (request, params));
            //
            //     {
            //         "lastUpdateId": "744267132",
            //         "bids": [
            //             ["40838.50","0.387864"],
            //             ["40837.95","0.008400"],
            //         ],
            //         "asks": [
            //             ["40838.61","6.544908"],
            //             ["40838.88","0.498000"],
            //         ]
            //     }
            //
            orderbook = this.parseOrderBook (response, symbol);
            orderbook['nonce'] = this.safeInteger (response, 'lastUpdateId');
        } else if (market['swap']) {
            const response = await this.contractPublicGetDepthSymbol (this.extend (request, params));
            //
            //     {
            //         "success":true,
            //         "code":0,
            //         "data":{
            //             "asks":[
            //                 [3445.72,48379,1],
            //                 [3445.75,34994,1],
            //             ],
            //             "bids":[
            //                 [3445.55,44081,1],
            //                 [3445.51,24857,1],
            //             ],
            //             "version":2827730444,
            //             "timestamp":1634117846232
            //         }
            //     }
            //
            const data = this.safeValue (response, 'data');
            orderbook = this.parseOrderBook (data, symbol);
            orderbook['nonce'] = this.safeInteger (data, 'version');
        }
        return orderbook;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // if (since !== undefined) {
        //     request['startTime'] = since; bug in api, waiting for fix
        // }
        let method = undefined;
        if (market['spot']) {
            method = this.safeString (params, 'method', 'spotPublicGetAggTrades'); // AggTrades, HistoricalTrades, Trades
        } else if (market['swap']) {
            method = '';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     /trades, /historicalTrades
        //
        //     [
        //         {
        //             "id": null,
        //             "price": "40798.94",
        //             "qty": "0.000508",
        //             "quoteQty": "20.72586152",
        //             "time": "1647546934374",
        //             "isBuyerMaker": true,
        //             "isBestMatch": true
        //         },
        //     ]
        //
        //     /aggrTrades
        //
        //     [
        //         {
        //           "a": null,
        //           "f": null,
        //           "l": null,
        //           "p": "40679",
        //           "q": "0.001309",
        //           "T": 1647551328000,
        //           "m": true,
        //           "M": true
        //         },
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // spot
        //      fetchTrades (for aggTrades)
        //
        //         {
        //             "a": null,
        //             "f": null,
        //             "l": null,
        //             "p": "40679",
        //             "q": "0.001309",
        //             "T": 1647551328000,
        //             "m": true,
        //             "M": true
        //         },
        //
        //      fetchMyTrades, fetchOrderTrades
        //
        //         {
        //             "symbol": "BTCUSDT",
        //             "id": "133948532984922113",
        //             "orderId": "133948532531949568",
        //             "orderListId": "-1",
        //             "price": "41995.51",
        //             "qty": "0.0002",
        //             "quoteQty": "8.399102",
        //             "commission": "0.016798204",
        //             "commissionAsset": "USDT",
        //             "time": "1647718055000",
        //             "isBuyer": true,
        //             "isMaker": false,
        //             "isBestMatch": true
        //         }
        const timestamp = this.safeInteger2 (trade, 'time', 'T');
        market = this.safeMarket (undefined, market);
        const symbol = market['symbol'];
        const priceString = this.safeString2 (trade, 'price', 'p');
        const amountString = this.safeString2 (trade, 'qty', 'q');
        const costString = this.safeString (trade, 'quoteQty');
        const isBuyer = this.safeValue (trade, 'isBuyer');
        const isMaker = this.safeValue (trade, 'isMaker');
        const buyerMaker = this.safeString2 (trade, 'isBuyerMaker', 'm');
        const type = undefined;
        const orderId = this.safeString (trade, 'orderId');
        let side = undefined;
        let takerOrMaker = undefined;
        if (isMaker !== undefined) {
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        if (isBuyer !== undefined) {
            side = isBuyer ? 'buy' : 'sell';
        }
        if (buyerMaker !== undefined) {
            side = buyerMaker ? 'sell' : 'buy';
            takerOrMaker = 'taker';
        }
        let fee = undefined;
        const feeAsset = this.safeString (trade, 'commissionAsset');
        if (feeAsset !== undefined) {
            fee = {
                'cost': this.safeString (trade, 'commission'),
                'currency': this.safeCurrencyCode (feeAsset),
            };
        }
        let id = this.safeString2 (trade, 'id', 'a');
        if (id === undefined) {
            id = this.syntheticTradeId (market, timestamp, side, amountString, priceString, type, takerOrMaker);
        }
        return this.safeTrade ({
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
            'info': trade,
        }, market);
    }

    syntheticTradeId (market = undefined, timestamp = undefined, side = undefined, amount = undefined, price = undefined, orderType = undefined, takerOrMaker = undefined) {
        // TODO: can be unified method? this approach is being used by multiple exchanges (mexc, woo-coinsbit, dydx, ...)
        let id = '';
        if (timestamp !== undefined) {
            id = this.numberToString (timestamp) + '-' + this.safeString (market, 'id', '_');
            if (side !== undefined) {
                id += '-' + side;
            }
            if (amount !== undefined) {
                id += '-' + this.numberToString (amount);
            }
            if (price !== undefined) {
                id += '-' + this.numberToString (price);
            }
            if (takerOrMaker !== undefined) {
                id += '-' + takerOrMaker;
            }
            if (orderType !== undefined) {
                id += '-' + orderType;
            }
        }
        return id;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const options = this.safeValue (this.options, 'timeframes', {});
        const timeframes = this.safeValue (options, market['type'], {});
        const timeframeValue = this.safeString (timeframes, timeframe);
        const request = {
            'symbol': market['id'],
            'interval': timeframeValue,
        };
        let candles = undefined;
        if (market['spot']) {
            if (since !== undefined) {
                request['startTime'] = since;
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            const response = await this.spotPublicGetKlines (this.extend (request, params));
            //
            //     [
            //       [
            //         1640804880000,
            //         "47482.36",
            //         "47482.36",
            //         "47416.57",
            //         "47436.1",
            //         "3.550717",
            //         1640804940000,
            //         "168387.3"
            //       ],
            //     ]
            //
            candles = response;
        } else if (market['swap']) {
            if (since !== undefined) {
                request['start'] = parseInt (since / 1000);
            }
            const priceType = this.safeString (params, 'price', 'default');
            params = this.omit (params, 'price');
            const method = this.getSupportedMapping (priceType, {
                'default': 'contractPublicGetKlineSymbol',
                'index': 'contractPublicGetKlineIndexPriceSymbol',
                'mark': 'contractPublicGetKlineFairPriceSymbol',
            });
            const response = await this[method] (this.extend (request, params));
            //
            //     {
            //         "success":true,
            //         "code":0,
            //         "data":{
            //             "time":[1634052300,1634052360,1634052420],
            //             "open":[3492.2,3491.3,3495.65],
            //             "close":[3491.3,3495.65,3495.2],
            //             "high":[3495.85,3496.55,3499.4],
            //             "low":[3491.15,3490.9,3494.2],
            //             "vol":[1740.0,351.0,314.0],
            //             "amount":[60793.623,12260.4885,10983.1375],
            //         }
            //     }
            //
            candles = this.safeValue (response, 'data');
        }
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    async fetchIndexOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend ({ 'price': 'index' }, params));
    }

    async fetchMarkOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend ({ 'price': 'mark' }, params));
    }

    parseOHLCV (ohlcv, market = undefined) {
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            request['symbol'] = symbols.join (',');
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTickers', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPublicGetTicker24hr',
            'swap': '',
        });
        const response = await this[method] (this.extend (request, query));
        //
        // spot  (Note: for single symbol, only one object is returned, instead of array)
        //
        //     [
        //       {
        //         "symbol": "BTCUSDT",
        //         "priceChange": "184.34",
        //         "priceChangePercent": "0.00400048",
        //         "prevClosePrice": "46079.37",
        //         "lastPrice": "46263.71",
        //         "lastQty": "",
        //         "bidPrice": "46260.38",
        //         "bidQty": "",
        //         "askPrice": "46260.41",
        //         "askQty": "",
        //         "openPrice": "46079.37",
        //         "highPrice": "47550.01",
        //         "lowPrice": "45555.5",
        //         "volume": "1732.461487",
        //         "quoteVolume": null,
        //         "openTime": 1641349500000,
        //         "closeTime": 1641349582808,
        //         "count": null
        //       }
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTickers', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPublicGetTicker24hr',
            'swap': '',
        });
        const response = await this[method] (this.extend (request, query));
        return this.parseTicker (response, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        // spot
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "priceChange": "184.34",
        //         "priceChangePercent": "0.00400048",
        //         "prevClosePrice": "46079.37",
        //         "lastPrice": "46263.71",
        //         "lastQty": "",
        //         "bidPrice": "46260.38",
        //         "bidQty": "",
        //         "askPrice": "46260.41",
        //         "askQty": "",
        //         "openPrice": "46079.37",
        //         "highPrice": "47550.01",
        //         "lowPrice": "45555.5",
        //         "volume": "1732.461487",
        //         "quoteVolume": null,
        //         "openTime": 1641349500000,
        //         "closeTime": 1641349582808,
        //         "count": null
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (ticker, 'closeTime');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'open': this.safeString (ticker, 'openPrice'),
            'high': this.safeString (ticker, 'highPrice'),
            'low': this.safeString (ticker, 'lowPrice'),
            'close': this.safeString (ticker, 'lastPrice'),
            'bid': this.safeString (ticker, 'bidPrice'),
            'bidVolume': this.safeString (ticker, 'bidQty'),
            'ask': this.safeString (ticker, 'askPrice'),
            'askVolume': this.safeString (ticker, 'askQty'),
            'vwap': undefined,
            'previousClose': this.safeString (ticker, 'prevClosePrice'),
            'change': this.safeString (ticker, 'priceChange'),
            'percentage': this.safeString (ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'info': ticker,
        }, market, false);
    }

    async fetchBidsAsks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchBidsAsks', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        let method = undefined;
        if (type === 'spot') {
            method = 'spotPublicGetTickerBookTicker';
        } else {
            method = '';
        }
        const response = await this[method] (query);
        //
        // spot
        //
        //     [
        //       {
        //         "symbol": "AEUSDT",
        //         "bidPrice": "0.11001",
        //         "bidQty": "115.59",
        //         "askPrice": "0.11127",
        //         "askQty": "215.48"
        //       },
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            return await this.createSpotOrder (market, type, side, amount, price, params);
        } else if (market['swap']) {
            return {};
        }
    }

    async createSpotOrder (market, type, side, amount, price = undefined, params = {}) {
        const symbol = market['symbol'];
        const orderSide = (side === 'buy') ? 'BUY' : 'SELL';
        // TODO: needs postOnly handing here, possible with LIMIT_MAKER
        const request = {
            'symbol': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
            'side': orderSide,
            'type': type.toUpperCase (),
        };
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['newClientOrderId'] = clientOrderId;
            params = this.omit (params, [ 'type', 'clientOrderId' ]);
        }
        const response = await this.spotPrivatePostOrder (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": "123738410679123456",
        //         "orderListId": -1
        //     }
        //
        return this.extend (this.parseOrder (response, market), {
            'side': side,
            'type': type,
            'price': price, // TODO: should we do this?
            'amount': amount,
        });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            params = this.omit (params, 'clientOrderId');
            request['origClientOrderId'] = clientOrderId;
        } else {
            request['orderId'] = id;
        }
        const response = await this.spotPrivateDeleteOrder (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": "133734823834447872",
        //         "price": "30000",
        //         "origQty": "0.0002",
        //         "type": "LIMIT",
        //         "side": "BUY"
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.spotPrivateDeleteOpenOrders (this.extend (request, params));
        //
        // spot
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "orderId": "133926492139692032",
        //             "price": "30000",
        //             "origQty": "0.0002",
        //             "type": "LIMIT",
        //             "side": "BUY"
        //         },
        //         {
        //             "symbol": "BTCUSDT",
        //             "orderId": "133926441921286144",
        //             "price": "30000",
        //             "origQty": "0.0002",
        //             "type": "LIMIT",
        //             "side": "BUY"
        //         }
        //     ]
        //
        return this.parseOrders (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            params = this.omit (params, 'clientOrderId');
            request['origClientOrderId'] = clientOrderId;
        } else {
            request['orderId'] = id;
        }
        const response = await this.spotPrivateGetOrder (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": "133734823834147272",
        //         "orderListId": "-1",
        //         "clientOrderId": null,
        //         "price": "30000",
        //         "origQty": "0.0002",
        //         "executedQty": "0",
        //         "cummulativeQuoteQty": "0",
        //         "status": "CANCELED",
        //         "timeInForce": null,
        //         "type": "LIMIT",
        //         "side": "BUY",
        //         "stopPrice": null,
        //         "icebergQty": null,
        //         "time": "1647667102000",
        //         "updateTime": "1647708567000",
        //         "isWorking": true,
        //         "origQuoteOrderQty": "6"
        //     }
        //
        return this.parseOrder (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.spotPrivateGetOpenOrders (this.extend (request, params));
        //
        // spot
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "orderId": "133949373632483328",
        //             "orderListId": "-1",
        //             "clientOrderId": "",
        //             "price": "45000",
        //             "origQty": "0.0002",
        //             "executedQty": "0",
        //             "cummulativeQuoteQty": "0",
        //             "status": "NEW",
        //             "timeInForce": null,
        //             "type": "LIMIT",
        //             "side": "SELL",
        //             "stopPrice": null,
        //             "icebergQty": null,
        //             "time": "1647718255199",
        //             "updateTime": null,
        //             "isWorking": true,
        //             "origQuoteOrderQty": "9"
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.spotPrivateGetAllOrders (this.extend (request, params));
        //
        // spot
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "orderId": "133949373632483328",
        //             "orderListId": "-1",
        //             "clientOrderId": null,
        //             "price": "45000",
        //             "origQty": "0.0002",
        //             "executedQty": "0",
        //             "cummulativeQuoteQty": "0",
        //             "status": "NEW",
        //             "timeInForce": null,
        //             "type": "LIMIT",
        //             "side": "SELL",
        //             "stopPrice": null,
        //             "icebergQty": null,
        //             "time": "1647718255000",
        //             "updateTime": "1647718255000",
        //             "isWorking": true,
        //             "origQuoteOrderQty": "9"
        //         },
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        //
        // spot: createOrder
        //
        //     { "symbol": "BTCUSDT", "orderId": "123738410679123456", "orderListId": -1 }
        //
        // spot: cancelOrder, cancelAllOrders
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": "133926441921286144",
        //         "price": "30000",
        //         "origQty": "0.0002",
        //         "type": "LIMIT",
        //         "side": "BUY"
        //     }
        //
        // spot: fetchOrder, fetchOpenOrders, fetchOrders
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": "133734823834147272",
        //         "orderListId": "-1",
        //         "clientOrderId": null,
        //         "price": "30000",
        //         "origQty": "0.0002",
        //         "executedQty": "0",
        //         "cummulativeQuoteQty": "0",
        //         "status": "CANCELED",
        //         "timeInForce": null,
        //         "type": "LIMIT",
        //         "side": "BUY",
        //         "stopPrice": null,
        //         "icebergQty": null,
        //         "time": "1647667102000",
        //         "updateTime": "1647708567000",
        //         "isWorking": true,
        //         "origQuoteOrderQty": "6"
        //     }
        //
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (order, 'time');
        return this.safeOrder ({
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined, // note: this might be 'updateTime' if order-status is filled, otherwise cancellation time. needs to be checked
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'symbol': market['symbol'],
            'type': this.parseOrderType (this.safeString (order, 'type')),
            'timeInForce': this.parseOrderTimeInForce (this.safeString (order, 'timeInForce')),
            'side': this.parseOrderSide (this.safeString (order, 'side')),
            'price': this.safeNumber (order, 'price'),
            'stopPrice': this.safeNumber (order, 'stopPrice'),
            'average': undefined,
            'amount': this.safeNumber (order, 'origQty'),
            'cost': this.safeNumber (order, 'cummulativeQuoteQty'),  // 'cummulativeQuoteQty' vs 'origQuoteOrderQty'
            'filled': this.safeNumber (order, 'executedQty'),
            'remaining': undefined,
            'fee': undefined,
            'trades': undefined,
            'info': order,
        }, market);
    }

    parseOrderSide (status) {
        const statuses = {
            'BUY': 'buy',
            'SELL': 'sell',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (status) {
        const statuses = {
            'MARKET': 'market',
            'LIMIT': 'limit',
            'LIMIT_MAKER': 'limit',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderStatus (status) {
        const statuses = {
            'NEW': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderTimeInForce (status) {
        const statuses = {
            'GTC': 'GTC',
            'FOK': 'FOK',
            'IOC': 'IOC',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchAccountHelper (params) {
        const response = await this.spotPrivateGetAccount (params);
        //
        // spot
        //
        //     {
        //         "makerCommission": "20",
        //         "takerCommission": "20",
        //         "buyerCommission": "0",
        //         "sellerCommission": "0",
        //         "canTrade": true,
        //         "canWithdraw": true,
        //         "canDeposit": true,
        //         "updateTime": null,
        //         "accountType": "SPOT",
        //         "balances": [
        //             {
        //                 "asset": "BTC",
        //                 "free": "0.002",
        //                 "locked": "0"
        //             },
        //             {
        //                 "asset": "USDT",
        //                 "free": "88.120131350620957006",
        //                 "locked": "0"
        //             },
        //         ],
        //         "permissions": [
        //             "SPOT"
        //         ]
        //     }
        //
        return response;
    }

    async fetchAccounts (params = {}) {
        // TODO: is this method suitable for endpoint response?
        const response = await this.fetchAccountHelper (params);
        const data = this.safeValue (response, 'balances', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const account = data[i];
            const currencyId = this.safeString (account, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            result.push ({
                'id': this.safeString (account, 'id'),
                'type': this.safeString (account, 'type'),
                'code': code,
                'info': account,
            });
        }
        return result;
    }

    async fetchTradingFees (params = {}) {
        const response = await this.fetchAccountHelper (params);
        let makerFee = this.safeString (response, 'makerCommission');
        let takerFee = this.safeString (response, 'takerCommission');
        makerFee = Precise.stringDiv (makerFee, '1000');
        takerFee = Precise.stringDiv (takerFee, '1000');
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'symbol': symbol,
                'maker': this.parseNumber (makerFee),
                'taker': this.parseNumber (takerFee),
                'percentage': true,
                'tierBased': false,
                'info': response,
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        const response = await this.fetchAccountHelper (params);
        const balances = this.safeValue (response, 'balances');
        const result = {};
        for (let i = 0; i < balances.length; i++) {
            const entry = balances[i];
            const currencyId = this.safeString (entry, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (entry, 'free');
            account['used'] = this.safeString (entry, 'locked');
            result[code] = account;
        }
        result['info'] = response;
        return this.safeBalance (result);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.spotPrivateGetMyTrades (this.extend (request, params));
        //
        // spot
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "id": "133948532984922113",
        //             "orderId": "133948532531949568",
        //             "orderListId": "-1",
        //             "price": "41995.51",
        //             "qty": "0.0002",
        //             "quoteQty": "8.399102",
        //             "commission": "0.016798204",
        //             "commissionAsset": "USDT",
        //             "time": "1647718055000",
        //             "isBuyer": true,
        //             "isMaker": false,
        //             "isBestMatch": true
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        params['orderId'] = id;
        return await this.fetchMyTrades (symbol, since, limit, params);
    }

    async fetchFundingRate (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.contractPublicGetFundingRateSymbol (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "code": 0,
        //         "data": {
        //             "symbol": "BTC_USDT",
        //             "fundingRate": 0.000014,
        //             "maxFundingRate": 0.003,
        //             "minFundingRate": -0.003,
        //             "collectCycle": 8,
        //             "nextSettleTime": 1643241600000,
        //             "timestamp": 1643240373359
        //         }
        //     }
        //
        const result = this.safeValue (response, 'data', {});
        return this.parseFundingRate (result, market);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const [ section, access ] = api;
        [ path, params ] = this.resolvePath (path, params);
        let url = undefined;
        if (section === 'spot') {
            url = this.urls['api'][section][access] + '/api/' + this.version + '/' + path;
            let paramsEncoded = '';
            if (access === 'private') {
                params['timestamp'] = Date.now ();
                params['recvWindow'] = this.safeInteger (this.options, 'recvWindow', 5000);
            }
            if (Object.keys (params).length) {
                paramsEncoded = this.urlencode (params);
                url += '?' + paramsEncoded;
            }
            if (access === 'private') {
                this.checkRequiredCredentials ();
                const signature = this.hmac (this.encode (paramsEncoded), this.encode (this.secret), 'sha256');
                url += '&signature=' + signature;
                headers = {
                    'X-MEXC-APIKEY': this.apiKey,
                };
            }
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
            }
        } else if (section === 'contract') {
            url = this.urls['api'][section][access] + '/api/v1/contract/' + path;
            if (access === 'public') {
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            } else {
                this.checkRequiredCredentials ();
                const timestamp = this.milliseconds ().toString ();
                let auth = '';
                headers = {
                    'ApiKey': this.apiKey,
                    'Request-Time': timestamp,
                    'Content-Type': 'application/json',
                };
                if (method === 'POST') {
                    auth = this.json (params);
                    body = auth;
                } else {
                    params = this.keysort (params);
                    if (Object.keys (params).length) {
                        auth += this.urlencode (params);
                        url += '?' + auth;
                    }
                }
                auth = this.apiKey + timestamp + auth;
                const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256');
                headers['Signature'] = signature;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        // spot
        //     {"code":-1128,"msg":"Combination of optional parameters invalid.","_extend":null}
        //
        // contract
        //
        //     {"code":10232,"msg":"The currency not exist"}
        //     {"code":10216,"msg":"No available deposit address"}
        //     {"success":true, "code":0, "data":1634095541710}
        //
        const success = this.safeValue (response, 'success', false); // v1
        if (success === true) {
            return;
        }
        const responseCode = this.safeString (response, 'code', undefined);
        if ((responseCode !== undefined) && (responseCode !== '200') && (responseCode !== '0')) {
            const msg = this.safeString (response, 'msg');
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], msg, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], responseCode, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
