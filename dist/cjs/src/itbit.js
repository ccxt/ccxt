'use strict';

var itbit$1 = require('./abstract/itbit.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');
var sha512 = require('./static_dependencies/noble-hashes/sha512.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class itbit extends itbit$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'itbit',
            'name': 'itBit',
            'countries': ['US'],
            'rateLimit': 2000,
            'version': 'v1',
            'has': {
                'CORS': true,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createMarketOrder': false,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27822159-66153620-60ad-11e7-89e7-005f6d7f3de0.jpg',
                'api': {
                    'rest': 'https://api.itbit.com',
                },
                'www': 'https://www.itbit.com',
                'doc': [
                    'https://api.itbit.com/docs',
                    'https://www.itbit.com/api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'markets/{symbol}/ticker',
                        'markets/{symbol}/order_book',
                        'markets/{symbol}/trades',
                    ],
                },
                'private': {
                    'get': [
                        'wallets',
                        'wallets/{walletId}',
                        'wallets/{walletId}/balances/{currencyCode}',
                        'wallets/{walletId}/funding_history',
                        'wallets/{walletId}/trades',
                        'wallets/{walletId}/orders',
                        'wallets/{walletId}/orders/{id}',
                    ],
                    'post': [
                        'wallet_transfers',
                        'wallets',
                        'wallets/{walletId}/cryptocurrency_deposits',
                        'wallets/{walletId}/cryptocurrency_withdrawals',
                        'wallets/{walletId}/orders',
                        'wire_withdrawal',
                    ],
                    'delete': [
                        'wallets/{walletId}/orders/{id}',
                    ],
                },
            },
            'markets': {
                'BTC/USD': { 'id': 'XBTUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'baseId': 'XBT', 'quoteId': 'USD', 'type': 'spot', 'spot': true },
                'BTC/SGD': { 'id': 'XBTSGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD', 'baseId': 'XBT', 'quoteId': 'SGD', 'type': 'spot', 'spot': true },
                'BTC/EUR': { 'id': 'XBTEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR', 'baseId': 'XBT', 'quoteId': 'EUR', 'type': 'spot', 'spot': true },
                'ETH/USD': { 'id': 'ETHUSD', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD', 'baseId': 'ETH', 'quoteId': 'USD', 'type': 'spot', 'spot': true },
                'ETH/EUR': { 'id': 'ETHEUR', 'symbol': 'ETH/EUR', 'base': 'ETH', 'quote': 'EUR', 'baseId': 'ETH', 'quoteId': 'EUR', 'type': 'spot', 'spot': true },
                'ETH/SGD': { 'id': 'ETHSGD', 'symbol': 'ETH/SGD', 'base': 'ETH', 'quote': 'SGD', 'baseId': 'ETH', 'quoteId': 'SGD', 'type': 'spot', 'spot': true },
                'PAXGUSD': { 'id': 'PAXGUSD', 'symbol': 'PAXG/USD', 'base': 'PAXG', 'quote': 'USD', 'baseId': 'PAXG', 'quoteId': 'USD', 'type': 'spot', 'spot': true },
                'BCHUSD': { 'id': 'BCHUSD', 'symbol': 'BCH/USD', 'base': 'BCH', 'quote': 'USD', 'baseId': 'BCH', 'quoteId': 'USD', 'type': 'spot', 'spot': true },
                'LTCUSD': { 'id': 'LTCUSD', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD', 'baseId': 'LTC', 'quoteId': 'USD', 'type': 'spot', 'spot': true },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber('-0.0003'),
                    'taker': this.parseNumber('0.0035'),
                },
            },
            'commonCurrencies': {
                'XBT': 'BTC',
            },
            'precisionMode': number.TICK_SIZE,
        });
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name itbit#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the itbit api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const orderbook = await this.publicGetMarketsSymbolOrderBook(this.extend(request, params));
        return this.parseOrderBook(orderbook, market['symbol']);
    }
    parseTicker(ticker, market = undefined) {
        //
        // {
        //     "pair":"XBTUSD",
        //     "bid":"36734.50",
        //     "bidAmt":"0.01000000",
        //     "ask":"36734.75",
        //     "askAmt":"0.30750480",
        //     "lastPrice":"36721.75",
        //     "lastAmt":"0.00070461",
        //     "volume24h":"275.50596346",
        //     "volumeToday":"118.19025141",
        //     "high24h":"37510.50",
        //     "low24h":"35542.75",
        //     "highToday":"37510.50",
        //     "lowToday":"36176.50",
        //     "openToday":"37156.50",
        //     "vwapToday":"37008.22463903",
        //     "vwap24h":"36580.27146808",
        //     "serverTimeUTC":"2022-01-28T14:46:32.4472864Z"
        // }
        //
        const symbol = this.safeSymbol(undefined, market);
        const serverTimeUTC = this.safeString(ticker, 'serverTimeUTC');
        if (!serverTimeUTC) {
            throw new errors.ExchangeError(this.id + ' fetchTicker() returned a bad response: ' + this.json(ticker));
        }
        const timestamp = this.parse8601(serverTimeUTC);
        const vwap = this.safeString(ticker, 'vwap24h');
        const baseVolume = this.safeString(ticker, 'volume24h');
        const quoteVolume = Precise["default"].stringMul(baseVolume, vwap);
        const last = this.safeString(ticker, 'lastPrice');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'high24h'),
            'low': this.safeString(ticker, 'low24h'),
            'bid': this.safeString(ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString(ticker, 'ask'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': this.safeString(ticker, 'openToday'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name itbit#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the itbit api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const ticker = await this.publicGetMarketsSymbolTicker(this.extend(request, params));
        //
        // {
        //     "pair":"XBTUSD",
        //     "bid":"36734.50",
        //     "bidAmt":"0.01000000",
        //     "ask":"36734.75",
        //     "askAmt":"0.30750480",
        //     "lastPrice":"36721.75",
        //     "lastAmt":"0.00070461",
        //     "volume24h":"275.50596346",
        //     "volumeToday":"118.19025141",
        //     "high24h":"37510.50",
        //     "low24h":"35542.75",
        //     "highToday":"37510.50",
        //     "lowToday":"36176.50",
        //     "openToday":"37156.50",
        //     "vwapToday":"37008.22463903",
        //     "vwap24h":"36580.27146808",
        //     "serverTimeUTC":"2022-01-28T14:46:32.4472864Z"
        // }
        //
        return this.parseTicker(ticker, market);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         timestamp: "2015-05-22T17:45:34.7570000Z",
        //         matchNumber: "5CR1JEUBBM8J",
        //         price: "351.45000000",
        //         amount: "0.00010000"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "orderId": "248ffda4-83a0-4033-a5bb-8929d523f59f",
        //         "timestamp": "2015-05-11T14:48:01.9870000Z",
        //         "instrument": "XBTUSD",
        //         "direction": "buy",                      // buy or sell
        //         "currency1": "XBT",                      // base currency
        //         "currency1Amount": "0.00010000",         // order amount in base currency
        //         "currency2": "USD",                      // quote currency
        //         "currency2Amount": "0.0250530000000000", // order cost in quote currency
        //         "rate": "250.53000000",
        //         "commissionPaid": "0.00000000",   // net trade fee paid after using any available rebate balance
        //         "commissionCurrency": "USD",
        //         "rebatesApplied": "-0.000125265", // negative values represent amount of rebate balance used for trades removing liquidity from order book; positive values represent amount of rebate balance earned from trades adding liquidity to order book
        //         "rebateCurrency": "USD",
        //         "executionId": "23132"
        //     }
        //
        const id = this.safeString2(trade, 'executionId', 'matchNumber');
        const timestamp = this.parse8601(this.safeString(trade, 'timestamp'));
        const side = this.safeString(trade, 'direction');
        const orderId = this.safeString(trade, 'orderId');
        let feeCost = this.safeNumber(trade, 'commissionPaid');
        const feeCurrencyId = this.safeString(trade, 'commissionCurrency');
        const feeCurrency = this.safeCurrencyCode(feeCurrencyId);
        let rebatesApplied = this.safeNumber(trade, 'rebatesApplied');
        if (rebatesApplied !== undefined) {
            rebatesApplied = -rebatesApplied;
        }
        const rebateCurrencyId = this.safeString(trade, 'rebateCurrency');
        const rebateCurrency = this.safeCurrencyCode(rebateCurrencyId);
        const priceString = this.safeString2(trade, 'price', 'rate');
        const amountString = this.safeString2(trade, 'currency1Amount', 'amount');
        const price = this.parseNumber(priceString);
        const amount = this.parseNumber(amountString);
        const cost = this.parseNumber(Precise["default"].stringMul(priceString, amountString));
        let symbol = undefined;
        const marketId = this.safeString(trade, 'instrument');
        if (marketId !== undefined) {
            const baseId = this.safeString(trade, 'currency1');
            const quoteId = this.safeString(trade, 'currency2');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            symbol = base + '/' + quote;
        }
        const result = {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
        if (feeCost !== undefined) {
            if (rebatesApplied !== undefined) {
                if (feeCurrency === rebateCurrency) {
                    feeCost = this.sum(feeCost, rebatesApplied);
                    result['fee'] = {
                        'cost': feeCost,
                        'currency': feeCurrency,
                    };
                }
                else {
                    result['fees'] = [
                        {
                            'cost': feeCost,
                            'currency': feeCurrency,
                        },
                        {
                            'cost': rebatesApplied,
                            'currency': rebateCurrency,
                        },
                    ];
                }
            }
            else {
                result['fee'] = {
                    'cost': feeCost,
                    'currency': feeCurrency,
                };
            }
        }
        if (!('fee' in result)) {
            if (!('fees' in result)) {
                result['fee'] = undefined;
            }
        }
        return result;
    }
    async fetchTransactions(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name itbit#fetchTransactions
         * @description fetch history of deposits and withdrawals
         * @param {string|undefined} code not used by itbit fetchTransactions ()
         * @param {int|undefined} since not used by itbit fetchTransactions ()
         * @param {int|undefined} limit max number of transactions to return, default is undefined
         * @param {object} params extra parameters specific to the itbit api endpoint
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        const walletId = this.safeString(params, 'walletId');
        if (walletId === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchTransactions() requires a walletId parameter');
        }
        const request = {
            'walletId': walletId,
        };
        if (limit !== undefined) {
            request['perPage'] = limit; // default 50, max 50
        }
        const response = await this.privateGetWalletsWalletIdFundingHistory(this.extend(request, params));
        //     { bankName: 'USBC (usd)',
        //         withdrawalId: 94740,
        //         holdingPeriodCompletionDate: '2018-04-16T07:57:05.9606869',
        //         time: '2018-04-16T07:57:05.9600000',
        //         currency: 'USD',
        //         transactionType: 'Withdrawal',
        //         amount: '2186.72000000',
        //         walletName: 'Wallet',
        //         status: 'completed' },
        //
        //     { "time": "2018-01-02T19:52:22.4176503",
        //     "amount": "0.50000000",
        //     "status": "completed",
        //     "txnHash": "1b6fff67ed83cb9e9a38ca4976981fc047322bc088430508fe764a127d3ace95",
        //     "currency": "XBT",
        //     "walletName": "Wallet",
        //     "transactionType": "Deposit",
        //     "destinationAddress": "3AAWTH9et4e8o51YKp9qPpmujrNXKwHWNX"}
        const items = response['fundingHistory'];
        const result = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const time = this.safeString(item, 'time');
            const timestamp = this.parse8601(time);
            const currency = this.safeString(item, 'currency');
            const destinationAddress = this.safeString(item, 'destinationAddress');
            const txnHash = this.safeString(item, 'txnHash');
            const transactionType = this.safeStringLower(item, 'transactionType');
            const transactionStatus = this.safeString(item, 'status');
            const status = this.parseTransferStatus(transactionStatus);
            result.push({
                'id': this.safeString(item, 'withdrawalId'),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
                'currency': this.safeCurrencyCode(currency),
                'address': destinationAddress,
                'tag': undefined,
                'txid': txnHash,
                'type': transactionType,
                'status': status,
                'amount': this.safeNumber(item, 'amount'),
                'fee': undefined,
                'info': item,
            });
        }
        return result;
    }
    parseTransferStatus(status) {
        const options = {
            'cancelled': 'canceled',
            'completed': 'ok',
        };
        return this.safeString(options, status, 'pending');
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name itbit#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the itbit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets();
        const walletId = this.safeString(params, 'walletId');
        if (walletId === undefined) {
            throw new errors.ExchangeError(this.id + ' fetchMyTrades() requires a walletId parameter');
        }
        const request = {
            'walletId': walletId,
        };
        if (since !== undefined) {
            request['rangeStart'] = this.ymdhms(since, 'T');
        }
        if (limit !== undefined) {
            request['perPage'] = limit; // default 50, max 50
        }
        const response = await this.privateGetWalletsWalletIdTrades(this.extend(request, params));
        //
        //     {
        //         "totalNumberOfRecords": "2",
        //         "currentPageNumber": "1",
        //         "latestExecutionId": "332", // most recent execution at time of response
        //         "recordsPerPage": "50",
        //         "tradingHistory": [
        //             {
        //                 "orderId": "248ffda4-83a0-4033-a5bb-8929d523f59f",
        //                 "timestamp": "2015-05-11T14:48:01.9870000Z",
        //                 "instrument": "XBTUSD",
        //                 "direction": "buy",                      // buy or sell
        //                 "currency1": "XBT",                      // base currency
        //                 "currency1Amount": "0.00010000",         // order amount in base currency
        //                 "currency2": "USD",                      // quote currency
        //                 "currency2Amount": "0.0250530000000000", // order cost in quote currency
        //                 "rate": "250.53000000",
        //                 "commissionPaid": "0.00000000",   // net trade fee paid after using any available rebate balance
        //                 "commissionCurrency": "USD",
        //                 "rebatesApplied": "-0.000125265", // negative values represent amount of rebate balance used for trades removing liquidity from order book; positive values represent amount of rebate balance earned from trades adding liquidity to order book
        //                 "rebateCurrency": "USD",
        //                 "executionId": "23132"
        //             },
        //         ],
        //     }
        //
        const trades = this.safeValue(response, 'tradingHistory', []);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        return this.parseTrades(trades, market, since, limit);
    }
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name itbit#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the itbit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketsSymbolTrades(this.extend(request, params));
        //
        //     {
        //         count: 3,
        //         recentTrades: [
        //             {
        //                 timestamp: "2015-05-22T17:45:34.7570000Z",
        //                 matchNumber: "5CR1JEUBBM8J",
        //                 price: "351.45000000",
        //                 amount: "0.00010000"
        //             },
        //         ]
        //     }
        //
        const trades = this.safeValue(response, 'recentTrades', []);
        return this.parseTrades(trades, market, since, limit);
    }
    parseBalance(response) {
        const balances = response[0]['balances'];
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString(balance, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(balance, 'availableBalance');
            account['total'] = this.safeString(balance, 'totalBalance');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name itbit#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the itbit api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets();
        const response = await this.fetchWallets(params);
        return this.parseBalance(response);
    }
    async fetchWallets(params = {}) {
        await this.loadMarkets();
        if (!this.uid) {
            throw new errors.AuthenticationError(this.id + ' fetchWallets() requires uid API credential');
        }
        const request = {
            'userId': this.uid,
        };
        return await this.privateGetWallets(this.extend(request, params));
    }
    async fetchWallet(walletId, params = {}) {
        await this.loadMarkets();
        const request = {
            'walletId': walletId,
        };
        return await this.privateGetWalletsWalletId(this.extend(request, params));
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name itbit#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the itbit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'status': 'open',
        };
        return await this.fetchOrders(symbol, since, limit, this.extend(request, params));
    }
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name itbit#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the itbit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'status': 'filled',
        };
        return await this.fetchOrders(symbol, since, limit, this.extend(request, params));
    }
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name itbit#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the itbit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const walletIdInParams = ('walletId' in params);
        if (!walletIdInParams) {
            throw new errors.ExchangeError(this.id + ' fetchOrders() requires a walletId parameter');
        }
        const walletId = params['walletId'];
        const request = {
            'walletId': walletId,
        };
        const response = await this.privateGetWalletsWalletIdOrders(this.extend(request, params));
        return this.parseOrders(response, market, since, limit);
    }
    parseOrderStatus(status) {
        const statuses = {
            'submitted': 'open',
            'open': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
            'rejected': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        //     {
        //         "id": "13d6af57-8b0b-41e5-af30-becf0bcc574d",
        //         "walletId": "7e037345-1288-4c39-12fe-d0f99a475a98",
        //         "side": "buy",
        //         "instrument": "XBTUSD",
        //         "type": "limit",
        //         "currency": "XBT",
        //         "amount": "2.50000000",
        //         "displayAmount": "2.50000000",
        //         "price": "650.00000000",
        //         "volumeWeightedAveragePrice": "0.00000000",
        //         "amountFilled": "0.00000000",
        //         "createdTime": "2014-02-11T17:05:15Z",
        //         "status": "submitted",
        //         "funds": null,
        //         "metadata": {},
        //         "clientOrderIdentifier": null,
        //         "postOnly": "False"
        //     }
        //
        const side = this.safeString(order, 'side');
        const type = this.safeString(order, 'type');
        const marketId = this.safeString(order, 'instrument');
        const symbol = this.safeSymbol(marketId, market);
        const datetime = this.safeString(order, 'createdTime');
        const timestamp = this.parse8601(datetime);
        const amount = this.safeString(order, 'amount');
        const filled = this.safeString(order, 'amountFilled');
        const fee = undefined;
        const price = this.safeString(order, 'price');
        const average = this.safeString(order, 'volumeWeightedAveragePrice');
        const clientOrderId = this.safeString(order, 'clientOrderIdentifier');
        const id = this.safeString(order, 'id');
        const postOnlyString = this.safeString(order, 'postOnly');
        const postOnly = (postOnlyString === 'True');
        return this.safeOrder({
            'id': id,
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'status': this.parseOrderStatus(this.safeString(order, 'status')),
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'cost': undefined,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'fee': fee,
            // 'trades': this.parseTrades (order['trades'], market),
            'trades': undefined,
        }, market);
    }
    nonce() {
        return this.milliseconds();
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name itbit#createOrder
         * @description create a trade order
         * @see https://api.itbit.com/docs#trading-new-order-post
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type must be 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the itbit api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        if (type === 'market') {
            throw new errors.ExchangeError(this.id + ' createOrder() allows limit orders only');
        }
        const walletIdInParams = ('walletId' in params);
        if (!walletIdInParams) {
            throw new errors.ExchangeError(this.id + ' createOrder() requires a walletId parameter');
        }
        amount = amount.toString();
        price = price.toString();
        const market = this.market(symbol);
        const request = {
            'side': side,
            'type': type,
            'currency': market['id'].replace(market['quote'], ''),
            'amount': amount,
            'display': amount,
            'price': price,
            'instrument': market['id'],
        };
        const response = await this.privatePostWalletsWalletIdOrders(this.extend(request, params));
        return this.safeOrder({
            'info': response,
            'id': response['id'],
        }, market);
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name itbit#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol not used by itbit fetchOrder
         * @param {object} params extra parameters specific to the itbit api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const walletIdInParams = ('walletId' in params);
        if (!walletIdInParams) {
            throw new errors.ExchangeError(this.id + ' fetchOrder() requires a walletId parameter');
        }
        const request = {
            'id': id,
        };
        const response = await this.privateGetWalletsWalletIdOrdersId(this.extend(request, params));
        return this.parseOrder(response);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name itbit#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the itbit api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const walletIdInParams = ('walletId' in params);
        if (!walletIdInParams) {
            throw new errors.ExchangeError(this.id + ' cancelOrder() requires a walletId parameter');
        }
        const request = {
            'id': id,
        };
        return await this.privateDeleteWalletsWalletIdOrdersId(this.extend(request, params));
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['rest'] + '/' + this.version + '/' + this.implodeParams(path, params);
        const query = this.omit(params, this.extractParams(path));
        if (method === 'GET' && Object.keys(query).length) {
            url += '?' + this.urlencode(query);
        }
        if (method === 'POST' && Object.keys(query).length) {
            body = this.json(query);
        }
        if (api === 'private') {
            this.checkRequiredCredentials();
            const nonce = this.nonce().toString();
            const timestamp = nonce;
            const authBody = (method === 'POST') ? body : '';
            const auth = [method, url, authBody, nonce, timestamp];
            const message = nonce + this.json(auth); // .replace ('\\/', '/');
            const hash = this.hash(this.encode(message), sha256.sha256, 'binary');
            const binaryUrl = this.encode(url);
            const binhash = this.binaryConcat(binaryUrl, hash);
            const signature = this.hmac(binhash, this.encode(this.secret), sha512.sha512, 'base64');
            headers = {
                'Authorization': this.apiKey + ':' + signature,
                'Content-Type': 'application/json',
                'X-Auth-Timestamp': timestamp,
                'X-Auth-Nonce': nonce,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const code = this.safeString(response, 'code');
        if (code !== undefined) {
            throw new errors.ExchangeError(this.id + ' ' + this.json(response));
        }
        return undefined;
    }
}

module.exports = itbit;
