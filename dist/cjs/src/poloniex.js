'use strict';

var poloniex$1 = require('./abstract/poloniex.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class poloniex extends poloniex$1 {
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
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createDepositAddress': true,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrder': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
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
                'fetchPositionMode': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawals': true,
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
                '1M': 'MONTH_1',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg',
                'api': {
                    'rest': 'https://api.poloniex.com',
                },
                'test': {
                    'rest': 'https://sand-spot-api-gateway.poloniex.com',
                },
                'www': 'https://www.poloniex.com',
                'doc': 'https://docs.poloniex.com',
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
                        'timestamp': 1,
                        'markets/price': 1,
                        'markets/{symbol}/price': 1,
                        'markets/{symbol}/orderBook': 1,
                        'markets/{symbol}/candles': 1,
                        'markets/{symbol}/trades': 20,
                        'markets/ticker24h': 20,
                        'markets/{symbol}/ticker24h': 20,
                    },
                },
                'private': {
                    'get': {
                        'accounts': 4,
                        'accounts/activity': 4,
                        'accounts/balances': 4,
                        'accounts/{id}/balances': 4,
                        'accounts/transfer': 20,
                        'accounts/transfer/{id}': 4,
                        'subaccounts': 4,
                        'subaccounts/balances': 20,
                        'subaccounts/{id}/balances': 4,
                        'subaccounts/transfer': 20,
                        'subaccounts/transfer/{id}': 4,
                        'feeinfo': 20,
                        'wallets/addresses': 20,
                        'wallets/activity': 20,
                        'wallets/addresses/{currency}': 20,
                        'orders': 20,
                        'orders/{id}': 4,
                        'orders/history': 20,
                        'orders/killSwitchStatus': 4,
                        'smartorders': 20,
                        'smartorders/{id}': 4,
                        'smartorders/history': 20,
                        'trades': 20,
                        'orders/{id}/trades': 4,
                    },
                    'post': {
                        'accounts/transfer': 4,
                        'subaccounts/transfer': 20,
                        'wallets/address': 20,
                        'wallets/withdraw': 20,
                        'orders': 4,
                        'orders/killSwitch': 4,
                        'orders/batch': 20,
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
                        'orders/{id}': 4,
                        'smartorders/{id}': 4,
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
                'UST': 'USTC',
            },
            'options': {
                'networks': {
                    'BEP20': 'BSC',
                    'ERC20': 'ETH',
                    'TRC20': 'TRON',
                },
                'networksById': {
                    'BSC': 'BEP20',
                    'ETH': 'ERC20',
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
            'precisionMode': number.TICK_SIZE,
            'exceptions': {
                'exact': {
                    // General
                    '200': errors.CancelPending,
                    '500': errors.ExchangeNotAvailable,
                    '603': errors.RequestTimeout,
                    '601': errors.BadRequest,
                    '415': errors.ExchangeError,
                    '602': errors.ArgumentsRequired,
                    // Accounts
                    '21604': errors.BadRequest,
                    '21600': errors.AuthenticationError,
                    '21605': errors.AuthenticationError,
                    '21102': errors.ExchangeError,
                    '21100': errors.AuthenticationError,
                    '21704': errors.AuthenticationError,
                    '21700': errors.BadRequest,
                    '21705': errors.BadRequest,
                    '21707': errors.ExchangeError,
                    '21708': errors.BadRequest,
                    '21601': errors.AccountSuspended,
                    '21711': errors.ExchangeError,
                    '21709': errors.InsufficientFunds,
                    '250000': errors.ExchangeError,
                    '250001': errors.BadRequest,
                    '250002': errors.BadRequest,
                    '250003': errors.BadRequest,
                    '250004': errors.BadRequest,
                    '250005': errors.InsufficientFunds,
                    '250008': errors.BadRequest,
                    '250012': errors.ExchangeError,
                    // Trading
                    '21110': errors.BadRequest,
                    '10040': errors.BadSymbol,
                    '10060': errors.ExchangeError,
                    '10020': errors.BadSymbol,
                    '10041': errors.BadSymbol,
                    '21340': errors.OnMaintenance,
                    '21341': errors.InvalidOrder,
                    '21342': errors.InvalidOrder,
                    '21343': errors.InvalidOrder,
                    '21351': errors.AccountSuspended,
                    '21352': errors.BadSymbol,
                    '21353': errors.PermissionDenied,
                    '21354': errors.PermissionDenied,
                    '24106': errors.BadRequest,
                    '24201': errors.ExchangeNotAvailable,
                    // Orders
                    '21301': errors.OrderNotFound,
                    '21302': errors.ExchangeError,
                    '21304': errors.ExchangeError,
                    '21305': errors.OrderNotFound,
                    '21307': errors.ExchangeError,
                    '21309': errors.InvalidOrder,
                    '21310': errors.InvalidOrder,
                    '21311': errors.InvalidOrder,
                    '21312': errors.InvalidOrder,
                    '21314': errors.InvalidOrder,
                    '21315': errors.InvalidOrder,
                    '21317': errors.InvalidOrder,
                    '21319': errors.InvalidOrder,
                    '21320': errors.InvalidOrder,
                    '21321': errors.InvalidOrder,
                    '21322': errors.InvalidOrder,
                    '21324': errors.BadRequest,
                    '21327': errors.InvalidOrder,
                    '21328': errors.InvalidOrder,
                    '21330': errors.InvalidOrder,
                    '21335': errors.InvalidOrder,
                    '21336': errors.InvalidOrder,
                    '21337': errors.InvalidOrder,
                    '21344': errors.InvalidOrder,
                    '21345': errors.InvalidOrder,
                    '21346': errors.InvalidOrder,
                    '21348': errors.InvalidOrder,
                    '21347': errors.InvalidOrder,
                    '21349': errors.InvalidOrder,
                    '21350': errors.InvalidOrder,
                    '21355': errors.ExchangeError,
                    '21356': errors.BadRequest,
                    '24101': errors.BadSymbol,
                    '24102': errors.InvalidOrder,
                    '24103': errors.InvalidOrder,
                    '24104': errors.InvalidOrder,
                    '24105': errors.InvalidOrder,
                    '25020': errors.InvalidOrder,
                    // Smartorders
                    '25000': errors.InvalidOrder,
                    '25001': errors.InvalidOrder,
                    '25002': errors.InvalidOrder,
                    '25003': errors.ExchangeError,
                    '25004': errors.InvalidOrder,
                    '25005': errors.ExchangeError,
                    '25006': errors.InvalidOrder,
                    '25007': errors.InvalidOrder,
                    '25008': errors.InvalidOrder,
                    '25009': errors.ExchangeError,
                    '25010': errors.PermissionDenied,
                    '25011': errors.InvalidOrder,
                    '25012': errors.ExchangeError,
                    '25013': errors.OrderNotFound,
                    '25014': errors.OrderNotFound,
                    '25015': errors.OrderNotFound,
                    '25016': errors.ExchangeError,
                    '25017': errors.ExchangeError,
                    '25018': errors.BadRequest,
                    '25019': errors.BadSymbol, // Invalid symbol
                },
                'broad': {},
            },
        });
    }
    parseOHLCV(ohlcv, market = undefined) {
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
        return [
            this.safeInteger(ohlcv, 12),
            this.safeNumber(ohlcv, 2),
            this.safeNumber(ohlcv, 1),
            this.safeNumber(ohlcv, 0),
            this.safeNumber(ohlcv, 3),
            this.safeNumber(ohlcv, 5),
        ];
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.poloniex.com/#public-endpoints-market-data-candles
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.safeString(this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            // limit should in between 100 and 500
            request['limit'] = limit;
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
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name poloniex#fetchMarkets
         * @description retrieves data on all markets for poloniex
         * @see https://docs.poloniex.com/#public-endpoints-reference-data-symbol-information
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
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
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = this.safeValue(markets, i);
            const id = this.safeString(market, 'symbol');
            const baseId = this.safeString(market, 'baseCurrencyName');
            const quoteId = this.safeString(market, 'quoteCurrencyName');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const state = this.safeString(market, 'state');
            const active = state === 'NORMAL';
            const symbolTradeLimit = this.safeValue(market, 'symbolTradeLimit');
            // these are known defaults
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
                'info': market,
            });
        }
        return result;
    }
    async fetchTime(params = {}) {
        /**
         * @method
         * @name poloniex#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://docs.poloniex.com/#public-endpoints-reference-data-system-timestamp
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetTimestamp(params);
        return this.safeInteger(response, 'serverTime');
    }
    parseTicker(ticker, market = undefined) {
        //
        //     {
        //         "symbol" : "BTC_USDT",
        //         "open" : "22814.93",
        //         "low" : "22441.90",
        //         "high" : "23413.00",
        //         "close" : "23148.66",
        //         "quantity" : "71.743706",
        //         "amount" : "1638994.52683452",
        //         "tradeCount" : 3893,
        //         "startTime" : 1659605760000,
        //         "closeTime" : 1659692161077,
        //         "displayName" : "BTC/USDT",
        //         "dailyChange" : "0.0152",
        //         "ts" : 1659692169838
        //     }
        //
        const timestamp = this.safeInteger(ticker, 'ts');
        const marketId = this.safeString(ticker, 'symbol');
        market = this.safeMarket(marketId);
        const close = this.safeString(ticker, 'close');
        const relativeChange = this.safeString(ticker, 'percentChange');
        const percentage = Precise["default"].stringMul(relativeChange, '100');
        return this.safeTicker({
            'id': marketId,
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'high'),
            'low': this.safeString(ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString(ticker, 'open'),
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'quantity'),
            'quoteVolume': this.safeString(ticker, 'amount'),
            'info': ticker,
        }, market);
    }
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://docs.poloniex.com/#public-endpoints-market-data-ticker
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.publicGetMarketsTicker24h(params);
        //
        //     [
        //         {
        //             "symbol" : "KUB_USDD",
        //             "open" : "0",
        //             "low" : "0",
        //             "high" : "0",
        //             "close" : "0",
        //             "quantity" : "0",
        //             "amount" : "0",
        //             "tradeCount" : 0,
        //             "startTime" : 1659606240000,
        //             "closeTime" : 1659692648742,
        //             "displayName" : "KUB/USDD",
        //             "dailyChange" : "0.00",
        //             "ts" : 1659692648742
        //         }
        //     ]
        //
        return this.parseTickers(response, symbols);
    }
    async fetchCurrencies(params = {}) {
        /**
         * @method
         * @name poloniex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://docs.poloniex.com/#public-endpoints-reference-data-currency-information
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetCurrencies(params);
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
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const item = this.safeValue(response, i);
            const ids = Object.keys(item);
            const id = this.safeValue(ids, 0);
            const currency = this.safeValue(item, id);
            const code = this.safeCurrencyCode(id);
            const delisted = this.safeValue(currency, 'delisted');
            const walletState = this.safeString(currency, 'walletState');
            const enabled = walletState === 'ENABLED';
            const listed = !delisted;
            const active = listed && enabled;
            const numericId = this.safeInteger(currency, 'id');
            const fee = this.safeNumber(currency, 'withdrawalFee');
            result[code] = {
                'id': id,
                'numericId': numericId,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': active,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': fee,
                'precision': undefined,
                'networks': {},
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': fee,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name poloniex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.poloniex.com/#public-endpoints-market-data-ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketsSymbolTicker24h(this.extend(request, params));
        //
        //     {
        //         "symbol" : "BTC_USDT",
        //         "open" : "22814.93",
        //         "low" : "22441.90",
        //         "high" : "23413.00",
        //         "close" : "23148.66",
        //         "quantity" : "71.743706",
        //         "amount" : "1638994.52683452",
        //         "tradeCount" : 3893,
        //         "startTime" : 1659605760000,
        //         "closeTime" : 1659692161077,
        //         "displayName" : "BTC/USDT",
        //         "dailyChange" : "0.0152",
        //         "ts" : 1659692169838
        //     }
        //
        return this.parseTicker(response, market);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades
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
        // fetchMyTrades
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
        //
        const id = this.safeString2(trade, 'id', 'tradeID');
        const orderId = this.safeString(trade, 'orderId');
        const timestamp = this.safeInteger2(trade, 'ts', 'createTime');
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market, '_');
        const symbol = market['symbol'];
        const side = this.safeStringLower2(trade, 'side', 'takerSide');
        let fee = undefined;
        const priceString = this.safeString(trade, 'price');
        const amountString = this.safeString(trade, 'quantity');
        const costString = this.safeString(trade, 'amount');
        const feeCurrencyId = this.safeString(trade, 'feeCurrency');
        const feeCostString = this.safeString(trade, 'feeAmount');
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
            'type': this.safeStringLower(trade, 'type'),
            'side': side,
            'takerOrMaker': this.safeStringLower(trade, 'matchRole'),
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.poloniex.com/#public-endpoints-market-data-trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
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
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://docs.poloniex.com/#authenticated-endpoints-trades-trade-history
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {
        // 'from': 12345678, // A 'trade Id'. The query begins at ‘from'.
        // 'direction': 'PRE', // PRE, NEXT The direction before or after ‘from'.
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
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
        const result = this.parseTrades(response, market);
        return this.filterBySinceLimit(result, since, limit);
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
        // fetchOpenOrders
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
        // createOrder, editOrder
        //
        //     {
        //         "id": "29772698821328896",
        //         "clientOrderId": "1234Abc"
        //     }
        //
        let timestamp = this.safeInteger2(order, 'timestamp', 'createTime');
        if (timestamp === undefined) {
            timestamp = this.parse8601(this.safeString(order, 'date'));
        }
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market, '_');
        const symbol = market['symbol'];
        let resultingTrades = this.safeValue(order, 'resultingTrades');
        if (!Array.isArray(resultingTrades)) {
            resultingTrades = this.safeValue(resultingTrades, this.safeString(market, 'id', marketId));
        }
        const price = this.safeString2(order, 'price', 'rate');
        const amount = this.safeString(order, 'quantity');
        const filled = this.safeString(order, 'filledQuantity');
        const status = this.parseOrderStatus(this.safeString(order, 'state'));
        const side = this.safeStringLower(order, 'side');
        const rawType = this.safeString(order, 'type');
        const type = this.parseOrderType(rawType);
        const id = this.safeString2(order, 'orderNumber', 'id');
        let fee = undefined;
        const feeCurrency = this.safeString(order, 'tokenFeeCurrency');
        let feeCost = undefined;
        let feeCurrencyCode = undefined;
        const rate = this.safeString(order, 'fee');
        if (feeCurrency === undefined) {
            feeCurrencyCode = (side === 'buy') ? market['base'] : market['quote'];
        }
        else {
            // poloniex accepts a 30% discount to pay fees in TRX
            feeCurrencyCode = this.safeCurrencyCode(feeCurrency);
            feeCost = this.safeString(order, 'tokenFee');
        }
        if (feeCost !== undefined) {
            fee = {
                'rate': rate,
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const clientOrderId = this.safeString(order, 'clientOrderId');
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
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'cost': undefined,
            'average': this.safeString(order, 'avgPrice'),
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'trades': resultingTrades,
            'fee': fee,
        }, market);
    }
    parseOrderType(status) {
        const statuses = {
            'MARKET': 'market',
            'LIMIT': 'limit',
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
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://docs.poloniex.com/#authenticated-endpoints-orders-open-orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrders(this.extend(request, params));
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
        //             "createTime" : 16xxxxxxxxx26,
        //             "updateTime" : 16xxxxxxxxx36
        //         }
        //     ]
        //
        const extension = { 'status': 'open' };
        return this.parseOrders(response, market, since, limit, extension);
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#createOrder
         * @description create a trade order
         * @see https://docs.poloniex.com/#authenticated-endpoints-orders-create-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        // if (type === 'market') {
        //     throw new ExchangeError (this.id + ' createOrder() does not accept market orders');
        // }
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' createOrder() does not support ' + market['type'] + ' orders, only spot orders are accepted');
        }
        const request = {
            'symbol': market['id'],
            'side': side,
            // 'timeInForce': timeInForce,
            // 'accountType': 'SPOT',
            // 'amount': amount,
        };
        const orderRequest = this.orderRequest(symbol, type, side, amount, request, price, params);
        let response = await this.privatePostOrders(this.extend(orderRequest[0], orderRequest[1]));
        //
        //     {
        //         "id" : "78923648051920896",
        //         "clientOrderId" : ""
        //     }
        //
        response = this.extend(response, {
            'type': side,
        });
        return this.parseOrder(response, market);
    }
    orderRequest(symbol, type, side, amount, request, price = undefined, params = {}) {
        const market = this.market(symbol);
        let upperCaseType = type.toUpperCase();
        const isMarket = upperCaseType === 'MARKET';
        const isPostOnly = this.isPostOnly(isMarket, upperCaseType === 'LIMIT_MAKER', params);
        if (isPostOnly) {
            upperCaseType = 'LIMIT_MAKER';
            params = this.omit(params, 'postOnly');
        }
        request['type'] = upperCaseType;
        if (isMarket) {
            if (side === 'buy') {
                request['amount'] = this.currencyToPrecision(market['quote'], amount);
            }
            else {
                request['quantity'] = this.amountToPrecision(symbol, amount);
            }
        }
        else {
            request['quantity'] = this.amountToPrecision(symbol, amount);
            request['price'] = this.priceToPrecision(symbol, price);
        }
        const clientOrderId = this.safeString(params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
            params = this.omit(params, 'clientOrderId');
        }
        // remember the timestamp before issuing the request
        return [request, params];
    }
    async editOrder(id, symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#editOrder
         * @description edit a trade order
         * @see https://docs.poloniex.com/#authenticated-endpoints-orders-cancel-replace-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of the currency you want to trade in units of the base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' editOrder() does not support ' + market['type'] + ' orders, only spot orders are accepted');
        }
        const request = {
            'id': id,
            // 'timeInForce': timeInForce,
        };
        const orderRequest = this.orderRequest(symbol, type, side, amount, request, price, params);
        let response = await this.privatePutOrdersId(this.extend(orderRequest[0], orderRequest[1]));
        //
        //     {
        //         "id" : "78923648051920896",
        //         "clientOrderId" : ""
        //     }
        //
        response = this.extend(response, {
            'type': side,
        });
        return this.parseOrder(response, market);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#cancelOrder
         * @description cancels an open order
         * @see https://docs.poloniex.com/#authenticated-endpoints-orders-cancel-order-by-id
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const request = {};
        const clientOrderId = this.safeValue(params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            id = clientOrderId;
        }
        request['id'] = id;
        params = this.omit(params, 'clientOrderId');
        return await this.privateDeleteOrdersId(this.extend(request, params));
    }
    async cancelAllOrders(symbol = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#cancelAllOrders
         * @description cancel all open orders
         * @see https://docs.poloniex.com/#authenticated-endpoints-orders-cancel-all-orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const request = {
        // 'accountTypes': 'SPOT',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbols'] = [
                market['id'],
            ];
        }
        const response = await this.privateDeleteOrders(this.extend(request, params));
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
        return response;
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#fetchOrder
         * @description fetch an order by it's id
         * @see https://docs.poloniex.com/#authenticated-endpoints-orders-order-details
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol, default is undefined
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        id = id.toString();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersId(this.extend(request, params));
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
        //         "createTime": 1646196019020,
        //         "updateTime": 1646196019020
        //     }
        //
        return this.extend(this.parseOrder(response), {
            'id': id,
        });
    }
    async fetchOrderStatus(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const orders = await this.fetchOpenOrders(symbol, undefined, undefined, params);
        const indexed = this.indexBy(orders, 'id');
        return (id in indexed) ? 'open' : 'closed';
    }
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @see https://docs.poloniex.com/#authenticated-endpoints-trades-trades-by-order-id
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
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
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name poloniex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs.poloniex.com/#authenticated-endpoints-accounts-all-account-balances
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets();
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
    async fetchTradingFees(params = {}) {
        /**
         * @method
         * @name poloniex#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @see https://docs.poloniex.com/#authenticated-endpoints-accounts-fee-info
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
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
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.poloniex.com/#public-endpoints-market-data-order-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // The default value of limit is 10. Valid limit values are: 5, 10, 20, 50, 100, 150.
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
    async createDepositAddress(code, params = {}) {
        /**
         * @method
         * @name poloniex#createDepositAddress
         * @description create a currency deposit address
         * @see https://docs.poloniex.com/#authenticated-endpoints-wallets-deposit-addresses
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        const networks = this.safeValue(this.options, 'networks', {});
        let network = this.safeStringUpper(params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString(networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['currency'] += network; // when network the currency need to be changed to currency+network https://docs.poloniex.com/#withdraw on MultiChain Currencies section
            params = this.omit(params, 'network');
        }
        else {
            if (currency['id'] === 'USDT') {
                throw new errors.ArgumentsRequired(this.id + ' createDepositAddress requires a network parameter for ' + code + '.');
            }
        }
        const response = await this.privatePostWalletsAddress(this.extend(request, params));
        //
        //     {
        //         "address" : "0xfxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxf"
        //     }
        //
        let address = this.safeString(response, 'address');
        let tag = undefined;
        this.checkAddress(address);
        if (currency !== undefined) {
            const depositAddress = this.safeString(currency['info'], 'depositAddress');
            if (depositAddress !== undefined) {
                tag = address;
                address = depositAddress;
            }
        }
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': network,
            'info': response,
        };
    }
    async fetchDepositAddress(code, params = {}) {
        /**
         * @method
         * @name poloniex#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @see https://docs.poloniex.com/#authenticated-endpoints-wallets-deposit-addresses
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        const networks = this.safeValue(this.options, 'networks', {});
        let network = this.safeStringUpper(params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString(networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['currency'] += network; // when network the currency need to be changed to currency+network https://docs.poloniex.com/#withdraw on MultiChain Currencies section
            params = this.omit(params, 'network');
        }
        else {
            if (currency['id'] === 'USDT') {
                throw new errors.ArgumentsRequired(this.id + ' fetchDepositAddress requires a network parameter for ' + code + '.');
            }
        }
        const response = await this.privateGetWalletsAddresses(this.extend(request, params));
        //
        //     {
        //         "USDTTRON" : "Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxp"
        //     }
        //
        let address = this.safeString(response, request['currency']);
        let tag = undefined;
        this.checkAddress(address);
        if (currency !== undefined) {
            const depositAddress = this.safeString(currency['info'], 'depositAddress');
            if (depositAddress !== undefined) {
                tag = address;
                address = depositAddress;
            }
        }
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': network,
            'info': response,
        };
    }
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name poloniex#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://docs.poloniex.com/#authenticated-endpoints-accounts-accounts-transfer
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        amount = this.currencyToPrecision(code, amount);
        const accountsByType = this.safeValue(this.options, 'accountsByType', {});
        const fromId = this.safeString(accountsByType, fromAccount, fromAccount);
        const toId = this.safeString(accountsByType, toAccount, fromAccount);
        const request = {
            'amount': amount,
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
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#withdraw
         * @description make a withdrawal
         * @see https://docs.poloniex.com/#authenticated-endpoints-wallets-withdraw-currency
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        this.checkAddress(address);
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        };
        if (tag !== undefined) {
            request['paymentId'] = tag;
        }
        const networks = this.safeValue(this.options, 'networks', {});
        let network = this.safeStringUpper(params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString(networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['currency'] += network; // when network the currency need to be changed to currency+network https://docs.poloniex.com/#withdraw on MultiChain Currencies section
            params = this.omit(params, 'network');
        }
        const response = await this.privatePostWalletsWithdraw(this.extend(request, params));
        //
        //     {
        //         response: 'Withdrew 1.00000000 USDT.',
        //         email2FA: false,
        //         withdrawalNumber: 13449869
        //     }
        //
        return this.parseTransaction(response, currency);
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
        //                 "ipAddress":"x.x.x.x",
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
        //                 ipAddress: "x.x.x.x"
        //             },
        //             {
        //                 withdrawalNumber: 9290444,
        //                 currency: "ETH",
        //                 address: "0x191015ff2e75261d50433fbd05bd57e942336149",
        //                 amount: "0.15500000",
        //                 fee: "0.00500000",
        //                 timestamp: 1514099289,
        //                 status: "COMPLETE: 0x12d444493b4bca668992021fd9e54b5292b8e71d9927af1f076f554e4bea5b2d",
        //                 ipAddress: "x.x.x.x"
        //             },
        //             {
        //                 withdrawalNumber: 11518260,
        //                 currency: "BTC",
        //                 address: "8JoDXAmE1GY2LRK8jD1gmAmgRPq54kXJ4t",
        //                 amount: "0.20000000",
        //                 fee: "0.00050000",
        //                 timestamp: 1527918155,
        //                 status: "COMPLETE: 1864f4ebb277d90b0b1ff53259b36b97fa1990edc7ad2be47c5e0ab41916b5ff",
        //                 ipAddress: "x.x.x.x"
        //             }
        //         ]
        //     }
        //
        return response;
    }
    async fetchTransactions(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#fetchTransactions
         * @description fetch history of deposits and withdrawals
         * @see https://docs.poloniex.com/#authenticated-endpoints-wallets-wallets-activity-records
         * @param {string|undefined} code unified currency code for the currency of the transactions, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest transaction, default is undefined
         * @param {int|undefined} limit max number of transactions to return, default is undefined
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
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
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://docs.poloniex.com/#authenticated-endpoints-wallets-wallets-activity-records
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        const response = await this.fetchTransactionsHelper(code, since, limit, params);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const withdrawals = this.safeValue(response, 'withdrawals', []);
        const transactions = this.parseTransactions(withdrawals, currency, since, limit);
        return this.filterByCurrencySinceLimit(transactions, code, since, limit);
    }
    async fetchDepositWithdrawFees(codes = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#fetchDepositWithdrawFees
         * @description fetch deposit and withdraw fees
         * @see https://docs.poloniex.com/#public-endpoints-reference-data-currency-information
         * @param {[string]|undefined} codes list of unified currency codes
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {[object]} a list of [fees structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
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
                depositWithdrawFees[code] = this.parseDepositWithdrawFee(feeInfo, code);
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
        depositWithdrawFee['info'][currency] = fee;
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
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://docs.poloniex.com/#authenticated-endpoints-wallets-wallets-activity-records
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
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
            amountString = Precise["default"].stringSub(amountString, feeCostString);
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
            'fee': {
                'currency': code,
                'cost': this.parseNumber(feeCostString),
                'rate': undefined,
            },
        };
    }
    nonce() {
        return this.milliseconds();
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['rest'];
        const query = this.omit(params, this.extractParams(path));
        const implodedPath = this.implodeParams(path, params);
        if (api === 'public') {
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
            const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256, 'base64');
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
        if ('code' in response) {
            const codeInner = response['code'];
            const message = this.safeString(response, 'message');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException(this.exceptions['exact'], codeInner, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            throw new errors.ExchangeError(feedback); // unknown message
        }
        return undefined;
    }
}

module.exports = poloniex;
