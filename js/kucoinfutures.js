'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, AccountSuspended, InvalidNonce, NotSupported, BadRequest, AuthenticationError, BadSymbol, RateLimitExceeded, PermissionDenied } = require ('./base/errors');
const Precise = require ('./base/Precise');
const kucoin = require ('./kucoin.js');

//  ---------------------------------------------------------------------------

module.exports = class kucoinfutures extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kucoinfutures',
            'name': 'Kucoin Futures',
            'countries': [ 'SC' ],
            'rateLimit': 334,
            'version': 'v2',
            'certified': false,
            'pro': true,
            'comment': 'Platform 2.0',
            'quoteJsonNumbers': false,
            'has': {
                'cancelAllOrders': undefined,
                'cancelOrder': undefined,
                'CORS': undefined,
                'createDepositAddress': undefined,
                'createOrder': undefined,
                'fetchAccounts': undefined,
                'fetchBalance': undefined,
                'fetchClosedOrders': undefined,
                'fetchCurrencies': undefined,
                'fetchDepositAddress': undefined,
                'fetchDeposits': undefined,
                'fetchFundingFee': undefined,
                'fetchFundingHistory': undefined,
                'fetchFundingRateHistory': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': undefined,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': undefined,
                'fetchOHLCV': undefined,
                'fetchOpenOrders': undefined,
                'fetchOrder': undefined,
                'fetchOrderBook': undefined,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': undefined,
                'fetchTicker': undefined,
                'fetchTickers': undefined,
                'fetchTime': undefined,
                'fetchTrades': undefined,
                'fetchWithdrawals': undefined,
                'transfer': undefined,
                'withdraw': undefined,
            },
            'urls': {
                'logo': 'https://docs.kucoin.com/futures/images/logo_en.svg',
                'doc': [
                    'https://docs.kucoin.com/futures',
                    'https://docs.kucoin.com',
                ],
                'www': 'https://futures.kucoin.com/',
                'referral': 'https://www.kucoin.com/?rcode=E5wkqe',
                'api': {
                    'futuresPrivate': 'https://api-futures.kucoin.com',
                    'futuresPublic': 'https://api-futures.kucoin.com',
                },
                'test': {
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
                    'get': [
                        'contracts/active',
                        'contracts/{symbol}',
                        'ticker',
                        'level2/snapshot',
                        'level2/depth20',
                        'level2/depth100',
                        'level2/message/query',
                        'level3/message/query', // deprecated，level3/snapshot is suggested
                        'level3/snapshot', // v2
                        'trade/history',
                        'interest/query',
                        'index/query',
                        'mark-price/{symbol}/current',
                        'premium/query',
                        'funding-rate/{symbol}/current',
                        'timestamp',
                        'status',
                        'kline/query',
                    ],
                    'post': [
                        'bullet-public',
                    ],
                },
                'futuresPrivate': {
                    'get': [
                        'account-overview',
                        'transaction-history',
                        'deposit-address',
                        'deposit-list',
                        'withdrawals/quotas',
                        'withdrawal-list',
                        'transfer-list',
                        'orders',
                        'stopOrders',
                        'recentDoneOrders',
                        'orders/{order-id}', // ?clientOid={client-order-id} // get order by orderId
                        'orders/byClientOid', // ?clientOid=eresc138b21023a909e5ad59 // get order by clientOid
                        'fills',
                        'recentFills',
                        'openOrderStatistics',
                        'position',
                        'positions',
                        'funding-history',
                    ],
                    'post': [
                        'withdrawals',
                        'transfer-out', // v2
                        'orders',
                        'position/margin/auto-deposit-status',
                        'position/margin/deposit-margin',
                        'bullet-private',
                    ],
                    'delete': [
                        'withdrawals/{withdrawalId}',
                        'cancel/transfer-out',
                        'orders/{order-id}',
                        'orders',
                        'stopOrders',
                    ],
                },
            },
            'exceptions': {
                'exact': {
                    // 'order not exist': OrderNotFound,
                    // 'order not exist.': OrderNotFound, // duplicated error temporarily
                    // 'order_not_exist': OrderNotFound, // {"code":"order_not_exist","msg":"order_not_exist"} ¯\_(ツ)_/¯
                    // 'order_not_exist_or_not_allow_to_cancel': InvalidOrder, // {"code":"400100","msg":"order_not_exist_or_not_allow_to_cancel"}
                    // 'Order size below the minimum requirement.': InvalidOrder, // {"code":"400100","msg":"Order size below the minimum requirement."}
                    // 'The withdrawal amount is below the minimum requirement.': ExchangeError, // {"code":"400100","msg":"The withdrawal amount is below the minimum requirement."}
                    // 'Unsuccessful! Exceeded the max. funds out-transfer limit': InsufficientFunds, // {"code":"200000","msg":"Unsuccessful! Exceeded the max. funds out-transfer limit"}
                    '400': BadRequest, // Bad Request -- Invalid request format
                    '401': AuthenticationError, // Unauthorized -- Invalid API Key
                    '403': NotSupported, // Forbidden -- The request is forbidden
                    '404': NotSupported, // Not Found -- The specified resource could not be found
                    '405': NotSupported, // Method Not Allowed -- You tried to access the resource with an invalid method.
                    '415': BadRequest,  // Content-Type -- application/json
                    '429': RateLimitExceeded, // Too Many Requests -- Access limit breached
                    '500': ExchangeNotAvailable, // Internal Server Error -- We had a problem with our server. Try again later.
                    '503': ExchangeNotAvailable, // Service Unavailable -- We're temporarily offline for maintenance. Please try again later.
                    '101030': PermissionDenied, // {"code":"101030","msg":"You haven't yet enabled the margin trading"}
                    '200004': InsufficientFunds,
                    '230003': InsufficientFunds, // {"code":"230003","msg":"Balance insufficient!"}
                    '260100': InsufficientFunds, // {"code":"260100","msg":"account.noBalance"}
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
                // 'broad': {
                //     'Exceeded the access frequency': RateLimitExceeded,
                //     'require more permission': PermissionDenied,
                // },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
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
                'version': 'v2',
                'symbolSeparator': '-',
                'defaultType': 'swap',
                'marginTypes': {},
                // endpoint versions
                'versions': {
                    'futuresPrivate': {
                        'GET': {
                            'account-overview': 'v1',
                            'positions': 'v1',
                        },
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
                'accountsByType': {
                    'trade': 'trade',
                    'trading': 'trade',
                    'spot': 'trade',
                    'margin': 'margin',
                    'main': 'main',
                    'funding': 'main',
                    'futures': 'contract',
                    'contract': 'contract',
                    'pool': 'pool',
                    'pool-x': 'pool',
                },
                'networks': {
                    'ETH': 'eth',
                    'ERC20': 'eth',
                    'TRX': 'trx',
                    'TRC20': 'trx',
                    'KCC': 'kcc',
                    'TERRA': 'luna',
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.futuresPublicGetContractsActive (params);
        //
        //  {
        //     "code": "200000",
        //     "data": {
        //         "symbol": "ETHUSDTM",
        //         "rootSymbol": "USDT",
        //         "type": "FFWCSX",
        //         "firstOpenDate": 1591086000000,
        //         "expireDate": null,
        //         "settleDate": null,
        //         "baseCurrency": "ETH",
        //         "quoteCurrency": "USDT",
        //         "settleCurrency": "USDT",
        //         "maxOrderQty": 1000000,
        //         "maxPrice": 1000000.0000000000,
        //         "lotSize": 1,
        //         "tickSize": 0.05,
        //         "indexPriceTickSize": 0.01,
        //         "multiplier": 0.01,
        //         "initialMargin": 0.01,
        //         "maintainMargin": 0.005,
        //         "maxRiskLimit": 1000000,
        //         "minRiskLimit": 1000000,
        //         "riskStep": 500000,
        //         "makerFeeRate": 0.00020,
        //         "takerFeeRate": 0.00060,
        //         "takerFixFee": 0.0000000000,
        //         "makerFixFee": 0.0000000000,
        //         "settlementFee": null,
        //         "isDeleverage": true,
        //         "isQuanto": true,
        //         "isInverse": false,
        //         "markMethod": "FairPrice",
        //         "fairMethod": "FundingRate",
        //         "fundingBaseSymbol": ".ETHINT8H",
        //         "fundingQuoteSymbol": ".USDTINT8H",
        //         "fundingRateSymbol": ".ETHUSDTMFPI8H",
        //         "indexSymbol": ".KETHUSDT",
        //         "settlementSymbol": "",
        //         "status": "Open",
        //         "fundingFeeRate": 0.000535,
        //         "predictedFundingFeeRate": 0.002197,
        //         "openInterest": "8724443",
        //         "turnoverOf24h": 341156641.03354263,
        //         "volumeOf24h": 74833.54000000,
        //         "markPrice": 4534.07,
        //         "indexPrice":4531.92,
        //         "lastTradePrice": 4545.4500000000,
        //         "nextFundingRateTime": 25481884,
        //         "maxLeverage": 100,
        //         "sourceExchanges":  [
        //             "huobi",
        //             "Okex",
        //             "Binance",
        //             "Kucoin",
        //             "Poloniex",
        //             "Hitbtc"
        //         ],
        //         "premiumsSymbol1M": ".ETHUSDTMPI",
        //         "premiumsSymbol8H": ".ETHUSDTMPI8H",
        //         "fundingBaseSymbol1M": ".ETHINT",
        //         "fundingQuoteSymbol1M": ".USDTINT",
        //         "lowPrice": 4456.90,
        //         "highPrice":  4674.25,
        //         "priceChgPct": 0.0046,
        //         "priceChg": 21.15
        //     }
        //  }
        //
        const result = [];
        const data = this.safeValue (response, 'data');
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            let expireDate = this.safeNumber (market, 'expireDate');
            if (expireDate) {
                expireDate = expireDate.toString ();
            }
            const futures = expireDate ? true : false;
            const swap = !futures;
            const base = this.safeString (market, 'baseCurrency');
            const quote = this.safeString (market, 'quoteCurrency');
            const settle = this.safeString (market, 'settleCurrency');
            let symbol = base + '/' + quote + ':' + settle;
            let type = 'swap';
            if (futures) {
                symbol = base + '/' + quote + '-' + expireDate + ':' + settle;
                type = 'futures';
            }
            const baseMaxSize = this.safeNumber (market, 'baseMaxSize');
            const baseMinSizeString = this.safeString (market, 'baseMinSize');
            const quoteMaxSizeString = this.safeString (market, 'quoteMaxSize');
            const baseMinSize = this.parseNumber (baseMinSizeString);
            const quoteMaxSize = this.parseNumber (quoteMaxSizeString);
            const quoteMinSize = this.safeNumber (market, 'quoteMinSize');
            const inverse = this.safeValue (market, 'isInverse');
            // const quoteIncrement = this.safeNumber (market, 'quoteIncrement');
            const amount = this.safeString (market, 'baseIncrement');
            const price = this.safeString (market, 'priceIncrement');
            const precision = {
                'amount': amount ? this.precisionFromString (this.safeString (market, 'baseIncrement')) : undefined,
                'price': price ? this.precisionFromString (this.safeString (market, 'priceIncrement')) : undefined,
            };
            const limits = {
                'amount': {
                    'min': baseMinSize,
                    'max': baseMaxSize,
                },
                'price': {
                    'min': this.safeNumber (market, 'priceIncrement'),
                    'max': this.parseNumber (Precise.stringDiv (quoteMaxSizeString, baseMinSizeString)),
                },
                'cost': {
                    'min': quoteMinSize,
                    'max': quoteMaxSize,
                },
                'leverage': {
                    'max': this.safeNumber (market, 'maxLeverage', 1),
                },
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'baseId': base,
                'quoteId': quote,
                'settleId': settle,
                'base': base,
                'quote': quote,
                'type': type,
                'spot': false,
                'margin': false,
                'swap': swap,
                'futures': futures,
                'option': false,
                'active': true,
                'maker': undefined,
                'taker': undefined,
                'precision': precision,
                'contract': swap,
                'linear': inverse !== true,
                'inverse': inverse,
                'expiry': this.safeValue (market, 'expireDate'),
                'contractSize': undefined,
                'limits': limits,
                'info': market,
                // Fee is in %, so divide by 100
                'fees': this.safeValue (this.fees, 'type', {}),
            });
        }
        return result;
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
        //     {
        //         "code":"200000",
        //         "data":[
        //             [1636459200000, 4779.3, 4792.1, 4768.7, 4770.3, 78051],
        //             [1636460100000, 4770.25, 4778.55, 4757.55, 4777.25, 80164],
        //             [1636461000000, 4777.25, 4791.45, 4774.5, 4791.3, 51555]
        //         ]
        //     }
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchL3OrderBook (symbol, limit = undefined, params = {}) {
        // Only here to overwrite superclass method
        throw new ExchangeError ('fetchL3OrderBook is not available using ' + this.id);
    }

    async transferIn (code, amount, params = {}) {
        // transfer from spot wallet to usdm futures wallet
        return await this.futuresTransfer (code, amount, 1, params);
    }

    // async transferIn (code, amount, params = {}) {
    //     // transfer from spot wallet to usdm futures wallet
    //     return await this.futuresTransfer (code, amount, 1, params);
    // }

    // async transferOut (code, amount, params = {}) {
    //     // transfer from usdm futures wallet to spot wallet
    //     return await this.futuresTransfer (code, amount, 2, params);
    // }
};
