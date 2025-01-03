'use strict';

var lbank$1 = require('./abstract/lbank.js');
var errors = require('./base/errors.js');
var number = require('./base/functions/number.js');
var Precise = require('./base/Precise.js');
var md5 = require('./static_dependencies/noble-hashes/md5.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');
var rsa = require('./base/functions/rsa.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class lbank
 * @augments Exchange
 */
class lbank extends lbank$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'lbank',
            'name': 'LBank',
            'countries': ['CN'],
            'version': 'v2',
            // 50 per second for making and cancelling orders 1000ms / 50 = 20
            // 20 per second for all other requests, cost = 50 / 20 = 2.5
            'rateLimit': 20,
            'pro': true,
            'has': {
                'CORS': false,
                'spot': true,
                'margin': false,
                'swap': undefined,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createMarketBuyOrderWithCost': true,
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
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchIsolatedPositions': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
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
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFees': true,
                'fetchTransactionFees': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 'minute1',
                '5m': 'minute5',
                '15m': 'minute15',
                '30m': 'minute30',
                '1h': 'hour1',
                '2h': 'hour2',
                '4h': 'hour4',
                '6h': 'hour6',
                '8h': 'hour8',
                '12h': 'hour12',
                '1d': 'day1',
                '1w': 'week1',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38063602-9605e28a-3302-11e8-81be-64b1e53c4cfb.jpg',
                'api': {
                    'rest': 'https://api.lbank.info',
                    'contract': 'https://lbkperp.lbank.com',
                },
                'api2': 'https://api.lbkex.com',
                'www': 'https://www.lbank.com',
                'doc': 'https://www.lbank.com/en-US/docs/index.html',
                'fees': 'https://support.lbank.site/hc/en-gb/articles/900000535703-Trading-Fees-From-14-00-on-April-7-2020-UTC-8-',
                'referral': 'https://www.lbank.com/login/?icode=7QCY',
            },
            'api': {
                'spot': {
                    'public': {
                        'get': {
                            'currencyPairs': 2.5,
                            'accuracy': 2.5,
                            'usdToCny': 2.5,
                            'withdrawConfigs': 2.5,
                            'timestamp': 2.5,
                            'ticker/24hr': 2.5,
                            'ticker': 2.5,
                            'depth': 2.5,
                            'incrDepth': 2.5,
                            'trades': 2.5,
                            'kline': 2.5,
                            // new quote endpoints
                            'supplement/system_ping': 2.5,
                            'supplement/incrDepth': 2.5,
                            'supplement/trades': 2.5,
                            'supplement/ticker/price': 2.5,
                            'supplement/ticker/bookTicker': 2.5,
                        },
                        'post': {
                            'supplement/system_status': 2.5,
                        },
                    },
                    'private': {
                        'post': {
                            // account
                            'user_info': 2.5,
                            'subscribe/get_key': 2.5,
                            'subscribe/refresh_key': 2.5,
                            'subscribe/destroy_key': 2.5,
                            'get_deposit_address': 2.5,
                            'deposit_history': 2.5,
                            // order
                            'create_order': 1,
                            'batch_create_order': 1,
                            'cancel_order': 1,
                            'cancel_clientOrders': 1,
                            'orders_info': 2.5,
                            'orders_info_history': 2.5,
                            'order_transaction_detail': 2.5,
                            'transaction_history': 2.5,
                            'orders_info_no_deal': 2.5,
                            // withdraw
                            'withdraw': 2.5,
                            'withdrawCancel': 2.5,
                            'withdraws': 2.5,
                            'supplement/user_info': 2.5,
                            'supplement/withdraw': 2.5,
                            'supplement/deposit_history': 2.5,
                            'supplement/withdraws': 2.5,
                            'supplement/get_deposit_address': 2.5,
                            'supplement/asset_detail': 2.5,
                            'supplement/customer_trade_fee': 2.5,
                            'supplement/api_Restrictions': 2.5,
                            // new quote endpoints
                            'supplement/system_ping': 2.5,
                            // new order endpoints
                            'supplement/create_order_test': 1,
                            'supplement/create_order': 1,
                            'supplement/cancel_order': 1,
                            'supplement/cancel_order_by_symbol': 1,
                            'supplement/orders_info': 2.5,
                            'supplement/orders_info_no_deal': 2.5,
                            'supplement/orders_info_history': 2.5,
                            'supplement/user_info_account': 2.5,
                            'supplement/transaction_history': 2.5,
                        },
                    },
                },
                'contract': {
                    'public': {
                        'get': {
                            'cfd/openApi/v1/pub/getTime': 2.5,
                            'cfd/openApi/v1/pub/instrument': 2.5,
                            'cfd/openApi/v1/pub/marketData': 2.5,
                            'cfd/openApi/v1/pub/marketOrder': 2.5,
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber('0.001'),
                    'taker': this.parseNumber('0.001'),
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'commonCurrencies': {
                'HIT': 'Hiver',
                'VET_ERC20': 'VEN',
                'PNT': 'Penta',
            },
            'precisionMode': number.TICK_SIZE,
            'options': {
                'cacheSecretAsPem': true,
                'createMarketBuyOrderRequiresPrice': true,
                'fetchTrades': {
                    'method': 'spotPublicGetTrades', // or 'spotPublicGetTradesSupplement'
                },
                'fetchTransactionFees': {
                    'method': 'fetchPrivateTransactionFees', // or 'fetchPublicTransactionFees'
                },
                'fetchDepositWithdrawFees': {
                    'method': 'fetchPrivateDepositWithdrawFees', // or 'fetchPublicDepositWithdrawFees'
                },
                'fetchDepositAddress': {
                    'method': 'fetchDepositAddressDefault', // or fetchDepositAddressSupplement
                },
                'createOrder': {
                    'method': 'spotPrivatePostSupplementCreateOrder', // or spotPrivatePostCreateOrder
                },
                'fetchOrder': {
                    'method': 'fetchOrderSupplement', // or fetchOrderDefault
                },
                'fetchBalance': {
                    'method': 'spotPrivatePostSupplementUserInfo', // or spotPrivatePostSupplementUserInfoAccount or spotPrivatePostUserInfo
                },
                'networks': {
                    'ERC20': 'erc20',
                    'ETH': 'erc20',
                    'TRC20': 'trc20',
                    'TRX': 'trc20',
                    'OMNI': 'omni',
                    'ASA': 'asa',
                    'BEP20': 'bep20(bsc)',
                    'BSC': 'bep20(bsc)',
                    'HT': 'heco',
                    'BNB': 'bep2',
                    'BTC': 'btc',
                    'DOGE': 'dogecoin',
                    'MATIC': 'matic',
                    'POLYGON': 'matic',
                    'OEC': 'oec',
                    'BTCTRON': 'btctron',
                    'XRP': 'xrp',
                    // other unusual chains with number of listed currencies supported
                    //     'avax c-chain': 1,
                    //     klay: 12,
                    //     bta: 1,
                    //     fantom: 1,
                    //     celo: 1,
                    //     sol: 2,
                    //     zenith: 1,
                    //     ftm: 5,
                    //     bep20: 1, (single token with mis-named chain) SSS
                    //     bitci: 1,
                    //     sgb: 1,
                    //     moonbeam: 1,
                    //     ekta: 1,
                    //     etl: 1,
                    //     arbitrum: 1,
                    //     tpc: 1,
                    //     ptx: 1
                    // }
                },
                'inverse-networks': {
                    'erc20': 'ERC20',
                    'trc20': 'TRC20',
                    'omni': 'OMNI',
                    'asa': 'ASA',
                    'bep20(bsc)': 'BSC',
                    'bep20': 'BSC',
                    'heco': 'HT',
                    'bep2': 'BNB',
                    'btc': 'BTC',
                    'dogecoin': 'DOGE',
                    'matic': 'MATIC',
                    'oec': 'OEC',
                    'btctron': 'BTCTRON',
                    'xrp': 'XRP',
                },
                'defaultNetworks': {
                    'USDT': 'TRC20',
                },
            },
        });
    }
    /**
     * @method
     * @name lbank#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://www.lbank.com/en-US/docs/index.html#get-timestamp
     * @see https://www.lbank.com/en-US/docs/contract.html#get-the-current-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchTime', undefined, params);
        let response = undefined;
        if (type === 'swap') {
            response = await this.contractPublicGetCfdOpenApiV1PubGetTime(params);
        }
        else {
            response = await this.spotPublicGetTimestamp(params);
        }
        //
        // spot
        //
        //     {
        //         "result": "true",
        //         "data": 1691789627950,
        //         "error_code": 0,
        //         "ts": 1691789627950
        //     }
        //
        // swap
        //
        //     {
        //         "data": 1691789627950,
        //         "error_code": 0,
        //         "msg": "Success",
        //         "result": "true",
        //         "success": true
        //     }
        //
        return this.safeInteger(response, 'data');
    }
    /**
     * @method
     * @name lbank#fetchMarkets
     * @description retrieves data on all markets for lbank
     * @see https://www.lbank.com/en-US/docs/index.html#trading-pairs
     * @see https://www.lbank.com/en-US/docs/contract.html#query-contract-information-list
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const marketsPromises = [
            this.fetchSpotMarkets(params),
            this.fetchSwapMarkets(params),
        ];
        const resolvedMarkets = await Promise.all(marketsPromises);
        return this.arrayConcat(resolvedMarkets[0], resolvedMarkets[1]);
    }
    async fetchSpotMarkets(params = {}) {
        const response = await this.spotPublicGetAccuracy(params);
        //
        //     {
        //         "result": "true",
        //         "data": [
        //             {
        //                 "symbol": "btc_usdt",
        //                 "quantityAccuracy": "4",
        //                 "minTranQua": "0.0001",
        //                 "priceAccuracy": "2"
        //             },
        //         ],
        //         "error_code": 0,
        //         "ts": 1691560288484
        //     }
        //
        const data = this.safeValue(response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const marketId = this.safeString(market, 'symbol');
            const parts = marketId.split('_');
            const baseId = parts[0];
            const quoteId = parts[1];
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const symbol = base + '/' + quote;
            result.push({
                'id': marketId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'settle': undefined,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber(this.parsePrecision(this.safeString(market, 'quantityAccuracy'))),
                    'price': this.parseNumber(this.parsePrecision(this.safeString(market, 'priceAccuracy'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber(market, 'minTranQua'),
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
                'info': market,
            });
        }
        return result;
    }
    async fetchSwapMarkets(params = {}) {
        const request = {
            'productGroup': 'SwapU',
        };
        const response = await this.contractPublicGetCfdOpenApiV1PubInstrument(this.extend(request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "priceLimitUpperValue": 0.2,
        //                 "symbol": "BTCUSDT",
        //                 "volumeTick": 0.0001,
        //                 "indexPrice": "29707.70200000",
        //                 "minOrderVolume": "0.0001",
        //                 "priceTick": 0.1,
        //                 "maxOrderVolume": "30.0",
        //                 "baseCurrency": "BTC",
        //                 "volumeMultiple": 1.0,
        //                 "exchangeID": "Exchange",
        //                 "priceCurrency": "USDT",
        //                 "priceLimitLowerValue": 0.2,
        //                 "clearCurrency": "USDT",
        //                 "symbolName": "BTCUSDT",
        //                 "defaultLeverage": 20.0,
        //                 "minOrderCost": "5.0"
        //             },
        //         ],
        //         "error_code": 0,
        //         "msg": "Success",
        //         "result": "true",
        //         "success": true
        //     }
        //
        const data = this.safeValue(response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const marketId = this.safeString(market, 'symbol');
            const baseId = this.safeString(market, 'baseCurrency');
            const settleId = this.safeString(market, 'clearCurrency');
            const quoteId = settleId;
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const settle = this.safeCurrencyCode(settleId);
            const symbol = base + '/' + quote + ':' + settle;
            result.push({
                'id': marketId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': 'swap',
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'active': true,
                'contract': true,
                'linear': true,
                'inverse': undefined,
                'contractSize': this.safeNumber(market, 'volumeMultiple'),
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber(market, 'volumeTick'),
                    'price': this.safeNumber(market, 'priceTick'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber(market, 'minOrderVolume'),
                        'max': this.safeNumber(market, 'maxOrderVolume'),
                    },
                    'price': {
                        'min': this.safeNumber(market, 'priceLimitLowerValue'),
                        'max': this.safeNumber(market, 'priceLimitUpperValue'),
                    },
                    'cost': {
                        'min': this.safeNumber(market, 'minOrderCost'),
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': market,
            });
        }
        return result;
    }
    parseTicker(ticker, market = undefined) {
        //
        // spot: fetchTicker, fetchTickers
        //
        //     {
        //         "symbol": "btc_usdt",
        //         "ticker": {
        //             "high": "29695.57",
        //             "vol": "6890.2789",
        //             "low": "29110",
        //             "change": "0.58",
        //             "turnover": "202769821.06",
        //             "latest": "29405.98"
        //         },
        //         "timestamp": :1692064274908
        //     }
        //
        // swap: fetchTickers
        //
        //     {
        //         "prePositionFeeRate": "0.000053",
        //         "volume": "2435.459",
        //         "symbol": "BTCUSDT",
        //         "highestPrice": "29446.5",
        //         "lowestPrice": "29362.9",
        //         "openPrice": "29419.5",
        //         "markedPrice": "29385.1",
        //         "turnover": "36345526.2438402",
        //         "lastPrice": "29387.0"
        //     }
        //
        const timestamp = this.safeInteger(ticker, 'timestamp');
        const marketId = this.safeString(ticker, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        const tickerData = this.safeValue(ticker, 'ticker', {});
        market = this.safeMarket(marketId, market);
        const data = (market['contract']) ? ticker : tickerData;
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString2(data, 'high', 'highestPrice'),
            'low': this.safeString2(data, 'low', 'lowestPrice'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString(data, 'openPrice'),
            'close': undefined,
            'last': this.safeString2(data, 'latest', 'lastPrice'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString(data, 'change'),
            'average': undefined,
            'baseVolume': this.safeString2(data, 'vol', 'volume'),
            'quoteVolume': this.safeString(data, 'turnover'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name lbank#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.lbank.com/en-US/docs/index.html#query-current-market-data-new
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (market['swap']) {
            const responseForSwap = await this.fetchTickers([market['symbol']], params);
            return this.safeValue(responseForSwap, market['symbol']);
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.spotPublicGetTicker24hr(this.extend(request, params));
        //
        //     {
        //         "result": "true",
        //         "data": [
        //             {
        //                 "symbol": "btc_usdt",
        //                 "ticker": {
        //                     "high": "29695.57",
        //                     "vol": "6890.2789",
        //                     "low": "29110",
        //                     "change": "0.58",
        //                     "turnover": "202769821.06",
        //                     "latest": "29405.98"
        //                 },
        //                 "timestamp": :1692064274908
        //             }
        //         ],
        //         "error_code": 0,
        //         "ts": :1692064276872
        //     }
        //
        const data = this.safeValue(response, 'data', []);
        const first = this.safeDict(data, 0, {});
        return this.parseTicker(first, market);
    }
    /**
     * @method
     * @name lbank#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://www.lbank.com/en-US/docs/index.html#query-current-market-data-new
     * @see https://www.lbank.com/en-US/docs/contract.html#query-contract-market-list
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
            const symbolsLength = symbols.length;
            if (symbolsLength > 0) {
                market = this.market(symbols[0]);
            }
        }
        const request = {};
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchTickers', market, params);
        let response = undefined;
        if (type === 'swap') {
            request['productGroup'] = 'SwapU';
            response = await this.contractPublicGetCfdOpenApiV1PubMarketData(this.extend(request, params));
        }
        else {
            request['symbol'] = 'all';
            response = await this.spotPublicGetTicker24hr(this.extend(request, params));
        }
        //
        // spot
        //
        //     {
        //         "result": "true",
        //         "data": [
        //             {
        //                 "symbol": "btc_usdt",
        //                 "ticker": {
        //                     "high": "29695.57",
        //                     "vol": "6890.2789",
        //                     "low": "29110",
        //                     "change": "0.58",
        //                     "turnover": "202769821.06",
        //                     "latest": "29405.98"
        //                 },
        //                 "timestamp": :1692064274908
        //             }
        //         ],
        //         "error_code": 0,
        //         "ts": :1692064276872
        //     }
        //
        // swap
        //
        //     {
        //         "data": [
        //             {
        //                 "prePositionFeeRate": "0.000053",
        //                 "volume": "2435.459",
        //                 "symbol": "BTCUSDT",
        //                 "highestPrice": "29446.5",
        //                 "lowestPrice": "29362.9",
        //                 "openPrice": "29419.5",
        //                 "markedPrice": "29385.1",
        //                 "turnover": "36345526.2438402",
        //                 "lastPrice": "29387.0"
        //             },
        //         ],
        //         "error_code": 0,
        //         "msg": "Success",
        //         "result": "true",
        //         "success": true
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseTickers(data, symbols);
    }
    /**
     * @method
     * @name lbank#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.lbank.com/en-US/docs/index.html#query-market-depth
     * @see https://www.lbank.com/en-US/docs/contract.html#get-handicap
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (limit === undefined) {
            limit = 60;
        }
        const request = {
            'symbol': market['id'],
        };
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchOrderBook', market, params);
        let response = undefined;
        if (type === 'swap') {
            request['depth'] = limit;
            response = await this.contractPublicGetCfdOpenApiV1PubMarketOrder(this.extend(request, params));
        }
        else {
            request['size'] = limit;
            response = await this.spotPublicGetDepth(this.extend(request, params));
        }
        //
        // spot
        //
        //     {
        //         "result": "true",
        //         "data": {
        //             "asks": [
        //                 ["29243.37", "2.8783"],
        //                 ["29243.39", "2.2842"],
        //                 ["29243.4", "0.0337"]
        //             ],
        //             "bids": [
        //                 ["29243.36", "1.5258"],
        //                 ["29243.34", "0.8218"],
        //                 ["29243.28", "1.285"]
        //             ],
        //             "timestamp": :1692157328820
        //         },
        //         "error_code": 0,
        //         "ts": :1692157328820
        //     }
        //
        // swap
        //
        //     {
        //         "data": {
        //             "symbol": "BTCUSDT",
        //             "asks": [
        //                 {
        //                     "volume": "14.6535",
        //                     "price": "29234.2",
        //                     "orders": "1"
        //                 },
        //             ],
        //             "bids": [
        //                 {
        //                     "volume": "13.4899",
        //                     "price": "29234.1",
        //                     "orders": "4"
        //                 },
        //             ]
        //         },
        //         "error_code": 0,
        //         "msg": "Success",
        //         "result": "true",
        //         "success": true
        //     }
        //
        const orderbook = this.safeValue(response, 'data', {});
        const timestamp = this.milliseconds();
        if (market['swap']) {
            return this.parseOrderBook(orderbook, market['symbol'], timestamp, 'bids', 'asks', 'price', 'volume');
        }
        return this.parseOrderBook(orderbook, market['symbol'], timestamp);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades (old) spotPublicGetTrades
        //
        //      {
        //          "date_ms":1647021989789,
        //          "amount":0.0028,
        //          "price":38804.2,
        //          "type":"buy",
        //          "tid":"52d5616ee35c43019edddebe59b3e094"
        //      }
        //
        //
        // fetchTrades (new) spotPublicGetTradesSupplement
        //
        //      {
        //          "quoteQty":1675.048485,
        //          "price":0.127545,
        //          "qty":13133,
        //          "id":"3589541dc22e4357b227283650f714e2",
        //          "time":1648058297110,
        //          "isBuyerMaker":false
        //      }
        //
        // fetchMyTrades (private)
        //
        //      {
        //          "orderUuid":"38b4e7a4-14f6-45fd-aba1-1a37024124a0",
        //          "tradeFeeRate":0.0010000000,
        //          "dealTime":1648500944496,
        //          "dealQuantity":30.00000000000000000000,
        //          "tradeFee":0.00453300000000000000,
        //          "txUuid":"11f3850cc6214ea3b495adad3a032794",
        //          "dealPrice":0.15111300000000000000,
        //          "dealVolumePrice":4.53339000000000000000,
        //          "tradeType":"sell_market"
        //      }
        //
        let timestamp = this.safeInteger2(trade, 'date_ms', 'time');
        if (timestamp === undefined) {
            timestamp = this.safeInteger(trade, 'dealTime');
        }
        let amountString = this.safeString2(trade, 'amount', 'qty');
        if (amountString === undefined) {
            amountString = this.safeString(trade, 'dealQuantity');
        }
        let priceString = this.safeString(trade, 'price');
        if (priceString === undefined) {
            priceString = this.safeString(trade, 'dealPrice');
        }
        let costString = this.safeString(trade, 'quoteQty');
        if (costString === undefined) {
            costString = this.safeString(trade, 'dealVolumePrice');
        }
        let side = this.safeString2(trade, 'tradeType', 'type');
        let type = undefined;
        let takerOrMaker = undefined;
        if (side !== undefined) {
            const parts = side.split('_');
            side = this.safeString(parts, 0);
            const typePart = this.safeString(parts, 1);
            type = 'limit';
            takerOrMaker = 'taker';
            if (typePart !== undefined) {
                if (typePart === 'market') {
                    type = 'market';
                }
                else if (typePart === 'maker') {
                    takerOrMaker = 'maker';
                }
            }
        }
        let id = this.safeString2(trade, 'tid', 'id');
        if (id === undefined) {
            id = this.safeString(trade, 'txUuid');
        }
        const order = this.safeString(trade, 'orderUuid');
        const symbol = this.safeSymbol(undefined, market);
        let fee = undefined;
        const feeCost = this.safeString(trade, 'tradeFee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': (side === 'buy') ? market['base'] : market['quote'],
                'rate': this.safeString(trade, 'tradeFeeRate'),
            };
        }
        return this.safeTrade({
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'id': id,
            'order': order,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
            'info': trade,
        }, market);
    }
    /**
     * @method
     * @name lbank#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.lbank.com/en-US/docs/index.html#query-historical-transactions
     * @see https://www.lbank.com/en-US/docs/index.html#recent-transactions-list
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
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['time'] = since;
        }
        if (limit !== undefined) {
            request['size'] = Math.min(limit, 600);
        }
        else {
            request['size'] = 600; // max
        }
        const options = this.safeValue(this.options, 'fetchTrades', {});
        const defaultMethod = this.safeString(options, 'method', 'spotPublicGetTrades');
        const method = this.safeString(params, 'method', defaultMethod);
        params = this.omit(params, 'method');
        let response = undefined;
        if (method === 'spotPublicGetSupplementTrades') {
            response = await this.spotPublicGetSupplementTrades(this.extend(request, params));
        }
        else {
            response = await this.spotPublicGetTrades(this.extend(request, params));
        }
        //
        //      {
        //          "result":"true",
        //          "data": [
        //              {
        //                  "date_ms":1647021989789,
        //                  "amount":0.0028,
        //                  "price":38804.2,
        //                  "type":"buy",
        //                  "tid":"52d5616ee35c43019edddebe59b3e094"
        //               }
        //           ],
        //           "error_code":0,
        //           "ts":1647021999308
        //      }
        //
        const trades = this.safeList(response, 'data', []);
        return this.parseTrades(trades, market, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //   [
        //     1482311500, // timestamp
        //     5423.23,    // open
        //     5472.80,    // high
        //     5516.09,    // low
        //     5462,       // close
        //     234.3250    // volume
        //   ],
        //
        return [
            this.safeTimestamp(ohlcv, 0),
            this.safeNumber(ohlcv, 1),
            this.safeNumber(ohlcv, 2),
            this.safeNumber(ohlcv, 3),
            this.safeNumber(ohlcv, 4),
            this.safeNumber(ohlcv, 5), // volume
        ];
    }
    /**
     * @method
     * @name lbank#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.lbank.com/en-US/docs/index.html#query-k-bar-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        // endpoint doesnt work
        await this.loadMarkets();
        const market = this.market(symbol);
        if (limit === undefined) {
            limit = 100;
        }
        else {
            limit = Math.min(limit, 2000);
        }
        if (since === undefined) {
            const duration = this.parseTimeframe(timeframe);
            since = this.milliseconds() - (duration * 1000 * limit);
        }
        const request = {
            'symbol': market['id'],
            'type': this.safeString(this.timeframes, timeframe, timeframe),
            'time': this.parseToInt(since / 1000),
            'size': Math.min(limit + 1, 2000), // max 2000
        };
        const response = await this.spotPublicGetKline(this.extend(request, params));
        const ohlcvs = this.safeList(response, 'data', []);
        //
        //
        // [
        //   [
        //     1482311500,
        //     5423.23,
        //     5472.80,
        //     5516.09,
        //     5462,
        //     234.3250
        //   ],
        //   [
        //     1482311400,
        //     5432.52,
        //     5459.87,
        //     5414.30,
        //     5428.23,
        //     213.7329
        //   ]
        // ]
        //
        return this.parseOHLCVs(ohlcvs, market, timeframe, since, limit);
    }
    parseBalance(response) {
        //
        // spotPrivatePostUserInfo
        //
        //      {
        //          "toBtc": {
        //              "egc:": "0",
        //              "iog": "0",
        //              "ksm": "0",
        //              },
        //          "freeze": {
        //              "egc": "0",
        //              "iog": "0",
        //              "ksm": "0" ,
        //              },
        //          "asset": {
        //              "egc": "0",
        //              "iog": "0",
        //              "ksm": "0",
        //              },
        //          "free": {
        //              "egc": "0",
        //              "iog": "0",
        //              "ksm": "0",
        //              }
        //      }
        //
        // spotPrivatePostSupplementUserInfoAccount
        //
        //      {
        //          "balances":[
        //              {
        //                  "asset":"lbk",
        //                  "free":"0",
        //                  "locked":"0"
        //              }, ...
        //          ]
        //      }
        //
        // spotPrivatePostSupplementUserInfo
        //
        //      [
        //          {
        //              "usableAmt":"31.45130723",
        //              "assetAmt":"31.45130723",
        //              "networkList":[
        //                  {
        //                      "isDefault":true,
        //                      "withdrawFeeRate":"",
        //                      "name":"bep20(bsc)",
        //                      "withdrawMin":30,
        //                      "minLimit":0.0001,
        //                      "minDeposit":0.0001,
        //                      "feeAssetCode":"doge",
        //                      "withdrawFee":"30",
        //                      "type":1,
        //                      "coin":"doge",
        //                      "network":"bsc"
        //                  },
        //                  {
        //                      "isDefault":false,
        //                      "withdrawFeeRate":"",
        //                      "name":"dogecoin",
        //                      "withdrawMin":10,
        //                      "minLimit":0.0001,
        //                      "minDeposit":10,
        //                      "feeAssetCode":"doge",
        //                      "withdrawFee":"10",
        //                      "type":1,
        //                      "coin":"doge",
        //                      "network":"dogecoin"
        //                  }
        //              ],
        //              "freezeAmt":"0",
        //              "coin":"doge"
        //          }, ...
        //      ]
        //
        const timestamp = this.safeInteger(response, 'ts');
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
        const data = this.safeValue(response, 'data');
        // from spotPrivatePostUserInfo
        const toBtc = this.safeValue(data, 'toBtc');
        if (toBtc !== undefined) {
            const used = this.safeValue(data, 'freeze', {});
            const free = this.safeValue(data, 'free', {});
            const currencies = Object.keys(free);
            for (let i = 0; i < currencies.length; i++) {
                const currencyId = currencies[i];
                const code = this.safeCurrencyCode(currencyId);
                const account = this.account();
                account['used'] = this.safeString(used, currencyId);
                account['free'] = this.safeString(free, currencyId);
                result[code] = account;
            }
            return this.safeBalance(result);
        }
        // from spotPrivatePostSupplementUserInfoAccount
        const balances = this.safeValue(data, 'balances');
        if (balances !== undefined) {
            for (let i = 0; i < balances.length; i++) {
                const item = balances[i];
                const currencyId = this.safeString(item, 'asset');
                const codeInner = this.safeCurrencyCode(currencyId);
                const account = this.account();
                account['free'] = this.safeString(item, 'free');
                account['used'] = this.safeString(item, 'locked');
                result[codeInner] = account;
            }
            return this.safeBalance(result);
        }
        // from spotPrivatePostSupplementUserInfo
        const isArray = Array.isArray(data);
        if (isArray === true) {
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                const currencyId = this.safeString(item, 'coin');
                const codeInner = this.safeCurrencyCode(currencyId);
                const account = this.account();
                account['free'] = this.safeString(item, 'usableAmt');
                account['used'] = this.safeString(item, 'freezeAmt');
                result[codeInner] = account;
            }
            return this.safeBalance(result);
        }
        return undefined;
    }
    parseFundingRate(ticker, market = undefined) {
        // {
        //     "symbol": "BTCUSDT",
        //     "highestPrice": "69495.5",
        //     "underlyingPrice": "68455.904",
        //     "lowestPrice": "68182.1",
        //     "openPrice": "68762.4",
        //     "positionFeeRate": "0.0001",
        //     "volume": "33534.2858",
        //     "markedPrice": "68434.1",
        //     "turnover": "1200636218.210558",
        //     "positionFeeTime": "28800",
        //     "lastPrice": "68427.3",
        //     "nextFeeTime": "1730736000000",
        //     "fundingRate": "0.0001",
        // }
        const marketId = this.safeString(ticker, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        const markPrice = this.safeNumber(ticker, 'markedPrice');
        const indexPrice = this.safeNumber(ticker, 'underlyingPrice');
        const fundingRate = this.safeNumber(ticker, 'fundingRate');
        const fundingTime = this.safeInteger(ticker, 'nextFeeTime');
        const positionFeeTime = this.safeInteger(ticker, 'positionFeeTime');
        let intervalString = undefined;
        if (positionFeeTime !== undefined) {
            const interval = this.parseToInt(positionFeeTime / 60 / 60);
            intervalString = interval.toString() + 'h';
        }
        return {
            'info': ticker,
            'symbol': symbol,
            'markPrice': markPrice,
            'indexPrice': indexPrice,
            'fundingRate': fundingRate,
            'fundingTimestamp': fundingTime,
            'fundingDatetime': this.iso8601(fundingTime),
            'timestamp': undefined,
            'datetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': intervalString,
        };
    }
    /**
     * @method
     * @name lbank#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://www.lbank.com/en-US/docs/contract.html#query-contract-market-list
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const responseForSwap = await this.fetchFundingRates([market['symbol']], params);
        return this.safeValue(responseForSwap, market['symbol']);
    }
    /**
     * @method
     * @name lbank#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://www.lbank.com/en-US/docs/contract.html#query-contract-market-list
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexed by market symbols
     */
    async fetchFundingRates(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const request = {
            'productGroup': 'SwapU',
        };
        const response = await this.contractPublicGetCfdOpenApiV1PubMarketData(this.extend(request, params));
        // {
        //     "data": [
        //         {
        //             "symbol": "BTCUSDT",
        //             "highestPrice": "69495.5",
        //             "underlyingPrice": "68455.904",
        //             "lowestPrice": "68182.1",
        //             "openPrice": "68762.4",
        //             "positionFeeRate": "0.0001",
        //             "volume": "33534.2858",
        //             "markedPrice": "68434.1",
        //             "turnover": "1200636218.210558",
        //             "positionFeeTime": "28800",
        //             "lastPrice": "68427.3",
        //             "nextFeeTime": "1730736000000",
        //             "fundingRate": "0.0001",
        //         }
        //     ],
        //     "error_code": "0",
        //     "msg": "Success",
        //     "result": "true",
        //     "success": True,
        // }
        const data = this.safeList(response, 'data', []);
        const result = this.parseFundingRates(data);
        return this.filterByArray(result, 'symbol', symbols);
    }
    /**
     * @method
     * @name lbank#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.lbank.com/en-US/docs/index.html#asset-information
     * @see https://www.lbank.com/en-US/docs/index.html#account-information
     * @see https://www.lbank.com/en-US/docs/index.html#get-all-coins-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const options = this.safeValue(this.options, 'fetchBalance', {});
        const defaultMethod = this.safeString(options, 'method', 'spotPrivatePostSupplementUserInfo');
        const method = this.safeString(params, 'method', defaultMethod);
        let response = undefined;
        if (method === 'spotPrivatePostSupplementUserInfoAccount') {
            response = await this.spotPrivatePostSupplementUserInfoAccount();
        }
        else if (method === 'spotPrivatePostUserInfo') {
            response = await this.spotPrivatePostUserInfo();
        }
        else {
            response = await this.spotPrivatePostSupplementUserInfo();
        }
        //
        //    {
        //        "result": "true",
        //        "data": [
        //            {
        //                "usableAmt": "14.36",
        //                "assetAmt": "14.36",
        //                "networkList": [
        //                    {
        //                        "isDefault": false,
        //                        "withdrawFeeRate": "",
        //                        "name": "erc20",
        //                        "withdrawMin": 30,
        //                        "minLimit": 0.0001,
        //                        "minDeposit": 20,
        //                        "feeAssetCode": "usdt",
        //                        "withdrawFee": "30",
        //                        "type": 1,
        //                        "coin": "usdt",
        //                        "network": "eth"
        //                    },
        //                    ...
        //                ],
        //                "freezeAmt": "0",
        //                "coin": "ada"
        //            }
        //        ],
        //        "code": 0
        //    }
        //
        return this.parseBalance(response);
    }
    parseTradingFee(fee, market = undefined) {
        //
        //      {
        //          "symbol":"skt_usdt",
        //          "makerCommission":"0.10",
        //          "takerCommission":"0.10"
        //      }
        //
        const marketId = this.safeString(fee, 'symbol');
        const symbol = this.safeSymbol(marketId);
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.safeNumber(fee, 'makerCommission'),
            'taker': this.safeNumber(fee, 'takerCommission'),
            'percentage': undefined,
            'tierBased': undefined,
        };
    }
    /**
     * @method
     * @name lbank#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://www.lbank.com/en-US/docs/index.html#transaction-fee-rate-query
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTradingFee(symbol, params = {}) {
        const market = this.market(symbol);
        const result = await this.fetchTradingFees(this.extend(params, { 'category': market['id'] }));
        return this.safeDict(result, symbol);
    }
    /**
     * @method
     * @name lbank#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://www.lbank.com/en-US/docs/index.html#transaction-fee-rate-query
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees(params = {}) {
        await this.loadMarkets();
        const request = {};
        const response = await this.spotPrivatePostSupplementCustomerTradeFee(this.extend(request, params));
        const fees = this.safeValue(response, 'data', []);
        const result = {};
        for (let i = 0; i < fees.length; i++) {
            const fee = this.parseTradingFee(fees[i]);
            const symbol = fee['symbol'];
            result[symbol] = fee;
        }
        return result;
    }
    /**
     * @method
     * @name lbank#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://www.lbank.com/en-US/docs/index.html#place-order
     * @see https://www.lbank.com/en-US/docs/index.html#place-an-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createMarketBuyOrderWithCost(symbol, cost, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' createMarketBuyOrderWithCost() supports spot orders only');
        }
        params['createMarketBuyOrderRequiresPrice'] = false;
        return await this.createOrder(symbol, 'market', 'buy', cost, undefined, params);
    }
    /**
     * @method
     * @name lbank#createOrder
     * @description create a trade order
     * @see https://www.lbank.com/en-US/docs/index.html#place-order
     * @see https://www.lbank.com/en-US/docs/index.html#place-an-order
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
        const clientOrderId = this.safeString2(params, 'custom_id', 'clientOrderId');
        const postOnly = this.safeBool(params, 'postOnly', false);
        const timeInForce = this.safeStringUpper(params, 'timeInForce');
        params = this.omit(params, ['custom_id', 'clientOrderId', 'timeInForce', 'postOnly']);
        const request = {
            'symbol': market['id'],
        };
        const ioc = (timeInForce === 'IOC');
        const fok = (timeInForce === 'FOK');
        const maker = (postOnly || (timeInForce === 'PO'));
        if ((type === 'market') && (ioc || fok || maker)) {
            throw new errors.InvalidOrder(this.id + ' createOrder () does not allow market FOK, IOC, or postOnly orders. Only limit IOC, FOK, and postOnly orders are allowed');
        }
        if (type === 'limit') {
            request['type'] = side;
            request['price'] = this.priceToPrecision(symbol, price);
            request['amount'] = this.amountToPrecision(symbol, amount);
            if (ioc) {
                request['type'] = side + '_' + 'ioc';
            }
            else if (fok) {
                request['type'] = side + '_' + 'fok';
            }
            else if (maker) {
                request['type'] = side + '_' + 'maker';
            }
        }
        else if (type === 'market') {
            if (side === 'sell') {
                request['type'] = side + '_' + 'market';
                request['amount'] = this.amountToPrecision(symbol, amount);
            }
            else if (side === 'buy') {
                request['type'] = side + '_' + 'market';
                let quoteAmount = undefined;
                let createMarketBuyOrderRequiresPrice = true;
                [createMarketBuyOrderRequiresPrice, params] = this.handleOptionAndParams(params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
                const cost = this.safeNumber(params, 'cost');
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
                // market buys require filling the price param instead of the amount param, for market buys the price is treated as the cost by lbank
                request['price'] = quoteAmount;
            }
        }
        if (clientOrderId !== undefined) {
            request['custom_id'] = clientOrderId;
        }
        const options = this.safeValue(this.options, 'createOrder', {});
        const defaultMethod = this.safeString(options, 'method', 'spotPrivatePostSupplementCreateOrder');
        const method = this.safeString(params, 'method', defaultMethod);
        params = this.omit(params, 'method');
        let response = undefined;
        if (method === 'spotPrivatePostCreateOrder') {
            response = await this.spotPrivatePostCreateOrder(this.extend(request, params));
        }
        else {
            response = await this.spotPrivatePostSupplementCreateOrder(this.extend(request, params));
        }
        //
        //      {
        //          "result":true,
        //          "data":{
        //              "symbol":"doge_usdt",
        //              "order_id":"0cf8a3de-4597-4296-af45-be7abaa06b07"
        //              },
        //          "error_code":0,
        //          "ts":1648162321043
        //      }
        //
        const result = this.safeValue(response, 'data', {});
        return this.safeOrder({
            'id': this.safeString(result, 'order_id'),
            'info': result,
        }, market);
    }
    parseOrderStatus(status) {
        const statuses = {
            '-1': 'canceled',
            '0': 'open',
            '1': 'open',
            '2': 'closed',
            '3': 'canceled',
            '4': 'closed', // disposal processing
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        // fetchOrderSupplement (private)
        //
        //      {
        //          "cummulativeQuoteQty":0,
        //          "symbol":"doge_usdt",
        //          "executedQty":0,
        //          "orderId":"53d2d53e-70fb-4398-b722-f48571a5f61e",
        //          "origQty":1E+2,
        //          "price":0.05,
        //          "clientOrderId":null,
        //          "origQuoteOrderQty":5,
        //          "updateTime":1648163406000,
        //          "time":1648163139387,
        //          "type":"buy_maker",
        //          "status":-1
        //      }
        //
        //
        // fetchOrderDefault (private)
        //
        //      {
        //          "symbol":"shib_usdt",
        //          "amount":1,
        //          "create_time":1649367863356,
        //          "price":0.0000246103,
        //          "avg_price":0.00002466180000000104,
        //          "type":"buy_market",
        //          "order_id":"abe8b92d-86d9-4d6d-b71e-d14f5fb53ddf",
        //          "custom_id": "007",                                 // field only present if user creates it at order time
        //          "deal_amount":40548.54065802,
        //          "status":2
        //      }
        //
        // fetchOpenOrders (private)
        //
        //      {
        //          "cummulativeQuoteQty":0,
        //          "symbol":"doge_usdt",
        //          "executedQty":0,
        //          "orderId":"73878edf-008d-4e4c-8041-df1f1b2cd8bb",
        //          "origQty":100,
        //          "price":0.05,
        //          "origQuoteOrderQty":5,
        //          "updateTime":1648501762000,
        //          "time":1648501762353,
        //          "type":"buy",
        //          "status":0
        //      }
        //
        // fetchOrders (private)
        //
        //      {
        //          "cummulativeQuoteQty":0,
        //          "symbol":"doge_usdt",
        //          "executedQty":0,
        //          "orderId":"2cadc7cc-b5f6-486b-a5b4-d6ac49a9c186",
        //          "origQty":100,
        //          "price":0.05,
        //          "origQuoteOrderQty":5,
        //          "updateTime":1648501384000,
        //          "time":1648501363889,
        //          "type":"buy",
        //          "status":-1
        //      }
        //
        // cancelOrder
        //
        //    {
        //        "executedQty":0.0,
        //        "price":0.05,
        //        "origQty":100.0,
        //        "tradeType":"buy",
        //        "status":0
        //    }
        //
        // cancelAllOrders
        //
        //    {
        //        "executedQty":0.00000000000000000000,
        //        "orderId":"293ef71b-3e67-4962-af93-aa06990a045f",
        //        "price":0.05000000000000000000,
        //        "origQty":100.00000000000000000000,
        //        "tradeType":"buy",
        //        "status":0
        //    }
        //
        const id = this.safeString2(order, 'orderId', 'order_id');
        const clientOrderId = this.safeString2(order, 'clientOrderId', 'custom_id');
        const timestamp = this.safeInteger2(order, 'time', 'create_time');
        const rawStatus = this.safeString(order, 'status');
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        let timeInForce = undefined;
        let postOnly = false;
        let type = 'limit';
        const rawType = this.safeString2(order, 'type', 'tradeType'); // buy, sell, buy_market, sell_market, buy_maker,sell_maker,buy_ioc,sell_ioc, buy_fok, sell_fok
        const parts = rawType.split('_');
        const side = this.safeString(parts, 0);
        const typePart = this.safeString(parts, 1); // market, maker, ioc, fok or undefined (limit)
        if (typePart === 'market') {
            type = 'market';
        }
        if (typePart === 'maker') {
            postOnly = true;
            timeInForce = 'PO';
        }
        if (typePart === 'ioc') {
            timeInForce = 'IOC';
        }
        if (typePart === 'fok') {
            timeInForce = 'FOK';
        }
        const price = this.safeString(order, 'price');
        const costString = this.safeString(order, 'cummulativeQuoteQty');
        let amountString = undefined;
        if (rawType !== 'buy_market') {
            amountString = this.safeString2(order, 'origQty', 'amount');
        }
        const filledString = this.safeString2(order, 'executedQty', 'deal_amount');
        return this.safeOrder({
            'id': id,
            'clientOrderId': clientOrderId,
            'datetime': this.iso8601(timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': this.parseOrderStatus(rawStatus),
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'triggerPrice': undefined,
            'cost': costString,
            'amount': amountString,
            'filled': filledString,
            'remaining': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': order,
            'average': undefined,
        }, market);
    }
    /**
     * @method
     * @name lbank#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://www.lbank.com/en-US/docs/index.html#query-order
     * @see https://www.lbank.com/en-US/docs/index.html#query-order-new
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let method = this.safeString(params, 'method');
        if (method === undefined) {
            const options = this.safeValue(this.options, 'fetchOrder', {});
            method = this.safeString(options, 'method', 'fetchOrderSupplement');
        }
        if (method === 'fetchOrderSupplement') {
            return await this.fetchOrderSupplement(id, symbol, params);
        }
        return await this.fetchOrderDefault(id, symbol, params);
    }
    async fetchOrderSupplement(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'orderId': id,
        };
        const response = await this.spotPrivatePostSupplementOrdersInfo(this.extend(request, params));
        //
        //      {
        //          "result":true,
        //          "data":{
        //              "cummulativeQuoteQty":0,
        //              "symbol":"doge_usdt",
        //              "executedQty":0,
        //              "orderId":"53d2d53e-70fb-4398-b722-f48571a5f61e",
        //              "origQty":1E+2,
        //              "price":0.05,
        //              "clientOrderId":null,
        //              "origQuoteOrderQty":5,
        //              "updateTime":1648163406000,
        //              "time":1648163139387,
        //              "type":"buy_maker",
        //              "status":-1
        //              },
        //          "error_code":0,
        //          "ts":1648164471827
        //      }
        //
        const result = this.safeDict(response, 'data', {});
        return this.parseOrder(result);
    }
    async fetchOrderDefault(id, symbol = undefined, params = {}) {
        // Id can be a list of ids delimited by a comma
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'order_id': id,
        };
        const response = await this.spotPrivatePostOrdersInfo(this.extend(request, params));
        //
        //      {
        //          "result":true,
        //          "data":[
        //              {
        //                  "symbol":"doge_usdt",
        //                  "amount":18,
        //                  "create_time":1647455223186,
        //                  "price":0,
        //                  "avg_price":0.113344,
        //                  "type":"sell_market",
        //                  "order_id":"d4ca1ddd-40d9-42c1-9717-5de435865bec",
        //                  "deal_amount":18,
        //                  "status":2
        //                }
        //            ],
        //          "error_code":0,
        //          "ts":1647455270776
        //      }
        //
        const result = this.safeValue(response, 'data', []);
        const numOrders = result.length;
        if (numOrders === 1) {
            return this.parseOrder(result[0]);
        }
        else {
            // const parsedOrders = [];
            // for (let i = 0; i < numOrders; i++) {
            //     const parsedOrder = this.parseOrder (result[i]);
            //     parsedOrders.push (parsedOrder);
            // }
            // return parsedOrders;
            throw new errors.BadRequest(this.id + ' fetchOrder() can only fetch one order at a time');
        }
    }
    /**
     * @method
     * @name lbank#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://www.lbank.com/en-US/docs/index.html#past-transaction-details
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        since = this.safeValue(params, 'start_date', since);
        params = this.omit(params, 'start_date');
        const request = {
            'symbol': market['id'],
            // 'start_date' Start time yyyy-mm-dd, the maximum is today, the default is yesterday
            // 'end_date' Finish time yyyy-mm-dd, the maximum is today, the default is today
            // 'The start': and end date of the query window is up to 2 days
            // 'from' Initial transaction number inquiring
            // 'direct' inquire direction,The default is the 'next' which is the positive sequence of dealing time，the 'prev' is inverted order of dealing time
            // 'size' Query the number of defaults to 100
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        if (since !== undefined) {
            request['start_date'] = this.ymd(since, '-'); // max query 2 days ago
            request['end_date'] = this.ymd(since + 86400000, '-'); // will cover 2 days
        }
        const response = await this.spotPrivatePostTransactionHistory(this.extend(request, params));
        //
        //      {
        //          "result":true,
        //          "data":[
        //              {
        //                  "orderUuid":"38b4e7a4-14f6-45fd-aba1-1a37024124a0",
        //                  "tradeFeeRate":0.0010000000,
        //                  "dealTime":1648500944496,
        //                  "dealQuantity":30.00000000000000000000,
        //                  "tradeFee":0.00453300000000000000,
        //                  "txUuid":"11f3850cc6214ea3b495adad3a032794",
        //                  "dealPrice":0.15111300000000000000,
        //                  "dealVolumePrice":4.53339000000000000000,
        //                  "tradeType":"sell_market"
        //              }
        //          ],
        //          "error_code":0,
        //          "ts":1648509742164
        //      }
        //
        const trades = this.safeList(response, 'data', []);
        return this.parseTrades(trades, market, since, limit);
    }
    /**
     * @method
     * @name lbank#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://www.lbank.com/en-US/docs/index.html#query-all-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // default query is for canceled and completely filled orders
        // does not return open orders unless specified explicitly
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'symbol': market['id'],
            'current_page': 1,
            'page_length': limit,
            // 'status'  -1: Cancelled, 0: Unfilled, 1: Partially filled, 2: Completely filled, 3: Partially filled and cancelled, 4: Cancellation is being processed
        };
        const response = await this.spotPrivatePostSupplementOrdersInfoHistory(this.extend(request, params));
        //
        //      {
        //          "result":true,
        //          "data":{
        //              "total":1,
        //              "page_length":100,
        //              "orders":[
        //                  {
        //                      "cummulativeQuoteQty":0,
        //                      "symbol":"doge_usdt",
        //                      "executedQty":0,
        //                      "orderId":"2cadc7cc-b5f6-486b-a5b4-d6ac49a9c186",
        //                      "origQty":100,
        //                      "price":0.05,
        //                      "origQuoteOrderQty":5,
        //                      "updateTime":1648501384000,
        //                      "time":1648501363889,
        //                      "type":"buy",
        //                      "status":-1
        //                  }, ...
        //              ],
        //              "current_page":1
        //          },
        //          "error_code":0,
        //          "ts":1648505706348
        //      }
        //
        const result = this.safeValue(response, 'data', {});
        const orders = this.safeList(result, 'orders', []);
        return this.parseOrders(orders, market, since, limit);
    }
    /**
     * @method
     * @name lbank#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://www.lbank.com/en-US/docs/index.html#current-pending-order
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'symbol': market['id'],
            'current_page': 1,
            'page_length': limit,
        };
        const response = await this.spotPrivatePostSupplementOrdersInfoNoDeal(this.extend(request, params));
        //
        //      {
        //          "result":true,
        //          "data":{
        //              "total":1,
        //              "page_length":100,
        //              "orders":[
        //                  {
        //                      "cummulativeQuoteQty":0,
        //                      "symbol":"doge_usdt",
        //                      "executedQty":0,
        //                      "orderId":"73878edf-008d-4e4c-8041-df1f1b2cd8bb",
        //                      "origQty":100,
        //                      "price":0.05,
        //                      "origQuoteOrderQty":5,
        //                      "updateTime":1648501762000,
        //                      "time":1648501762353,
        //                      "type":"buy",
        //                      "status":0
        //                  }, ...
        //             ],
        //             "current_page":1
        //         },
        //         "error_code":0,
        //         "ts":1648506110196
        //     }
        //
        const result = this.safeValue(response, 'data', {});
        const orders = this.safeList(result, 'orders', []);
        return this.parseOrders(orders, market, since, limit);
    }
    /**
     * @method
     * @name lbank#cancelOrder
     * @description cancels an open order
     * @see https://www.lbank.com/en-US/docs/index.html#cancel-order-new
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
        const clientOrderId = this.safeString2(params, 'origClientOrderId', 'clientOrderId');
        params = this.omit(params, ['origClientOrderId', 'clientOrderId']);
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'orderId': id,
        };
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
        }
        const response = await this.spotPrivatePostSupplementCancelOrder(this.extend(request, params));
        //
        //   {
        //      "result":true,
        //      "data":{
        //          "executedQty":0.0,
        //          "price":0.05,
        //          "origQty":100.0,
        //          "tradeType":"buy",
        //          "status":0
        //      },
        //      "error_code":0,
        //      "ts":1648501286196
        //  }
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data);
    }
    /**
     * @method
     * @name lbank#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://www.lbank.com/en-US/docs/index.html#cancel-all-pending-orders-for-a-single-trading-pair
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.spotPrivatePostSupplementCancelOrderBySymbol(this.extend(request, params));
        //
        //      {
        //          "result":"true",
        //          "data":[
        //              {
        //                  "executedQty":0.00000000000000000000,
        //                  "orderId":"293ef71b-3e67-4962-af93-aa06990a045f",
        //                  "price":0.05000000000000000000,
        //                  "origQty":100.00000000000000000000,
        //                  "tradeType":"buy",
        //                  "status":0
        //              },
        //          ],
        //          "error_code":0,
        //          "ts":1648506641469
        //      }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data);
    }
    getNetworkCodeForCurrency(currencyCode, params) {
        const defaultNetworks = this.safeValue(this.options, 'defaultNetworks');
        const defaultNetwork = this.safeStringUpper(defaultNetworks, currencyCode);
        const networks = this.safeValue(this.options, 'networks', {});
        let network = this.safeStringUpper(params, 'network', defaultNetwork); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString(networks, network, network); // handle ERC20>ETH alias
        return network;
    }
    /**
     * @method
     * @name lbank#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.lbank.com/en-US/docs/index.html#get-deposit-address
     * @see https://www.lbank.com/en-US/docs/index.html#the-user-obtains-the-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const options = this.safeValue(this.options, 'fetchDepositAddress', {});
        const defaultMethod = this.safeString(options, 'method', 'fetchDepositAddressDefault');
        const method = this.safeString(params, 'method', defaultMethod);
        params = this.omit(params, 'method');
        let response = undefined;
        if (method === 'fetchDepositAddressSupplement') {
            response = await this.fetchDepositAddressSupplement(code, params);
        }
        else {
            response = await this.fetchDepositAddressDefault(code, params);
        }
        return response;
    }
    async fetchDepositAddressDefault(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'assetCode': currency['id'],
        };
        const network = this.getNetworkCodeForCurrency(code, params);
        if (network !== undefined) {
            request['netWork'] = network; // ... yes, really lol
            params = this.omit(params, 'network');
        }
        const response = await this.spotPrivatePostGetDepositAddress(this.extend(request, params));
        //
        //      {
        //          "result":true,
        //          "data":{
        //              "assetCode":"usdt",
        //              "address":"0xc85689d37ca650bf2f2161364cdedee21eb6ca53",
        //              "memo":null,
        //              "netWork":"bep20(bsc)"
        //              },
        //          "error_code":0,
        //          "ts":1648075865103
        //      }
        //
        const result = this.safeValue(response, 'data');
        const address = this.safeString(result, 'address');
        const tag = this.safeString(result, 'memo');
        const networkId = this.safeString(result, 'netWork');
        const inverseNetworks = this.safeValue(this.options, 'inverse-networks', {});
        const networkCode = this.safeStringUpper(inverseNetworks, networkId, networkId);
        return {
            'info': response,
            'currency': code,
            'network': networkCode,
            'address': address,
            'tag': tag,
        };
    }
    async fetchDepositAddressSupplement(code, params = {}) {
        // returns the address for whatever the default network is...
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'coin': currency['id'],
        };
        const networks = this.safeValue(this.options, 'networks');
        let network = this.safeStringUpper(params, 'network');
        network = this.safeString(networks, network, network);
        if (network !== undefined) {
            request['networkName'] = network;
            params = this.omit(params, 'network');
        }
        const response = await this.spotPrivatePostSupplementGetDepositAddress(this.extend(request, params));
        //
        //      {
        //          "result":true,
        //          "data":{
        //              "address":"TDxtabCC8iQwaxUUrPcE4WL2jArGAfvQ5A",
        //              "memo":null,
        //              "coin":"usdt"
        //              },
        //          "error_code":0,
        //          "ts":1648073818880
        //     }
        //
        const result = this.safeValue(response, 'data');
        const address = this.safeString(result, 'address');
        const tag = this.safeString(result, 'memo');
        const inverseNetworks = this.safeValue(this.options, 'inverse-networks', {});
        const networkCode = this.safeStringUpper(inverseNetworks, network, network);
        return {
            'info': response,
            'currency': code,
            'network': networkCode,
            'address': address,
            'tag': tag,
        };
    }
    /**
     * @method
     * @name lbank#withdraw
     * @description make a withdrawal
     * @see https://www.lbank.com/en-US/docs/index.html#withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        this.checkAddress(address);
        await this.loadMarkets();
        const fee = this.safeString(params, 'fee');
        params = this.omit(params, 'fee');
        // The relevant coin network fee can be found by calling fetchDepositWithdrawFees (), note: if no network param is supplied then the default network will be used, this can also be found in fetchDepositWithdrawFees ().
        this.checkRequiredArgument('withdraw', fee, 'fee');
        const currency = this.currency(code);
        const request = {
            'address': address,
            'coin': currency['id'],
            'amount': amount,
            'fee': fee, // the correct coin-network fee must be supplied, which can be found by calling fetchDepositWithdrawFees (private)
            // 'networkName': defaults to the defaultNetwork of the coin which can be found in the /supplement/user_info endpoint
            // 'memo': memo: memo word of bts and dct
            // 'mark': Withdrawal Notes
            // 'name': Remarks of the address. After filling in this parameter, it will be added to the withdrawal address book of the currency.
            // 'withdrawOrderId': withdrawOrderId
            // 'type': type=1 is for intra-site transfer
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const network = this.safeStringUpper2(params, 'network', 'networkName');
        params = this.omit(params, ['network', 'networkName']);
        const networks = this.safeValue(this.options, 'networks');
        const networkId = this.safeString(networks, network, network);
        if (networkId !== undefined) {
            request['networkName'] = networkId;
        }
        const response = await this.spotPrivatePostSupplementWithdraw(this.extend(request, params));
        //
        //      {
        //          "result":true,
        //          "data": {
        //              "fee":10.00000000000000000000,
        //              "withdrawId":1900376
        //              },
        //          "error_code":0,
        //          "ts":1648992501414
        //      }
        //
        const result = this.safeValue(response, 'data', {});
        return {
            'info': result,
            'id': this.safeString(result, 'withdrawId'),
        };
    }
    parseTransactionStatus(status, type) {
        const statuses = {
            'deposit': {
                '1': 'pending',
                '2': 'ok',
                '3': 'failed',
                '4': 'canceled',
                '5': 'transfer',
            },
            'withdrawal': {
                '1': 'pending',
                '2': 'canceled',
                '3': 'failed',
                '4': 'ok',
            },
        };
        return this.safeString(this.safeValue(statuses, type, {}), status, status);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // fetchDeposits (private)
        //
        //      {
        //          "insertTime":1649012310000,
        //          "amount":9.00000000000000000000,
        //          "address":"TYASr5UV6HEcXatwdFQfmLVUqQQQMUxHLS",
        //          "networkName":"trc20",
        //          "txId":"081e4e9351dd0274922168da5f2d14ea6c495b1c3b440244f4a6dd9fe196bf2b",
        //          "coin":"usdt",
        //          "status":"2"
        //      }
        //
        //
        // fetchWithdrawals (private)
        //
        //      {
        //          "amount":2.00000000000000000000,
        //          "address":"TBjrW5JHDyPZjFc5nrRMhRWUDaJmhGhmD6",
        //          "fee":1.00000000000000000000,
        //          "networkName":"trc20",
        //          "coid":"usdt",
        //          "transferType":"数字资产提现",
        //          "txId":"47eeee2763ad49b8817524dacfa7d092fb58f8b0ab7e5d25473314df1a793c3d",
        //          "id":1902194,
        //          "applyTime":1649014002000,
        //          "status":"4"
        //      }
        //
        const id = this.safeString(transaction, 'id');
        let type = undefined;
        if (id === undefined) {
            type = 'deposit';
        }
        else {
            type = 'withdrawal';
        }
        const txid = this.safeString(transaction, 'txId');
        const timestamp = this.safeInteger2(transaction, 'insertTime', 'applyTime');
        const networks = this.safeValue(this.options, 'inverse-networks', {});
        const networkId = this.safeString(transaction, 'networkName');
        const network = this.safeString(networks, networkId, networkId);
        const address = this.safeString(transaction, 'address');
        let addressFrom = undefined;
        let addressTo = undefined;
        if (type === 'deposit') {
            addressFrom = address;
        }
        else {
            addressTo = address;
        }
        const amount = this.safeNumber(transaction, 'amount');
        const currencyId = this.safeString2(transaction, 'coin', 'coid');
        const code = this.safeCurrencyCode(currencyId, currency);
        const status = this.parseTransactionStatus(this.safeString(transaction, 'status'), type);
        let fee = undefined;
        const feeCost = this.safeNumber(transaction, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'network': network,
            'address': address,
            'addressTo': addressTo,
            'addressFrom': addressFrom,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'comment': undefined,
            'internal': (status === 'transfer'),
            'fee': fee,
        };
    }
    /**
     * @method
     * @name lbank#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://www.lbank.com/en-US/docs/index.html#get-recharge-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
        // 'status': Recharge status: ("1","Applying"),("2","Recharge successful"),("3","Recharge failed"),("4","Already Cancel"), ("5", "Transfer")
        // 'endTime': end time, timestamp in milliseconds, default now
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.spotPrivatePostSupplementDepositHistory(this.extend(request, params));
        //
        //      {
        //          "result":true,
        //          "data": {
        //              "total":1,
        //              "depositOrders": [
        //                  {
        //                      "insertTime":1649012310000,
        //                      "amount":9.00000000000000000000,
        //                      "address":"TYASr5UV6HEcXatwdFQfmLVUqQQQMUxHLS",
        //                      "networkName":"trc20",
        //                      "txId":"081e4e9351dd0274922168da5f2d14ea6c495b1c3b440244f4a6dd9fe196bf2b",
        //                      "coin":"usdt",
        //                      "status":"2"
        //                  },
        //              ],
        //              "page_length":20,
        //              "current_page":1
        //          },
        //          "error_code":0,
        //          "ts":1649719721758
        //      }
        //
        const data = this.safeValue(response, 'data', {});
        const deposits = this.safeList(data, 'depositOrders', []);
        return this.parseTransactions(deposits, currency, since, limit);
    }
    /**
     * @method
     * @name lbank#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://www.lbank.com/en-US/docs/index.html#get-withdrawal-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
        // 'status': Recharge status: ("1","Applying"),("2","Recharge successful"),("3","Recharge failed"),("4","Already Cancel"), ("5", "Transfer")
        // 'endTime': end time, timestamp in milliseconds, default now
        // 'withdrawOrderId': Custom withdrawal id
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.spotPrivatePostSupplementWithdraws(this.extend(request, params));
        //
        //      {
        //          "result":true,
        //          "data": {
        //              "total":1,
        //              "withdraws": [
        //                  {
        //                      "amount":2.00000000000000000000,
        //                      "address":"TBjrW5JHDyPZjFc5nrRMhRWUDaJmhGhmD6",
        //                      "fee":1.00000000000000000000,
        //                      "networkName":"trc20",
        //                      "coid":"usdt",
        //                      "transferType":"数字资产提现",
        //                      "txId":"47eeee2763ad49b8817524dacfa7d092fb58f8b0ab7e5d25473314df1a793c3d",
        //                      "id":1902194,
        //                      "applyTime":1649014002000,
        //                      "status":"4"
        //                  },
        //              ],
        //              "page_length":20,
        //              "current_page":1
        //          },
        //          "error_code":0,
        //          "ts":1649720362362
        //      }
        //
        const data = this.safeValue(response, 'data', {});
        const withdraws = this.safeList(data, 'withdraws', []);
        return this.parseTransactions(withdraws, currency, since, limit);
    }
    /**
     * @method
     * @name lbank#fetchTransactionFees
     * @deprecated
     * @description please use fetchDepositWithdrawFees instead
     * @param {string[]|undefined} codes not used by lbank fetchTransactionFees ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTransactionFees(codes = undefined, params = {}) {
        // private only returns information for currencies with non-zero balance
        await this.loadMarkets();
        const isAuthorized = this.checkRequiredCredentials(false);
        let result = undefined;
        if (isAuthorized === true) {
            const options = this.safeValue(this.options, 'fetchTransactionFees', {});
            const defaultMethod = this.safeString(options, 'method', 'fetchPrivateTransactionFees');
            const method = this.safeString(params, 'method', defaultMethod);
            params = this.omit(params, 'method');
            if (method === 'fetchPublicTransactionFees') {
                result = await this.fetchPublicTransactionFees(params);
            }
            else {
                result = await this.fetchPrivateTransactionFees(params);
            }
        }
        else {
            result = await this.fetchPublicTransactionFees(params);
        }
        return result;
    }
    async fetchPrivateTransactionFees(params = {}) {
        // complete response
        // incl. for coins which undefined in public method
        await this.loadMarkets();
        const response = await this.spotPrivatePostSupplementUserInfo();
        //
        //    {
        //        "result": "true",
        //        "data": [
        //            {
        //                "usableAmt": "14.36",
        //                "assetAmt": "14.36",
        //                "networkList": [
        //                    {
        //                        "isDefault": false,
        //                        "withdrawFeeRate": "",
        //                        "name": "erc20",
        //                        "withdrawMin": 30,
        //                        "minLimit": 0.0001,
        //                        "minDeposit": 20,
        //                        "feeAssetCode": "usdt",
        //                        "withdrawFee": "30",
        //                        "type": 1,
        //                        "coin": "usdt",
        //                        "network": "eth"
        //                    },
        //                    ...
        //                ],
        //                "freezeAmt": "0",
        //                "coin": "ada"
        //            }
        //        ],
        //        "code": 0
        //    }
        //
        const result = this.safeValue(response, 'data', []);
        const withdrawFees = {};
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const currencyId = this.safeString(entry, 'coin');
            const code = this.safeCurrencyCode(currencyId);
            const networkList = this.safeValue(entry, 'networkList', []);
            withdrawFees[code] = {};
            for (let j = 0; j < networkList.length; j++) {
                const networkEntry = networkList[j];
                const networkId = this.safeString(networkEntry, 'name');
                const networkCode = this.safeString(this.options['inverse-networks'], networkId, networkId);
                const fee = this.safeNumber(networkEntry, 'withdrawFee');
                if (fee !== undefined) {
                    withdrawFees[code][networkCode] = fee;
                }
            }
        }
        return {
            'withdraw': withdrawFees,
            'deposit': {},
            'info': response,
        };
    }
    async fetchPublicTransactionFees(params = {}) {
        // extremely incomplete response
        // vast majority fees undefined
        await this.loadMarkets();
        const code = this.safeString2(params, 'coin', 'assetCode');
        params = this.omit(params, ['coin', 'assetCode']);
        const request = {};
        if (code !== undefined) {
            const currency = this.currency(code);
            request['assetCode'] = currency['id'];
        }
        const response = await this.spotPublicGetWithdrawConfigs(this.extend(request, params));
        //
        //    {
        //        "result": "true",
        //        "data": [
        //          {
        //            "amountScale": "4",
        //            "chain": "heco",
        //            "assetCode": "lbk",
        //            "min": "200",
        //            "transferAmtScale": "4",
        //            "canWithDraw": true,
        //            "fee": "100",
        //            "minTransfer": "0.0001",
        //            "type": "1"
        //          },
        //          ...
        //        ],
        //        "error_code": "0",
        //        "ts": "1663364435973"
        //    }
        //
        const result = this.safeValue(response, 'data', []);
        const withdrawFees = {};
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const canWithdraw = this.safeValue(item, 'canWithDraw');
            if (canWithdraw === 'true') {
                const currencyId = this.safeString(item, 'assetCode');
                const codeInner = this.safeCurrencyCode(currencyId);
                const chain = this.safeString(item, 'chain');
                let network = this.safeString(this.options['inverse-networks'], chain, chain);
                if (network === undefined) {
                    network = codeInner;
                }
                const fee = this.safeString(item, 'fee');
                if (withdrawFees[codeInner] === undefined) {
                    withdrawFees[codeInner] = {};
                }
                withdrawFees[codeInner][network] = this.parseNumber(fee);
            }
        }
        return {
            'withdraw': withdrawFees,
            'deposit': {},
            'info': response,
        };
    }
    /**
     * @method
     * @name lbank#fetchDepositWithdrawFees
     * @description when using private endpoint, only returns information for currencies with non-zero balance, use public method by specifying this.options['fetchDepositWithdrawFees']['method'] = 'fetchPublicDepositWithdrawFees'
     * @see https://www.lbank.com/en-US/docs/index.html#get-all-coins-information
     * @see https://www.lbank.com/en-US/docs/index.html#withdrawal-configurations
     * @param {string[]} [codes] array of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchDepositWithdrawFees(codes = undefined, params = {}) {
        await this.loadMarkets();
        const isAuthorized = this.checkRequiredCredentials(false);
        let response = undefined;
        if (isAuthorized === true) {
            const options = this.safeValue(this.options, 'fetchDepositWithdrawFees', {});
            const defaultMethod = this.safeString(options, 'method', 'fetchPrivateDepositWithdrawFees');
            const method = this.safeString(params, 'method', defaultMethod);
            params = this.omit(params, 'method');
            if (method === 'fetchPublicDepositWithdrawFees') {
                response = await this.fetchPublicDepositWithdrawFees(codes, params);
            }
            else {
                response = await this.fetchPrivateDepositWithdrawFees(codes, params);
            }
        }
        else {
            response = await this.fetchPublicDepositWithdrawFees(codes, params);
        }
        return response;
    }
    async fetchPrivateDepositWithdrawFees(codes = undefined, params = {}) {
        // complete response
        // incl. for coins which undefined in public method
        await this.loadMarkets();
        const response = await this.spotPrivatePostSupplementUserInfo(params);
        //
        //    {
        //        "result": "true",
        //        "data": [
        //            {
        //                "usableAmt": "14.36",
        //                "assetAmt": "14.36",
        //                "networkList": [
        //                    {
        //                        "isDefault": false,
        //                        "withdrawFeeRate": "",
        //                        "name": "erc20",
        //                        "withdrawMin": 30,
        //                        "minLimit": 0.0001,
        //                        "minDeposit": 20,
        //                        "feeAssetCode": "usdt",
        //                        "withdrawFee": "30",
        //                        "type": 1,
        //                        "coin": "usdt",
        //                        "network": "eth"
        //                    },
        //                    ...
        //                ],
        //                "freezeAmt": "0",
        //                "coin": "ada"
        //            }
        //        ],
        //        "code": 0
        //    }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseDepositWithdrawFees(data, codes, 'coin');
    }
    async fetchPublicDepositWithdrawFees(codes = undefined, params = {}) {
        // extremely incomplete response
        // vast majority fees undefined
        await this.loadMarkets();
        const request = {};
        const response = await this.spotPublicGetWithdrawConfigs(this.extend(request, params));
        //
        //    {
        //        "result": "true",
        //        "data": [
        //            {
        //                "amountScale": "4",
        //                "chain": "heco",
        //                "assetCode": "lbk",
        //                "min": "200",
        //                "transferAmtScale": "4",
        //                "canWithDraw": true,
        //                "fee": "100",
        //                "minTransfer": "0.0001",
        //                "type": "1"
        //            },
        //            ...
        //        ],
        //        "error_code": "0",
        //        "ts": "1663364435973"
        //    }
        //
        const data = this.safeValue(response, 'data', []);
        return this.parsePublicDepositWithdrawFees(data, codes);
    }
    parsePublicDepositWithdrawFees(response, codes = undefined) {
        //
        //    [
        //        {
        //            "amountScale": "4",
        //            "chain": "heco",
        //            "assetCode": "lbk",
        //            "min": "200",
        //            "transferAmtScale": "4",
        //            "canWithDraw": true,
        //            "fee": "100",
        //            "minTransfer": "0.0001",
        //            "type": "1"
        //        },
        //        ...
        //    ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const fee = response[i];
            const canWithdraw = this.safeValue(fee, 'canWithDraw');
            if (canWithdraw === true) {
                const currencyId = this.safeString(fee, 'assetCode');
                const code = this.safeCurrencyCode(currencyId);
                if (codes === undefined || this.inArray(code, codes)) {
                    const withdrawFee = this.safeNumber(fee, 'fee');
                    if (withdrawFee !== undefined) {
                        const resultValue = this.safeValue(result, code);
                        if (resultValue === undefined) {
                            result[code] = this.depositWithdrawFee([fee]);
                        }
                        else {
                            result[code]['info'].push(fee);
                        }
                        const chain = this.safeString(fee, 'chain');
                        const networkCode = this.safeString(this.options['inverse-networks'], chain, chain);
                        if (networkCode !== undefined) {
                            result[code]['networks'][networkCode] = {
                                'withdraw': {
                                    'fee': withdrawFee,
                                    'percentage': undefined,
                                },
                                'deposit': {
                                    'fee': undefined,
                                    'percentage': undefined,
                                },
                            };
                        }
                        else {
                            result[code]['withdraw'] = {
                                'fee': withdrawFee,
                                'percentage': undefined,
                            };
                        }
                    }
                }
            }
        }
        return result;
    }
    parseDepositWithdrawFee(fee, currency = undefined) {
        //
        // * only used for fetchPrivateDepositWithdrawFees
        //
        //    {
        //        "usableAmt": "14.36",
        //        "assetAmt": "14.36",
        //        "networkList": [
        //            {
        //                "isDefault": false,
        //                "withdrawFeeRate": "",
        //                "name": "erc20",
        //                "withdrawMin": 30,
        //                "minLimit": 0.0001,
        //                "minDeposit": 20,
        //                "feeAssetCode": "usdt",
        //                "withdrawFee": "30",
        //                "type": 1,
        //                "coin": "usdt",
        //                "network": "eth"
        //            },
        //            ...
        //        ],
        //        "freezeAmt": "0",
        //        "coin": "ada"
        //    }
        //
        const result = this.depositWithdrawFee(fee);
        const networkList = this.safeValue(fee, 'networkList', []);
        for (let j = 0; j < networkList.length; j++) {
            const networkEntry = networkList[j];
            const networkId = this.safeString(networkEntry, 'name');
            const networkCode = this.safeStringUpper(this.options['inverse-networks'], networkId, networkId);
            const withdrawFee = this.safeNumber(networkEntry, 'withdrawFee');
            const isDefault = this.safeValue(networkEntry, 'isDefault');
            if (withdrawFee !== undefined) {
                if (isDefault) {
                    result['withdraw'] = {
                        'fee': withdrawFee,
                        'percentage': undefined,
                    };
                }
                result['networks'][networkCode] = {
                    'withdraw': {
                        'fee': withdrawFee,
                        'percentage': undefined,
                    },
                    'deposit': {
                        'fee': undefined,
                        'percentage': undefined,
                    },
                };
            }
        }
        return result;
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = this.omit(params, this.extractParams(path));
        let url = this.urls['api']['rest'] + '/' + this.version + '/' + this.implodeParams(path, params);
        // Every spot endpoint ends with ".do"
        if (api[0] === 'spot') {
            url += '.do';
        }
        else {
            url = this.urls['api']['contract'] + '/' + this.implodeParams(path, params);
        }
        if (api[1] === 'public') {
            if (Object.keys(query).length) {
                url += '?' + this.urlencode(this.keysort(query));
            }
        }
        else {
            this.checkRequiredCredentials();
            const timestamp = this.milliseconds().toString();
            const echostr = this.uuid22() + this.uuid16();
            query = this.extend({
                'api_key': this.apiKey,
            }, query);
            let signatureMethod = undefined;
            if (this.secret.length > 32) {
                signatureMethod = 'RSA';
            }
            else {
                signatureMethod = 'HmacSHA256';
            }
            const auth = this.rawencode(this.keysort(this.extend({
                'echostr': echostr,
                'signature_method': signatureMethod,
                'timestamp': timestamp,
            }, query)));
            const encoded = this.encode(auth);
            const hash = this.hash(encoded, md5.md5);
            const uppercaseHash = hash.toUpperCase();
            let sign = undefined;
            if (signatureMethod === 'RSA') {
                const cacheSecretAsPem = this.safeBool(this.options, 'cacheSecretAsPem', true);
                let pem = undefined;
                if (cacheSecretAsPem) {
                    pem = this.safeValue(this.options, 'pem');
                    if (pem === undefined) {
                        pem = this.convertSecretToPem(this.encode(this.secret));
                        this.options['pem'] = pem;
                    }
                }
                else {
                    pem = this.convertSecretToPem(this.encode(this.secret));
                }
                sign = rsa.rsa(uppercaseHash, pem, sha256.sha256);
            }
            else if (signatureMethod === 'HmacSHA256') {
                sign = this.hmac(this.encode(uppercaseHash), this.encode(this.secret), sha256.sha256);
            }
            query['sign'] = sign;
            body = this.urlencode(this.keysort(query));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'timestamp': timestamp,
                'signature_method': signatureMethod,
                'echostr': echostr,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    convertSecretToPem(secret) {
        const lineLength = 64;
        const secretLength = secret.length - 0;
        let numLines = this.parseToInt(secretLength / lineLength);
        numLines = this.sum(numLines, 1);
        let pem = "-----BEGIN PRIVATE KEY-----\n"; // eslint-disable-line
        for (let i = 0; i < numLines; i++) {
            const start = i * lineLength;
            const end = this.sum(start, lineLength);
            pem += this.secret.slice(start, end) + "\n"; // eslint-disable-line
        }
        return pem + '-----END PRIVATE KEY-----';
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const success = this.safeValue(response, 'result');
        if (success === 'false' || !success) {
            const errorCode = this.safeString(response, 'error_code');
            const message = this.safeString({
                '10000': 'Internal error',
                '10001': 'The required parameters can not be empty',
                '10002': 'Validation failed',
                '10003': 'Invalid parameter',
                '10004': 'Request too frequent',
                '10005': 'Secret key does not exist',
                '10006': 'User does not exist',
                '10007': 'Invalid signature',
                '10008': 'Invalid Trading Pair',
                '10009': 'Price and/or Amount are required for limit order',
                '10010': 'Price and/or Amount must be less than minimum requirement',
                // '10011': 'Market orders can not be missing the amount of the order',
                // '10012': 'market sell orders can not be missing orders',
                '10013': 'The amount is too small',
                '10014': 'Insufficient amount of money in the account',
                '10015': 'Invalid order type',
                '10016': 'Insufficient account balance',
                '10017': 'Server Error',
                '10018': 'Page size should be between 1 and 50',
                '10019': 'Cancel NO more than 3 orders in one request',
                '10020': 'Volume < 0.001',
                '10021': 'Price < 0.01',
                '10022': 'Invalid authorization',
                '10023': 'Market Order is not supported yet',
                '10024': 'User cannot trade on this pair',
                '10025': 'Order has been filled',
                '10026': 'Order has been cancelld',
                '10027': 'Order is cancelling',
                '10028': 'Wrong query time',
                '10029': 'from is not in the query time',
                '10030': 'from do not match the transaction type of inqury',
                '10031': 'echostr length must be valid and length must be from 30 to 40',
                '10033': 'Failed to create order',
                '10036': 'customID duplicated',
                '10100': 'Has no privilege to withdraw',
                '10101': 'Invalid fee rate to withdraw',
                '10102': 'Too little to withdraw',
                '10103': 'Exceed daily limitation of withdraw',
                '10104': 'Cancel was rejected',
                '10105': 'Request has been cancelled',
                '10106': 'None trade time',
                '10107': 'Start price exception',
                '10108': 'can not create order',
                '10109': 'wallet address is not mapping',
                '10110': 'transfer fee is not mapping',
                '10111': 'mount > 0',
                '10112': 'fee is too lower',
                '10113': 'transfer fee is 0',
                '10600': 'intercepted by replay attacks filter, check timestamp',
                '10601': 'Interface closed unavailable',
                '10701': 'invalid asset code',
                '10702': 'not allowed deposit',
            }, errorCode, this.json(response));
            const ErrorClass = this.safeValue({
                '10001': errors.BadRequest,
                '10002': errors.AuthenticationError,
                '10003': errors.BadRequest,
                '10004': errors.RateLimitExceeded,
                '10005': errors.AuthenticationError,
                '10006': errors.AuthenticationError,
                '10007': errors.AuthenticationError,
                '10008': errors.BadSymbol,
                '10009': errors.InvalidOrder,
                '10010': errors.InvalidOrder,
                '10013': errors.InvalidOrder,
                '10014': errors.InsufficientFunds,
                '10015': errors.InvalidOrder,
                '10016': errors.InsufficientFunds,
                '10017': errors.ExchangeError,
                '10018': errors.BadRequest,
                '10019': errors.BadRequest,
                '10020': errors.BadRequest,
                '10021': errors.InvalidOrder,
                '10022': errors.PermissionDenied,
                '10023': errors.InvalidOrder,
                '10024': errors.PermissionDenied,
                '10025': errors.InvalidOrder,
                '10026': errors.InvalidOrder,
                '10027': errors.InvalidOrder,
                '10028': errors.BadRequest,
                '10029': errors.BadRequest,
                '10030': errors.BadRequest,
                '10031': errors.InvalidNonce,
                '10033': errors.ExchangeError,
                '10036': errors.DuplicateOrderId,
                '10100': errors.PermissionDenied,
                '10101': errors.BadRequest,
                '10102': errors.InsufficientFunds,
                '10103': errors.ExchangeError,
                '10104': errors.ExchangeError,
                '10105': errors.ExchangeError,
                '10106': errors.BadRequest,
                '10107': errors.BadRequest,
                '10108': errors.ExchangeError,
                '10109': errors.InvalidAddress,
                '10110': errors.ExchangeError,
                '10111': errors.BadRequest,
                '10112': errors.BadRequest,
                '10113': errors.BadRequest,
                '10600': errors.BadRequest,
                '10601': errors.ExchangeError,
                '10701': errors.BadSymbol,
                '10702': errors.PermissionDenied, // 'not allowed deposit',
            }, errorCode, errors.ExchangeError);
            throw new ErrorClass(message);
        }
        return undefined;
    }
}

module.exports = lbank;
