'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest, BadSymbol } = require ('./base/errors');

module.exports = class btse extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btse',
            'name': 'BTSE',
            'countries': [ 'VG' ], // British Virgin Islands
            'version': 'v1',
            'rateLimit': 13.333,
            // ordering 75 per second => 1000 / 75 = 13.33 (cost = 1)
            // query 15 req per second => 75/15 = cost = 5
            'has': {
                'CORS': false,
                'spot': true,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'createOrder': true,
                'fetchBalance': false,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRates': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
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
                'setLeverage': false,
                'transfer': false,
                'withdraw': false,
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
                            'order/cancelAllAfter': 1,
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
                        },
                        'post': {
                            'order': 1,
                            'order/peg': 1,
                            'order/close_position': 1,
                            'risk_limit': 1,
                            'leverage': 1,
                        },
                        'put': {
                            'order': 1,
                        },
                        'delete': {
                            'order/cancelAllAfter': 1,
                        },
                    },
                },
            },
            'exceptions': {
                'exact': {
                    '-1': BadRequest, // {"code":-1,"msg":null,"time":1643322746173,"data":null,"success":false}
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
            if (expiry !== 0) {
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
        //        "price":2342.419875836,
        //        "size":0.2036,
        //        "side":"SELL",
        //        "symbol":"ETH-USDT",
        //        "serialId":131094468,
        //        "timestamp":1643317552000
        //     }
        //
        const id = this.safeString (trade, 'serialId');
        const timestamp = this.safeInteger (trade, 'timestamp');
        const datetime = this.iso8601 (timestamp);
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const side = this.safeStringLower (trade, 'side');
        const price = this.safeNumber (trade, 'price');
        const amount = this.safeNumber (trade, 'size');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'order': id,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
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
        });
        const response = await this[method] (query);
        // {
        //     "iso": "2021-06-29T18:14:30.886Z",
        //     "epoch": 1624990470
        // }
        return this.safeInteger (response, 'epoch');
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPrivateGetUserWallet',
            'future': 'futurePrivateGetUserWallet',
        });
        const response = await this[method] (query);
        // spot
        //     {
        //         "id": 11,
        //         "method": "private/get-account-summary",
        //         "code": 0,
        //         "result": {
        //             "accounts": [
        //                 {
        //                     "balance": 99999999.905000000000000000,
        //                     "available": 99999996.905000000000000000,
        //                     "order": 3.000000000000000000,
        //                     "stake": 0,
        //                     "currency": "CRO"
        //                 }
        //             ]
        //         }
        //     }
        //
        // swap
        //     {
        //       "id" : 1641025392400,
        //       "method" : "private/user-balance",
        //       "code" : 0,
        //       "result" : {
        //         "data" : [ {
        //           "total_available_balance" : "109.56000000",
        //           "total_margin_balance" : "109.56000000",
        //           "total_initial_margin" : "0.00000000",
        //           "total_maintenance_margin" : "0.00000000",
        //           "total_position_cost" : "0.00000000",
        //           "total_cash_balance" : "109.56000000",
        //           "total_collateral_value" : "109.56000000",
        //           "total_session_unrealized_pnl" : "0.00000000",
        //           "instrument_name" : "USD_Stable_Coin",
        //           "total_session_realized_pnl" : "0.00000000",
        //           "position_balances" : [ {
        //             "quantity" : "109.56000000",
        //             "collateral_weight" : "1.000000",
        //             "collateral_amount" : "109.56000000",
        //             "market_value" : "109.56000000",
        //             "max_withdrawal_balance" : "109.56000000",
        //             "instrument_name" : "USD_Stable_Coin"
        //           } ],
        //           "total_effective_leverage" : "0.000000",
        //           "position_limit" : "3000000.00000000",
        //           "used_position_limit" : "0.00000000",
        //           "is_liquidating" : false
        //         } ]
        //       }
        //     }
        //
        const parser = this.getSupportedMapping (marketType, {
            'spot': 'parseSpotBalance',
            'future': 'parseSwapBalance',
            'swap': 'parseSwapBalance',
        });
        return this[parser] (response);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const accessibility = api[1];
        const type = api[0];
        let url = this.urls['api'][type] + '/' + path;
        if (accessibility === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            let convertedBody = body;
            if (method === 'GET') {
                convertedBody = '';
            }
            const nonce = this.milliseconds ().toString ();
            const payload = path + nonce + convertedBody;
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha384');
            headers = {
                'btse-api': this.apiKey,
                'btse-nonce': nonce,
                'btse-sign': signature,
            };
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
