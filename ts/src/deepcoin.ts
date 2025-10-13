
// ---------------------------------------------------------------------------

import Exchange from './abstract/deepcoin.js';
import { ArgumentsRequired } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import type { Dict, Int, Market, OHLCV, OrderBook, Str, Strings, Ticker, Tickers, Trade } from './base/types.js';

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
            'rateLimit': 50, // 20 times per second
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
                'createLimitBuyOrder': false,
                'createLimitOrder': false,
                'createLimitSellOrder': false,
                'createMarketBuyOrder': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrder': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrders': false,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLossOrder': false,
                'createTakeProfitOrder': false,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': false,
                'fetchAccounts': false,
                'fetchBalance': false,
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
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
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
                        'deepcoin/market/books': 1 / 2, // done
                        'deepcoin/market/candles': 1 / 2, // done
                        'deepcoin/market/instruments': 1 / 2, // done
                        'deepcoin/market/tickers': 1, // done
                        'deepcoin/market/index-candles': 1 / 2, // done
                        'deepcoin/market/trades': 1, // done
                        'deepcoin/market/mark-price-candles': 1 / 2, // done
                        'deepcoin/market/step-margin': 1,
                    },
                },
                'private': {
                    'get': {
                        'deepcoin/account/balances': 1,
                        'deepcoin/account/bills': 1,
                        'deepcoin/account/positions': 1,
                        'deepcoin/trade/fills': 1,
                        'deepcoin/trade/orderByID': 1,
                        'deepcoin/trade/finishOrderByID': 1,
                        'deepcoin/trade/orders-history': 1,
                        'deepcoin/trade/v2/orders-pending': 1,
                        'deepcoin/trade/funding-rate': 1,
                        'deepcoin/trade/fund-rate/current-funding-rate': 1,
                        'deepcoin/trade/fund-rate/history': 1,
                        'deepcoin/trade/trigger-orders-pending': 1,
                        'deepcoin/trade/trigger-orders-history': 1,
                        'deepcoin/copytrading/support-contracts': 1,
                        'deepcoin/copytrading/leader-position': 1,
                        'deepcoin/copytrading/estimate-profit': 1,
                        'deepcoin/copytrading/history-profit': 1,
                        'deepcoin/copytrading/follower-rank': 1,
                        'deepcoin/internal-transfer/support': 1,
                        'deepcoin/internal-transfer/history-order': 1,
                        'deepcoin/rebate/config': 1,
                        'deepcoin/agents/users': 1,
                        'deepcoin/agents/users/rebate-list': 1,
                        'deepcoin/agents/users/rebates': 1,
                        'deepcoin/asset/deposit-list': 1,
                        'deepcoin/asset/withdraw-list': 1,
                        'deepcoin/asset/recharge-chain-list': 1,
                    },
                    'post': {
                        'deepcoin/account/set-leverage': 1,
                        'deepcoin/trade/order': 1,
                        'deepcoin/trade/replace-order': 1,
                        'deepcoin/trade/cancel-order': 1,
                        'deepcoin/trade/batch-cancel-order': 1,
                        'deepcoin/trade/cancel-trigger-order': 1,
                        'deepcoin/trade/swap/cancel-all': 1,
                        'deepcoin/trade/trigger-order': 1,
                        'deepcoin/trade/batch-close-position': 1,
                        'deepcoin/trade/replace-order-sltp': 1,
                        'deepcoin/trade/close-position-by-ids': 1,
                        'deepcoin/copytrading/leader-settings': 1,
                        'deepcoin/copytrading/set-contracts': 1,
                        'deepcoin/internal-transfer': 1,
                        'deepcoin/rebate/config': 1,
                        'deepcoin/asset/transfer': 1,
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
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'recvWindow': 5000,
                'networks': {
                },
                'networksById': {
                },
                'fetchMarkets': {
                    'types': [ 'spot', 'swap' ], // spot, swap,
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
        const contract = swap;
        const baseId = this.safeString (market, 'baseCcy');
        const quoteId = this.safeString (market, 'quoteCcy', '');
        let settleId = undefined;
        let settle = undefined;
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = base + '/' + quote;
        if (contract) {
            settleId = this.safeString (market, 'quoteCcy'); // todo but I think that we use quoteId as settleId for swap markets
            settle = this.safeCurrencyCode (settleId);
            if (settle !== undefined) {
                symbol = symbol + ':' + settle;
            }
        }
        const fees = this.safeDict2 (this.fees, type, 'trading', {});
        let maxLeverage = this.safeString (market, 'lever', '1');
        maxLeverage = Precise.stringMax (maxLeverage, '1');
        const maxSpotCost = this.safeNumber (market, 'maxMktSz');
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
            'active': true,
            'contract': contract,
            'linear': swap ? (quoteId === settleId) : undefined,
            'inverse': swap ? (baseId === settleId) : undefined,
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
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': swap ? undefined : maxSpotCost,
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
        if (limit === undefined) {
            limit = 100; // default 100, max 300
        }
        const bar = this.safeString (this.timeframes, timeframe, timeframe);
        const request: Dict = {
            'instId': market['id'],
            'bar': bar,
            'limit': limit,
        };
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
        if (marketType === 'contract') {
            const defaultUnderlying = this.safeString (this.options, 'defaultUnderlying', 'BTC-USD');
            const currencyId = this.safeString2 (params, 'uly', 'marketId', defaultUnderlying);
            if (currencyId === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchTickers() requires an underlying uly or marketId parameter for options markets');
            } else {
                request['uly'] = currencyId;
            }
        }
        const response = await this.publicGetDeepcoinMarketTickers (this.extend (request, params));
        const tickers = this.safeList (response, 'data', []);
        return this.parseTickers (tickers, symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        // spot
        //     {
        //         "instId": "ETH-USDT",
        //         "tradeId": "1001056388761321",
        //         "px": "4095.66",
        //         "sz": "0.01311251",
        //         "side": "sell",
        //         "ts": "1760367870000"
        //     }
        //
        // swap
        //     {
        //         "instType": "SWAP",
        //         "instId": "1BTC-USD-SWAP",
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
        const spot = this.safeBool (market, 'spot', false);
        const quoteVolume = spot ? this.safeString (ticker, 'volCcy24h') : undefined;
        const baseVolume = this.safeString (ticker, 'vol24h');
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
     * @param {int} [limit] the maximum amount of trades to fetch
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
            productGroup = 'SwapU'; // todo 'SwapU' for USDT-margined
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
        //         "instId": "ETH-BTC",
        //         "side": "sell",
        //         "sz": "0.119501",
        //         "px": "0.07065",
        //         "tradeId": "15826757",
        //         "ts": "1621446178316"
        //     }
        //
        // swap: fetchTrades
        //
        //     {
        //         "instId": "ETH-USDT-SWAP",
        //         "tradeId": "1000296976413010",
        //         "px": "4119.32",
        //         "sz": "2",
        //         "side": "sell",
        //         "ts": "1760370136000"
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        let query: Str = undefined;
        query = this.urlencode (params);
        if (query.length !== 0) {
            url += '?' + query;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
