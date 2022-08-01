'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');

// ---------------------------------------------------------------------------

module.exports = class bingx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bingx',
            'name': 'Bing X',
            'countries': [ 'US' ],
            'rateLimit': 100,
            'version': 'v1',
            'certified': false,
            'hostname': 'bingx.com',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelWithdraw': false,
                'createDepositAddress': false,
                'createMarketOrder': false,
                'createOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchAccounts': false,
                'fetchBalance': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1mon',
                '1y': '1y',
            },
            'urls': {
                'logo': '',
                'api': {
                    'spot': 'https://open-api.bingx.com/openApi/spot',
                    'swap': 'https://api-swap-rest.bingbon.pro/api',
                    'contract': 'https://api.bingbon.com/api/coingecko',
                },
                'test': {
                },
                'www': 'https://bingx.com/',
                'doc': [
                    'https://bingx-api.github.io/docs',
                ],
                'fees': [
                    'https://support.bingx.com/hc/en-001/articles/360027240173',
                ],
                'referral': '',
            },
            'api': {
                'spot': {
                    'v1': {
                        'public': {
                            'get': {
                                'common/symbols': 1,
                                'market/trades': 1,
                                'market/depth': 1,
                            },
                        },
                        'private': {},
                    },
                },
                'swap': {
                    'v1': {
                        'public': {
                            'get': {
                                'market/getAllContracts': 1,
                            },
                            'post': {
                                'common/server/time': 1,
                            },
                        },
                    },
                },
                'contract': {
                    'v1': {
                        'public': {
                            'get': {
                                'derivatives/contracts': 1,
                                'derivatives/orderbook/{ticker_id}': 1,
                            },
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.0004'),
                },
            },
            'options': {
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bingx#fetchMarkets
         * @description retrieves data on all markets for bingx
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const spot = await this.fetchSpotMarkets (params);
        const contract = await this.fetchContractMarkets (params);
        return this.arrayConcat (spot, contract);
    }

    async fetchSpotMarkets (params = {}) {
        const response = await this.spotV1PublicGetCommonSymbols (params);
        //
        //     {
        //         "code":0,
        //         "msg":"",
        //         "ttl":1,
        //         "data":{
        //             "symbols":[
        //                 {
        //                     "symbol":"CELR-USDT",
        //                     "minQty":0.2,
        //                     "maxQty":466418,
        //                     "minNotional":12,
        //                     "maxNotional":20000,
        //                     "status":1,
        //                     "tickSize":0.00001,
        //                     "stepSize":0.1
        //                 }
        //             ]
        //         }
        //     }
        //
        const result = [];
        const data = this.safeValue (response, 'data', {});
        const symbols = this.safeValue (data, 'symbols', []);
        for (let i = 0; i < symbols.length; i++) {
            const market = symbols[i];
            const marketId = this.safeString (market, 'symbol');
            const parts = marketId.split ('-');
            const baseId = this.safeString (parts, 0);
            const quoteId = this.safeString (parts, 1);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const status = this.safeNumber (market, 'status');
            result.push ({
                'id': marketId,
                'symbol': symbol,
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
                'active': status === 1,
                'contract': false,
                'linear': false,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'stepSize'),
                    'price': this.safeNumber (market, 'tickSize'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minQty'),
                        'max': this.safeNumber (market, 'maxQty'),
                    },
                    'price': {
                        'min': this.safeNumber (market, 'minNotional'),
                        'max': this.safeNumber (market, 'maxNotional'),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchContractMarkets (params = {}) {
        const response = await this.swapV1PublicGetMarketGetAllContracts (params);
        //
        //     {
        //         "code":0,
        //         "msg":"Success",
        //         "data":{
        //             "contracts":[
        //                 {
        //                     "contractId":"100",
        //                     "symbol":"BTC-USDT",
        //                     "name":"BTC",
        //                     "size":"0.0001",
        //                     "currency":"USDT",
        //                     "asset":"BTC",
        //                     "pricePrecision":2,
        //                     "volumePrecision":4,
        //                     "feeRate":0.0005,
        //                     "tradeMinLimit":1,
        //                     "maxLongLeverage":100,
        //                     "maxShortLeverage":100,
        //                     "status":1
        //                 }
        //             ]
        //         }
        //     }
        //
        const result = [];
        const data = this.safeValue (response, 'data', {});
        const contracts = this.safeValue (data, 'contracts', []);
        for (let i = 0; i < contracts.length; i++) {
            const market = contracts[i];
            // should we use contract id as market id?
            // const contractId = this.safeString (market, 'contractId');
            const marketId = this.safeString (market, 'symbol');
            const parts = marketId.split ('-');
            const baseId = this.safeString (parts, 0);
            const quoteId = this.safeString (parts, 1);
            const settleId = this.safeString (market, 'currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const symbol = base + '/' + quote + ':' + settle;
            const status = this.safeNumber (market, 'status');
            result.push ({
                'id': marketId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': 'swop',
                'spot': false,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'active': status === 1,
                'contract': true,
                'linear': true,
                'inverse': undefined,
                'contractSize': this.safeNumber (market, 'size'),
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'volumePrecision'),
                    'price': this.safeNumber (market, 'pricePrecision'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': this.safeNumber (market, 'maxLongLeverage'),
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'tradeMinLimit'),
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
                'info': market,
            });
        }
        return result;
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name bingx#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the bingx api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.swapV1PublicPostCommonServerTime (params);
        //
        //     {
        //         "code": 0,
        //         "msg": "",
        //         "data":{
        //             "currentTime": 1534431933321
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.safeInteger (data, 'currentTime');
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bingx#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bingx api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 20, max 200
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchOrderBook', market, params);
        let method = undefined;
        if (type === 'spot') {
            method = 'spotV1PublicGetMarketDepth';
        }
        const response = await this[method] (this.extend (request, query));
        //
        // spotV1PublicGetMarketDepth
        //
        //     {
        //         "code":0,
        //         "data":{
        //             "bids":[
        //                 ["23299.98","0.364740"]
        //             ],
        //             "asks":[
        //                 ["23349.47","16.211588"]
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        const orderbook = this.parseOrderBook (data, symbol, undefined);
        return orderbook;
    }

    parseTrade (trade, market = undefined) {
        if ('isDustTrade' in trade) {
            return this.parseDustTrade (trade, market);
        }
        //
        // spotV1PublicGetMarketTrades
        //     [
        //         {
        //             "id":27785938,
        //             "price":23349.46,
        //             "qty":0.059990,
        //             "time":1659367452266,
        //             "buyerMaker":true
        //         }
        //     ]
        //
        const timestamp = this.safeInteger (trade, 'time');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'qty');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const id = this.safeString (trade, 'id');
        let side = undefined;
        const buyerMaker = this.safeValue (trade, 'buyerMaker');
        let takerOrMaker = undefined;
        if (buyerMaker !== undefined) {
            side = buyerMaker ? 'sell' : 'buy'; // this is reversed intentionally
            takerOrMaker = 'taker';
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bingx#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bingx api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'limit': 100,     // default = 100, maximum = 100
        };
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchTrades', market, params);
        let method = undefined;
        if (type === 'spot') {
            method = 'spotV1PublicGetMarketTrades';
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default = 500, maximum = 1000
        }
        const response = await this[method] (this.extend (request, query));
        //
        // spotV1PublicGetMarketTrades
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "id":27785938,
        //                 "price":23349.46,
        //                 "qty":0.059990,
        //                 "time":1659367452266,
        //                 "buyerMaker":true
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, section = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const type = section[0];
        const version = section[1];
        const access = section[2];
        let url = this.implodeHostname (this.urls['api'][type]);
        url += '/' + version + '/';
        path = this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        params = this.keysort (params);
        if (access === 'public') {
            url += path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return; // fallback to default error handler
        }
        const errorCode = this.safeString (response, 'code');
        if (errorCode > 0) {
            const feedback = this.id + ' ' + this.json (response);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
    }
};
