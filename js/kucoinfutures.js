'use strict';

//  ---------------------------------------------------------------------------

const { ArgumentsRequired, ExchangeNotAvailable, InvalidOrder, InsufficientFunds, AccountSuspended, InvalidNonce, NotSupported, BadRequest, AuthenticationError, RateLimitExceeded, PermissionDenied } = require ('./base/errors');
const Precise = require ('./base/Precise');
const kucoin = require ('./kucoin.js');
const { TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class kucoinfutures extends kucoin {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kucoinfutures',
            'name': 'KuCoin Futures',
            'countries': [ 'SC' ],
            'rateLimit': 75,
            'version': 'v1',
            'certified': false,
            'pro': false,
            'comment': 'Platform 2.0',
            'quoteJsonNumbers': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createDepositAddress': true,
                'createOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingFee': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': false,
                'fetchIndexOHLCV': false,
                'fetchL3OrderBook': true,
                'fetchLedger': true,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchWithdrawals': true,
                'setMarginMode': false,
                'transfer': true,
                'withdraw': undefined,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/147508995-9e35030a-d046-43a1-a006-6fabd981b554.jpg',
                'doc': [
                    'https://docs.kucoin.com/futures',
                    'https://docs.kucoin.com',
                ],
                'www': 'https://futures.kucoin.com/',
                'referral': 'https://futures.kucoin.com/?rcode=E5wkqe',
                'api': {
                    'public': 'https://openapi-v2.kucoin.com',
                    'private': 'https://openapi-v2.kucoin.com',
                    'futuresPrivate': 'https://api-futures.kucoin.com',
                    'futuresPublic': 'https://api-futures.kucoin.com',
                },
                'test': {
                    'public': 'https://openapi-sandbox.kucoin.com',
                    'private': 'https://openapi-sandbox.kucoin.com',
                    'futuresPrivate': 'https://api-sandbox-futures.kucoin.com',
                    'futuresPublic': 'https://api-sandbox-futures.kucoin.com',
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'api': {
                'futuresPublic': {
                    'get': {
                        'contracts/active': 1,
                        'contracts/{symbol}': 1,
                        'contracts/risk-limit/{symbol}': 1,
                        'ticker': 1,
                        'level2/snapshot': 1.33,
                        'level2/depth{limit}': 1,
                        'level2/message/query': 1,
                        'level3/message/query': 1, // deprecated，level3/snapshot is suggested
                        'level3/snapshot': 1, // v2
                        'trade/history': 1,
                        'interest/query': 1,
                        'index/query': 1,
                        'mark-price/{symbol}/current': 1,
                        'premium/query': 1,
                        'funding-rate/{symbol}/current': 1,
                        'timestamp': 1,
                        'status': 1,
                        'kline/query': 1,
                    },
                    'post': {
                        'bullet-public': 1,
                    },
                },
                'futuresPrivate': {
                    'get': {
                        'account-overview': 1.33,
                        'transaction-history': 4.44,
                        'deposit-address': 1,
                        'deposit-list': 1,
                        'withdrawals/quotas': 1,
                        'withdrawal-list': 1,
                        'transfer-list': 1,
                        'orders': 1.33,
                        'stopOrders': 1,
                        'recentDoneOrders': 1,
                        'orders/{orderId}': 1, // ?clientOid={client-order-id} // get order by orderId
                        'orders/byClientOid': 1, // ?clientOid=eresc138b21023a909e5ad59 // get order by clientOid
                        'fills': 4.44,
                        'recentFills': 4.44,
                        'openOrderStatistics': 1,
                        'position': 1,
                        'positions': 4.44,
                        'funding-history': 4.44,
                    },
                    'post': {
                        'withdrawals': 1,
                        'transfer-out': 1, // v2
                        'orders': 1.33,
                        'position/margin/auto-deposit-status': 1,
                        'position/margin/deposit-margin': 1,
                        'bullet-private': 1,
                    },
                    'delete': {
                        'withdrawals/{withdrawalId}': 1,
                        'cancel/transfer-out': 1,
                        'orders/{orderId}': 1,
                        'orders': 4.44,
                        'stopOrders': 1,
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    '400': BadRequest, // Bad Request -- Invalid request format
                    '401': AuthenticationError, // Unauthorized -- Invalid API Key
                    '403': NotSupported, // Forbidden -- The request is forbidden
                    '404': NotSupported, // Not Found -- The specified resource could not be found
                    '405': NotSupported, // Method Not Allowed -- You tried to access the resource with an invalid method.
                    '415': BadRequest,  // Content-Type -- application/json
                    '429': RateLimitExceeded, // Too Many Requests -- Access limit breached
                    '500': ExchangeNotAvailable, // Internal Server Error -- We had a problem with our server. Try again later.
                    '503': ExchangeNotAvailable, // Service Unavailable -- We're temporarily offline for maintenance. Please try again later.
                    '100001': InvalidOrder,     // {"code":"100001","msg":"Unavailable to enable both \"postOnly\" and \"hidden\""}
                    '100004': BadRequest,       // {"code":"100004","msg":"Order is in not cancelable state"}
                    '101030': PermissionDenied, // {"code":"101030","msg":"You haven't yet enabled the margin trading"}
                    '200004': InsufficientFunds,
                    '230003': InsufficientFunds, // {"code":"230003","msg":"Balance insufficient!"}
                    '260100': InsufficientFunds, // {"code":"260100","msg":"account.noBalance"}
                    '300003': InsufficientFunds,
                    '300012': InvalidOrder,
                    '400001': AuthenticationError, // Any of KC-API-KEY, KC-API-SIGN, KC-API-TIMESTAMP, KC-API-PASSPHRASE is missing in your request header.
                    '400002': InvalidNonce, // KC-API-TIMESTAMP Invalid -- Time differs from server time by more than 5 seconds
                    '400003': AuthenticationError, // KC-API-KEY not exists
                    '400004': AuthenticationError, // KC-API-PASSPHRASE error
                    '400005': AuthenticationError, // Signature error -- Please check your signature
                    '400006': AuthenticationError, // The IP address is not in the API whitelist
                    '400007': AuthenticationError, // Access Denied -- Your API key does not have sufficient permissions to access the URI
                    '404000': NotSupported, // URL Not Found -- The requested resource could not be found
                    '400100': BadRequest, // Parameter Error -- You tried to access the resource with invalid parameters
                    '411100': AccountSuspended, // User is frozen -- Please contact us via support center
                    '500000': ExchangeNotAvailable, // Internal Server Error -- We had a problem with our server. Try again later.
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0006'),
                    'maker': this.parseNumber ('0.0002'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('50'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('200'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('500'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('1000'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('2000'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('4000'), this.parseNumber ('0.00038') ],
                            [ this.parseNumber ('8000'), this.parseNumber ('0.00035') ],
                            [ this.parseNumber ('15000'), this.parseNumber ('0.00032') ],
                            [ this.parseNumber ('25000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('40000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('60000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('80000'), this.parseNumber ('0.0003') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.02') ],
                            [ this.parseNumber ('50'), this.parseNumber ('0.015') ],
                            [ this.parseNumber ('200'), this.parseNumber ('0.01') ],
                            [ this.parseNumber ('500'), this.parseNumber ('0.01') ],
                            [ this.parseNumber ('1000'), this.parseNumber ('0.01') ],
                            [ this.parseNumber ('2000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('4000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('8000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('15000'), this.parseNumber ('-0.003') ],
                            [ this.parseNumber ('25000'), this.parseNumber ('-0.006') ],
                            [ this.parseNumber ('40000'), this.parseNumber ('-0.009') ],
                            [ this.parseNumber ('60000'), this.parseNumber ('-0.012') ],
                            [ this.parseNumber ('80000'), this.parseNumber ('-0.015') ],
                        ],
                    },
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'commonCurrencies': {
                'HOT': 'HOTNOW',
                'EDGE': 'DADI', // https://github.com/ccxt/ccxt/issues/5756
                'WAX': 'WAXP',
                'TRY': 'Trias',
                'VAI': 'VAIOT',
                'XBT': 'BTC',
            },
            'timeframes': {
                '1m': 1,
                '3m': undefined,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '2h': 120,
                '4h': 240,
                '6h': undefined,
                '8h': 480,
                '12h': 720,
                '1d': 1440,
                '1w': 10080,
            },
            'options': {
                'version': 'v1',
                'symbolSeparator': '-',
                'defaultType': 'swap',
                'code': 'USDT',
                'marginTypes': {},
                // endpoint versions
                'versions': {
                    'futuresPrivate': {
                        'POST': {
                            'transfer-out': 'v2',
                        },
                    },
                    'futuresPublic': {
                        'GET': {
                            'level3/snapshot': 'v2',
                        },
                    },
                },
                'networks': {
                    'OMNI': 'omni',
                    'ERC20': 'eth',
                    'TRC20': 'trx',
                },
                // 'code': 'BTC',
                // 'fetchBalance': {
                //    'code': 'BTC',
                // },
            },
        });
    }

    async fetchAccounts (params = {}) {
        throw new BadRequest (this.id + ' has no method fetchAccounts');
    }

    async fetchStatus (params = {}) {
        const response = await this.futuresPublicGetStatus (params);
        //
        //     {
        //         "code":"200000",
        //         "data":{
        //             "msg":"",
        //             "status":"open"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        let status = this.safeValue (data, 'status');
        if (status !== undefined) {
            status = (status === 'open') ? 'ok' : 'maintenance';
            this.status = this.extend (this.status, {
                'status': status,
                'updated': this.milliseconds (),
            });
        }
        return this.status;
    }

    async fetchMarkets (params = {}) {
        const response = await this.futuresPublicGetContractsActive (params);
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "symbol": "ETHUSDTM",
        //            "rootSymbol": "USDT",
        //            "type": "FFWCSX",
        //            "firstOpenDate": 1591086000000,
        //            "expireDate": null,
        //            "settleDate": null,
        //            "baseCurrency": "ETH",
        //            "quoteCurrency": "USDT",
        //            "settleCurrency": "USDT",
        //            "maxOrderQty": 1000000,
        //            "maxPrice": 1000000.0000000000,
        //            "lotSize": 1,
        //            "tickSize": 0.05,
        //            "indexPriceTickSize": 0.01,
        //            "multiplier": 0.01,
        //            "initialMargin": 0.01,
        //            "maintainMargin": 0.005,
        //            "maxRiskLimit": 1000000,
        //            "minRiskLimit": 1000000,
        //            "riskStep": 500000,
        //            "makerFeeRate": 0.00020,
        //            "takerFeeRate": 0.00060,
        //            "takerFixFee": 0.0000000000,
        //            "makerFixFee": 0.0000000000,
        //            "settlementFee": null,
        //            "isDeleverage": true,
        //            "isQuanto": true,
        //            "isInverse": false,
        //            "markMethod": "FairPrice",
        //            "fairMethod": "FundingRate",
        //            "fundingBaseSymbol": ".ETHINT8H",
        //            "fundingQuoteSymbol": ".USDTINT8H",
        //            "fundingRateSymbol": ".ETHUSDTMFPI8H",
        //            "indexSymbol": ".KETHUSDT",
        //            "settlementSymbol": "",
        //            "status": "Open",
        //            "fundingFeeRate": 0.000535,
        //            "predictedFundingFeeRate": 0.002197,
        //            "openInterest": "8724443",
        //            "turnoverOf24h": 341156641.03354263,
        //            "volumeOf24h": 74833.54000000,
        //            "markPrice": 4534.07,
        //            "indexPrice":4531.92,
        //            "lastTradePrice": 4545.4500000000,
        //            "nextFundingRateTime": 25481884,
        //            "maxLeverage": 100,
        //            "sourceExchanges":  [
        //                "huobi",
        //                "Okex",
        //                "Binance",
        //                "Kucoin",
        //                "Poloniex",
        //                "Hitbtc"
        //            ],
        //            "premiumsSymbol1M": ".ETHUSDTMPI",
        //            "premiumsSymbol8H": ".ETHUSDTMPI8H",
        //            "fundingBaseSymbol1M": ".ETHINT",
        //            "fundingQuoteSymbol1M": ".USDTINT",
        //            "lowPrice": 4456.90,
        //            "highPrice":  4674.25,
        //            "priceChgPct": 0.0046,
        //            "priceChg": 21.15
        //        }
        //    }
        //
        const result = [];
        const data = this.safeValue (response, 'data');
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const expiry = this.safeInteger (market, 'expireDate');
            const future = expiry ? true : false;
            const swap = !future;
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'quoteCurrency');
            const settleId = this.safeString (market, 'settleCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            let symbol = base + '/' + quote + ':' + settle;
            let type = 'swap';
            if (future) {
                symbol = symbol + '-' + this.yymmdd (expiry, '');
                type = 'future';
            }
            const baseMaxSize = this.safeNumber (market, 'baseMaxSize');
            const baseMinSizeString = this.safeString (market, 'baseMinSize');
            const quoteMaxSizeString = this.safeString (market, 'quoteMaxSize');
            const baseMinSize = this.parseNumber (baseMinSizeString);
            const quoteMaxSize = this.parseNumber (quoteMaxSizeString);
            const quoteMinSize = this.safeNumber (market, 'quoteMinSize');
            const inverse = this.safeValue (market, 'isInverse');
            const status = this.safeString (market, 'status');
            const multiplier = this.safeString (market, 'multiplier');
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
                'active': (status === 'Open'),
                'contract': true,
                'linear': !inverse,
                'inverse': inverse,
                'taker': this.safeNumber (market, 'takerFeeRate'),
                'maker': this.safeNumber (market, 'makerFeeRate'),
                'contractSize': this.parseNumber (Precise.stringAbs (multiplier)),
                'expiry': expiry,
                'expiryDatetime': this.iso8601 (expiry),
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'lotSize'),
                    'price': this.safeNumber (market, 'tickSize'),
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber ('1'),
                        'max': this.safeNumber (market, 'maxLeverage'),
                    },
                    'amount': {
                        'min': baseMinSize,
                        'max': baseMaxSize,
                    },
                    'price': {
                        'min': undefined,
                        'max': this.parseNumber (Precise.stringDiv (quoteMaxSizeString, baseMinSizeString)),
                    },
                    'cost': {
                        'min': quoteMinSize,
                        'max': quoteMaxSize,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchTime (params = {}) {
        const response = await this.futuresPublicGetTimestamp (params);
        //
        //    {
        //        code: "200000",
        //        data: 1637385119302,
        //    }
        //
        return this.safeNumber (response, 'data');
    }

    async fetchOHLCV (symbol, timeframe = '15m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const request = {
            'symbol': marketId,
            'granularity': this.timeframes[timeframe],
        };
        const duration = this.parseTimeframe (timeframe) * 1000;
        let endAt = this.milliseconds ();
        if (since !== undefined) {
            request['from'] = since;
            if (limit === undefined) {
                limit = this.safeInteger (this.options, 'fetchOHLCVLimit', 200);
            }
            endAt = this.sum (since, limit * duration);
        } else if (limit !== undefined) {
            since = endAt - limit * duration;
            request['from'] = since;
        }
        request['to'] = endAt;
        const response = await this.futuresPublicGetKlineQuery (this.extend (request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": [
        //            [1636459200000, 4779.3, 4792.1, 4768.7, 4770.3, 78051],
        //            [1636460100000, 4770.25, 4778.55, 4757.55, 4777.25, 80164],
        //            [1636461000000, 4777.25, 4791.45, 4774.5, 4791.3, 51555]
        //        ]
        //    }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //    [
        //        "1545904980000",          // Start time of the candle cycle
        //        "0.058",                  // opening price
        //        "0.049",                  // closing price
        //        "0.058",                  // highest price
        //        "0.049",                  // lowest price
        //        "0.018",                  // base volume
        //        "0.000945",               // quote volume
        //    ]
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

    async createDepositAddress (code, params = {}) {
        throw new BadRequest (this.id + ' has no method createDepositAddress');
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const currencyId = currency['id'];
        const request = {
            'currency': currencyId, // Currency,including XBT,USDT
        };
        const response = await this.futuresPrivateGetDepositAddress (this.extend (request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "address": "0x78d3ad1c0aa1bf068e19c94a2d7b16c9c0fcd8b1",//Deposit address
        //            "memo": null//Address tag. If the returned value is null, it means that the requested token has no memo. If you are to transfer funds from another platform to KuCoin Futures and if the token to be //transferred has memo(tag), you need to fill in the memo to ensure the transferred funds will be sent //to the address you specified.
        //        }
        //    }
        //
        const data = this.safeValue (response, 'data', {});
        const address = this.safeString (data, 'address');
        if (currencyId !== 'NIM') {
            // contains spaces
            this.checkAddress (address);
        }
        return {
            'info': response,
            'currency': currencyId,
            'address': address,
            'tag': this.safeString (data, 'memo'),
            'network': this.safeString (data, 'chain'),
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const level = this.safeNumber (params, 'level');
        if (level !== 2 && level !== undefined) {
            throw new BadRequest (this.id + ' fetchOrderBook can only return level 2');
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            if ((limit === 20) || (limit === 100)) {
                request['limit'] = limit;
            } else {
                throw new BadRequest (this.id + ' fetchOrderBook limit argument must be 20 or 100');
            }
        } else {
            request['limit'] = 20;
        }
        const response = await this.futuresPublicGetLevel2DepthLimit (this.extend (request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //           "symbol": "XBTUSDM",      //Symbol
        //           "sequence": 100,          //Ticker sequence number
        //           "asks": [
        //                 ["5000.0", 1000],   //Price, quantity
        //                 ["6000.0", 1983]    //Price, quantity
        //           ],
        //           "bids": [
        //                 ["3200.0", 800],    //Price, quantity
        //                 ["3100.0", 100]     //Price, quantity
        //           ],
        //           "ts": 1604643655040584408  // timestamp
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const timestamp = parseInt (this.safeInteger (data, 'ts') / 1000000);
        const orderbook = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 0, 1);
        orderbook['nonce'] = this.safeInteger (data, 'sequence');
        return orderbook;
    }

    async fetchL3OrderBook (symbol, limit = undefined, params = {}) {
        throw new BadRequest (this.id + ' only can only fetch the L2 order book');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.futuresPublicGetTicker (this.extend (request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "sequence": 1638444978558,
        //            "symbol": "ETHUSDTM",
        //            "side": "sell",
        //            "size": 4,
        //            "price": "4229.35",
        //            "bestBidSize": 2160,
        //            "bestBidPrice": "4229.0",
        //            "bestAskPrice": "4229.05",
        //            "tradeId": "61aaa8b777a0c43055fe4851",
        //            "ts": 1638574296209786785,
        //            "bestAskSize": 36,
        //        }
        //    }
        //
        return this.parseTicker (response['data'], market);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "sequence":  1629930362547,
        //             "symbol": "ETHUSDTM",
        //             "side": "buy",
        //             "size":  130,
        //             "price": "4724.7",
        //             "bestBidSize":  5,
        //             "bestBidPrice": "4724.6",
        //             "bestAskPrice": "4724.65",
        //             "tradeId": "618d2a5a77a0c4431d2335f4",
        //             "ts":  1636641371963227600,
        //             "bestAskSize":  1789
        //          }
        //     }
        //
        const last = this.safeString (ticker, 'price');
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market, '-');
        const timestamp = Precise.stringDiv (this.safeString (ticker, 'ts'), '1000000');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeString (ticker, 'bestBidPrice'),
            'bidVolume': this.safeString (ticker, 'bestBidSize'),
            'ask': this.safeString (ticker, 'bestAskPrice'),
            'askVolume': this.safeString (ticker, 'bestAskSize'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        }, market, false);
    }

    async fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        //
        // Private
        // @param symbol (string): The pair for which the contract was traded
        // @param since (number): The unix start time of the first funding payment requested
        // @param limit (number): The number of results to return
        // @param params (dict): Additional parameters to send to the API
        // @param return: Data for the history of the accounts funding payments for futures contracts
        //
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (limit !== undefined) {
            // * Since is ignored if limit is defined
            request['maxCount'] = limit;
        }
        const response = await this.futuresPrivateGetFundingHistory (this.extend (request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "dataList": [
        //                {
        //                    "id": 239471298749817,
        //                    "symbol": "ETHUSDTM",
        //                    "timePoint": 1638532800000,
        //                    "fundingRate": 0.000100,
        //                    "markPrice": 4612.8300000000,
        //                    "positionQty": 12,
        //                    "positionCost": 553.5396000000,
        //                    "funding": -0.0553539600,
        //                    "settleCurrency": "USDT"
        //                },
        //                ...
        //            ],
        //            "hasMore": true
        //        }
        //    }
        //
        const data = this.safeValue (response, 'data');
        const dataList = this.safeValue (data, 'dataList');
        const fees = [];
        for (let i = 0; i < dataList.length; i++) {
            const listItem = dataList[i];
            const timestamp = this.safeInteger (listItem, 'timePoint');
            fees.push ({
                'info': listItem,
                'symbol': symbol,
                'code': this.safeCurrencyCode (this.safeString (listItem, 'settleCurrency')),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'id': this.safeNumber (listItem, 'id'),
                'amount': this.safeNumber (listItem, 'funding'),
                'fundingRate': this.safeNumber (listItem, 'fundingRate'),
                'markPrice': this.safeNumber (listItem, 'markPrice'),
                'positionQty': this.safeNumber (listItem, 'positionQty'),
                'positionCost': this.safeNumber (listItem, 'positionCost'),
            });
        }
        return fees;
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.futuresPrivateGetPositions (params);
        //
        //    {
        //        "code": "200000",
        //        "data": [
        //            {
        //                "id": "615ba79f83a3410001cde321",
        //                "symbol": "ETHUSDTM",
        //                "autoDeposit": false,
        //                "maintMarginReq": 0.005,
        //                "riskLimit": 1000000,
        //                "realLeverage": 18.61,
        //                "crossMode": false,
        //                "delevPercentage": 0.86,
        //                "openingTimestamp": 1638563515618,
        //                "currentTimestamp": 1638576872774,
        //                "currentQty": 2,
        //                "currentCost": 83.64200000,
        //                "currentComm": 0.05018520,
        //                "unrealisedCost": 83.64200000,
        //                "realisedGrossCost": 0.00000000,
        //                "realisedCost": 0.05018520,
        //                "isOpen": true,
        //                "markPrice": 4225.01,
        //                "markValue": 84.50020000,
        //                "posCost": 83.64200000,
        //                "posCross": 0.0000000000,
        //                "posInit": 3.63660870,
        //                "posComm": 0.05236717,
        //                "posLoss": 0.00000000,
        //                "posMargin": 3.68897586,
        //                "posMaint": 0.50637594,
        //                "maintMargin": 4.54717586,
        //                "realisedGrossPnl": 0.00000000,
        //                "realisedPnl": -0.05018520,
        //                "unrealisedPnl": 0.85820000,
        //                "unrealisedPnlPcnt": 0.0103,
        //                "unrealisedRoePcnt": 0.2360,
        //                "avgEntryPrice": 4182.10,
        //                "liquidationPrice": 4023.00,
        //                "bankruptPrice": 4000.25,
        //                "settleCurrency": "USDT",
        //                "isInverse": false
        //            }
        //        ]
        //    }
        //
        return this.parsePositions (this.safeValue (response, 'data'));
    }

    parsePositions (positions) {
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            result.push (this.parsePosition (positions[i]));
        }
        return result;
    }

    parsePosition (position, market = undefined) {
        //
        //    {
        //        "code": "200000",
        //        "data": [
        //            {
        //                "id": "615ba79f83a3410001cde321",         // Position ID
        //                "symbol": "ETHUSDTM",                     // Symbol
        //                "autoDeposit": false,                     // Auto deposit margin or not
        //                "maintMarginReq": 0.005,                  // Maintenance margin requirement
        //                "riskLimit": 1000000,                     // Risk limit
        //                "realLeverage": 25.92,                    // Leverage of the order
        //                "crossMode": false,                       // Cross mode or not
        //                "delevPercentage": 0.76,                  // ADL ranking percentile
        //                "openingTimestamp": 1638578546031,        // Open time
        //                "currentTimestamp": 1638578563580,        // Current timestamp
        //                "currentQty": 2,                          // Current postion quantity
        //                "currentCost": 83.787,                    // Current postion value
        //                "currentComm": 0.0167574,                 // Current commission
        //                "unrealisedCost": 83.787,                 // Unrealised value
        //                "realisedGrossCost": 0.0,                 // Accumulated realised gross profit value
        //                "realisedCost": 0.0167574,                // Current realised position value
        //                "isOpen": true,                           // Opened position or not
        //                "markPrice": 4183.38,                     // Mark price
        //                "markValue": 83.6676,                     // Mark value
        //                "posCost": 83.787,                        // Position value
        //                "posCross": 0.0,                          // added margin
        //                "posInit": 3.35148,                       // Leverage margin
        //                "posComm": 0.05228309,                    // Bankruptcy cost
        //                "posLoss": 0.0,                           // Funding fees paid out
        //                "posMargin": 3.40376309,                  // Position margin
        //                "posMaint": 0.50707892,                   // Maintenance margin
        //                "maintMargin": 3.28436309,                // Position margin
        //                "realisedGrossPnl": 0.0,                  // Accumulated realised gross profit value
        //                "realisedPnl": -0.0167574,                // Realised profit and loss
        //                "unrealisedPnl": -0.1194,                 // Unrealised profit and loss
        //                "unrealisedPnlPcnt": -0.0014,             // Profit-loss ratio of the position
        //                "unrealisedRoePcnt": -0.0356,             // Rate of return on investment
        //                "avgEntryPrice": 4189.35,                 // Average entry price
        //                "liquidationPrice": 4044.55,              // Liquidation price
        //                "bankruptPrice": 4021.75,                 // Bankruptcy price
        //                "settleCurrency": "USDT",                 // Currency used to clear and settle the trades
        //                "isInverse": false
        //            }
        //        ]
        //    }
        //
        const symbol = this.safeString (position, 'symbol');
        market = this.safeMarket (symbol, market);
        const timestamp = this.safeNumber (position, 'currentTimestamp');
        const size = this.safeString (position, 'currentQty');
        let side = undefined;
        if (Precise.stringGt (size, '0')) {
            side = 'long';
        } else if (Precise.stringLt (size, '0')) {
            side = 'short';
        }
        const notional = Precise.stringAbs (this.safeString (position, 'posCost'));
        const initialMargin = this.safeString (position, 'posInit');
        const initialMarginPercentage = Precise.stringDiv (initialMargin, notional);
        // const marginRatio = Precise.stringDiv (maintenanceRate, collateral);
        const unrealisedPnl = this.safeString (position, 'unrealisedPnl');
        const crossMode = this.safeValue (position, 'crossMode');
        // currently crossMode is always set to false and only isolated positions are supported
        const marginType = crossMode ? 'cross' : 'isolated';
        return {
            'info': position,
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'initialMargin': this.parseNumber (initialMargin),
            'initialMarginPercentage': this.parseNumber (initialMarginPercentage),
            'maintenanceMargin': this.safeNumber (position, 'posMaint'),
            'maintenanceMarginPercentage': this.safeNumber (position, 'maintMarginReq'),
            'entryPrice': this.safeNumber (position, 'avgEntryPrice'),
            'notional': this.parseNumber (notional),
            'leverage': this.safeNumber (position, 'realLeverage'),
            'unrealizedPnl': this.parseNumber (unrealisedPnl),
            'contracts': this.parseNumber (Precise.stringAbs (size)),
            'contractSize': this.safeValue (market, 'contractSize'),
            //     realisedPnl: position['realised_pnl'],
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber (position, 'liquidationPrice'),
            'markPrice': this.safeNumber (position, 'markPrice'),
            'collateral': this.safeNumber (position, 'maintMargin'),
            'marginType': marginType,
            'side': side,
            'percentage': this.parseNumber (Precise.stringDiv (unrealisedPnl, initialMargin)),
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // required param, cannot be used twice
        const clientOrderId = this.safeString2 (params, 'clientOid', 'clientOrderId', this.uuid ());
        params = this.omit (params, [ 'clientOid', 'clientOrderId' ]);
        if (amount < 1) {
            throw new InvalidOrder (this.id + ' createOrder() minimum contract order amount is 1');
        }
        const preciseAmount = parseInt (this.amountToPrecision (symbol, amount));
        const request = {
            'clientOid': clientOrderId,
            'side': side,
            'symbol': market['id'],
            'type': type, // limit or market
            'size': preciseAmount,
            'leverage': 1,
            // 'remark': '', // optional remark for the order, length cannot exceed 100 utf8 characters
            // 'tradeType': 'TRADE', // TRADE, MARGIN_TRADE // not used with margin orders
            // limit orders ---------------------------------------------------
            // 'timeInForce': 'GTC', // GTC, GTT, IOC, or FOK (default is GTC), limit orders only
            // 'cancelAfter': long, // cancel after n seconds, requires timeInForce to be GTT
            // 'postOnly': false, // Post only flag, invalid when timeInForce is IOC or FOK
            // 'hidden': false, // Order will not be displayed in the order book
            // 'iceberg': false, // Only a portion of the order is displayed in the order book
            // 'visibleSize': this.amountToPrecision (symbol, visibleSize), // The maximum visible size of an iceberg order
            // market orders --------------------------------------------------
            // 'funds': this.costToPrecision (symbol, cost), // Amount of quote currency to use
            // stop orders ----------------------------------------------------
            // 'stop': 'loss', // loss or entry, the default is loss, requires stopPrice
            // 'stopPrice': this.priceToPrecision (symbol, amount), // need to be defined if stop is specified
            // 'stopPriceType' // Either TP, IP or MP, Need to be defined if stop is specified.
            // margin orders --------------------------------------------------
            // 'marginMode': 'cross', // cross (cross mode) and isolated (isolated mode), set to cross by default, the isolated mode will be released soon, stay tuned
            // 'autoBorrow': false, // The system will first borrow you funds at the optimal interest rate and then place an order for you
            // futures orders -------------------------------------------------
            // reduceOnly // (boolean) A mark to reduce the position size only. Set to false by default. Need to set the position size when reduceOnly is true.
            // closeOrder // (boolean) A mark to close the position. Set to false by default. It will close all the positions when closeOrder is true.
            // forceHold // (boolean) A mark to forcely hold the funds for an order, even though it's an order to reduce the position size. This helps the order stay on the order book and not get canceled when the position size changes. Set to false by default.
        };
        const stopPrice = this.safeNumber (params, 'stopPrice');
        if (stopPrice) {
            request['stop'] = (side === 'buy') ? 'down' : 'up';
            const stopPriceType = this.safeString (params, 'stopPriceType');
            if (!stopPriceType) {
                throw new ArgumentsRequired (this.id + ' createOrder() trigger orders require a stopPriceType parameter to be set to TP, IP or MP (Trade Price, Index Price or Mark Price)');
            }
        }
        const uppercaseType = type.toUpperCase ();
        let timeInForce = this.safeString (params, 'timeInForce');
        if (uppercaseType === 'LIMIT') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for limit orders');
            } else {
                request['price'] = this.priceToPrecision (symbol, price);
            }
            if (timeInForce !== undefined) {
                timeInForce = timeInForce.toUpperCase ();
                request['timeInForce'] = timeInForce;
            }
        }
        const postOnly = this.safeValue (params, 'postOnly', false);
        const hidden = this.safeValue (params, 'hidden');
        if (postOnly && hidden !== undefined) {
            throw new BadRequest (this.id + ' createOrder() does not support the postOnly parameter together with a hidden parameter');
        }
        const iceberg = this.safeValue (params, 'iceberg');
        if (iceberg) {
            const visibleSize = this.safeValue (params, 'visibleSize');
            if (visibleSize === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a visibleSize parameter for iceberg orders');
            }
        }
        params = this.omit (params, 'timeInForce'); // Time in force only valid for limit orders, exchange error when gtc for market orders
        const response = await this.futuresPrivatePostOrders (this.extend (request, params));
        //
        //    {
        //        code: "200000",
        //        data: {
        //            orderId: "619717484f1d010001510cde",
        //        },
        //    }
        //
        const data = this.safeValue (response, 'data', {});
        return {
            'id': this.safeString (data, 'orderId'),
            'clientOrderId': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'symbol': undefined,
            'type': undefined,
            'side': undefined,
            'price': undefined,
            'amount': undefined,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': undefined,
            'fee': undefined,
            'trades': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'stopPrice': undefined,
            'info': response,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.futuresPrivateDeleteOrdersOrderId (this.extend (request, params));
        //
        //   {
        //       code: "200000",
        //       data: {
        //           cancelledOrderIds: [
        //                "619714b8b6353000014c505a",
        //           ],
        //       },
        //   }
        //
        return this.safeValue (response, 'data');
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            request['symbol'] = this.marketId (symbol);
        }
        const response = await this.futuresPrivateDeleteOrders (this.extend (request, params));
        // ? futuresPrivateDeleteStopOrders
        //   {
        //       code: "200000",
        //       data: {
        //           cancelledOrderIds: [
        //                "619714b8b6353000014c505a",
        //           ],
        //       },
        //   }
        //
        return this.safeValue (response, 'data');
    }

    async addMargin (symbol, amount, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const uuid = this.uuid ();
        const request = {
            'symbol': market['id'],
            'margin': amount,
            'bizNo': uuid,
        };
        return await this.futuresPrivatePostPositionMarginDepositMargin (this.extend (request, params));
    }

    async fetchOrdersByStatus (status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'status': status,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        const response = await this.futuresPrivateGetOrders (this.extend (request, params));
        const responseData = this.safeValue (response, 'data', {});
        const orders = this.safeValue (responseData, 'items', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOrder (id = undefined, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let method = 'futuresPrivateGetOrdersOrderId';
        if (id === undefined) {
            const clientOrderId = this.safeString2 (params, 'clientOid', 'clientOrderId');
            if (clientOrderId === undefined) {
                throw new InvalidOrder (this.id + ' fetchOrder() requires parameter id or params.clientOid');
            }
            request['clientOid'] = clientOrderId;
            method = 'futuresPrivateGetOrdersByClientOid';
            params = this.omit (params, [ 'clientOid', 'clientOrderId' ]);
        } else {
            request['orderId'] = id;
        }
        const response = await this[method] (this.extend (request, params));
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const responseData = this.safeValue (response, 'data');
        return this.parseOrder (responseData, market);
    }

    parseOrder (order, market = undefined) {
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const orderId = this.safeString (order, 'id');
        const type = this.safeString (order, 'type');
        const timestamp = this.safeInteger (order, 'createdAt');
        const datetime = this.iso8601 (timestamp);
        const price = this.safeString (order, 'price');
        // price is zero for market order
        // omitZero is called in safeOrder2
        const side = this.safeString (order, 'side');
        const feeCurrencyId = this.safeString (order, 'feeCurrency');
        const feeCurrency = this.safeCurrencyCode (feeCurrencyId);
        const feeCost = this.safeNumber (order, 'fee');
        const amount = this.safeString (order, 'size');
        const filled = this.safeString (order, 'dealSize');
        const rawCost = this.safeString2 (order, 'dealFunds', 'filledValue');
        const leverage = this.safeString (order, 'leverage');
        const cost = Precise.stringDiv (rawCost, leverage);
        let average = undefined;
        if (Precise.stringGt (filled, '0')) {
            const contractSize = this.safeString (market, 'contractSize');
            if (market['linear']) {
                average = Precise.stringDiv (rawCost, Precise.stringMul (contractSize, filled));
            } else {
                average = Precise.stringDiv (Precise.stringMul (contractSize, filled), rawCost);
            }
        }
        // precision reported by their api is 8 d.p.
        // const average = Precise.stringDiv (rawCost, Precise.stringMul (filled, market['contractSize']));
        // bool
        const isActive = this.safeValue (order, 'isActive', false);
        const cancelExist = this.safeValue (order, 'cancelExist', false);
        let status = isActive ? 'open' : 'closed';
        status = cancelExist ? 'canceled' : status;
        const fee = {
            'currency': feeCurrency,
            'cost': feeCost,
        };
        const clientOrderId = this.safeString (order, 'clientOid');
        const timeInForce = this.safeString (order, 'timeInForce');
        const stopPrice = this.safeNumber (order, 'stopPrice');
        const postOnly = this.safeValue (order, 'postOnly');
        return this.safeOrder ({
            'id': orderId,
            'clientOrderId': clientOrderId,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'amount': amount,
            'price': price,
            'stopPrice': stopPrice,
            'cost': cost,
            'filled': filled,
            'remaining': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'fee': fee,
            'status': status,
            'info': order,
            'lastTradeTimestamp': undefined,
            'average': average,
            'trades': undefined,
        }, market);
    }

    async fetchFundingRate (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        const response = await this.futuresPublicGetFundingRateSymbolCurrent (this.extend (request, params));
        //
        //    {
        //        code: "200000",
        //        data: {
        //            symbol: ".ETHUSDTMFPI8H",
        //            granularity: 28800000,
        //            timePoint: 1637380800000,
        //            value: 0.0001,
        //            predictedValue: 0.0001,
        //        },
        //    }
        //
        const data = this.safeValue (response, 'data');
        const fundingTimestamp = this.safeNumber (data, 'timePoint');
        return {
            'info': data,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber (data, 'value'),
            'fundingTimestamp': fundingTimestamp,
            'fundingDatetime': this.iso8601 (fundingTimestamp),
            'nextFundingRate': this.safeNumber (data, 'predictedValue'),
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    parseBalance (response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const data = this.safeValue (response, 'data');
        const currencyId = this.safeString (data, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const account = this.account ();
        account['free'] = this.safeString (data, 'availableBalance');
        account['total'] = this.safeString (data, 'accountEquity');
        result[code] = account;
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        // only fetches one balance at a time
        let defaultCode = this.safeString (this.options, 'code');
        const fetchBalanceOptions = this.safeValue (this.options, 'fetchBalance', {});
        defaultCode = this.safeString (fetchBalanceOptions, 'code', defaultCode);
        const code = this.safeString (params, 'code', defaultCode);
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.futuresPrivateGetAccountOverview (this.extend (request, params));
        //
        //     {
        //         code: '200000',
        //         data: {
        //             accountEquity: 0.00005,
        //             unrealisedPNL: 0,
        //             marginBalance: 0.00005,
        //             positionMargin: 0,
        //             orderMargin: 0,
        //             frozenFunds: 0,
        //             availableBalance: 0.00005,
        //             currency: 'XBT'
        //         }
        //     }
        //
        return this.parseBalance (response);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        if ((toAccount !== 'main' && toAccount !== 'funding') || (fromAccount !== 'futures' && fromAccount !== 'future' && fromAccount !== 'contract')) {
            throw new BadRequest (this.id + ' only supports transfers from contract(future) account to main(funding) account');
        }
        return this.transferOut (code, amount, params);
    }

    async transferOut (code, amount, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': this.safeString (currency, 'id'), // Currency,including XBT,USDT
            'amount': amount,
        };
        // transfer from usdm futures wallet to spot wallet
        const response = await this.futuresPrivatePostTransferOut (this.extend (request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "applyId": "5bffb63303aa675e8bbe18f9" // Transfer-out request ID
        //        }
        //    }
        //
        const data = this.safeValue (response, 'data');
        const timestamp = this.safeString (data, 'updatedAt');
        return {
            'info': response,
            'id': this.safeString (data, 'applyId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': code,
            'amount': amount,
            'fromAccount': 'future',
            'toAccount': 'spot',
            'status': this.safeString (data, 'status'),
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // orderId (String) [optional] Fills for a specific order (other parameters can be ignored if specified)
            // symbol (String) [optional] Symbol of the contract
            // side (String) [optional] buy or sell
            // type (String) [optional] limit, market, limit_stop or market_stop
            // startAt (long) [optional] Start time (milisecond)
            // endAt (long) [optional] End time (milisecond)
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        const response = await this.futuresPrivateGetFills (this.extend (request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //          "currentPage": 1,
        //          "pageSize": 1,
        //          "totalNum": 251915,
        //          "totalPage": 251915,
        //          "items": [
        //              {
        //                  "symbol": "XBTUSDM",  // Ticker symbol of the contract
        //                  "tradeId": "5ce24c1f0c19fc3c58edc47c",  // Trade ID
        //                  "orderId": "5ce24c16b210233c36ee321d",  // Order ID
        //                  "side": "sell",  // Transaction side
        //                  "liquidity": "taker",  // Liquidity- taker or maker
        //                  "price": "8302",  // Filled price
        //                  "size": 10,  // Filled amount
        //                  "value": "0.001204529",  // Order value
        //                  "feeRate": "0.0005",  // Floating fees
        //                  "fixFee": "0.00000006",  // Fixed fees
        //                  "feeCurrency": "XBT",  // Charging currency
        //                  "stop": "",  // A mark to the stop order type
        //                  "fee": "0.0000012022",  // Transaction fee
        //                  "orderType": "limit",  // Order type
        //                  "tradeType": "trade",  // Trade type (trade, liquidation, ADL or settlement)
        //                  "createdAt": 1558334496000,  // Time the order created
        //                  "settleCurrency": "XBT", // settlement currency
        //                  "tradeTime": 1558334496000000000 // trade time in nanosecond
        //              }
        //            ]
        //        }
        //    }
        //
        const data = this.safeValue (response, 'data', {});
        const trades = this.safeValue (data, 'items', {});
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.futuresPublicGetTradeHistory (this.extend (request, params));
        //
        //      {
        //          "code": "200000",
        //          "data": [
        //              {
        //                  "sequence": 32114961,
        //                  "side": "buy",
        //                  "size": 39,
        //                  "price": "4001.6500000000",
        //                  "takerOrderId": "61c20742f172110001e0ebe4",
        //                  "makerOrderId": "61c2073fcfc88100010fcb5d",
        //                  "tradeId": "61c2074277a0c473e69029b8",
        //                  "ts": 1640105794099993896   // filled time
        //              }
        //          ]
        //      }
        //
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "sequence": 32114961,
        //         "side": "buy",
        //         "size": 39,
        //         "price": "4001.6500000000",
        //         "takerOrderId": "61c20742f172110001e0ebe4",
        //         "makerOrderId": "61c2073fcfc88100010fcb5d",
        //         "tradeId": "61c2074277a0c473e69029b8",
        //         "ts": 1640105794099993896   // filled time
        //     }
        //
        // fetchMyTrades (private) v2
        //
        //     {
        //         "symbol":"BTC-USDT",
        //         "tradeId":"5c35c02709e4f67d5266954e",
        //         "orderId":"5c35c02703aa673ceec2a168",
        //         "counterOrderId":"5c1ab46003aa676e487fa8e3",
        //         "side":"buy",
        //         "liquidity":"taker",
        //         "forceTaker":true,
        //         "price":"0.083",
        //         "size":"0.8424304",
        //         "funds":"0.0699217232",
        //         "fee":"0",
        //         "feeRate":"0",
        //         "feeCurrency":"USDT",
        //         "stop":"",
        //         "type":"limit",
        //         "createdAt":1547026472000
        //     }
        //
        // fetchMyTrades (private) v1
        //
        //      {
        //          "symbol":"DOGEUSDTM",
        //          "tradeId":"620ec41a96bab27b5f4ced56",
        //          "orderId":"620ec41a0d1d8a0001560bd0",
        //          "side":"sell",
        //          "liquidity":"taker",
        //          "forceTaker":true,
        //          "price":"0.13969",
        //          "size":1,
        //          "value":"13.969",
        //          "feeRate":"0.0006",
        //          "fixFee":"0",
        //          "feeCurrency":"USDT",
        //          "stop":"",
        //          "tradeTime":1645134874858018058,
        //          "fee":"0.0083814",
        //          "settleCurrency":"USDT",
        //          "orderType":"market",
        //          "tradeType":"trade",
        //          "createdAt":1645134874858
        //      }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market, '-');
        const id = this.safeString2 (trade, 'tradeId', 'id');
        const orderId = this.safeString (trade, 'orderId');
        const takerOrMaker = this.safeString (trade, 'liquidity');
        let timestamp = this.safeInteger (trade, 'time');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp / 1000000);
        } else {
            timestamp = this.safeInteger (trade, 'createdAt');
            // if it's a historical v1 trade, the exchange returns timestamp in seconds
            if (('dealValue' in trade) && (timestamp !== undefined)) {
                timestamp = timestamp * 1000;
            }
        }
        const priceString = this.safeString2 (trade, 'price', 'dealPrice');
        const amountString = this.safeString2 (trade, 'size', 'amount');
        const side = this.safeString (trade, 'side');
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'fee');
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeCurrency');
            let feeCurrency = this.safeCurrencyCode (feeCurrencyId);
            if (feeCurrency === undefined) {
                feeCurrency = (side === 'sell') ? market['quote'] : market['base'];
            }
            fee = {
                'cost': feeCostString,
                'currency': feeCurrency,
                'rate': this.safeString (trade, 'feeRate'),
            };
        }
        let type = this.safeString2 (trade, 'type', 'orderType');
        if (type === 'match') {
            type = undefined;
        }
        let costString = this.safeString2 (trade, 'funds', 'value');
        if (costString === undefined) {
            const contractSize = this.safeString (market, 'contractSize');
            const contractCost = Precise.stringMul (priceString, amountString);
            costString = Precise.stringMul (contractCost, contractSize);
        }
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        const response = await this.futuresPrivateGetDepositList (this.extend (request, params));
        //
        //     {
        //         code: '200000',
        //         data: {
        //             "currentPage": 1,
        //             "pageSize": 5,
        //             "totalNum": 2,
        //             "totalPage": 1,
        //             "items": [
        //                 {
        //                     "address": "0x5f047b29041bcfdbf0e4478cdfa753a336ba6989",
        //                     "memo": "5c247c8a03aa677cea2a251d",
        //                     "amount": 1,
        //                     "fee": 0.0001,
        //                     "currency": "KCS",
        //                     "isInner": false,
        //                     "walletTxId": "5bbb57386d99522d9f954c5a@test004",
        //                     "status": "SUCCESS",
        //                     "createdAt": 1544178843000,
        //                     "updatedAt": 1544178891000
        //                     "remark":"foobar"
        //                 },
        //                 ...
        //             ]
        //         }
        //     }
        //
        const responseData = response['data']['items'];
        return this.parseTransactions (responseData, currency, since, limit, { 'type': 'deposit' });
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        const response = await this.futuresPrivateGetWithdrawalList (this.extend (request, params));
        //
        //     {
        //         code: '200000',
        //         data: {
        //             "currentPage": 1,
        //             "pageSize": 5,
        //             "totalNum": 2,
        //             "totalPage": 1,
        //             "items": [
        //                 {
        //                     "id": "5c2dc64e03aa675aa263f1ac",
        //                     "address": "0x5bedb060b8eb8d823e2414d82acce78d38be7fe9",
        //                     "memo": "",
        //                     "currency": "ETH",
        //                     "amount": 1.0000000,
        //                     "fee": 0.0100000,
        //                     "walletTxId": "3e2414d82acce78d38be7fe9",
        //                     "isInner": false,
        //                     "status": "FAILURE",
        //                     "createdAt": 1546503758000,
        //                     "updatedAt": 1546504603000
        //                 },
        //                 ...
        //             ]
        //         }
        //     }
        //
        const responseData = response['data']['items'];
        return this.parseTransactions (responseData, currency, since, limit, { 'type': 'withdrawal' });
    }

    async fetchFundingFee (code, params = {}) {
        throw new BadRequest (this.id + ' has no method fetchFundingFee');
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        throw new BadRequest (this.id + ' has no method fetchLedger');
    }

    async fetchMarketLeverageTiers (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['contract']) {
            throw new BadRequest (this.id + ' fetchLeverageTiers() supports contract markets only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.futuresPublicGetContractsRiskLimitSymbol (this.extend (request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": [
        //            {
        //                "symbol": "ETHUSDTM",
        //                "level": 1,
        //                "maxRiskLimit": 300000,
        //                "minRiskLimit": 0,
        //                "maxLeverage": 100,
        //                "initialMargin": 0.0100000000,
        //                "maintainMargin": 0.0050000000
        //            },
        //            ...
        //        ]
        //    }
        //
        const data = this.safeValue (response, 'data');
        return this.parseMarketLeverageTiers (data, market);
    }

    parseMarketLeverageTiers (info, market) {
        /**
            @param info: Exchange market response for 1 market
            {
                "symbol": "ETHUSDTM",
                "level": 1,
                "maxRiskLimit": 300000,
                "minRiskLimit": 0,
                "maxLeverage": 100,
                "initialMargin": 0.0100000000,
                "maintainMargin": 0.0050000000
            }
            @param market: CCXT market
        */
        const tiers = [];
        for (let i = 0; i < info.length; i++) {
            const tier = info[i];
            tiers.push ({
                'tier': this.safeNumber (tier, 'level'),
                'currency': market['base'],
                'notionalFloor': this.safeNumber (tier, 'minRiskLimit'),
                'notionalCap': this.safeNumber (tier, 'maxRiskLimit'),
                'maintenanceMarginRate': this.safeNumber (tier, 'maintainMargin'),
                'maxLeverage': this.safeNumber (tier, 'maxLeverage'),
                'info': tier,
            });
        }
        return tiers;
    }
};
