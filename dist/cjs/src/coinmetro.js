'use strict';

var coinmetro$1 = require('./abstract/coinmetro.js');
var errors = require('./base/errors.js');
var number = require('./base/functions/number.js');
var Precise = require('./base/Precise.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class coinmetro
 * @augments Exchange
 */
class coinmetro extends coinmetro$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'coinmetro',
            'name': 'Coinmetro',
            'countries': ['EE'],
            'version': 'v1',
            'rateLimit': 200,
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': true,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': true,
                'createDepositAddress': false,
                'createOrder': true,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'deposit': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledAndClosedOrders': true,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': true,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'withdraw': false,
                'ws': false,
            },
            'timeframes': {
                '1m': '60000',
                '5m': '300000',
                '30m': '1800000',
                '4h': '14400000',
                '1d': '86400000',
            },
            'urls': {
                'logo': 'https://github.com/ccxt/ccxt/assets/43336371/e86f87ec-6ba3-4410-962b-f7988c5db539',
                'api': {
                    'public': 'https://api.coinmetro.com',
                    'private': 'https://api.coinmetro.com',
                },
                'test': {
                    'public': 'https://api.coinmetro.com/open',
                    'private': 'https://api.coinmetro.com/open',
                },
                'www': 'https://coinmetro.com/',
                'doc': [
                    'https://documenter.getpostman.com/view/3653795/SVfWN6KS',
                ],
                'fees': 'https://help.coinmetro.com/hc/en-gb/articles/6844007317789-What-are-the-fees-on-Coinmetro-',
                'referral': 'https://go.coinmetro.com/?ref=crypto24',
            },
            'api': {
                'public': {
                    'get': {
                        'demo/temp': 1,
                        'exchange/candles/{pair}/{timeframe}/{from}/{to}': 3,
                        'exchange/prices': 1,
                        'exchange/ticks/{pair}/{from}': 3,
                        'assets': 1,
                        'markets': 1,
                        'exchange/book/{pair}': 3,
                        'exchange/bookUpdates/{pair}/{from}': 1, // not unified
                    },
                },
                'private': {
                    'get': {
                        'users/balances': 1,
                        'users/wallets': 1,
                        'users/wallets/history/{since}': 1.67,
                        'exchange/orders/status/{orderID}': 1,
                        'exchange/orders/active': 1,
                        'exchange/orders/history/{since}': 1.67,
                        'exchange/fills/{since}': 1.67,
                        'exchange/margin': 1, // not unified
                    },
                    'post': {
                        'jwt': 1,
                        'jwtDevice': 1,
                        'devices': 1,
                        'jwt-read-only': 1,
                        'exchange/orders/create': 1,
                        'exchange/orders/modify/{orderID}': 1,
                        'exchange/swap': 1,
                        'exchange/swap/confirm/{swapId}': 1,
                        'exchange/orders/close/{orderID}': 1,
                        'exchange/orders/hedge': 1, // not unified
                    },
                    'put': {
                        'jwt': 1,
                        'exchange/orders/cancel/{orderID}': 1,
                        'users/margin/collateral': 1,
                        'users/margin/primary/{currency}': 1, // not unified
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'uid': true,
                'token': true,
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber('0.001'),
                    'maker': this.parseNumber('0'),
                },
            },
            'precisionMode': number.TICK_SIZE,
            // exchange-specific options
            'options': {
                'currenciesByIdForParseMarket': undefined,
                'currencyIdsListForParseMarket': ['QRDO'],
            },
            'features': {
                'spot': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': {
                            'triggerPriceType': undefined,
                            'price': false,
                        },
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': false,
                            'GTD': true,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': true,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': 100000,
                        'untilDays': undefined,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': 100000,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                },
                'swap': {
                    'linear': undefined,
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'exceptions': {
                // https://trade-docs.coinmetro.co/?javascript--nodejs#message-codes
                'exact': {
                    'Both buyingCurrency and sellingCurrency are required': errors.InvalidOrder,
                    'One and only one of buyingQty and sellingQty is required': errors.InvalidOrder,
                    'Invalid buyingCurrency': errors.InvalidOrder,
                    'Invalid \'from\'': errors.BadRequest,
                    'Invalid sellingCurrency': errors.InvalidOrder,
                    'Invalid buyingQty': errors.InvalidOrder,
                    'Invalid sellingQty': errors.InvalidOrder,
                    'Insufficient balance': errors.InsufficientFunds,
                    'Expiration date is in the past or too near in the future': errors.InvalidOrder,
                    'Forbidden': errors.PermissionDenied,
                    'Order Not Found': errors.OrderNotFound,
                    'since must be a millisecond timestamp': errors.BadRequest,
                    'This pair is disabled on margin': errors.BadSymbol, // 422 Unprocessable Entity {"message":"This pair is disabled on margin"}
                },
                'broad': {
                    'accessing from a new IP': errors.PermissionDenied,
                    'available to allocate as collateral': errors.InsufficientFunds,
                    'At least': errors.BadRequest,
                    'collateral is not allowed': errors.BadRequest,
                    'Insufficient liquidity': errors.InvalidOrder,
                    'Insufficient order size': errors.InvalidOrder,
                    'Invalid quantity': errors.InvalidOrder,
                    'Invalid Stop Loss': errors.InvalidOrder,
                    'Invalid stop price!': errors.InvalidOrder,
                    'Not enough balance': errors.InsufficientFunds,
                    'Not enough margin': errors.InsufficientFunds,
                    'orderType missing': errors.BadRequest,
                    'Server Timeout': errors.ExchangeError,
                    'Time in force has to be IOC or FOK for market orders': errors.InvalidOrder,
                    'Too many attempts': errors.RateLimitExceeded, // 429 Too Many Requests {"message":"Too many attempts. Try again in 3 seconds"}
                },
            },
        });
    }
    /**
     * @method
     * @name coinmetro#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#d5876d43-a3fe-4479-8c58-24d0f044edfb
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const response = await this.publicGetAssets(params);
        //
        //     [
        //         {
        //             "symbol": "BTC",
        //             "name": "Bitcoin",
        //             "color": "#FFA500",
        //             "type": "coin",
        //             "canDeposit": true,
        //             "canWithdraw": true,
        //             "canTrade": true,
        //             "notabeneDecimals": 8,
        //             "canMarket": true,
        //             "maxSwap": 10000,
        //             "digits": 6,
        //             "multiplier": 1000000,
        //             "bookDigits": 8,
        //             "bookMultiplier": 100000000,
        //             "sentimentData": {
        //                 "sentiment": 51.59555555555555,
        //                 "interest": 1.127511216044664
        //             },
        //             "minQty": 0.0001
        //         },
        //         {
        //             "symbol": "EUR",
        //             "name": "Euro",
        //             "color": "#1246FF",
        //             "type": "fiat",
        //             "canDeposit": true,
        //             "canWithdraw": true,
        //             "canTrade": true,
        //             "canMarket": true,
        //             "maxSwap": 10000,
        //             "digits": 2,
        //             "multiplier": 100,
        //             "bookDigits": 3,
        //             "bookMultiplier": 1000,
        //             "minQty": 5
        //         }
        //         ...
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString(currency, 'symbol');
            const code = this.safeCurrencyCode(id);
            const withdraw = this.safeValue(currency, 'canWithdraw');
            const deposit = this.safeValue(currency, 'canDeposit');
            const canTrade = this.safeValue(currency, 'canTrade');
            const active = canTrade ? withdraw : true;
            const minAmount = this.safeNumber(currency, 'minQty');
            result[code] = this.safeCurrencyStructure({
                'id': id,
                'code': code,
                'name': code,
                'info': currency,
                'active': active,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': undefined,
                'precision': this.parseNumber(this.parsePrecision(this.safeString(currency, 'digits'))),
                'limits': {
                    'amount': { 'min': minAmount, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
                'networks': {},
            });
        }
        if (this.safeValue(this.options, 'currenciesByIdForParseMarket') === undefined) {
            const currenciesById = this.indexBy(result, 'id');
            this.options['currenciesByIdForParseMarket'] = currenciesById;
            const currentCurrencyIdsList = this.safeList(this.options, 'currencyIdsListForParseMarket', []);
            const currencyIdsList = Object.keys(currenciesById);
            for (let i = 0; i < currencyIdsList.length; i++) {
                currentCurrencyIdsList.push(currencyIdsList[i]);
            }
            this.options['currencyIdsListForParseMarket'] = currentCurrencyIdsList;
        }
        return result;
    }
    /**
     * @method
     * @name coinmetro#fetchMarkets
     * @description retrieves data on all markets for coinmetro
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#9fd18008-338e-4863-b07d-722878a46832
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const response = await this.publicGetMarkets(params);
        if (this.safeValue(this.options, 'currenciesByIdForParseMarket') === undefined) {
            await this.fetchCurrencies();
        }
        //
        //     [
        //         {
        //             "pair": "YFIEUR",
        //             "precision": 5,
        //             "margin": false
        //         },
        //         {
        //             "pair": "BTCEUR",
        //             "precision": 2,
        //             "margin": true
        //         },
        //         ...
        //     ]
        //
        return this.parseMarkets(response);
    }
    parseMarket(market) {
        const id = this.safeString(market, 'pair');
        const parsedMarketId = this.parseMarketId(id);
        const baseId = this.safeString(parsedMarketId, 'baseId');
        const quoteId = this.safeString(parsedMarketId, 'quoteId');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const basePrecisionAndLimits = this.parseMarketPrecisionAndLimits(baseId);
        const quotePrecisionAndLimits = this.parseMarketPrecisionAndLimits(quoteId);
        const margin = this.safeBool(market, 'margin', false);
        const tradingFees = this.safeValue(this.fees, 'trading', {});
        return this.safeMarketStructure({
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
            'margin': margin,
            'swap': false,
            'future': false,
            'option': false,
            'active': true,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'taker': this.safeNumber(tradingFees, 'taker'),
            'maker': this.safeNumber(tradingFees, 'maker'),
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': basePrecisionAndLimits['precision'],
                'price': this.parseNumber(this.parsePrecision(this.safeString(market, 'precision'))),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': basePrecisionAndLimits['minLimit'],
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': quotePrecisionAndLimits['minLimit'],
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        });
    }
    parseMarketId(marketId) {
        let baseId = undefined;
        let quoteId = undefined;
        const currencyIds = this.safeValue(this.options, 'currencyIdsListForParseMarket', []);
        // Bubble sort by length (longest first)
        const currencyIdsLength = currencyIds.length;
        for (let i = 0; i < currencyIdsLength; i++) {
            for (let j = 0; j < currencyIdsLength - i - 1; j++) {
                const a = currencyIds[j];
                const b = currencyIds[j + 1];
                if (a.length < b.length) {
                    currencyIds[j] = b;
                    currencyIds[j + 1] = a;
                }
            }
        }
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const entryIndex = marketId.indexOf(currencyId);
            if (entryIndex === 0) {
                const restId = marketId.replace(currencyId, '');
                if (this.inArray(restId, currencyIds)) {
                    if (entryIndex === 0) {
                        baseId = currencyId;
                        quoteId = restId;
                    }
                    else {
                        baseId = restId;
                        quoteId = currencyId;
                    }
                    break;
                }
            }
        }
        const result = {
            'baseId': baseId,
            'quoteId': quoteId,
        };
        return result;
    }
    parseMarketPrecisionAndLimits(currencyId) {
        const currencies = this.safeValue(this.options, 'currenciesByIdForParseMarket', {});
        const currency = this.safeValue(currencies, currencyId, {});
        const limits = this.safeValue(currency, 'limits', {});
        const amountLimits = this.safeValue(limits, 'amount', {});
        const minLimit = this.safeNumber(amountLimits, 'min');
        const result = {
            'precision': this.safeNumber(currency, 'precision'),
            'minLimit': minLimit,
        };
        return result;
    }
    /**
     * @method
     * @name coinmetro#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#13cfb5bc-7bfb-4847-85e1-e0f35dfb3573
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pair': market['id'],
            'timeframe': this.safeString(this.timeframes, timeframe, timeframe),
        };
        let until = undefined;
        if (since !== undefined) {
            request['from'] = since;
            if (limit !== undefined) {
                const duration = this.parseTimeframe(timeframe) * 1000;
                until = this.sum(since, duration * (limit));
            }
        }
        else {
            request['from'] = ':from'; // this endpoint doesn't accept empty from and to params (setting them into the value described in the documentation)
        }
        until = this.safeInteger(params, 'until', until);
        if (until !== undefined) {
            params = this.omit(params, ['until']);
            request['to'] = until;
        }
        else {
            request['to'] = ':to';
        }
        const response = await this.publicGetExchangeCandlesPairTimeframeFromTo(this.extend(request, params));
        //
        //     {
        //         "candleHistory": [
        //             {
        //                 "pair": "ETHUSDT",
        //                 "timeframe": 86400000,
        //                 "timestamp": 1697673600000,
        //                 "c": 1567.4409353098604,
        //                 "h": 1566.7514068472303,
        //                 "l": 1549.4563666936847,
        //                 "o": 1563.4490341395904,
        //                 "v": 0
        //             },
        //             {
        //                 "pair": "ETHUSDT",
        //                 "timeframe": 86400000,
        //                 "timestamp": 1697760000000,
        //                 "c": 1603.7831363339324,
        //                 "h": 1625.0356823666407,
        //                 "l": 1565.4629390011505,
        //                 "o": 1566.8387619426028,
        //                 "v": 0
        //             },
        //             ...
        //         ]
        //     }
        //
        const candleHistory = this.safeList(response, 'candleHistory', []);
        return this.parseOHLCVs(candleHistory, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        return [
            this.safeInteger(ohlcv, 'timestamp'),
            this.safeNumber(ohlcv, 'o'),
            this.safeNumber(ohlcv, 'h'),
            this.safeNumber(ohlcv, 'l'),
            this.safeNumber(ohlcv, 'c'),
            this.safeNumber(ohlcv, 'v'),
        ];
    }
    /**
     * @method
     * @name coinmetro#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#6ee5d698-06da-4570-8c84-914185e05065
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pair': market['id'],
        };
        if (since !== undefined) {
            request['from'] = since;
        }
        else {
            // this endpoint accepts empty from param
            request['from'] = '';
        }
        const response = await this.publicGetExchangeTicksPairFrom(this.extend(request, params));
        //
        //     {
        //         "tickHistory": [
        //             {
        //                 "pair": "ETHUSDT",
        //                 "price": 2077.5623,
        //                 "qty": 0.002888,
        //                 "timestamp": 1700684689420,
        //                 "seqNum": 10644554718
        //             },
        //             {
        //                 "pair": "ETHUSDT",
        //                 "price": 2078.3848,
        //                 "qty": 0.003368,
        //                 "timestamp": 1700684738410,
        //                 "seqNum": 10644559561
        //             },
        //             {
        //                 "pair": "ETHUSDT",
        //                 "price": 2077.1513,
        //                 "qty": 0.00337,
        //                 "timestamp": 1700684816853,
        //                 "seqNum": 10644567113
        //             },
        //             ...
        //         ]
        //     }
        //
        const tickHistory = this.safeList(response, 'tickHistory', []);
        return this.parseTrades(tickHistory, market, since, limit);
    }
    /**
     * @method
     * @name coinmetro#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#4d48ae69-8ee2-44d1-a268-71f84e557b7b
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve (default 500, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {};
        if (since !== undefined) {
            request['since'] = since;
        }
        else {
            // the exchange requires a value for the since param
            request['since'] = 0;
        }
        const response = await this.privateGetExchangeFillsSince(this.extend(request, params));
        //
        //     [
        //         {
        //             "pair": "ETHUSDC",
        //             "seqNumber": 10873722343,
        //             "timestamp": 1702570610747,
        //             "qty": 0.002,
        //             "price": 2282,
        //             "side": "buy",
        //             "orderID": "65671262d93d9525ac009e36170257061073952c6423a8c5b4d6c"
        //         },
        //         ...
        //     ]
        //
        return this.parseTrades(response, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades
        //     {
        //         "pair": "ETHUSDT",
        //         "price": 2077.1513,
        //         "qty": 0.00337,
        //         "timestamp": 1700684816853,
        //         "seqNum": 10644567113
        //     },
        //
        // fetchMyTrades
        //     {
        //         "pair": "ETHUSDC",
        //         "seqNumber": 10873722343,
        //         "timestamp": 1702570610747,
        //         "qty": 0.002,
        //         "price": 2282,
        //         "side": "buy",
        //         "orderID": "65671262d93d9525ac009e36170257061073952c6423a8c5b4d6c"
        //     }
        //
        // fetchOrders
        //     {
        //         "_id": "657b31d360a9542449381bdc",
        //         "seqNumber": 10873722343,
        //         "timestamp": 1702570610747,
        //         "qty": 0.002,
        //         "price": 2282,
        //         "side": "buy"
        //     }
        //
        //    {
        //        "pair":"ETHUSDC",
        //        "seqNumber":"10873722343",
        //        "timestamp":"1702570610747",
        //        "qty":"0.002",
        //        "price":"2282",
        //        "side":"buy",
        //        "orderID":"65671262d93d9525ac009e36170257061073952c6423a8c5b4d6c",
        //        "userID":"65671262d93d9525ac009e36"
        //     }
        //
        const marketId = this.safeString2(trade, 'symbol', 'pair');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const id = this.safeStringN(trade, ['_id', 'seqNum', 'seqNumber']);
        const timestamp = this.safeInteger(trade, 'timestamp');
        const priceString = this.safeString(trade, 'price');
        const amountString = this.safeString(trade, 'qty');
        const order = this.safeString(trade, 'orderID');
        const side = this.safeString(trade, 'side');
        return this.safeTrade({
            'id': id,
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }
    /**
     * @method
     * @name coinmetro#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#26ad80d7-8c46-41b5-9208-386f439a8b87
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (default 100, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetExchangeBookPair(this.extend(request, params));
        //
        //     {
        //         "book": {
        //             "pair": "ETHUSDT",
        //             "seqNumber": 10800409239,
        //             "ask": {
        //                 "2354.2861": 3.75,
        //                 "2354.3138": 19,
        //                 "2354.7538": 80,
        //                 "2355.5430": 260,
        //                 "2356.4611": 950,
        //                 "2361.7150": 1500,
        //                 "206194.0000": 0.01
        //             },
        //             "bid": {
        //                 "2352.6339": 3.75,
        //                 "2352.6002": 19,
        //                 "2352.2402": 80,
        //                 "2351.4582": 260,
        //                 "2349.3111": 950,
        //                 "2343.8601": 1500,
        //                 "1.0000": 5
        //             },
        //             "checksum": 2108177337
        //         }
        //     }
        //
        const book = this.safeValue(response, 'book', {});
        const rawBids = this.safeValue(book, 'bid', {});
        const rawAsks = this.safeValue(book, 'ask', {});
        const rawOrderbook = {
            'bids': rawBids,
            'asks': rawAsks,
        };
        const orderbook = this.parseOrderBook(rawOrderbook, symbol);
        orderbook['nonce'] = this.safeInteger(book, 'seqNumber');
        return orderbook;
    }
    parseBidsAsks(bidasks, priceKey = 0, amountKey = 1, countOrIdKey = 2) {
        const prices = Object.keys(bidasks);
        const result = [];
        for (let i = 0; i < prices.length; i++) {
            const priceString = this.safeString(prices, i);
            const price = this.safeNumber(prices, i);
            const volume = this.safeNumber(bidasks, priceString);
            result.push([price, volume]);
        }
        return result;
    }
    /**
     * @method
     * @name coinmetro#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#6ecd1cd1-f162-45a3-8b3b-de690332a485
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.publicGetExchangePrices(params);
        //
        //     {
        //         "latestPrices": [
        //             {
        //                 "pair": "PERPEUR",
        //                 "timestamp": 1702549840393,
        //                 "price": 0.7899997816001223,
        //                 "qty": 1e-12,
        //                 "ask": 0.8,
        //                 "bid": 0.7799995632002446
        //             },
        //             {
        //                 "pair": "PERPUSD",
        //                 "timestamp": 1702549841973,
        //                 "price": 0.8615317721366659,
        //                 "qty": 1e-12,
        //                 "ask": 0.8742333599999257,
        //                 "bid": 0.8490376365388491
        //             },
        //             ...
        //         ],
        //         "24hInfo": [
        //             {
        //                 "delta": 0.25396444229149906,
        //                 "h": 0.78999978160012,
        //                 "l": 0.630001740844,
        //                 "v": 54.910000002833996,
        //                 "pair": "PERPEUR",
        //                 "sentimentData": {
        //                     "sentiment": 36.71333333333333,
        //                     "interest": 0.47430830039525695
        //                     }
        //                 },
        //             {
        //                 "delta": 0.26915154078134096,
        //                 "h": 0.86220315458898,
        //                 "l": 0.67866757035154,
        //                 "v": 2.835000000000001e-9,
        //                 "pair": "PERPUSD",
        //                 "sentimentData": {
        //                     "sentiment": 36.71333333333333,
        //                     "interest": 0.47430830039525695
        //                 }
        //             },
        //             ...
        //         ]
        //     }
        //
        const latestPrices = this.safeValue(response, 'latestPrices', []);
        const twentyFourHInfos = this.safeValue(response, '24hInfo', []);
        const tickersObject = {};
        // merging info from two lists into one
        for (let i = 0; i < latestPrices.length; i++) {
            const latestPrice = latestPrices[i];
            const marketId = this.safeString(latestPrice, 'pair');
            if (marketId !== undefined) {
                tickersObject[marketId] = latestPrice;
            }
        }
        for (let i = 0; i < twentyFourHInfos.length; i++) {
            const twentyFourHInfo = twentyFourHInfos[i];
            const marketId = this.safeString(twentyFourHInfo, 'pair');
            if (marketId !== undefined) {
                const latestPrice = this.safeValue(tickersObject, marketId, {});
                tickersObject[marketId] = this.extend(twentyFourHInfo, latestPrice);
            }
        }
        const tickers = Object.values(tickersObject);
        return this.parseTickers(tickers, symbols);
    }
    /**
     * @method
     * @name coinmetro#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#6ecd1cd1-f162-45a3-8b3b-de690332a485
     * @param {string[]} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.publicGetExchangePrices(params);
        const latestPrices = this.safeList(response, 'latestPrices', []);
        return this.parseTickers(latestPrices, symbols);
    }
    parseTicker(ticker, market = undefined) {
        //
        //     {
        //         "pair": "PERPUSD",
        //         "timestamp": 1702549841973,
        //         "price": 0.8615317721366659,
        //         "qty": 1e-12,
        //         "ask": 0.8742333599999257,
        //         "bid": 0.8490376365388491
        //         "delta": 0.26915154078134096,
        //         "h": 0.86220315458898,
        //         "l": 0.67866757035154,
        //         "v": 2.835000000000001e-9,
        //         "sentimentData": {
        //             "sentiment": 36.71333333333333,
        //             "interest": 0.47430830039525695
        //         }
        //     }
        //
        const marketId = this.safeString(ticker, 'pair');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(ticker, 'timestamp');
        const bid = this.safeString(ticker, 'bid');
        const ask = this.safeString(ticker, 'ask');
        const high = this.safeString(ticker, 'h');
        const low = this.safeString(ticker, 'l');
        const last = this.safeString(ticker, 'price');
        const baseVolume = this.safeString(ticker, 'v');
        const delta = this.safeString(ticker, 'delta');
        const percentage = Precise["default"].stringMul(delta, '100');
        return this.safeTicker({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'open': undefined,
            'high': high,
            'low': low,
            'close': undefined,
            'last': last,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name coinmetro#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#741a1dcc-7307-40d0-acca-28d003d1506a
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetUsersWallets(params);
        const list = this.safeList(response, 'list', []);
        return this.parseBalance(list);
    }
    parseBalance(balances) {
        //
        //     [
        //         {
        //             "xcmLocks": [],
        //             "xcmLockAmounts": [],
        //             "refList": [],
        //             "balanceHistory": [],
        //             "_id": "5fecd3c998e75c2e4d63f7c3",
        //             "currency": "BTC",
        //             "label": "BTC",
        //             "userId": "5fecd3c97fbfed1521db23bd",
        //             "__v": 0,
        //             "balance": 0.5,
        //             "createdAt": "2020-12-30T19:23:53.646Z",
        //             "disabled": false,
        //             "updatedAt": "2020-12-30T19:23:53.653Z",
        //             "reserved": 0,
        //             "id": "5fecd3c998e75c2e4d63f7c3"
        //         },
        //         ...
        //     ]
        //
        const result = {
            'info': balances,
        };
        for (let i = 0; i < balances.length; i++) {
            const balanceEntry = this.safeDict(balances, i, {});
            const currencyId = this.safeString(balanceEntry, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['total'] = this.safeString(balanceEntry, 'balance');
            account['used'] = this.safeString(balanceEntry, 'reserved');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name coinmetro#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#4e7831f7-a0e7-4c3e-9336-1d0e5dcb15cf
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        if (since !== undefined) {
            request['since'] = since;
        }
        else {
            // this endpoint accepts empty since param
            request['since'] = '';
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const response = await this.privateGetUsersWalletsHistorySince(this.extend(request, params));
        //
        //     {
        //         "list": [
        //             {
        //                 "currency": "USDC",
        //                 "label": "USDC",
        //                 "userId": "65671262d93d9525ac009e36",
        //                 "balance": 0,
        //                 "disabled": false,
        //                 "balanceHistory": [
        //                     {
        //                         "description": "Deposit - 657973a9b6eadf0f33d70100",
        //                         "JSONdata": {
        //                             "fees": 0,
        //                             "notes": "Via Crypto",
        //                             "txHash": "0x2e4875185b0f312d8e24b2d26d46bf9877db798b608ad2ff97b2b8bc7d8134e5",
        //                             "last4Digits": null,
        //                             "IBAN": null,
        //                             "alternativeChain": "polygon",
        //                             "referenceId": "657973a9b6eadf0f33d70100",
        //                             "status": "completed",
        //                             "tracked": true
        //                         },
        //                         "amount": 99,
        //                         "timestamp": "2023-12-13T09:04:51.270Z",
        //                         "amountEUR": 91.79310117335974
        //                     },
        //                     {
        //                         "description": "Order 65671262d93d9525ac009e36170257061073952c6423a8c5b4d6c SeqNum 10873722342",
        //                         "JSONdata": {
        //                             "price": "2282.00 ETH/USDC",
        //                             "fees": 0,
        //                             "notes": "Order 3a8c5b4d6c"
        //                         },
        //                         "amount": -4.564,
        //                         "timestamp": "2023-12-14T16:16:50.760Z",
        //                         "amountEUR": -4.150043849187587
        //                     },
        //                     ...
        //                 ]
        //             },
        //             {
        //                 "currency": "ETH",
        //                 "label": "ETH",
        //                 "userId": "65671262d93d9525ac009e36",
        //                 "balance": 0,
        //                 "disabled": false,
        //                 "balanceHistory": [
        //                     {
        //                         "description": "Order 65671262d93d9525ac009e36170257061073952c6423a8c5b4d6c SeqNum 10873722342",
        //                         "JSONdata": {
        //                             "price": "2282.00 ETH/USDC",
        //                             "fees": 0.000002,
        //                             "notes": "Order 3a8c5b4d6c"
        //                         },
        //                         "amount": 0.001998,
        //                         "timestamp": "2023-12-14T16:16:50.761Z",
        //                         "amountEUR": 4.144849415806856
        //                     },
        //                     ...
        //                 ]
        //             },
        //             {
        //                 "currency": "DOGE",
        //                 "label": "DOGE",
        //                 "userId": "65671262d93d9525ac009e36",
        //                 "balance": 0,
        //                 "disabled": false,
        //                 "balanceHistory": [
        //                     {
        //                         "description": "Order 65671262d93d9525ac009e361702905785319b5d9016dc20736034d13ca6a - Swap",
        //                         "JSONdata": {
        //                             "swap": true,
        //                             "subtype": "swap",
        //                             "fees": 0,
        //                             "price": "0.0905469 DOGE/USDC",
        //                             "notes": "Swap 034d13ca6a"
        //                         },
        //                         "amount": 70,
        //                         "timestamp": "2023-12-18T13:23:05.836Z",
        //                         "amountEUR": 5.643627624549227
        //                     }
        //                 ]
        //             },
        //             ...
        //         ]
        //     }
        //
        const ledgerByCurrencies = this.safeValue(response, 'list', []);
        const ledger = [];
        for (let i = 0; i < ledgerByCurrencies.length; i++) {
            const currencyLedger = ledgerByCurrencies[i];
            const currencyId = this.safeString(currencyLedger, 'currency');
            const balanceHistory = this.safeValue(currencyLedger, 'balanceHistory', []);
            for (let j = 0; j < balanceHistory.length; j++) {
                const rawLedgerEntry = balanceHistory[j];
                rawLedgerEntry['currencyId'] = currencyId;
                ledger.push(rawLedgerEntry);
            }
        }
        return this.parseLedger(ledger, currency, since, limit);
    }
    parseLedgerEntry(item, currency = undefined) {
        const datetime = this.safeString(item, 'timestamp');
        const currencyId = this.safeString(item, 'currencyId');
        item = this.omit(item, 'currencyId');
        currency = this.safeCurrency(currencyId, currency);
        const description = this.safeString(item, 'description', '');
        const [type, referenceId] = this.parseLedgerEntryDescription(description);
        const JSONdata = this.safeValue(item, 'JSONdata', {});
        const feeCost = this.safeString(JSONdata, 'fees');
        const fee = {
            'cost': feeCost,
            'currency': undefined,
        };
        let amount = this.safeString(item, 'amount');
        let direction = undefined;
        if (amount !== undefined) {
            if (Precise["default"].stringLt(amount, '0')) {
                direction = 'out';
                amount = Precise["default"].stringAbs(amount);
            }
            else if (Precise["default"].stringGt(amount, '0')) {
                direction = 'in';
            }
        }
        return this.safeLedgerEntry({
            'info': item,
            'id': undefined,
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'direction': direction,
            'account': undefined,
            'referenceId': referenceId,
            'referenceAccount': undefined,
            'type': type,
            'currency': currency,
            'amount': amount,
            'before': undefined,
            'after': undefined,
            'status': undefined,
            'fee': fee,
        }, currency);
    }
    parseLedgerEntryDescription(description) {
        let descriptionArray = [];
        if (description !== undefined) {
            descriptionArray = description.split(' ');
        }
        let type = undefined;
        let referenceId = undefined;
        const length = descriptionArray.length;
        if (length > 1) {
            type = this.parseLedgerEntryType(descriptionArray[0]);
            if (descriptionArray[1] !== '-') {
                referenceId = descriptionArray[1];
            }
            else {
                referenceId = this.safeString(descriptionArray, 2);
            }
        }
        return [type, referenceId];
    }
    parseLedgerEntryType(type) {
        const types = {
            'Deposit': 'transaction',
            'Withdraw': 'transaction',
            'Order': 'trade',
        };
        return this.safeString(types, type, type);
    }
    /**
     * @method
     * @name coinmetro#createOrder
     * @description create a trade order
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#a4895a1d-3f50-40ae-8231-6962ef06c771
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] the quote quantity that can be used as an alternative for the amount in market orders
     * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", "GTD"
     * @param {number} [params.expirationTime] timestamp in millisecond, for GTD orders only
     * @param {float} [params.triggerPrice] the price at which a trigger order is triggered at
     * @param {float} [params.stopLossPrice] *margin only* The price at which a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] *margin only* The price at which a take profit order is triggered at
     * @param {bool} [params.margin] true for creating a margin order
     * @param {string} [params.fillStyle] fill style of the limit order: "sell" fulfills selling quantity "buy" fulfills buying quantity "base" fulfills base currency quantity "quote" fulfills quote currency quantity
     * @param {string} [params.clientOrderId] client's comment
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let request = {};
        request['orderType'] = type;
        let formattedAmount = undefined;
        if (amount !== undefined) {
            formattedAmount = this.amountToPrecision(symbol, amount);
        }
        let cost = this.safeValue(params, 'cost');
        params = this.omit(params, 'cost');
        if (type === 'limit') {
            if ((price === undefined) && (cost === undefined)) {
                throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a price or params.cost argument for a ' + type + ' order');
            }
            else if ((price !== undefined) && (amount !== undefined)) {
                const costString = Precise["default"].stringMul(this.numberToString(price), this.numberToString(formattedAmount));
                cost = this.parseToNumeric(costString);
            }
        }
        let precisedCost = undefined;
        if (cost !== undefined) {
            precisedCost = this.costToPrecision(symbol, cost);
        }
        if (side === 'sell') {
            request = this.handleCreateOrderSide(market['baseId'], market['quoteId'], formattedAmount, precisedCost, request);
        }
        else if (side === 'buy') {
            request = this.handleCreateOrderSide(market['quoteId'], market['baseId'], precisedCost, formattedAmount, request);
        }
        const timeInForce = this.safeValue(params, 'timeInForce');
        if (timeInForce !== undefined) {
            params = this.omit(params, 'timeInForce');
            request['timeInForce'] = this.encodeOrderTimeInForce(timeInForce);
        }
        const triggerPrice = this.safeString2(params, 'triggerPrice', 'stopPrice');
        if (triggerPrice !== undefined) {
            params = this.omit(params, ['triggerPrice']);
            request['stopPrice'] = this.priceToPrecision(symbol, triggerPrice);
        }
        const userData = this.safeValue(params, 'userData', {});
        const comment = this.safeString2(params, 'clientOrderId', 'comment');
        if (comment !== undefined) {
            params = this.omit(params, ['clientOrderId']);
            userData['comment'] = comment;
        }
        const stopLossPrice = this.safeString(params, 'stopLossPrice');
        if (stopLossPrice !== undefined) {
            params = this.omit(params, 'stopLossPrice');
            userData['stopLoss'] = this.priceToPrecision(symbol, stopLossPrice);
        }
        const takeProfitPrice = this.safeString(params, 'takeProfitPrice');
        if (takeProfitPrice !== undefined) {
            params = this.omit(params, 'takeProfitPrice');
            userData['takeProfit'] = this.priceToPrecision(symbol, takeProfitPrice);
        }
        if (!this.isEmpty(userData)) {
            request['userData'] = userData;
        }
        const response = await this.privatePostExchangeOrdersCreate(this.extend(request, params));
        //
        //     {
        //         "userID": "65671262d93d9525ac009e36",
        //         "orderID": "65671262d93d9525ac009e36170257448481749b7ee2893bafec2",
        //         "orderType": "market",
        //         "buyingCurrency": "ETH",
        //         "sellingCurrency": "USDC",
        //         "buyingQty": 0.002,
        //         "timeInForce": 4,
        //         "boughtQty": 0.002,
        //         "soldQty": 4.587,
        //         "creationTime": 1702574484829,
        //         "seqNumber": 10874285330,
        //         "firstFillTime": 1702574484831,
        //         "lastFillTime": 1702574484831,
        //         "fills": [
        //             {
        //                 "seqNumber": 10874285329,
        //                 "timestamp": 1702574484831,
        //                 "qty": 0.002,
        //                 "price": 2293.5,
        //                 "side": "buy"
        //             }
        //         ],
        //         "completionTime": 1702574484831,
        //         "takerQty": 0.002
        //     }
        //
        return this.parseOrder(response, market);
    }
    handleCreateOrderSide(sellingCurrency, buyingCurrency, sellingQty, buyingQty, request = {}) {
        request['sellingCurrency'] = sellingCurrency;
        request['buyingCurrency'] = buyingCurrency;
        if (sellingQty !== undefined) {
            request['sellingQty'] = sellingQty;
        }
        if (buyingQty !== undefined) {
            request['buyingQty'] = buyingQty;
        }
        return request;
    }
    encodeOrderTimeInForce(timeInForce) {
        const timeInForceTypes = {
            'GTC': 1,
            'IOC': 2,
            'GTD': 3,
            'FOK': 4,
        };
        return this.safeValue(timeInForceTypes, timeInForce, timeInForce);
    }
    /**
     * @method
     * @name coinmetro#cancelOrder
     * @description cancels an open order
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#eaea86da-16ca-4c56-9f00-5b1cb2ad89f8
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#47f913fb-8cab-49f4-bc78-d980e6ced316
     * @param {string} id order id
     * @param {string} symbol not used by coinmetro cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.margin] true for cancelling a margin order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'orderID': id,
        };
        const marginMode = undefined;
        [params, params] = this.handleMarginModeAndParams('cancelOrder', params);
        const isMargin = this.safeBool(params, 'margin', false);
        params = this.omit(params, 'margin');
        let response = undefined;
        if (isMargin || (marginMode !== undefined)) {
            response = await this.privatePostExchangeOrdersCloseOrderID(this.extend(request, params));
        }
        else {
            response = await this.privatePutExchangeOrdersCancelOrderID(this.extend(request, params));
        }
        //
        //     {
        //         "userID": "65671262d93d9525ac009e36",
        //         "orderID": "65671262d93d9525ac009e3617026635256739c996fe17d7cd5d4",
        //         "orderType": "limit",
        //         "buyingCurrency": "ETH",
        //         "sellingCurrency": "USDC",
        //         "fillStyle": "sell",
        //         "orderPlatform": "trade-v3",
        //         "timeInForce": 1,
        //         "buyingQty": 0.005655,
        //         "sellingQty": 11.31,
        //         "boughtQty": 0,
        //         "soldQty": 0,
        //         "creationTime": 1702663525713,
        //         "seqNumber": 10915220048,
        //         "completionTime": 1702928369053
        //     }
        //
        return this.parseOrder(response);
    }
    /**
     * @method
     * @name coinmetro#closePosition
     * @description closes an open position
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#47f913fb-8cab-49f4-bc78-d980e6ced316
     * @param {string} symbol not used by coinmetro closePosition ()
     * @param {string} [side] not used by coinmetro closePosition ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.orderID] order id
     * @param {number} [params.fraction] fraction of order to close, between 0 and 1 (defaults to 1)
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async closePosition(symbol, side = undefined, params = {}) {
        await this.loadMarkets();
        const orderId = this.safeString(params, 'orderId');
        if (orderId === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' closePosition() requires a orderId parameter');
        }
        const request = {
            'orderID': orderId,
        };
        const response = await this.privatePostExchangeOrdersCloseOrderID(this.extend(request, params));
        //
        //     {
        //         "userID": "65671262d93d9525ac009e36",
        //         "orderID": "65671262d93d9525ac009e3617030152811996e5b352556d3d7d8_CL",
        //         "orderType": "market",
        //         "buyingCurrency": "ETH",
        //         "sellingCurrency": "EUR",
        //         "margin": true,
        //         "buyingQty": 0.03,
        //         "timeInForce": 4,
        //         "boughtQty": 0.03,
        //         "soldQty": 59.375,
        //         "creationTime": 1703015488482,
        //         "seqNumber": 10925321179,
        //         "firstFillTime": 1703015488483,
        //         "lastFillTime": 1703015488483,
        //         "fills": [
        //             {
        //                 "seqNumber": 10925321178,
        //                 "timestamp": 1703015488483,
        //                 "qty": 0.03,
        //                 "price": 1979.1666666666667,
        //                 "side": "buy"
        //             }
        //         ],
        //         "completionTime": 1703015488483,
        //         "takerQty": 0.03
        //     }
        //
        return this.parseOrder(response);
    }
    /**
     * @method
     * @name coinmetro#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#518afd7a-4338-439c-a651-d4fdaa964138
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const response = await this.privateGetExchangeOrdersActive(params);
        const orders = this.parseOrders(response, market, since, limit);
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            order['status'] = 'open';
        }
        return orders;
    }
    /**
     * @method
     * @name coinmetro#fetchCanceledAndClosedOrders
     * @description fetches information on multiple canceled and closed orders made by the user
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#4d48ae69-8ee2-44d1-a268-71f84e557b7b
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledAndClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {};
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.privateGetExchangeOrdersHistorySince(this.extend(request, params));
        return this.parseOrders(response, market, since, limit);
    }
    /**
     * @method
     * @name coinmetro#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#95bbed87-db1c-47a7-a03e-aa247e91d5a6
     * @param {int|string} id order id
     * @param {string} symbol not used by coinmetro fetchOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'orderID': id,
        };
        const response = await this.privateGetExchangeOrdersStatusOrderID(this.extend(request, params));
        //
        //     {
        //         "_id": "657b4e6d60a954244939ac6f",
        //         "userID": "65671262d93d9525ac009e36",
        //         "orderID": "65671262d93d9525ac009e361702576531985b78465468b9cc544",
        //         "orderType": "market",
        //         "buyingCurrency": "ETH",
        //         "sellingCurrency": "USDC",
        //         "buyingQty": 0.004,
        //         "timeInForce": 4,
        //         "boughtQty": 0.004,
        //         "soldQty": 9.236,
        //         "creationTime": 1702576531995,
        //         "seqNumber": 10874644062,
        //         "firstFillTime": 1702576531995,
        //         "lastFillTime": 1702576531995,
        //         "fills": [
        //             {
        //                 "_id": "657b4e6d60a954244939ac70",
        //                 "seqNumber": 10874644061,
        //                 "timestamp": 1702576531995,
        //                 "qty": 0.004,
        //                 "price": 2309,
        //                 "side": "buy"
        //             }
        //         ],
        //         "completionTime": 1702576531995,
        //         "takerQty": 0.004,
        //         "fees": 0.000004,
        //         "isAncillary": false,
        //         "margin": false,
        //         "trade": false,
        //         "canceled": false
        //     }
        //
        return this.parseOrder(response);
    }
    parseOrder(order, market = undefined) {
        //
        // createOrder market
        //     {
        //         "userID": "65671262d93d9525ac009e36",
        //         "orderID": "65671262d93d9525ac009e36170257448481749b7ee2893bafec2",
        //         "orderType": "market",
        //         "buyingCurrency": "ETH",
        //         "sellingCurrency": "USDC",
        //         "buyingQty": 0.002,
        //         "timeInForce": 4,
        //         "boughtQty": 0.002,
        //         "soldQty": 4.587,
        //         "creationTime": 1702574484829,
        //         "seqNumber": 10874285330,
        //         "firstFillTime": 1702574484831,
        //         "lastFillTime": 1702574484831,
        //         "fills": [
        //             {
        //                 "seqNumber": 10874285329,
        //                 "timestamp": 1702574484831,
        //                 "qty": 0.002,
        //                 "price": 2293.5,
        //                 "side": "buy"
        //             }
        //         ],
        //         "completionTime": 1702574484831,
        //         "takerQty": 0.002
        //     }
        //
        // createOrder limit
        //     {
        //         "userID": "65671262d93d9525ac009e36",
        //         "orderID": "65671262d93d9525ac009e3617026635256739c996fe17d7cd5d4",
        //         "orderType": "limit",
        //         "buyingCurrency": "ETH",
        //         "sellingCurrency": "USDC",
        //         "fillStyle": "sell",
        //         "orderPlatform": "trade-v3",
        //         "timeInForce": 1,
        //         "buyingQty": 0.005655,
        //         "sellingQty": 11.31,
        //         "boughtQty": 0,
        //         "soldQty": 0,
        //         "creationTime": 1702663525713,
        //         "seqNumber": 10885528683,
        //         "fees": 0,
        //         "fills": [],
        //         "isAncillary": false,
        //         "margin": false,
        //         "trade": false
        //     }
        //
        // fetchOrders market
        //     {
        //         "userID": "65671262d93d9525ac009e36",
        //         "orderID": "65671262d93d9525ac009e36170257061073952c6423a8c5b4d6c",
        //         "orderType": "market",
        //         "buyingCurrency": "ETH",
        //         "sellingCurrency": "USDC",
        //         "buyingQty": 0.002,
        //         "timeInForce": 4,
        //         "boughtQty": 0.002,
        //         "soldQty": 4.564,
        //         "creationTime": 1702570610746,
        //         "seqNumber": 10873722344,
        //         "firstFillTime": 1702570610747,
        //         "lastFillTime": 1702570610747,
        //         "fills": [
        //             {
        //                 "_id": "657b31d360a9542449381bdc",
        //                 "seqNumber": 10873722343,
        //                 "timestamp": 1702570610747,
        //                 "qty": 0.002,
        //                 "price": 2282,
        //                 "side": "buy"
        //             }
        //         ],
        //         "completionTime": 1702570610747,
        //         "takerQty": 0.002,
        //         "fees": 0.000002,
        //         "isAncillary": false,
        //         "margin": false,
        //         "trade": false,
        //         "canceled": false,
        //         "__v": 0
        //     }
        //
        // fetchOrders margin
        //     {
        //         "userData": {
        //             "takeProfit": 1700,
        //             "stopLoss": 2100
        //         },
        //         "_id": "658201d060a95424499394a2",
        //         "seqNumber": 10925300213,
        //         "orderType": "limit",
        //         "buyingCurrency": "EUR",
        //         "sellingCurrency": "ETH",
        //         "userID": "65671262d93d9525ac009e36",
        //         "closedQty": 0.03,
        //         "sellingQty": 0.03,
        //         "buyingQty": 58.8,
        //         "creationTime": 1703015281205,
        //         "margin": true,
        //         "timeInForce": 1,
        //         "boughtQty": 59.31,
        //         "orderID": "65671262d93d9525ac009e3617030152811996e5b352556d3d7d8",
        //         "lastFillTime": 1703015281206,
        //         "soldQty": 0.03,
        //         "closedTime": 1703015488488,
        //         "closedVal": 59.375,
        //         "trade": true,
        //         "takerQty": 59.31,
        //         "firstFillTime": 1703015281206,
        //         "completionTime": 1703015281206,
        //         "fills": [
        //             {
        //                 "_id": "658201d060a95424499394a3",
        //                 "seqNumber": 10925300212,
        //                 "side": "sell",
        //                 "price": 1977,
        //                 "qty": 0.03,
        //                 "timestamp": 1703015281206
        //             },
        //             {
        //                 "_id": "658201d060a95424499394a4",
        //                 "seqNumber": 10925321178,
        //                 "timestamp": 1703015488483,
        //                 "qty": 0.03,
        //                 "price": 1979.1666666666667,
        //                 "side": "buy"
        //             }
        //         ],
        //         "fees": 0.11875000200000001,
        //         "settledQtys": {
        //             "ETH": -0.000092842104710025
        //         },
        //         "isAncillary": false,
        //         "canceled": false
        //     }
        //
        // fetchOrder
        //     {
        //         "_id": "657b4e6d60a954244939ac6f",
        //         "userID": "65671262d93d9525ac009e36",
        //         "orderID": "65671262d93d9525ac009e361702576531985b78465468b9cc544",
        //         "orderType": "market",
        //         "buyingCurrency": "ETH",
        //         "sellingCurrency": "USDC",
        //         "buyingQty": 0.004,
        //         "timeInForce": 4,
        //         "boughtQty": 0.004,
        //         "soldQty": 9.236,
        //         "creationTime": 1702576531995,
        //         "seqNumber": 10874644062,
        //         "firstFillTime": 1702576531995,
        //         "lastFillTime": 1702576531995,
        //         "fills": [
        //             {
        //                 "_id": "657b4e6d60a954244939ac70",
        //                 "seqNumber": 10874644061,
        //                 "timestamp": 1702576531995,
        //                 "qty": 0.004,
        //                 "price": 2309,
        //                 "side": "buy"
        //             }
        //         ],
        //         "completionTime": 1702576531995,
        //         "takerQty": 0.004,
        //         "fees": 0.000004,
        //         "isAncillary": false,
        //         "margin": false,
        //         "trade": false,
        //         "canceled": false
        //     }
        //
        let timestamp = this.safeInteger(order, 'creationTime');
        const isCanceled = this.safeValue(order, 'canceled');
        let status = undefined;
        if (isCanceled === true) {
            if (timestamp === undefined) {
                timestamp = this.safeInteger(order, 'completionTime'); // market orders with bad price gain IOC - we mark them as 'rejected'?
                status = 'rejected'; // these orders don't have the 'creationTime` param and have 'canceled': true
            }
            else {
                status = 'canceled';
            }
        }
        else {
            status = this.safeString(order, 'status');
            order = this.omit(order, 'status'); // we mark orders from fetchOpenOrders with param 'status': 'open'
        }
        const type = this.safeString(order, 'orderType');
        let buyingQty = this.safeString(order, 'buyingQty');
        let sellingQty = this.safeString(order, 'sellingQty');
        const boughtQty = this.safeString(order, 'boughtQty');
        const soldQty = this.safeString(order, 'soldQty');
        if (type === 'market') {
            if ((buyingQty === undefined) && (boughtQty !== undefined) && (boughtQty !== '0')) {
                buyingQty = boughtQty;
            }
            if ((sellingQty === undefined) && (soldQty !== undefined) && (soldQty !== '0')) {
                sellingQty = soldQty;
            }
        }
        const buyingCurrencyId = this.safeString(order, 'buyingCurrency', '');
        const sellingCurrencyId = this.safeString(order, 'sellingCurrency', '');
        const byuingIdPlusSellingId = buyingCurrencyId + sellingCurrencyId;
        const sellingIdPlusBuyingId = sellingCurrencyId + buyingCurrencyId;
        let side = undefined;
        let marketId = undefined;
        let baseAmount = buyingQty;
        let quoteAmount = buyingQty;
        let filled = undefined;
        let cost = undefined;
        let feeInBaseOrQuote = undefined;
        const marketsById = this.indexBy(this.markets, 'id');
        if (this.safeValue(marketsById, byuingIdPlusSellingId) !== undefined) {
            side = 'buy';
            marketId = byuingIdPlusSellingId;
            quoteAmount = sellingQty;
            filled = boughtQty;
            cost = soldQty;
            feeInBaseOrQuote = 'base';
        }
        else if (this.safeValue(marketsById, sellingIdPlusBuyingId) !== undefined) {
            side = 'sell';
            marketId = sellingIdPlusBuyingId;
            baseAmount = sellingQty;
            filled = soldQty;
            cost = boughtQty;
            feeInBaseOrQuote = 'quote';
        }
        let price = undefined;
        if ((baseAmount !== undefined) && (quoteAmount !== undefined)) {
            price = Precise["default"].stringDiv(quoteAmount, baseAmount);
        }
        market = this.safeMarket(marketId, market);
        let fee = undefined;
        const feeCost = this.safeString(order, 'fees');
        if ((feeCost !== undefined) && (feeInBaseOrQuote !== undefined)) {
            fee = {
                'currency': market[feeInBaseOrQuote],
                'cost': feeCost,
                'rate': undefined,
            };
        }
        const trades = this.safeValue(order, 'fills', []);
        const userData = this.safeValue(order, 'userData', {});
        const clientOrderId = this.safeString(userData, 'comment');
        const takeProfitPrice = this.safeString(userData, 'takeProfit');
        const stopLossPrice = this.safeString(userData, 'stopLoss');
        return this.safeOrder({
            'id': this.safeString(order, 'orderID'),
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': this.safeInteger(order, 'lastFillTime'),
            'status': status,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': this.parseOrderTimeInForce(this.safeInteger(order, 'timeInForce')),
            'side': side,
            'price': price,
            'triggerPrice': this.safeString(order, 'stopPrice'),
            'takeProfitPrice': takeProfitPrice,
            'stopLossPrice': stopLossPrice,
            'average': undefined,
            'amount': baseAmount,
            'cost': cost,
            'filled': filled,
            'remaining': undefined,
            'fee': fee,
            'fees': undefined,
            'trades': trades,
            'info': order,
        }, market);
    }
    parseOrderTimeInForce(timeInForce) {
        const timeInForceTypes = [
            undefined,
            'GTC',
            'IOC',
            'GTD',
            'FOK',
        ];
        return this.safeValue(timeInForceTypes, timeInForce, timeInForce);
    }
    /**
     * @method
     * @name coinmetro#borrowCrossMargin
     * @description create a loan to borrow margin
     * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#5b90b3b9-e5db-4d07-ac9d-d680a06fd110
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async borrowCrossMargin(code, amount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const currencyId = currency['id'];
        const request = {};
        request[currencyId] = this.currencyToPrecision(code, amount);
        const response = await this.privatePutUsersMarginCollateral(this.extend(request, params));
        //
        //     { "message": "OK" }
        //
        const result = this.safeValue(response, 'result', {});
        const transaction = this.parseMarginLoan(result, currency);
        return this.extend(transaction, {
            'amount': amount,
        });
    }
    parseMarginLoan(info, currency = undefined) {
        const currencyId = this.safeString(info, 'coin');
        return {
            'id': undefined,
            'currency': this.safeCurrencyCode(currencyId, currency),
            'amount': undefined,
            'symbol': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.omit(params, this.extractParams(path));
        const endpoint = '/' + this.implodeParams(path, params);
        let url = this.urls['api'][api] + endpoint;
        const query = this.urlencode(request);
        if (headers === undefined) {
            headers = {};
        }
        headers['CCXT'] = 'true';
        if (api === 'private') {
            if ((this.uid === undefined) && (this.apiKey !== undefined)) {
                this.uid = this.apiKey;
            }
            if ((this.token === undefined) && (this.secret !== undefined)) {
                this.token = this.secret;
            }
            if (url === 'https://api.coinmetro.com/jwt') { // handle with headers for login endpoint
                headers['X-Device-Id'] = 'bypass';
                if (this.twofa !== undefined) {
                    headers['X-OTP'] = this.twofa;
                }
            }
            else if (url === 'https://api.coinmetro.com/jwtDevice') { // handle with headers for long lived token login endpoint
                headers['X-Device-Id'] = this.uid;
                if (this.twofa !== undefined) {
                    headers['X-OTP'] = this.twofa;
                }
            }
            else {
                headers['Authorization'] = 'Bearer ' + this.token;
                if (!url.startsWith('https://api.coinmetro.com/open')) { // if not sandbox endpoint
                    this.checkRequiredCredentials();
                    headers['X-Device-Id'] = this.uid;
                }
            }
            if ((method === 'POST') || (method === 'PUT')) {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                body = this.urlencode(request);
            }
        }
        else if (query.length !== 0) {
            url += '?' + query;
        }
        while (url.endsWith('/')) {
            url = url.slice(0, url.length - 1);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        if ((code !== 200) && (code !== 201) && (code !== 202)) {
            const feedback = this.id + ' ' + body;
            const message = this.safeString(response, 'message');
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], message, feedback);
            throw new errors.ExchangeError(feedback);
        }
        return undefined;
    }
}

module.exports = coinmetro;
