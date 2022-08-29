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
                'cancelOrder': true,
                'createDepositAddress': true,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchCancelOrders': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDeposit': false,
                'fetchDepositAddress': true,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchFundingFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRates': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPositions': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransaction': false,
                'fetchTransactions': false,
                'fetchTransfers': true,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
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
        /**
         *  CCXT Protocal:
            {
            'id':      'btcusd',      // string literal for referencing within an exchange
            'symbol':  'BTC/USD',     // uppercase string literal of a pair of currencies
            'base':    'BTC',         // uppercase string, unified base currency code, 3 or more letters
            'quote':   'USD',         // uppercase string, unified quote currency code, 3 or more letters
            'baseId':  'btc',         // any string, exchange-specific base currency id
            'quoteId': 'usd',         // any string, exchange-specific quote currency id
            'active':   true,         // boolean, market status
            'type':    'spot',        // spot for spot, future for expiry futures, swap for perpetual swaps, 'option' for options
            'spot':     true,         // whether the market is a spot market
            'margin':   true,         // whether the market is a margin market
            'future':   false,        // whether the market is a expiring future
            'swap':     false,        // whether the market is a perpetual swap
            'option':   false,        // whether the market is an option contract
            'contract': false,        // whether the market is a future, a perpetual swap, or an option
            'settle':   'USDT',       // the unified currency code that the contract will settle in, only set if `contract` is true
            'settleId': 'usdt',       // the currencyId of that the contract will settle in, only set if `contract` is true
            'contractSize': 1,        // the size of one contract, only used if `contract` is true
            'linear':   true,         // the contract is a linear contract (settled in quote currency)
            'inverse':  false,        // the contract is an inverse contract (settled in base currency)
            'expiry':  1641370465121, // the unix expiry timestamp in milliseconds, undefined for everything except market['type'] `future`
            'expiryDatetime': '2022-03-26T00:00:00.000Z', // The datetime contract will in iso8601 format
            'strike': 4000,           // price at which a put or call option can be exercised
            'optionType': 'call',     // call or put string, call option represents an option with the right to buy and put an option with the right to sell
            'taker':    0.002,        // taker fee rate, 0.002 = 0.2%
            'maker':    0.0016,       // maker fee rate, 0.0016 = 0.16%
            'percentage': true,       // whether the taker and maker fee rate is a multiplier or a fixed flat amount
            'tierBased': false,       // whether the fee depends on your trading tier (your trading volume)
            'feeSide': 'get',         // string literal can be 'get', 'give', 'base', 'quote', 'other'
            'precision': {            // number of decimal digits "after the dot"
                'price': 8,           // integer or float for TICK_SIZE roundingMode, might be missing if not supplied by the exchange
                'amount': 8,          // integer, might be missing if not supplied by the exchange
                'cost': 8,            // integer, very few exchanges actually have it
            },
            'limits': {               // value limits when placing orders on this market
                'amount': {
                    'min': 0.01,      // order amount should be > min
                    'max': 1000,      // order amount should be < max
                },
                'price': { ... },     // same min/max limits for the price of the order
                'cost':  { ... },     // same limits for order cost = price * amount
                'leverage': { ... },  // same min/max limits for the leverage of the order
            },
            'info':      { ... },     // the original unparsed market info from the exchange
        }
        *
        * @param {*} params
        * @returns
        */
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
            // const minPriceIncrement = this.safeNumber (market, 'minPriceIncrement');
            const minValidPrice = this.safeNumber (market, 'minValidPrice');
            const active = this.safeString (market, 'active');
            const amountPrecision = this.precisionFromString (this.safeString (market, 'minSizeIncrement'));
            const pricePrecision = this.precisionFromString (this.safeString (market, 'minPriceIncrement'));
            const precision = {
                'amount': amountPrecision,
                'price': pricePrecision,
            };
            result.push ({
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'maker': undefined,      // Fees are determined by user level
                'taker': undefined,      // Fees are determined by user level
                'percentage': undefined, // Fees are determined by user level
                'tierBased': true,       // https://support.btse.com/en/support/solutions/articles/43000064283
                // 'feeSide': 'get',     // ???
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
                'active': (active === 'true'),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.parseNumber (minQuantity),
                        'max': this.parseNumber (maxQuantity),
                    },
                    'price': {
                        'min': minValidPrice,
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
            const minValidPrice = this.safeNumber (market, 'minValidPrice');
            // const minSizeIncrement = this.safeNumber (market, 'minSizeIncrement');
            const active = this.safeString (market, 'active');
            const amountPrecision = this.precisionFromString (this.safeString (market, 'minOrderSize'));
            const pricePrecision = this.precisionFromString (this.safeString (market, 'minValidPrice'));
            const precision = {
                'amount': amountPrecision,
                'price': pricePrecision,
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
                'active': (active === 'true'),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.parseNumber (minQuantity),
                        'max': this.parseNumber (maxQuantity),
                    },
                    'price': {
                        'min': minValidPrice,
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

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        // if (symbols !== undefined) {
        //     const requestSymbols = [];
        //     for (let i = 0; i < symbols.length; i++) {
        //         const symbol = this.safeValue (symbols, i, '');
        //         requestSymbols.push ((this.market (symbol))['id']);
        //     }
        //     request['symbols']
        // }
        const spotResponse = await this.spotPublicGetMarketSummary (params);
        const futureResponse = await this.futurePublicGetMarketSummary (params);
        //
        //   [{
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
        //   }]
        //
        const allResponse = this.arrayConcat (spotResponse, futureResponse);
        const tickers = {};
        for (let i = 0; i < allResponse.length; i++) {
            const response = this.safeValue (allResponse, i, {});
            const market = this.market (this.safeValue (response, 'symbol', ''));
            const symbol = this.safeSymbol (market['id'], market);
            if (symbols !== undefined) {
                if (symbols.indexOf (symbol) === -1) {
                    continue;
                }
            }
            const ticker = this.parseTicker (response, market);
            tickers[symbol] = ticker;
        }
        return tickers;
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

    parsePublicTrade (trade, market = undefined) {
        /**
         * parse Public Trade info
         */
        //  {
        //     price: "29244.0",
        //     size: "1.0E-5",
        //     side: "SELL",
        //     symbol: "BTC-USD",
        //     serialId: "214310396",
        //     timestamp: "1653139088000",
        //   }
        const id = this.safeString (trade, 'serialId');
        const orderId = this.safeString (trade, 'serialId');
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
            'order': orderId,
            'type': undefined, // public trade not exists type field
            'side': side,
            'price': price,
            'amount': amount,
            'takerOrMaker': undefined,
            'cost': undefined,
        });
    }

    parseTrade (trade, market = undefined) {
        if ('_btseCustomMode' in trade) {
            if (trade['_btseCustomMode'] === 'fetchMyTrades') {
                return this.parseMyTrade (trade, market);
            }
        }
        if ('orderid' in trade && !trade['orderid']) {
            return this.parsePublicTrade (trade, market);
        }
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

    parseMyTrade (trade, market = undefined) {
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
        const filledPrice = this.safeNumber (trade, 'filledPrice');
        const filledSize = this.safeNumber (trade, 'filledSize');
        const cost = filledSize * filledPrice;
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
        }, market);
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
        // transfer to milliseconds
        const resp = [];
        for (let i = 0; i < response.length; i++) {
            const oldResp = response[i];
            oldResp[0] = oldResp[0] * 1000;
            resp.push (oldResp);
        }
        return this.parseOHLCVs (resp, market, timeframe, since, limit);
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
        if (response['epoch']) {
            // transfer to milliseconds
            response['epoch'] = this.safeInteger (response, 'epoch') * 1000;
        }
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
            '1': 'rejected',
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
        const cost = (filled && average) ? filled * average : 0;
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

    parseTransactionType (type) {
        const types = {
            'Deposit': 'deposit',
            'Withdraw': 'withdraw',
        };
        return this.safeString (types, type, type);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'Pending': 'pending',
            'Processing': 'pending',
            'Completed': 'ok',
            'Cancelled': 'canceled',
            'Expired': 'failed',
            'User Cancelled': 'canceled',
            'Check Failed': 'failed',
        };
        return this.safeString (statuses, status, 'pending');
    }

    parseTransfer (transfer, currency = undefined) {
        //
        // {
        //   username: 'tiancaidev',
        //   orderId: '9a195f15-f998-4407-8f87-b7b2590bb871',
        //   wallet: 'CROSS@',
        //   currency: 'BTC',
        //   type: '105',
        //   amount: '-0.123',
        //   fees: '0.0',
        //   description: 'CROSS@->SPOT@',
        //   timestamp: '1653710942'
        // }
        //
        const id = this.safeString (transfer, 'orderId');
        const created = this.safeInteger (transfer, 'timestamp');
        const currencyId = this.safeString (transfer, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const amount = -this.safeNumber (transfer, 'amount');
        let fromAccount = 'future';
        if (this.safeString (transfer, 'wallet') === 'SPOT@') {
            fromAccount = 'spot';
        }
        const description = this.safeString (transfer, 'description');
        let toAccount = 'spot';
        if (fromAccount === 'spot') {
            toAccount = 'future';
        } else if (description.indexOf ('SPOT@') < 0) {
            toAccount = 'future';
        }
        return {
            'info': transfer,
            'id': id,
            'timestamp': created,
            'datetime': this.iso8601 (created),
            'currency': code,
            'amount': amount,
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': 'ok',
        };
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // Spot:
        // [{
        //   username: 'tiancaidev',
        //   orderId: '2022052600000015',
        //   wallet: 'SPOT@',
        //   currency: 'BTC',
        //   type: 'Transfer_Out',
        //   amount: '1.0E-4',
        //   fees: '0.0',
        //   description: '',
        //   timestamp: '1653579720995',
        //   status: 'Completed',
        //   txId: '',
        //   toAddress: '',
        //   currencyNetwork: '',
        //   sourceCurrency: '',
        //   sourceAmount: '0',
        //   targetCurrency: 'BTC',
        //   targetAmount: '0.00010',
        //   rate: '1.0'
        // }]
        //
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const created = this.safeInteger (transaction, 'timestamp');
        const txid = this.safeString (transaction, 'txId', '');
        const id = this.safeString (transaction, 'orderId');
        let addressTo = this.safeString (transaction, 'toAddress', '');
        if (!addressTo) {
            addressTo = undefined;
        }
        const type = this.parseTransactionType (this.safeString (transaction, 'type'));
        const amount = this.safeNumber (transaction, 'amount');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const feeCost = this.safeNumber (transaction, 'fees');
        const rate = this.safeNumber (transaction, 'rate');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost, 'rate': rate };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': created,
            'datetime': this.iso8601 (created),
            'addressFrom': undefined,
            'address': addressTo,
            'addressTo': addressTo,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'comment': undefined,
            'fee': fee,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'orderID': id,
        };
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrder', market, params);
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
        return this.parseOrder (this.safeValue (response, 0), market);
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
            // 'includeOld': true,
            // 'startTime': 1652803200000,
            // 'endTime': 1653494399000
        };
        if (since === undefined) {
            // default since is before 7 days
            // request.startTime = Date.now () - (7 * 86400 * 1000);
            request['startTime'] = (Date.now ()) - 7 * 86400 * 1000;
        } else {
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
        const newFormatResp = [];
        for (let i = 0; i < response.length; i++) {
            const oldResp = response[i];
            oldResp['_btseCustomMode'] = 'fetchMyTrades';
            newFormatResp.push (oldResp);
        }
        return this.parseTrades (newFormatResp, market, since, limit);
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (id + ' editOrder requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market) {
            throw new ArgumentsRequired (id + ' symbol not found market');
        }
        const request = {
            'orderID': id,
            'type': 'ALL',
            'symbol': market['id'],
        };
        if (price !== undefined) {
            request['orderPrice'] = parseFloat (this.priceToPrecision (symbol, price));
            request['value'] = request['orderPrice'];
        }
        if (amount !== undefined) {
            request['orderSize'] = parseFloat (this.amountToPrecision (symbol, amount));
        }
        const query = this.handleMarketTypeAndParams ('editOrder', market, request)[1];
        const marketType = market['type'];
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPrivatePutOrder',
            'future': 'futurePrivatePutOrder',
            'swap': 'futurePrivatePutOrder',
        });
        const response = await this[method] (this.extend (request, query));
        if (!response[0] && !response[0]['orderID']) {
            throw new BadRequest (id + ' edit order failed.');
        }
        const lastestOrdersInfo = await this.fetchOpenOrders (symbol, undefined, undefined, { 'orderId': id });
        return lastestOrdersInfo[0];
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
            'symbol': this.safeSymbol (this.safeValue (data, 'symbol', ''), market),
        };
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        // [
        //     {
        //        "symbol":"BTCPFC",
        //        "makerFee":"-1.0E-4",
        //        "takerFee":"5.0E-4"
        //     },
        //     ...
        //  ]
        const spotFees = await this.spotPrivateGetUserFees (params);
        const futureFees = await this.futurePrivateGetUserFees (params);
        const fees = this.arrayConcat (spotFees, futureFees);
        const result = {};
        for (let i = 0; i < fees.length; i++) {
            const response = this.safeValue (fees, i, {});
            let symbol = this.safeValue (response, 'symbol', '');
            const market = this.market (symbol);
            symbol = this.safeSymbol (market['id'], market);
            result[symbol] = {
                'info': fees[i],
                'maker': this.safeNumber (response, 'makerFee'),
                'taker': this.safeNumber (response, 'takerFee'),
                'symbol': symbol,
            };
        }
        return result;
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
            request['orderID'] = id;
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
        if (market['spot'] === true) {
            throw new BadRequest (symbol + ' spot market is not support leverage setting.');
        }
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
        const query = this.handleMarketTypeAndParams ('createOrder', market, params)[1];
        const marketType = market['type'];
        const method = this.getSupportedMapping (marketType, {
            'spot': 'spotPrivatePostOrder',
            'future': 'futurePrivatePostOrder',
            'swap': 'futurePrivatePostOrder',
        });
        const response = await this[method] (this.extend (request, query));
        // [
        //     {
        //          averageFillPrice:'0.0'
        //          clOrderID:'test_order_id....'
        //          deviation:'1.0'
        //          fillSize:'0.0'
        //          message:''
        //          orderID:'d2e08dc3-f057-4f3f-b57e-b716476e3553'
        //          orderType:'76'
        //          originalSize:'1.0'
        //          postOnly:false
        //          price:'7010.0'
        //          remainingSize:'1.0'
        //          side:'BUY'
        //          size:'1.0'
        //          status:'2'
        //          stealth:'1.0'
        //          stopPrice:null
        //          symbol:'BTC-USD'
        //          time_in_force:'GTC'
        //          timestamp:'1653180908693'
        //          trigger:false
        //          triggerPrice:'0.0'
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

    _inStrArray (arr, str) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === str) {
                return true;
            }
        }
        return false;
    }

    async _fetchWalletHistory (filters, code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (code !== undefined) {
            const currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.spotPrivateGetUserWalletHistory (this.extend (request, params));
        const transactions = [];
        for (let i = 0; i < response.length; i++) {
            const transaction = response[i];
            transaction['info'] = {};
            const type = this.safeString (transaction, 'type');
            if (filters.length && this._inStrArray (filters, type)) {
                transactions.push (transaction);
            }
        }
        return transactions;
    }

    async _fetchTransactions (filters, code = undefined, since = undefined, limit = undefined, params = {}) {
        const transactions = await this._fetchWalletHistory (filters, code, since, limit, params);
        return this.parseTransactions (transactions);
    }

    async fetchTransfers (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (code !== undefined) {
            const currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const filters = [ '105' ];
        const response = await this.futurePrivateGetUserWalletHistory (this.extend (request, params));
        const transfers = [];
        for (let i = 0; i < response.length; i++) {
            const transfer = response[i];
            const type = this.safeString (transfer, 'type');
            if (this._inStrArray (filters, type)) {
                transfers.push (transfer);
            }
        }
        return this.parseTransfers (transfers);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this._fetchTransactions ([ 'Withdraw' ], code, since, limit, params);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this._fetchTransactions ([ 'Deposit' ], code, since, limit, params);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this._fetchTransactions ([ 'Withdraw', 'Deposit' ], code, since, limit, params);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        // internal transfers only
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'asset': currency['id'],
            'amount': amount,
            'toUser': toAccount, // internal account id
        };
        const toUserMail = this.safeString (params, 'toUserMail');
        if (!toUserMail) {
            throw new ArgumentsRequired (this.id + ' transfer requires a `toUserMail` argument');
        }
        request['toUserMail'] = toUserMail;
        const resp = await this.spotPrivatePostUserWalletTransfer (this.extend (request, params));
        if (!resp || resp['amount'] === undefined) {
            throw new BadRequest (' transfer ' + amount + ' ' + currency['id'] + ' to ' + toAccount + 'failed');
        }
        const result = {
            'info': resp,
            'id': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'currency': currency['id'],
            'amount': amount,
            'fromAccount': undefined,
            'toAccount': toAccount,
            'status': 'ok',
        };
        return result;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const networks = await this.spotPublicGetAvailableCurrencyNetworks ({ 'currency': currency['id'] });
        if (!networks || networks.length <= 0) {
            throw new BadRequest ('fetch  ' + currency['id'] + ' currency network error.');
        }
        let network = networks[0].toLowerCase ();
        network = network.replace (network[0], network[0].toUpperCase ());
        const request = {
            'currency': currency['id'] + '-' + network,
            'amount': amount.toString (),
            'address': address,
            'tag': '',
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        if (params['network']) {
            request['currency'] = currency['id'] + '-' + params['network'];
        }
        // const request = {
        //     'currency': 'ETH-Ethereum',
        //     'address': '0x7293D3B0f486BBB8160fE04f6Fdde0eaf147d6B6',
        //     'tag': '',
        //     'amount': '0.001',
        // };
        const response = await this.spotPrivatePostUserWalletWithdraw (this.extend (request, params));
        if (!response || response['withdrawId'] === undefined) {
            throw new BadRequest ('withdraw ' + amount + ' ' + currency['id'] + 'to ' + address + ' failed.');
        }
        //
        //  {
        //       "withdrawId": "<withdrawal ID>"
        //  }
        //
        const id = this.safeString (response, 'withdrawId');
        return {
            'info': response,
            'id': id,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const accessibility = api[1];
        const type = api[0];
        let url = this.urls['api'][type] + '/' + path;
        if (!(method === 'POST' || method === 'PUT')) {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        if (accessibility === 'private') {
            this.checkRequiredCredentials ();
            headers = {};
            if (method === 'POST' || method === 'PUT') {
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
