'use strict';

var coinone$1 = require('./abstract/coinone.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha512 = require('./static_dependencies/noble-hashes/sha512.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class coinone
 * @augments Exchange
 */
class coinone extends coinone$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'coinone',
            'name': 'CoinOne',
            'countries': ['KR'],
            'rateLimit': 50,
            'version': 'v2',
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketOrder': false,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchBalance': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': true,
                'fetchDepositAddressesByNetwork': false,
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
                'fetchTrades': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'ws': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38003300-adc12fba-323f-11e8-8525-725f53c4a659.jpg',
                'api': {
                    'rest': 'https://api.coinone.co.kr',
                    'v2Public': 'https://api.coinone.co.kr/public/v2',
                    'v2Private': 'https://api.coinone.co.kr/v2',
                    'v2_1Private': 'https://api.coinone.co.kr/v2.1',
                },
                'www': 'https://coinone.co.kr',
                'doc': 'https://doc.coinone.co.kr',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'orderbook',
                        'ticker',
                        'ticker_utc',
                        'trades',
                    ],
                },
                'v2Public': {
                    'get': [
                        'range_units',
                        'markets/{quote_currency}',
                        'markets/{quote_currency}/{target_currency}',
                        'orderbook/{quote_currency}/{target_currency}',
                        'trades/{quote_currency}/{target_currency}',
                        'ticker_new/{quote_currency}',
                        'ticker_new/{quote_currency}/{target_currency}',
                        'ticker_utc_new/{quote_currency}',
                        'ticker_utc_new/{quote_currency}/{target_currency}',
                        'currencies',
                        'currencies/{currency}',
                        'chart/{quote_currency}/{target_currency}',
                    ],
                },
                'private': {
                    'post': [
                        'account/deposit_address',
                        'account/btc_deposit_address',
                        'account/balance',
                        'account/daily_balance',
                        'account/user_info',
                        'account/virtual_account',
                        'order/cancel_all',
                        'order/cancel',
                        'order/limit_buy',
                        'order/limit_sell',
                        'order/complete_orders',
                        'order/limit_orders',
                        'order/order_info',
                        'transaction/auth_number',
                        'transaction/history',
                        'transaction/krw/history',
                        'transaction/btc',
                        'transaction/coin',
                    ],
                },
                'v2Private': {
                    'post': [
                        'account/balance',
                        'account/deposit_address',
                        'account/user_info',
                        'account/virtual_account',
                        'order/cancel',
                        'order/limit_buy',
                        'order/limit_sell',
                        'order/limit_orders',
                        'order/complete_orders',
                        'order/query_order',
                        'transaction/auth_number',
                        'transaction/btc',
                        'transaction/history',
                        'transaction/krw/history',
                    ],
                },
                'v2_1Private': {
                    'post': [
                        'account/balance/all',
                        'account/balance',
                        'account/trade_fee',
                        'account/trade_fee/{quote_currency}/{target_currency}',
                        'order/limit',
                        'order/cancel',
                        'order/cancel/all',
                        'order/open_orders',
                        'order/open_orders/all',
                        'order/complete_orders',
                        'order/complete_orders/all',
                        'order/info',
                        'transaction/krw/history',
                        'transaction/coin/history',
                        'transaction/coin/withdrawal/limit',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.002,
                    'maker': 0.002,
                },
            },
            'precisionMode': number.TICK_SIZE,
            'exceptions': {
                '104': errors.OrderNotFound,
                '107': errors.BadRequest,
                '108': errors.BadSymbol,
                '405': errors.OnMaintenance,
            },
            'commonCurrencies': {
                'SOC': 'Soda Coin',
            },
        });
    }
    /**
     * @method
     * @name coinone#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.coinone.co.kr/reference/currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const response = await this.v2PublicGetCurrencies(params);
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "server_time": 1701054555578,
        //         "currencies": [
        //           {
        //             "name": "Polygon",
        //             "symbol": "MATIC",
        //             "deposit_status": "normal",
        //             "withdraw_status": "normal",
        //             "deposit_confirm_count": 150,
        //             "max_precision": 8,
        //             "deposit_fee": "0.0",
        //             "withdrawal_min_amount": "1.0",
        //             "withdrawal_fee": "3.0"
        //           }
        //         ]
        //     }
        //
        const result = {};
        const currencies = this.safeList(response, 'currencies', []);
        for (let i = 0; i < currencies.length; i++) {
            const entry = currencies[i];
            const id = this.safeString(entry, 'symbol');
            const name = this.safeString(entry, 'name');
            const code = this.safeCurrencyCode(id);
            const withdrawStatus = this.safeString(entry, 'withdraw_status', '');
            const depositStatus = this.safeString(entry, 'deposit_status', '');
            const isWithdrawEnabled = withdrawStatus === 'normal';
            const isDepositEnabled = depositStatus === 'normal';
            result[code] = {
                'id': id,
                'code': code,
                'info': entry,
                'name': name,
                'active': isWithdrawEnabled && isDepositEnabled,
                'deposit': isDepositEnabled,
                'withdraw': isWithdrawEnabled,
                'fee': this.safeNumber(entry, 'withdrawal_fee'),
                'precision': this.parseNumber(this.parsePrecision(this.safeString(entry, 'max_precision'))),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber(entry, 'withdrawal_min_amount'),
                        'max': undefined,
                    },
                },
                'networks': {},
            };
        }
        return result;
    }
    /**
     * @method
     * @name coinone#fetchMarkets
     * @description retrieves data on all markets for coinone
     * @see https://docs.coinone.co.kr/v1.0/reference/tickers
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const request = {
            'quote_currency': 'KRW',
        };
        const response = await this.v2PublicGetTickerNewQuoteCurrency(request);
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "server_time": 1701067923060,
        //         "tickers": [
        //             {
        //                 "quote_currency": "krw",
        //                 "target_currency": "stg",
        //                 "timestamp": 1701067920001,
        //                 "high": "667.5",
        //                 "low": "667.5",
        //                 "first": "667.5",
        //                 "last": "667.5",
        //                 "quote_volume": "0.0",
        //                 "target_volume": "0.0",
        //                 "best_asks": [
        //                     {
        //                         "price": "777.0",
        //                         "qty": "73.9098"
        //                     }
        //                 ],
        //                 "best_bids": [
        //                     {
        //                         "price": "690.8",
        //                         "qty": "40.7768"
        //                     }
        //                 ],
        //                 "id": "1701067920001001"
        //             }
        //         ]
        //     }
        //
        const tickers = this.safeList(response, 'tickers', []);
        const result = [];
        for (let i = 0; i < tickers.length; i++) {
            const entry = this.safeValue(tickers, i);
            const id = this.safeString(entry, 'id');
            const baseId = this.safeStringUpper(entry, 'target_currency');
            const quoteId = this.safeStringUpper(entry, 'quote_currency');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            result.push({
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
                'active': undefined,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber('1e-4'),
                    'price': this.parseNumber('1e-4'),
                    'cost': this.parseNumber('1e-8'),
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
                'created': undefined,
                'info': entry,
            });
        }
        return result;
    }
    parseBalance(response) {
        const result = { 'info': response };
        const balances = this.omit(response, [
            'errorCode',
            'result',
            'normalWallets',
        ]);
        const currencyIds = Object.keys(balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const balance = balances[currencyId];
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(balance, 'avail');
            account['total'] = this.safeString(balance, 'balance');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name coinone#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.coinone.co.kr/v1.0/reference/v21
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.v2PrivatePostAccountBalance(params);
        return this.parseBalance(response);
    }
    /**
     * @method
     * @name coinone#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.coinone.co.kr/v1.0/reference/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'quote_currency': market['quote'],
            'target_currency': market['base'],
        };
        if (limit !== undefined) {
            request['size'] = limit; // only support 5, 10, 15, 16
        }
        const response = await this.v2PublicGetOrderbookQuoteCurrencyTargetCurrency(this.extend(request, params));
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "timestamp": 1701071108673,
        //         "id": "1701071108673001",
        //         "quote_currency": "KRW",
        //         "target_currency": "BTC",
        //         "order_book_unit": "0.0",
        //         "bids": [
        //             {
        //                 "price": "50048000",
        //                 "qty": "0.01080229"
        //             }
        //         ],
        //         "asks": [
        //             {
        //                 "price": "50058000",
        //                 "qty": "0.00272592"
        //             }
        //         ]
        //     }
        //
        const timestamp = this.safeInteger(response, 'timestamp');
        return this.parseOrderBook(response, market['symbol'], timestamp, 'bids', 'asks', 'price', 'qty');
    }
    /**
     * @method
     * @name coinone#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.coinone.co.kr/v1.0/reference/tickers
     * @see https://docs.coinone.co.kr/v1.0/reference/ticker
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const request = {
            'quote_currency': 'KRW',
        };
        let market = undefined;
        let response = undefined;
        if (symbols !== undefined) {
            const first = this.safeString(symbols, 0);
            market = this.market(first);
            request['quote_currency'] = market['quote'];
            request['target_currency'] = market['base'];
            response = await this.v2PublicGetTickerNewQuoteCurrencyTargetCurrency(this.extend(request, params));
        }
        else {
            response = await this.v2PublicGetTickerNewQuoteCurrency(this.extend(request, params));
        }
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "server_time": 1701073358487,
        //         "tickers": [
        //             {
        //                 "quote_currency": "krw",
        //                 "target_currency": "btc",
        //                 "timestamp": 1701073357818,
        //                 "high": "50543000.0",
        //                 "low": "49945000.0",
        //                 "first": "50487000.0",
        //                 "last": "50062000.0",
        //                 "quote_volume": "11349804285.3859",
        //                 "target_volume": "226.07268994",
        //                 "best_asks": [
        //                     {
        //                         "price": "50081000.0",
        //                         "qty": "0.18471358"
        //                     }
        //                 ],
        //                 "best_bids": [
        //                     {
        //                         "price": "50062000.0",
        //                         "qty": "0.04213455"
        //                     }
        //                 ],
        //                 "id": "1701073357818001"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'tickers', []);
        return this.parseTickers(data, symbols);
    }
    /**
     * @method
     * @name coinone#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.coinone.co.kr/v1.0/reference/ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'quote_currency': market['quote'],
            'target_currency': market['base'],
        };
        const response = await this.v2PublicGetTickerNewQuoteCurrencyTargetCurrency(this.extend(request, params));
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "server_time": 1701073358487,
        //         "tickers": [
        //             {
        //                 "quote_currency": "krw",
        //                 "target_currency": "btc",
        //                 "timestamp": 1701073357818,
        //                 "high": "50543000.0",
        //                 "low": "49945000.0",
        //                 "first": "50487000.0",
        //                 "last": "50062000.0",
        //                 "quote_volume": "11349804285.3859",
        //                 "target_volume": "226.07268994",
        //                 "best_asks": [
        //                     {
        //                         "price": "50081000.0",
        //                         "qty": "0.18471358"
        //                     }
        //                 ],
        //                 "best_bids": [
        //                     {
        //                         "price": "50062000.0",
        //                         "qty": "0.04213455"
        //                     }
        //                 ],
        //                 "id": "1701073357818001"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'tickers', []);
        const ticker = this.safeDict(data, 0, {});
        return this.parseTicker(ticker, market);
    }
    parseTicker(ticker, market = undefined) {
        //
        //     {
        //         "quote_currency": "krw",
        //         "target_currency": "btc",
        //         "timestamp": 1701073357818,
        //         "high": "50543000.0",
        //         "low": "49945000.0",
        //         "first": "50487000.0",
        //         "last": "50062000.0",
        //         "quote_volume": "11349804285.3859",
        //         "target_volume": "226.07268994",
        //         "best_asks": [
        //             {
        //                 "price": "50081000.0",
        //                 "qty": "0.18471358"
        //             }
        //         ],
        //         "best_bids": [
        //             {
        //                 "price": "50062000.0",
        //                 "qty": "0.04213455"
        //             }
        //         ],
        //         "id": "1701073357818001"
        //     }
        //
        const timestamp = this.safeInteger(ticker, 'timestamp');
        const last = this.safeString(ticker, 'last');
        const asks = this.safeList(ticker, 'best_asks', []);
        const bids = this.safeList(ticker, 'best_bids', []);
        const baseId = this.safeString(ticker, 'target_currency');
        const quoteId = this.safeString(ticker, 'quote_currency');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        return this.safeTicker({
            'symbol': base + '/' + quote,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'high'),
            'low': this.safeString(ticker, 'low'),
            'bid': this.safeString(bids, 'price'),
            'bidVolume': this.safeString(bids, 'qty'),
            'ask': this.safeString(asks, 'price'),
            'askVolume': this.safeString(asks, 'qty'),
            'vwap': undefined,
            'open': this.safeString(ticker, 'first'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'target_volume'),
            'quoteVolume': this.safeString(ticker, 'quote_volume'),
            'info': ticker,
        }, market);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "id": "1701075265708001",
        //         "timestamp": 1701075265708,
        //         "price": "50020000",
        //         "qty": "0.00155177",
        //         "is_seller_maker": false
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "timestamp": "1416561032",
        //         "price": "419000.0",
        //         "type": "bid",
        //         "qty": "0.001",
        //         "feeRate": "-0.0015",
        //         "fee": "-0.0000015",
        //         "orderId": "E84A1AC2-8088-4FA0-B093-A3BCDB9B3C85"
        //     }
        //
        const timestamp = this.safeInteger(trade, 'timestamp');
        market = this.safeMarket(undefined, market);
        const isSellerMaker = this.safeBool(trade, 'is_seller_maker');
        let side = undefined;
        if (isSellerMaker !== undefined) {
            side = isSellerMaker ? 'sell' : 'buy';
        }
        const priceString = this.safeString(trade, 'price');
        const amountString = this.safeString(trade, 'qty');
        const orderId = this.safeString(trade, 'orderId');
        let feeCostString = this.safeString(trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            feeCostString = Precise["default"].stringAbs(feeCostString);
            let feeRateString = this.safeString(trade, 'feeRate');
            feeRateString = Precise["default"].stringAbs(feeRateString);
            const feeCurrencyCode = (side === 'sell') ? market['quote'] : market['base'];
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
                'rate': feeRateString,
            };
        }
        return this.safeTrade({
            'id': this.safeString(trade, 'id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'order': orderId,
            'symbol': market['symbol'],
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
     * @name coinone#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.coinone.co.kr/v1.0/reference/recent-completed-orders
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
            'quote_currency': market['quote'],
            'target_currency': market['base'],
        };
        if (limit !== undefined) {
            request['size'] = Math.min(limit, 200);
        }
        const response = await this.v2PublicGetTradesQuoteCurrencyTargetCurrency(this.extend(request, params));
        //
        //     {
        //         "result": "success",
        //         "error_code": "0",
        //         "server_time": 1701075315771,
        //         "quote_currency": "KRW",
        //         "target_currency": "BTC",
        //         "transactions": [
        //             {
        //                 "id": "1701075265708001",
        //                 "timestamp": 1701075265708,
        //                 "price": "50020000",
        //                 "qty": "0.00155177",
        //                 "is_seller_maker": false
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'transactions', []);
        return this.parseTrades(data, market, since, limit);
    }
    /**
     * @method
     * @name coinone#createOrder
     * @description create a trade order
     * @see https://doc.coinone.co.kr/#tag/Order-V2/operation/v2_order_limit_buy
     * @see https://doc.coinone.co.kr/#tag/Order-V2/operation/v2_order_limit_sell
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type must be 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            throw new errors.ExchangeError(this.id + ' createOrder() allows limit orders only');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'price': price,
            'currency': market['id'],
            'qty': amount,
        };
        const method = 'privatePostOrder' + this.capitalize(type) + this.capitalize(side);
        const response = await this[method](this.extend(request, params));
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "orderId": "8a82c561-40b4-4cb3-9bc0-9ac9ffc1d63b"
        //     }
        //
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name coinone#fetchOrder
     * @description fetches information on an order made by the user
     * @param {string} id order id
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
            'order_id': id,
            'currency': market['id'],
        };
        const response = await this.v2PrivatePostOrderQueryOrder(this.extend(request, params));
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "orderId": "0e3019f2-1e4d-11e9-9ec7-00e04c3600d7",
        //         "baseCurrency": "KRW",
        //         "targetCurrency": "BTC",
        //         "price": "10011000.0",
        //         "originalQty": "3.0",
        //         "executedQty": "0.62",
        //         "canceledQty": "1.125",
        //         "remainQty": "1.255",
        //         "status": "partially_filled",
        //         "side": "bid",
        //         "orderedAt": 1499340941,
        //         "updatedAt": 1499341142,
        //         "feeRate": "0.002",
        //         "fee": "0.00124",
        //         "averageExecutedPrice": "10011000.0"
        //     }
        //
        return this.parseOrder(response, market);
    }
    parseOrderStatus(status) {
        const statuses = {
            'live': 'open',
            'partially_filled': 'open',
            'partially_canceled': 'open',
            'filled': 'closed',
            'canceled': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "orderId": "8a82c561-40b4-4cb3-9bc0-9ac9ffc1d63b"
        //     }
        //
        // fetchOrder
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "orderId": "0e3019f2-1e4d-11e9-9ec7-00e04c3600d7",
        //         "baseCurrency": "KRW",
        //         "targetCurrency": "BTC",
        //         "price": "10011000.0",
        //         "originalQty": "3.0",
        //         "executedQty": "0.62",
        //         "canceledQty": "1.125",
        //         "remainQty": "1.255",
        //         "status": "partially_filled",
        //         "side": "bid",
        //         "orderedAt": 1499340941,
        //         "updatedAt": 1499341142,
        //         "feeRate": "0.002",
        //         "fee": "0.00124",
        //         "averageExecutedPrice": "10011000.0"
        //     }
        //
        // fetchOpenOrders
        //
        //     {
        //         "index": "0",
        //         "orderId": "68665943-1eb5-4e4b-9d76-845fc54f5489",
        //         "timestamp": "1449037367",
        //         "price": "444000.0",
        //         "qty": "0.3456",
        //         "type": "ask",
        //         "feeRate": "-0.0015"
        //     }
        //
        const id = this.safeString(order, 'orderId');
        const baseId = this.safeString(order, 'baseCurrency');
        const quoteId = this.safeString(order, 'targetCurrency');
        let base = undefined;
        let quote = undefined;
        if (baseId !== undefined) {
            base = this.safeCurrencyCode(baseId);
        }
        if (quoteId !== undefined) {
            quote = this.safeCurrencyCode(quoteId);
        }
        let symbol = undefined;
        if ((base !== undefined) && (quote !== undefined)) {
            symbol = base + '/' + quote;
            market = this.safeMarket(symbol, market, '/');
        }
        const timestamp = this.safeTimestamp2(order, 'timestamp', 'updatedAt');
        let side = this.safeString2(order, 'type', 'side');
        if (side === 'ask') {
            side = 'sell';
        }
        else if (side === 'bid') {
            side = 'buy';
        }
        const remainingString = this.safeString(order, 'remainQty');
        const amountString = this.safeString2(order, 'originalQty', 'qty');
        let status = this.safeString(order, 'status');
        // https://github.com/ccxt/ccxt/pull/7067
        if (status === 'live') {
            if ((remainingString !== undefined) && (amountString !== undefined)) {
                const isLessThan = Precise["default"].stringLt(remainingString, amountString);
                if (isLessThan) {
                    status = 'canceled';
                }
            }
        }
        status = this.parseOrderStatus(status);
        let fee = undefined;
        const feeCostString = this.safeString(order, 'fee');
        if (feeCostString !== undefined) {
            const feeCurrencyCode = (side === 'sell') ? quote : base;
            fee = {
                'cost': feeCostString,
                'rate': this.safeString(order, 'feeRate'),
                'currency': feeCurrencyCode,
            };
        }
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': this.safeString(order, 'price'),
            'triggerPrice': undefined,
            'cost': undefined,
            'average': this.safeString(order, 'averageExecutedPrice'),
            'amount': amountString,
            'filled': this.safeString(order, 'executedQty'),
            'remaining': remainingString,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }
    /**
     * @method
     * @name coinone#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // The returned amount might not be same as the ordered amount. If an order is partially filled, the returned amount means the remaining amount.
        // For the same reason, the returned amount and remaining are always same, and the returned filled and cost are always zero.
        if (symbol === undefined) {
            throw new errors.ExchangeError(this.id + ' fetchOpenOrders() allows fetching closed orders with a specific symbol');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'currency': market['id'],
        };
        const response = await this.privatePostOrderLimitOrders(this.extend(request, params));
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "limitOrders": [
        //             {
        //                 "index": "0",
        //                 "orderId": "68665943-1eb5-4e4b-9d76-845fc54f5489",
        //                 "timestamp": "1449037367",
        //                 "price": "444000.0",
        //                 "qty": "0.3456",
        //                 "type": "ask",
        //                 "feeRate": "-0.0015"
        //             }
        //         ]
        //     }
        //
        const limitOrders = this.safeList(response, 'limitOrders', []);
        return this.parseOrders(limitOrders, market, since, limit);
    }
    /**
     * @method
     * @name coinone#fetchMyTrades
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'currency': market['id'],
        };
        const response = await this.v2PrivatePostOrderCompleteOrders(this.extend(request, params));
        //
        // despite the name of the endpoint it returns trades which may have a duplicate orderId
        // https://github.com/ccxt/ccxt/pull/7067
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "completeOrders": [
        //             {
        //                 "timestamp": "1416561032",
        //                 "price": "419000.0",
        //                 "type": "bid",
        //                 "qty": "0.001",
        //                 "feeRate": "-0.0015",
        //                 "fee": "-0.0000015",
        //                 "orderId": "E84A1AC2-8088-4FA0-B093-A3BCDB9B3C85"
        //             }
        //         ]
        //     }
        //
        const completeOrders = this.safeList(response, 'completeOrders', []);
        return this.parseTrades(completeOrders, market, since, limit);
    }
    /**
     * @method
     * @name coinone#cancelOrder
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            // eslint-disable-next-line quotes
            throw new errors.ArgumentsRequired(this.id + " cancelOrder() requires a symbol argument. To cancel the order, pass a symbol argument and {'price': 12345, 'qty': 1.2345, 'is_ask': 0} in the params argument of cancelOrder.");
        }
        const price = this.safeNumber(params, 'price');
        const qty = this.safeNumber(params, 'qty');
        const isAsk = this.safeInteger(params, 'is_ask');
        if ((price === undefined) || (qty === undefined) || (isAsk === undefined)) {
            // eslint-disable-next-line quotes
            throw new errors.ArgumentsRequired(this.id + " cancelOrder() requires {'price': 12345, 'qty': 1.2345, 'is_ask': 0} in the params argument.");
        }
        await this.loadMarkets();
        const request = {
            'order_id': id,
            'price': price,
            'qty': qty,
            'is_ask': isAsk,
            'currency': this.marketId(symbol),
        };
        const response = await this.v2PrivatePostOrderCancel(this.extend(request, params));
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0"
        //     }
        //
        return this.safeOrder(response);
    }
    /**
     * @method
     * @name coinone#fetchDepositAddresses
     * @description fetch deposit addresses for multiple currencies and chain types
     * @param {string[]|undefined} codes list of unified currency codes, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddresses(codes = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.v2PrivatePostAccountDepositAddress(params);
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "walletAddress": {
        //             "matic": null,
        //             "btc": "mnobqu4i6qMCJWDpf5UimRmr8JCvZ8FLcN",
        //             "xrp": null,
        //             "xrp_tag": "-1",
        //             "kava": null,
        //             "kava_memo": null,
        //         }
        //     }
        //
        const walletAddress = this.safeDict(response, 'walletAddress', {});
        const keys = Object.keys(walletAddress);
        const result = {};
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = walletAddress[key];
            if ((!value) || (value === '-1')) {
                continue;
            }
            const parts = key.split('_');
            const currencyId = this.safeValue(parts, 0);
            const secondPart = this.safeValue(parts, 1);
            const code = this.safeCurrencyCode(currencyId);
            let depositAddress = this.safeValue(result, code);
            if (depositAddress === undefined) {
                depositAddress = {
                    'info': value,
                    'currency': code,
                    'network': undefined,
                    'address': undefined,
                    'tag': undefined,
                };
            }
            const address = this.safeString(depositAddress, 'address', value);
            this.checkAddress(address);
            depositAddress['address'] = address;
            depositAddress['info'] = address;
            if ((secondPart === 'tag' || secondPart === 'memo')) {
                depositAddress['tag'] = value;
                depositAddress['info'] = [address, value];
            }
            result[code] = depositAddress;
        }
        return result;
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.implodeParams(path, params);
        const query = this.omit(params, this.extractParams(path));
        let url = this.urls['api']['rest'] + '/';
        if (api === 'v2Public') {
            url = this.urls['api']['v2Public'] + '/';
            api = 'public';
        }
        else if (api === 'v2Private') {
            url = this.urls['api']['v2Private'] + '/';
        }
        else if (api === 'v2_1Private') {
            url = this.urls['api']['v2_1Private'] + '/';
        }
        if (api === 'public') {
            url += request;
            if (Object.keys(query).length) {
                url += '?' + this.urlencode(query);
            }
        }
        else {
            this.checkRequiredCredentials();
            url += request;
            const nonce = this.nonce().toString();
            const json = this.json(this.extend({
                'access_token': this.apiKey,
                'nonce': nonce,
            }, params));
            const payload = this.stringToBase64(json);
            body = payload;
            const secret = this.secret.toUpperCase();
            const signature = this.hmac(this.encode(payload), this.encode(secret), sha512.sha512);
            headers = {
                'Content-Type': 'application/json',
                'X-COINONE-PAYLOAD': payload,
                'X-COINONE-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //     {"result":"error","error_code":"107","error_msg":"Parameter value is wrong"}
        //     {"result":"error","error_code":"108","error_msg":"Unknown CryptoCurrency"}
        //
        const errorCode = this.safeString(response, 'error_code');
        if (errorCode !== undefined && errorCode !== '0') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException(this.exceptions, errorCode, feedback);
            throw new errors.ExchangeError(feedback); // unknown message
        }
        return undefined;
    }
}

module.exports = coinone;
