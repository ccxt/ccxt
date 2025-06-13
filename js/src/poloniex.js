//  ---------------------------------------------------------------------------
import Exchange from './abstract/poloniex.js';
import { ArgumentsRequired, ExchangeError, ExchangeNotAvailable, NotSupported, RequestTimeout, AuthenticationError, PermissionDenied, InsufficientFunds, OrderNotFound, InvalidOrder, AccountSuspended, OnMaintenance, BadSymbol, BadRequest } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
//  ---------------------------------------------------------------------------
/**
 * @class poloniex
 * @augments Exchange
 */
export default class poloniex extends Exchange {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'poloniex',
            'name': 'Poloniex',
            'countries': ['US'],
            // 200 requests per second for some unauthenticated market endpoints => 1000ms / 200 = 5ms between requests
            'rateLimit': 5,
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': undefined,
                'createDepositAddress': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': undefined,
                'createStopOrder': true,
                'createTriggerOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrder': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': undefined,
                'fetchLedger': undefined,
                'fetchLeverage': true,
                'fetchLiquidations': undefined,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositionMode': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': 'emulated',
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'sandbox': true,
                'setLeverage': true,
                'setPositionMode': true,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 'MINUTE_1',
                '5m': 'MINUTE_5',
                '10m': 'MINUTE_10',
                '15m': 'MINUTE_15',
                '30m': 'MINUTE_30',
                '1h': 'HOUR_1',
                '2h': 'HOUR_2',
                '4h': 'HOUR_4',
                '6h': 'HOUR_6',
                '12h': 'HOUR_12',
                '1d': 'DAY_1',
                '3d': 'DAY_3',
                '1w': 'WEEK_1',
                '1M': 'MONTH_1', // not in swap
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg',
                'api': {
                    'spot': 'https://api.poloniex.com',
                    'swap': 'https://api.poloniex.com',
                },
                'test': {
                    'spot': 'https://sand-spot-api-gateway.poloniex.com',
                },
                'www': 'https://www.poloniex.com',
                'doc': 'https://api-docs.poloniex.com/spot/',
                'fees': 'https://poloniex.com/fees',
                'referral': 'https://poloniex.com/signup?c=UBFZJRPJ',
            },
            'api': {
                'public': {
                    'get': {
                        'markets': 20,
                        'markets/{symbol}': 1,
                        'currencies': 20,
                        'currencies/{currency}': 20,
                        'v2/currencies': 20,
                        'v2/currencies/{currency}': 20,
                        'timestamp': 1,
                        'markets/price': 1,
                        'markets/{symbol}/price': 1,
                        'markets/markPrice': 1,
                        'markets/{symbol}/markPrice': 1,
                        'markets/{symbol}/markPriceComponents': 1,
                        'markets/{symbol}/orderBook': 1,
                        'markets/{symbol}/candles': 1,
                        'markets/{symbol}/trades': 20,
                        'markets/ticker24h': 20,
                        'markets/{symbol}/ticker24h': 20,
                        'markets/collateralInfo': 1,
                        'markets/{currency}/collateralInfo': 1,
                        'markets/borrowRatesInfo': 1,
                    },
                },
                'private': {
                    'get': {
                        'accounts': 4,
                        'accounts/balances': 4,
                        'accounts/{id}/balances': 4,
                        'accounts/activity': 20,
                        'accounts/transfer': 20,
                        'accounts/transfer/{id}': 4,
                        'feeinfo': 20,
                        'accounts/interest/history': 1,
                        'subaccounts': 4,
                        'subaccounts/balances': 20,
                        'subaccounts/{id}/balances': 4,
                        'subaccounts/transfer': 20,
                        'subaccounts/transfer/{id}': 4,
                        'wallets/addresses': 20,
                        'wallets/addresses/{currency}': 20,
                        'wallets/activity': 20,
                        'margin/accountMargin': 4,
                        'margin/borrowStatus': 4,
                        'margin/maxSize': 4,
                        'orders': 20,
                        'orders/{id}': 4,
                        'orders/killSwitchStatus': 4,
                        'smartorders': 20,
                        'smartorders/{id}': 4,
                        'orders/history': 20,
                        'smartorders/history': 20,
                        'trades': 20,
                        'orders/{id}/trades': 4,
                    },
                    'post': {
                        'accounts/transfer': 4,
                        'subaccounts/transfer': 20,
                        'wallets/address': 20,
                        'wallets/withdraw': 20,
                        'v2/wallets/withdraw': 20,
                        'orders': 4,
                        'orders/batch': 20,
                        'orders/killSwitch': 4,
                        'smartorders': 4,
                    },
                    'delete': {
                        'orders/{id}': 4,
                        'orders/cancelByIds': 20,
                        'orders': 20,
                        'smartorders/{id}': 4,
                        'smartorders/cancelByIds': 20,
                        'smartorders': 20,
                    },
                    'put': {
                        'orders/{id}': 20,
                        'smartorders/{id}': 20,
                    },
                },
                'swapPublic': {
                    'get': {
                        // 300 calls / second
                        'v3/market/allInstruments': 2 / 3,
                        'v3/market/instruments': 2 / 3,
                        'v3/market/orderBook': 2 / 3,
                        'v3/market/candles': 10,
                        'v3/market/indexPriceCandlesticks': 10,
                        'v3/market/premiumIndexCandlesticks': 10,
                        'v3/market/markPriceCandlesticks': 10,
                        'v3/market/trades': 2 / 3,
                        'v3/market/liquidationOrder': 2 / 3,
                        'v3/market/tickers': 2 / 3,
                        'v3/market/markPrice': 2 / 3,
                        'v3/market/indexPrice': 2 / 3,
                        'v3/market/indexPriceComponents': 2 / 3,
                        'v3/market/fundingRate': 2 / 3,
                        'v3/market/openInterest': 2 / 3,
                        'v3/market/insurance': 2 / 3,
                        'v3/market/riskLimit': 2 / 3,
                    },
                },
                'swapPrivate': {
                    'get': {
                        'v3/account/balance': 4,
                        'v3/account/bills': 20,
                        'v3/trade/order/opens': 20,
                        'v3/trade/order/trades': 20,
                        'v3/trade/order/history': 20,
                        'v3/trade/position/opens': 20,
                        'v3/trade/position/history': 20,
                        'v3/position/leverages': 20,
                        'v3/position/mode': 20,
                    },
                    'post': {
                        'v3/trade/order': 4,
                        'v3/trade/orders': 40,
                        'v3/trade/position': 20,
                        'v3/trade/positionAll': 100,
                        'v3/position/leverage': 20,
                        'v3/position/mode': 20,
                        'v3/trade/position/margin': 20,
                    },
                    'delete': {
                        'v3/trade/order': 2,
                        'v3/trade/batchOrders': 20,
                        'v3/trade/allOrders': 20,
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    // starting from Jan 8 2020
                    'maker': this.parseNumber('0.0009'),
                    'taker': this.parseNumber('0.0009'),
                },
                'funding': {},
            },
            'commonCurrencies': {
                'AIR': 'AirCoin',
                'APH': 'AphroditeCoin',
                'BCC': 'BTCtalkcoin',
                'BCHABC': 'BCHABC',
                'BDG': 'Badgercoin',
                'BTM': 'Bitmark',
                'CON': 'Coino',
                'ETHTRON': 'ETH',
                'GOLD': 'GoldEagles',
                'GPUC': 'GPU',
                'HOT': 'Hotcoin',
                'ITC': 'Information Coin',
                'KEY': 'KEYCoin',
                'MASK': 'NFTX Hashmasks Index',
                'MEME': 'Degenerator Meme',
                'PLX': 'ParallaxCoin',
                'REPV2': 'REP',
                'STR': 'XLM',
                'SOC': 'SOCC',
                'TRADE': 'Unitrade',
                'TRXETH': 'TRX',
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
                'USDTBSC': 'USDT',
                'USDTTRON': 'USDT',
                'USDTETH': 'USDT',
                'UST': 'USTC',
            },
            'options': {
                'defaultType': 'spot',
                'createMarketBuyOrderRequiresPrice': true,
                'networks': {
                    'BEP20': 'BSC',
                    'ERC20': 'ETH',
                    'TRC20': 'TRON',
                    'TRX': 'TRON',
                },
                'networksById': {
                    'TRX': 'TRC20',
                    'TRON': 'TRC20',
                },
                'limits': {
                    'cost': {
                        'min': {
                            'BTC': 0.0001,
                            'ETH': 0.0001,
                            'USDT': 1.0,
                            'TRX': 100,
                            'BNB': 0.06,
                            'USDC': 1.0,
                            'USDJ': 1.0,
                            'TUSD': 0.0001,
                            'DAI': 1.0,
                            'PAX': 1.0,
                            'BUSD': 1.0,
                        },
                    },
                },
                'accountsByType': {
                    'spot': 'spot',
                    'future': 'futures',
                },
                'accountsById': {
                    'exchange': 'spot',
                    'futures': 'future',
                },
            },
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': true,
                        'trailing': false,
                        'iceberg': false,
                    },
                    'createOrders': {
                        'max': 20,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': 100000,
                        'untilDays': 100000,
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
                        'limit': 2000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 500,
                    },
                },
                'spot': {
                    'extends': 'default',
                },
                'forContracts': {
                    'extends': 'default',
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': false,
                        'hedged': true,
                        'stpMode': true,
                        'marketBuyByCost': false,
                    },
                    'createOrders': {
                        'max': 10,
                    },
                    'fetchOpenOrders': {
                        'limit': 100,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'daysBackCanceled': 1 / 6,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchMyTrades': {
                        'limit': 100,
                        'untilDays': 90,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'forContracts',
                    },
                    'inverse': {
                        'extends': 'forContracts',
                    },
                },
                'future': {
                    'linear': {
                        'extends': 'forContracts',
                    },
                    'inverse': {
                        'extends': 'forContracts',
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    // General
                    '500': ExchangeNotAvailable,
                    '603': RequestTimeout,
                    '601': BadRequest,
                    '415': ExchangeError,
                    '602': ArgumentsRequired,
                    // Accounts
                    '21604': BadRequest,
                    '21600': AuthenticationError,
                    '21605': AuthenticationError,
                    '21102': ExchangeError,
                    '21100': AuthenticationError,
                    '21704': AuthenticationError,
                    '21700': BadRequest,
                    '21705': BadRequest,
                    '21707': ExchangeError,
                    '21708': BadRequest,
                    '21601': AccountSuspended,
                    '21711': ExchangeError,
                    '21709': InsufficientFunds,
                    '250000': ExchangeError,
                    '250001': BadRequest,
                    '250002': BadRequest,
                    '250003': BadRequest,
                    '250004': BadRequest,
                    '250005': InsufficientFunds,
                    '250008': BadRequest,
                    '250012': ExchangeError,
                    // Trading
                    '21110': BadRequest,
                    '10040': BadSymbol,
                    '10060': ExchangeError,
                    '10020': BadSymbol,
                    '10041': BadSymbol,
                    '21340': OnMaintenance,
                    '21341': InvalidOrder,
                    '21342': InvalidOrder,
                    '21343': InvalidOrder,
                    '21351': AccountSuspended,
                    '21352': BadSymbol,
                    '21353': PermissionDenied,
                    '21354': PermissionDenied,
                    '21359': OrderNotFound,
                    '21360': InvalidOrder,
                    '24106': BadRequest,
                    '24201': ExchangeNotAvailable,
                    // Orders
                    '21301': OrderNotFound,
                    '21302': ExchangeError,
                    '21304': ExchangeError,
                    '21305': OrderNotFound,
                    '21307': ExchangeError,
                    '21309': InvalidOrder,
                    '21310': InvalidOrder,
                    '21311': InvalidOrder,
                    '21312': InvalidOrder,
                    '21314': InvalidOrder,
                    '21315': InvalidOrder,
                    '21317': InvalidOrder,
                    '21319': InvalidOrder,
                    '21320': InvalidOrder,
                    '21321': InvalidOrder,
                    '21322': InvalidOrder,
                    '21324': BadRequest,
                    '21327': InvalidOrder,
                    '21328': InvalidOrder,
                    '21330': InvalidOrder,
                    '21335': InvalidOrder,
                    '21336': InvalidOrder,
                    '21337': InvalidOrder,
                    '21344': InvalidOrder,
                    '21345': InvalidOrder,
                    '21346': InvalidOrder,
                    '21348': InvalidOrder,
                    '21347': InvalidOrder,
                    '21349': InvalidOrder,
                    '21350': InvalidOrder,
                    '21355': ExchangeError,
                    '21356': BadRequest,
                    '21721': InsufficientFunds,
                    '24101': BadSymbol,
                    '24102': InvalidOrder,
                    '24103': InvalidOrder,
                    '24104': InvalidOrder,
                    '24105': InvalidOrder,
                    '25020': InvalidOrder,
                    // Smartorders
                    '25000': InvalidOrder,
                    '25001': InvalidOrder,
                    '25002': InvalidOrder,
                    '25003': ExchangeError,
                    '25004': InvalidOrder,
                    '25005': ExchangeError,
                    '25006': InvalidOrder,
                    '25007': InvalidOrder,
                    '25008': InvalidOrder,
                    '25009': ExchangeError,
                    '25010': PermissionDenied,
                    '25011': InvalidOrder,
                    '25012': ExchangeError,
                    '25013': OrderNotFound,
                    '25014': OrderNotFound,
                    '25015': OrderNotFound,
                    '25016': ExchangeError,
                    '25017': ExchangeError,
                    '25018': BadRequest,
                    '25019': BadSymbol, // Invalid symbol
                },
                'broad': {},
            },
        });
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        // spot:
        //
        //     [
        //         [
        //             "22814.01",
        //             "22937.42",
        //             "22832.57",
        //             "22937.42",
        //             "3916.58764051",
        //             "0.171199",
        //             "2982.64647063",
        //             "0.130295",
        //             33,
        //             0,
        //             "22877.449915304470460711",
        //             "MINUTE_5",
        //             1659664800000,
        //             1659665099999
        //         ]
        //     ]
        //
        // contract:
        //
        //           [
        //             "84207.02",
        //             "84320.85",
        //             "84207.02",
        //             "84253.83",
        //             "3707.5395",
        //             "44",
        //             "14",
        //             "1740770040000",
        //             "1740770099999",
        //           ],
        //
        const ohlcvLength = ohlcv.length;
        const isContract = ohlcvLength === 9;
        if (isContract) {
            return [
                this.safeInteger(ohlcv, 7),
                this.safeNumber(ohlcv, 2),
                this.safeNumber(ohlcv, 1),
                this.safeNumber(ohlcv, 0),
                this.safeNumber(ohlcv, 3),
                this.safeNumber(ohlcv, 5),
            ];
        }
        return [
            this.safeInteger(ohlcv, 12),
            this.safeNumber(ohlcv, 2),
            this.safeNumber(ohlcv, 1),
            this.safeNumber(ohlcv, 0),
            this.safeNumber(ohlcv, 3),
            this.safeNumber(ohlcv, 5),
        ];
    }
    /**
     * @method
     * @name poloniex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api-docs.poloniex.com/spot/api/public/market-data#candles
     * @see https://api-docs.poloniex.com/v3/futures/api/market/get-kline-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchOHLCV', symbol, since, limit, timeframe, params, 500);
        }
        const market = this.market(symbol);
        let request = {
            'symbol': market['id'],
            'interval': this.safeString(this.timeframes, timeframe, timeframe),
        };
        const keyStart = market['spot'] ? 'startTime' : 'sTime';
        const keyEnd = market['spot'] ? 'endTime' : 'eTime';
        if (since !== undefined) {
            request[keyStart] = since;
        }
        if (limit !== undefined) {
            // limit should in between 100 and 500
            request['limit'] = limit;
        }
        [request, params] = this.handleUntilOption(keyEnd, request, params);
        if (market['contract']) {
            if (this.inArray(timeframe, ['10m', '1M'])) {
                throw new NotSupported(this.id + ' ' + timeframe + ' ' + market['type'] + ' fetchOHLCV is not supported');
            }
            const responseRaw = await this.swapPublicGetV3MarketCandles(this.extend(request, params));
            //
            //     {
            //         code: "200",
            //         msg: "Success",
            //         data: [
            //           [
            //             "84207.02",
            //             "84320.85",
            //             "84207.02",
            //             "84253.83",
            //             "3707.5395",
            //             "44",
            //             "14",
            //             "1740770040000",
            //             "1740770099999",
            //           ],
            //
            const data = this.safeList(responseRaw, 'data');
            return this.parseOHLCVs(data, market, timeframe, since, limit);
        }
        const response = await this.publicGetMarketsSymbolCandles(this.extend(request, params));
        //
        //     [
        //         [
        //             "22814.01",
        //             "22937.42",
        //             "22832.57",
        //             "22937.42",
        //             "3916.58764051",
        //             "0.171199",
        //             "2982.64647063",
        //             "0.130295",
        //             33,
        //             0,
        //             "22877.449915304470460711",
        //             "MINUTE_5",
        //             1659664800000,
        //             1659665099999
        //         ]
        //     ]
        //
        return this.parseOHLCVs(response, market, timeframe, since, limit);
    }
    async loadMarkets(reload = false, params = {}) {
        const markets = await super.loadMarkets(reload, params);
        const currenciesByNumericId = this.safeValue(this.options, 'currenciesByNumericId');
        if ((currenciesByNumericId === undefined) || reload) {
            this.options['currenciesByNumericId'] = this.indexBy(this.currencies, 'numericId');
        }
        return markets;
    }
    /**
     * @method
     * @name poloniex#fetchMarkets
     * @description retrieves data on all markets for poloniex
     * @see https://api-docs.poloniex.com/spot/api/public/reference-data#symbol-information
     * @see https://api-docs.poloniex.com/v3/futures/api/market/get-all-product-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const promises = [this.fetchSpotMarkets(params), this.fetchSwapMarkets(params)];
        const results = await Promise.all(promises);
        return this.arrayConcat(results[0], results[1]);
    }
    async fetchSpotMarkets(params = {}) {
        const markets = await this.publicGetMarkets(params);
        //
        //     [
        //         {
        //             "symbol" : "BTS_BTC",
        //             "baseCurrencyName" : "BTS",
        //             "quoteCurrencyName" : "BTC",
        //             "displayName" : "BTS/BTC",
        //             "state" : "NORMAL",
        //             "visibleStartTime" : 1659018816626,
        //             "tradableStartTime" : 1659018816626,
        //             "symbolTradeLimit" : {
        //                 "symbol" : "BTS_BTC",
        //                 "priceScale" : 10,
        //                 "quantityScale" : 0,
        //                 "amountScale" : 8,
        //                 "minQuantity" : "100",
        //                 "minAmount" : "0.00001",
        //                 "highestBid" : "0",
        //                 "lowestAsk" : "0"
        //             }
        //         }
        //     ]
        //
        return this.parseMarkets(markets);
    }
    async fetchSwapMarkets(params = {}) {
        // do similar as spot per https://api-docs.poloniex.com/v3/futures/api/market/get-product-info
        const response = await this.swapPublicGetV3MarketAllInstruments(params);
        //
        //    {
        //        "code": "200",
        //        "msg": "Success",
        //        "data": [
        //            {
        //                "symbol": "BNB_USDT_PERP",
        //                "bAsset": ".PBNBUSDT",
        //                "bCcy": "BNB",
        //                "qCcy": "USDT",
        //                "visibleStartTime": "1620390600000",
        //                "tradableStartTime": "1620390600000",
        //                "sCcy": "USDT",
        //                "tSz": "0.001",
        //                "pxScale": "0.001,0.01,0.1,1,10",
        //                "lotSz": "1",
        //                "minSz": "1",
        //                "ctVal": "0.1",
        //                "status": "OPEN",
        //                "oDate": "1620287590000",
        //                "maxPx": "1000000",
        //                "minPx": "0.001",
        //                "maxQty": "1000000",
        //                "minQty": "1",
        //                "maxLever": "50",
        //                "lever": "10",
        //                "ctType": "LINEAR",
        //                "alias": "",
        //                "iM": "0.02",
        //                "mM": "0.0115",
        //                "mR": "2000",
        //                "buyLmt": "",
        //                "sellLmt": "",
        //                "ordPxRange": "0.05",
        //                "marketMaxQty": "2800",
        //                "limitMaxQty": "1000000"
        //            },
        //
        const markets = this.safeList(response, 'data');
        return this.parseMarkets(markets);
    }
    parseMarket(market) {
        if ('ctType' in market) {
            return this.parseSwapMarket(market);
        }
        else {
            return this.parseSpotMarket(market);
        }
    }
    parseSpotMarket(market) {
        const id = this.safeString(market, 'symbol');
        const baseId = this.safeString(market, 'baseCurrencyName');
        const quoteId = this.safeString(market, 'quoteCurrencyName');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const state = this.safeString(market, 'state');
        const active = state === 'NORMAL';
        const symbolTradeLimit = this.safeValue(market, 'symbolTradeLimit');
        // these are known defaults
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
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber(this.parsePrecision(this.safeString(symbolTradeLimit, 'quantityScale'))),
                'price': this.parseNumber(this.parsePrecision(this.safeString(symbolTradeLimit, 'priceScale'))),
            },
            'limits': {
                'amount': {
                    'min': this.safeNumber(symbolTradeLimit, 'minQuantity'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber(symbolTradeLimit, 'minAmount'),
                    'max': undefined,
                },
            },
            'created': this.safeInteger(market, 'tradableStartTime'),
            'info': market,
        };
    }
    parseSwapMarket(market) {
        //
        //            {
        //                "symbol": "BNB_USDT_PERP",
        //                "bAsset": ".PBNBUSDT",
        //                "bCcy": "BNB",
        //                "qCcy": "USDT",
        //                "visibleStartTime": "1620390600000",
        //                "tradableStartTime": "1620390600000",
        //                "sCcy": "USDT",
        //                "tSz": "0.001",
        //                "pxScale": "0.001,0.01,0.1,1,10",
        //                "lotSz": "1",
        //                "minSz": "1",
        //                "ctVal": "0.1",
        //                "status": "OPEN",
        //                "oDate": "1620287590000",
        //                "maxPx": "1000000",
        //                "minPx": "0.001",
        //                "maxQty": "1000000",
        //                "minQty": "1",
        //                "maxLever": "50",
        //                "lever": "10",
        //                "ctType": "LINEAR",
        //                "alias": "",
        //                "iM": "0.02",
        //                "mM": "0.0115",
        //                "mR": "2000",
        //                "buyLmt": "",
        //                "sellLmt": "",
        //                "ordPxRange": "0.05",
        //                "marketMaxQty": "2800",
        //                "limitMaxQty": "1000000"
        //            },
        //
        const id = this.safeString(market, 'symbol');
        const baseId = this.safeString(market, 'bCcy');
        const quoteId = this.safeString(market, 'qCcy');
        const settleId = this.safeString(market, 'sCcy');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const settle = this.safeCurrencyCode(settleId);
        const status = this.safeString(market, 'status');
        const active = status === 'OPEN';
        const linear = market['ctType'] === 'LINEAR';
        let symbol = base + '/' + quote;
        if (linear) {
            symbol += ':' + settle;
        }
        else {
            // actually, exchange does not have any inverse future now
            symbol += ':' + base;
        }
        const alias = this.safeString(market, 'alias');
        let type = 'swap';
        if (alias !== undefined) {
            type = 'future';
        }
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': (type === 'future') ? 'future' : 'swap',
            'spot': false,
            'margin': false,
            'swap': type === 'swap',
            'future': type === 'future',
            'option': false,
            'active': active,
            'contract': true,
            'linear': linear,
            'inverse': !linear,
            'contractSize': this.safeNumber(market, 'ctVal'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'taker': this.safeNumber(market, 'tFee'),
            'maker': this.safeNumber(market, 'mFee'),
            'precision': {
                'amount': this.safeNumber(market, 'lotSz'),
                'price': this.safeNumber(market, 'tSz'),
            },
            'limits': {
                'amount': {
                    'min': this.safeNumber(market, 'minSz'),
                    'max': this.safeNumber(market, 'limitMaxQty'),
                },
                'price': {
                    'min': this.safeNumber(market, 'minPx'),
                    'max': this.safeNumber(market, 'maxPx'),
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
                'leverage': {
                    'max': this.safeNumber(market, 'maxLever'),
                    'min': undefined,
                },
            },
            'created': this.safeInteger(market, 'oDate'),
            'info': market,
        };
    }
    /**
     * @method
     * @name poloniex#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://api-docs.poloniex.com/spot/api/public/reference-data#system-timestamp
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.publicGetTimestamp(params);
        return this.safeInteger(response, 'serverTime');
    }
    parseTicker(ticker, market = undefined) {
        //
        //  spot:
        //
        //     {
        //         "symbol" : "BTC_USDT",
        //         "open" : "26053.33",
        //         "low" : "26053.33",
        //         "high" : "26798.02",
        //         "close" : "26447.58",
        //         "quantity" : "6116.210188",
        //         "amount" : "161082122.88450926",
        //         "tradeCount" : "134709",
        //         "startTime" : "1692784440000",
        //         "closeTime" : "1692870839630",
        //         "displayName" : "BTC/USDT",
        //         "dailyChange" : "0.0151",
        //         "bid" : "26447.57",
        //         "bidQuantity" : "0.016313",
        //         "ask" : "26447.58",
        //         "askQuantity" : "0.068307",
        //         "ts" : "1692870845446",
        //         "markPrice" : "26444.11"
        //     }
        //
        //  swap:
        //
        //            {
        //                "s": "XRP_USDT_PERP",
        //                "o": "2.0503",
        //                "l": "2.0066",
        //                "h": "2.216",
        //                "c": "2.1798",
        //                "qty": "21090",
        //                "amt": "451339.65",
        //                "tC": "3267",
        //                "sT": "1740736380000",
        //                "cT": "1740822777559",
        //                "dN": "XRP/USDT/PERP",
        //                "dC": "0.0632",
        //                "bPx": "2.175",
        //                "bSz": "3",
        //                "aPx": "2.1831",
        //                "aSz": "111",
        //                "mPx": "2.1798",
        //                "iPx": "2.1834"
        //            },
        //
        const timestamp = this.safeInteger2(ticker, 'ts', 'cT');
        const marketId = this.safeString2(ticker, 'symbol', 's');
        market = this.safeMarket(marketId);
        const relativeChange = this.safeString2(ticker, 'dailyChange', 'dc');
        const percentage = Precise.stringMul(relativeChange, '100');
        return this.safeTicker({
            'id': marketId,
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString2(ticker, 'high', 'h'),
            'low': this.safeString2(ticker, 'low', 'l'),
            'bid': this.safeString2(ticker, 'bid', 'bPx'),
            'bidVolume': this.safeString2(ticker, 'bidQuantity', 'bSz'),
            'ask': this.safeString2(ticker, 'ask', 'aPx'),
            'askVolume': this.safeString2(ticker, 'askQuantity', 'aSz'),
            'vwap': undefined,
            'open': this.safeString2(ticker, 'open', 'o'),
            'close': this.safeString2(ticker, 'close', 'c'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeString2(ticker, 'quantity', 'qty'),
            'quoteVolume': this.safeString2(ticker, 'amount', 'amt'),
            'markPrice': this.safeString2(ticker, 'markPrice', 'mPx'),
            'indexPrice': this.safeString(ticker, 'iPx'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name poloniex#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://api-docs.poloniex.com/spot/api/public/market-data#ticker
     * @see https://api-docs.poloniex.com/v3/futures/api/market/get-market-info
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols, undefined, true, true, false);
            const symbolsLength = symbols.length;
            if (symbolsLength > 0) {
                market = this.market(symbols[0]);
                if (symbolsLength === 1) {
                    request['symbol'] = market['id'];
                }
            }
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchTickers', market, params);
        if (marketType === 'swap') {
            const responseRaw = await this.swapPublicGetV3MarketTickers(this.extend(request, params));
            //
            //    {
            //        "code": "200",
            //        "msg": "Success",
            //        "data": [
            //            {
            //                "s": "XRP_USDT_PERP",
            //                "o": "2.0503",
            //                "l": "2.0066",
            //                "h": "2.216",
            //                "c": "2.1798",
            //                "qty": "21090",
            //                "amt": "451339.65",
            //                "tC": "3267",
            //                "sT": "1740736380000",
            //                "cT": "1740822777559",
            //                "dN": "XRP/USDT/PERP",
            //                "dC": "0.0632",
            //                "bPx": "2.175",
            //                "bSz": "3",
            //                "aPx": "2.1831",
            //                "aSz": "111",
            //                "mPx": "2.1798",
            //                "iPx": "2.1834"
            //            },
            //
            const data = this.safeList(responseRaw, 'data');
            return this.parseTickers(data, symbols);
        }
        const response = await this.publicGetMarketsTicker24h(params);
        //
        //     [
        //         {
        //              "symbol" : "BTC_USDT",
        //              "open" : "26053.33",
        //              "low" : "26053.33",
        //              "high" : "26798.02",
        //              "close" : "26447.58",
        //              "quantity" : "6116.210188",
        //              "amount" : "161082122.88450926",
        //              "tradeCount" : "134709",
        //              "startTime" : "1692784440000",
        //              "closeTime" : "1692870839630",
        //              "displayName" : "BTC/USDT",
        //              "dailyChange" : "0.0151",
        //              "bid" : "26447.57",
        //              "bidQuantity" : "0.016313",
        //              "ask" : "26447.58",
        //              "askQuantity" : "0.068307",
        //              "ts" : "1692870845446",
        //              "markPrice" : "26444.11"
        //         }
        //     ]
        //
        return this.parseTickers(response, symbols);
    }
    /**
     * @method
     * @name poloniex#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api-docs.poloniex.com/spot/api/public/reference-data#currency-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const response = await this.publicGetCurrencies(this.extend(params, { 'includeMultiChainCurrencies': true }));
        //
        //     [
        //      {
        //        "USDT": {
        //           "id": 214,
        //           "name": "Tether USD",
        //           "description": "Sweep to Main Account",
        //           "type": "address",
        //           "withdrawalFee": "0.00000000",
        //           "minConf": 2,
        //           "depositAddress": null,
        //           "blockchain": "OMNI",
        //           "delisted": false,
        //           "tradingState": "NORMAL",
        //           "walletState": "DISABLED",
        //           "walletDepositState": "DISABLED",
        //           "walletWithdrawalState": "DISABLED",
        //           "supportCollateral": true,
        //           "supportBorrow": true,
        //           "parentChain": null,
        //           "isMultiChain": true,
        //           "isChildChain": false,
        //           "childChains": [
        //             "USDTBSC",
        //             "USDTETH",
        //             "USDTSOL",
        //             "USDTTRON"
        //           ]
        //        }
        //      },
        //      ...
        //      {
        //        "USDTBSC": {
        //              "id": 582,
        //              "name": "Binance-Peg BSC-USD",
        //              "description": "Sweep to Main Account",
        //              "type": "address",
        //              "withdrawalFee": "0.00000000",
        //              "minConf": 15,
        //              "depositAddress": null,
        //              "blockchain": "BSC",
        //              "delisted": false,
        //              "tradingState": "OFFLINE",
        //              "walletState": "ENABLED",
        //              "walletDepositState": "ENABLED",
        //              "walletWithdrawalState": "DISABLED",
        //              "supportCollateral": false,
        //              "supportBorrow": false,
        //              "parentChain": "USDT",
        //              "isMultiChain": true,
        //              "isChildChain": true,
        //              "childChains": []
        //        }
        //      },
        //      ...
        //     ]
        //
        const result = {};
        // poloniex has a complicated structure of currencies, so we handle them differently
        // at first, turn the response into a normal dictionary
        const currenciesDict = {};
        for (let i = 0; i < response.length; i++) {
            const item = this.safeDict(response, i);
            const ids = Object.keys(item);
            const id = this.safeString(ids, 0);
            currenciesDict[id] = item[id];
        }
        const keys = Object.keys(currenciesDict);
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const entry = currenciesDict[id];
            const code = this.safeCurrencyCode(id);
            // skip childChains, as they are collected in parentChain loop
            if (this.safeBool(entry, 'isChildChain')) {
                continue;
            }
            const allChainEntries = [];
            const childChains = this.safeList(entry, 'childChains', []);
            if (childChains !== undefined) {
                for (let j = 0; j < childChains.length; j++) {
                    const childChainId = childChains[j];
                    const childNetworkEntry = this.safeDict(currenciesDict, childChainId);
                    allChainEntries.push(childNetworkEntry);
                }
            }
            allChainEntries.push(entry);
            const networks = {};
            for (let j = 0; j < allChainEntries.length; j++) {
                const chainEntry = allChainEntries[j];
                const networkName = this.safeString(chainEntry, 'blockchain');
                const networkCode = this.networkIdToCode(networkName, code);
                const specialNetworkId = this.safeString(childChains, j, id); // in case it's primary chain, defeault to ID
                networks[networkCode] = {
                    'info': chainEntry,
                    'id': specialNetworkId,
                    'numericId': this.safeInteger(chainEntry, 'id'),
                    'network': networkCode,
                    'active': this.safeBool(chainEntry, 'walletState'),
                    'deposit': this.safeString(chainEntry, 'walletDepositState') === 'ENABLED',
                    'withdraw': this.safeString(chainEntry, 'walletWithdrawalState') === 'ENABLED',
                    'fee': this.safeNumber(chainEntry, 'withdrawalFee'),
                    'precision': undefined,
                    'limits': {
                        'withdraw': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'deposit': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                };
            }
            result[code] = this.safeCurrencyStructure({
                'info': entry,
                'code': code,
                'id': id,
                'numericId': this.safeInteger(entry, 'id'),
                'type': 'crypto',
                'name': this.safeString(entry, 'name'),
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'networks': networks,
            });
        }
        return result;
    }
    /**
     * @method
     * @name poloniex#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-docs.poloniex.com/spot/api/public/market-data#ticker
     * @see https://api-docs.poloniex.com/v3/futures/api/market/get-market-info
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (market['contract']) {
            const tickers = await this.fetchTickers([market['symbol']], params);
            return this.safeDict(tickers, symbol);
        }
        const response = await this.publicGetMarketsSymbolTicker24h(this.extend(request, params));
        //
        //     {
        //         "symbol" : "BTC_USDT",
        //         "open" : "26053.33",
        //         "low" : "26053.33",
        //         "high" : "26798.02",
        //         "close" : "26447.58",
        //         "quantity" : "6116.210188",
        //         "amount" : "161082122.88450926",
        //         "tradeCount" : "134709",
        //         "startTime" : "1692784440000",
        //         "closeTime" : "1692870839630",
        //         "displayName" : "BTC/USDT",
        //         "dailyChange" : "0.0151",
        //         "bid" : "26447.57",
        //         "bidQuantity" : "0.016313",
        //         "ask" : "26447.58",
        //         "askQuantity" : "0.068307",
        //         "ts" : "1692870845446",
        //         "markPrice" : "26444.11"
        //     }
        //
        return this.parseTicker(response, market);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades
        //
        //  spot:
        //
        //     {
        //         "id" : "60014521",
        //         "price" : "23162.94",
        //         "quantity" : "0.00009",
        //         "amount" : "2.0846646",
        //         "takerSide" : "SELL",
        //         "ts" : 1659684602042,
        //         "createTime" : 1659684602036
        //     }
        //
        //   swap:
        //
        //     {
        //         "id": "105807376",
        //         "side": "buy",
        //         "px": "84410.57",
        //         "qty": "1",
        //         "amt": "84.41057",
        //         "cT": "1740777563557",
        //     }
        //
        // fetchMyTrades
        //
        //  spot:
        //
        //     {
        //         "id": "32164924331503616",
        //         "symbol": "LINK_USDT",
        //         "accountType": "SPOT",
        //         "orderId": "32164923987566592",
        //         "side": "SELL",
        //         "type": "MARKET",
        //         "matchRole": "TAKER",
        //         "createTime": 1648635115525,
        //         "price": "11",
        //         "quantity": "0.5",
        //         "amount": "5.5",
        //         "feeCurrency": "USDT",
        //         "feeAmount": "0.007975",
        //         "pageId": "32164924331503616",
        //         "clientOrderId": "myOwnId-321"
        //     }
        //
        //  swap:
        //
        //     {
        //         "symbol": "BTC_USDT_PERP",
        //         "trdId": "105813553",
        //         "side": "SELL",
        //         "type": "TRADE",
        //         "mgnMode": "CROSS",
        //         "ordType": "MARKET",
        //         "clOrdId": "polo418912106147315112",
        //         "role": "TAKER",
        //         "px": "84704.9",
        //         "qty": "1",
        //         "cTime": "1740842829430",
        //         "uTime": "1740842829450",
        //         "feeCcy": "USDT",
        //         "feeAmt": "0.04235245",
        //         "deductCcy": "",
        //         "deductAmt": "0",
        //         "feeRate": "0.0005",
        //         "id": "418912106342654592",
        //         "posSide": "BOTH",
        //         "ordId": "418912106147315112",
        //         "qCcy": "USDT",
        //         "value": "84.7049",
        //         "actType": "TRADING"
        //     },
        //
        // fetchOrderTrades (taker trades)
        //
        //     {
        //         "id": "30341456333942784",
        //         "symbol": "LINK_USDT",
        //         "accountType": "SPOT",
        //         "orderId": "30249408733945856",
        //         "side": "BUY",
        //         "type": "LIMIT",
        //         "matchRole": "MAKER",
        //         "createTime": 1648200366864,
        //         "price": "3.1",
        //         "quantity": "1",
        //         "amount": "3.1",
        //         "feeCurrency": "LINK",
        //         "feeAmount": "0.00145",
        //         "pageId": "30341456333942784",
        //         "clientOrderId": ""
        //     }
        //
        const id = this.safeStringN(trade, ['id', 'tradeID', 'trdId']);
        const orderId = this.safeString2(trade, 'orderId', 'ordId');
        const timestamp = this.safeIntegerN(trade, ['ts', 'createTime', 'cT', 'cTime']);
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market, '_');
        const symbol = market['symbol'];
        const side = this.safeStringLower2(trade, 'side', 'takerSide');
        let fee = undefined;
        const priceString = this.safeString2(trade, 'price', 'px');
        const amountString = this.safeString2(trade, 'quantity', 'qty');
        const costString = this.safeString2(trade, 'amount', 'amt');
        const feeCurrencyId = this.safeString2(trade, 'feeCurrency', 'feeCcy');
        const feeCostString = this.safeString2(trade, 'feeAmount', 'feeAmt');
        if (feeCostString !== undefined) {
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
            'type': this.safeStringLower2(trade, 'ordType', 'type'),
            'side': side,
            'takerOrMaker': this.safeStringLower2(trade, 'matchRole', 'role'),
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }
    /**
     * @method
     * @name poloniex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api-docs.poloniex.com/spot/api/public/market-data#trades
     * @see https://api-docs.poloniex.com/v3/futures/api/market/get-execution-info
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
        if (limit !== undefined) {
            request['limit'] = limit; // max 1000, for spot & swap
        }
        if (market['contract']) {
            const response = await this.swapPublicGetV3MarketTrades(this.extend(request, params));
            //
            //     {
            //         code: "200",
            //         msg: "Success",
            //         data: [
            //         {
            //             id: "105807320", // descending order
            //             side: "sell",
            //             px: "84383.93",
            //             qty: "1",
            //             amt: "84.38393",
            //             cT: "1740777074704",
            //         },
            //
            const tradesList = this.safeList(response, 'data');
            return this.parseTrades(tradesList, market, since, limit);
        }
        const trades = await this.publicGetMarketsSymbolTrades(this.extend(request, params));
        //
        //     [
        //         {
        //             "id" : "60014521",
        //             "price" : "23162.94",
        //             "quantity" : "0.00009",
        //             "amount" : "2.0846646",
        //             "takerSide" : "SELL",
        //             "ts" : 1659684602042,
        //             "createTime" : 1659684602036
        //         }
        //     ]
        //
        return this.parseTrades(trades, market, since, limit);
    }
    /**
     * @method
     * @name poloniex#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api-docs.poloniex.com/spot/api/private/trade#trade-history
     * @see https://api-docs.poloniex.com/v3/futures/api/trade/get-execution-details
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchMyTrades', symbol, since, limit, params);
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchMyTrades', market, params);
        const isContract = this.inArray(marketType, ['swap', 'future']);
        let request = {
        // 'from': 12345678, // A 'trade Id'. The query begins at ‘from'.
        // 'direction': 'PRE', // PRE, NEXT The direction before or after ‘from'.
        };
        const startKey = isContract ? 'sTime' : 'startTime';
        const endKey = isContract ? 'eTime' : 'endTime';
        if (since !== undefined) {
            request[startKey] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (isContract && symbol !== undefined) {
            request['symbol'] = market['id'];
        }
        [request, params] = this.handleUntilOption(endKey, request, params);
        if (isContract) {
            const raw = await this.swapPrivateGetV3TradeOrderTrades(this.extend(request, params));
            //
            //    {
            //        "code": "200",
            //        "msg": "",
            //        "data": [
            //            {
            //                "symbol": "BTC_USDT_PERP",
            //                "trdId": "105813553",
            //                "side": "SELL",
            //                "type": "TRADE",
            //                "mgnMode": "CROSS",
            //                "ordType": "MARKET",
            //                "clOrdId": "polo418912106147315112",
            //                "role": "TAKER",
            //                "px": "84704.9",
            //                "qty": "1",
            //                "cTime": "1740842829430",
            //                "uTime": "1740842829450",
            //                "feeCcy": "USDT",
            //                "feeAmt": "0.04235245",
            //                "deductCcy": "",
            //                "deductAmt": "0",
            //                "feeRate": "0.0005",
            //                "id": "418912106342654592",
            //                "posSide": "BOTH",
            //                "ordId": "418912106147315112",
            //                "qCcy": "USDT",
            //                "value": "84.7049",
            //                "actType": "TRADING"
            //            },
            //
            const data = this.safeList(raw, 'data');
            return this.parseTrades(data, market, since, limit);
        }
        const response = await this.privateGetTrades(this.extend(request, params));
        //
        //     [
        //         {
        //             "id": "32164924331503616",
        //             "symbol": "LINK_USDT",
        //             "accountType": "SPOT",
        //             "orderId": "32164923987566592",
        //             "side": "SELL",
        //             "type": "MARKET",
        //             "matchRole": "TAKER",
        //             "createTime": 1648635115525,
        //             "price": "11",
        //             "quantity": "0.5",
        //             "amount": "5.5",
        //             "feeCurrency": "USDT",
        //             "feeAmount": "0.007975",
        //             "pageId": "32164924331503616",
        //             "clientOrderId": "myOwnId-321"
        //         }
        //     ]
        //
        const result = this.parseTrades(response, market, since, limit);
        return result;
    }
    parseOrderStatus(status) {
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'PENDING_CANCEL': 'canceled',
            'PARTIALLY_CANCELED': 'canceled',
            'CANCELED': 'canceled',
            'FAILED': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        // fetchOpenOrder
        //
        //     {
        //         "id" : "7xxxxxxxxxxxxxxx6",
        //         "clientOrderId" : "",
        //         "symbol" : "ETH_USDT",
        //         "state" : "NEW",
        //         "accountType" : "SPOT",
        //         "side" : "BUY",
        //         "type" : "LIMIT",
        //         "timeInForce" : "GTC",
        //         "quantity" : "0.001",
        //         "price" : "1600",
        //         "avgPrice" : "0",
        //         "amount" : "0",
        //         "filledQuantity" : "0",
        //         "filledAmount" : "0",
        //         "createTime" : 16xxxxxxxxx26,
        //         "updateTime" : 16xxxxxxxxx36
        //     }
        //
        // fetchOpenOrders (and fetchClosedOrders same for contracts)
        //
        //  spot:
        //
        //     {
        //         "id": "24993088082542592",
        //         "clientOrderId": "",
        //         "symbol": "ELON_USDC",
        //         "state": "NEW",
        //         "accountType": "SPOT",
        //         "side": "SELL",
        //         "type": "MARKET",
        //         "timeInForce": "GTC",
        //         "quantity": "1.00",
        //         "price": "0.00",
        //         "avgPrice": "0.00",
        //         "amount": "0.00",
        //         "filledQuantity": "0.00",
        //         "filledAmount": "0.00",
        //         "createTime": 1646925216548,
        //         "updateTime": 1646925216548
        //     }
        //
        //  contract:
        //
        //     {
        //         "symbol": "BTC_USDT_PERP",
        //         "side": "BUY",
        //         "type": "LIMIT",
        //         "ordId": "418890767248232148",
        //         "clOrdId": "polo418890767248232148",
        //         "mgnMode": "CROSS",
        //         "px": "81130.13",
        //         "reduceOnly": false,
        //         "lever": "20",
        //         "state": "NEW",
        //         "source": "WEB",
        //         "timeInForce": "GTC",
        //         "tpTrgPx": "",
        //         "tpPx": "",
        //         "tpTrgPxType": "",
        //         "slTrgPx": "",
        //         "slPx": "",
        //         "slTrgPxType": "",
        //         "avgPx": "0",
        //         "execQty": "0",
        //         "execAmt": "0",
        //         "feeCcy": "",
        //         "feeAmt": "0",
        //         "deductCcy": "0",
        //         "deductAmt": "0",
        //         "stpMode": "NONE", // todo: selfTradePrevention
        //         "cTime": "1740837741523",
        //         "uTime": "1740840846882",
        //         "sz": "1",
        //         "posSide": "BOTH",
        //         "qCcy": "USDT"
        //         "cancelReason": "", // this field can only be in closed orders
        //     },
        //
        // createOrder, editOrder
        //
        //  spot:
        //
        //     {
        //         "id": "29772698821328896",
        //         "clientOrderId": "1234Abc"
        //     }
        //
        //  contract:
        //
        //    {
        //        "ordId":"418876147745775616",
        //        "clOrdId":"polo418876147745775616"
        //    }
        //
        let timestamp = this.safeIntegerN(order, ['timestamp', 'createTime', 'cTime']);
        if (timestamp === undefined) {
            timestamp = this.parse8601(this.safeString(order, 'date'));
        }
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market, '_');
        const symbol = market['symbol'];
        let resultingTrades = this.safeValue(order, 'resultingTrades');
        if (resultingTrades !== undefined) {
            if (!Array.isArray(resultingTrades)) {
                resultingTrades = this.safeValue(resultingTrades, this.safeString(market, 'id', marketId));
            }
        }
        const price = this.safeStringN(order, ['price', 'rate', 'px']);
        const amount = this.safeString2(order, 'quantity', 'sz');
        const filled = this.safeString2(order, 'filledQuantity', 'execQty');
        const status = this.parseOrderStatus(this.safeString(order, 'state'));
        const side = this.safeStringLower(order, 'side');
        const rawType = this.safeString(order, 'type');
        const type = this.parseOrderType(rawType);
        const id = this.safeStringN(order, ['orderNumber', 'id', 'orderId', 'ordId']);
        let fee = undefined;
        const feeCurrency = this.safeString2(order, 'tokenFeeCurrency', 'feeCcy');
        let feeCost = undefined;
        let feeCurrencyCode = undefined;
        const rate = this.safeString(order, 'fee');
        if (feeCurrency === undefined) {
            feeCurrencyCode = (side === 'buy') ? market['base'] : market['quote'];
        }
        else {
            // poloniex accepts a 30% discount to pay fees in TRX
            feeCurrencyCode = this.safeCurrencyCode(feeCurrency);
            feeCost = this.safeString2(order, 'tokenFee', 'feeAmt');
        }
        if (feeCost !== undefined) {
            fee = {
                'rate': rate,
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const clientOrderId = this.safeString2(order, 'clientOrderId', 'clOrdId');
        const marginMode = this.safeStringLower(order, 'mgnMode');
        const reduceOnly = this.safeBool(order, 'reduceOnly');
        const leverage = this.safeInteger(order, 'lever');
        const hedged = this.safeString(order, 'posSide') !== 'BOTH';
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': this.safeInteger(order, 'updateTime'),
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': this.safeString(order, 'timeInForce'),
            'postOnly': rawType === 'LIMIT_MAKER',
            'side': side,
            'price': price,
            'triggerPrice': this.safeString2(order, 'triggerPrice', 'stopPrice'),
            'cost': this.safeString(order, 'execAmt'),
            'average': this.safeString2(order, 'avgPrice', 'avgPx'),
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'trades': resultingTrades,
            'fee': fee,
            'marginMode': marginMode,
            'reduceOnly': reduceOnly,
            'leverage': leverage,
            'hedged': hedged,
        }, market);
    }
    parseOrderType(status) {
        const statuses = {
            'MARKET': 'market',
            'LIMIT': 'limit',
            'LIMIT_MAKER': 'limit',
            'STOP-LIMIT': 'limit',
            'STOP-MARKET': 'market',
        };
        return this.safeString(statuses, status, status);
    }
    parseOpenOrders(orders, market, result) {
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const extended = this.extend(order, {
                'status': 'open',
                'type': 'limit',
                'side': order['type'],
                'price': order['rate'],
            });
            result.push(this.parseOrder(extended, market));
        }
        return result;
    }
    /**
     * @method
     * @name poloniex#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api-docs.poloniex.com/spot/api/private/order#open-orders
     * @see https://api-docs.poloniex.com/spot/api/private/smart-order#open-orders  // trigger orders
     * @see https://api-docs.poloniex.com/v3/futures/api/trade/get-current-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set true to fetch trigger orders instead of regular orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchOpenOrders', market, params);
        if (limit !== undefined) {
            const max = (marketType === 'spot') ? 2000 : 100;
            request['limit'] = Math.max(limit, max);
        }
        const isTrigger = this.safeValue2(params, 'trigger', 'stop');
        params = this.omit(params, ['trigger', 'stop']);
        let response = undefined;
        if (marketType !== 'spot') {
            const raw = await this.swapPrivateGetV3TradeOrderOpens(this.extend(request, params));
            //
            //    {
            //        "code": "200",
            //        "msg": "",
            //        "data": [
            //            {
            //                "symbol": "BTC_USDT_PERP",
            //                "side": "BUY",
            //                "type": "LIMIT",
            //                "ordId": "418890767248232148",
            //                "clOrdId": "polo418890767248232148",
            //                "mgnMode": "CROSS",
            //                "px": "81130.13",
            //                "reduceOnly": false,
            //                "lever": "20",
            //                "state": "NEW",
            //                "source": "WEB",
            //                "timeInForce": "GTC",
            //                "tpTrgPx": "",
            //                "tpPx": "",
            //                "tpTrgPxType": "",
            //                "slTrgPx": "",
            //                "slPx": "",
            //                "slTrgPxType": "",
            //                "avgPx": "0",
            //                "execQty": "0",
            //                "execAmt": "0",
            //                "feeCcy": "",
            //                "feeAmt": "0",
            //                "deductCcy": "0",
            //                "deductAmt": "0",
            //                "stpMode": "NONE",
            //                "cTime": "1740837741523",
            //                "uTime": "1740840846882",
            //                "sz": "1",
            //                "posSide": "BOTH",
            //                "qCcy": "USDT"
            //            },
            //
            response = this.safeList(raw, 'data');
        }
        else if (isTrigger) {
            response = await this.privateGetSmartorders(this.extend(request, params));
        }
        else {
            response = await this.privateGetOrders(this.extend(request, params));
        }
        //
        //     [
        //         {
        //             "id" : "7xxxxxxxxxxxxxxx6",
        //             "clientOrderId" : "",
        //             "symbol" : "ETH_USDT",
        //             "state" : "NEW",
        //             "accountType" : "SPOT",
        //             "side" : "BUY",
        //             "type" : "LIMIT",
        //             "timeInForce" : "GTC",
        //             "quantity" : "0.001",
        //             "price" : "1600",
        //             "avgPrice" : "0",
        //             "amount" : "0",
        //             "filledQuantity" : "0",
        //             "filledAmount" : "0",
        //             "stopPrice": "3750.00",              // for trigger orders
        //             "createTime" : 16xxxxxxxxx26,
        //             "updateTime" : 16xxxxxxxxx36
        //         }
        //     ]
        //
        const extension = { 'status': 'open' };
        return this.parseOrders(response, market, since, limit, extension);
    }
    /**
     * @method
     * @name poloniex#fetchClosedOrders
     * @see https://api-docs.poloniex.com/v3/futures/api/trade/get-order-history
     * @description fetches information on multiple closed orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        let request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchClosedOrders', market, params, 'swap');
        if (marketType === 'spot') {
            throw new NotSupported(this.id + ' fetchClosedOrders() is not supported for spot markets yet');
        }
        if (limit !== undefined) {
            request['limit'] = Math.min(200, limit);
        }
        if (since !== undefined) {
            request['sTime'] = since;
        }
        [request, params] = this.handleUntilOption('eTime', request, params);
        const response = await this.swapPrivateGetV3TradeOrderHistory(this.extend(request, params));
        //
        //    {
        //        "code": "200",
        //        "msg": "",
        //        "data": [
        //            {
        //                "symbol": "BTC_USDT_PERP",
        //                "side": "SELL",
        //                "type": "MARKET",
        //                "ordId": "418912106147315712",
        //                "clOrdId": "polo418912106147315712",
        //                "mgnMode": "CROSS",
        //                "px": "0",
        //                "sz": "2",
        //                "lever": "20",
        //                "state": "FILLED",
        //                "cancelReason": "",
        //                "source": "WEB",
        //                "reduceOnly": "true",
        //                "timeInForce": "GTC",
        //                "tpTrgPx": "",
        //                "tpPx": "",
        //                "tpTrgPxType": "",
        //                "slTrgPx": "",
        //                "slPx": "",
        //                "slTrgPxType": "",
        //                "avgPx": "84705.56",
        //                "execQty": "2",
        //                "execAmt": "169.41112",
        //                "feeCcy": "USDT",
        //                "feeAmt": "0.08470556",
        //                "deductCcy": "0",
        //                "deductAmt": "0",
        //                "stpMode": "NONE",
        //                "cTime": "1740842829116",
        //                "uTime": "1740842829130",
        //                "posSide": "BOTH",
        //                "qCcy": "USDT"
        //            },
        //
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data, market, since, limit);
    }
    /**
     * @method
     * @name poloniex#createOrder
     * @description create a trade order
     * @see https://api-docs.poloniex.com/spot/api/private/order#create-order
     * @see https://api-docs.poloniex.com/spot/api/private/smart-order#create-order  // trigger orders
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the price at which a trigger order is triggered at
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let request = {
            'symbol': market['id'],
            'side': side.toUpperCase(), // uppercase, both for spot & swap
            // 'timeInForce': timeInForce, // matches unified values
            // 'accountType': 'SPOT',
            // 'amount': amount,
        };
        const triggerPrice = this.safeNumber2(params, 'stopPrice', 'triggerPrice');
        [request, params] = this.orderRequest(symbol, type, side, amount, request, price, params);
        let response = undefined;
        if (market['swap'] || market['future']) {
            const responseInitial = await this.swapPrivatePostV3TradeOrder(this.extend(request, params));
            //
            // {"code":200,"msg":"Success","data":{"ordId":"418876147745775616","clOrdId":"polo418876147745775616"}}
            //
            response = this.safeDict(responseInitial, 'data');
        }
        else if (triggerPrice !== undefined) {
            response = await this.privatePostSmartorders(this.extend(request, params));
        }
        else {
            response = await this.privatePostOrders(this.extend(request, params));
        }
        //
        //     {
        //         "id" : "78923648051920896",
        //         "clientOrderId" : ""
        //     }
        //
        return this.parseOrder(response, market);
    }
    orderRequest(symbol, type, side, amount, request, price = undefined, params = {}) {
        const triggerPrice = this.safeNumber2(params, 'stopPrice', 'triggerPrice');
        const market = this.market(symbol);
        if (market['contract']) {
            let marginMode = undefined;
            [marginMode, params] = this.handleParamString(params, 'marginMode');
            if (marginMode !== undefined) {
                this.checkRequiredArgument('createOrder', marginMode, 'marginMode', ['cross', 'isolated']);
                request['mgnMode'] = marginMode.toUpperCase();
            }
            let hedged = undefined;
            [hedged, params] = this.handleParamString(params, 'hedged');
            if (hedged) {
                if (marginMode === undefined) {
                    throw new ArgumentsRequired(this.id + ' createOrder() requires a marginMode parameter "cross" or "isolated" for hedged orders');
                }
                if (!('posSide' in params)) {
                    throw new ArgumentsRequired(this.id + ' createOrder() requires a posSide parameter "LONG" or "SHORT" for hedged orders');
                }
            }
        }
        let upperCaseType = type.toUpperCase();
        const isMarket = upperCaseType === 'MARKET';
        const isPostOnly = this.isPostOnly(isMarket, upperCaseType === 'LIMIT_MAKER', params);
        params = this.omit(params, ['postOnly', 'triggerPrice', 'stopPrice']);
        if (triggerPrice !== undefined) {
            if (!market['spot']) {
                throw new InvalidOrder(this.id + ' createOrder() does not support trigger orders for ' + market['type'] + ' markets');
            }
            upperCaseType = (price === undefined) ? 'STOP' : 'STOP_LIMIT';
            request['stopPrice'] = triggerPrice;
        }
        else if (isPostOnly) {
            upperCaseType = 'LIMIT_MAKER';
        }
        request['type'] = upperCaseType;
        if (isMarket) {
            if (side === 'buy') {
                let quoteAmount = undefined;
                let createMarketBuyOrderRequiresPrice = true;
                [createMarketBuyOrderRequiresPrice, params] = this.handleOptionAndParams(params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
                const cost = this.safeNumber(params, 'cost');
                params = this.omit(params, 'cost');
                if (cost !== undefined) {
                    quoteAmount = this.costToPrecision(symbol, cost);
                }
                else if (createMarketBuyOrderRequiresPrice && market['spot']) {
                    if (price === undefined) {
                        throw new InvalidOrder(this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend (quote quantity) in the amount argument');
                    }
                    else {
                        const amountString = this.numberToString(amount);
                        const priceString = this.numberToString(price);
                        const costRequest = Precise.stringMul(amountString, priceString);
                        quoteAmount = this.costToPrecision(symbol, costRequest);
                    }
                }
                else {
                    quoteAmount = this.costToPrecision(symbol, amount);
                }
                const amountKey = market['spot'] ? 'amount' : 'sz';
                request[amountKey] = quoteAmount;
            }
            else {
                const amountKey = market['spot'] ? 'quantity' : 'sz';
                request[amountKey] = this.amountToPrecision(symbol, amount);
            }
        }
        else {
            const amountKey = market['spot'] ? 'quantity' : 'sz';
            request[amountKey] = this.amountToPrecision(symbol, amount);
            const priceKey = market['spot'] ? 'price' : 'px';
            request[priceKey] = this.priceToPrecision(symbol, price);
        }
        const clientOrderId = this.safeString(params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
            params = this.omit(params, 'clientOrderId');
        }
        // remember the timestamp before issuing the request
        return [request, params];
    }
    /**
     * @method
     * @name poloniex#editOrder
     * @description edit a trade order
     * @see https://api-docs.poloniex.com/spot/api/private/order#cancel-replace-order
     * @see https://api-docs.poloniex.com/spot/api/private/smart-order#cancel-replace-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} [amount] how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new NotSupported(this.id + ' editOrder() does not support ' + market['type'] + ' orders, only spot orders are accepted');
        }
        let request = {
            'id': id,
            // 'timeInForce': timeInForce,
        };
        const triggerPrice = this.safeNumber2(params, 'stopPrice', 'triggerPrice');
        [request, params] = this.orderRequest(symbol, type, side, amount, request, price, params);
        let response = undefined;
        if (triggerPrice !== undefined) {
            response = await this.privatePutSmartordersId(this.extend(request, params));
        }
        else {
            response = await this.privatePutOrdersId(this.extend(request, params));
        }
        //
        //     {
        //         "id" : "78923648051920896",
        //         "clientOrderId" : ""
        //     }
        //
        response = this.extend(response, {
            'side': side,
            'type': type,
        });
        return this.parseOrder(response, market);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        //
        // @method
        // @name poloniex#cancelOrder
        // @description cancels an open order
        // @see https://api-docs.poloniex.com/spot/api/private/order#cancel-order-by-id
        // @see https://api-docs.poloniex.com/spot/api/private/smart-order#cancel-order-by-id  // trigger orders
        // @param {string} id order id
        // @param {string} symbol unified symbol of the market the order was made in
        // @param {object} [params] extra parameters specific to the exchange API endpoint
        // @param {boolean} [params.trigger] true if canceling a trigger order
        // @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
        //
        await this.loadMarkets();
        if (symbol === undefined) {
            throw new ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        const market = this.market(symbol);
        const request = {};
        if (!market['spot']) {
            request['symbol'] = market['id'];
            request['ordId'] = id;
            const raw = await this.swapPrivateDeleteV3TradeOrder(this.extend(request, params));
            //
            //    {
            //        "code": "200",
            //        "msg": "Success",
            //        "data": {
            //            "ordId": "418886099910612040",
            //            "clOrdId": "polo418886099910612040"
            //        }
            //    }
            //
            return this.parseOrder(this.safeDict(raw, 'data'));
        }
        const clientOrderId = this.safeValue(params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            id = clientOrderId;
        }
        request['id'] = id;
        const isTrigger = this.safeValue2(params, 'trigger', 'stop');
        params = this.omit(params, ['clientOrderId', 'trigger', 'stop']);
        let response = undefined;
        if (isTrigger) {
            response = await this.privateDeleteSmartordersId(this.extend(request, params));
        }
        else {
            response = await this.privateDeleteOrdersId(this.extend(request, params));
        }
        //
        //   {
        //       "orderId":"210832697138888704",
        //       "clientOrderId":"",
        //       "state":"PENDING_CANCEL",
        //       "code":200,
        //       "message":""
        //   }
        //
        return this.parseOrder(response);
    }
    /**
     * @method
     * @name poloniex#cancelAllOrders
     * @description cancel all open orders
     * @see https://api-docs.poloniex.com/spot/api/private/order#cancel-all-orders
     * @see https://api-docs.poloniex.com/spot/api/private/smart-order#cancel-all-orders  // trigger orders
     * @see https://api-docs.poloniex.com/v3/futures/api/trade/cancel-all-orders - contract markets
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true if canceling trigger orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            // 'accountTypes': 'SPOT',
            'symbols': [],
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbols'] = [
                market['id'],
            ];
        }
        let response = undefined;
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('cancelAllOrders', market, params);
        if (marketType === 'swap' || marketType === 'future') {
            const raw = await this.swapPrivateDeleteV3TradeAllOrders(this.extend(request, params));
            //
            //    {
            //        "code": "200",
            //        "msg": "Success",
            //        "data": [
            //            {
            //                "code": "200",
            //                "msg": "Success",
            //                "ordId": "418885787866388511",
            //                "clOrdId": "polo418885787866388511"
            //            }
            //        ]
            //    }
            //
            response = this.safeList(raw, 'data');
            return this.parseOrders(response, market);
        }
        const isTrigger = this.safeValue2(params, 'trigger', 'stop');
        params = this.omit(params, ['trigger', 'stop']);
        if (isTrigger) {
            response = await this.privateDeleteSmartorders(this.extend(request, params));
        }
        else {
            response = await this.privateDeleteOrders(this.extend(request, params));
        }
        //
        //     [
        //         {
        //             "orderId" : "78xxxxxxxx80",
        //             "clientOrderId" : "",
        //             "state" : "NEW",
        //             "code" : 200,
        //             "message" : ""
        //         }, {
        //             "orderId" : "78xxxxxxxxx80",
        //             "clientOrderId" : "",
        //             "state" : "NEW",
        //             "code" : 200,
        //             "message" : ""
        //         }
        //     ]
        //
        return this.parseOrders(response, market);
    }
    /**
     * @method
     * @name poloniex#fetchOrder
     * @description fetch an order by it's id
     * @see https://api-docs.poloniex.com/spot/api/private/order#order-details
     * @see https://api-docs.poloniex.com/spot/api/private/smart-order#open-orders  // trigger orders
     * @param {string} id order id
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true if fetching a trigger order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        id = id.toString();
        const request = {
            'id': id,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchOrder', market, params);
        if (marketType !== 'spot') {
            throw new NotSupported(this.id + ' fetchOrder() is not supported for ' + marketType + ' markets yet');
        }
        const isTrigger = this.safeValue2(params, 'trigger', 'stop');
        params = this.omit(params, ['trigger', 'stop']);
        let response = undefined;
        if (isTrigger) {
            response = await this.privateGetSmartordersId(this.extend(request, params));
            response = this.safeValue(response, 0);
        }
        else {
            response = await this.privateGetOrdersId(this.extend(request, params));
        }
        //
        //     {
        //         "id": "21934611974062080",
        //         "clientOrderId": "123",
        //         "symbol": "TRX_USDC",
        //         "state": "NEW",
        //         "accountType": "SPOT",
        //         "side": "SELL",
        //         "type": "LIMIT",
        //         "timeInForce": "GTC",
        //         "quantity": "1.00",
        //         "price": "10.00",
        //         "avgPrice": "0.00",
        //         "amount": "0.00",
        //         "filledQuantity": "0.00",
        //         "filledAmount": "0.00",
        //         "stopPrice": "3750.00",              // for trigger orders
        //         "createTime": 1646196019020,
        //         "updateTime": 1646196019020
        //     }
        //
        const order = this.parseOrder(response);
        order['id'] = id;
        return order;
    }
    async fetchOrderStatus(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const orders = await this.fetchOpenOrders(symbol, undefined, undefined, params);
        const indexed = this.indexBy(orders, 'id');
        return (id in indexed) ? 'open' : 'closed';
    }
    /**
     * @method
     * @name poloniex#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://api-docs.poloniex.com/spot/api/private/trade#trades-by-order-id
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'id': id,
        };
        const trades = await this.privateGetOrdersIdTrades(this.extend(request, params));
        //
        //     [
        //         {
        //             "id": "30341456333942784",
        //             "symbol": "LINK_USDT",
        //             "accountType": "SPOT",
        //             "orderId": "30249408733945856",
        //             "side": "BUY",
        //             "type": "LIMIT",
        //             "matchRole": "MAKER",
        //             "createTime": 1648200366864,
        //             "price": "3.1",
        //             "quantity": "1",
        //             "amount": "3.1",
        //             "feeCurrency": "LINK",
        //             "feeAmount": "0.00145",
        //             "pageId": "30341456333942784",
        //             "clientOrderId": ""
        //         }
        //     ]
        //
        return this.parseTrades(trades);
    }
    parseBalance(response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        // for swap
        if (!Array.isArray(response)) {
            const ts = this.safeInteger(response, 'uTime');
            result['timestamp'] = ts;
            result['datetime'] = this.iso8601(ts);
            const details = this.safeList(response, 'details', []);
            for (let i = 0; i < details.length; i++) {
                const balance = details[i];
                const currencyId = this.safeString(balance, 'ccy');
                const code = this.safeCurrencyCode(currencyId);
                const account = this.account();
                account['total'] = this.safeString(balance, 'avail');
                account['used'] = this.safeString(balance, 'im');
                result[code] = account;
            }
            return this.safeBalance(result);
        }
        // for spot
        for (let i = 0; i < response.length; i++) {
            const account = this.safeValue(response, i, {});
            const balances = this.safeValue(account, 'balances');
            for (let j = 0; j < balances.length; j++) {
                const balance = this.safeValue(balances, j);
                const currencyId = this.safeString(balance, 'currency');
                const code = this.safeCurrencyCode(currencyId);
                const newAccount = this.account();
                newAccount['free'] = this.safeString(balance, 'available');
                newAccount['used'] = this.safeString(balance, 'hold');
                result[code] = newAccount;
            }
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name poloniex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api-docs.poloniex.com/spot/api/private/account#all-account-balances
     * @see https://api-docs.poloniex.com/v3/futures/api/account/balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchBalance', undefined, params);
        if (marketType !== 'spot') {
            const responseRaw = await this.swapPrivateGetV3AccountBalance(params);
            //
            //    {
            //        "code": "200",
            //        "msg": "",
            //        "data": {
            //            "state": "NORMAL",
            //            "eq": "9.98571622",
            //            "isoEq": "0",
            //            "im": "0",
            //            "mm": "0",
            //            "mmr": "0",
            //            "upl": "0",
            //            "availMgn": "9.98571622",
            //            "cTime": "1738093601775",
            //            "uTime": "1740829116236",
            //            "details": [
            //                {
            //                    "ccy": "USDT",
            //                    "eq": "9.98571622",
            //                    "isoEq": "0",
            //                    "avail": "9.98571622",
            //                    "trdHold": "0",
            //                    "upl": "0",
            //                    "isoAvail": "0",
            //                    "isoHold": "0",
            //                    "isoUpl": "0",
            //                    "im": "0",
            //                    "mm": "0",
            //                    "mmr": "0",
            //                    "imr": "0",
            //                    "cTime": "1740829116236",
            //                    "uTime": "1740829116236"
            //                }
            //            ]
            //        }
            //    }
            //
            const data = this.safeDict(responseRaw, 'data', {});
            return this.parseBalance(data);
        }
        const request = {
            'accountType': 'SPOT',
        };
        const response = await this.privateGetAccountsBalances(this.extend(request, params));
        //
        //     [
        //         {
        //             "accountId" : "7xxxxxxxxxx8",
        //             "accountType" : "SPOT",
        //             "balances" : [
        //                 {
        //                     "currencyId" : "214",
        //                     "currency" : "USDT",
        //                     "available" : "2.00",
        //                     "hold" : "0.00"
        //                 }
        //             ]
        //         }
        //     ]
        //
        return this.parseBalance(response);
    }
    /**
     * @method
     * @name poloniex#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://api-docs.poloniex.com/spot/api/private/account#fee-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees(params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetFeeinfo(params);
        //
        //     {
        //         "trxDiscount" : false,
        //         "makerRate" : "0.00145",
        //         "takerRate" : "0.00155",
        //         "volume30D" : "0.00"
        //     }
        //
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': response,
                'symbol': symbol,
                'maker': this.safeNumber(response, 'makerRate'),
                'taker': this.safeNumber(response, 'takerRate'),
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }
    /**
     * @method
     * @name poloniex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api-docs.poloniex.com/spot/api/public/market-data#order-book
     * @see https://api-docs.poloniex.com/v3/futures/api/market/get-order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // The default value of limit is 10. Valid limit values are: 5, 10, 20, 50, 100, 150.
            if (market['contract']) {
                request['limit'] = this.findNearestCeiling([5, 10, 20, 100, 150], limit);
            }
        }
        if (market['contract']) {
            const responseRaw = await this.swapPublicGetV3MarketOrderBook(this.extend(request, params));
            //
            //    {
            //       "code": 200,
            //       "data": {
            //         "asks": [ ["58700", "9934"], ..],
            //         "bids": [ ["58600", "9952"], ..],
            //         "s": "100",
            //         "ts": 1719974138333
            //       },
            //       "msg": "Success"
            //    }
            //
            const data = this.safeDict(responseRaw, 'data', {});
            const ts = this.safeInteger(data, 'ts');
            return this.parseOrderBook(data, symbol, ts);
        }
        const response = await this.publicGetMarketsSymbolOrderBook(this.extend(request, params));
        //
        //     {
        //         "time" : 1659695219507,
        //         "scale" : "-1",
        //         "asks" : [ "23139.82", "0.317981", "23140", "0.191091", "23170.06", "0.01", "23200", "0.107758", "23230.55", "0.01", "23247.2", "0.154", "23254", "0.005121", "23263", "0.038", "23285.4", "0.308", "23300", "0.108896" ],
        //         "bids" : [ "23139.74", "0.432092", "23139.73", "0.198592", "23123.21", "0.000886", "23123.2", "0.308", "23121.4", "0.154", "23105", "0.000789", "23100", "0.078175", "23069.1", "0.026276", "23068.83", "0.001329", "23051", "0.000048" ],
        //         "ts" : 1659695219513
        //     }
        //
        const timestamp = this.safeInteger(response, 'time');
        const asks = this.safeValue(response, 'asks');
        const bids = this.safeValue(response, 'bids');
        const asksResult = [];
        const bidsResult = [];
        for (let i = 0; i < asks.length; i++) {
            if ((i % 2) < 1) {
                const price = this.safeNumber(asks, i);
                const amount = this.safeNumber(asks, this.sum(i, 1));
                asksResult.push([price, amount]);
            }
        }
        for (let i = 0; i < bids.length; i++) {
            if ((i % 2) < 1) {
                const price = this.safeNumber(bids, i);
                const amount = this.safeNumber(bids, this.sum(i, 1));
                bidsResult.push([price, amount]);
            }
        }
        return {
            'symbol': market['symbol'],
            'bids': this.sortBy(bidsResult, 0, true),
            'asks': this.sortBy(asksResult, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'nonce': undefined,
        };
    }
    /**
     * @method
     * @name poloniex#createDepositAddress
     * @description create a currency deposit address
     * @see https://api-docs.poloniex.com/spot/api/private/wallet#deposit-addresses
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async createDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const [request, extraParams, currency, networkEntry] = this.prepareRequestForDepositAddress(code, params);
        params = extraParams;
        const response = await this.privatePostWalletsAddress(this.extend(request, params));
        //
        //     {
        //         "address" : "0xfxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxf"
        //     }
        //
        return this.parseDepositAddressSpecial(response, currency, networkEntry);
    }
    /**
     * @method
     * @name poloniex#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://api-docs.poloniex.com/spot/api/private/wallet#deposit-addresses
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const [request, extraParams, currency, networkEntry] = this.prepareRequestForDepositAddress(code, params);
        params = extraParams;
        const response = await this.privateGetWalletsAddresses(this.extend(request, params));
        //
        //     {
        //         "USDTTRON" : "Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxp"
        //     }
        //
        const keys = Object.keys(response);
        const length = keys.length;
        if (length < 1) {
            throw new ExchangeError(this.id + ' fetchDepositAddress() returned an empty response, you might need to try "createDepositAddress" at first and then use "fetchDepositAddress"');
        }
        return this.parseDepositAddressSpecial(response, currency, networkEntry);
    }
    prepareRequestForDepositAddress(code, params = {}) {
        if (!(code in this.currencies)) {
            throw new BadSymbol(this.id + ' fetchDepositAddress(): can not recognize ' + code + ' currency, you might try using unified currency-code and add provide specific "network" parameter, like: fetchDepositAddress("USDT", { "network": "TRC20" })');
        }
        const currency = this.currency(code);
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode === undefined) {
            // we need to know the network to find out the currency-junction
            throw new ArgumentsRequired(this.id + ' fetchDepositAddress requires a network parameter for ' + code + '.');
        }
        let exchangeNetworkId = undefined;
        networkCode = this.networkIdToCode(networkCode, code);
        const networkEntry = this.safeDict(currency['networks'], networkCode);
        if (networkEntry !== undefined) {
            exchangeNetworkId = networkEntry['id'];
        }
        else {
            exchangeNetworkId = networkCode;
        }
        const request = {
            'currency': exchangeNetworkId,
        };
        return [request, params, currency, networkEntry];
    }
    parseDepositAddressSpecial(response, currency, networkEntry) {
        let address = this.safeString(response, 'address');
        if (address === undefined) {
            address = this.safeString(response, networkEntry['id']);
        }
        let tag = undefined;
        this.checkAddress(address);
        if (networkEntry !== undefined) {
            const depositAddress = this.safeString(networkEntry['info'], 'depositAddress');
            if (depositAddress !== undefined) {
                tag = address;
                address = depositAddress;
            }
        }
        return {
            'info': response,
            'currency': currency['code'],
            'network': this.safeString(networkEntry, 'network'),
            'address': address,
            'tag': tag,
        };
    }
    /**
     * @method
     * @name poloniex#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://api-docs.poloniex.com/spot/api/private/account#accounts-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const accountsByType = this.safeValue(this.options, 'accountsByType', {});
        const fromId = this.safeString(accountsByType, fromAccount, fromAccount);
        const toId = this.safeString(accountsByType, toAccount, fromAccount);
        const request = {
            'amount': this.currencyToPrecision(code, amount),
            'currency': currency['id'],
            'fromAccount': fromId,
            'toAccount': toId,
        };
        const response = await this.privatePostAccountsTransfer(this.extend(request, params));
        //
        //    {
        //        "transferId" : "168041074"
        //    }
        //
        return this.parseTransfer(response, currency);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        //    {
        //        "transferId" : "168041074"
        //    }
        //
        return {
            'info': transfer,
            'id': this.safeString(transfer, 'transferId'),
            'timestamp': undefined,
            'datetime': undefined,
            'currency': this.safeString(currency, 'id'),
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': undefined,
        };
    }
    /**
     * @method
     * @name poloniex#withdraw
     * @description make a withdrawal
     * @see https://api-docs.poloniex.com/spot/api/private/wallet#withdraw-currency
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
        const [request, extraParams, currency, networkEntry] = this.prepareRequestForDepositAddress(code, params);
        params = extraParams;
        request['amount'] = this.currencyToPrecision(code, amount);
        request['address'] = address;
        if (tag !== undefined) {
            request['paymentId'] = tag;
        }
        const response = await this.privatePostWalletsWithdraw(this.extend(request, params));
        //
        //     {
        //         "response": "Withdrew 1.00000000 USDT.",
        //         "email2FA": false,
        //         "withdrawalNumber": 13449869
        //     }
        //
        const withdrawResponse = {
            'response': response,
            'withdrawNetworkEntry': networkEntry,
        };
        return this.parseTransaction(withdrawResponse, currency);
    }
    async fetchTransactionsHelper(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const year = 31104000; // 60 * 60 * 24 * 30 * 12 = one year of history, why not
        const now = this.seconds();
        const start = (since !== undefined) ? this.parseToInt(since / 1000) : now - 10 * year;
        const request = {
            'start': start,
            'end': now, // UNIX timestamp, required
        };
        const response = await this.privateGetWalletsActivity(this.extend(request, params));
        //
        //     {
        //         "adjustments":[],
        //         "deposits":[
        //             {
        //                 "currency": "BTC",
        //                 "address": "1MEtiqJWru53FhhHrfJPPvd2tC3TPDVcmW",
        //                 "amount": "0.01063000",
        //                 "confirmations":  1,
        //                 "txid": "952b0e1888d6d491591facc0d37b5ebec540ac1efb241fdbc22bcc20d1822fb6",
        //                 "timestamp":  1507916888,
        //                 "status": "COMPLETE"
        //             },
        //             {
        //                 "currency": "ETH",
        //                 "address": "0x20108ba20b65c04d82909e91df06618107460197",
        //                 "amount": "4.00000000",
        //                 "confirmations": 38,
        //                 "txid": "0x4be260073491fe63935e9e0da42bd71138fdeb803732f41501015a2d46eb479d",
        //                 "timestamp": 1525060430,
        //                 "status": "COMPLETE"
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
        //                 "ipAddress":"x.x.x.x",
        //                 "canCancel":0,
        //                 "canResendEmail":0,
        //                 "paymentID":null,
        //                 "scope":"crypto"
        //             },
        //             {
        //                 "withdrawalNumber": 8224394,
        //                 "currency": "EMC2",
        //                 "address": "EYEKyCrqTNmVCpdDV8w49XvSKRP9N3EUyF",
        //                 "amount": "63.10796020",
        //                 "fee": "0.01000000",
        //                 "timestamp": 1510819838,
        //                 "status": "COMPLETE: d37354f9d02cb24d98c8c4fc17aa42f475530b5727effdf668ee5a43ce667fd6",
        //                 "ipAddress": "x.x.x.x"
        //             },
        //             {
        //                 "withdrawalNumber": 9290444,
        //                 "currency": "ETH",
        //                 "address": "0x191015ff2e75261d50433fbd05bd57e942336149",
        //                 "amount": "0.15500000",
        //                 "fee": "0.00500000",
        //                 "timestamp": 1514099289,
        //                 "status": "COMPLETE: 0x12d444493b4bca668992021fd9e54b5292b8e71d9927af1f076f554e4bea5b2d",
        //                 "ipAddress": "x.x.x.x"
        //             },
        //             {
        //                 "withdrawalNumber": 11518260,
        //                 "currency": "BTC",
        //                 "address": "8JoDXAmE1GY2LRK8jD1gmAmgRPq54kXJ4t",
        //                 "amount": "0.20000000",
        //                 "fee": "0.00050000",
        //                 "timestamp": 1527918155,
        //                 "status": "COMPLETE: 1864f4ebb277d90b0b1ff53259b36b97fa1990edc7ad2be47c5e0ab41916b5ff",
        //                 "ipAddress": "x.x.x.x"
        //             }
        //         ]
        //     }
        //
        return response;
    }
    /**
     * @method
     * @name poloniex#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://api-docs.poloniex.com/spot/api/private/wallet#wallets-activity-records
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDepositsWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.fetchTransactionsHelper(code, since, limit, params);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const withdrawals = this.safeValue(response, 'withdrawals', []);
        const deposits = this.safeValue(response, 'deposits', []);
        const withdrawalTransactions = this.parseTransactions(withdrawals, currency, since, limit);
        const depositTransactions = this.parseTransactions(deposits, currency, since, limit);
        const transactions = this.arrayConcat(depositTransactions, withdrawalTransactions);
        return this.filterByCurrencySinceLimit(this.sortBy(transactions, 'timestamp'), code, since, limit);
    }
    /**
     * @method
     * @name poloniex#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://api-docs.poloniex.com/spot/api/private/wallet#wallets-activity-records
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.fetchTransactionsHelper(code, since, limit, params);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const withdrawals = this.safeValue(response, 'withdrawals', []);
        const transactions = this.parseTransactions(withdrawals, currency, since, limit);
        return this.filterByCurrencySinceLimit(transactions, code, since, limit);
    }
    /**
     * @method
     * @name poloniex#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://api-docs.poloniex.com/spot/api/public/reference-data#currency-information
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [fees structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchDepositWithdrawFees(codes = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.publicGetCurrencies(this.extend(params, { 'includeMultiChainCurrencies': true }));
        //
        //     [
        //         {
        //             "1CR": {
        //                 "id": 1,
        //                 "name": "1CRedit",
        //                 "description": "BTC Clone",
        //                 "type": "address",
        //                 "withdrawalFee": "0.01000000",
        //                 "minConf": 10000,
        //                 "depositAddress": null,
        //                 "blockchain": "1CR",
        //                 "delisted": false,
        //                 "tradingState": "NORMAL",
        //                 "walletState": "DISABLED",
        //                 "parentChain": null,
        //                 "isMultiChain": false,
        //                 "isChildChain": false,
        //                 "childChains": []
        //             }
        //         }
        //     ]
        //
        const data = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const currencies = Object.keys(entry);
            const currencyId = this.safeString(currencies, 0);
            data[currencyId] = entry[currencyId];
        }
        return this.parseDepositWithdrawFees(data, codes);
    }
    parseDepositWithdrawFees(response, codes = undefined, currencyIdKey = undefined) {
        //
        //         {
        //             "1CR": {
        //                 "id": 1,
        //                 "name": "1CRedit",
        //                 "description": "BTC Clone",
        //                 "type": "address",
        //                 "withdrawalFee": "0.01000000",
        //                 "minConf": 10000,
        //                 "depositAddress": null,
        //                 "blockchain": "1CR",
        //                 "delisted": false,
        //                 "tradingState": "NORMAL",
        //                 "walletState": "DISABLED",
        //                 "parentChain": null,
        //                 "isMultiChain": false,
        //                 "isChildChain": false,
        //                 "childChains": []
        //             },
        //         }
        //
        const depositWithdrawFees = {};
        codes = this.marketCodes(codes);
        const responseKeys = Object.keys(response);
        for (let i = 0; i < responseKeys.length; i++) {
            const currencyId = responseKeys[i];
            const code = this.safeCurrencyCode(currencyId);
            const feeInfo = response[currencyId];
            if ((codes === undefined) || (this.inArray(code, codes))) {
                const currency = this.currency(code);
                depositWithdrawFees[code] = this.parseDepositWithdrawFee(feeInfo, currency);
                const childChains = this.safeValue(feeInfo, 'childChains');
                const chainsLength = childChains.length;
                if (chainsLength > 0) {
                    for (let j = 0; j < childChains.length; j++) {
                        let networkId = childChains[j];
                        networkId = networkId.replace(code, '');
                        const networkCode = this.networkIdToCode(networkId);
                        const networkInfo = this.safeValue(response, networkId);
                        const networkObject = {};
                        const withdrawFee = this.safeNumber(networkInfo, 'withdrawalFee');
                        networkObject[networkCode] = {
                            'withdraw': {
                                'fee': withdrawFee,
                                'percentage': (withdrawFee !== undefined) ? false : undefined,
                            },
                            'deposit': {
                                'fee': undefined,
                                'percentage': undefined,
                            },
                        };
                        depositWithdrawFees[code]['networks'] = this.extend(depositWithdrawFees[code]['networks'], networkObject);
                    }
                }
            }
        }
        return depositWithdrawFees;
    }
    parseDepositWithdrawFee(fee, currency = undefined) {
        const depositWithdrawFee = this.depositWithdrawFee({});
        depositWithdrawFee['info'][currency['code']] = fee;
        const networkId = this.safeString(fee, 'blockchain');
        const withdrawFee = this.safeNumber(fee, 'withdrawalFee');
        const withdrawResult = {
            'fee': withdrawFee,
            'percentage': (withdrawFee !== undefined) ? false : undefined,
        };
        const depositResult = {
            'fee': undefined,
            'percentage': undefined,
        };
        depositWithdrawFee['withdraw'] = withdrawResult;
        depositWithdrawFee['deposit'] = depositResult;
        const networkCode = this.networkIdToCode(networkId);
        depositWithdrawFee['networks'][networkCode] = {
            'withdraw': withdrawResult,
            'deposit': depositResult,
        };
        return depositWithdrawFee;
    }
    /**
     * @method
     * @name poloniex#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://api-docs.poloniex.com/spot/api/private/wallet#wallets-activity-records
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.fetchTransactionsHelper(code, since, limit, params);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const deposits = this.safeValue(response, 'deposits', []);
        const transactions = this.parseTransactions(deposits, currency, since, limit);
        return this.filterByCurrencySinceLimit(transactions, code, since, limit);
    }
    parseTransactionStatus(status) {
        const statuses = {
            'COMPLETE': 'ok',
            'COMPLETED': 'ok',
            'AWAITING APPROVAL': 'pending',
            'AWAITING_APPROVAL': 'pending',
            'PENDING': 'pending',
            'PROCESSING': 'pending',
            'COMPLETE ERROR': 'failed',
            'COMPLETE_ERROR': 'failed',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // deposits
        //
        //     {
        //         "txid": "f49d489616911db44b740612d19464521179c76ebe9021af85b6de1e2f8d68cd",
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
        //         "withdrawalRequestsId": 7397527,
        //         "currency": "ETC",
        //         "address": "0x26419a62055af459d2cd69bb7392f5100b75e304",
        //         "amount": "13.19951600",
        //         "fee": "0.01000000",
        //         "timestamp": 1506010932,
        //         "status": "COMPLETED",
        //         "txid": "343346392f82ac16e8c2604f2a604b7b2382d0e9d8030f673821f8de4b5f5bk",
        //         "ipAddress": "1.2.3.4",
        //         "paymentID": null
        //     }
        //
        // withdraw
        //
        //     {
        //         "withdrawalRequestsId": 33485231
        //     }
        //
        // if it's being parsed from "withdraw()" method, get the original response
        if ('withdrawNetworkEntry' in transaction) {
            transaction = transaction['response'];
        }
        const timestamp = this.safeTimestamp(transaction, 'timestamp');
        const currencyId = this.safeString(transaction, 'currency');
        const code = this.safeCurrencyCode(currencyId);
        let status = this.safeString(transaction, 'status', 'pending');
        status = this.parseTransactionStatus(status);
        const txid = this.safeString(transaction, 'txid');
        const type = ('withdrawalRequestsId' in transaction) ? 'withdrawal' : 'deposit';
        const id = this.safeString2(transaction, 'withdrawalRequestsId', 'depositNumber');
        const address = this.safeString(transaction, 'address');
        const tag = this.safeString(transaction, 'paymentID');
        let amountString = this.safeString(transaction, 'amount');
        const feeCostString = this.safeString(transaction, 'fee');
        if (type === 'withdrawal') {
            amountString = Precise.stringSub(amountString, feeCostString);
        }
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': this.parseNumber(amountString),
            'network': undefined,
            'address': address,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': undefined,
            'tagFrom': undefined,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'comment': undefined,
            'internal': undefined,
            'fee': {
                'currency': code,
                'cost': this.parseNumber(feeCostString),
                'rate': undefined,
            },
        };
    }
    /**
     * @method
     * @name poloniex#setLeverage
     * @description set the level of leverage for a market
     * @see https://api-docs.poloniex.com/v3/futures/api/positions/set-leverage
     * @param {int} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated'
     * @returns {object} response from the exchange
     */
    async setLeverage(leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('setLeverage', params);
        if (marginMode === undefined) {
            throw new ArgumentsRequired(this.id + ' setLeverage() requires a marginMode parameter "cross" or "isolated"');
        }
        let hedged = undefined;
        [hedged, params] = this.handleParamBool(params, 'hedged', false);
        if (hedged) {
            if (!('posSide' in params)) {
                throw new ArgumentsRequired(this.id + ' setLeverage() requires a posSide parameter for hedged mode: "LONG" or "SHORT"');
            }
        }
        const request = {
            'lever': leverage,
            'mgnMode': marginMode.toUpperCase(),
            'symbol': market['id'],
        };
        const response = await this.swapPrivatePostV3PositionLeverage(this.extend(request, params));
        return response;
    }
    /**
     * @method
     * @name poloniex#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://api-docs.poloniex.com/v3/futures/api/positions/get-leverages
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverage(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchLeverage', params);
        if (marginMode === undefined) {
            throw new ArgumentsRequired(this.id + ' fetchLeverage() requires a marginMode parameter "cross" or "isolated"');
        }
        request['mgnMode'] = marginMode.toUpperCase();
        const response = await this.swapPrivateGetV3PositionLeverages(this.extend(request, params));
        //
        //  for one-way mode:
        //
        //    {
        //        "code": "200",
        //        "msg": "",
        //        "data": [
        //            {
        //                "symbol": "BTC_USDT_PERP",
        //                "lever": "10",
        //                "mgnMode": "CROSS",
        //                "posSide": "BOTH"
        //            }
        //        ]
        //    }
        //
        //  for hedge:
        //
        //    {
        //        "code": "200",
        //        "msg": "",
        //        "data": [
        //            {
        //                "symbol": "BTC_USDT_PERP",
        //                "lever": "20",
        //                "mgnMode": "CROSS",
        //                "posSide": "SHORT"
        //            },
        //            {
        //                "symbol": "BTC_USDT_PERP",
        //                "lever": "20",
        //                "mgnMode": "CROSS",
        //                "posSide": "LONG"
        //            }
        //        ]
        //    }
        //
        return this.parseLeverage(response, market);
    }
    parseLeverage(leverage, market = undefined) {
        let shortLeverage = undefined;
        let longLeverage = undefined;
        let marketId = undefined;
        let marginMode = undefined;
        const data = this.safeList(leverage, 'data');
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            marketId = this.safeString(entry, 'symbol');
            marginMode = this.safeString(entry, 'mgnMode');
            const lever = this.safeInteger(entry, 'lever');
            const posSide = this.safeString(entry, 'posSide');
            if (posSide === 'LONG') {
                longLeverage = lever;
            }
            else if (posSide === 'SHORT') {
                shortLeverage = lever;
            }
            else {
                longLeverage = lever;
                shortLeverage = lever;
            }
        }
        return {
            'info': leverage,
            'symbol': this.safeSymbol(marketId, market),
            'marginMode': marginMode,
            'longLeverage': longLeverage,
            'shortLeverage': shortLeverage,
        };
    }
    /**
     * @method
     * @name poloniex#fetchPositionMode
     * @description fetchs the position mode, hedged or one way, hedged for binance is set identically for all linear markets or all inverse markets
     * @see https://api-docs.poloniex.com/v3/futures/api/positions/position-mode-switch
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    async fetchPositionMode(symbol = undefined, params = {}) {
        const response = await this.swapPrivateGetV3PositionMode(params);
        //
        //    {
        //        "code": "200",
        //        "msg": "Success",
        //        "data": {
        //            "posMode": "ONE_WAY"
        //        }
        //    }
        //
        const data = this.safeDict(response, 'data', {});
        const posMode = this.safeString(data, 'posMode');
        const hedged = posMode === 'HEDGE';
        return {
            'info': response,
            'hedged': hedged,
        };
    }
    /**
     * @method
     * @name poloniex#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://api-docs.poloniex.com/v3/futures/api/positions/position-mode-switch
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol not used by binance setPositionMode ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setPositionMode(hedged, symbol = undefined, params = {}) {
        const mode = hedged ? 'HEDGE' : 'ONE_WAY';
        const request = {
            'posMode': mode,
        };
        const response = await this.swapPrivatePostV3PositionMode(this.extend(request, params));
        //
        //    {
        //        "code": "200",
        //        "msg": "Success",
        //        "data": {}
        //    }
        //
        return response;
    }
    /**
     * @method
     * @name poloniex#fetchPositions
     * @description fetch all open positions
     * @see https://api-docs.poloniex.com/v3/futures/api/positions/get-current-position
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.standard] whether to fetch standard contract positions
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.swapPrivateGetV3TradePositionOpens(params);
        //
        //    {
        //        "code": "200",
        //        "msg": "",
        //        "data": [
        //            {
        //                "symbol": "BTC_USDT_PERP",
        //                "posSide": "LONG",
        //                "side": "BUY",
        //                "mgnMode": "CROSS",
        //                "openAvgPx": "94193.42",
        //                "qty": "1",
        //                "availQty": "1",
        //                "lever": "20",
        //                "adl": "0.3007",
        //                "liqPx": "84918.201844064386317906",
        //                "im": "4.7047795",
        //                "mm": "0.56457354",
        //                "upl": "-0.09783",
        //                "uplRatio": "-0.0207",
        //                "pnl": "0",
        //                "markPx": "94095.59",
        //                "mgnRatio": "0.0582",
        //                "state": "NORMAL",
        //                "cTime": "1740950344401",
        //                "uTime": "1740950344401",
        //                "mgn": "4.7047795",
        //                "actType": "TRADING",
        //                "maxWAmt": "0",
        //                "tpTrgPx": "",
        //                "slTrgPx": ""
        //            }
        //        ]
        //    }
        //
        const positions = this.safeList(response, 'data', []);
        return this.parsePositions(positions, symbols);
    }
    parsePosition(position, market = undefined) {
        //
        //            {
        //                "symbol": "BTC_USDT_PERP",
        //                "posSide": "LONG",
        //                "side": "BUY",
        //                "mgnMode": "CROSS",
        //                "openAvgPx": "94193.42",
        //                "qty": "1",
        //                "availQty": "1",
        //                "lever": "20",
        //                "adl": "0.3007",
        //                "liqPx": "84918.201844064386317906",
        //                "im": "4.7047795",
        //                "mm": "0.56457354",
        //                "upl": "-0.09783",
        //                "uplRatio": "-0.0207",
        //                "pnl": "0",
        //                "markPx": "94095.59",
        //                "mgnRatio": "0.0582",
        //                "state": "NORMAL",
        //                "cTime": "1740950344401",
        //                "uTime": "1740950344401",
        //                "mgn": "4.7047795",
        //                "actType": "TRADING",
        //                "maxWAmt": "0",
        //                "tpTrgPx": "",
        //                "slTrgPx": ""
        //            }
        //
        const marketId = this.safeString(position, 'symbol');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(position, 'cTime');
        const marginMode = this.safeStringLower(position, 'mgnMode');
        const leverage = this.safeString(position, 'lever');
        const initialMargin = this.safeString(position, 'im');
        const notional = Precise.stringMul(leverage, initialMargin);
        const qty = this.safeString(position, 'qty');
        const avgPrice = this.safeString(position, 'openAvgPx');
        const collateral = Precise.stringMul(qty, avgPrice);
        // todo: some more fields
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': market['symbol'],
            'notional': notional,
            'marginMode': marginMode,
            'liquidationPrice': this.safeNumber(position, 'liqPx'),
            'entryPrice': this.safeNumber(position, 'openAvgPx'),
            'unrealizedPnl': this.safeNumber(position, 'upl'),
            'percentage': undefined,
            'contracts': this.safeNumber(position, 'qty'),
            'contractSize': undefined,
            'markPrice': this.safeNumber(position, 'markPx'),
            'lastPrice': undefined,
            'side': this.safeStringLower(position, 'posSide'),
            'hedged': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastUpdateTimestamp': undefined,
            'maintenanceMargin': this.safeNumber(position, 'mm'),
            'maintenanceMarginPercentage': undefined,
            'collateral': collateral,
            'initialMargin': initialMargin,
            'initialMarginPercentage': undefined,
            'leverage': parseInt(leverage),
            'marginRatio': this.safeNumber(position, 'mgnRatio'),
            'stopLossPrice': this.safeNumber(position, 'slTrgPx'),
            'takeProfitPrice': this.safeNumber(position, 'tpTrgPx'),
        });
    }
    async modifyMarginHelper(symbol, amount, type, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        amount = this.amountToPrecision(symbol, amount);
        const request = {
            'symbol': market['id'],
            'amt': Precise.stringAbs(amount),
            'type': type.toUpperCase(), // 'ADD' or 'REDUCE'
        };
        // todo: hedged handling, tricky
        if (!('posMode' in params)) {
            request['posMode'] = 'BOTH';
        }
        const response = await this.swapPrivatePostV3TradePositionMargin(this.extend(request, params));
        //
        // {
        //     "code": 200,
        //     "data": {
        //       "amt": "50",
        //       "lever": "20",
        //       "symbol": "DOT_USDT_PERP",
        //       "posSide": "BOTH",
        //       "type": "ADD"
        //     },
        //     "msg": "Success"
        // }
        //
        if (type === 'reduce') {
            amount = Precise.stringAbs(amount);
        }
        const data = this.safeDict(response, 'data');
        return this.parseMarginModification(data, market);
    }
    parseMarginModification(data, market = undefined) {
        const marketId = this.safeString(data, 'symbol');
        market = this.safeMarket(marketId, market);
        const rawType = this.safeString(data, 'type');
        const type = (rawType === 'ADD') ? 'add' : 'reduce';
        return {
            'info': data,
            'symbol': market['symbol'],
            'type': type,
            'marginMode': undefined,
            'amount': this.safeNumber(data, 'amt'),
            'total': undefined,
            'code': undefined,
            'status': 'ok',
            'timestamp': undefined,
            'datetime': undefined,
        };
    }
    /**
     * @method
     * @name poloniex#reduceMargin
     * @description remove margin from a position
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    async reduceMargin(symbol, amount, params = {}) {
        return await this.modifyMarginHelper(symbol, -amount, 'reduce', params);
    }
    /**
     * @method
     * @name poloniex#addMargin
     * @description add margin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    async addMargin(symbol, amount, params = {}) {
        return await this.modifyMarginHelper(symbol, amount, 'add', params);
    }
    nonce() {
        return this.milliseconds();
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['spot'];
        if (this.inArray(api, ['swapPublic', 'swapPrivate'])) {
            url = this.urls['api']['swap'];
        }
        const query = this.omit(params, this.extractParams(path));
        const implodedPath = this.implodeParams(path, params);
        if (api === 'public' || api === 'swapPublic') {
            url += '/' + implodedPath;
            if (Object.keys(query).length) {
                url += '?' + this.urlencode(query);
            }
        }
        else {
            this.checkRequiredCredentials();
            const timestamp = this.nonce().toString();
            let auth = method + "\n"; // eslint-disable-line quotes
            url += '/' + implodedPath;
            auth += '/' + implodedPath;
            if ((method === 'POST') || (method === 'PUT') || (method === 'DELETE')) {
                auth += "\n"; // eslint-disable-line quotes
                if (Object.keys(query).length) {
                    body = this.json(query);
                    auth += 'requestBody=' + body + '&';
                }
                auth += 'signTimestamp=' + timestamp;
            }
            else {
                let sortedQuery = this.extend({ 'signTimestamp': timestamp }, query);
                sortedQuery = this.keysort(sortedQuery);
                auth += "\n" + this.urlencode(sortedQuery); // eslint-disable-line quotes
                if (Object.keys(query).length) {
                    url += '?' + this.urlencode(query);
                }
            }
            const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256, 'base64');
            headers = {
                'Content-Type': 'application/json',
                'key': this.apiKey,
                'signTimestamp': timestamp,
                'signature': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        //
        //     {
        //         "code" : 21709,
        //         "message" : "Low available balance"
        //     }
        //
        const responseCode = this.safeString(response, 'code');
        if ((responseCode !== undefined) && (responseCode !== '200')) {
            const codeInner = response['code'];
            const message = this.safeString(response, 'message');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException(this.exceptions['exact'], codeInner, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            throw new ExchangeError(feedback); // unknown message
        }
        return undefined;
    }
}
