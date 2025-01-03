'use strict';

var probit$1 = require('./abstract/probit.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class probit
 * @augments Exchange
 */
class probit extends probit$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'probit',
            'name': 'ProBit',
            'countries': ['SC', 'KR'],
            'rateLimit': 50,
            'pro': true,
            'has': {
                'CORS': true,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrder': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchBalance': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': true,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': 'emulated',
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'sandbox': true,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': true,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '10m': '10m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '1w': '1W',
                '1M': '1M',
            },
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/79268032-c4379480-7ea2-11ea-80b3-dd96bb29fd0d.jpg',
                'api': {
                    'accounts': 'https://accounts.probit.com',
                    'public': 'https://api.probit.com/api/exchange',
                    'private': 'https://api.probit.com/api/exchange',
                },
                'www': 'https://www.probit.com',
                'doc': [
                    'https://docs-en.probit.com',
                    'https://docs-ko.probit.com',
                ],
                'fees': 'https://support.probit.com/hc/en-us/articles/360020968611-Trading-Fees',
                'referral': 'https://www.probit.com/r/34608773',
            },
            'api': {
                'public': {
                    'get': {
                        'market': 1,
                        'currency': 1,
                        'currency_with_platform': 1,
                        'time': 1,
                        'ticker': 1,
                        'order_book': 1,
                        'trade': 1,
                        'candle': 1,
                    },
                },
                'private': {
                    'post': {
                        'new_order': 2,
                        'cancel_order': 1,
                        'withdrawal': 2,
                    },
                    'get': {
                        'balance': 1,
                        'order': 1,
                        'open_order': 1,
                        'order_history': 1,
                        'trade_history': 1,
                        'deposit_address': 1,
                        'transfer/payment': 1,
                    },
                },
                'accounts': {
                    'post': {
                        'token': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber('0.002'),
                    'taker': this.parseNumber('0.002'),
                },
            },
            'exceptions': {
                'exact': {
                    'UNAUTHORIZED': errors.AuthenticationError,
                    'INVALID_ARGUMENT': errors.BadRequest,
                    'TRADING_UNAVAILABLE': errors.ExchangeNotAvailable,
                    'NOT_ENOUGH_BALANCE': errors.InsufficientFunds,
                    'NOT_ALLOWED_COMBINATION': errors.BadRequest,
                    'INVALID_ORDER': errors.InvalidOrder,
                    'RATE_LIMIT_EXCEEDED': errors.RateLimitExceeded,
                    'MARKET_UNAVAILABLE': errors.ExchangeNotAvailable,
                    'INVALID_MARKET': errors.BadSymbol,
                    'MARKET_CLOSED': errors.MarketClosed,
                    'MARKET_NOT_FOUND': errors.BadSymbol,
                    'INVALID_CURRENCY': errors.BadRequest,
                    'TOO_MANY_OPEN_ORDERS': errors.DDoSProtection,
                    'DUPLICATE_ADDRESS': errors.InvalidAddress,
                    'invalid_grant': errors.AuthenticationError, // {"error":"invalid_grant"}
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'precisionMode': number.TICK_SIZE,
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
                'timeInForce': {
                    'limit': 'gtc',
                    'market': 'ioc',
                },
                'networks': {
                    'BEP20': 'BSC',
                    'ERC20': 'ETH',
                    'TRC20': 'TRON',
                },
            },
            'commonCurrencies': {
                'BB': 'Baby Bali',
                'CBC': 'CryptoBharatCoin',
                'CTK': 'Cryptyk',
                'CTT': 'Castweet',
                'DKT': 'DAKOTA',
                'EGC': 'EcoG9coin',
                'EPS': 'Epanus',
                'FX': 'Fanzy',
                'GM': 'GM Holding',
                'GOGOL': 'GOL',
                'GOL': 'Goldofir',
                'HUSL': 'The Hustle App',
                'LAND': 'Landbox',
                'SST': 'SocialSwap',
                'TCT': 'Top Coin Token',
                'TOR': 'Torex',
                'UNI': 'UNICORN Token',
                'UNISWAP': 'UNI',
            },
        });
    }
    /**
     * @method
     * @name probit#fetchMarkets
     * @see https://docs-en.probit.com/reference/market
     * @description retrieves data on all markets for probit
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const response = await this.publicGetMarket(params);
        //
        //     {
        //         "data":[
        //             {
        //                 "id":"MONA-USDT",
        //                 "base_currency_id":"MONA",
        //                 "quote_currency_id":"USDT",
        //                 "min_price":"0.001",
        //                 "max_price":"9999999999999999",
        //                 "price_increment":"0.001",
        //                 "min_quantity":"0.0001",
        //                 "max_quantity":"9999999999999999",
        //                 "quantity_precision":4,
        //                 "min_cost":"1",
        //                 "max_cost":"9999999999999999",
        //                 "cost_precision":8,
        //                 "taker_fee_rate":"0.2",
        //                 "maker_fee_rate":"0.2",
        //                 "show_in_ui":true,
        //                 "closed":false
        //             },
        //         ]
        //     }
        //
        const markets = this.safeValue(response, 'data', []);
        return this.parseMarkets(markets);
    }
    parseMarket(market) {
        const id = this.safeString(market, 'id');
        const baseId = this.safeString(market, 'base_currency_id');
        const quoteId = this.safeString(market, 'quote_currency_id');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const closed = this.safeBool(market, 'closed', false);
        const showInUI = this.safeBool(market, 'show_in_ui', true);
        const active = !closed && showInUI;
        const takerFeeRate = this.safeString(market, 'taker_fee_rate');
        const taker = Precise["default"].stringDiv(takerFeeRate, '100');
        const makerFeeRate = this.safeString(market, 'maker_fee_rate');
        const maker = Precise["default"].stringDiv(makerFeeRate, '100');
        return {
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
            'active': active,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'taker': this.parseNumber(taker),
            'maker': this.parseNumber(maker),
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber(this.parsePrecision(this.safeString(market, 'quantity_precision'))),
                'price': this.safeNumber(market, 'price_increment'),
                'cost': this.parseNumber(this.parsePrecision(this.safeString(market, 'cost_precision'))),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber(market, 'min_quantity'),
                    'max': this.safeNumber(market, 'max_quantity'),
                },
                'price': {
                    'min': this.safeNumber(market, 'min_price'),
                    'max': this.safeNumber(market, 'max_price'),
                },
                'cost': {
                    'min': this.safeNumber(market, 'min_cost'),
                    'max': this.safeNumber(market, 'max_cost'),
                },
            },
            'created': undefined,
            'info': market,
        };
    }
    /**
     * @method
     * @name probit#fetchCurrencies
     * @see https://docs-en.probit.com/reference/currency
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const response = await this.publicGetCurrencyWithPlatform(params);
        //
        //     {
        //         "data":[
        //             {
        //                 "id":"USDT",
        //                 "display_name":{"ko-kr":"테더","en-us":"Tether"},
        //                 "show_in_ui":true,
        //                 "platform":[
        //                     {
        //                         "id":"ETH",
        //                         "priority":1,
        //                         "deposit":true,
        //                         "withdrawal":true,
        //                         "currency_id":"USDT",
        //                         "precision":6,
        //                         "min_confirmation_count":15,
        //                         "require_destination_tag":false,
        //                         "display_name":{"name":{"ko-kr":"ERC-20","en-us":"ERC-20"}},
        //                         "min_deposit_amount":"0",
        //                         "min_withdrawal_amount":"1",
        //                         "withdrawal_fee":[
        //                             {"amount":"0.01","priority":2,"currency_id":"ETH"},
        //                             {"amount":"1.5","priority":1,"currency_id":"USDT"},
        //                         ],
        //                         "deposit_fee":{},
        //                         "suspended_reason":"",
        //                         "deposit_suspended":false,
        //                         "withdrawal_suspended":false
        //                     },
        //                     {
        //                         "id":"OMNI",
        //                         "priority":2,
        //                         "deposit":true,
        //                         "withdrawal":true,
        //                         "currency_id":"USDT",
        //                         "precision":6,
        //                         "min_confirmation_count":3,
        //                         "require_destination_tag":false,
        //                         "display_name":{"name":{"ko-kr":"OMNI","en-us":"OMNI"}},
        //                         "min_deposit_amount":"0",
        //                         "min_withdrawal_amount":"5",
        //                         "withdrawal_fee":[{"amount":"5","priority":1,"currency_id":"USDT"}],
        //                         "deposit_fee":{},
        //                         "suspended_reason":"wallet_maintenance",
        //                         "deposit_suspended":false,
        //                         "withdrawal_suspended":false
        //                     }
        //                 ],
        //                 "stakeable":false,
        //                 "unstakeable":false,
        //                 "auto_stake":false,
        //                 "auto_stake_amount":"0"
        //             }
        //         ]
        //     }
        //
        const currencies = this.safeValue(response, 'data', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString(currency, 'id');
            const code = this.safeCurrencyCode(id);
            const displayName = this.safeValue(currency, 'display_name');
            const name = this.safeString(displayName, 'en-us');
            const platforms = this.safeValue(currency, 'platform', []);
            const platformsByPriority = this.sortBy(platforms, 'priority');
            let platform = undefined;
            const networkList = {};
            for (let j = 0; j < platformsByPriority.length; j++) {
                const network = platformsByPriority[j];
                const idInner = this.safeString(network, 'id');
                const networkCode = this.networkIdToCode(idInner);
                const currentDepositSuspended = this.safeValue(network, 'deposit_suspended');
                const currentWithdrawalSuspended = this.safeValue(network, 'withdrawal_suspended');
                const currentDeposit = !currentDepositSuspended;
                const currentWithdraw = !currentWithdrawalSuspended;
                const currentActive = currentDeposit && currentWithdraw;
                if (currentActive) {
                    platform = network;
                }
                const precision = this.parsePrecision(this.safeString(network, 'precision'));
                const withdrawFee = this.safeValue(network, 'withdrawal_fee', []);
                let networkFee = this.safeValue(withdrawFee, 0, {});
                for (let k = 0; k < withdrawFee.length; k++) {
                    const withdrawPlatform = withdrawFee[k];
                    const feeCurrencyId = this.safeString(withdrawPlatform, 'currency_id');
                    if (feeCurrencyId === id) {
                        networkFee = withdrawPlatform;
                        break;
                    }
                }
                networkList[networkCode] = {
                    'id': idInner,
                    'network': networkCode,
                    'active': currentActive,
                    'deposit': currentDeposit,
                    'withdraw': currentWithdraw,
                    'fee': this.safeNumber(networkFee, 'amount'),
                    'precision': this.parseNumber(precision),
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber(network, 'min_withdrawal_amount'),
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.safeNumber(network, 'min_deposit_amount'),
                            'max': undefined,
                        },
                    },
                    'info': network,
                };
            }
            if (platform === undefined) {
                platform = this.safeValue(platformsByPriority, 0, {});
            }
            const depositSuspended = this.safeValue(platform, 'deposit_suspended');
            const withdrawalSuspended = this.safeValue(platform, 'withdrawal_suspended');
            const deposit = !depositSuspended;
            const withdraw = !withdrawalSuspended;
            const active = deposit && withdraw;
            const withdrawalFees = this.safeValue(platform, 'withdrawal_fee', {});
            const fees = [];
            // sometimes the withdrawal fee is an empty object
            // [ { 'amount': '0.015', 'priority': 1, 'currency_id': 'ETH' }, {} ]
            for (let j = 0; j < withdrawalFees.length; j++) {
                const withdrawalFeeInner = withdrawalFees[j];
                const amount = this.safeNumber(withdrawalFeeInner, 'amount');
                const priority = this.safeInteger(withdrawalFeeInner, 'priority');
                if ((amount !== undefined) && (priority !== undefined)) {
                    fees.push(withdrawalFeeInner);
                }
            }
            const withdrawalFeesByPriority = this.sortBy(fees, 'priority');
            const withdrawalFee = this.safeValue(withdrawalFeesByPriority, 0, {});
            const fee = this.safeNumber(withdrawalFee, 'amount');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': fee,
                'precision': this.parseNumber(this.parsePrecision(this.safeString(platform, 'precision'))),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': this.safeNumber(platform, 'min_deposit_amount'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber(platform, 'min_withdrawal_amount'),
                        'max': undefined,
                    },
                },
                'networks': networkList,
            };
        }
        return result;
    }
    parseBalance(response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const data = this.safeValue(response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString(balance, 'currency_id');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['total'] = this.safeString(balance, 'total');
            account['free'] = this.safeString(balance, 'available');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name probit#fetchBalance
     * @see https://docs-en.probit.com/reference/balance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetBalance(params);
        //
        //     {
        //         "data": [
        //             {
        //                 "currency_id":"XRP",
        //                 "total":"100",
        //                 "available":"0",
        //             }
        //         ]
        //     }
        //
        return this.parseBalance(response);
    }
    /**
     * @method
     * @name probit#fetchOrderBook
     * @see https://docs-en.probit.com/reference/order_book
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market_id': market['id'],
        };
        const response = await this.publicGetOrderBook(this.extend(request, params));
        //
        //     {
        //         data: [
        //             { side: 'buy', price: '0.000031', quantity: '10' },
        //             { side: 'buy', price: '0.00356007', quantity: '4.92156877' },
        //             { side: 'sell', price: '0.1857', quantity: '0.17' },
        //         ]
        //     }
        //
        const data = this.safeValue(response, 'data', []);
        const dataBySide = this.groupBy(data, 'side');
        return this.parseOrderBook(dataBySide, market['symbol'], undefined, 'buy', 'sell', 'price', 'quantity');
    }
    /**
     * @method
     * @name probit#fetchTickers
     * @see https://docs-en.probit.com/reference/ticker
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        if (symbols !== undefined) {
            const marketIds = this.marketIds(symbols);
            request['market_ids'] = marketIds.join(',');
        }
        const response = await this.publicGetTicker(this.extend(request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "last":"0.022902",
        //                 "low":"0.021693",
        //                 "high":"0.024093",
        //                 "change":"-0.000047",
        //                 "base_volume":"15681.986",
        //                 "quote_volume":"360.514403624",
        //                 "market_id":"ETH-BTC",
        //                 "time":"2020-04-12T18:43:38.000Z"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseTickers(data, symbols);
    }
    /**
     * @method
     * @name probit#fetchTicker
     * @see https://docs-en.probit.com/reference/ticker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market_ids': market['id'],
        };
        const response = await this.publicGetTicker(this.extend(request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "last":"0.022902",
        //                 "low":"0.021693",
        //                 "high":"0.024093",
        //                 "change":"-0.000047",
        //                 "base_volume":"15681.986",
        //                 "quote_volume":"360.514403624",
        //                 "market_id":"ETH-BTC",
        //                 "time":"2020-04-12T18:43:38.000Z"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue(response, 'data', []);
        const ticker = this.safeValue(data, 0);
        if (ticker === undefined) {
            throw new errors.BadResponse(this.id + ' fetchTicker() returned an empty response');
        }
        return this.parseTicker(ticker, market);
    }
    parseTicker(ticker, market = undefined) {
        //
        //     {
        //         "last":"0.022902",
        //         "low":"0.021693",
        //         "high":"0.024093",
        //         "change":"-0.000047",
        //         "base_volume":"15681.986",
        //         "quote_volume":"360.514403624",
        //         "market_id":"ETH-BTC",
        //         "time":"2020-04-12T18:43:38.000Z"
        //     }
        //
        const timestamp = this.parse8601(this.safeString(ticker, 'time'));
        const marketId = this.safeString(ticker, 'market_id');
        const symbol = this.safeSymbol(marketId, market, '-');
        const close = this.safeString(ticker, 'last');
        const change = this.safeString(ticker, 'change');
        const baseVolume = this.safeString(ticker, 'base_volume');
        const quoteVolume = this.safeString(ticker, 'quote_volume');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'high'),
            'low': this.safeString(ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': change,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name probit#fetchMyTrades
     * @see https://docs-en.probit.com/reference/trade
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        const now = this.milliseconds();
        const request = {
            'limit': 100,
            'start_time': this.iso8601(now - 31536000000),
            'end_time': this.iso8601(now),
        };
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market_id'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = this.iso8601(since);
            request['end_time'] = this.iso8601(Math.min(now, since + 31536000000));
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetTradeHistory(this.extend(request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "id":"BTC-USDT:183566",
        //                 "order_id":"17209376",
        //                 "side":"sell",
        //                 "fee_amount":"0.657396569175",
        //                 "fee_currency_id":"USDT",
        //                 "status":"settled",
        //                 "price":"6573.96569175",
        //                 "quantity":"0.1",
        //                 "cost":"657.396569175",
        //                 "time":"2018-08-10T06:06:46.000Z",
        //                 "market_id":"BTC-USDT"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseTrades(data, market, since, limit);
    }
    /**
     * @method
     * @name probit#fetchTrades
     * @see https://docs-en.probit.com/reference/trade-1
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market_id': market['id'],
            'start_time': '1970-01-01T00:00:00.000Z',
            'end_time': this.iso8601(this.milliseconds()),
        };
        if (since !== undefined) {
            request['start_time'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000);
        }
        else {
            request['limit'] = 1000; // required to set any value
        }
        const response = await this.publicGetTrade(this.extend(request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "id":"ETH-BTC:3331886",
        //                 "price":"0.022981",
        //                 "quantity":"12.337",
        //                 "time":"2020-04-12T20:55:42.371Z",
        //                 "side":"sell",
        //                 "tick_direction":"down"
        //             },
        //             {
        //                 "id":"ETH-BTC:3331885",
        //                 "price":"0.022982",
        //                 "quantity":"6.472",
        //                 "time":"2020-04-12T20:55:39.652Z",
        //                 "side":"sell",
        //                 "tick_direction":"down"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseTrades(data, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "id":"ETH-BTC:3331886",
        //         "price":"0.022981",
        //         "quantity":"12.337",
        //         "time":"2020-04-12T20:55:42.371Z",
        //         "side":"sell",
        //         "tick_direction":"down"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "id":"BTC-USDT:183566",
        //         "order_id":"17209376",
        //         "side":"sell",
        //         "fee_amount":"0.657396569175",
        //         "fee_currency_id":"USDT",
        //         "status":"settled",
        //         "price":"6573.96569175",
        //         "quantity":"0.1",
        //         "cost":"657.396569175",
        //         "time":"2018-08-10T06:06:46.000Z",
        //         "market_id":"BTC-USDT"
        //     }
        //
        const timestamp = this.parse8601(this.safeString(trade, 'time'));
        const id = this.safeString(trade, 'id');
        let marketId = undefined;
        if (id !== undefined) {
            const parts = id.split(':');
            marketId = this.safeString(parts, 0);
        }
        marketId = this.safeString(trade, 'market_id', marketId);
        const symbol = this.safeSymbol(marketId, market, '-');
        const side = this.safeString(trade, 'side');
        const priceString = this.safeString(trade, 'price');
        const amountString = this.safeString(trade, 'quantity');
        const orderId = this.safeString(trade, 'order_id');
        const feeCostString = this.safeString(trade, 'fee_amount');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString(trade, 'fee_currency_id');
            const feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }
    /**
     * @method
     * @name probit#fetchTime
     * @see https://docs-en.probit.com/reference/time
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.publicGetTime(params);
        //
        //     { "data":"2020-04-12T18:54:25.390Z" }
        //
        const timestamp = this.parse8601(this.safeString(response, 'data'));
        return timestamp;
    }
    normalizeOHLCVTimestamp(timestamp, timeframe, after = false) {
        const duration = this.parseTimeframe(timeframe);
        if (timeframe === '1M') {
            const iso8601 = this.iso8601(timestamp);
            const parts = iso8601.split('-');
            const year = this.safeString(parts, 0);
            const month = this.safeInteger(parts, 1);
            let monthString = undefined;
            if (after) {
                monthString = this.sum(month, 1).toString();
            }
            if (month < 10) {
                monthString = '0' + month.toString();
            }
            return year + '-' + monthString + '-01T00:00:00.000Z';
        }
        else if (timeframe === '1w') {
            timestamp = this.parseToInt(timestamp / 1000);
            const firstSunday = 259200; // 1970-01-04T00:00:00.000Z
            const difference = timestamp - firstSunday;
            const numWeeks = Math.floor(difference / duration);
            let previousSunday = this.sum(firstSunday, numWeeks * duration);
            if (after) {
                previousSunday = this.sum(previousSunday, duration);
            }
            return this.iso8601(previousSunday * 1000);
        }
        else {
            timestamp = this.parseToInt(timestamp / 1000);
            timestamp = duration * this.parseToInt(timestamp / duration);
            if (after) {
                timestamp = this.sum(timestamp, duration);
            }
            return this.iso8601(timestamp * 1000);
        }
    }
    /**
     * @method
     * @name probit#fetchOHLCV
     * @see https://docs-en.probit.com/reference/candle
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const interval = this.safeString(this.timeframes, timeframe, timeframe);
        limit = (limit === undefined) ? 100 : limit;
        let requestLimit = this.sum(limit, 1);
        requestLimit = Math.min(1000, requestLimit); // max 1000
        const request = {
            'market_ids': market['id'],
            'interval': interval,
            'sort': 'asc',
            'limit': requestLimit, // max 1000
        };
        const now = this.milliseconds();
        const duration = this.parseTimeframe(timeframe);
        let startTime = since;
        let endTime = now;
        if (since === undefined) {
            if (limit === undefined) {
                limit = requestLimit;
            }
            startTime = now - limit * duration * 1000;
        }
        else {
            if (limit === undefined) {
                endTime = now;
            }
            else {
                endTime = this.sum(since, this.sum(limit, 1) * duration * 1000);
            }
        }
        const startTimeNormalized = this.normalizeOHLCVTimestamp(startTime, timeframe);
        const endTimeNormalized = this.normalizeOHLCVTimestamp(endTime, timeframe, true);
        request['start_time'] = startTimeNormalized;
        request['end_time'] = endTimeNormalized;
        const response = await this.publicGetCandle(this.extend(request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "market_id":"ETH-BTC",
        //                 "open":"0.02811",
        //                 "close":"0.02811",
        //                 "low":"0.02811",
        //                 "high":"0.02811",
        //                 "base_volume":"0.0005",
        //                 "quote_volume":"0.000014055",
        //                 "start_time":"2018-11-30T18:19:00.000Z",
        //                 "end_time":"2018-11-30T18:20:00.000Z"
        //             },
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseOHLCVs(data, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     {
        //         "market_id":"ETH-BTC",
        //         "open":"0.02811",
        //         "close":"0.02811",
        //         "low":"0.02811",
        //         "high":"0.02811",
        //         "base_volume":"0.0005",
        //         "quote_volume":"0.000014055",
        //         "start_time":"2018-11-30T18:19:00.000Z",
        //         "end_time":"2018-11-30T18:20:00.000Z"
        //     }
        //
        return [
            this.parse8601(this.safeString(ohlcv, 'start_time')),
            this.safeNumber(ohlcv, 'open'),
            this.safeNumber(ohlcv, 'high'),
            this.safeNumber(ohlcv, 'low'),
            this.safeNumber(ohlcv, 'close'),
            this.safeNumber(ohlcv, 'base_volume'),
        ];
    }
    /**
     * @method
     * @name probit#fetchOpenOrders
     * @see https://docs-en.probit.com/reference/open_order-1
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        since = this.parse8601(since);
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market_id'] = market['id'];
        }
        const response = await this.privateGetOpenOrder(this.extend(request, params));
        const data = this.safeList(response, 'data');
        return this.parseOrders(data, market, since, limit);
    }
    /**
     * @method
     * @name probit#fetchClosedOrders
     * @see https://docs-en.probit.com/reference/order
     * @description fetches information on multiple closed orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'start_time': this.iso8601(0),
            'end_time': this.iso8601(this.milliseconds()),
            'limit': 100,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market_id'] = market['id'];
        }
        if (since) {
            request['start_time'] = this.iso8601(since);
        }
        if (limit) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrderHistory(this.extend(request, params));
        const data = this.safeList(response, 'data');
        return this.parseOrders(data, market, since, limit);
    }
    /**
     * @method
     * @name probit#fetchOrder
     * @see https://docs-en.probit.com/reference/order-3
     * @description fetches information on an order made by the user
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market_id': market['id'],
        };
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
        }
        else {
            request['order_id'] = id;
        }
        const query = this.omit(params, ['clientOrderId', 'client_order_id']);
        const response = await this.privateGetOrder(this.extend(request, query));
        const data = this.safeValue(response, 'data', []);
        const order = this.safeDict(data, 0);
        return this.parseOrder(order, market);
    }
    parseOrderStatus(status) {
        const statuses = {
            'open': 'open',
            'cancelled': 'canceled',
            'filled': 'closed',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        //     {
        //         id,
        //         user_id,
        //         market_id,
        //         "type": "orderType",
        //         "side": "side",
        //         quantity,
        //         limit_price,
        //         "time_in_force": "timeInForce",
        //         filled_cost,
        //         filled_quantity,
        //         open_quantity,
        //         cancelled_quantity,
        //         "status": "orderStatus",
        //         "time": "date",
        //         client_order_id,
        //     }
        //
        const status = this.parseOrderStatus(this.safeString(order, 'status'));
        const id = this.safeString(order, 'id');
        const type = this.safeString(order, 'type');
        const side = this.safeString(order, 'side');
        const marketId = this.safeString(order, 'market_id');
        const symbol = this.safeSymbol(marketId, market, '-');
        const timestamp = this.parse8601(this.safeString(order, 'time'));
        let price = this.safeString(order, 'limit_price');
        const filled = this.safeString(order, 'filled_quantity');
        let remaining = this.safeString(order, 'open_quantity');
        const canceledAmount = this.safeString(order, 'cancelled_quantity');
        if (canceledAmount !== undefined) {
            remaining = Precise["default"].stringAdd(remaining, canceledAmount);
        }
        const amount = this.safeString(order, 'quantity', Precise["default"].stringAdd(filled, remaining));
        const cost = this.safeString2(order, 'filled_cost', 'cost');
        if (type === 'market') {
            price = undefined;
        }
        const clientOrderId = this.safeString(order, 'client_order_id');
        const timeInForce = this.safeStringUpper(order, 'time_in_force');
        return this.safeOrder({
            'id': id,
            'info': order,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'side': side,
            'status': status,
            'price': price,
            'triggerPrice': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'average': undefined,
            'cost': cost,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }
    costToPrecision(symbol, cost) {
        return this.decimalToPrecision(cost, number.TRUNCATE, this.markets[symbol]['precision']['cost'], this.precisionMode);
    }
    /**
     * @method
     * @name probit#createOrder
     * @description create a trade order
     * @see https://docs-en.probit.com/reference/order-1
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] the quote quantity that can be used as an alternative for the amount for market buy orders
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const options = this.safeValue(this.options, 'timeInForce');
        const defaultTimeInForce = this.safeValue(options, type);
        const timeInForce = this.safeString2(params, 'timeInForce', 'time_in_force', defaultTimeInForce);
        const request = {
            'market_id': market['id'],
            'type': type,
            'side': side,
            'time_in_force': timeInForce,
        };
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
        }
        let quoteAmount = undefined;
        if (type === 'limit') {
            request['limit_price'] = this.priceToPrecision(symbol, price);
            request['quantity'] = this.amountToPrecision(symbol, amount);
        }
        else if (type === 'market') {
            // for market buy it requires the amount of quote currency to spend
            if (side === 'buy') {
                let createMarketBuyOrderRequiresPrice = true;
                [createMarketBuyOrderRequiresPrice, params] = this.handleOptionAndParams(params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
                const cost = this.safeString(params, 'cost');
                params = this.omit(params, 'cost');
                if (cost !== undefined) {
                    quoteAmount = this.costToPrecision(symbol, cost);
                }
                else if (createMarketBuyOrderRequiresPrice) {
                    if (price === undefined) {
                        throw new errors.InvalidOrder(this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument');
                    }
                    else {
                        const amountString = this.numberToString(amount);
                        const priceString = this.numberToString(price);
                        const costRequest = Precise["default"].stringMul(amountString, priceString);
                        quoteAmount = this.costToPrecision(symbol, costRequest);
                    }
                }
                else {
                    quoteAmount = this.costToPrecision(symbol, amount);
                }
                request['cost'] = quoteAmount;
            }
            else {
                request['quantity'] = this.amountToPrecision(symbol, amount);
            }
        }
        const query = this.omit(params, ['timeInForce', 'time_in_force', 'clientOrderId', 'client_order_id']);
        const response = await this.privatePostNewOrder(this.extend(request, query));
        //
        //     {
        //         "data": {
        //             id,
        //             user_id,
        //             market_id,
        //             "type": "orderType",
        //             "side": "side",
        //             quantity,
        //             limit_price,
        //             "time_in_force": "timeInForce",
        //             filled_cost,
        //             filled_quantity,
        //             open_quantity,
        //             cancelled_quantity,
        //             "status": "orderStatus",
        //             "time": "date",
        //             client_order_id,
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data');
        const order = this.parseOrder(data, market);
        // a workaround for incorrect huge amounts
        // returned by the exchange on market buys
        if ((type === 'market') && (side === 'buy')) {
            order['amount'] = undefined;
            order['cost'] = this.parseNumber(quoteAmount);
            order['remaining'] = undefined;
        }
        return order;
    }
    /**
     * @method
     * @name probit#cancelOrder
     * @see https://docs-en.probit.com/reference/order-2
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market_id': market['id'],
            'order_id': id,
        };
        const response = await this.privatePostCancelOrder(this.extend(request, params));
        const data = this.safeDict(response, 'data');
        return this.parseOrder(data);
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        const address = this.safeString(depositAddress, 'address');
        const tag = this.safeString(depositAddress, 'destination_tag');
        const currencyId = this.safeString(depositAddress, 'currency_id');
        currency = this.safeCurrency(currencyId, currency);
        const code = currency['code'];
        const network = this.safeString(depositAddress, 'platform_id');
        this.checkAddress(address);
        return {
            'info': depositAddress,
            'currency': code,
            'network': network,
            'address': address,
            'tag': tag,
        };
    }
    /**
     * @method
     * @name probit#fetchDepositAddress
     * @see https://docs-en.probit.com/reference/deposit_address
     * @description fetch the deposit address for a currency associated with this account
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency_id': currency['id'],
            // 'platform_id': 'TRON', (undocumented)
        };
        const networks = this.safeValue(this.options, 'networks', {});
        let network = this.safeStringUpper(params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString(networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['platform_id'] = network;
            params = this.omit(params, 'platform_id');
        }
        const response = await this.privateGetDepositAddress(this.extend(request, params));
        //
        // without 'platform_id'
        //     {
        //         "data":[
        //             {
        //                 "currency_id":"ETH",
        //                 "address":"0x12e2caf3c4051ba1146e612f532901a423a9898a",
        //                 "destination_tag":null
        //             }
        //         ]
        //     }
        //
        // with 'platform_id'
        //     {
        //         "data":[
        //             {
        //                 "platform_id":"TRON",
        //                 "address":"TDQLMxBTa6MzuoZ6deSGZkqET3Ek8v7uC6",
        //                 "destination_tag":null
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue(response, 'data', []);
        const firstAddress = this.safeValue(data, 0);
        if (firstAddress === undefined) {
            throw new errors.InvalidAddress(this.id + ' fetchDepositAddress() returned an empty response');
        }
        return this.parseDepositAddress(firstAddress, currency);
    }
    /**
     * @method
     * @name probit#fetchDepositAddresses
     * @see https://docs-en.probit.com/reference/deposit_address
     * @description fetch deposit addresses for multiple currencies and chain types
     * @param {string[]|undefined} codes list of unified currency codes, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddresses(codes = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        if (codes) {
            const currencyIds = [];
            for (let i = 0; i < codes.length; i++) {
                const currency = this.currency(codes[i]);
                currencyIds.push(currency['id']);
            }
            request['currency_id'] = codes.join(',');
        }
        const response = await this.privateGetDepositAddress(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        return this.parseDepositAddresses(data, codes);
    }
    /**
     * @method
     * @name probit#withdraw
     * @see https://docs-en.probit.com/reference/withdrawal
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        // In order to use this method
        // you need to allow API withdrawal from the API Settings Page, and
        // and register the list of withdrawal addresses and destination tags on the API Settings page
        // you can only withdraw to the registered addresses using the API
        this.checkAddress(address);
        await this.loadMarkets();
        const currency = this.currency(code);
        if (tag === undefined) {
            tag = '';
        }
        const request = {
            'currency_id': currency['id'],
            // 'platform_id': 'ETH', // if omitted it will use the default platform for the currency
            'address': address,
            'destination_tag': tag,
            'amount': this.numberToString(amount),
            // which currency to pay the withdrawal fees
            // only applicable for currencies that accepts multiple withdrawal fee options
            // 'fee_currency_id': 'ETH', // if omitted it will use the default fee policy for each currency
            // whether the amount field includes fees
            // 'include_fee': false, // makes sense only when fee_currency_id is equal to currency_id
        };
        const networks = this.safeValue(this.options, 'networks', {});
        let network = this.safeStringUpper(params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString(networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['platform_id'] = network;
            params = this.omit(params, 'network');
        }
        const response = await this.privatePostWithdrawal(this.extend(request, params));
        const data = this.safeDict(response, 'data');
        return this.parseTransaction(data, currency);
    }
    /**
     * @method
     * @name probit#fetchDeposits
     * @description fetch all deposits made to an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of transaction structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'type': 'deposit',
        };
        const result = await this.fetchTransactions(code, since, limit, this.extend(request, params));
        return result;
    }
    /**
     * @method
     * @name probit#fetchWithdrawals
     * @description fetch all withdrawals made to an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of transaction structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'type': 'withdrawal',
        };
        const result = await this.fetchTransactions(code, since, limit, this.extend(request, params));
        return result;
    }
    /**
     * @method
     * @name probit#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://docs-en.probit.com/reference/transferpayment
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch transactions for
     * @param {int} [limit] the maximum number of transaction structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transactions for
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDepositsWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency_id'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_time'] = this.iso8601(since);
        }
        else {
            request['start_time'] = this.iso8601(1);
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            request['end_time'] = this.iso8601(until);
            params = this.omit(params, ['until']);
        }
        else {
            request['end_time'] = this.iso8601(this.milliseconds());
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        else {
            request['limit'] = 100;
        }
        const response = await this.privateGetTransferPayment(this.extend(request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "id": "01211d4b-0e68-41d6-97cb-298bfe2cab67",
        //                 "type": "deposit",
        //                 "status": "done",
        //                 "amount": "0.01",
        //                 "address": "0x9e7430fc0bdd14745bd00a1b92ed25133a7c765f",
        //                 "time": "2023-06-14T12:03:11.000Z",
        //                 "hash": "0x0ff5bedc9e378f9529acc6b9840fa8c2ef00fd0275e0bac7fa0589a9b5d1712e",
        //                 "currency_id": "ETH",
        //                 "confirmations":0,
        //                 "fee": "0",
        //                 "destination_tag": null,
        //                 "platform_id": "ETH",
        //                 "fee_currency_id": "ETH",
        //                 "payment_service_name":null,
        //                 "payment_service_display_name":null,
        //                 "crypto":null
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseTransactions(data, currency, since, limit);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        //     {
        //         "id": "01211d4b-0e68-41d6-97cb-298bfe2cab67",
        //         "type": "deposit",
        //         "status": "done",
        //         "amount": "0.01",
        //         "address": "0x9e7430fc0bdd14745bd00a1b92ed25133a7c765f",
        //         "time": "2023-06-14T12:03:11.000Z",
        //         "hash": "0x0ff5bedc9e378f9529acc6b9840fa8c2ef00fd0275e0bac7fa0589a9b5d1712e",
        //         "currency_id": "ETH",
        //         "confirmations":0,
        //         "fee": "0",
        //         "destination_tag": null,
        //         "platform_id": "ETH",
        //         "fee_currency_id": "ETH",
        //         "payment_service_name":null,
        //         "payment_service_display_name":null,
        //         "crypto":null
        //     }
        //
        const id = this.safeString(transaction, 'id');
        const networkId = this.safeString(transaction, 'platform_id');
        const networkCode = this.networkIdToCode(networkId);
        const amount = this.safeNumber(transaction, 'amount');
        const address = this.safeString(transaction, 'address');
        const tag = this.safeString(transaction, 'destination_tag');
        const txid = this.safeString(transaction, 'hash');
        const timestamp = this.parse8601(this.safeString(transaction, 'time'));
        const type = this.safeString(transaction, 'type');
        const currencyId = this.safeString(transaction, 'currency_id');
        const code = this.safeCurrencyCode(currencyId);
        const status = this.parseTransactionStatus(this.safeString(transaction, 'status'));
        const feeCostString = this.safeString(transaction, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined && feeCostString !== '0') {
            fee = {
                'currency': code,
                'cost': this.parseNumber(feeCostString),
            };
        }
        return {
            'id': id,
            'currency': code,
            'amount': amount,
            'network': networkCode,
            'addressFrom': undefined,
            'address': address,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'status': status,
            'type': type,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'updated': undefined,
            'internal': undefined,
            'comment': undefined,
            'fee': fee,
            'info': transaction,
        };
    }
    parseTransactionStatus(status) {
        const statuses = {
            'requested': 'pending',
            'pending': 'pending',
            'confirming': 'pending',
            'confirmed': 'pending',
            'applying': 'pending',
            'done': 'ok',
            'cancelled': 'canceled',
            'cancelling': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name probit#fetchDepositWithdrawFees
     * @see https://docs-en.probit.com/reference/currency
     * @description fetch deposit and withdraw fees
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [fees structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchDepositWithdrawFees(codes = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.publicGetCurrencyWithPlatform(params);
        //
        //  {
        //     "data": [
        //       {
        //       "id": "AFX",
        //       "display_name": {
        //       "ko-kr": "아프릭스",
        //       "en-us": "Afrix"
        //       },
        //       "show_in_ui": true,
        //       "platform": [
        //       {
        //       "id": "ZYN",
        //       "priority": 1,
        //       "deposit": true,
        //       "withdrawal": true,
        //       "currency_id": "AFX",
        //       "precision": 18,
        //       "min_confirmation_count": 60,
        //       "require_destination_tag": false,
        //       "allow_withdrawal_destination_tag": false,
        //       "display_name": {
        //       "name": {
        //       "ko-kr": "지네코인",
        //       "en-us": "Wethio"
        //       }
        //       },
        //       "min_deposit_amount": "0",
        //       "min_withdrawal_amount": "0",
        //       "withdrawal_fee": [
        //       {
        //       "currency_id": "ZYN",
        //       "amount": "0.5",
        //       "priority": 1
        //       }
        //       ],
        //       "deposit_fee": {},
        //       "suspended_reason": "",
        //       "deposit_suspended": false,
        //       "withdrawal_suspended": false,
        //       "platform_currency_display_name": {}
        //       }
        //       ],
        //       "internal_transfer": {
        //       "suspended_reason": null,
        //       "suspended": false
        //       },
        //       "stakeable": false,
        //       "unstakeable": false,
        //       "auto_stake": false,
        //       "auto_stake_amount": "0"
        //       },
        //     ]
        //  }
        //
        const data = this.safeList(response, 'data');
        return this.parseDepositWithdrawFees(data, codes, 'id');
    }
    parseDepositWithdrawFee(fee, currency = undefined) {
        //
        // {
        //     "id": "USDT",
        //     "display_name": { "ko-kr": '테더', "en-us": "Tether" },
        //     "show_in_ui": true,
        //     "platform": [
        //       {
        //         "id": "ETH",
        //         "priority": "1",
        //         "deposit": true,
        //         "withdrawal": true,
        //         "currency_id": "USDT",
        //         "precision": "6",
        //         "min_confirmation_count": "15",
        //         "require_destination_tag": false,
        //         "allow_withdrawal_destination_tag": false,
        //         "display_name": [Object],
        //         "min_deposit_amount": "0",
        //         "min_withdrawal_amount": "1",
        //         "withdrawal_fee": [Array],
        //         "deposit_fee": {},
        //         "suspended_reason": '',
        //         "deposit_suspended": false,
        //         "withdrawal_suspended": false,
        //         "platform_currency_display_name": [Object]
        //       },
        //     ],
        //     "internal_transfer": { suspended_reason: null, suspended: false },
        //     "stakeable": false,
        //     "unstakeable": false,
        //     "auto_stake": false,
        //     "auto_stake_amount": "0"
        //   }
        //
        const depositWithdrawFee = this.depositWithdrawFee({});
        const platforms = this.safeValue(fee, 'platform', []);
        const depositResult = {
            'fee': undefined,
            'percentage': undefined,
        };
        for (let i = 0; i < platforms.length; i++) {
            const network = platforms[i];
            const networkId = this.safeString(network, 'id');
            const networkCode = this.networkIdToCode(networkId, currency['code']);
            const withdrawalFees = this.safeValue(network, 'withdrawal_fee', {});
            const withdrawFee = this.safeNumber(withdrawalFees[0], 'amount');
            if (withdrawalFees.length) {
                const withdrawResult = {
                    'fee': withdrawFee,
                    'percentage': (withdrawFee !== undefined) ? false : undefined,
                };
                if (i === 0) {
                    depositWithdrawFee['withdraw'] = withdrawResult;
                }
                depositWithdrawFee['networks'][networkCode] = {
                    'withdraw': withdrawResult,
                    'deposit': depositResult,
                };
            }
        }
        depositWithdrawFee['info'] = fee;
        return depositWithdrawFee;
    }
    nonce() {
        return this.milliseconds();
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/';
        const query = this.omit(params, this.extractParams(path));
        if (api === 'accounts') {
            this.checkRequiredCredentials();
            url += this.implodeParams(path, params);
            const auth = this.apiKey + ':' + this.secret;
            const auth64 = this.stringToBase64(auth);
            headers = {
                'Authorization': 'Basic ' + auth64,
                'Content-Type': 'application/json',
            };
            if (Object.keys(query).length) {
                body = this.json(query);
            }
        }
        else {
            url += this.version + '/';
            if (api === 'public') {
                url += this.implodeParams(path, params);
                if (Object.keys(query).length) {
                    url += '?' + this.urlencode(query);
                }
            }
            else if (api === 'private') {
                const now = this.milliseconds();
                this.checkRequiredCredentials();
                const expires = this.safeInteger(this.options, 'expires');
                if ((expires === undefined) || (expires < now)) {
                    throw new errors.AuthenticationError(this.id + ' access token expired, call signIn() method');
                }
                const accessToken = this.safeString(this.options, 'accessToken');
                headers = {
                    'Authorization': 'Bearer ' + accessToken,
                };
                url += this.implodeParams(path, params);
                if (method === 'GET') {
                    if (Object.keys(query).length) {
                        url += '?' + this.urlencode(query);
                    }
                }
                else if (Object.keys(query).length) {
                    body = this.json(query);
                    headers['Content-Type'] = 'application/json';
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    /**
     * @method
     * @name probit#signIn
     * @see https://docs-en.probit.com/reference/token
     * @description sign in, must be called prior to using other authenticated methods
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns response from exchange
     */
    async signIn(params = {}) {
        this.checkRequiredCredentials();
        const request = {
            'grant_type': 'client_credentials', // the only supported value
        };
        const response = await this.accountsPostToken(this.extend(request, params));
        //
        //     {
        //         "access_token": "0ttDv/2hTTn3bLi8GP1gKaneiEQ6+0hOBenPrxNQt2s=",
        //         "token_type": "bearer",
        //         "expires_in": 900
        //     }
        //
        const expiresIn = this.safeInteger(response, 'expires_in');
        const accessToken = this.safeString(response, 'access_token');
        this.options['accessToken'] = accessToken;
        this.options['expires'] = this.sum(this.milliseconds(), expiresIn * 1000);
        return response;
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        if ('errorCode' in response) {
            const errorCode = this.safeString(response, 'errorCode');
            if (errorCode !== undefined) {
                const errMessage = this.safeString(response, 'message', '');
                const details = this.safeValue(response, 'details');
                const feedback = this.id + ' ' + errorCode + ' ' + errMessage + ' ' + this.json(details);
                if ('exact' in this.exceptions) {
                    this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
                }
                if ('broad' in this.exceptions) {
                    this.throwBroadlyMatchedException(this.exceptions['broad'], errMessage, feedback);
                }
                throw new errors.ExchangeError(feedback);
            }
        }
        return undefined;
    }
}

module.exports = probit;
