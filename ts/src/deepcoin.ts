
// ---------------------------------------------------------------------------

import Exchange from './abstract/deepcoin.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Precise } from './base/Precise.js';
import type { Balances, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
import { BadRequest } from '../ccxt.js';

// ---------------------------------------------------------------------------

/**
 * @class deepcoin
 * @augments Exchange
 */
export default class deepcoin extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'deepcoin',
            'name': 'DeepCoin',
            'countries': [ 'SG' ], // Singapore
            'rateLimit': 200, // 5 times per second
            'version': 'v1',
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'cancelWithdraw': false,
                'closePosition': false,
                'createConvertTrade': false,
                'createDepositAddress': false,
                'createLimitBuyOrder': true,
                'createLimitOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrder': true,
                'createMarketOrderWithCost': true,
                'createMarketSellOrder': true,
                'createMarketSellOrderWithCost': true,
                'createOrder': true,
                'createOrders': false,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLossOrder': false,
                'createTakeProfitOrder': false,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchCanceledAndClosedOrders': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': true,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'sandbox': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15': '15m',
                '30': '30m',
                '1h': '1H',
                '4h': '4H',
                '12h': '12H',
                '1d': '1D',
                '1w': '1W',
                '1M': '1M',
                '1y': '1Y',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api.deepcoin.com',
                    'private': 'https://api.deepcoin.com',
                },
                'www': 'https://www.deepcoin.com/',
                'doc': 'https://www.deepcoin.com/docs',
                'referral': '',
            },
            'api': {
                'public': {
                    'get': {
                        'deepcoin/market/books': 1, // done
                        'deepcoin/market/candles': 1, // done
                        'deepcoin/market/instruments': 1, // done
                        'deepcoin/market/tickers': 1, // done
                        'deepcoin/market/index-candles': 1, // done
                        'deepcoin/market/trades': 1, // done
                        'deepcoin/market/mark-price-candles': 1, // done
                        'deepcoin/market/step-margin': 5, // not unified
                    },
                },
                'private': {
                    'get': {
                        'deepcoin/account/balances': 5, // done
                        'deepcoin/account/bills': 5,
                        'deepcoin/account/positions': 5,
                        'deepcoin/trade/fills': 5,
                        'deepcoin/trade/orderByID': 5,
                        'deepcoin/trade/finishOrderByID': 5,
                        'deepcoin/trade/orders-history': 5,
                        'deepcoin/trade/v2/orders-pending': 5,
                        'deepcoin/trade/funding-rate': 5,
                        'deepcoin/trade/fund-rate/current-funding-rate': 5,
                        'deepcoin/trade/fund-rate/history': 5,
                        'deepcoin/trade/trigger-orders-pending': 5,
                        'deepcoin/trade/trigger-orders-history': 5,
                        'deepcoin/copytrading/support-contracts': 5,
                        'deepcoin/copytrading/leader-position': 5,
                        'deepcoin/copytrading/estimate-profit': 5,
                        'deepcoin/copytrading/history-profit': 5,
                        'deepcoin/copytrading/follower-rank': 5,
                        'deepcoin/internal-transfer/support': 5,
                        'deepcoin/internal-transfer/history-order': 5,
                        'deepcoin/rebate/config': 5,
                        'deepcoin/agents/users': 5,
                        'deepcoin/agents/users/rebate-list': 5,
                        'deepcoin/agents/users/rebates': 5,
                        'deepcoin/asset/deposit-list': 5, // done
                        'deepcoin/asset/withdraw-list': 5,
                        'deepcoin/asset/recharge-chain-list': 5,
                    },
                    'post': {
                        'deepcoin/account/set-leverage': 5,
                        'deepcoin/trade/order': 5, // done
                        'deepcoin/trade/replace-order': 5,
                        'deepcoin/trade/cancel-order': 5,
                        'deepcoin/trade/batch-cancel-order': 5,
                        'deepcoin/trade/cancel-trigger-order': 1 / 6,
                        'deepcoin/trade/swap/cancel-all': 5,
                        'deepcoin/trade/trigger-order': 5,
                        'deepcoin/trade/batch-close-position': 5,
                        'deepcoin/trade/replace-order-sltp': 5,
                        'deepcoin/trade/close-position-by-ids': 5,
                        'deepcoin/copytrading/leader-settings': 5,
                        'deepcoin/copytrading/set-contracts': 5,
                        'deepcoin/internal-transfer': 5,
                        'deepcoin/rebate/config': 5,
                        'deepcoin/asset/transfer': 5,
                    },
                },
            },
            'fees': {
                'trading': {
                    'taker': this.parseNumber ('0.0015'),
                    'maker': this.parseNumber ('0.0010'),
                },
            },
            'features': {
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'recvWindow': 5000,
                'networks': {
                    'ERC20': 'ERC20', // todo add more networks
                },
                'networksById': {
                },
                'fetchMarkets': {
                    'types': [ 'spot', 'swap' ], // spot, swap,
                },
                'timeInForce': {
                    'GTC': 'GTC', // Good Till Cancel
                    'IOC': 'IOC', // Immediate Or Cancel
                    'PO': 'PO',   // Post Only
                },
                'exchangeType': {
                    'spot': 'SPOT',
                    'swap': 'SWAP',
                    'SPOT': 'SPOT',
                    'SWAP': 'SWAP',
                },
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    // { code: '51', msg: 'The instType field is required', data: null }
                    // {"code":"51","msg":"The instType value `spot` is not in acceptable range: SPOT,SWAP","data":null}
                    // {"code":"51","msg":"The productGroup field is required","data":null}
                    // {"code":"0","msg":"","data":{"ordId":"","clOrdId":"","tag":"","sCode":"194","sMsg":"LessThanMinVolume"}}
                    // {"code":"0","msg":"","data":{"ordId":"","clOrdId":"","tag":"","sCode":"36","sMsg":"InsufficientMoney:-0.000004"}}
                    // {"code":"0","msg":"","data":{"ordId":"","clOrdId":"","tag":"","sCode":"195","sMsg":"PositionLessThanMinVolume"}}
                },
                'broad': {},
            },
        });
    }

    handleMarketTypeAndParams (methodName: string, market: Market = undefined, params = {}, defaultValue = undefined): any {
        const instType = this.safeString (params, 'instType');
        params = this.omit (params, 'instType');
        const type = this.safeString (params, 'type');
        if ((type === undefined) && (instType !== undefined)) {
            params['type'] = instType;
        }
        return super.handleMarketTypeAndParams (methodName, market, params, defaultValue);
    }

    convertToInstrumentType (type) {
        const exchangeTypes = this.safeDict (this.options, 'exchangeType', {});
        return this.safeString (exchangeTypes, type, type);
    }

    /**
     * @method
     * @name deepcoin#fetchMarkets
     * @see https://www.deepcoin.com/docs/DeepCoinMarket/getBaseInfo
     * @description retrieves data on all markets for okcoin
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        let types = [ 'spot', 'swap' ];
        const fetchMarketsOption = this.safeDict (this.options, 'fetchMarkets');
        if (fetchMarketsOption !== undefined) {
            types = this.safeList (fetchMarketsOption, 'types', types);
        } else {
            types = this.safeList (this.options, 'fetchMarkets', types); // backward-support
        }
        let promises = [];
        let result = [];
        for (let i = 0; i < types.length; i++) {
            promises.push (this.fetchMarketsByType (types[i], params));
        }
        promises = await Promise.all (promises);
        for (let i = 0; i < promises.length; i++) {
            result = this.arrayConcat (result, promises[i]);
        }
        return result;
    }

    async fetchMarketsByType (type, params = {}) {
        const request: Dict = {
            'instType': this.convertToInstrumentType (type),
        };
        const response = await this.publicGetDeepcoinMarketInstruments (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "instType": "SPOT",
        //                 "instId": "A-USDT",
        //                 "uly": "",
        //                 "baseCcy": "A",
        //                 "quoteCcy": "USDT",
        //                 "ctVal": "1",
        //                 "ctValCcy": "",
        //                 "listTime": "0",
        //                 "lever": "1",
        //                 "tickSz": "0.0001",
        //                 "lotSz": "0.001",
        //                 "minSz": "0.5",
        //                 "ctType": "",
        //                 "alias": "",
        //                 "state": "live",
        //                 "maxLmtSz": "7692307",
        //                 "maxMktSz": "7692307"
        //             }
        //         ]
        //     }
        //
        const dataResponse = this.safeList (response, 'data', []);
        return this.parseMarkets (dataResponse);
    }

    parseMarket (market: Dict): Market {
        //
        // spot markets
        //
        //     {
        //         "instType": "SPOT",
        //         "instId": "A-USDT",
        //         "uly": "",
        //         "baseCcy": "A",
        //         "quoteCcy": "USDT",
        //         "ctVal": "1",
        //         "ctValCcy": "",
        //         "listTime": "0",
        //         "lever": "1",
        //         "tickSz": "0.0001",
        //         "lotSz": "0.001",
        //         "minSz": "0.5",
        //         "ctType": "",
        //         "alias": "",
        //         "state": "live",
        //         "maxLmtSz": "7692307",
        //         "maxMktSz": "7692307"
        //     }
        //
        // swap markets
        //
        //     {
        //         "instType": "SWAP",
        //         "instId": "ZORA-USDT-SWAP",
        //         "uly": "",
        //         "baseCcy": "ZORA",
        //         "quoteCcy": "USDT",
        //         "ctVal": "1",
        //         "ctValCcy": "",
        //         "listTime": "0",
        //         "lever": "20",
        //         "tickSz": "0.00001",
        //         "lotSz": "1",
        //         "minSz": "1685",
        //         "ctType": "",
        //         "alias": "",
        //         "state": "live",
        //         "maxLmtSz": "10000000",
        //         "maxMktSz": "10000000"
        //     }
        //
        const id = this.safeString (market, 'instId');
        const type = this.safeStringLower (market, 'instType');
        const spot = (type === 'spot');
        const swap = (type === 'swap');
        const baseId = this.safeString (market, 'baseCcy');
        const quoteId = this.safeString (market, 'quoteCcy', '');
        let settleId = undefined;
        let settle = undefined;
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = base + '/' + quote;
        let isLinear = undefined;
        if (swap) {
            isLinear = (quoteId !== 'USD');
            settleId = isLinear ? quoteId : baseId;
            settle = this.safeCurrencyCode (settleId);
            symbol = symbol + ':' + settle;
        }
        const fees = this.safeDict2 (this.fees, type, 'trading', {});
        let maxLeverage = this.safeString (market, 'lever', '1');
        maxLeverage = Precise.stringMax (maxLeverage, '1');
        const maxMarketSize = this.safeString (market, 'maxMktSz');
        const maxLimitSize = this.safeString (market, 'maxLmtSz');
        const maxAmount = this.parseNumber (Precise.stringMax (maxMarketSize, maxLimitSize));
        const state = this.safeString (market, 'state');
        return this.extend (fees, {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': type,
            'spot': spot,
            'margin': spot && (Precise.stringGt (maxLeverage, '1')),
            'swap': swap,
            'future': false,
            'option': false,
            'active': state === 'live',
            'contract': swap,
            'linear': isLinear,
            'inverse': swap ? (!isLinear) : undefined,
            'contractSize': swap ? this.safeNumber (market, 'ctVal') : undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'created': undefined,
            'precision': {
                'amount': this.safeNumber (market, 'lotSz'),
                'price': this.safeNumber (market, 'tickSz'),
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber ('1'),
                    'max': this.parseNumber (maxLeverage),
                },
                'amount': {
                    'min': this.safeNumber (market, 'minSz'),
                    'max': maxAmount,
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

    /**
     * @method
     * @name deepcoin#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.deepcoin.com/docs/DeepCoinMarket/marketBooks
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 100;
        }
        const request: Dict = {
            'instId': market['id'],
            'sz': limit,
        };
        const response = await this.publicGetDeepcoinMarketBooks (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": {
        //             "bids": [
        //                 ["3732.21", "99.6"],
        //                 ["3732.2", "54.7"]
        //             ],
        //             "asks": [
        //                 ["3732.22", "85.1"],
        //                 ["3732.23", "49.4"]
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const timestamp = this.milliseconds ();
        return this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 0, 1);
    }

    /**
     * @method
     * @name deepcoin#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.deepcoin.com/docs/DeepCoinMarket/getKlineData
     * @see https://www.deepcoin.com/docs/DeepCoinMarket/getIndexKlineData
     * @see https://www.deepcoin.com/docs/DeepCoinMarket/getMarkKlineData
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {string} [params.price] "mark" or "index" for mark price and index price candles
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const price = this.safeString (params, 'price');
        params = this.omit (params, 'price');
        const bar = this.safeString (this.timeframes, timeframe, timeframe);
        const request: Dict = {
            'instId': market['id'],
            'bar': bar,
            'limit': limit,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['after'] = until;
            params = this.omit (params, 'until');
        }
        let response = undefined;
        if (price === 'mark') {
            response = await this.publicGetDeepcoinMarketMarkPriceCandles (this.extend (request, params));
        } else if (price === 'index') {
            response = await this.publicGetDeepcoinMarketIndexCandles (this.extend (request, params));
        } else {
            response = await this.publicGetDeepcoinMarketCandles (this.extend (request, params));
        }
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data":[
        //             [
        //                 "1760221800000",
        //                 "3739.08",
        //                 "3741.95",
        //                 "3737.75",
        //                 "3740.1",
        //                 "2849",
        //                 "1065583.744"
        //             ],
        //             [
        //                 "1760221740000",
        //                 "3742.36",
        //                 "3743.01",
        //                 "3736.83",
        //                 "3739.08",
        //                 "2723",
        //                 "1018290.723"
        //             ]
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    /**
     * @method
     * @name deepcoin#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://www.deepcoin.com/docs/DeepCoinMarket/getMarketTickers
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const market = this.getMarketFromSymbols (symbols);
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        const request: Dict = {
            'instType': this.convertToInstrumentType (marketType),
        };
        const response = await this.publicGetDeepcoinMarketTickers (this.extend (request, params));
        const tickers = this.safeList (response, 'data', []);
        return this.parseTickers (tickers, symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "instType": "SWAP",
        //         "instId": "BTC-USD-SWAP",
        //         "last": "114113.3",
        //         "lastSz": "",
        //         "askPx": "114113.5",
        //         "askSz": "56280",
        //         "bidPx": "114113.2",
        //         "bidSz": "63220",
        //         "open24h": "113214.7",
        //         "high24h": "116039.2",
        //         "low24h": "113214.7",
        //         "volCcy24h": "73.31475724",
        //         "vol24h": "8406739",
        //         "sodUtc0": "",
        //         "sodUtc8": "",
        //         "ts": "1760367816000"
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'ts');
        const marketId = this.safeString (ticker, 'instId');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 'last');
        const open = this.safeString (ticker, 'open24h');
        let quoteVolume = this.safeString (ticker, 'volCcy24h');
        let baseVolume = this.safeString (ticker, 'vol24h');
        if (market['swap'] && market['inverse']) {
            const temp = baseVolume;
            baseVolume = quoteVolume;
            quoteVolume = temp;
        }
        const high = this.safeString (ticker, 'high24h');
        const low = this.safeString (ticker, 'low24h');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': this.safeString (ticker, 'bidPx'),
            'bidVolume': this.safeString (ticker, 'bidSz'),
            'ask': this.safeString (ticker, 'askPx'),
            'askVolume': this.safeString (ticker, 'askSz'),
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
            'markPrice': undefined,
            'indexPrice': undefined,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name deepcoin#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.deepcoin.com/docs/DeepCoinMarket/getTrades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (default 100, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.productGroup] 'Spot', 'Swap', 'SwapU' for USDT-margined
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instId': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 500
        }
        let productGroup = undefined;
        if (market['spot']) {
            productGroup = 'Spot';
        } else if (market['swap']) {
            if (market['linear']) {
                productGroup = 'SwapU';
            } else {
                productGroup = 'Swap';
            }
        }
        request['productGroup'] = productGroup;
        params = this.omit (params, 'productGroup');
        const response = await this.publicGetDeepcoinMarketTrades (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // public fetchTrades
        //
        //     {
        //         "instId": "ETH-USDT",
        //         "tradeId": "1001056388761321",
        //         "px": "4095.66",
        //         "sz": "0.01311251",
        //         "side": "sell",
        //         "ts": "1760367870000"
        //     }
        //
        const id = this.safeString (trade, 'tradeId');
        const marketId = this.safeString (trade, 'instId');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (trade, 'ts');
        const price = this.safeString2 (trade, 'fillPx', 'px');
        const amount = this.safeString2 (trade, 'fillSz', 'sz');
        const side = this.safeString (trade, 'side');
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name deepcoin#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.deepcoin.com/docs/DeepCoinAccount/getAccountBalance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] "spot" or "swap", the market type for the balance
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params, marketType);
        const request: Dict = {
            'instType': this.convertToInstrumentType (marketType),
        };
        const response = await this.privateGetDeepcoinAccountBalances (this.extend (request, params));
        return this.parseBalance (response);
    }

    parseBalance (response): Balances {
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "ccy": "USDT",
        //                 "bal": "74",
        //                 "frozenBal": "0",
        //                 "availBal": "74"
        //             }
        //         ]
        //     }
        //
        const result: Dict = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const balances = this.safeList (response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const symbol = this.safeString (balance, 'ccy');
            const code = this.safeCurrencyCode (symbol);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'bal');
            account['used'] = this.safeString (balance, 'frozenBal');
            account['free'] = this.safeString (balance, 'availBal');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name deepcoin#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://www.deepcoin.com/docs/assets/deposit
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
            params = this.omit (params, 'until');
        }
        const response = await this.privateGetDeepcoinAssetDepositList (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        const items = this.safeList (data, 'data', []);
        const transactionParams: Dict = {
            'type': 'deposit',
        };
        return this.parseTransactions (items, currency, since, limit, transactionParams);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // fetchDeposits
        //     {
        //         "createTime": 1760368656,
        //         "txHash": "03fe3244d89e794586222413c61779380da9e9fe5baaa253c38d01a4199a3499",
        //         "chainName": "TRC20",
        //         "amount": "149",
        //         "coin": "USDT",
        //         "status": "succeed"
        //     }
        //
        const txid = this.safeString (transaction, 'txHash');
        const currencyId = this.safeString (transaction, 'coin');
        const code = this.safeCurrencyCode (currencyId, currency);
        const amount = this.safeNumber (transaction, 'amount');
        const timestamp = this.safeTimestamp (transaction, 'createTime');
        const networkId = this.safeString (transaction, 'chainName');
        const network = this.networkIdToCode (networkId);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        return {
            'info': transaction,
            'id': undefined,
            'currency': code,
            'amount': amount,
            'network': network,
            'addressFrom': undefined,
            'addressTo': undefined,
            'address': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'tag': undefined,
            'status': status,
            'type': undefined,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'internal': undefined,
            'comment': undefined,
            'fee': {
                'currency': undefined,
                'cost': undefined,
            },
        } as Transaction;
    }

    parseTransactionStatus (status: Str) {
        const statuses: Dict = {
            'confirming': 'pending',
            'succeed': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name deepcoin#createOrder
     * @description create a trade order
     * @see https://www.deepcoin.com/docs/DeepCoinTrade/order
     * @see https://www.deepcoin.com/docs/DeepCoinTrade/triggerOrder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @param {string} [params.timeInForce] *non trigger orders only* 'GTC' (Good Till Cancel), 'IOC' (Immediate Or Cancel) or 'PO' (Post Only)
     * @param {bool} [params.postOnly] *non trigger orders only* true to place a post only order
     * @param {bool} [params.reduceOnly] *non trigger orders only* a mark to reduce the position size for margin, swap and future orders
     * @param {float} [params.triggerPrice] the price a trigger order is triggered at
     * @param {float} [params.stopLossPrice] the price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] the price that a take profit order is triggered at
     * @param {string} [params.positionSide] if position mode is one-way: set to 'net', if position mode is hedge-mode: set to 'long' or 'short'
     * @param {bool} [params.hedged] *swap only* true for hedged mode, false for one way mode
     * @param {string} [params.marginMode] *swap only*'cross' or 'isolated', the default is 'cash' for spot and 'cross' for swap
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const triggerPrice = this.safeString (params, 'triggerPrice');
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        let response = undefined;
        if (triggerPrice !== undefined) {
            // trigger orders
            response = this.privatePostDeepcoinTradeTriggerOrder (request);
        } else {
            // regular orders
            //
            //     {
            //         "code": "0",
            //         "msg": "",
            //         "data": {
            //             "ordId": "1001434570213727",
            //             "clOrdId": "",
            //             "tag": "",
            //             "sCode": "0",
            //             "sMsg": ""
            //         }
            //     }
            //
            response = this.privatePostDeepcoinTradeOrder (request);
        }
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        /**
         * @method
         * @ignore
         * @name deepcoin#createOrderRequest
         * @description helper function to build request
         */
        const market = this.market (symbol);
        const triggerPrice = this.safeString (params, 'triggerPrice');
        const cost = this.safeString (params, 'cost');
        if (cost !== undefined) {
            if (!market['spot'] || (triggerPrice !== undefined)) {
                throw new BadRequest (this.id + ' createOrder() accepts a cost parameter for spot non-trigger market orders only');
            }
        }
        if (triggerPrice !== undefined) {
            return this.createTriggerOrderRequest (symbol, type, side, amount, price, params);
        } else {
            return this.createRegularOrderRequest (symbol, type, side, amount, price, params);
        }
    }

    createRegularOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        /**
         * @method
         * @ignore
         * @name deepcoin#createRegularOrderRequest
         * @description helper function to build request
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency
         * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.cost] *spot only* the cost of the order in units of the quote currency, for market orders only
         * @param {string} [params.clientOrderId] a unique id for the order
         * @param {string} [params.timeInForce] 'GTC' (Good Till Cancel), 'IOC' (Immediate Or Cancel) or 'PO' (Post Only)
         * @param {bool} [params.postOnly] true to place a post only order
         * @param {bool} [params.reduceOnly] a mark to reduce the position size for margin and swap orders
         * @param {float} [params.stopLossPrice] the price that a stop loss order is triggered at
         * @param {float} [params.takeProfitPrice] the price that a take profit order is triggered at
         * @param {bool} [params.hedged] *swap only* true for hedged mode, false for one way mode
         * @param {string} [params.marginMode] *swap only* 'cross' or 'isolated', the default is 'cash' for spot and 'cross' for swap
         */
        const market = this.market (symbol);
        let orderType = type;
        [ orderType, params ] = this.handleTypePostOnlyAndTimeInForce (type, params);
        const request: Dict = {
            'instId': market['id'],
            // 'tdMode': 'cash', // 'cash' for spot, 'cross' or 'isolated' for swap
            // 'ccy': currency['id'], // only applicable to cross MARGIN orders in single-currency margin // todo check
            // 'clOrdId': clientOrderId,
            // 'side': side,
            'ordType': orderType,
            // 'sz': amount or cost
            // 'px': price, // limit orders only
            // 'reduceOnly': false, // a mark to reduce the position size for margin and swap orders
            // 'tgtCcy': 'base_ccy', // spot only 'base_ccy' or 'quote_ccy', the default is 'base_ccy' for spot orders
            // 'tpTriggerPx': takeProfitPrice, // take profit trigger price
            // 'slTriggerPx': stopLossPrice, // stop loss trigger price
            // 'posSide': 'long', // swap only 'long' or 'short'
            // 'mrgPosition': 'merge', // swap only 'merge' or 'split'
            // 'closePosId': 'id', // swap only position ID to close, required in split mode
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrdId'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        }
        const stopLossPrice = this.safeString (params, 'stopLossPrice');
        if (stopLossPrice !== undefined) {
            params = this.omit (params, 'stopLossPrice');
            request['slTriggerPx'] = this.priceToPrecision (symbol, stopLossPrice);
        }
        const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        if (takeProfitPrice !== undefined) {
            params = this.omit (params, 'takeProfitPrice');
            request['tpTriggerPx'] = this.priceToPrecision (symbol, takeProfitPrice);
        }
        const isMarketOrder = (type === 'market');
        if (price !== undefined) {
            if (isMarketOrder) {
                throw new BadRequest (this.id + ' createOrder() does not require a price argument for market orders');
            }
            request['px'] = this.priceToPrecision (symbol, price);
        } else if (!isMarketOrder) {
            throw new BadRequest (this.id + ' createOrder() requires a price argument for limit orders');
        }
        if (market['spot']) {
            const cost = this.safeString (params, 'cost');
            if (cost !== undefined) {
                if (isMarketOrder) {
                    throw new BadRequest (this.id + ' createOrder() accepts a cost parameter for spot market orders only');
                }
                if ((amount !== undefined) && (amount !== 0)) {
                    throw new BadRequest (this.id + ' createOrder() accepts either amount argument or cost parameter, not both');
                }
                params = this.omit (params, 'cost');
                request['sz'] = this.costToPrecision (symbol, cost);
                request['tgtCcy'] = 'quote_ccy';
            } else {
                request['sz'] = this.amountToPrecision (symbol, amount);
                request['tgtCcy'] = 'base_ccy';
            }
            request['side'] = side;
            request['tdMode'] = 'cash';
        } else {
            request['sz'] = this.amountToPrecision (symbol, amount);
            let marginMode = 'cross';
            [ marginMode, params ] = this.handleMarginModeAndParams ('createOrder', params, marginMode);
            request['tdMode'] = marginMode;
            let hedged = false;
            let mrgPosition = 'merge';
            [ hedged, params ] = this.handleOptionAndParams (params, 'createOrder', 'hedged', hedged);
            if (hedged) {
                mrgPosition = 'split'; // todo check
            }
            request['mrgPosition'] = mrgPosition;
            let posSide: Str = undefined;
            const reduceOnly = this.safeBool (params, 'reduceOnly', false);
            if (reduceOnly) {
                if (side === 'buy') {
                    posSide = 'short';
                } else if (side === 'sell') {
                    posSide = 'long';
                }
            } else {
                if (side === 'buy') {
                    posSide = 'long';
                } else if (side === 'sell') {
                    posSide = 'short';
                }
            }
            request['posSide'] = posSide;
        }
        return this.extend (request, params);
    }

    createTriggerOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        const market = this.market (symbol);
        // todo finish implementation
        const request: Dict = {
            'instId': market['id'],
        };
        return this.extend (request, params);
    }

    handleTypePostOnlyAndTimeInForce (type: OrderType, params) {
        let postOnly = false;
        [ postOnly, params ] = this.handlePostOnly (type === 'market', type === 'post_only', params);
        if (postOnly) {
            type = 'post_only';
        }
        const timeInForce = this.handleTimeInForce (params);
        params = this.omit (params, 'timeInForce');
        if ((timeInForce !== undefined) && (timeInForce === 'IOC')) {
            type = 'ioc';
        }
        return [ type, params ];
    }

    async createMarketOrderWithCost (symbol: string, side: OrderSide, cost: number, params = {}) {
        /**
         * @method
         * @name createMarketOrderWithCost
         * @description create a market order by providing the symbol, side and cost
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} side 'buy' or 'sell'
         * @param {float} cost how much you want to trade in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        params = this.extend (params, { 'cost': cost });
        return await this.createOrder (symbol, 'market', side, 0, undefined, params);
    }

    async createMarketBuyOrderWithCost (symbol: string, cost: number, params = {}): Promise<Order> {
        /**
         * @method
         * @name createMarketBuyOrderWithCost
         * @description create a market buy order by providing the symbol and cost
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {float} cost how much you want to trade in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        params = this.extend (params, { 'cost': cost });
        return await this.createOrder (symbol, 'market', 'buy', 0, undefined, params);
    }

    async createMarketSellOrderWithCost (symbol: string, cost: number, params = {}): Promise<Order> {
        /**
         * @method
         * @name createMarketSellOrderWithCost
         * @description create a market sell order by providing the symbol and cost
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {float} cost how much you want to trade in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        params = this.extend (params, { 'cost': cost });
        return await this.createOrder (symbol, 'market', 'sell', 0, undefined, params);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        return order as Order;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let requestPath = path;
        if (method === 'GET') {
            const query = this.urlencode (params);
            if (query.length) {
                requestPath += '?' + query;
            }
        }
        const url = this.urls['api'][api] + '/' + requestPath;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ();
            const dateTime = this.iso8601 (timestamp);
            let payload = dateTime + method + '/' + requestPath;
            headers = {
                'DC-ACCESS-KEY': this.apiKey,
                'DC-ACCESS-TIMESTAMP': dateTime,
                'DC-ACCESS-PASSPHRASE': this.password,
            };
            if (method !== 'GET') {
                body = this.json (params);
                headers['Content-Type'] = 'application/json';
                payload += body;
            }
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'base64');
            headers['DC-ACCESS-SIGN'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
