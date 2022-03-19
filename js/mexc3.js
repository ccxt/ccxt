'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadRequest, ExchangeError, ArgumentsRequired, InsufficientFunds } = require ('./base/errors');

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
                'publicAPI': true,
                'privateAPI': true,
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
                'fetchAccounts': undefined,
                'fetchBalance': undefined,
                'fetchBidsAsks': true,
                'fetchBorrowRate': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchBorrowRatesPerSymbol': undefined,
                'fetchBorrowRates': undefined,
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
                'fetchFundingRate': undefined,
                'fetchFundingRateHistory': undefined,
                'fetchFundingRates': undefined,
                'fetchIndexOHLCV': undefined,
                'fetchL2OrderBook': undefined,
                'fetchLedger': undefined,
                'fetchLedgerEntry': undefined,
                'fetchLeverageTiers': undefined,
                'fetchMarketLeverageTiers': undefined,
                'fetchMarkets': true,
                'fetchMarkOHLCV': undefined,
                'fetchMyTrades': undefined,
                'fetchOHLCV': true,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': undefined,
                'fetchOrders': undefined,
                'fetchOrderTrades': undefined,
                'fetchPosition': undefined,
                'fetchPositions': undefined,
                'fetchPositionsRisk': undefined,
                'fetchPremiumIndexOHLCV': undefined,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': undefined,
                'fetchTradingFees': undefined,
                'fetchTradingLimits': undefined,
                'fetchTransactions': undefined,
                'fetchTransfers': undefined,
                'fetchWithdrawal': undefined,
                'fetchWithdrawals': undefined,
                'loadMarkets': undefined,
                'reduceMargin': undefined,
                'setLeverage': undefined,
                'setMarginMode': undefined,
                'setPositionMode': undefined,
                'signIn': undefined,
                'transfer': undefined,
                'withdraw': undefined,
            },
            'timeframes': {
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/137283979-8b2a818d-8633-461b-bfca-de89e8c446b2.jpg',
                'api': {
                    'spot': {
                        'public': 'https://api.mexc.com',
                        'private': 'https://api.mexc.com',
                    },
                },
                'www': 'https://www.mexc.com/',
                'doc': [
                    'https://mxcdevelop.github.io/apidocs/spot_v3_en/',
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

                },
                'broad': {
                    'Combination of optional parameters invalid': BadRequest, // {"msg":"Combination of optional parameters invalid.","code":-1128,"_extend":null}
                    'Insufficient position': InsufficientFunds,
                    'Unknown order sent.': BadRequest,
                },
            },
        });
    }

    async fetchStatus (params = {}) {
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchStatus', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPublicGetPing',
            'swap': '',
        });
        const response = await this[method] (this.extend (query));
        //
        // {}
        //
        const length = Object.keys (response).length;
        const status = length === 0 ? 'ok' : 'maintenance';
        this.status = this.extend (this.status, {
            'status': status,
            'updated': this.milliseconds (),
        });
        return this.status;
    }

    async fetchTime (params = {}) {
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTime', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPublicGetTime',
            'swap': '',
        });
        const response = await this[method] (this.extend (query));
        //
        // spot
        //
        //     {
        //         "serverTime": "1647519277579"
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    async fetchMarkets (params = {}) {
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

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = undefined;
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (market['spot']) {
            method = 'spotPublicGetDepth';
        } else if (market['swap']) {
            method = '';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "lastUpdateId": "744267132",
        //         "bids": [
        //             [
        //                 "40838.50",
        //                 "0.387864"
        //             ],
        //             [
        //                 "40837.95",
        //                 "0.008400"
        //             ],
        //         ],
        //         "asks": [
        //             [
        //                 "40838.61",
        //                 "6.544908"
        //             ],
        //             [
        //                 "40838.88",
        //                 "0.498000"
        //             ],
        //         ]
        //     }
        //
        const orderbook = this.parseOrderBook (response, symbol);
        orderbook['nonce'] = this.safeInteger (response, 'lastUpdateId');
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
        if (since !== undefined) {
            // request['startTime'] = since; bug in api, waiting for fix
        }
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
        const timestamp = this.safeInteger2 (trade, 'time', 'T');
        market = this.safeMarket (undefined, market);
        const symbol = market['symbol'];
        const priceString = this.safeString2 (trade, 'price', 'p');
        const amountString = this.safeString2 (trade, 'qty', 'q');
        const costString = this.safeString (trade, 'quoteQty');
        const buyerMaker = this.safeString2 (trade, 'isBuyerMaker', 'm');
        const type = undefined;
        let side = undefined;
        let takerOrMaker = undefined;
        if (buyerMaker !== undefined) {
            side = buyerMaker ? 'sell' : 'buy';
            takerOrMaker = 'taker';
        }
        let id = this.safeString2 (trade, 'id', 'a');
        if (id === undefined) {
            id = this.syntheticTradeId (market, timestamp, side, amountString, priceString, type, takerOrMaker);
        }
        return this.safeTrade ({
            'id': id,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': undefined,
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
        const request = {
            'symbol': market['id'],
            'interval': timeframes[timeframe],
        };
        let method = undefined;
        if (market['spot']) {
            method = 'spotPublicGetKlines';
            if (since !== undefined) {
                request['startTime'] = since;
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
        } else if (market['swap']) {
            method = '';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
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
        return this.parseOHLCVs (response, market, timeframe, since, limit);
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
            'cost': this.safeNumber (order, 'origQuoteOrderQty'),  // 'cummulativeQuoteQty' vs 'origQuoteOrderQty' probably refers pre-update state
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const [ section, access ] = api;
        [ path, params ] = this.resolvePath (path, params);
        let url = this.urls['api'][section][access] + '/api/' + this.version + '/' + path;
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
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        //     {"msg":"Combination of optional parameters invalid.","code":-1128,"_extend":null}
        //
        const errorCode = this.safeValue (response, 'code');
        if (errorCode !== undefined) {
            const msg = this.safeString (response, 'msg');
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], msg, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
