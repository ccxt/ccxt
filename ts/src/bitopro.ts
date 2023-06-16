
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bitopro.js';
import { ExchangeError, ArgumentsRequired, AuthenticationError, InvalidOrder, InsufficientFunds, BadRequest } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha384 } from './static_dependencies/noble-hashes/sha512.js';
import { Int, OrderSide, OrderType } from './base/types.js';

//  ---------------------------------------------------------------------------

export default class bitopro extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitopro',
            'name': 'BitoPro',
            'countries': [ 'TW' ], // Taiwan
            'version': 'v3',
            'rateLimit': 100,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'editOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '3h': '3h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/158227251-3a92a220-9222-453c-9277-977c6677fe71.jpg',
                'api': {
                    'rest': 'https://api.bitopro.com/v3',
                },
                'www': 'https://www.bitopro.com',
                'doc': [
                    'https://github.com/bitoex/bitopro-offical-api-docs/blob/master/v3-1/rest-1/rest.md',
                ],
                'fees': 'https://www.bitopro.com/fees',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'order-book/{pair}',
                        'tickers',
                        'tickers/{pair}',
                        'trades/{pair}',
                        'provisioning/currencies',
                        'provisioning/trading-pairs',
                        'provisioning/limitations-and-fees',
                        'trading-history/{pair}',
                    ],
                },
                'private': {
                    'get': [
                        'accounts/balance',
                        'orders/history',
                        'orders/all/{pair}',
                        'orders/trades/{pair}',
                        'orders/{pair}/{orderId}',
                        'wallet/withdraw/{currency}/{serial}',
                        'wallet/withdraw/{currency}/id/{id}',
                        'wallet/depositHistory/{currency}',
                        'wallet/withdrawHistory/{currency}',
                    ],
                    'post': [
                        'orders/{pair}',
                        'orders/batch',
                        'wallet/withdraw/{currency}',
                    ],
                    'put': [
                        'orders',
                    ],
                    'delete': [
                        'orders/{pair}/{id}',
                        'orders/all',
                        'orders/{pair}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.002'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('3000000'), this.parseNumber ('0.00194') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.0015') ],
                            [ this.parseNumber ('30000000'), this.parseNumber ('0.0014') ],
                            [ this.parseNumber ('300000000'), this.parseNumber ('0.0013') ],
                            [ this.parseNumber ('550000000'), this.parseNumber ('0.0012') ],
                            [ this.parseNumber ('1300000000'), this.parseNumber ('0.0011') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('3000000'), this.parseNumber ('0.00097') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('30000000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('300000000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('550000000'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('1300000000'), this.parseNumber ('0.0003') ],
                        ],
                    },
                },
            },
            'options': {
                'networks': {
                    'ERC20': 'ERC20',
                    'ETH': 'ERC20',
                    'TRX': 'TRX',
                    'TRC20': 'TRX',
                    'BEP20': 'BSC',
                    'BSC': 'BSC',
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    'Unsupported currency.': BadRequest, // {"error":"Unsupported currency."}
                    'Unsupported order type': BadRequest, // {"error":"Unsupported order type"}
                    'Invalid body': BadRequest, // {"error":"Invalid body"}
                    'Invalid Signature': AuthenticationError, // {"error":"Invalid Signature"}
                    'Address not in whitelist.': BadRequest,
                },
                'broad': {
                    'Invalid amount': InvalidOrder, // {"error":"Invalid amount 0.0000000001, decimal limit is 8."}
                    'Balance for ': InsufficientFunds, // {"error":"Balance for eth not enough, only has 0, but ordered 0.01."}
                    'Invalid ': BadRequest, // {"error":"Invalid price -1."}
                    'Wrong parameter': BadRequest, // {"error":"Wrong parameter: from"}
                },
            },
            'commonCurrencies': {
            },
        });
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name bitopro#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetProvisioningCurrencies (params);
        const currencies = this.safeValue (response, 'data', []);
        //
        //     {
        //         "data":[
        //             {
        //                 "currency":"eth",
        //                 "withdrawFee":"0.007",
        //                 "minWithdraw":"0.001",
        //                 "maxWithdraw":"1000",
        //                 "maxDailyWithdraw":"2000",
        //                 "withdraw":true,
        //                 "deposit":true,
        //                 "depositConfirmation":"12"
        //             }
        //         ]
        //     }
        //
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const currencyId = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const deposit = this.safeValue (currency, 'deposit');
            const withdraw = this.safeValue (currency, 'withdraw');
            const fee = this.safeNumber (currency, 'withdrawFee');
            const withdrawMin = this.safeNumber (currency, 'minWithdraw');
            const withdrawMax = this.safeNumber (currency, 'maxWithdraw');
            const limits = {
                'withdraw': {
                    'min': withdrawMin,
                    'max': withdrawMax,
                },
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            result[code] = {
                'id': currencyId,
                'code': code,
                'info': currency,
                'type': undefined,
                'name': undefined,
                'active': deposit && withdraw,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': fee,
                'precision': undefined,
                'limits': limits,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bitopro#fetchMarkets
         * @description retrieves data on all markets for bitopro
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetProvisioningTradingPairs ();
        const markets = this.safeValue (response, 'data', []);
        //
        //     {
        //         "data":[
        //             {
        //                 "pair":"shib_twd",
        //                 "base":"shib",
        //                 "quote":"twd",
        //                 "basePrecision":"8",
        //                 "quotePrecision":"6",
        //                 "minLimitBaseAmount":"100000",
        //                 "maxLimitBaseAmount":"5500000000",
        //                 "minMarketBuyQuoteAmount":"1000",
        //                 "orderOpenLimit":"200",
        //                 "maintain":false,
        //                 "orderBookQuotePrecision":"6",
        //                 "orderBookQuoteScaleLevel":"5"
        //             }
        //         ]
        //     }
        //
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const active = !this.safeValue (market, 'maintain');
            const id = this.safeString (market, 'pair');
            const uppercaseId = id.toUpperCase ();
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const limits = {
                'amount': {
                    'min': this.safeNumber (market, 'minLimitBaseAmount'),
                    'max': this.safeNumber (market, 'maxLimitBaseAmount'),
                },
                'price': {
                    'min': undefined,
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
            };
            result.push ({
                'id': id,
                'uppercaseId': uppercaseId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': base,
                'quoteId': quote,
                'settle': undefined,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'derivative': false,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'limits': limits,
                'precision': {
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'quotePrecision'))),
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'basePrecision'))),
                },
                'active': active,
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "pair":"btc_twd",
        //         "lastPrice":"1182449.00000000",
        //         "isBuyer":false,
        //         "priceChange24hr":"-1.99",
        //         "volume24hr":"9.13089740",
        //         "high24hr":"1226097.00000000",
        //         "low24hr":"1181000.00000000"
        //     }
        //
        const marketId = this.safeString (ticker, 'pair');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeString (market, 'symbol');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high24hr'),
            'low': this.safeString (ticker, 'low24hr'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'lastPrice'),
            'last': this.safeString (ticker, 'lastPrice'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'priceChange24hr'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume24hr'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name bitopro#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTickersPair (this.extend (request, params));
        const ticker = this.safeValue (response, 'data', {});
        //
        //     {
        //         "data":{
        //             "pair":"btc_twd",
        //             "lastPrice":"1182449.00000000",
        //             "isBuyer":false,
        //             "priceChange24hr":"-1.99",
        //             "volume24hr":"9.13089740",
        //             "high24hr":"1226097.00000000",
        //             "low24hr":"1181000.00000000"
        //         }
        //     }
        //
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name bitopro#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetTickers ();
        const tickers = this.safeValue (response, 'data', []);
        //
        //     {
        //         "data":[
        //             {
        //                 "pair":"xrp_twd",
        //                 "lastPrice":"21.26110000",
        //                 "isBuyer":false,
        //                 "priceChange24hr":"-6.53",
        //                 "volume24hr":"102846.47084802",
        //                 "high24hr":"23.24460000",
        //                 "low24hr":"21.13730000"
        //             }
        //         ]
        //     }
        //
        return this.parseTickers (tickers, symbols);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitopro#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrderBookPair (this.extend (request, params));
        //
        //     {
        //         "bids":[
        //             {
        //                 "price":"1175271",
        //                 "amount":"0.00022804",
        //                 "count":1,
        //                 "total":"0.00022804"
        //             }
        //         ],
        //         "asks":[
        //             {
        //                 "price":"1176906",
        //                 "amount":"0.0496",
        //                 "count":1,
        //                 "total":"0.0496"
        //             }
        //         ]
        //     }
        //
        return this.parseOrderBook (response, market['symbol'], undefined, 'bids', 'asks', 'price', 'amount');
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades
        //         {
        //                 "timestamp":1644651458,
        //                 "price":"1180785.00000000",
        //                 "amount":"0.00020000",
        //                 "isBuyer":false
        //         }
        //
        // fetchMyTrades
        //         {
        //                 "tradeId":"5685030251",
        //                 "orderId":"9669168142",
        //                 "price":"11821.8",
        //                 "action":"SELL",
        //                 "baseAmount":"0.01",
        //                 "quoteAmount":"118.218",
        //                 "fee":"0.236436",
        //                 "feeSymbol":"BNB",
        //                 "isTaker":true,
        //                 "timestamp":1644905714862,
        //                 "createdTimestamp":1644905714862
        //         }
        //
        const id = this.safeString (trade, 'tradeId');
        const orderId = this.safeString (trade, 'orderId');
        let timestamp = undefined;
        if (id === undefined) {
            timestamp = this.safeTimestamp (trade, 'timestamp');
        } else {
            timestamp = this.safeInteger (trade, 'timestamp');
        }
        const marketId = this.safeString (trade, 'pair');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeString (market, 'symbol');
        const price = this.safeString (trade, 'price');
        const type = this.safeStringLower (trade, 'type');
        let side = this.safeStringLower (trade, 'action');
        if (side === undefined) {
            const isBuyer = this.safeValue (trade, 'isBuyer');
            if (isBuyer) {
                side = 'buy';
            } else {
                side = 'sell';
            }
        }
        let amount = this.safeString (trade, 'amount');
        if (amount === undefined) {
            amount = this.safeString (trade, 'baseAmount');
        }
        let fee = undefined;
        const feeAmount = this.safeString (trade, 'fee');
        const feeSymbol = this.safeCurrencyCode (this.safeString (trade, 'feeSymbol'));
        if (feeAmount !== undefined) {
            fee = {
                'cost': feeAmount,
                'currency': feeSymbol,
                'rate': undefined,
            };
        }
        const isTaker = this.safeValue (trade, 'isTaker');
        let takerOrMaker = undefined;
        if (isTaker !== undefined) {
            if (isTaker) {
                takerOrMaker = 'taker';
            } else {
                takerOrMaker = 'maker';
            }
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'takerOrMaker': takerOrMaker,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitopro#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTradesPair (this.extend (request, params));
        const trades = this.safeValue (response, 'data', []);
        //
        //     {
        //         "data":[
        //             {
        //                 "timestamp":1644651458,
        //                 "price":"1180785.00000000",
        //                 "amount":"0.00020000",
        //                 "isBuyer":false
        //             }
        //         ]
        //     }
        //
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name bitopro#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.publicGetProvisioningLimitationsAndFees (params);
        const tradingFeeRate = this.safeValue (response, 'tradingFeeRate', {});
        const first = this.safeValue (tradingFeeRate, 0);
        //
        //     {
        //         "tradingFeeRate":[
        //             {
        //                 "rank":0,
        //                 "twdVolumeSymbol":"\u003c",
        //                 "twdVolume":"3000000",
        //                 "bitoAmountSymbol":"\u003c",
        //                 "bitoAmount":"7500",
        //                 "makerFee":"0.001",
        //                 "takerFee":"0.002",
        //                 "makerBitoFee":"0.0008",
        //                 "takerBitoFee":"0.0016"
        //             }
        //         ],
        //         "orderFeesAndLimitations":[
        //             {
        //                 "pair":"BTC/TWD",
        //                 "minimumOrderAmount":"0.0001",
        //                 "minimumOrderAmountBase":"BTC",
        //                 "minimumOrderNumberOfDigits":"0"
        //             }
        //         ],
        //         "restrictionsOfWithdrawalFees":[
        //             {
        //                 "currency":"TWD",
        //                 "fee":"15",
        //                 "minimumTradingAmount":"100",
        //                 "maximumTradingAmount":"1000000",
        //                 "dailyCumulativeMaximumAmount":"2000000",
        //                 "remarks":"",
        //                 "protocol":""
        //             }
        //         ],
        //         "cryptocurrencyDepositFeeAndConfirmation":[
        //             {
        //                 "currency":"TWD",
        //                 "generalDepositFees":"0",
        //                 "blockchainConfirmationRequired":""
        //             }
        //         ],
        //         "ttCheckFeesAndLimitationsLevel1":[
        //             {
        //                 "currency":"TWD",
        //                 "redeemDailyCumulativeMaximumAmount":"",
        //                 "generateMinimumTradingAmount":"",
        //                 "generateMaximumTradingAmount":"",
        //                 "generateDailyCumulativeMaximumAmount":""
        //             }
        //         ],
        //         "ttCheckFeesAndLimitationsLevel2":[
        //             {
        //                 "currency":"TWD",
        //                 "redeemDailyCumulativeMaximumAmount":"20000000",
        //                 "generateMinimumTradingAmount":"30",
        //                 "generateMaximumTradingAmount":"10000000",
        //                 "generateDailyCumulativeMaximumAmount":"10000000"
        //             }
        //         ]
        //     }
        //
        const result = {};
        const maker = this.safeNumber (first, 'makerFee');
        const taker = this.safeNumber (first, 'takerFee');
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': first,
                'symbol': symbol,
                'maker': maker,
                'taker': taker,
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    parseOHLCV (ohlcv, market = undefined) {
        return [
            this.safeInteger (ohlcv, 'timestamp'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitopro#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const resolution = this.safeString (this.timeframes, timeframe, timeframe);
        const request = {
            'pair': market['id'],
            'resolution': resolution,
        };
        // we need to have a limit argument because "to" and "from" are required
        if (limit === undefined) {
            limit = 500;
        }
        const timeframeInSeconds = this.parseTimeframe (timeframe);
        let alignedSince = undefined;
        if (since === undefined) {
            request['to'] = this.seconds ();
            request['from'] = request['to'] - (limit * timeframeInSeconds);
        } else {
            const timeframeInMilliseconds = timeframeInSeconds * 1000;
            alignedSince = Math.floor (since / timeframeInMilliseconds) * timeframeInMilliseconds;
            request['from'] = Math.floor (since / 1000);
            request['to'] = this.sum (request['from'], limit * timeframeInSeconds);
        }
        const response = await this.publicGetTradingHistoryPair (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        //
        //     {
        //         "data":[
        //             {
        //                 "timestamp":1644581100000,
        //                 "open":"1214737",
        //                 "high":"1215110",
        //                 "low":"1214737",
        //                 "close":"1215110",
        //                 "volume":"0.08423959"
        //             }
        //         ]
        //     }
        //
        const sparse = this.parseOHLCVs (data, market, timeframe, since, limit);
        return this.insertMissingCandles (sparse, timeframeInSeconds, alignedSince, limit);
    }

    insertMissingCandles (candles, distance, since, limit) {
        // the exchange doesn't send zero volume candles so we emulate them instead
        // otherwise sending a limit arg leads to unexpected results
        const length = candles.length;
        if (length === 0) {
            return candles;
        }
        const result = [];
        let copyFrom = candles[0];
        let timestamp = undefined;
        if (since === undefined) {
            timestamp = copyFrom[0];
        } else {
            timestamp = since;
        }
        let i = 0;
        const candleLength = candles.length;
        let resultLength = 0;
        while ((resultLength < limit) && (i < candleLength)) {
            const candle = candles[i];
            if (candle[0] === timestamp) {
                result.push (candle);
                i = this.sum (i, 1);
            } else {
                const copy = this.arrayConcat ([], copyFrom);
                copy[0] = timestamp;
                // set open, high, low to close
                copy[1] = copy[4];
                copy[2] = copy[4];
                copy[3] = copy[4];
                copy[5] = this.parseNumber ('0');
                result.push (copy);
            }
            timestamp = this.sum (timestamp, distance * 1000);
            resultLength = result.length;
            copyFrom = result[resultLength - 1];
        }
        return result;
    }

    parseBalance (response) {
        //
        //     [{
        //         "currency":"twd",
        //         "amount":"0",
        //         "available":"0",
        //         "stake":"0",
        //         "tradable":true
        //     }]
        //
        const result = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const amount = this.safeString (balance, 'amount');
            const available = this.safeString (balance, 'available');
            const account = {
                'free': available,
                'total': amount,
            };
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bitopro#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetAccountsBalance (params);
        const balances = this.safeValue (response, 'data', []);
        //
        //     {
        //         "data":[
        //             {
        //                 "currency":"twd",
        //                 "amount":"0",
        //                 "available":"0",
        //                 "stake":"0",
        //                 "tradable":true
        //             }
        //         ]
        //     }
        //
        return this.parseBalance (balances);
    }

    parseOrderStatus (status) {
        const statuses = {
            '-1': 'open',
            '0': 'open',
            '1': 'open',
            '2': 'closed',
            '3': 'closed',
            '4': 'canceled',
            '6': 'canceled',
        };
        return this.safeString (statuses, status, undefined);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //         {
        //             orderId: '2220595581',
        //             timestamp: '1644896744886',
        //             action: 'SELL',
        //             amount: '0.01',
        //             price: '15000',
        //             timeInForce: 'GTC'
        //         }
        //
        // fetchOrder
        //         {
        //             "id":"8777138788",
        //             "pair":"bnb_twd",
        //             "price":"16000",
        //             "avgExecutionPrice":"0",
        //             "action":"SELL",
        //             "type":"LIMIT",
        //             "timestamp":1644899002598,
        //             "status":4,
        //             "originalAmount":"0.01",
        //             "remainingAmount":"0.01",
        //             "executedAmount":"0",
        //             "fee":"0",
        //             "feeSymbol":"twd",
        //             "bitoFee":"0",
        //             "total":"0",
        //             "seq":"BNBTWD548774666",
        //             "timeInForce":"GTC",
        //             "createdTimestamp":1644898944074,
        //             "updatedTimestamp":1644899002598
        //         }
        //
        const id = this.safeString2 (order, 'id', 'orderId');
        const timestamp = this.safeInteger2 (order, 'timestamp', 'createdTimestamp');
        let side = this.safeString (order, 'action');
        side = side.toLowerCase ();
        const amount = this.safeString2 (order, 'amount', 'originalAmount');
        const price = this.safeString (order, 'price');
        const marketId = this.safeString (order, 'pair');
        market = this.safeMarket (marketId, market, '_');
        const symbol = this.safeString (market, 'symbol');
        const orderStatus = this.safeString (order, 'status');
        const status = this.parseOrderStatus (orderStatus);
        const type = this.safeStringLower (order, 'type');
        const average = this.safeString (order, 'avgExecutionPrice');
        const filled = this.safeString (order, 'executedAmount');
        const remaining = this.safeString (order, 'remainingAmount');
        const timeInForce = this.safeString (order, 'timeInForce');
        let postOnly = undefined;
        if (timeInForce === 'POST_ONLY') {
            postOnly = true;
        }
        let fee = undefined;
        const feeAmount = this.safeString (order, 'fee');
        const feeSymbol = this.safeCurrencyCode (this.safeString (order, 'feeSymbol'));
        if (Precise.stringGt (feeAmount, '0')) {
            fee = {
                'currency': feeSymbol,
                'cost': feeAmount,
            };
        }
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': this.safeInteger (order, 'updatedTimestamp'),
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
            'info': order,
        }, market);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitopro#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'type': type,
            'pair': market['id'],
            'action': side,
            'amount': this.amountToPrecision (symbol, amount),
            'timestamp': this.milliseconds (),
        };
        const orderType = type.toUpperCase ();
        if (orderType === 'LIMIT') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (orderType === 'STOP_LIMIT') {
            request['price'] = this.priceToPrecision (symbol, price);
            const stopPrice = this.safeValue2 (params, 'triggerPrice', 'stopPrice');
            params = this.omit (params, [ 'triggerPrice', 'stopPrice' ]);
            if (stopPrice === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a stopPrice parameter for ' + orderType + ' orders');
            } else {
                request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
            }
            const condition = this.safeString (params, 'condition');
            if (condition === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a condition parameter for ' + orderType + ' orders');
            } else {
                request['condition'] = condition;
            }
        }
        const postOnly = this.isPostOnly (orderType === 'MARKET', undefined, params);
        if (postOnly) {
            request['timeInForce'] = 'POST_ONLY';
        }
        const response = await this.privatePostOrdersPair (this.extend (request, params));
        //
        //     {
        //         orderId: '2220595581',
        //         timestamp: '1644896744886',
        //         action: 'SELL',
        //         amount: '0.01',
        //         price: '15000',
        //         timeInForce: 'GTC'
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bitopro#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires the symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': id,
            'pair': market['id'],
        };
        const response = await this.privateDeleteOrdersPairId (this.extend (request, params));
        //
        //     {
        //         "orderId":"8777138788",
        //         "action":"SELL",
        //         "timestamp":1644899002465,
        //         "price":"16000",
        //         "amount":"0.01"
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrders (ids, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bitopro#cancelOrders
         * @description cancel multiple orders
         * @param {[string]} ids order ids
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['uppercaseId'];
        const request = {};
        request[id] = ids;
        const response = await this.privatePutOrders (this.extend (request, params));
        //
        //     {
        //         "data":{
        //             "BNB_TWD":[
        //                 "5236347105",
        //                 "359488711"
        //             ]
        //         }
        //     }
        //
        return response;
    }

    async cancelAllOrders (symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bitopro#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'pair': market['id'], // optional
        };
        // privateDeleteOrdersAll or privateDeleteOrdersPair
        let method = this.safeString (this.options, 'privateDeleteOrdersPair', 'privateDeleteOrdersAll');
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['pair'] = market['id'];
            method = 'privateDeleteOrdersPair';
        }
        const response = await this[method] (this.extend (request, params));
        const result = this.safeValue (response, 'data', {});
        //
        //     {
        //         "data":{
        //             "BNB_TWD":[
        //                 "9515988421",
        //                 "4639130027"
        //             ]
        //         }
        //     }
        //
        return result;
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bitopro#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires the symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderId': id,
            'pair': market['id'],
        };
        const response = await this.privateGetOrdersPairOrderId (this.extend (request, params));
        //
        //     {
        //         "id":"8777138788",
        //         "pair":"bnb_twd",
        //         "price":"16000",
        //         "avgExecutionPrice":"0",
        //         "action":"SELL",
        //         "type":"LIMIT",
        //         "timestamp":1644899002598,
        //         "status":4,
        //         "originalAmount":"0.01",
        //         "remainingAmount":"0.01",
        //         "executedAmount":"0",
        //         "fee":"0",
        //         "feeSymbol":"twd",
        //         "bitoFee":"0",
        //         "total":"0",
        //         "seq":"BNBTWD548774666",
        //         "timeInForce":"GTC",
        //         "createdTimestamp":1644898944074,
        //         "updatedTimestamp":1644899002598
        //     }
        //
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitopro#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires the symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            // 'startTimestamp': 0,
            // 'endTimestamp': 0,
            // 'statusKind': '',
            // 'orderId': '',
        };
        if (since !== undefined) {
            request['startTimestamp'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrdersAllPair (this.extend (request, params));
        let orders = this.safeValue (response, 'data');
        if (orders === undefined) {
            orders = [];
        }
        //
        //     {
        //         "data":[
        //             {
        //                 "id":"2220595581",
        //                 "pair":"bnb_twd",
        //                 "price":"15000",
        //                 "avgExecutionPrice":"0",
        //                 "action":"SELL",
        //                 "type":"LIMIT",
        //                 "createdTimestamp":1644896744886,
        //                 "updatedTimestamp":1644898706236,
        //                 "status":4,
        //                 "originalAmount":"0.01",
        //                 "remainingAmount":"0.01",
        //                 "executedAmount":"0",
        //                 "fee":"0",
        //                 "feeSymbol":"twd",
        //                 "bitoFee":"0",
        //                 "total":"0",
        //                 "seq":"BNBTWD8540871774",
        //                 "timeInForce":"GTC"
        //             }
        //         ]
        //     }
        //
        return this.parseOrders (orders, market, since, limit);
    }

    fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        const request = {
            'statusKind': 'OPEN',
        };
        return this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitopro#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'statusKind': 'DONE',
        };
        return this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitopro#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires the symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.privateGetOrdersTradesPair (this.extend (request, params));
        const trades = this.safeValue (response, 'data', []);
        //
        //     {
        //         "data":[
        //             {
        //                 "tradeId":"5685030251",
        //                 "orderId":"9669168142",
        //                 "price":"11821.8",
        //                 "action":"SELL",
        //                 "baseAmount":"0.01",
        //                 "quoteAmount":"118.218",
        //                 "fee":"0.236436",
        //                 "feeSymbol":"BNB",
        //                 "isTaker":true,
        //                 "timestamp":1644905714862,
        //                 "createdTimestamp":1644905714862
        //             }
        //         ]
        //     }
        //
        return this.parseTrades (trades, market, since, limit);
    }

    parseTransactionStatus (status) {
        const states = {
            'COMPLETE': 'ok',
            'INVALID': 'failed',
            'PROCESSING': 'pending',
            'WAIT_PROCESS': 'pending',
            'FAILED': 'failed',
            'EXPIRED': 'failed',
            'CANCELLED': 'failed',
            'EMAIL_VERIFICATION': 'pending',
            'WAIT_CONFIRMATION': 'pending',
        };
        return this.safeString (states, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //    {
        //        "serial": "20220214X766799",
        //        "timestamp": "1644833015053",
        //        "address": "bnb1xml62k5a9dcewgc542fha75fyxdcp0zv8eqfsh",
        //        "amount": "0.20000000",
        //        "fee": "0.00000000",
        //        "total": "0.20000000",
        //        "status": "COMPLETE",
        //        "txid": "A3CC4F6828CC752B9F3737F48B5826B9EC2857040CB5141D0CC955F7E53DB6D9",
        //        "message": "778553959",
        //        "protocol": "MAIN",
        //        "id": "2905906537"
        //    }
        //
        // fetchWithdrawals || fetchWithdraw
        //
        //    {
        //        "serial": "20220215BW14069838",
        //        "timestamp": "1644907716044",
        //        "address": "TKrwMaZaGiAvtXCFT41xHuusNcs4LPWS7w",
        //        "amount": "8.00000000",
        //        "fee": "2.00000000",
        //        "total": "10.00000000",
        //        "status": "COMPLETE",
        //        "txid": "50bf250c71a582f40cf699fb58bab978437ea9bdf7259ff8072e669aab30c32b",
        //        "protocol": "TRX",
        //        "id": "9925310345"
        //    }
        //
        // withdraw
        //
        //    {
        //        "serial": "20220215BW14069838",
        //        "currency": "USDT",
        //        "protocol": "TRX",
        //        "address": "TKrwMaZaGiAvtXCFT41xHuusNcs4LPWS7w",
        //        "amount": "8",
        //        "fee": "2",
        //        "total": "10"
        //    }
        //
        const currencyId = this.safeString (transaction, 'coin');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeInteger (transaction, 'timestamp');
        const address = this.safeString (transaction, 'address');
        const tag = this.safeString (transaction, 'message');
        const status = this.safeString (transaction, 'status');
        let networkId = this.safeString (transaction, 'protocol');
        if (networkId === 'MAIN') {
            networkId = code;
        }
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'serial'),
            'txid': this.safeString (transaction, 'txid'),
            'type': undefined,
            'currency': code,
            'network': this.networkIdToCode (networkId),
            'amount': this.safeNumber (transaction, 'total'),
            'status': this.parseTransactionStatus (status),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'addressFrom': undefined,
            'addressTo': address,
            'tag': tag,
            'tagFrom': undefined,
            'tagTo': tag,
            'updated': undefined,
            'comment': undefined,
            'fee': {
                'currency': code,
                'cost': this.safeNumber (transaction, 'fee'),
                'rate': undefined,
            },
        };
    }

    async fetchDeposits (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitopro#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits() requires the code argument');
        }
        await this.loadMarkets ();
        const currency = this.safeCurrency (code);
        const request = {
            'currency': currency['id'],
            // 'endTimestamp': 0,
            // 'id': '',
            // 'statuses': '', // 'ROCESSING,COMPLETE,INVALID,WAIT_PROCESS,CANCELLED,FAILED'
        };
        if (since !== undefined) {
            request['startTimestamp'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetWalletDepositHistoryCurrency (this.extend (request, params));
        const result = this.safeValue (response, 'data', []);
        //
        //     {
        //         "data":[
        //             {
        //                 "serial":"20220214X766799",
        //                 "timestamp":"1644833015053",
        //                 "address":"bnb1xml62k5a9dcewgc542fha75fyxdcp0zv8eqfsh",
        //                 "amount":"0.20000000",
        //                 "fee":"0.00000000",
        //                 "total":"0.20000000",
        //                 "status":"COMPLETE",
        //                 "txid":"A3CC4F6828CC752B9F3737F48B5826B9EC2857040CB5141D0CC955F7E53DB6D9",
        //                 "message":"778553959",
        //                 "protocol":"MAIN",
        //                 "id":"2905906537"
        //             }
        //         ]
        //     }
        //
        return this.parseTransactions (result, currency, since, limit, { 'type': 'deposit' });
    }

    async fetchWithdrawals (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitopro#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawals() requires the code argument');
        }
        await this.loadMarkets ();
        const currency = this.safeCurrency (code);
        const request = {
            'currency': currency['id'],
            // 'endTimestamp': 0,
            // 'id': '',
            // 'statuses': '', // 'PROCESSING,COMPLETE,EXPIRED,INVALID,WAIT_PROCESS,WAIT_CONFIRMATION,EMAIL_VERIFICATION,CANCELLED'
        };
        if (since !== undefined) {
            request['startTimestamp'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetWalletWithdrawHistoryCurrency (this.extend (request, params));
        const result = this.safeValue (response, 'data', []);
        //
        //     {
        //         "data":[
        //             {
        //                 "serial":"20220215BW14069838",
        //                 "timestamp":"1644907716044",
        //                 "address":"TKrwMaZaGiAvtXCFT41xHuusNcs4LPWS7w",
        //                 "amount":"8.00000000",
        //                 "fee":"2.00000000",
        //                 "total":"10.00000000",
        //                 "status":"COMPLETE",
        //                 "txid":"50bf250c71a582f40cf699fb58bab978437ea9bdf7259ff8072e669aab30c32b",
        //                 "protocol":"TRX",
        //                 "id":"9925310345"
        //             }
        //         ]
        //     }
        //
        return this.parseTransactions (result, currency, since, limit, { 'type': 'withdrawal' });
    }

    async fetchWithdrawal (id: string, code: string = undefined, params = {}) {
        /**
         * @method
         * @name bitopro#fetchWithdrawal
         * @description fetch data on a currency withdrawal via the withdrawal id
         * @param {string} id withdrawal id
         * @param {string} code unified currency code of the currency withdrawn, default is undefined
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawal() requires the code argument');
        }
        await this.loadMarkets ();
        const currency = this.safeCurrency (code);
        const request = {
            'serial': id,
            'currency': currency['id'],
        };
        const response = await this.privateGetWalletWithdrawCurrencySerial (this.extend (request, params));
        const result = this.safeValue (response, 'data', {});
        //
        //     {
        //         "data":{
        //             "serial":"20220215BW14069838",
        //             "address":"TKrwMaZaGiAvtXCFT41xHuusNcs4LPWS7w",
        //             "amount":"8.00000000",
        //             "fee":"2.00000000",
        //             "total":"10.00000000",
        //             "status":"COMPLETE",
        //             "txid":"50bf250c71a582f40cf699fb58bab978437ea9bdf7259ff8072e669aab30c32b",
        //             "protocol":"TRX",
        //             "id":"9925310345",
        //             "timestamp":"1644907716044"
        //         }
        //     }
        //
        return this.parseTransaction (result, currency);
    }

    async withdraw (code: string, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bitopro#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the bitopro api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        this.checkAddress (address);
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': this.numberToString (amount),
            'address': address,
        };
        if ('network' in params) {
            const networks = this.safeValue (this.options, 'networks', {});
            const requestedNetwork = this.safeStringUpper (params, 'network');
            params = this.omit (params, [ 'network' ]);
            const networkId = this.safeString (networks, requestedNetwork);
            if (networkId === undefined) {
                throw new ExchangeError (this.id + ' invalid network ' + requestedNetwork);
            }
            request['protocol'] = networkId;
        }
        if (tag !== undefined) {
            request['message'] = tag;
        }
        const response = await this.privatePostWalletWithdrawCurrency (this.extend (request, params));
        const result = this.safeValue (response, 'data', {});
        //
        //     {
        //         "data":{
        //             "serial":"20220215BW14069838",
        //             "currency":"USDT",
        //             "protocol":"TRX",
        //             "address":"TKrwMaZaGiAvtXCFT41xHuusNcs4LPWS7w",
        //             "amount":"8",
        //             "fee":"2",
        //             "total":"10"
        //         }
        //     }
        //
        return this.parseTransaction (result, currency);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (headers === undefined) {
            headers = {};
        }
        headers['X-BITOPRO-API'] = 'ccxt';
        if (api === 'private') {
            this.checkRequiredCredentials ();
            if (method === 'POST' || method === 'PUT') {
                body = this.json (params);
                const payload = this.stringToBase64 (body);
                const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha384);
                headers['X-BITOPRO-APIKEY'] = this.apiKey;
                headers['X-BITOPRO-PAYLOAD'] = payload;
                headers['X-BITOPRO-SIGNATURE'] = signature;
            } else if (method === 'GET' || method === 'DELETE') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
                const nonce = this.milliseconds ();
                const rawData = {
                    'nonce': nonce,
                };
                const data = this.json (rawData);
                const payload = this.stringToBase64 (data);
                const signature = this.hmac (payload, this.encode (this.secret), sha384);
                headers['X-BITOPRO-APIKEY'] = this.apiKey;
                headers['X-BITOPRO-PAYLOAD'] = payload;
                headers['X-BITOPRO-SIGNATURE'] = signature;
            }
        } else if (api === 'public' && method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        url = this.urls['api']['rest'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to the default error handler
        }
        if (code >= 200 && code < 300) {
            return undefined;
        }
        const feedback = this.id + ' ' + body;
        const error = this.safeString (response, 'error');
        this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
        throw new ExchangeError (feedback); // unknown message
    }
}
