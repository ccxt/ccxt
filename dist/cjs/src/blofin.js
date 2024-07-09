'use strict';

var blofin$1 = require('./abstract/blofin.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class blofin
 * @augments Exchange
 */
class blofin extends blofin$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'blofin',
            'name': 'BloFin',
            'countries': ['US'],
            'version': 'v1',
            'rateLimit': 100,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': true,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopLossOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': true,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBidsAsks': undefined,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLedger': true,
                'fetchLedgerEntry': undefined,
                'fetchLeverage': true,
                'fetchLeverages': true,
                'fetchLeverageTiers': false,
                'fetchMarginMode': true,
                'fetchMarginModes': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchPermissions': undefined,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchPositionsForSymbol': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchUnderlyingAssets': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'setLeverage': true,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': true,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1H',
                '2h': '2H',
                '4h': '4H',
                '6h': '6H',
                '12h': '12H',
                '1d': '1D',
                '1w': '1W',
                '1M': '1M',
                '3M': '3M',
            },
            'hostname': 'www.blofin.com',
            'urls': {
                'logo': 'https://github.com/ccxt/ccxt/assets/43336371/255a7b29-341f-4d20-8342-fbfae4932807',
                'api': {
                    'rest': 'https://openapi.blofin.com',
                },
                'referral': {
                    'url': 'https://blofin.com/register?referral_code=jBd8U1',
                    'discount': 0.05,
                },
                'www': 'https://www.blofin.com',
                'doc': 'https://blofin.com/docs',
            },
            'api': {
                'public': {
                    'get': {
                        'market/instruments': 1,
                        'market/tickers': 1,
                        'market/books': 1,
                        'market/trades': 1,
                        'market/candles': 1,
                        'market/mark-price': 1,
                        'market/funding-rate': 1,
                        'market/funding-rate-history': 1,
                    },
                },
                'private': {
                    'get': {
                        'asset/balances': 1,
                        'trade/orders-pending': 1,
                        'trade/fills-history': 1,
                        'asset/deposit-history': 1,
                        'asset/withdrawal-history': 1,
                        'asset/bills': 1,
                        'account/balance': 1,
                        'account/positions': 1,
                        'account/leverage-info': 1,
                        'account/margin-mode': 1,
                        'account/batch-leverage-info': 1,
                        'trade/orders-tpsl-pending': 1,
                        'trade/orders-history': 1,
                        'trade/orders-tpsl-history': 1,
                        'user/query-apikey': 1,
                        'affiliate/basic': 1,
                    },
                    'post': {
                        'trade/order': 1,
                        'trade/cancel-order': 1,
                        'account/set-leverage': 1,
                        'trade/batch-orders': 1,
                        'trade/order-tpsl': 1,
                        'trade/cancel-batch-orders': 1,
                        'trade/cancel-tpsl': 1,
                        'trade/close-position': 1,
                        'asset/transfer': 1,
                    },
                },
            },
            'fees': {
                'swap': {
                    'taker': this.parseNumber('0.00060'),
                    'maker': this.parseNumber('0.00020'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'exceptions': {
                'exact': {
                    '400': errors.BadRequest,
                    '401': errors.AuthenticationError,
                    '500': errors.ExchangeError,
                    '404': errors.BadRequest,
                    '405': errors.BadRequest,
                    '406': errors.BadRequest,
                    '429': errors.RateLimitExceeded,
                    '152001': errors.BadRequest,
                    '152002': errors.BadRequest,
                    '152003': errors.BadRequest,
                    '152004': errors.BadRequest,
                    '152005': errors.BadRequest,
                    '152006': errors.InvalidOrder,
                    '152007': errors.InvalidOrder,
                    '152008': errors.InvalidOrder,
                    '152009': errors.InvalidOrder,
                    '150003': errors.InvalidOrder,
                    '150004': errors.InvalidOrder,
                    '542': errors.InvalidOrder,
                    '102002': errors.InvalidOrder,
                    '102005': errors.InvalidOrder,
                    '102014': errors.InvalidOrder,
                    '102015': errors.InvalidOrder,
                    '102022': errors.InvalidOrder,
                    '102037': errors.InvalidOrder,
                    '102038': errors.InvalidOrder,
                    '102039': errors.InvalidOrder,
                    '102040': errors.InvalidOrder,
                    '102047': errors.InvalidOrder,
                    '102048': errors.InvalidOrder,
                    '102049': errors.InvalidOrder,
                    '102050': errors.InvalidOrder,
                    '102051': errors.InvalidOrder,
                    '102052': errors.InvalidOrder,
                    '102053': errors.InvalidOrder,
                    '102054': errors.InvalidOrder,
                    '102055': errors.InvalidOrder,
                    '102064': errors.BadRequest,
                    '102065': errors.BadRequest,
                    '102068': errors.BadRequest,
                    '103013': errors.ExchangeError,
                    'Order failed. Insufficient USDT margin in account': errors.InsufficientFunds, // Insufficient USDT margin in account
                },
                'broad': {
                    'Internal Server Error': errors.ExchangeNotAvailable,
                    'server error': errors.ExchangeNotAvailable, // {"code":500,"data":{},"detailMsg":"","error_code":"500","error_message":"server error 1236805249","msg":"server error 1236805249"}
                },
            },
            'httpExceptions': {
                '429': errors.ExchangeNotAvailable, // https://github.com/ccxt/ccxt/issues/9612
            },
            'precisionMode': number.TICK_SIZE,
            'options': {
                'brokerId': 'ec6dd3a7dd982d0b',
                'accountsByType': {
                    'swap': 'futures',
                    'future': 'futures',
                },
                'accountsById': {
                    'futures': 'swap',
                },
                'sandboxMode': false,
                'defaultNetwork': 'ERC20',
                'defaultNetworks': {
                    'ETH': 'ERC20',
                    'BTC': 'BTC',
                    'USDT': 'TRC20',
                },
                'networks': {
                    'BTC': 'Bitcoin',
                    'BEP20': 'BSC',
                    'ERC20': 'ERC20',
                    'TRC20': 'TRC20',
                },
                'fetchOpenInterestHistory': {
                    'timeframes': {
                        '5m': '5m',
                        '1h': '1H',
                        '8h': '8H',
                        '1d': '1D',
                        '5M': '5m',
                        '1H': '1H',
                        '8H': '8H',
                        '1D': '1D',
                    },
                },
                'fetchOHLCV': {
                    // 'type': 'Candles', // Candles or HistoryCandles, IndexCandles, MarkPriceCandles
                    'timezone': 'UTC', // UTC, HK
                },
                'fetchPositions': {
                    'method': 'privateGetAccountPositions', // privateGetAccountPositions or privateGetAccountPositionsHistory
                },
                'createOrder': 'privatePostTradeOrder',
                'createMarketBuyOrderRequiresPrice': false,
                'fetchMarkets': ['swap'],
                'defaultType': 'swap',
                'fetchLedger': {
                    'method': 'privateGetAssetBills',
                },
                'fetchOpenOrders': {
                    'method': 'privateGetTradeOrdersPending',
                },
                'cancelOrders': {
                    'method': 'privatePostTradeCancelBatchOrders',
                },
                'fetchCanceledOrders': {
                    'method': 'privateGetTradeOrdersHistory', // privateGetTradeOrdersTpslHistory
                },
                'fetchClosedOrders': {
                    'method': 'privateGetTradeOrdersHistory', // privateGetTradeOrdersTpslHistory
                },
                'withdraw': {
                    // a funding password credential is required by the exchange for the
                    // withdraw call (not to be confused with the api password credential)
                    'password': undefined,
                    'pwd': undefined, // password or pwd both work
                },
                'exchangeType': {
                    'spot': 'SPOT',
                    'swap': 'SWAP',
                    'SPOT': 'SPOT',
                    'SWAP': 'SWAP',
                },
            },
        });
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name blofin#fetchMarkets
         * @description retrieves data on all markets for blofin
         * @see https://blofin.com/docs#get-instruments
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetMarketInstruments(params);
        const data = this.safeList(response, 'data', []);
        return this.parseMarkets(data);
    }
    parseMarket(market) {
        const id = this.safeString(market, 'instId');
        const type = this.safeStringLower(market, 'instType');
        const spot = (type === 'spot');
        const future = (type === 'future');
        const swap = (type === 'swap');
        const option = (type === 'option');
        const contract = swap || future;
        const baseId = this.safeString(market, 'baseCurrency');
        const quoteId = this.safeString(market, 'quoteCurrency');
        const settleId = this.safeString(market, 'quoteCurrency');
        const settle = this.safeCurrencyCode(settleId);
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        let symbol = base + '/' + quote;
        if (swap) {
            symbol = symbol + ':' + settle;
        }
        const expiry = undefined;
        const strikePrice = undefined;
        const optionType = undefined;
        const tickSize = this.safeString(market, 'tickSize');
        const fees = this.safeDict2(this.fees, type, 'trading', {});
        const taker = this.safeNumber(fees, 'taker');
        const maker = this.safeNumber(fees, 'maker');
        let maxLeverage = this.safeString(market, 'maxLeverage', '100');
        maxLeverage = Precise["default"].stringMax(maxLeverage, '1');
        const isActive = (this.safeString(market, 'state') === 'live');
        return this.safeMarketStructure({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'settle': settle,
            'settleId': settleId,
            'type': type,
            'spot': spot,
            'option': option,
            'margin': spot && (Precise["default"].stringGt(maxLeverage, '1')),
            'swap': swap,
            'future': future,
            'active': isActive,
            'taker': taker,
            'maker': maker,
            'contract': contract,
            'linear': contract ? (quoteId === settleId) : undefined,
            'inverse': contract ? (baseId === settleId) : undefined,
            'contractSize': contract ? this.safeNumber(market, 'contractValue') : undefined,
            'expiry': expiry,
            'expiryDatetime': expiry,
            'strike': strikePrice,
            'optionType': optionType,
            'created': this.safeInteger(market, 'listTime'),
            'precision': {
                'amount': this.safeNumber(market, 'lotSize'),
                'price': this.parseNumber(tickSize),
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber('1'),
                    'max': this.parseNumber(maxLeverage),
                },
                'amount': {
                    'min': this.safeNumber(market, 'minSize'),
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
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name blofin#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://blofin.com/docs#get-order-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instId': market['id'],
        };
        limit = (limit === undefined) ? 50 : limit;
        if (limit !== undefined) {
            request['size'] = limit; // max 100
        }
        const response = await this.publicGetMarketBooks(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "asks": [
        //                     ["0.07228","4.211619","0","2"], // price, amount, liquidated orders, total open orders
        //                     ["0.0723","299.880364","0","2"],
        //                     ["0.07231","3.72832","0","1"],
        //                 ],
        //                 "bids": [
        //                     ["0.07221","18.5","0","1"],
        //                     ["0.0722","18.5","0","1"],
        //                     ["0.07219","0.505407","0","1"],
        //                 ],
        //                 "ts": "1621438475342"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const first = this.safeDict(data, 0, {});
        const timestamp = this.safeInteger(first, 'ts');
        return this.parseOrderBook(first, symbol, timestamp);
    }
    parseTicker(ticker, market = undefined) {
        const timestamp = this.safeInteger(ticker, 'ts');
        const marketId = this.safeString(ticker, 'instId');
        market = this.safeMarket(marketId, market, '-');
        const symbol = market['symbol'];
        const last = this.safeString(ticker, 'last');
        const open = this.safeString(ticker, 'open24h');
        const spot = this.safeBool(market, 'spot', false);
        const quoteVolume = spot ? this.safeString(ticker, 'volCurrency24h') : undefined;
        const baseVolume = this.safeString(ticker, 'vol24h');
        const high = this.safeString(ticker, 'high24h');
        const low = this.safeString(ticker, 'low24h');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': high,
            'low': low,
            'bid': this.safeString(ticker, 'bidPrice'),
            'bidVolume': this.safeString(ticker, 'bidSize'),
            'ask': this.safeString(ticker, 'askPrice'),
            'askVolume': this.safeString(ticker, 'askSize'),
            'vwap': undefined,
            'open': open,
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
         * @name blofin#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://blofin.com/docs#get-tickers
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instId': market['id'],
        };
        const response = await this.publicGetMarketTickers(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        const first = this.safeDict(data, 0, {});
        return this.parseTicker(first, market);
    }
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name blofin#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://blofin.com/docs#get-tickers
         * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.publicGetMarketTickers(params);
        const tickers = this.safeList(response, 'data', []);
        return this.parseTickers(tickers, symbols);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetch trades
        //   {
        //       "tradeId": "3263934920",
        //       "instId": "LTC-USDT",
        //       "price": "67.87",
        //       "size": "1",
        //       "side": "buy",
        //       "ts": "1707232020854"
        //   }
        // my trades
        //   {
        //       "instId": "LTC-USDT",
        //       "tradeId": "1440847",
        //       "orderId": "2075705202",
        //       "fillPrice": "67.850000000000000000",
        //       "fillSize": "1.000000000000000000",
        //       "fillPnl": "0.000000000000000000",
        //       "side": "buy",
        //       "positionSide": "net",
        //       "fee": "0.040710000000000000",
        //       "ts": "1707224678878",
        //       "brokerId": ""
        //   }
        //
        const id = this.safeString(trade, 'tradeId');
        const marketId = this.safeString(trade, 'instId');
        market = this.safeMarket(marketId, market, '-');
        const symbol = market['symbol'];
        const timestamp = this.safeInteger(trade, 'ts');
        const price = this.safeString2(trade, 'price', 'fillPrice');
        const amount = this.safeString2(trade, 'size', 'fillSize');
        const side = this.safeString(trade, 'side');
        const orderId = this.safeString(trade, 'orderId');
        const feeCost = this.safeString(trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': market['settle'],
            };
        }
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        }, market);
    }
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name blofin#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://blofin.com/docs#get-trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] *only applies to publicGetMarketHistoryTrades* default false, when true will automatically paginate by calling this endpoint multiple times
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchTrades', symbol, since, limit, params, 'tradeId', 'after', undefined, 100);
        }
        const market = this.market(symbol);
        const request = {
            'instId': market['id'],
        };
        let response = undefined;
        if (limit !== undefined) {
            request['limit'] = limit; // default 100
        }
        let method = undefined;
        [method, params] = this.handleOptionAndParams(params, 'fetchTrades', 'method', 'publicGetMarketTrades');
        if (method === 'publicGetMarketTrades') {
            response = await this.publicGetMarketTrades(this.extend(request, params));
        }
        const data = this.safeList(response, 'data', []);
        return this.parseTrades(data, market, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     [
        //         "1678928760000", // timestamp
        //         "24341.4", // open
        //         "24344", // high
        //         "24313.2", // low
        //         "24323", // close
        //         "628", // contract volume
        //         "2.5819", // base volume
        //         "62800", // quote volume
        //         "0" // candlestick state
        //     ]
        //
        return [
            this.safeInteger(ohlcv, 0),
            this.safeNumber(ohlcv, 1),
            this.safeNumber(ohlcv, 2),
            this.safeNumber(ohlcv, 3),
            this.safeNumber(ohlcv, 4),
            this.safeNumber(ohlcv, 6),
        ];
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name blofin#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://blofin.com/docs#get-candlesticks
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest candle to fetch
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchOHLCV', symbol, since, limit, timeframe, params, 100);
        }
        if (limit === undefined) {
            limit = 100; // default 100, max 100
        }
        const request = {
            'instId': market['id'],
            'bar': this.safeString(this.timeframes, timeframe, timeframe),
            'limit': limit,
        };
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            request['after'] = until;
            params = this.omit(params, 'until');
        }
        let response = undefined;
        response = await this.publicGetMarketCandles(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        return this.parseOHLCVs(data, market, timeframe, since, limit);
    }
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name blofin#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @see https://blofin.com/docs#get-funding-rate-history
         * @param {string} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
         * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchFundingRateHistory', symbol, since, limit, '8h', params);
        }
        const market = this.market(symbol);
        const request = {
            'instId': market['id'],
        };
        if (since !== undefined) {
            request['before'] = Math.max(since - 1, 0);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketFundingRateHistory(this.extend(request, params));
        const rates = [];
        const data = this.safeList(response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const rate = data[i];
            const timestamp = this.safeInteger(rate, 'fundingTime');
            rates.push({
                'info': rate,
                'symbol': market['symbol'],
                'fundingRate': this.safeNumber(rate, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            });
        }
        const sorted = this.sortBy(rates, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, market['symbol'], since, limit);
    }
    parseFundingRate(contract, market = undefined) {
        //
        //    {
        //        "fundingRate": "0.00027815",
        //        "fundingTime": "1634256000000",
        //        "instId": "BTC-USD-SWAP",
        //        "instType": "SWAP",
        //        "nextFundingRate": "0.00017",
        //        "nextFundingTime": "1634284800000"
        //    }
        //
        // in the response above nextFundingRate is actually two funding rates from now
        //
        const nextFundingRateTimestamp = this.safeInteger(contract, 'nextFundingTime');
        const marketId = this.safeString(contract, 'instId');
        const symbol = this.safeSymbol(marketId, market);
        const nextFundingRate = this.safeNumber(contract, 'nextFundingRate');
        const fundingTime = this.safeInteger(contract, 'fundingTime');
        // > The current interest is 0.
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': this.parseNumber('0'),
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber(contract, 'fundingRate'),
            'fundingTimestamp': fundingTime,
            'fundingDatetime': this.iso8601(fundingTime),
            'nextFundingRate': nextFundingRate,
            'nextFundingTimestamp': nextFundingRateTimestamp,
            'nextFundingDatetime': this.iso8601(nextFundingRateTimestamp),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }
    async fetchFundingRate(symbol, params = {}) {
        /**
         * @method
         * @name blofin#fetchFundingRate
         * @description fetch the current funding rate
         * @see https://blofin.com/docs#get-funding-rate
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['swap']) {
            throw new errors.ExchangeError(this.id + ' fetchFundingRate() is only valid for swap markets');
        }
        const request = {
            'instId': market['id'],
        };
        const response = await this.publicGetMarketFundingRate(this.extend(request, params));
        //
        //    {
        //        "code": "0",
        //        "data": [
        //            {
        //                "fundingRate": "0.00027815",
        //                "fundingTime": "1634256000000",
        //                "instId": "BTC-USD-SWAP",
        //                "instType": "SWAP",
        //                "nextFundingRate": "0.00017",
        //                "nextFundingTime": "1634284800000"
        //            }
        //        ],
        //        "msg": ""
        //    }
        //
        const data = this.safeList(response, 'data', []);
        const entry = this.safeDict(data, 0, {});
        return this.parseFundingRate(entry, market);
    }
    parseBalanceByType(type, response) {
        if (type) {
            return this.parseFundingBalance(response);
        }
        else {
            return this.parseTradingBalance(response);
        }
    }
    parseTradingBalance(response) {
        //
        // {
        //     "code": "0",
        //     "msg": "success",
        //     "data": {
        //         "ts": "1697021343571",
        //         "totalEquity": "10011254.077985990315787910",
        //         "isolatedEquity": "861.763132108800000000",
        //         "details": [
        //             {
        //                 "currency": "USDT",
        //                 "equity": "10014042.988958415234430699548",
        //                 "balance": "10013119.885958415234430699",
        //                 "ts": "1697021343571",
        //                 "isolatedEquity": "862.003200000000000000048",
        //                 "available": "9996399.4708691159703362725",
        //                 "availableEquity": "9996399.4708691159703362725",
        //                 "frozen": "15805.149672632597427761",
        //                 "orderFrozen": "14920.994472632597427761",
        //                 "equityUsd": "10011254.077985990315787910",
        //                 "isolatedUnrealizedPnl": "-22.151999999999999999952",
        //                 "bonus": "0"
        //             }
        //         ]
        //     }
        // }
        //
        const result = { 'info': response };
        const data = this.safeDict(response, 'data', {});
        const timestamp = this.safeInteger(data, 'ts');
        const details = this.safeList(data, 'details', []);
        for (let i = 0; i < details.length; i++) {
            const balance = details[i];
            const currencyId = this.safeString(balance, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            // it may be incorrect to use total, free and used for swap accounts
            const eq = this.safeString(balance, 'equity');
            const availEq = this.safeString(balance, 'available');
            if ((eq === undefined) || (availEq === undefined)) {
                account['free'] = this.safeString(balance, 'availableEquity');
                account['used'] = this.safeString(balance, 'frozen');
            }
            else {
                account['total'] = eq;
                account['free'] = availEq;
            }
            result[code] = account;
        }
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601(timestamp);
        return this.safeBalance(result);
    }
    parseFundingBalance(response) {
        //
        //  {
        //      "code": "0",
        //      "msg": "success",
        //      "data": [
        //          {
        //              "currency": "USDT",
        //              "balance": "10012514.919418081548717298",
        //              "available": "9872132.414278782284622898",
        //              "frozen": "138556.471805965930761067",
        //              "bonus": "0"
        //          }
        //      ]
        //  }
        //
        const result = { 'info': response };
        const data = this.safeList(response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString(balance, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            // it may be incorrect to use total, free and used for swap accounts
            account['total'] = this.safeString(balance, 'balance');
            account['free'] = this.safeString(balance, 'available');
            account['used'] = this.safeString(balance, 'frozen');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    parseTradingFee(fee, market = undefined) {
        return {
            'info': fee,
            'symbol': this.safeSymbol(undefined, market),
            // blofin returns the fees as negative values opposed to other exchanges, so the sign needs to be flipped
            'maker': this.parseNumber(Precise["default"].stringNeg(this.safeString2(fee, 'maker', 'makerU'))),
            'taker': this.parseNumber(Precise["default"].stringNeg(this.safeString2(fee, 'taker', 'takerU'))),
            'percentage': undefined,
            'tierBased': undefined,
        };
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name blofin#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://blofin.com/docs#get-balance
         * @see https://blofin.com/docs#get-futures-account-balance
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.accountType] the type of account to fetch the balance for, either 'funding' or 'futures'  or 'copy_trading' or 'earn'
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets();
        const accountType = this.safeString2(params, 'accountType', 'type');
        params = this.omit(params, ['accountType', 'type']);
        const request = {};
        let response = undefined;
        if (accountType !== undefined) {
            const options = this.safeDict(this.options, 'accountsByType', {});
            const parsedAccountType = this.safeString(options, accountType, accountType);
            request['accountType'] = parsedAccountType;
            response = await this.privateGetAssetBalances(this.extend(request, params));
        }
        else {
            response = await this.privateGetAccountBalance(this.extend(request, params));
        }
        return this.parseBalanceByType(accountType, response);
    }
    createOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        const market = this.market(symbol);
        const request = {
            'instId': market['id'],
            'side': side,
            'orderType': type,
            'size': this.amountToPrecision(symbol, amount),
            'brokerId': this.safeString(this.options, 'brokerId', 'ec6dd3a7dd982d0b'),
        };
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('createOrder', params, 'cross');
        request['marginMode'] = marginMode;
        const timeInForce = this.safeString(params, 'timeInForce', 'GTC');
        const isMarketOrder = type === 'market';
        params = this.omit(params, ['timeInForce']);
        const ioc = (timeInForce === 'IOC') || (type === 'ioc');
        const marketIOC = (isMarketOrder && ioc);
        if (isMarketOrder || marketIOC) {
            request['orderType'] = 'market';
        }
        else {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        let postOnly = false;
        [postOnly, params] = this.handlePostOnly(isMarketOrder, type === 'post_only', params);
        if (postOnly) {
            request['type'] = 'post_only';
        }
        const stopLoss = this.safeDict(params, 'stopLoss');
        const takeProfit = this.safeDict(params, 'takeProfit');
        params = this.omit(params, ['stopLoss', 'takeProfit']);
        const isStopLoss = stopLoss !== undefined;
        const isTakeProfit = takeProfit !== undefined;
        if (isStopLoss || isTakeProfit) {
            if (isStopLoss) {
                const slTriggerPrice = this.safeString2(stopLoss, 'triggerPrice', 'stopPrice');
                request['slTriggerPrice'] = this.priceToPrecision(symbol, slTriggerPrice);
                const slOrderPrice = this.safeString(stopLoss, 'price', '-1');
                request['slOrderPrice'] = this.priceToPrecision(symbol, slOrderPrice);
            }
            if (isTakeProfit) {
                const tpTriggerPrice = this.safeString2(takeProfit, 'triggerPrice', 'stopPrice');
                request['tpTriggerPrice'] = this.priceToPrecision(symbol, tpTriggerPrice);
                const tpPrice = this.safeString(takeProfit, 'price', '-1');
                request['tpOrderPrice'] = this.priceToPrecision(symbol, tpPrice);
            }
        }
        return this.extend(request, params);
    }
    parseOrderStatus(status) {
        const statuses = {
            'canceled': 'canceled',
            'order_failed': 'canceled',
            'live': 'open',
            'partially_filled': 'open',
            'filled': 'closed',
            'effective': 'closed',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        // {
        //     "orderId": "2075628533",
        //     "clientOrderId": "",
        //     "instId": "LTC-USDT",
        //     "marginMode": "cross",
        //     "positionSide": "net",
        //     "side": "buy",
        //     "orderType": "market",
        //     "price": "0.000000000000000000",
        //     "size": "1.000000000000000000",
        //     "reduceOnly": "true",
        //     "leverage": "3",
        //     "state": "filled",
        //     "filledSize": "1.000000000000000000",
        //     "pnl": "-0.050000000000000000",
        //     "averagePrice": "68.110000000000000000",
        //     "fee": "0.040866000000000000",
        //     "createTime": "1706891359010",
        //     "updateTime": "1706891359098",
        //     "orderCategory": "normal",
        //     "tpTriggerPrice": null,
        //     "tpOrderPrice": null,
        //     "slTriggerPrice": null,
        //     "slOrderPrice": null,
        //     "cancelSource": "not_canceled",
        //     "cancelSourceReason": null,
        //     "brokerId": "ec6dd3a7dd982d0b"
        // }
        //
        const id = this.safeString2(order, 'tpslId', 'orderId');
        const timestamp = this.safeInteger(order, 'createTime');
        const lastUpdateTimestamp = this.safeInteger(order, 'updateTime');
        const lastTradeTimestamp = this.safeInteger(order, 'fillTime');
        const side = this.safeString(order, 'side');
        let type = this.safeString(order, 'orderType');
        let postOnly = undefined;
        let timeInForce = undefined;
        if (type === 'post_only') {
            postOnly = true;
            type = 'limit';
        }
        else if (type === 'fok') {
            timeInForce = 'FOK';
            type = 'limit';
        }
        else if (type === 'ioc') {
            timeInForce = 'IOC';
            type = 'limit';
        }
        const marketId = this.safeString(order, 'instId');
        market = this.safeMarket(marketId, market);
        const symbol = this.safeSymbol(marketId, market, '-');
        const filled = this.safeString(order, 'filledSize');
        const price = this.safeString2(order, 'px', 'price');
        const average = this.safeString(order, 'averagePrice');
        const status = this.parseOrderStatus(this.safeString(order, 'state'));
        const feeCostString = this.safeString(order, 'fee');
        const amount = this.safeString(order, 'size');
        const leverage = this.safeString(order, 'leverage', '1');
        const contractSize = this.safeString(market, 'contractSize');
        const baseAmount = Precise["default"].stringMul(contractSize, filled);
        let cost = undefined;
        if (average !== undefined) {
            cost = Precise["default"].stringMul(average, baseAmount);
            cost = Precise["default"].stringDiv(cost, leverage);
        }
        // spot market buy: "sz" can refer either to base currency units or to quote currency units
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCostSigned = Precise["default"].stringAbs(feeCostString);
            const feeCurrencyId = this.safeString(order, 'feeCcy', 'USDT');
            const feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId);
            fee = {
                'cost': this.parseNumber(feeCostSigned),
                'currency': feeCurrencyCode,
            };
        }
        let clientOrderId = this.safeString(order, 'clientOrderId');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined; // fix empty clientOrderId string
        }
        const stopLossTriggerPrice = this.safeNumber(order, 'slTriggerPrice');
        const stopLossPrice = this.safeNumber(order, 'slOrderPrice');
        const takeProfitTriggerPrice = this.safeNumber(order, 'tpTriggerPrice');
        const takeProfitPrice = this.safeNumber(order, 'tpOrderPrice');
        const reduceOnlyRaw = this.safeString(order, 'reduceOnly');
        const reduceOnly = (reduceOnlyRaw === 'true');
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopLossTriggerPrice': stopLossTriggerPrice,
            'takeProfitTriggerPrice': takeProfitTriggerPrice,
            'stopLossPrice': stopLossPrice,
            'takeProfitPrice': takeProfitPrice,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
            'reduceOnly': reduceOnly,
        }, market);
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name blofin#createOrder
         * @description create a trade order
         * @see https://blofin.com/docs#place-order
         * @see https://blofin.com/docs#place-tpsl-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit' or 'post_only' or 'ioc' or 'fok'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.reduceOnly] a mark to reduce the position size for margin, swap and future orders
         * @param {bool} [params.postOnly] true to place a post only order
         * @param {string} [params.marginMode] 'cross' or 'isolated', default is 'cross'
         * @param {float} [params.stopLossPrice] stop loss trigger price (will use privatePostTradeOrderTpsl)
         * @param {float} [params.takeProfitPrice] take profit trigger price (will use privatePostTradeOrderTpsl)
         * @param {string} [param.positionSide] *stopLossPrice/takeProfitPrice orders only* 'long' or 'short' or 'net' default is 'net'
         * @param {string} [params.clientOrderId] a unique id for the order
         * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
         * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
         * @param {float} [params.takeProfit.price] take profit order price (if not provided the order will be a market order)
         * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
         * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
         * @param {float} [params.stopLoss.price] stop loss order price (if not provided the order will be a market order)
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const tpsl = this.safeBool(params, 'tpsl', false);
        params = this.omit(params, 'tpsl');
        let method = undefined;
        [method, params] = this.handleOptionAndParams(params, 'createOrder', 'method', 'privatePostTradeOrder');
        const isStopLossPriceDefined = this.safeString(params, 'stopLossPrice') !== undefined;
        const isTakeProfitPriceDefined = this.safeString(params, 'takeProfitPrice') !== undefined;
        const isType2Order = (isStopLossPriceDefined || isTakeProfitPriceDefined);
        let response = undefined;
        if (tpsl || (method === 'privatePostTradeOrderTpsl') || isType2Order) {
            const tpslRequest = this.createTpslOrderRequest(symbol, type, side, amount, price, params);
            response = await this.privatePostTradeOrderTpsl(tpslRequest);
        }
        else {
            const request = this.createOrderRequest(symbol, type, side, amount, price, params);
            response = await this.privatePostTradeOrder(request);
        }
        const data = this.safeList(response, 'data', []);
        const first = this.safeDict(data, 0);
        const order = this.parseOrder(first, market);
        order['type'] = type;
        order['side'] = side;
        return order;
    }
    createTpslOrderRequest(symbol, type, side, amount = undefined, price = undefined, params = {}) {
        const market = this.market(symbol);
        const positionSide = this.safeString(params, 'positionSide', 'net');
        const request = {
            'instId': market['id'],
            'side': side,
            'positionSide': positionSide,
            'brokerId': this.safeString(this.options, 'brokerId', 'ec6dd3a7dd982d0b'),
        };
        if (amount !== undefined) {
            request['size'] = this.amountToPrecision(symbol, amount);
        }
        const marginMode = this.safeString(params, 'marginMode', 'cross'); // cross or isolated
        if (marginMode !== 'cross' && marginMode !== 'isolated') {
            throw new errors.BadRequest(this.id + ' createTpslOrder() requires a marginMode parameter that must be either cross or isolated');
        }
        const stopLossPrice = this.safeString(params, 'stopLossPrice');
        const takeProfitPrice = this.safeString(params, 'takeProfitPrice');
        if (stopLossPrice !== undefined) {
            request['slTriggerPrice'] = this.priceToPrecision(symbol, stopLossPrice);
            if (type === 'market') {
                request['slOrderPrice'] = '-1';
            }
            else {
                request['slOrderPrice'] = this.priceToPrecision(symbol, price);
            }
        }
        else if (takeProfitPrice !== undefined) {
            request['tpTriggerPrice'] = this.priceToPrecision(symbol, takeProfitPrice);
            if (type === 'market') {
                request['tpOrderPrice'] = '-1';
            }
            else {
                request['tpOrderPrice'] = this.priceToPrecision(symbol, price);
            }
        }
        request['marginMode'] = marginMode;
        params = this.omit(params, ['stopLossPrice', 'takeProfitPrice']);
        return this.extend(request, params);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name blofin#cancelOrder
         * @description cancels an open order
         * @see https://blofin.com/docs#cancel-order
         * @see https://blofin.com/docs#cancel-tpsl-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.trigger] True if cancelling a trigger/conditional order/tp sl orders
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instId': market['id'],
        };
        const isTrigger = this.safeBoolN(params, ['stop', 'trigger', 'tpsl'], false);
        const clientOrderId = this.safeString(params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
        }
        else {
            if (!isTrigger) {
                request['orderId'] = id.toString();
            }
            else {
                request['tpslId'] = id.toString();
            }
        }
        const query = this.omit(params, ['orderId', 'clientOrderId', 'stop', 'trigger', 'tpsl']);
        if (isTrigger) {
            const tpslResponse = await this.cancelOrders([id], symbol, params);
            const first = this.safeDict(tpslResponse, 0);
            return first;
        }
        const response = await this.privatePostTradeCancelOrder(this.extend(request, query));
        const data = this.safeList(response, 'data', []);
        const order = this.safeDict(data, 0);
        return this.parseOrder(order, market);
    }
    async createOrders(orders, params = {}) {
        /**
         * @method
         * @name blofin#createOrders
         * @description create a list of trade orders
         * @see https://blofin.com/docs#place-multiple-orders
         * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const ordersRequests = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString(rawOrder, 'symbol');
            const type = this.safeString(rawOrder, 'type');
            const side = this.safeString(rawOrder, 'side');
            const amount = this.safeValue(rawOrder, 'amount');
            const price = this.safeValue(rawOrder, 'price');
            const orderParams = this.safeDict(rawOrder, 'params', {});
            const extendedParams = this.extend(orderParams, params); // the request does not accept extra params since it's a list, so we're extending each order with the common params
            const orderRequest = this.createOrderRequest(marketId, type, side, amount, price, extendedParams);
            ordersRequests.push(orderRequest);
        }
        const response = await this.privatePostTradeBatchOrders(ordersRequests);
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data);
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name blofin#fetchOpenOrders
         * @description Fetch orders that are still open
         * @see https://blofin.com/docs#get-active-orders
         * @see https://blofin.com/docs#get-active-tpsl-orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of  open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.stop] True if fetching trigger or conditional orders
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOpenOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchOpenOrders', symbol, since, limit, params);
        }
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['instId'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        const isStop = this.safeBoolN(params, ['stop', 'trigger', 'tpsl', 'TPSL'], false);
        let method = undefined;
        [method, params] = this.handleOptionAndParams(params, 'fetchOpenOrders', 'method', 'privateGetTradeOrdersPending');
        const query = this.omit(params, ['method', 'stop', 'trigger', 'tpsl', 'TPSL']);
        let response = undefined;
        if (isStop || (method === 'privateGetTradeOrdersTpslPending')) {
            response = await this.privateGetTradeOrdersTpslPending(this.extend(request, query));
        }
        else {
            response = await this.privateGetTradeOrdersPending(this.extend(request, query));
        }
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data, market, since, limit);
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name blofin#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://blofin.com/docs#get-trade-history
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] Timestamp in ms of the latest time to retrieve trades for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchMyTrades', symbol, since, limit, params);
        }
        let request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['instId'] = market['id'];
        }
        [request, params] = this.handleUntilOption('end', request, params);
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        const response = await this.privateGetTradeFillsHistory(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        return this.parseTrades(data, market, since, limit);
    }
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name blofin#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://blofin.com/docs#get-deposite-history
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchDeposits', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchDeposits', code, since, limit, params);
        }
        let request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['before'] = Math.max(since - 1, 0);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        [request, params] = this.handleUntilOption('after', request, params);
        const response = await this.privateGetAssetDepositHistory(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        return this.parseTransactions(data, currency, since, limit, params);
    }
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name blofin#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://blofin.com/docs#get-withdraw-history
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of withdrawals structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchWithdrawals', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchWithdrawals', code, since, limit, params);
        }
        let request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['before'] = Math.max(since - 1, 0);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        [request, params] = this.handleUntilOption('after', request, params);
        const response = await this.privateGetAssetWithdrawalHistory(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        return this.parseTransactions(data, currency, since, limit, params);
    }
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name blofin#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @see https://blofin.com/docs#get-funds-transfer-history
         * @param {string} code unified currency code, default is undefined
         * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int} [limit] max number of ledger entrys to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated'
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchLedger', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchLedger', code, since, limit, params);
        }
        let request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        [request, params] = this.handleUntilOption('end', request, params);
        let response = undefined;
        response = await this.privateGetAssetBills(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        return this.parseLedger(data, currency, since, limit);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        //
        // fetchDeposits
        //
        //     {
        //         "currency": "USDT",
        //         "chain": "TRC20",
        //         "address": "TGfJLtnsh3B9EqekFEBZ1nR14QanBUf5Bi",
        //         "txId": "892f4e0c32268b29b2e541ef30d32a30bbf10f902adcc4b1428319ed7c3758fd",
        //         "type": "0",
        //         "amount": "86.975843",
        //         "state": "1",
        //         "ts": "1703163304153",
        //         "tag": null,
        //         "confirm": "16",
        //         "depositId": "36c8e2a7ea184a219de72215a696acaf"
        //     }
        // fetchWithdrawals
        //    {
        //       "currency": "USDT",
        //        "chain": "TRC20",
        //        "address": "TYgB3sVXHPEDQUu288EG1uMFh9Pk2swLgW",
        //        "txId": "1fd5ac52df414d7ea66194cadd9a5b4d2422c2b9720037f66d98207f9858fd96",
        //        "type": "0",
        //        "amount": "9",
        //        "fee": "1",
        //        "feeCurrency": "USDT",
        //        "state": "3",
        //        "clientId": null,
        //        "ts": "1707217439351",
        //        "tag": null,
        //        "memo": null,
        //        "withdrawId": "e0768698cfdf4aee8e54654c3775914b"
        //    }
        //
        let type = undefined;
        let id = undefined;
        const withdrawalId = this.safeString(transaction, 'withdrawId');
        const depositId = this.safeString(transaction, 'depositId');
        const addressTo = this.safeString(transaction, 'address');
        const address = addressTo;
        const tagTo = this.safeString(transaction, 'tag');
        if (withdrawalId !== undefined) {
            type = 'withdrawal';
            id = withdrawalId;
        }
        else {
            id = depositId;
            type = 'deposit';
        }
        const currencyId = this.safeString(transaction, 'currency');
        const code = this.safeCurrencyCode(currencyId);
        const amount = this.safeNumber(transaction, 'amount');
        const status = this.parseTransactionStatus(this.safeString(transaction, 'state'));
        const txid = this.safeString(transaction, 'txId');
        const timestamp = this.safeInteger(transaction, 'ts');
        const feeCurrencyId = this.safeString(transaction, 'feeCurrency');
        const feeCode = this.safeCurrencyCode(feeCurrencyId);
        const feeCost = this.safeNumber(transaction, 'fee');
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'network': undefined,
            'addressFrom': undefined,
            'addressTo': addressTo,
            'address': address,
            'tagFrom': undefined,
            'tagTo': tagTo,
            'tag': tagTo,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'internal': undefined,
            'comment': undefined,
            'fee': {
                'currency': feeCode,
                'cost': feeCost,
            },
        };
    }
    parseTransactionStatus(status) {
        const statuses = {
            '0': 'pending',
            '1': 'ok',
            '2': 'failed',
            '3': 'pending',
        };
        return this.safeString(statuses, status, status);
    }
    parseLedgerEntryType(type) {
        const types = {
            '1': 'transfer',
            '2': 'trade',
            '3': 'trade',
            '4': 'rebate',
            '5': 'trade',
            '6': 'transfer',
            '7': 'trade',
            '8': 'fee',
            '9': 'trade',
            '10': 'trade',
            '11': 'trade', // system token conversion
        };
        return this.safeString(types, type, type);
    }
    parseLedgerEntry(item, currency = undefined) {
        const id = this.safeString(item, 'transferId');
        const referenceId = this.safeString(item, 'clientId');
        const fromAccount = this.safeString(item, 'fromAccount');
        const toAccount = this.safeString(item, 'toAccount');
        const type = this.parseLedgerEntryType(this.safeString(item, 'type'));
        const code = this.safeCurrencyCode(this.safeString(item, 'currency'), currency);
        const amountString = this.safeString(item, 'amount');
        const amount = this.parseNumber(amountString);
        const timestamp = this.safeInteger(item, 'ts');
        const status = 'ok';
        return {
            'id': id,
            'info': item,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'type': type,
            'currency': code,
            'amount': amount,
            'clientId': referenceId,
            'status': status,
        };
    }
    parseIds(ids) {
        /**
         * @ignore
         * @method
         * @name blofin#parseIds
         * @param {string[]|string} ids order ids
         * @returns {string[]} list of order ids
         */
        if (typeof ids === 'string') {
            return ids.split(',');
        }
        else {
            return ids;
        }
    }
    async cancelOrders(ids, symbol = undefined, params = {}) {
        /**
         * @method
         * @name blofin#cancelOrders
         * @description cancel multiple orders
         * @see https://blofin.com/docs#cancel-multiple-orders
         * @param {string[]} ids order ids
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.trigger] whether the order is a stop/trigger order
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        // TODO : the original endpoint signature differs, according to that you can skip individual symbol and assign ids in batch. At this moment, `params` is not being used too.
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = [];
        const options = this.safeDict(this.options, 'cancelOrders', {});
        const defaultMethod = this.safeString(options, 'method', 'privatePostTradeCancelBatchOrders');
        let method = this.safeString(params, 'method', defaultMethod);
        const clientOrderIds = this.parseIds(this.safeValue(params, 'clientOrderId'));
        const tpslIds = this.parseIds(this.safeValue(params, 'tpslId'));
        const stop = this.safeBoolN(params, ['stop', 'trigger', 'tpsl']);
        if (stop) {
            method = 'privatePostTradeCancelTpsl';
        }
        if (clientOrderIds === undefined) {
            ids = this.parseIds(ids);
            if (tpslIds !== undefined) {
                for (let i = 0; i < tpslIds.length; i++) {
                    request.push({
                        'tpslId': tpslIds[i],
                        'instId': market['id'],
                    });
                }
            }
            for (let i = 0; i < ids.length; i++) {
                if (stop) {
                    request.push({
                        'tpslId': ids[i],
                        'instId': market['id'],
                    });
                }
                else {
                    request.push({
                        'orderId': ids[i],
                        'instId': market['id'],
                    });
                }
            }
        }
        else {
            for (let i = 0; i < clientOrderIds.length; i++) {
                request.push({
                    'instId': market['id'],
                    'clientOrderId': clientOrderIds[i],
                });
            }
        }
        let response = undefined;
        if (method === 'privatePostTradeCancelTpsl') {
            response = await this.privatePostTradeCancelTpsl(request); // * dont extend with params, otherwise ARRAY will be turned into OBJECT
        }
        else {
            response = await this.privatePostTradeCancelBatchOrders(request); // * dont extend with params, otherwise ARRAY will be turned into OBJECT
        }
        const ordersData = this.safeList(response, 'data', []);
        return this.parseOrders(ordersData, market, undefined, undefined, params);
    }
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name blofin#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://blofin.com/docs#funds-transfer
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from (funding, swap, copy_trading, earn)
         * @param {string} toAccount account to transfer to (funding, swap, copy_trading, earn)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const accountsByType = this.safeDict(this.options, 'accountsByType', {});
        const fromId = this.safeString(accountsByType, fromAccount, fromAccount);
        const toId = this.safeString(accountsByType, toAccount, toAccount);
        const request = {
            'currency': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
            'fromAccount': fromId,
            'toAccount': toId,
        };
        const response = await this.privatePostAssetTransfer(this.extend(request, params));
        const data = this.safeDict(response, 'data', {});
        return this.parseTransfer(data, currency);
    }
    parseTransfer(transfer, currency = undefined) {
        const id = this.safeString(transfer, 'transferId');
        return {
            'info': transfer,
            'id': id,
            'timestamp': undefined,
            'datetime': undefined,
            'currency': undefined,
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': undefined,
        };
    }
    async fetchPosition(symbol, params = {}) {
        /**
         * @method
         * @name blofin#fetchPosition
         * @description fetch data on a single open contract trade position
         * @see https://blofin.com/docs#get-positions
         * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.instType] MARGIN, SWAP, FUTURES, OPTION
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instId': market['id'],
        };
        const response = await this.privateGetAccountPositions(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        const position = this.safeDict(data, 0);
        if (position === undefined) {
            return undefined;
        }
        return this.parsePosition(position, market);
    }
    async fetchPositions(symbols = undefined, params = {}) {
        /**
         * @method
         * @name blofin#fetchPosition
         * @description fetch data on a single open contract trade position
         * @see https://blofin.com/docs#get-positions
         * @param {string[]} [symbols] list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.instType] MARGIN, SWAP, FUTURES, OPTION
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.privateGetAccountPositions(params);
        const data = this.safeList(response, 'data', []);
        const result = this.parsePositions(data);
        return this.filterByArrayPositions(result, 'symbol', symbols, false);
    }
    parsePosition(position, market = undefined) {
        const marketId = this.safeString(position, 'instId');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const pos = this.safeString(position, 'positions');
        const contractsAbs = Precise["default"].stringAbs(pos);
        let side = this.safeString(position, 'positionSide');
        const hedged = side !== 'net';
        const contracts = this.parseNumber(contractsAbs);
        if (pos !== undefined) {
            if (side === 'net') {
                if (Precise["default"].stringGt(pos, '0')) {
                    side = 'long';
                }
                else if (Precise["default"].stringLt(pos, '0')) {
                    side = 'short';
                }
                else {
                    side = undefined;
                }
            }
        }
        const contractSize = this.safeNumber(market, 'contractSize');
        const contractSizeString = this.numberToString(contractSize);
        const markPriceString = this.safeString(position, 'markPrice');
        let notionalString = this.safeString(position, 'notionalUsd');
        if (market['inverse']) {
            notionalString = Precise["default"].stringDiv(Precise["default"].stringMul(contractsAbs, contractSizeString), markPriceString);
        }
        const notional = this.parseNumber(notionalString);
        const marginMode = this.safeString(position, 'marginMode');
        let initialMarginString = undefined;
        const entryPriceString = this.safeString(position, 'averagePrice');
        const unrealizedPnlString = this.safeString(position, 'unrealizedPnl');
        const leverageString = this.safeString(position, 'leverage');
        let initialMarginPercentage = undefined;
        let collateralString = undefined;
        if (marginMode === 'cross') {
            initialMarginString = this.safeString(position, 'initialMargin');
            collateralString = Precise["default"].stringAdd(initialMarginString, unrealizedPnlString);
        }
        else if (marginMode === 'isolated') {
            initialMarginPercentage = Precise["default"].stringDiv('1', leverageString);
            collateralString = this.safeString(position, 'margin');
        }
        const maintenanceMarginString = this.safeString(position, 'maintenanceMargin');
        const maintenanceMargin = this.parseNumber(maintenanceMarginString);
        const maintenanceMarginPercentageString = Precise["default"].stringDiv(maintenanceMarginString, notionalString);
        if (initialMarginPercentage === undefined) {
            initialMarginPercentage = this.parseNumber(Precise["default"].stringDiv(initialMarginString, notionalString, 4));
        }
        else if (initialMarginString === undefined) {
            initialMarginString = Precise["default"].stringMul(initialMarginPercentage, notionalString);
        }
        const rounder = '0.00005'; // round to closest 0.01%
        const maintenanceMarginPercentage = this.parseNumber(Precise["default"].stringDiv(Precise["default"].stringAdd(maintenanceMarginPercentageString, rounder), '1', 4));
        const liquidationPrice = this.safeNumber(position, 'liquidationPrice');
        const percentageString = this.safeString(position, 'unrealizedPnlRatio');
        const percentage = this.parseNumber(Precise["default"].stringMul(percentageString, '100'));
        const timestamp = this.safeInteger(position, 'updateTime');
        const marginRatio = this.parseNumber(Precise["default"].stringDiv(maintenanceMarginString, collateralString, 4));
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'notional': notional,
            'marginMode': marginMode,
            'liquidationPrice': liquidationPrice,
            'entryPrice': this.parseNumber(entryPriceString),
            'unrealizedPnl': this.parseNumber(unrealizedPnlString),
            'percentage': percentage,
            'contracts': contracts,
            'contractSize': contractSize,
            'markPrice': this.parseNumber(markPriceString),
            'lastPrice': undefined,
            'side': side,
            'hedged': hedged,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastUpdateTimestamp': undefined,
            'maintenanceMargin': maintenanceMargin,
            'maintenanceMarginPercentage': maintenanceMarginPercentage,
            'collateral': this.parseNumber(collateralString),
            'initialMargin': this.parseNumber(initialMarginString),
            'initialMarginPercentage': this.parseNumber(initialMarginPercentage),
            'leverage': this.parseNumber(leverageString),
            'marginRatio': marginRatio,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    async fetchLeverages(symbols = undefined, params = {}) {
        /**
         * @method
         * @name blofin#fetchLeverages
         * @description fetch the set leverage for all contract markets
         * @see https://docs.blofin.com/index.html#get-multiple-leverage
         * @param {string[]} symbols a list of unified market symbols, required on blofin
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated'
         * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/#/?id=leverage-structure}
         */
        await this.loadMarkets();
        if (symbols === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchLeverages() requires a symbols argument');
        }
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchLeverages', params);
        if (marginMode === undefined) {
            marginMode = this.safeString(params, 'marginMode', 'cross'); // cross as default marginMode
        }
        if ((marginMode !== 'cross') && (marginMode !== 'isolated')) {
            throw new errors.BadRequest(this.id + ' fetchLeverages() requires a marginMode parameter that must be either cross or isolated');
        }
        symbols = this.marketSymbols(symbols);
        let instIds = '';
        for (let i = 0; i < symbols.length; i++) {
            const entry = symbols[i];
            const entryMarket = this.market(entry);
            if (i > 0) {
                instIds = instIds + ',' + entryMarket['id'];
            }
            else {
                instIds = instIds + entryMarket['id'];
            }
        }
        const request = {
            'instId': instIds,
            'marginMode': marginMode,
        };
        const response = await this.privateGetAccountBatchLeverageInfo(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "success",
        //         "data": [
        //             {
        //                 "leverage": "3",
        //                 "marginMode": "cross",
        //                 "instId": "BTC-USDT"
        //             },
        //         ]
        //     }
        //
        const leverages = this.safeList(response, 'data', []);
        return this.parseLeverages(leverages, symbols, 'instId');
    }
    async fetchLeverage(symbol, params = {}) {
        /**
         * @method
         * @name blofin#fetchLeverage
         * @description fetch the set leverage for a market
         * @see https://docs.blofin.com/index.html#get-leverage
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated'
         * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
         */
        await this.loadMarkets();
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchLeverage', params);
        if (marginMode === undefined) {
            marginMode = this.safeString(params, 'marginMode', 'cross'); // cross as default marginMode
        }
        if ((marginMode !== 'cross') && (marginMode !== 'isolated')) {
            throw new errors.BadRequest(this.id + ' fetchLeverage() requires a marginMode parameter that must be either cross or isolated');
        }
        const market = this.market(symbol);
        const request = {
            'instId': market['id'],
            'marginMode': marginMode,
        };
        const response = await this.privateGetAccountLeverageInfo(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "success",
        //         "data": {
        //             "leverage": "3",
        //             "marginMode": "cross",
        //             "instId": "BTC-USDT"
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseLeverage(data, market);
    }
    parseLeverage(leverage, market = undefined) {
        const marketId = this.safeString(leverage, 'instId');
        const leverageValue = this.safeInteger(leverage, 'leverage');
        return {
            'info': leverage,
            'symbol': this.safeSymbol(marketId, market),
            'marginMode': this.safeStringLower(leverage, 'marginMode'),
            'longLeverage': leverageValue,
            'shortLeverage': leverageValue,
        };
    }
    async setLeverage(leverage, symbol = undefined, params = {}) {
        /**
         * @method
         * @name blofin#setLeverage
         * @description set the level of leverage for a market
         * @see https://blofin.com/docs#set-leverage
         * @param {int} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated'
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        if ((leverage < 1) || (leverage > 125)) {
            throw new errors.BadRequest(this.id + ' setLeverage() leverage should be between 1 and 125');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('setLeverage', params, 'cross');
        if ((marginMode !== 'cross') && (marginMode !== 'isolated')) {
            throw new errors.BadRequest(this.id + ' setLeverage() requires a marginMode parameter that must be either cross or isolated');
        }
        const request = {
            'leverage': leverage,
            'marginMode': marginMode,
            'instId': market['id'],
        };
        const response = await this.privatePostAccountSetLeverage(this.extend(request, params));
        return response;
    }
    async closePosition(symbol, side = undefined, params = {}) {
        /**
         * @method
         * @name blofin#closePosition
         * @description closes open positions for a market
         * @see https://blofin.com/docs#close-positions
         * @param {string} symbol Unified CCXT market symbol
         * @param {string} [side] 'buy' or 'sell', leave as undefined in net mode
         * @param {object} [params] extra parameters specific to the blofin api endpoint
         * @param {string} [params.clientOrderId] a unique identifier for the order
         * @param {string} [params.marginMode] 'cross' or 'isolated', default is 'cross;
         * @param {string} [params.code] *required in the case of closing cross MARGIN position for Single-currency margin* margin currency
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {boolean} [params.autoCxl] whether any pending orders for closing out needs to be automatically canceled when close position via a market order. false or true, the default is false
         * @param {string} [params.tag] order tag a combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters
         * @returns {object[]} [A list of position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const clientOrderId = this.safeString(params, 'clientOrderId');
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('closePosition', params, 'cross');
        const request = {
            'instId': market['id'],
            'marginMode': marginMode,
        };
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
        }
        const response = await this.privatePostTradeClosePosition(this.extend(request, params));
        return this.safeDict(response, 'data');
    }
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name blofin#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://blofin.com/docs#get-order-history
         * @see https://blofin.com/docs#get-tpsl-order-history
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of  orde structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.stop] True if fetching trigger or conditional orders
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchClosedOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchClosedOrders', symbol, since, limit, params);
        }
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['instId'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        if (since !== undefined) {
            request['begin'] = since;
        }
        const isStop = this.safeBoolN(params, ['stop', 'trigger', 'tpsl', 'TPSL'], false);
        let method = undefined;
        [method, params] = this.handleOptionAndParams(params, 'fetchOpenOrders', 'method', 'privateGetTradeOrdersHistory');
        const query = this.omit(params, ['method', 'stop', 'trigger', 'tpsl', 'TPSL']);
        let response = undefined;
        if ((isStop) || (method === 'privateGetTradeOrdersTpslHistory')) {
            response = await this.privateGetTradeOrdersTpslHistory(this.extend(request, query));
        }
        else {
            response = await this.privateGetTradeOrdersHistory(this.extend(request, query));
        }
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data, market, since, limit);
    }
    async fetchMarginMode(symbol, params = {}) {
        /**
         * @method
         * @name blofin#fetchMarginMode
         * @description fetches the margin mode of a trading pair
         * @see https://docs.blofin.com/index.html#get-margin-mode
         * @param {string} symbol unified symbol of the market to fetch the margin mode for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/#/?id=margin-mode-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const response = await this.privateGetAccountMarginMode(params);
        //
        //     {
        //         "code": "0",
        //         "msg": "success",
        //         "data": {
        //             "marginMode": "cross"
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseMarginMode(data, market);
    }
    parseMarginMode(marginMode, market = undefined) {
        return {
            'info': marginMode,
            'symbol': market['symbol'],
            'marginMode': this.safeString(marginMode, 'marginMode'),
        };
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        // {"code":"152002","msg":"Parameter bar error."}
        //
        const code = this.safeString(response, 'code');
        const message = this.safeString(response, 'msg');
        const feedback = this.id + ' ' + body;
        if (code !== undefined && code !== '0') {
            this.throwExactlyMatchedException(this.exceptions['exact'], message, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], code, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            throw new errors.ExchangeError(feedback); // unknown message
        }
        //
        //  {
        //      orderId: null,
        //      clientOrderId: '',
        //      msg: 'Order failed. Insufficient USDT margin in account',
        //      code: '103003'
        //  }
        //
        const data = this.safeList(response, 'data');
        const first = this.safeDict(data, 0);
        const insideMsg = this.safeString(first, 'msg');
        const insideCode = this.safeString(first, 'code');
        if (insideCode !== undefined && insideCode !== '0') {
            this.throwExactlyMatchedException(this.exceptions['exact'], insideCode, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], insideMsg, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], insideMsg, feedback);
        }
        return undefined;
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/api/' + this.version + '/' + this.implodeParams(path, params);
        const query = this.omit(params, this.extractParams(path));
        let url = this.implodeHostname(this.urls['api']['rest']) + request;
        // const type = this.getPathAuthenticationType (path);
        if (api === 'public') {
            if (!this.isEmpty(query)) {
                url += '?' + this.urlencode(query);
            }
        }
        else if (api === 'private') {
            this.checkRequiredCredentials();
            const timestamp = this.milliseconds().toString();
            headers = {
                'ACCESS-KEY': this.apiKey,
                'ACCESS-PASSPHRASE': this.password,
                'ACCESS-TIMESTAMP': timestamp,
                'ACCESS-NONCE': timestamp,
            };
            let sign_body = '';
            if (method === 'GET') {
                if (!this.isEmpty(query)) {
                    const urlencodedQuery = '?' + this.urlencode(query);
                    url += urlencodedQuery;
                    request += urlencodedQuery;
                }
            }
            else {
                if (!this.isEmpty(query)) {
                    body = this.json(query);
                    sign_body = body;
                }
                headers['Content-Type'] = 'application/json';
            }
            const auth = request + method + timestamp + timestamp + sign_body;
            const signature = this.stringToBase64(this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256));
            headers['ACCESS-SIGN'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

module.exports = blofin;
