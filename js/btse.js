'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest, BadSymbol, ArgumentsRequired, InsufficientFunds, PermissionDenied, InvalidOrder } = require ('./base/errors');

module.exports = class btse extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btse',
            'name': 'BTSE',
            'countries': [ 'VG' ], // British Virgin Islands
            'version': 'v1',
            'rateLimit': 1000 / 75,
            // ordering 75 per second => 1000 / 75 = 13.33 (cost = 1)
            // query 15 req per second => 75/15 = cost = 5
            'has': {
                'CORS': false,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'createDepositAddress': true,
                'createOrder': true,
                'fetchBalance': false,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': true,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRates': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPositions': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'setLeverage': true,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '6h': '360',
                '1d': '1440',
            },
            'urls': {
                'logo': 'https://s2.coinmarketcap.com/static/img/coins/64x64/5305.png',
                'api': {
                    'spot': 'https://api.btse.com/spot/api/v3.2',
                    'future': 'https://api.btse.com/futures/api/v2.1',
                },
                'test': {
                    'spot': 'https://testapi.btse.io/spot/api/v3.2',
                    'future': 'https://testapi.btse.io/futures/api/v2.1',
                },
                'www': 'https://www.btse.com/en/home',
                'doc': 'https://btsecom.github.io/docs/',
            },
            'api': {
                'spot': {
                    'public': {
                        'get': {
                            'availableCurrencyNetworks': 5,
                            'availableCurrencies': 5,
                            'market_summary': 5,
                            'ohlcv': 5,
                            'price': 5,
                            'orderbook/L2': 5,
                            'orderbook/{symbol}': 5,
                            'trades': 5,
                            'time': 5,
                            'get-stats': 5,
                            'exchangeRate': 5,
                        },
                    },
                    'private': {
                        'get': {
                            'user/fees': 5,
                            'user/open_orders': 5,
                            'user/trade_history': 5,
                            'user/wallet_history': 5,
                            'user/wallet': 5,
                            'user/wallet/address': 5,
                        },
                        'post': {
                            'order': 1,
                            'order/cancelAllAfter': 1,
                            'order/peg': 1,
                            'user/wallet/convert': 1,
                            'user/wallet/address': 1,
                            'user/wallet/withdraw': 1,
                            'user/wallet/transfer': 1,
                        },
                        'put': {
                            'order': 1,
                        },
                        'delete': {
                            'order': 1,
                        },
                    },
                },
                'future': {
                    'public': {
                        'get': {
                            'market_summary': 5,
                            'ohlcv': 5,
                            'price': 5,
                            'orderbook/L2': 5,
                            'orderbook/{symbol}': 5,
                            'trades': 5,
                            'time': 5,
                            'get-stats': 5,
                        },
                    },
                    'private': {
                        'get': {
                            'settle_in': 5,
                            'user/fees': 5,
                            'user/open_orders': 5,
                            'user/trade_history': 5,
                            'user/wallet_history': 5,
                            'user/wallet': 5,
                        },
                        'post': {
                            'order': 1,
                            'order/peg': 1,
                            'order/cancelAllAfter': 1,
                            'order/close_position': 1,
                            'risk_limit': 1,
                            'leverage': 1,
                        },
                        'put': {
                            'order': 1,
                        },
                        'delete': {
                            'order': 1,
                        },
                    },
                },
            },
            'options': {
                'defaultType': 'spot',
            },
            'exceptions': {
                'exact': {
                    '-1': BadRequest, // {"code":-1,"msg":null,"time":1643322746173,"data":null,"success":false}
                    '400': BadRequest, // {"code":400,"msg":"Bad Request","time":1643740010897,"data":null,"success":false}
                    '403': PermissionDenied, // {"code":403,"msg":"FORBIDDEN: invalid API key","time":1643739538434,"data":null,"success":false}
                    '4002': InvalidOrder, // {"code":4002,"msg":"BADREQUEST: The order size cannot be less than the minimum","time":1643739721769,"data":null,"success":false}
                    '4005': InvalidOrder, // btse {"code":4005,"msg":"BADREQUEST: The order price cannot be less than minimum","time":1643739806754,"data":null,"success":false}
                    '51523': InsufficientFunds, // {"code":51523,"msg":"BADREQUEST: Insufficient wallet balance","time":1643739392461,"data":null,"success":false}
                    '10071': BadRequest, // {"code":10071,"msg":"BADREQUEST: 转账参数错误","time":1643727219192,"data":null,"success":false}
                    '80005': BadSymbol, // {"code":80005,"msg":"BADREQUEST: product_id invalid","time":1643385790496,"data":null,"success":false}
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.spotPublicGetMarketSummary (params);
        // [
        //   {
        //      "symbol":"1INCH-AED",
        //      "last":0.0,
        //      "lowestAsk":0.0,
        //      "highestBid":0.0,
        //      "percentageChange":0.887761573,
        //      "volume":6679180.080848128,
        //      "high24Hr":6.038055,
        //      "low24Hr":5.417631,
        //      "base":"1INCH",
        //      "quote":"AED",
        //      "active":true,
        //      "size":1150813.46023945,
        //      "minValidPrice":0.001,
        //      "minPriceIncrement":0.001,
        //      "minOrderSize":0.1,
        //      "maxOrderSize":300000.0,
        //      "minSizeIncrement":0.1,
        //      "openInterest":0.0,
        //      "openInterestUSD":0.0,
        //      "contractStart":0,
        //      "contractEnd":0,
        //      "timeBasedContract":false,
        //      "openTime":0,
        //      "closeTime":0,
        //      "startMatching":0,
        //      "inactiveTime":0,
        //      "fundingRate":0.0,
        //      "contractSize":0.0,
        //      "maxPosition":0,
        //      "minRiskLimit":0,
        //      "maxRiskLimit":0,
        //      "availableSettlement":null,
        //      "futures":false
        //   },
        // ]
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const minQuantity = this.safeNumber (market, 'minOrderSize');
            const maxQuantity = this.safeNumber (market, 'maxOrderSize');
            const minPriceIncrement = this.safeNumber (market, 'minPriceIncrement');
            const active = this.safeString (market, 'active');
            const precision = {
                'amount': this.safeInteger (market, 'minQty'),
                'price': minQuantity,
            };
            result.push ({
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'maker': undefined,
                'taker': undefined,
                'linear': undefined,
                'inverse': undefined,
                'settle': undefined,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': undefined,
                'future': false,
                'swap': false,
                'option': false,
                'optionType': undefined,
                'strike': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'contract': false,
                'contractSize': undefined,
                'active': (active === 'active'),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.parseNumber (minQuantity),
                        'max': maxQuantity,
                    },
                    'price': {
                        'min': minPriceIncrement,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        const futuresResponse = await this.futurePublicGetMarketSummary (params);
        // [
        //      {
        //          "symbol":"XRPPFC",
        //          "last":0.6095,
        //          "lowestAsk":0.6095,
        //          "highestBid":0.6083,
        //          "openInterest":559988.0,
        //          "openInterestUSD":340930.27,
        //          "percentageChange":0.8271,
        //          "volume":995720.3549,
        //          "high24Hr":0.665,
        //          "low24Hr":0.5936,
        //          "base":"XRP",
        //          "quote":"USD",
        //          "contractStart":0,
        //          "contractEnd":0,
        //          "active":true,
        //          "timeBasedContract":false,
        //          "openTime":0,
        //          "closeTime":0,
        //          "startMatching":0,
        //          "inactiveTime":0,
        //          "fundingRate":1.2499999999999999E-5,
        //          "contractSize":1.0,
        //          "maxPosition":5000000,
        //          "minValidPrice":1.0E-4,
        //          "minPriceIncrement":1.0E-4,
        //          "minOrderSize":1,
        //          "maxOrderSize":100000,
        //          "minRiskLimit":50000,
        //          "maxRiskLimit":500000,
        //          "minSizeIncrement":1.0,
        //          "availableSettlement":[
        //             "USD",
        //             "LTC",
        //             "BTC",
        //             "USDT",
        //             "USDC",
        //             "USDP"
        //          ]
        //       },
        // ]
        for (let i = 0; i < futuresResponse.length; i++) {
            const market = futuresResponse[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let symbol = base + '/' + quote + ':' + quote;
            let expiry = this.safeIntegerProduct (market, 'contractEnd', 1000);
            if (expiry === 0) {
                expiry = undefined;
            }
            let type = 'swap';
            if (expiry !== undefined) {
                type = 'future';
                symbol = symbol + '-' + this.yymmdd (expiry);
            }
            const minQuantity = this.safeNumber (market, 'minOrderSize');
            const maxQuantity = this.safeNumber (market, 'maxOrderSize');
            const minPriceIncrement = this.safeNumber (market, 'minPriceIncrement');
            const active = this.safeString (market, 'active');
            const precision = {
                'amount': this.safeInteger (market, 'minQty'),
                'price': minQuantity,
            };
            result.push ({
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'maker': undefined,
                'taker': undefined,
                'linear': false,
                'inverse': true,
                'settle': quote,
                'settleId': quoteId,
                'type': type,
                'spot': false,
                'margin': undefined,
                'future': (type === 'future'),
                'swap': (type === 'swap'),
                'option': false,
                'optionType': undefined,
                'strike': undefined,
                'expiry': expiry,
                'expiryDatetime': this.iso8601 (expiry),
                'contract': true,
                'contractSize': undefined,
                'active': (active === 'active'),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.parseNumber (minQuantity),
                        'max': maxQuantity,
                    },
                    'price': {
                        'min': minPriceIncrement,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
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
        if (limit) {
            request['depth'] = limit;
        }
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'spotPublicGetOrderbookL2',
            'future': 'futurePublicFutureGetOrderbookL2',
            'swap': 'futurePublicFutureGetOrderbookL2',
        });
        const response = await this[method] (this.extend (request, params));
        //
        // {
        //     "buyQuote":[
        //        {
        //           "price":"0.6050",
        //           "size":"9079"
        //        },
        //     ],
        //     "sellQuote":[
        //        {
        //           "price":"0.6105",
        //           "size":"20414"
        //        }
        //     ],
        //     "lastPrice":"0.6103",
        //     "timestamp":1643235771013,
        //     "gain":-1,
        //     "symbol":"XRPPFC"
        //  }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, symbol, timestamp, 'buyQuote', 'sellQuote', 'price', 'size');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'spotPublicGetMarketSummary',
            'future': 'futurePublicGetMarketSummary',
            'swap': 'futurePublicGetMarketSummary',
        });
        const response = await this[method] (this.extend (request, params));
        //
        //   {
        //      "symbol":"1INCH-AED",
        //      "last":0.0,
        //      "lowestAsk":0.0,
        //      "highestBid":0.0,
        //      "percentageChange":0.887761573,
        //      "volume":6679180.080848128,
        //      "high24Hr":6.038055,
        //      "low24Hr":5.417631,
        //      "base":"1INCH",
        //      "quote":"AED",
        //      "active":true,
        //      "size":1150813.46023945,
        //      "minValidPrice":0.001,
        //      "minPriceIncrement":0.001,
        //      "minOrderSize":0.1,
        //      "maxOrderSize":300000.0,
        //      "minSizeIncrement":0.1,
        //      "openInterest":0.0,
        //      "openInterestUSD":0.0,
        //      "contractStart":0,
        //      "contractEnd":0,
        //      "timeBasedContract":false,
        //      "openTime":0,
        //      "closeTime":0,
        //      "startMatching":0,
        //      "inactiveTime":0,
        //      "fundingRate":0.0,
        //      "contractSize":0.0,
        //      "maxPosition":0,
        //      "minRiskLimit":0,
        //      "maxRiskLimit":0,
        //      "availableSettlement":null,
        //      "futures":false
        //   }
        //
        const ticker = this.safeValue (response, 0, {});
        return this.parseTicker (ticker, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'spotPublicGetTrades',
            'future': 'futurePublicGetTrades',
            'swap': 'futurePublicGetTrades',
        });
        const response = await this[method] (this.extend (request, params));
        //
        // [
        //     {
        //        "price":2342.419875836,
        //        "size":0.2036,
        //        "side":"SELL",
        //        "symbol":"ETH-USDT",
        //        "serialId":131094468,
        //        "timestamp":1643317552000
        //     },
        // ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        //     {
        //        "tradeId":"6f634cf5-428b-4e03-bfd6-4eafd1ffb462",
        //        "orderId":"2af14921-5e92-414b-b67a-d39415aae9bb",
        //        "username":"lima007",
        //        "side":"BUY",
        //        "orderType":"77",
        //        "triggerType":null,
        //        "price":"0.0",
        //        "size":"1",
        //        "filledPrice":"43800.0",
        //        "filledSize":"1",
        //        "triggerPrice":"0.0",
        //        "base":"BTC",
        //        "quote":"USD",
        //        "symbol":"BTCM22",
        //        "feeCurrency":"USD",
        //        "feeAmount":"0.0219",
        //        "wallet":"CROSS@",
        //        "realizedPnl":"0.0",
        //        "total":"-0.0219",
        //        "serialId":"5180917",
        //        "timestamp":"1643639344646",
        //        "clOrderID":"_wystkl1643639343571",
        //        "averageFillPrice":"43800.0"
        //     }
        //
        const id = this.safeString (trade, 'tradeId');
        const orderId = this.safeString (trade, 'orderId');
        const timestamp = this.safeInteger (trade, 'timestamp');
        const datetime = this.iso8601 (timestamp);
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const side = this.safeStringLower (trade, 'side');
        const price = this.safeNumber (trade, 'price');
        const amount = this.safeNumber (trade, 'size');
        const feeCurrencyId = this.safeString (trade, 'feeCurrency');
        const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
        const feeCost = this.safeNumber (trade, 'feeAmount');
        const fee = {
            'cost': feeCost,
            'currency': feeCurrencyCode,
        };
        const type = this.parseOrderType (this.safeString (trade, 'orderType'));
        const cost = this.safeNumber (trade, 'total');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'order': orderId,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        });
    }

    parseTicker (ticker, market = undefined) {
        //
        //
        //   {
        //      "symbol":"1INCH-AED",
        //      "last":0.0,
        //      "lowestAsk":0.0,
        //      "highestBid":0.0,
        //      "percentageChange":0.887761573,
        //      "volume":6679180.080848128,
        //      "high24Hr":6.038055,
        //      "low24Hr":5.417631,
        //      "base":"1INCH",
        //      "quote":"AED",
        //      "active":true,
        //      "size":1150813.46023945,
        //      "minValidPrice":0.001,
        //      "minPriceIncrement":0.001,
        //      "minOrderSize":0.1,
        //      "maxOrderSize":300000.0,
        //      "minSizeIncrement":0.1,
        //      "openInterest":0.0,
        //      "openInterestUSD":0.0,
        //      "contractStart":0,
        //      "contractEnd":0,
        //      "timeBasedContract":false,
        //      "openTime":0,
        //      "closeTime":0,
        //      "startMatching":0,
        //      "inactiveTime":0,
        //      "fundingRate":0.0,
        //      "contractSize":0.0,
        //      "maxPosition":0,
        //      "minRiskLimit":0,
        //      "maxRiskLimit":0,
        //      "availableSettlement":null,
        //      "futures":false
        //   }
        //
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeString (ticker, 'last');
        const open = this.safeString (ticker, 'lastPrice');
        const volume = this.safeString (ticker, 'volume');
        const high = this.safeString (ticker, 'high24Hr');
        const low = this.safeString (ticker, 'low24Hr');
        const change = this.safeString (ticker, 'percentageChange');
        const ask = this.safeString (ticker, 'lowestAsk');
        const bid = this.safeString (ticker, 'highestBid');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': change,
            'average': undefined,
            'baseVolume': volume,
            'quoteVolume': undefined,
            'info': ticker,
        }, market, false);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        // [
        //    1643155200,
        //    2460.6,
        //    2722.75,
        //    2402.25,
        //    2464.3,
        //    2.7827867792979002E7
        // ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'resolution': this.timeframes[timeframe],
        };
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'spotPublicGetOhlcv',
            'future': 'futurePublicGetOhlcv',
            'swap': 'futurePublicGetOhlcv',
        });
        const response = await this[method] (this.extend (request, params));
        //
        //     [
        //         [
        //            1643155200,
        //            2460.6,
        //            2722.75,
        //            2402.25,
        //            2464.3,
        //            2.7827867792979002E7
        //         ],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchTime (params = {}) {
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTime', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPublicGetTime',
            'future': 'futurePublicGetTime',
            'swap': 'futurePublicGetTime',
        });
        const response = await this[method] (query);
        // {
        //     "iso": "2021-06-29T18:14:30.886Z",
        //     "epoch": 1624990470
        // }
        return this.safeInteger (response, 'epoch');
    }

    parseSpotBalance (response) {
        // [
        //    {
        //        "currency":"USD",
        //        "total":"10000.0",
        //        "available":"10000.0"
        //    }
        // ]
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'total');
            account['free'] = this.safeString (balance, 'available');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    parseFutureBalance (response) {
        // [
        //   {
        //       "wallet":"CROSS@",
        //       "totalValue":"1999.7766",
        //       "marginBalance":"1995.2805514",
        //       "availableBalance":"1995.083540344",
        //       "unrealisedProfitLoss":"-4.4960486",
        //       "maintenanceMargin":"0.197011056",
        //       "leverage":"0.01969845863150531",
        //       "openMargin":"0.0",
        //       "assets":[
        //          {
        //             "balance":"1999.7766",
        //             "assetPrice":"1.0",
        //             "currency":"USD",
        //             "display":false
        //          }
        //       ],
        //       "assetsInUse":[
        //          {
        //             "balance":"4.693059656",
        //             "assetPrice":"0.0",
        //             "currency":"USD",
        //             "display":false
        //          }
        //       ]
        //    }
        //  {
        //     "wallet":"ISOLATED@LINKPFC-USD",
        //     "totalValue":"0.0",
        //     "marginBalance":"0.0",
        //     "availableBalance":"0.0",
        //     "unrealisedProfitLoss":"0.0",
        //     "maintenanceMargin":"0.0",
        //     "leverage":"0.0",
        //     "openMargin":"0.0",
        //     "assets":[
        //     ],
        //     "assetsInUse":[
        //     ]
        //  }
        // ]
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const assets = this.safeValue (balance, 'assets', []);
            const assetsInUse = this.safeValue (balance, 'assetsInUse', []);
            if (assets.length > 0) {
                for (let v = 0; v < assets.length; v++) {
                    const asset = assets[v];
                    const currencyId = this.safeString (asset, 'currency');
                    const code = this.safeCurrencyCode (currencyId);
                    const account = this.account ();
                    account['total'] = this.safeString (asset, 'balance');
                    if (assetsInUse.indexOf (v) !== -1) {
                        account['used'] = this.safeString (assetsInUse[v], 'balance');
                    }
                    account['free'] = this.safeString (balance, 'availableBalance');
                    result[code] = account;
                }
            }
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPrivateGetUserWallet',
            'future': 'futurePrivateGetUserWallet',
            'swap': 'futurePrivateGetUserWallet',
        });
        const response = await this[method] (query);
        // spot
        // [
        //    {
        //        "currency":"USD",
        //        "total":"10000.0",
        //        "available":"10000.0"
        //     }
        // ]
        //
        // future
        // [
        //    {
        //       "wallet":"CROSS@",
        //       "totalValue":"1999.7766",
        //       "marginBalance":"1995.27478958",
        //       "availableBalance":"1995.077807405",
        //       "unrealisedProfitLoss":"-4.50181042",
        //       "maintenanceMargin":"0.196982175",
        //       "leverage":"0.01969517188397688",
        //       "openMargin":"0.0",
        //       "assets":[
        //          {
        //             "balance":"1999.7766",
        //             "assetPrice":"1.0",
        //             "currency":"USD",
        //             "display":false
        //          }
        //       ],
        //       "assetsInUse":[
        //          {
        //             "balance":"4.698792595",
        //             "assetPrice":"0.0",
        //             "currency":"USD",
        //             "display":false
        //          }
        //       ]
        //     }
        //   {
        //      "wallet":"ISOLATED@LINKPFC-USD",
        //      "totalValue":"0.0",
        //      "marginBalance":"0.0",
        //      "availableBalance":"0.0",
        //      "unrealisedProfitLoss":"0.0",
        //      "maintenanceMargin":"0.0",
        //      "leverage":"0.0",
        //      "openMargin":"0.0",
        //      "assets":[
        //      ],
        //      "assetsInUse":[
        //      ]
        //   }
        // ];
        //
        const parser = this.getSupportedMapping (marketType, {
            'spot': 'parseSpotBalance',
            'future': 'parseFutureBalance',
            'swap': 'parseFutureBalance',
        });
        return this[parser] (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            '1': 'open',
            '2': 'open',
            '4': 'closed',
            '5': 'open',
            '6': 'canceled',
            '9': 'canceled',
            '10': 'opended',
            '15': 'rejected',
            'STATUS_ACTIVE': 'open',
            'STATUS_INACTIVE': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (status) {
        const statuses = {
            '76': 'limit',
            '77': 'market',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        // spot/future open orders
        // [
        //     {
        //        "orderType":"76",
        //        "price":"5.0",
        //        "size":"10.0",
        //        "side":"BUY",
        //        "orderValue":"50.0",
        //        "filledSize":"0.0",
        //        "pegPriceMin":"0.0",
        //        "pegPriceMax":"0.0",
        //        "pegPriceDeviation":"0.0",
        //        "cancelDuration":"0",
        //        "timestamp":"1643630075180",
        //        "orderID":"8da33067-150f-4525-a40b-991d249bd5a4",
        //        "triggerOrder":false,
        //        "triggerPrice":"0.0",
        //        "triggerOriginalPrice":"0.0",
        //        "triggerOrderType":"0",
        //        "triggerTrailingStopDeviation":"0.0",
        //        "triggerStopPrice":"0.0",
        //        "symbol":"NEAR-USD",
        //        "trailValue":"0.0",
        //        "averageFillPrice":"0.0",
        //        "fillSize":"0.0",
        //        "clOrderID":"_utachng1643630074970",
        //        "orderState":"STATUS_ACTIVE",
        //        "triggered":false
        //        "triggerUseLastPrice":false,
        //        "avgFilledPrice":"0.0", // future only
        //        "reduceOnly":false, // future only
        //        "stealth":"1.0", // future only
        //     }
        //  ]
        //
        // cancelOrder/create order
        //     {
        //        "status":"6",
        //        "symbol":"BTCPFC",
        //        "orderType":"76",
        //        "price":"1500.0",
        //        "side":"BUY",
        //        "size":"6",
        //        "orderID":"65ce6903-8e81-49fd-b044-e5b61ce76265",
        //        "timestamp":"1643641928863",
        //        "triggerPrice":"0.0",
        //        "trigger":false,
        //        "deviation":"100.0",
        //        "stealth":"100.0",
        //        "message":"",
        //        "avgFillPrice":"0.0",
        //        "fillSize":"0.0",
        //        "clOrderID":"_aulpds1643630208116",
        //        "originalSize":"6.0",
        //        "postOnly":false,
        //        "remainingSize":"6.0",
        //        "time_in_force":"GTC"
        //     }
        //
        const created = this.safeInteger (order, 'timestamp');
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const amount = this.safeString (order, 'size');
        const filled = this.safeString2 (order, 'filledSize', 'fillSize');
        const status = this.parseOrderStatus (this.safeString2 (order, 'orderState', 'status'));
        const average = this.safeString2 (order, 'averageFillPrice', 'avgFillPrice');
        const id = this.safeString (order, 'orderID');
        let clientOrderId = this.safeString (order, 'clOrderID');
        if (clientOrderId === '') {
            clientOrderId = undefined;
        }
        const price = this.safeString (order, 'price');
        const type = this.parseOrderType (this.safeInteger (order, 'orderType'));
        const side = this.safeStringLower (order, 'side');
        const timeInForce = this.safeString (order, 'time_in_force');
        const postOnly = this.safeValue (order, 'postOnly');
        const cost = this.safeString (order, 'orderValue');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': created,
            'datetime': this.iso8601 (created),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': cost,
            'fee': undefined,
            'average': average,
            'trades': [],
        }, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPrivateGetUserOpenOrders',
            'future': 'futurePrivateGetUserOpenOrders',
            'swap': 'futurePrivateGetUserOpenOrders',
        });
        const response = await this[method] (this.extend (request, query));
        // spot/future open orders
        // [
        //     {
        //        "orderType":"76",
        //        "price":"5.0",
        //        "size":"10.0",
        //        "side":"BUY",
        //        "orderValue":"50.0",
        //        "filledSize":"0.0",
        //        "pegPriceMin":"0.0",
        //        "pegPriceMax":"0.0",
        //        "pegPriceDeviation":"0.0",
        //        "cancelDuration":"0",
        //        "timestamp":"1643630075180",
        //        "orderID":"8da33067-150f-4525-a40b-991d249bd5a4",
        //        "triggerOrder":false,
        //        "triggerPrice":"0.0",
        //        "triggerOriginalPrice":"0.0",
        //        "triggerOrderType":"0",
        //        "triggerTrailingStopDeviation":"0.0",
        //        "triggerStopPrice":"0.0",
        //        "symbol":"NEAR-USD",
        //        "trailValue":"0.0",
        //        "averageFillPrice":"0.0",
        //        "fillSize":"0.0",
        //        "clOrderID":"_utachng1643630074970",
        //        "orderState":"STATUS_ACTIVE",
        //        "triggered":false
        //        "triggerUseLastPrice":false, // future only
        //        "reduceOnly":false, // future only
        //        "stealth":"1.0", // future only
        //     }
        //  ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a `symbol` argument');
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
            request['count'] = limit;
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPrivateGetUserTradeHistory',
            'future': 'futurePrivateGetUserTradeHistory',
            'swap': 'futurePrivateGetUserTradeHistory',
        });
        const response = await this[method] (this.extend (request, query));
        // [
        //     {
        //        "tradeId":"6f634cf5-428b-4e03-bfd6-4eafd1ffb462",
        //        "orderId":"2af14921-5e92-414b-b67a-d39415aae9bb",
        //        "username":"lima007",
        //        "side":"BUY",
        //        "orderType":"77",
        //        "triggerType":null,
        //        "price":"0.0",
        //        "size":"1",
        //        "filledPrice":"43800.0",
        //        "filledSize":"1",
        //        "triggerPrice":"0.0",
        //        "base":"BTC",
        //        "quote":"USD",
        //        "symbol":"BTCM22",
        //        "feeCurrency":"USD",
        //        "feeAmount":"0.0219",
        //        "wallet":"CROSS@",
        //        "realizedPnl":"0.0",
        //        "total":"-0.0219",
        //        "serialId":"5180917",
        //        "timestamp":"1643639344646",
        //        "clOrderID":"_wystkl1643639343571",
        //        "averageFillPrice":"43800.0"
        //     }
        //  ]
        return this.parseTrades (response, market, since, limit);
    }

    async fetchTradingFee (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTradingFee', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPrivateGetUserFees',
            'future': 'futurePrivateGetUserFees',
            'swap': 'futurePrivateGetUserFees',
        });
        const response = await this[method] (this.extend (request, query));
        // [
        //     {
        //        "symbol":"BTCPFC",
        //        "makerFee":"-1.0E-4",
        //        "takerFee":"5.0E-4"
        //     }
        //  ]
        const data = this.safeValue (response, 0, {});
        return {
            'info': response,
            'maker': this.safeNumber (data, 'makerFee'),
            'taker': this.safeNumber (data, 'takerFee'),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (id !== undefined) {
            request['orderId'] = id;
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('cancelOrder', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPrivateDeleteOrder',
            'future': 'futurePrivateDeleteOrder',
            'swap': 'futurePrivateDeleteOrder',
        });
        const response = await this[method] (this.extend (request, query));
        // [
        //     {
        //        "status":"6",
        //        "symbol":"BTCPFC",
        //        "orderType":"76",
        //        "price":"1500.0",
        //        "side":"BUY",
        //        "size":"6",
        //        "orderID":"65ce6903-8e81-49fd-b044-e5b61ce76265",
        //        "timestamp":"1643641928863",
        //        "triggerPrice":"0.0",
        //        "trigger":false,
        //        "deviation":"100.0",
        //        "stealth":"100.0",
        //        "message":"",
        //        "avgFillPrice":"0.0",
        //        "fillSize":"0.0",
        //        "clOrderID":"_aulpds1643630208116",
        //        "originalSize":"6.0",
        //        "postOnly":false,
        //        "remainingSize":"6.0",
        //        "time_in_force":"GTC"
        //     }
        //  ]
        return this.parseOrders (response);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders requires a `symbol` argument');
        }
        return await this.cancelOrder (undefined, symbol);
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        if ((leverage < 1) || (leverage > 100)) {
            throw new BadRequest (this.id + ' setLeverage leverage should be between 1 and 100');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'leverage': leverage,
            'symbol': market['id'],
        };
        const response = await this.futurePrivatePostLeverage (this.extend (request, params));
        //
        // {
        //     symbol: 'BTCPFC',
        //     timestamp: 1643653769782,
        //     status: 20,
        //     type: 93,
        //     message: 'Leverage changed successfully to 5.0'
        //   }
        // //
        return response;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const uppercaseType = type.toUpperCase ();
        const request = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
            'type': uppercaseType,
            'txType': 'LIMIT', // default value
            'size': parseFloat (this.amountToPrecision (symbol, amount)),
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'clOrderID');
        if (clientOrderId !== undefined) {
            request['clOrderID'] = clientOrderId;
        }
        if ((uppercaseType === 'LIMIT') || (uppercaseType === 'STOP_LIMIT')) {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for a ' + type + 'order');
            }
            request['type'] = 'LIMIT';
            request['price'] = this.priceToPrecision (symbol, price);
            const stopPrice = this.safeString (params, 'stopPrice');
            if (stopPrice !== undefined) {
                request['txType'] = 'STOP';
                request['triggerPrice'] = parseFloat (this.priceToPrecision (symbol, stopPrice));
            }
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('createOrder', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPrivatePostOrder',
            'future': 'futurePrivatePostOrder',
            'swap': 'futurePrivatePostOrder',
        });
        const response = await this[method] (this.extend (request, query));
        // [
        //     {
        //        "status":"2",
        //        "symbol":"BTCPFC",
        //        "orderType":"76",
        //        "price":"1500.0",
        //        "side":"BUY",
        //        "size":"1",
        //        "orderID":"5771e5f4-196a-4c9d-975a-3617a07ac4d7",
        //        "timestamp":"1643710575930",
        //        "triggerPrice":"0.0",
        //        "trigger":false,
        //        "deviation":"100.0",
        //        "stealth":"100.0",
        //        "message":"",
        //        "avgFillPrice":"0.0",
        //        "fillSize":"0.0",
        //        "clOrderID":"",
        //        "originalSize":"1.0",
        //        "postOnly":false,
        //        "remainingSize":"1.0",
        //        "time_in_force":"GTC"
        //     }
        // ]
        return this.parseOrders (response, market);
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.spotPrivatePostUserWalletAddress (this.extend (request, params));
        // [
        //     {
        //         'address': 'Blockchain address',
        //         'created': 1592627542,
        //     },
        // ];
        const data = this.safeValue (response, 0, []);
        const address = this.safeString (data, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.spotPrivateGetUserWalletAddress (this.extend (request, params));
        // [
        //     {
        //       "address": "Blockchain address",
        //       "created": 1592627542
        //     }
        //   ]
        const data = this.safeValue (response, 0, {});
        const address = this.safeValue (data, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'network': undefined,
            'info': response,
        };
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        // internal transfers only
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'asset': currency['id'],
            'amount': amount,
            'to': toAccount, // internal account id
        };
        const toUserMail = this.safeString (params, 'toUserMail');
        if (toUserMail) {
            throw new ArgumentsRequired (this.id + ' transfer requires a `toUserMail` argument');
        }
        return await this.spotPrivatePostUserWalletTransfer (this.extend (request, params));
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount.toString (),
            'address': address,
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        const response = await this.spotPrivatePostUserWalletWithdraw (this.extend (request, params));
        //
        //  {
        //       "withdraw_id": "<withdrawal ID>"
        //  }
        //
        const id = this.safeString (response, 'withdraw_id');
        return {
            'info': response,
            'id': id,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const accessibility = api[1];
        const type = api[0];
        let url = this.urls['api'][type] + '/' + path;
        if (method !== 'POST') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        if (accessibility === 'private') {
            this.checkRequiredCredentials ();
            headers = {};
            if (method === 'POST') {
                body = this.json (params);
                headers['Content-Type'] = 'application/json';
            }
            const nonce = this.milliseconds ().toString ();
            const splittedURL = this.urls['api'][type].split ('/');
            const version = this.safeString (splittedURL, splittedURL.length - 1);
            const convertedBody = body ? body : '';
            const payload = '/api/' + version + '/' + path + nonce + convertedBody;
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha384');
            headers = this.extend (headers, {
                'btse-api': this.apiKey,
                'btse-nonce': nonce,
                'btse-sign': signature,
            });
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        //
        // {"code":-1,"msg":null,"time":1643322746173,"data":null,"success":false}
        //
        if (response === undefined) {
            return;
        }
        const error = this.safeString (response, 'code');
        if (error !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
