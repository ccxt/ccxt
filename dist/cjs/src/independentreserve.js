'use strict';

var independentreserve$1 = require('./abstract/independentreserve.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');
var errors = require('./base/errors.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class independentreserve
 * @augments Exchange
 */
class independentreserve extends independentreserve$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'independentreserve',
            'name': 'Independent Reserve',
            'countries': ['AU', 'NZ'],
            'rateLimit': 1000,
            'pro': true,
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
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
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
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87182090-1e9e9080-c2ec-11ea-8e49-563db9a38f37.jpg',
                'api': {
                    'public': 'https://api.independentreserve.com/Public',
                    'private': 'https://api.independentreserve.com/Private',
                },
                'www': 'https://www.independentreserve.com',
                'doc': 'https://www.independentreserve.com/API',
            },
            'api': {
                'public': {
                    'get': [
                        'GetValidPrimaryCurrencyCodes',
                        'GetValidSecondaryCurrencyCodes',
                        'GetValidLimitOrderTypes',
                        'GetValidMarketOrderTypes',
                        'GetValidOrderTypes',
                        'GetValidTransactionTypes',
                        'GetMarketSummary',
                        'GetOrderBook',
                        'GetAllOrders',
                        'GetTradeHistorySummary',
                        'GetRecentTrades',
                        'GetFxRates',
                        'GetOrderMinimumVolumes',
                        'GetCryptoWithdrawalFees',
                    ],
                },
                'private': {
                    'post': [
                        'GetOpenOrders',
                        'GetClosedOrders',
                        'GetClosedFilledOrders',
                        'GetOrderDetails',
                        'GetAccounts',
                        'GetTransactions',
                        'GetFiatBankAccounts',
                        'GetDigitalCurrencyDepositAddress',
                        'GetDigitalCurrencyDepositAddresses',
                        'GetTrades',
                        'GetBrokerageFees',
                        'GetDigitalCurrencyWithdrawal',
                        'PlaceLimitOrder',
                        'PlaceMarketOrder',
                        'CancelOrder',
                        'SynchDigitalCurrencyDepositAddressWithBlockchain',
                        'RequestFiatWithdrawal',
                        'WithdrawFiatCurrency',
                        'WithdrawDigitalCurrency',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': this.parseNumber('0.005'),
                    'maker': this.parseNumber('0.005'),
                    'percentage': true,
                    'tierBased': false,
                },
            },
            'commonCurrencies': {
                'PLA': 'PlayChip',
            },
            'precisionMode': number.TICK_SIZE,
        });
    }
    /**
     * @method
     * @name independentreserve#fetchMarkets
     * @description retrieves data on all markets for independentreserve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const baseCurrenciesPromise = this.publicGetGetValidPrimaryCurrencyCodes(params);
        //     ['Xbt', 'Eth', 'Usdt', ...]
        const quoteCurrenciesPromise = this.publicGetGetValidSecondaryCurrencyCodes(params);
        //     ['Aud', 'Usd', 'Nzd', 'Sgd']
        const limitsPromise = this.publicGetGetOrderMinimumVolumes(params);
        const [baseCurrencies, quoteCurrencies, limits] = await Promise.all([baseCurrenciesPromise, quoteCurrenciesPromise, limitsPromise]);
        //
        //     {
        //         "Xbt": 0.0001,
        //         "Eth": 0.001,
        //         "Ltc": 0.01,
        //         "Xrp": 1.0,
        //     }
        //
        const result = [];
        for (let i = 0; i < baseCurrencies.length; i++) {
            const baseId = baseCurrencies[i];
            const base = this.safeCurrencyCode(baseId);
            const minAmount = this.safeNumber(limits, baseId);
            for (let j = 0; j < quoteCurrencies.length; j++) {
                const quoteId = quoteCurrencies[j];
                const quote = this.safeCurrencyCode(quoteId);
                const id = baseId + '/' + quoteId;
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
                        'amount': undefined,
                        'price': undefined,
                    },
                    'limits': {
                        'leverage': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'amount': {
                            'min': minAmount,
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
                    'info': id,
                });
            }
        }
        return result;
    }
    parseBalance(response) {
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString(balance, 'CurrencyCode');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(balance, 'AvailableBalance');
            account['total'] = this.safeString(balance, 'TotalBalance');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name independentreserve#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.privatePostGetAccounts(params);
        return this.parseBalance(response);
    }
    /**
     * @method
     * @name independentreserve#fetchOrderBook
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
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
        };
        const response = await this.publicGetGetOrderBook(this.extend(request, params));
        const timestamp = this.parse8601(this.safeString(response, 'CreatedTimestampUtc'));
        return this.parseOrderBook(response, market['symbol'], timestamp, 'BuyOrders', 'SellOrders', 'Price', 'Volume');
    }
    parseTicker(ticker, market = undefined) {
        // {
        //     "DayHighestPrice":43489.49,
        //     "DayLowestPrice":41998.32,
        //     "DayAvgPrice":42743.9,
        //     "DayVolumeXbt":44.54515625000,
        //     "DayVolumeXbtInSecondaryCurrrency":0.12209818,
        //     "CurrentLowestOfferPrice":43619.64,
        //     "CurrentHighestBidPrice":43153.58,
        //     "LastPrice":43378.43,
        //     "PrimaryCurrencyCode":"Xbt",
        //     "SecondaryCurrencyCode":"Usd",
        //     "CreatedTimestampUtc":"2022-01-14T22:52:29.5029223Z"
        // }
        const timestamp = this.parse8601(this.safeString(ticker, 'CreatedTimestampUtc'));
        const baseId = this.safeString(ticker, 'PrimaryCurrencyCode');
        const quoteId = this.safeString(ticker, 'SecondaryCurrencyCode');
        let defaultMarketId = undefined;
        if ((baseId !== undefined) && (quoteId !== undefined)) {
            defaultMarketId = baseId + '/' + quoteId;
        }
        market = this.safeMarket(defaultMarketId, market, '/');
        const symbol = market['symbol'];
        const last = this.safeString(ticker, 'LastPrice');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'DayHighestPrice'),
            'low': this.safeString(ticker, 'DayLowestPrice'),
            'bid': this.safeString(ticker, 'CurrentHighestBidPrice'),
            'bidVolume': undefined,
            'ask': this.safeString(ticker, 'CurrentLowestOfferPrice'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeString(ticker, 'DayAvgPrice'),
            'baseVolume': this.safeString(ticker, 'DayVolumeXbtInSecondaryCurrrency'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name independentreserve#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
        };
        const response = await this.publicGetGetMarketSummary(this.extend(request, params));
        // {
        //     "DayHighestPrice":43489.49,
        //     "DayLowestPrice":41998.32,
        //     "DayAvgPrice":42743.9,
        //     "DayVolumeXbt":44.54515625000,
        //     "DayVolumeXbtInSecondaryCurrrency":0.12209818,
        //     "CurrentLowestOfferPrice":43619.64,
        //     "CurrentHighestBidPrice":43153.58,
        //     "LastPrice":43378.43,
        //     "PrimaryCurrencyCode":"Xbt",
        //     "SecondaryCurrencyCode":"Usd",
        //     "CreatedTimestampUtc":"2022-01-14T22:52:29.5029223Z"
        // }
        return this.parseTicker(response, market);
    }
    parseOrder(order, market = undefined) {
        //
        // fetchOrder
        //
        //     {
        //         "OrderGuid": "c7347e4c-b865-4c94-8f74-d934d4b0b177",
        //         "CreatedTimestampUtc": "2014-09-23T12:39:34.3817763Z",
        //         "Type": "MarketBid",
        //         "VolumeOrdered": 5.0,
        //         "VolumeFilled": 5.0,
        //         "Price": null,
        //         "AvgPrice": 100.0,
        //         "ReservedAmount": 0.0,
        //         "Status": "Filled",
        //         "PrimaryCurrencyCode": "Xbt",
        //         "SecondaryCurrencyCode": "Usd"
        //     }
        //
        // fetchOpenOrders & fetchClosedOrders
        //
        //     {
        //         "OrderGuid": "b8f7ad89-e4e4-4dfe-9ea3-514d38b5edb3",
        //         "CreatedTimestampUtc": "2020-09-08T03:04:18.616367Z",
        //         "OrderType": "LimitOffer",
        //         "Volume": 0.0005,
        //         "Outstanding": 0.0005,
        //         "Price": 113885.83,
        //         "AvgPrice": 113885.83,
        //         "Value": 56.94,
        //         "Status": "Open",
        //         "PrimaryCurrencyCode": "Xbt",
        //         "SecondaryCurrencyCode": "Usd",
        //         "FeePercent": 0.005,
        //     }
        //
        // cancelOrder
        //
        //    {
        //        "AvgPrice": 455.48,
        //        "CreatedTimestampUtc": "2022-08-05T06:42:11.3032208Z",
        //        "OrderGuid": "719c495c-a39e-4884-93ac-280b37245037",
        //        "Price": 485.76,
        //        "PrimaryCurrencyCode": "Xbt",
        //        "ReservedAmount": 0.358,
        //        "SecondaryCurrencyCode": "Usd",
        //        "Status": "Cancelled",
        //        "Type": "LimitOffer",
        //        "VolumeFilled": 0,
        //        "VolumeOrdered": 0.358
        //    }
        let symbol = undefined;
        const baseId = this.safeString(order, 'PrimaryCurrencyCode');
        const quoteId = this.safeString(order, 'SecondaryCurrencyCode');
        let base = undefined;
        let quote = undefined;
        if ((baseId !== undefined) && (quoteId !== undefined)) {
            base = this.safeCurrencyCode(baseId);
            quote = this.safeCurrencyCode(quoteId);
            symbol = base + '/' + quote;
        }
        else if (market !== undefined) {
            symbol = market['symbol'];
            base = market['base'];
            quote = market['quote'];
        }
        let orderType = this.safeString2(order, 'Type', 'OrderType');
        let side = undefined;
        if (orderType !== undefined) {
            if (orderType.indexOf('Bid') >= 0) {
                side = 'buy';
            }
            else if (orderType.indexOf('Offer') >= 0) {
                side = 'sell';
            }
            if (orderType.indexOf('Market') >= 0) {
                orderType = 'market';
            }
            else if (orderType.indexOf('Limit') >= 0) {
                orderType = 'limit';
            }
        }
        const timestamp = this.parse8601(this.safeString(order, 'CreatedTimestampUtc'));
        const filled = this.safeString(order, 'VolumeFilled');
        const feeRate = this.safeString(order, 'FeePercent');
        let feeCost = undefined;
        if (feeRate !== undefined && filled !== undefined) {
            feeCost = Precise["default"].stringMul(feeRate, filled);
        }
        return this.safeOrder({
            'info': order,
            'id': this.safeString(order, 'OrderGuid'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': orderType,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': this.safeString(order, 'Price'),
            'triggerPrice': undefined,
            'cost': this.safeString(order, 'Value'),
            'average': this.safeString(order, 'AvgPrice'),
            'amount': this.safeString2(order, 'VolumeOrdered', 'Volume'),
            'filled': filled,
            'remaining': this.safeString(order, 'Outstanding'),
            'status': this.parseOrderStatus(this.safeString(order, 'Status')),
            'fee': {
                'rate': feeRate,
                'cost': feeCost,
                'currency': base,
            },
            'trades': undefined,
        }, market);
    }
    parseOrderStatus(status) {
        const statuses = {
            'Open': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'PartiallyFilledAndCancelled': 'canceled',
            'Cancelled': 'canceled',
            'PartiallyFilledAndExpired': 'canceled',
            'Expired': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name independentreserve#fetchOrder
     * @description fetches information on an order made by the user
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.privatePostGetOrderDetails(this.extend({
            'orderGuid': id,
        }, params));
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name independentreserve#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = this.ordered({});
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['primaryCurrencyCode'] = market['baseId'];
            request['secondaryCurrencyCode'] = market['quoteId'];
        }
        if (limit === undefined) {
            limit = 50;
        }
        request['pageIndex'] = 1;
        request['pageSize'] = limit;
        const response = await this.privatePostGetOpenOrders(this.extend(request, params));
        const data = this.safeList(response, 'Data', []);
        return this.parseOrders(data, market, since, limit);
    }
    /**
     * @method
     * @name independentreserve#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = this.ordered({});
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['primaryCurrencyCode'] = market['baseId'];
            request['secondaryCurrencyCode'] = market['quoteId'];
        }
        if (limit === undefined) {
            limit = 50;
        }
        request['pageIndex'] = 1;
        request['pageSize'] = limit;
        const response = await this.privatePostGetClosedOrders(this.extend(request, params));
        const data = this.safeList(response, 'Data', []);
        return this.parseOrders(data, market, since, limit);
    }
    /**
     * @method
     * @name independentreserve#fetchMyTrades
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = 50, params = {}) {
        await this.loadMarkets();
        const pageIndex = this.safeInteger(params, 'pageIndex', 1);
        if (limit === undefined) {
            limit = 50;
        }
        const request = this.ordered({
            'pageIndex': pageIndex,
            'pageSize': limit,
        });
        const response = await this.privatePostGetTrades(this.extend(request, params));
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        return this.parseTrades(response['Data'], market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        const timestamp = this.parse8601(trade['TradeTimestampUtc']);
        const id = this.safeString(trade, 'TradeGuid');
        const orderId = this.safeString(trade, 'OrderGuid');
        const priceString = this.safeString2(trade, 'Price', 'SecondaryCurrencyTradePrice');
        const amountString = this.safeString2(trade, 'VolumeTraded', 'PrimaryCurrencyAmount');
        const price = this.parseNumber(priceString);
        const amount = this.parseNumber(amountString);
        const cost = this.parseNumber(Precise["default"].stringMul(priceString, amountString));
        const baseId = this.safeString(trade, 'PrimaryCurrencyCode');
        const quoteId = this.safeString(trade, 'SecondaryCurrencyCode');
        let marketId = undefined;
        if ((baseId !== undefined) && (quoteId !== undefined)) {
            marketId = baseId + '/' + quoteId;
        }
        const symbol = this.safeSymbol(marketId, market, '/');
        let side = this.safeString(trade, 'OrderType');
        if (side !== undefined) {
            if (side.indexOf('Bid') >= 0) {
                side = 'buy';
            }
            else if (side.indexOf('Offer') >= 0) {
                side = 'sell';
            }
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
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        }, market);
    }
    /**
     * @method
     * @name independentreserve#fetchTrades
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
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
            'numberOfRecentTradesToRetrieve': 50, // max = 50
        };
        const response = await this.publicGetGetRecentTrades(this.extend(request, params));
        return this.parseTrades(response['Trades'], market, since, limit);
    }
    /**
     * @method
     * @name independentreserve#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees(params = {}) {
        await this.loadMarkets();
        const response = await this.privatePostGetBrokerageFees(params);
        //
        //     [
        //         {
        //             "CurrencyCode": "Xbt",
        //             "Fee": 0.005
        //         }
        //         ...
        //     ]
        //
        const fees = {};
        for (let i = 0; i < response.length; i++) {
            const fee = response[i];
            const currencyId = this.safeString(fee, 'CurrencyCode');
            const code = this.safeCurrencyCode(currencyId);
            const tradingFee = this.safeNumber(fee, 'Fee');
            fees[code] = {
                'info': fee,
                'fee': tradingFee,
            };
        }
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market(symbol);
            const fee = this.safeValue(fees, market['base'], {});
            result[symbol] = {
                'info': this.safeValue(fee, 'info'),
                'symbol': symbol,
                'maker': this.safeNumber(fee, 'fee'),
                'taker': this.safeNumber(fee, 'fee'),
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }
    /**
     * @method
     * @name independentreserve#createOrder
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let orderType = this.capitalize(type);
        orderType += (side === 'sell') ? 'Offer' : 'Bid';
        const request = this.ordered({
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
            'orderType': orderType,
        });
        let response = undefined;
        request['volume'] = amount;
        if (type === 'limit') {
            request['price'] = price;
            response = await this.privatePostPlaceLimitOrder(this.extend(request, params));
        }
        else {
            response = await this.privatePostPlaceMarketOrder(this.extend(request, params));
        }
        return this.safeOrder({
            'info': response,
            'id': response['OrderGuid'],
        }, market);
    }
    /**
     * @method
     * @name independentreserve#cancelOrder
     * @description cancels an open order
     * @see https://www.independentreserve.com/features/api#CancelOrder
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'orderGuid': id,
        };
        const response = await this.privatePostCancelOrder(this.extend(request, params));
        //
        //    {
        //        "AvgPrice": 455.48,
        //        "CreatedTimestampUtc": "2022-08-05T06:42:11.3032208Z",
        //        "OrderGuid": "719c495c-a39e-4884-93ac-280b37245037",
        //        "Price": 485.76,
        //        "PrimaryCurrencyCode": "Xbt",
        //        "ReservedAmount": 0.358,
        //        "SecondaryCurrencyCode": "Usd",
        //        "Status": "Cancelled",
        //        "Type": "LimitOffer",
        //        "VolumeFilled": 0,
        //        "VolumeOrdered": 0.358
        //    }
        //
        return this.parseOrder(response);
    }
    /**
     * @method
     * @name independentreserve#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.independentreserve.com/features/api#GetDigitalCurrencyDepositAddress
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'primaryCurrencyCode': currency['id'],
        };
        const response = await this.privatePostGetDigitalCurrencyDepositAddress(this.extend(request, params));
        //
        //    {
        //        Tag: '3307446684',
        //        DepositAddress: 'GCCQH4HACMRAD56EZZZ4TOIDQQRVNADMJ35QOFWF4B2VQGODMA2WVQ22',
        //        LastCheckedTimestampUtc: '2024-02-20T11:13:35.6912985Z',
        //        NextUpdateTimestampUtc: '2024-02-20T11:14:56.5112394Z'
        //    }
        //
        return this.parseDepositAddress(response);
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        //
        //    {
        //        Tag: '3307446684',
        //        DepositAddress: 'GCCQH4HACMRAD56EZZZ4TOIDQQRVNADMJ35QOFWF4B2VQGODMA2WVQ22',
        //        LastCheckedTimestampUtc: '2024-02-20T11:13:35.6912985Z',
        //        NextUpdateTimestampUtc: '2024-02-20T11:14:56.5112394Z'
        //    }
        //
        const address = this.safeString(depositAddress, 'DepositAddress');
        this.checkAddress(address);
        return {
            'info': depositAddress,
            'currency': this.safeString(currency, 'code'),
            'network': undefined,
            'address': address,
            'tag': this.safeString(depositAddress, 'Tag'),
        };
    }
    /**
     * @method
     * @name independentreserve#withdraw
     * @description make a withdrawal
     * @see https://www.independentreserve.com/features/api#WithdrawDigitalCurrency
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {object} [params.comment] withdrawal comment, should not exceed 500 characters
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'primaryCurrencyCode': currency['id'],
            'withdrawalAddress': address,
            'amount': this.currencyToPrecision(code, amount),
        };
        if (tag !== undefined) {
            request['destinationTag'] = tag;
        }
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode !== undefined) {
            throw new errors.BadRequest(this.id + ' withdraw () does not accept params["networkCode"]');
        }
        const response = await this.privatePostWithdrawDigitalCurrency(this.extend(request, params));
        //
        //    {
        //        "TransactionGuid": "dc932e19-562b-4c50-821e-a73fd048b93b",
        //        "PrimaryCurrencyCode": "Bch",
        //        "CreatedTimestampUtc": "2020-04-01T05:26:30.5093622+00:00",
        //        "Amount": {
        //            "Total": 0.1231,
        //            "Fee": 0.0001
        //        },
        //        "Destination": {
        //            "Address": "bc1qhpqxkjpvgkckw530yfmxyr53c94q8f4273a7ez",
        //            "Tag": null
        //        },
        //        "Status": "Pending",
        //        "Transaction": null
        //    }
        //
        return this.parseTransaction(response, currency);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        //    {
        //        "TransactionGuid": "dc932e19-562b-4c50-821e-a73fd048b93b",
        //        "PrimaryCurrencyCode": "Bch",
        //        "CreatedTimestampUtc": "2020-04-01T05:26:30.5093622+00:00",
        //        "Amount": {
        //            "Total": 0.1231,
        //            "Fee": 0.0001
        //        },
        //        "Destination": {
        //            "Address": "bc1qhpqxkjpvgkckw530yfmxyr53c94q8f4273a7ez",
        //            "Tag": null
        //        },
        //        "Status": "Pending",
        //        "Transaction": null
        //    }
        //
        const amount = this.safeDict(transaction, 'Amount');
        const destination = this.safeDict(transaction, 'Destination');
        const currencyId = this.safeString(transaction, 'PrimaryCurrencyCode');
        const datetime = this.safeString(transaction, 'CreatedTimestampUtc');
        const address = this.safeString(destination, 'Address');
        const tag = this.safeString(destination, 'Tag');
        const code = this.safeCurrencyCode(currencyId, currency);
        return {
            'info': transaction,
            'id': this.safeString(transaction, 'TransactionGuid'),
            'txid': undefined,
            'type': 'withdraw',
            'currency': code,
            'network': undefined,
            'amount': this.safeNumber(amount, 'Total'),
            'status': this.safeString(transaction, 'Status'),
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
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
                'cost': this.safeNumber(amount, 'Fee'),
                'rate': undefined,
            },
            'internal': false,
        };
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'public') {
            if (Object.keys(params).length) {
                url += '?' + this.urlencode(params);
            }
        }
        else {
            this.checkRequiredCredentials();
            const nonce = this.nonce();
            const auth = [
                url,
                'apiKey=' + this.apiKey,
                'nonce=' + nonce.toString(),
            ];
            const keys = Object.keys(params);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const value = params[key].toString();
                auth.push(key + '=' + value);
            }
            const message = auth.join(',');
            const signature = this.hmac(this.encode(message), this.encode(this.secret), sha256.sha256);
            const query = this.ordered({});
            query['apiKey'] = this.apiKey;
            query['nonce'] = nonce;
            query['signature'] = signature.toUpperCase();
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                query[key] = params[key];
            }
            body = this.json(query);
            headers = { 'Content-Type': 'application/json' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

module.exports = independentreserve;
