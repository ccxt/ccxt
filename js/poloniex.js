'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, RequestTimeout, AuthenticationError, PermissionDenied, DDoSProtection, InsufficientFunds, OrderNotFound, InvalidOrder, AccountSuspended, CancelPending, InvalidNonce, OnMaintenance, BadSymbol } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class poloniex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'poloniex',
            'name': 'Poloniex',
            'countries': [ 'US' ],
            'rateLimit': 1000, // up to 6 calls per second
            'certified': false,
            'pro': true,
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createDepositAddress': true,
                'createMarketOrder': false,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrder': true, // true endpoint for a single open order
                'fetchOpenOrders': true, // true endpoint for open orders
                'fetchOrderBook': true,
                'fetchOrderBooks': true,
                'fetchOrderTrades': true, // true endpoint for trades of a single open or closed order
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactions': true,
                'fetchWithdrawals': true,
                'cancelAllOrders': true,
                'withdraw': true,
            },
            'timeframes': {
                '5m': 300,
                '15m': 900,
                '30m': 1800,
                '2h': 7200,
                '4h': 14400,
                '1d': 86400,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg',
                'api': {
                    'public': 'https://poloniex.com/public',
                    'private': 'https://poloniex.com/tradingApi',
                },
                'www': 'https://www.poloniex.com',
                'doc': 'https://docs.poloniex.com',
                'fees': 'https://poloniex.com/fees',
                'referral': 'https://poloniex.com/signup?c=UBFZJRPJ',
            },
            'api': {
                'public': {
                    'get': [
                        'return24hVolume',
                        'returnChartData',
                        'returnCurrencies',
                        'returnLoanOrders',
                        'returnOrderBook',
                        'returnTicker',
                        'returnTradeHistory',
                    ],
                },
                'private': {
                    'post': [
                        'buy',
                        'cancelLoanOffer',
                        'cancelOrder',
                        'cancelAllOrders',
                        'closeMarginPosition',
                        'createLoanOffer',
                        'generateNewAddress',
                        'getMarginPosition',
                        'marginBuy',
                        'marginSell',
                        'moveOrder',
                        'returnActiveLoans',
                        'returnAvailableAccountBalances',
                        'returnBalances',
                        'returnCompleteBalances',
                        'returnDepositAddresses',
                        'returnDepositsWithdrawals',
                        'returnFeeInfo',
                        'returnLendingHistory',
                        'returnMarginAccountSummary',
                        'returnOpenLoanOffers',
                        'returnOpenOrders',
                        'returnOrderTrades',
                        'returnOrderStatus',
                        'returnTradableBalances',
                        'returnTradeHistory',
                        'sell',
                        'toggleAutoRenew',
                        'transferBalance',
                        'withdraw',
                    ],
                },
            },
            'fees': {
                'trading': {
                    // starting from Jan 8 2020
                    'maker': 0.0009,
                    'taker': 0.0009,
                },
                'funding': {},
            },
            'limits': {
                'amount': {
                    'min': 0.000001,
                    'max': 1000000000,
                },
                'price': {
                    'min': 0.00000001,
                    'max': 1000000000,
                },
                'cost': {
                    'min': 0.00000000,
                    'max': 1000000000,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
            'commonCurrencies': {
                'AIR': 'AirCoin',
                'APH': 'AphroditeCoin',
                'BCC': 'BTCtalkcoin',
                'BDG': 'Badgercoin',
                'BTM': 'Bitmark',
                'CON': 'Coino',
                'GOLD': 'GoldEagles',
                'GPUC': 'GPU',
                'HOT': 'Hotcoin',
                'ITC': 'Information Coin',
                'PLX': 'ParallaxCoin',
                'KEY': 'KEYCoin',
                'STR': 'XLM',
                'SOC': 'SOCC',
                'XAP': 'API Coin',
                // this is not documented in the API docs for Poloniex
                // https://github.com/ccxt/ccxt/issues/7084
                // when the user calls withdraw ('USDT', amount, address, tag, params)
                // with params = { 'currencyToWithdrawAs': 'USDTTRON' }
                // or params = { 'currencyToWithdrawAs': 'USDTETH' }
                // fetchWithdrawals ('USDT') returns the corresponding withdrawals
                // with a USDTTRON or a USDTETH currency id, respectfully
                // therefore we have map them back to the original code USDT
                // otherwise the returned withdrawals are filtered out
                'USDTTRON': 'USDT',
                'USDTETH': 'USDT',
            },
            'options': {
                'limits': {
                    'cost': {
                        'min': {
                            'BTC': 0.0001,
                            'ETH': 0.0001,
                            'XMR': 0.0001,
                            'USDT': 1.0,
                        },
                    },
                },
            },
            'exceptions': {
                'exact': {
                    'You may only place orders that reduce your position.': InvalidOrder,
                    'Invalid order number, or you are not the person who placed the order.': OrderNotFound,
                    'Permission denied': PermissionDenied,
                    'Connection timed out. Please try again.': RequestTimeout,
                    'Internal error. Please try again.': ExchangeNotAvailable,
                    'Currently in maintenance mode.': OnMaintenance,
                    'Order not found, or you are not the person who placed it.': OrderNotFound,
                    'Invalid API key/secret pair.': AuthenticationError,
                    'Please do not make more than 8 API calls per second.': DDoSProtection,
                    'Rate must be greater than zero.': InvalidOrder, // {"error":"Rate must be greater than zero."}
                    'Invalid currency pair.': BadSymbol, // {"error":"Invalid currency pair."}
                },
                'broad': {
                    'Total must be at least': InvalidOrder, // {"error":"Total must be at least 0.0001."}
                    'This account is frozen.': AccountSuspended,
                    'Not enough': InsufficientFunds,
                    'Nonce must be greater': InvalidNonce,
                    'You have already called cancelOrder or moveOrder on this order.': CancelPending,
                    'Amount must be at least': InvalidOrder, // {"error":"Amount must be at least 0.000001."}
                    'is either completed or does not exist': InvalidOrder, // {"error":"Order 587957810791 is either completed or does not exist."}
                    'Error pulling ': ExchangeError, // {"error":"Error pulling order book"}
                },
            },
            'orders': {}, // orders cache / emulation
        });
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        const market = this.markets[symbol];
        let key = 'quote';
        const rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, cost)),
        };
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "date":1590913773,
        //         "high":0.02491611,
        //         "low":0.02491611,
        //         "open":0.02491611,
        //         "close":0.02491611,
        //         "volume":0,
        //         "quoteVolume":0,
        //         "weightedAverage":0.02491611
        //     }
        //
        return [
            this.safeTimestamp (ohlcv, 'date'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'quoteVolume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPair': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (since === undefined) {
            request['end'] = this.seconds ();
            if (limit === undefined) {
                request['start'] = request['end'] - this.parseTimeframe ('1w'); // max range = 1 week
            } else {
                request['start'] = request['end'] - limit * this.parseTimeframe (timeframe);
            }
        } else {
            request['start'] = parseInt (since / 1000);
            if (limit !== undefined) {
                const end = this.sum (request['start'], limit * this.parseTimeframe (timeframe));
                request['end'] = end;
            }
        }
        const response = await this.publicGetReturnChartData (this.extend (request, params));
        //
        //     [
        //         {"date":1590913773,"high":0.02491611,"low":0.02491611,"open":0.02491611,"close":0.02491611,"volume":0,"quoteVolume":0,"weightedAverage":0.02491611},
        //         {"date":1590913800,"high":0.02495324,"low":0.02489501,"open":0.02491797,"close":0.02493693,"volume":0.0927415,"quoteVolume":3.7227869,"weightedAverage":0.02491185},
        //         {"date":1590914100,"high":0.02498596,"low":0.02488503,"open":0.02493033,"close":0.02497896,"volume":0.21196348,"quoteVolume":8.50291888,"weightedAverage":0.02492832},
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async loadMarkets (reload = false, params = {}) {
        const markets = await super.loadMarkets (reload, params);
        const currenciesByNumericId = this.safeValue (this.options, 'currenciesByNumericId');
        if ((currenciesByNumericId === undefined) || reload) {
            this.options['currenciesByNumericId'] = this.indexBy (this.currencies, 'numericId');
        }
        return markets;
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetReturnTicker (params);
        const keys = Object.keys (markets);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = markets[id];
            const [ quoteId, baseId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const limits = this.extend (this.limits, {
                'cost': {
                    'min': this.safeValue (this.options['limits']['cost']['min'], quote),
                },
            });
            const isFrozen = this.safeString (market, 'isFrozen');
            const active = (isFrozen !== '1');
            const numericId = this.safeInteger (market, 'id');
            result.push ({
                'id': id,
                'numericId': numericId,
                'symbol': symbol,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'active': active,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {
            'account': 'all',
        };
        const response = await this.privatePostReturnCompleteBalances (this.extend (request, params));
        const result = { 'info': response };
        const currencyIds = Object.keys (response);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const balance = this.safeValue (response, currencyId, {});
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['used'] = this.safeFloat (balance, 'onOrders');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const fees = await this.privatePostReturnFeeInfo (params);
        //
        //     {
        //         makerFee: '0.00100000',
        //         takerFee: '0.00200000',
        //         marginMakerFee: '0.00100000',
        //         marginTakerFee: '0.00200000',
        //         thirtyDayVolume: '106.08463302',
        //         nextTier: 500000,
        //     }
        //
        return {
            'info': fees,
            'maker': this.safeFloat (fees, 'makerFee'),
            'taker': this.safeFloat (fees, 'takerFee'),
            'withdraw': {},
            'deposit': {},
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currencyPair': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['depth'] = limit; // 100
        }
        const response = await this.publicGetReturnOrderBook (this.extend (request, params));
        const orderbook = this.parseOrderBook (response);
        orderbook['nonce'] = this.safeInteger (response, 'seq');
        return orderbook;
    }

    async fetchOrderBooks (symbols = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currencyPair': 'all',
        };
        if (limit !== undefined) {
            request['depth'] = limit; // 100
        }
        const response = await this.publicGetReturnOrderBook (this.extend (request, params));
        const marketIds = Object.keys (response);
        const result = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            let symbol = undefined;
            if (marketId in this.markets_by_id) {
                symbol = this.markets_by_id[marketId]['symbol'];
            } else {
                const [ quoteId, baseId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
            const orderbook = this.parseOrderBook (response[marketId]);
            orderbook['nonce'] = this.safeInteger (response[marketId], 'seq');
            result[symbol] = orderbook;
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        let open = undefined;
        let change = undefined;
        let average = undefined;
        const last = this.safeFloat (ticker, 'last');
        const relativeChange = this.safeFloat (ticker, 'percentChange');
        if (relativeChange !== -1) {
            open = last / this.sum (1, relativeChange);
            change = last - open;
            average = this.sum (last, open) / 2;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24hr'),
            'low': this.safeFloat (ticker, 'low24hr'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': relativeChange * 100,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'quoteVolume'),
            'quoteVolume': this.safeFloat (ticker, 'baseVolume'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetReturnTicker (params);
        const ids = Object.keys (response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let symbol = undefined;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                const [ quoteId, baseId ] = id.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
                market = { 'symbol': symbol };
            }
            const ticker = response[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetReturnCurrencies (params);
        const ids = Object.keys (response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = response[id];
            const precision = 8; // default precision, todo: fix "magic constants"
            const code = this.safeCurrencyCode (id);
            const active = (currency['delisted'] === 0) && !currency['disabled'];
            const numericId = this.safeInteger (currency, 'id');
            const fee = this.safeFloat (currency, 'txFee');
            result[code] = {
                'id': id,
                'numericId': numericId,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': active,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': fee,
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetReturnTicker (params);
        const ticker = response[market['id']];
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchMyTrades
        //
        //     {
        //       globalTradeID: 471030550,
        //       tradeID: '42582',
        //       date: '2020-06-16 09:47:50',
        //       rate: '0.000079980000',
        //       amount: '75215.00000000',
        //       total: '6.01569570',
        //       fee: '0.00095000',
        //       feeDisplay: '0.26636100 TRX (0.07125%)',
        //       orderNumber: '5963454848',
        //       type: 'sell',
        //       category: 'exchange'
        //     }
        //
        // createOrder (taker trades)
        //
        //     {
        //         'amount': '200.00000000',
        //         'date': '2019-12-15 16:04:10',
        //         'rate': '0.00000355',
        //         'total': '0.00071000',
        //         'tradeID': '119871',
        //         'type': 'buy',
        //         'takerAdjustment': '200.00000000'
        //     }
        //
        const id = this.safeString2 (trade, 'globalTradeID', 'tradeID');
        const orderId = this.safeString (trade, 'orderNumber');
        const timestamp = this.parse8601 (this.safeString (trade, 'date'));
        let symbol = undefined;
        if ((!market) && ('currencyPair' in trade)) {
            const marketId = this.safeString (trade, 'currencyPair');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const [ quoteId, baseId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const side = this.safeString (trade, 'type');
        let fee = undefined;
        const price = this.safeFloat (trade, 'rate');
        const cost = this.safeFloat (trade, 'total');
        const amount = this.safeFloat (trade, 'amount');
        const feeDisplay = this.safeString (trade, 'feeDisplay');
        if (feeDisplay !== undefined) {
            const parts = feeDisplay.split (' ');
            const feeCost = this.safeFloat (parts, 0);
            if (feeCost !== undefined) {
                const feeCurrencyId = this.safeString (parts, 1);
                const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
                let feeRate = this.safeString (parts, 2);
                if (feeRate !== undefined) {
                    feeRate = feeRate.replace ('(', '');
                    const feeRateParts = feeRate.split ('%');
                    feeRate = this.safeString (feeRateParts, 0);
                    feeRate = parseFloat (feeRate) / 100;
                }
                fee = {
                    'cost': feeCost,
                    'currency': feeCurrencyCode,
                    'rate': feeRate,
                };
            }
        }
        let takerOrMaker = undefined;
        const takerAdjustment = this.safeFloat (trade, 'takerAdjustment');
        if (takerAdjustment !== undefined) {
            takerOrMaker = 'taker';
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': 'limit',
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPair': market['id'],
        };
        if (since !== undefined) {
            request['start'] = parseInt (since / 1000);
            request['end'] = this.seconds (); // last 50000 trades by default
        }
        const trades = await this.publicGetReturnTradeHistory (this.extend (request, params));
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const pair = market ? market['id'] : 'all';
        const request = { 'currencyPair': pair };
        if (since !== undefined) {
            request['start'] = parseInt (since / 1000);
            request['end'] = this.sum (this.seconds (), 1); // adding 1 is a fix for #3411
        }
        // limit is disabled (does not really work as expected)
        if (limit !== undefined) {
            request['limit'] = parseInt (limit);
        }
        const response = await this.privatePostReturnTradeHistory (this.extend (request, params));
        //
        // specific market (symbol defined)
        //
        //     [
        //         {
        //             globalTradeID: 470912587,
        //             tradeID: '42543',
        //             date: '2020-06-15 17:31:22',
        //             rate: '0.000083840000',
        //             amount: '95237.60321429',
        //             total: '7.98472065',
        //             fee: '0.00095000',
        //             feeDisplay: '0.36137761 TRX (0.07125%)',
        //             orderNumber: '5926344995',
        //             type: 'sell',
        //             category: 'exchange'
        //         },
        //         {
        //             globalTradeID: 470974497,
        //             tradeID: '42560',
        //             date: '2020-06-16 00:41:23',
        //             rate: '0.000078220000',
        //             amount: '1000000.00000000',
        //             total: '78.22000000',
        //             fee: '0.00095000',
        //             feeDisplay: '3.48189819 TRX (0.07125%)',
        //             orderNumber: '5945490830',
        //             type: 'sell',
        //             category: 'exchange'
        //         }
        //     ]
        //
        // all markets (symbol undefined)
        //
        //     {
        //        BTC_GNT: [{
        //             globalTradeID: 470839947,
        //             tradeID: '4322347',
        //             date: '2020-06-15 12:25:24',
        //             rate: '0.000005810000',
        //             amount: '1702.04429303',
        //             total: '0.00988887',
        //             fee: '0.00095000',
        //             feeDisplay: '4.18235294 TRX (0.07125%)',
        //             orderNumber: '102290272520',
        //             type: 'buy',
        //             category: 'exchange'
        //     }, {
        //             globalTradeID: 470895902,
        //             tradeID: '4322413',
        //             date: '2020-06-15 16:19:00',
        //             rate: '0.000005980000',
        //             amount: '18.66879219',
        //             total: '0.00011163',
        //             fee: '0.00095000',
        //             feeDisplay: '0.04733727 TRX (0.07125%)',
        //             orderNumber: '102298304480',
        //             type: 'buy',
        //             category: 'exchange'
        //         }],
        //     }
        //
        let result = [];
        if (market !== undefined) {
            result = this.parseTrades (response, market);
        } else {
            if (response) {
                const ids = Object.keys (response);
                for (let i = 0; i < ids.length; i++) {
                    const id = ids[i];
                    let market = undefined;
                    if (id in this.markets_by_id) {
                        market = this.markets_by_id[id];
                        const trades = this.parseTrades (response[id], market);
                        for (let j = 0; j < trades.length; j++) {
                            result.push (trades[j]);
                        }
                    } else {
                        const [ quoteId, baseId ] = id.split ('_');
                        const base = this.safeCurrencyCode (baseId);
                        const quote = this.safeCurrencyCode (quoteId);
                        const symbol = base + '/' + quote;
                        const trades = response[id];
                        for (let j = 0; j < trades.length; j++) {
                            const market = {
                                'symbol': symbol,
                                'base': base,
                                'quote': quote,
                            };
                            result.push (this.parseTrade (trades[j], market));
                        }
                    }
                }
            }
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'Open': 'open',
            'Partially filled': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOpenOrder
        //
        //     {
        //         status: 'Open',
        //         rate: '0.40000000',
        //         amount: '1.00000000',
        //         currencyPair: 'BTC_ETH',
        //         date: '2018-10-17 17:04:50',
        //         total: '0.40000000',
        //         type: 'buy',
        //         startingAmount: '1.00000',
        //     }
        //
        // fetchOpenOrders
        //
        //     {
        //         orderNumber: '514514894224',
        //         type: 'buy',
        //         rate: '0.00001000',
        //         startingAmount: '100.00000000',
        //         amount: '100.00000000',
        //         total: '0.00100000',
        //         date: '2018-10-23 17:38:53',
        //         margin: 0,
        //     }
        //
        // createOrder
        //
        //     {
        //         'orderNumber': '9805453960',
        //         'resultingTrades': [
        //             {
        //                 'amount': '200.00000000',
        //                 'date': '2019-12-15 16:04:10',
        //                 'rate': '0.00000355',
        //                 'total': '0.00071000',
        //                 'tradeID': '119871',
        //                 'type': 'buy',
        //                 'takerAdjustment': '200.00000000',
        //             },
        //         ],
        //         'fee': '0.00000000',
        //         'clientOrderId': '12345',
        //         'currencyPair': 'BTC_MANA',
        //         // ---------------------------------------------------------
        //         // the following fields are injected by createOrder
        //         'timestamp': timestamp,
        //         'status': 'open',
        //         'type': type,
        //         'side': side,
        //         'price': price,
        //         'amount': amount,
        //     }
        //
        let timestamp = this.safeInteger (order, 'timestamp');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (order, 'date'));
        }
        let trades = undefined;
        const resultingTrades = this.safeValue (order, 'resultingTrades');
        if (resultingTrades !== undefined) {
            trades = this.parseTrades (resultingTrades, market);
        }
        let symbol = undefined;
        const marketId = this.safeString (order, 'currencyPair');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const [ quoteId, baseId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const price = this.safeFloat2 (order, 'price', 'rate');
        let remaining = this.safeFloat (order, 'amount');
        let amount = this.safeFloat (order, 'startingAmount');
        let filled = undefined;
        let cost = 0;
        if (amount !== undefined) {
            if (remaining !== undefined) {
                filled = amount - remaining;
                if (price !== undefined) {
                    cost = filled * price;
                }
            }
        } else {
            amount = remaining;
        }
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let average = undefined;
        let lastTradeTimestamp = undefined;
        if (filled === undefined) {
            if (trades !== undefined) {
                filled = 0;
                cost = 0;
                const tradesLength = trades.length;
                if (tradesLength > 0) {
                    lastTradeTimestamp = trades[0]['timestamp'];
                    for (let i = 0; i < tradesLength; i++) {
                        const trade = trades[i];
                        const tradeAmount = trade['amount'];
                        const tradePrice = trade['price'];
                        filled = this.sum (filled, tradeAmount);
                        cost = this.sum (cost, tradePrice * tradeAmount);
                        lastTradeTimestamp = Math.max (lastTradeTimestamp, trade['timestamp']);
                    }
                }
                remaining = Math.max (amount - filled, 0);
                if (filled >= amount) {
                    status = 'closed';
                }
            }
        }
        if ((filled !== undefined) && (cost !== undefined) && (filled > 0)) {
            average = cost / filled;
        }
        let type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side', type);
        if (type === side) {
            type = undefined;
        }
        const id = this.safeString (order, 'orderNumber');
        let fee = undefined;
        const feeCost = this.safeFloat (order, 'fee');
        if (feeCost !== undefined) {
            let feeCurrencyCode = undefined;
            if (market !== undefined) {
                feeCurrencyCode = (side === 'buy') ? market['base'] : market['quote'];
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const clientOrderId = this.safeString (order, 'clientOrderId');
        return {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': fee,
        };
    }

    parseOpenOrders (orders, market, result) {
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const extended = this.extend (order, {
                'status': 'open',
                'type': 'limit',
                'side': order['type'],
                'price': order['rate'],
            });
            result.push (this.parseOrder (extended, market));
        }
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const pair = market ? market['id'] : 'all';
        const request = {
            'currencyPair': pair,
        };
        const response = await this.privatePostReturnOpenOrders (this.extend (request, params));
        const extension = { 'status': 'open' };
        if (market === undefined) {
            const marketIds = Object.keys (response);
            let openOrders = [];
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const orders = response[marketId];
                const m = this.markets_by_id[marketId];
                openOrders = this.arrayConcat (openOrders, this.parseOrders (orders, m, undefined, undefined, extension));
            }
            return this.filterBySinceLimit (openOrders, since, limit);
        } else {
            return this.parseOrders (response, market, since, limit, extension);
        }
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const method = 'privatePost' + this.capitalize (side);
        const market = this.market (symbol);
        amount = this.amountToPrecision (symbol, amount);
        const request = {
            'currencyPair': market['id'],
            'rate': this.priceToPrecision (symbol, price),
            'amount': amount,
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        }
        // remember the timestamp before issuing the request
        const timestamp = this.milliseconds ();
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         'orderNumber': '9805453960',
        //         'resultingTrades': [
        //             {
        //                 'amount': '200.00000000',
        //                 'date': '2019-12-15 16:04:10',
        //                 'rate': '0.00000355',
        //                 'total': '0.00071000',
        //                 'tradeID': '119871',
        //                 'type': 'buy',
        //                 'takerAdjustment': '200.00000000',
        //             },
        //         ],
        //         'fee': '0.00000000',
        //         'currencyPair': 'BTC_MANA',
        //     }
        //
        return this.parseOrder (this.extend ({
            'timestamp': timestamp,
            'status': 'open',
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
        }, response), market);
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        price = parseFloat (price);
        const request = {
            'orderNumber': id,
            'rate': this.priceToPrecision (symbol, price),
        };
        if (amount !== undefined) {
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        const response = await this.privatePostMoveOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const clientOrderId = this.safeValue (params, 'clientOrderId');
        if (clientOrderId === undefined) {
            request['orderNumber'] = id;
        } else {
            request['clientOrderId'] = clientOrderId;
        }
        params = this.omit (params, 'clientOrderId');
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['currencyPair'] = market['id'];
        }
        const response = await this.privatePostCancelAllOrders (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "message": "Orders canceled",
        //         "orderNumbers": [
        //             503749,
        //             888321,
        //             7315825,
        //             7316824
        //         ]
        //     }
        //
        return response;
    }

    async fetchOpenOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        id = id.toString ();
        const request = {
            'orderNumber': id,
        };
        const response = await this.privatePostReturnOrderStatus (this.extend (request, params));
        //
        //     {
        //         success: 1,
        //         result: {
        //             '6071071': {
        //                 status: 'Open',
        //                 rate: '0.40000000',
        //                 amount: '1.00000000',
        //                 currencyPair: 'BTC_ETH',
        //                 date: '2018-10-17 17:04:50',
        //                 total: '0.40000000',
        //                 type: 'buy',
        //                 startingAmount: '1.00000',
        //             },
        //         },
        //     }
        //
        const result = this.safeValue (response['result'], id);
        if (result === undefined) {
            throw new OrderNotFound (this.id + ' order id ' + id + ' not found');
        }
        return this.parseOrder (result);
    }

    async fetchOrderStatus (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const orders = await this.fetchOpenOrders (symbol, undefined, undefined, params);
        const indexed = this.indexBy (orders, 'id');
        return (id in indexed) ? 'open' : 'closed';
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderNumber': id,
        };
        const trades = await this.privatePostReturnOrderTrades (this.extend (request, params));
        return this.parseTrades (trades);
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        // USDT, USDTETH, USDTTRON
        let currencyId = undefined;
        let currency = undefined;
        if (code in this.currencies) {
            currency = this.currency (code);
            currencyId = currency['id'];
        } else {
            currencyId = code;
        }
        const request = {
            'currency': currencyId,
        };
        const response = await this.privatePostGenerateNewAddress (this.extend (request, params));
        let address = undefined;
        let tag = undefined;
        if (response['success'] === 1) {
            address = this.safeString (response, 'response');
        }
        this.checkAddress (address);
        if (currency !== undefined) {
            const depositAddress = this.safeString (currency['info'], 'depositAddress');
            if (depositAddress !== undefined) {
                tag = address;
                address = depositAddress;
            }
        }
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostReturnDepositAddresses (params);
        // USDT, USDTETH, USDTTRON
        let currencyId = undefined;
        let currency = undefined;
        if (code in this.currencies) {
            currency = this.currency (code);
            currencyId = currency['id'];
        } else {
            currencyId = code;
        }
        let address = this.safeString (response, currencyId);
        let tag = undefined;
        this.checkAddress (address);
        if (currency !== undefined) {
            const depositAddress = this.safeString (currency['info'], 'depositAddress');
            if (depositAddress !== undefined) {
                tag = address;
                address = depositAddress;
            }
        }
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        };
        if (tag !== undefined) {
            request['paymentId'] = tag;
        }
        const response = await this.privatePostWithdraw (this.extend (request, params));
        //
        //     {
        //         response: 'Withdrew 1.00000000 USDT.',
        //         email2FA: false,
        //         withdrawalNumber: 13449869
        //     }
        //
        return {
            'info': response,
            'id': this.safeString (response, 'withdrawalNumber'),
        };
    }

    async fetchTransactionsHelper (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const year = 31104000; // 60 * 60 * 24 * 30 * 12 = one year of history, why not
        const now = this.seconds ();
        const start = (since !== undefined) ? parseInt (since / 1000) : now - 10 * year;
        const request = {
            'start': start, // UNIX timestamp, required
            'end': now, // UNIX timestamp, required
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostReturnDepositsWithdrawals (this.extend (request, params));
        //
        //     {
        //         "adjustments":[],
        //         "deposits":[
        //             {
        //                 currency: "BTC",
        //                 address: "1MEtiqJWru53FhhHrfJPPvd2tC3TPDVcmW",
        //                 amount: "0.01063000",
        //                 confirmations:  1,
        //                 txid: "952b0e1888d6d491591facc0d37b5ebec540ac1efb241fdbc22bcc20d1822fb6",
        //                 timestamp:  1507916888,
        //                 status: "COMPLETE"
        //             },
        //             {
        //                 currency: "ETH",
        //                 address: "0x20108ba20b65c04d82909e91df06618107460197",
        //                 amount: "4.00000000",
        //                 confirmations: 38,
        //                 txid: "0x4be260073491fe63935e9e0da42bd71138fdeb803732f41501015a2d46eb479d",
        //                 timestamp: 1525060430,
        //                 status: "COMPLETE"
        //             }
        //         ],
        //         "withdrawals":[
        //             {
        //                 "withdrawalNumber":13449869,
        //                 "currency":"USDTTRON", // not documented in API docs, see commonCurrencies in describe()
        //                 "address":"TXGaqPW23JdRWhsVwS2mRsGsegbdnAd3Rw",
        //                 "amount":"1.00000000",
        //                 "fee":"0.00000000",
        //                 "timestamp":1591573420,
        //                 "status":"COMPLETE: dadf427224b3d44b38a2c13caa4395e4666152556ca0b2f67dbd86a95655150f",
        //                 "ipAddress":"74.116.3.247",
        //                 "canCancel":0,
        //                 "canResendEmail":0,
        //                 "paymentID":null,
        //                 "scope":"crypto"
        //             },
        //             {
        //                 withdrawalNumber: 8224394,
        //                 currency: "EMC2",
        //                 address: "EYEKyCrqTNmVCpdDV8w49XvSKRP9N3EUyF",
        //                 amount: "63.10796020",
        //                 fee: "0.01000000",
        //                 timestamp: 1510819838,
        //                 status: "COMPLETE: d37354f9d02cb24d98c8c4fc17aa42f475530b5727effdf668ee5a43ce667fd6",
        //                 ipAddress: "5.220.220.200"
        //             },
        //             {
        //                 withdrawalNumber: 9290444,
        //                 currency: "ETH",
        //                 address: "0x191015ff2e75261d50433fbd05bd57e942336149",
        //                 amount: "0.15500000",
        //                 fee: "0.00500000",
        //                 timestamp: 1514099289,
        //                 status: "COMPLETE: 0x12d444493b4bca668992021fd9e54b5292b8e71d9927af1f076f554e4bea5b2d",
        //                 ipAddress: "5.228.227.214"
        //             },
        //             {
        //                 withdrawalNumber: 11518260,
        //                 currency: "BTC",
        //                 address: "8JoDXAmE1GY2LRK8jD1gmAmgRPq54kXJ4t",
        //                 amount: "0.20000000",
        //                 fee: "0.00050000",
        //                 timestamp: 1527918155,
        //                 status: "COMPLETE: 1864f4ebb277d90b0b1ff53259b36b97fa1990edc7ad2be47c5e0ab41916b5ff",
        //                 ipAddress: "211.8.195.26"
        //             }
        //         ]
        //     }
        //
        return response;
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.fetchTransactionsHelper (code, since, limit, params);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const withdrawals = this.safeValue (response, 'withdrawals', []);
        const deposits = this.safeValue (response, 'deposits', []);
        const withdrawalTransactions = this.parseTransactions (withdrawals, currency, since, limit);
        const depositTransactions = this.parseTransactions (deposits, currency, since, limit);
        const transactions = this.arrayConcat (depositTransactions, withdrawalTransactions);
        return this.filterByCurrencySinceLimit (this.sortBy (transactions, 'timestamp'), code, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.fetchTransactionsHelper (code, since, limit, params);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const withdrawals = this.safeValue (response, 'withdrawals', []);
        const transactions = this.parseTransactions (withdrawals, currency, since, limit);
        return this.filterByCurrencySinceLimit (transactions, code, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.fetchTransactionsHelper (code, since, limit, params);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const deposits = this.safeValue (response, 'deposits', []);
        const transactions = this.parseTransactions (deposits, currency, since, limit);
        return this.filterByCurrencySinceLimit (transactions, code, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'COMPLETE': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // deposits
        //
        //     {
        //         "txid": "f49d489616911db44b740612d19464521179c76ebe9021af85b6de1e2f8d68cd",
        //         "type": "deposit",
        //         "amount": "49798.01987021",
        //         "status": "COMPLETE",
        //         "address": "DJVJZ58tJC8UeUv9Tqcdtn6uhWobouxFLT",
        //         "currency": "DOGE",
        //         "timestamp": 1524321838,
        //         "confirmations": 3371,
        //         "depositNumber": 134587098
        //     }
        //
        // withdrawals
        //
        //     {
        //         "fee": "0.00050000",
        //         "type": "withdrawal",
        //         "amount": "0.40234387",
        //         "status": "COMPLETE: fbabb2bf7d81c076f396f3441166d5f60f6cea5fdfe69e02adcc3b27af8c2746",
        //         "address": "1EdAqY4cqHoJGAgNfUFER7yZpg1Jc9DUa3",
        //         "currency": "BTC",
        //         "canCancel": 0,
        //         "ipAddress": "185.230.101.31",
        //         "paymentID": null,
        //         "timestamp": 1523834337,
        //         "canResendEmail": 0,
        //         "withdrawalNumber": 11162900
        //     }
        //
        const timestamp = this.safeTimestamp (transaction, 'timestamp');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        let status = this.safeString (transaction, 'status', 'pending');
        let txid = this.safeString (transaction, 'txid');
        if (status !== undefined) {
            const parts = status.split (': ');
            const numParts = parts.length;
            status = parts[0];
            if ((numParts > 1) && (txid === undefined)) {
                txid = parts[1];
            }
            status = this.parseTransactionStatus (status);
        }
        const defaultType = ('withdrawalNumber' in transaction) ? 'withdrawal' : 'deposit';
        const type = this.safeString (transaction, 'type', defaultType);
        const id = this.safeString2 (transaction, 'withdrawalNumber', 'depositNumber');
        let amount = this.safeFloat (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        const tag = this.safeString (transaction, 'paymentID');
        // according to https://poloniex.com/fees/
        const feeCost = this.safeFloat (transaction, 'fee', 0);
        if (type === 'withdrawal') {
            // poloniex withdrawal amount includes the fee
            amount = amount - feeCost;
        }
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': tag,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }

    async fetchPosition (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPair': market['id'],
        };
        const response = await this.privatePostGetMarginPosition (this.extend (request, params));
        //
        //     {
        //         type: "none",
        //         amount: "0.00000000",
        //         total: "0.00000000",
        //         basePrice: "0.00000000",
        //         liquidationPrice: -1,
        //         pl: "0.00000000",
        //         lendingFees: "0.00000000"
        //     }
        //
        // todo unify parsePosition/parsePositions
        return response;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        const query = this.extend ({ 'command': path }, params);
        if (api === 'public') {
            url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            query['nonce'] = this.nonce ();
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        // {"error":"Permission denied."}
        if ('error' in response) {
            const message = response['error'];
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
