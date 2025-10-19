
// ---------------------------------------------------------------------------

import Exchange from './abstract/deepcoin.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Precise } from './base/Precise.js';
import type { Balances, Currency, Dict, FundingRate, FundingRates, int, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
import { ArgumentsRequired, BadRequest, ExchangeError, NotSupported } from '../ccxt.js';

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
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'cancelWithdraw': false,
                'closePosition': true,
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
                'fetchCanceledAndClosedOrders': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrder': true,
                'fetchClosedOrders': true,
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
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': true,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsForSymbol': true,
                'fetchPositionsHistory': true,
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
                'setLeverage': true,
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
                        'deepcoin/account/positions': 5, // done
                        'deepcoin/trade/fills': 5, // done
                        'deepcoin/trade/orderByID': 5, // done
                        'deepcoin/trade/finishOrderByID': 5, // done
                        'deepcoin/trade/orders-history': 5, // done
                        'deepcoin/trade/v2/orders-pending': 5, // done
                        'deepcoin/trade/funding-rate': 5, // not unified
                        'deepcoin/trade/fund-rate/current-funding-rate': 5, // done
                        'deepcoin/trade/fund-rate/history': 5, // done
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
                        'deepcoin/account/set-leverage': 5, // done
                        'deepcoin/trade/order': 5, // done
                        'deepcoin/trade/replace-order': 5,
                        'deepcoin/trade/cancel-order': 5, // done
                        'deepcoin/trade/batch-cancel-order': 5,
                        'deepcoin/trade/cancel-trigger-order': 1 / 6, // done
                        'deepcoin/trade/swap/cancel-all': 5, // done
                        'deepcoin/trade/trigger-order': 5,
                        'deepcoin/trade/batch-close-position': 5, // done
                        'deepcoin/trade/replace-order-sltp': 5,
                        'deepcoin/trade/close-position-by-ids': 5, // done
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
                    // {"code":"50","msg":"len(rows) expected(1) got(0) rows([])","data":null}
                    // {"code":"0","msg":"","data":{"ordId":"","clOrdId":"","sCode":"24","sMsg":"OrderNotFound:1"}}
                    // {"code":"0","msg":"","data":{"ordId":"","clOrdId":"","tag":"","sCode":"44","sMsg":"VolumeNotOnTick"}}
                    // {"code":"0","msg":"","data":{"ordId":"","clOrdId":"","tag":"","sCode":"31","sMsg":"NotEnoughPositionToClose:Position=0"}}
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

    setMarkets (markets, currencies = undefined) {
        markets = super.setMarkets (markets, currencies);
        const symbols = Object.keys (markets);
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = markets[symbol];
            if (market['swap']) {
                const additionalId = market['baseId'] + market['quoteId'];
                this.markets_by_id[additionalId] = [ market ]; // some endpoints return swap market id as base+quote
            }
        }
        return this.markets;
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
        const productGroup = this.getProductGroupFromMarket (market);
        request['productGroup'] = productGroup;
        params = this.omit (params, 'productGroup');
        const response = await this.publicGetDeepcoinMarketTrades (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    getProductGroupFromMarket (market: Market): string {
        let productGroup = 'Spot';
        if (market['swap']) {
            if (market['linear']) {
                productGroup = 'SwapU';
            } else {
                productGroup = 'Swap';
            }
        }
        return productGroup;
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
        // private fetchMyTrades
        //     {
        //         "instType": "SPOT",
        //         "instId": "ETH-USDT",
        //         "tradeId": "1001056429613610",
        //         "ordId": "1001435238208686",
        //         "clOrdId": "",
        //         "billId": "10010564296136101",
        //         "tag": "",
        //         "fillPx": "3791.15",
        //         "fillSz": "0.004",
        //         "side": "sell",
        //         "posSide": "",
        //         "execType": "",
        //         "feeCcy": "USDT",
        //         "fee": "0.0151646",
        //         "ts": "1760704540000"
        //     }
        //
        const marketId = this.safeString (trade, 'instId');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'ts');
        const side = this.safeString (trade, 'side');
        const execType = this.safeString (trade, 'execType');
        let fee = undefined;
        const feeCost = this.safeString (trade, 'fee');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeCcy');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': this.safeString (trade, 'tradeId'),
            'order': this.safeString (trade, 'ordId'),
            'type': undefined,
            'takerOrMaker': this.parseTakerOrMaker (execType),
            'side': side,
            'price': this.safeString2 (trade, 'fillPx', 'px'),
            'amount': this.safeString2 (trade, 'fillSz', 'sz'),
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    parseTakerOrMaker (execType: Str) {
        if (execType === undefined) {
            return undefined;
        }
        const types = {
            'T': 'taker',
            'M': 'maker',
        };
        return this.safeString (types, execType, execType);
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
            response = await this.privatePostDeepcoinTradeTriggerOrder (request);
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
            response = await this.privatePostDeepcoinTradeOrder (request);
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
         * @param {string} [params.marginMode] *swap only* 'cross' or 'isolated', the default is 'cash' for spot and 'cross' for swap
         * @param {string} [params.mrgPosition] *swap only* 'merge' or 'split', the default is 'merge'
         */
        const market = this.market (symbol);
        let orderType = type;
        [ orderType, params ] = this.handleTypePostOnlyAndTimeInForce (type, params);
        const request: Dict = {
            'instId': market['id'],
            // 'tdMode': 'cash', // 'cash' for spot, 'cross' or 'isolated' for swap
            // 'ccy': currency['id'], // only applicable to cross MARGIN orders in single-currency margin // todo check
            // 'clOrdId': clientOrderId,
            'side': side,
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
                if (!isMarketOrder) {
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
            let mrgPosition = 'merge';
            [ mrgPosition, params ] = this.handleOptionAndParams (params, 'createOrder', 'mrgPosition', mrgPosition);
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

    /**
     * @method
     * @name deepcoin#fetchClosedOrder
     * @description fetches information on a closed order made by the user
     * @see https://www.deepcoin.com/docs/DeepCoinTrade/finishOrderByID
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrder() requires a symbol argument');
        }
        const market = this.market (symbol);
        const request: Dict = {
            'instId': market['id'],
            'ordId': id,
        };
        const response = await this.privateGetDeepcoinTradeFinishOrderByID (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "instType": "SPOT",
        //                 "instId": "ETH-USDT",
        //                 "tgtCcy": "",
        //                 "ccy": "",
        //                 "ordId": "1001434573319675",
        //                 "clOrdId": "",
        //                 "tag": "",
        //                 "px": "4056.620000000000",
        //                 "sz": "0.004000",
        //                 "pnl": "0.000000",
        //                 "ordType": "market",
        //                 "side": "buy",
        //                 "posSide": "",
        //                 "tdMode": "cash",
        //                 "accFillSz": "0.004000",
        //                 "fillPx": "",
        //                 "tradeId": "",
        //                 "fillSz": "0.004000",
        //                 "fillTime": "1760619119000",
        //                 "avgPx": "",
        //                 "state": "filled",
        //                 "lever": "1.000000",
        //                 "tpTriggerPx": "",
        //                 "tpTriggerPxType": "",
        //                 "tpOrdPx": "",
        //                 "slTriggerPx": "",
        //                 "slTriggerPxType": "",
        //                 "slOrdPx": "",
        //                 "feeCcy": "USDT",
        //                 "fee": "0.000004",
        //                 "rebateCcy": "",
        //                 "source": "",
        //                 "rebate": "",
        //                 "category": "normal",
        //                 "uTime": "1760619119000",
        //                 "cTime": "1760619119000"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const entry = this.safeDict (data, 0, {});
        return this.parseOrder (entry, market);
    }

    /**
     * @method
     * @name deepcoin#fetchOpenOrder
     * @description fetch an open order by it's id
     * @see https://www.deepcoin.com/docs/DeepCoinTrade/orderByID
     * @param {string} id order id
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrder() requires a symbol argument');
        }
        const market = this.market (symbol);
        const request: Dict = {
            'instId': market['id'],
            'ordId': id,
        };
        const response = await this.privateGetDeepcoinTradeOrderByID (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        if (data.length === 0) {
            return undefined;
        }
        const entry = this.safeDict (data, 0, {});
        return this.parseOrder (entry, market);
    }

    /**
     * @method
     * @name deepcoin#fetchCanceledAndClosedOrders
     * @see https://www.deepcoin.com/docs/DeepCoinTrade/ordersHistory
     * @description fetches information on multiple canceled and closed orders made by the user
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', the market type for the orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledAndClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let methodName = 'fetchCanceledAndClosedOrders';
        [ methodName, params ] = this.handleParamString (params, 'methodName', methodName);
        let market: Market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instId'] = market['id'];
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams (methodName, market, params, marketType);
        request['instType'] = this.convertToInstrumentType (marketType);
        if (limit !== undefined) {
            request['limit'] = limit; // default 100
        }
        // todo handle with since, until and pagination
        const response = await this.privateGetDeepcoinTradeOrdersHistory (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name deepcoin#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://www.deepcoin.com/docs/DeepCoinTrade/ordersHistory
     * @param {string} symbol unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', the market type for the orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const methodName = 'fetchCanceledOrders';
        params = this.extend (params, { 'methodName': methodName });
        params = this.extend (params, { 'state': 'canceled' });
        return await this.fetchCanceledAndClosedOrders (symbol, since, limit, params);
    }

    /**
     * @method
     * @name deepcoin#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://www.deepcoin.com/docs/DeepCoinTrade/ordersHistory
     * @param {string} symbol unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', the market type for the orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const methodName = 'fetchClosedOrders';
        params = this.extend (params, { 'methodName': methodName });
        params = this.extend (params, { 'state': 'filled' });
        return await this.fetchCanceledAndClosedOrders (symbol, since, limit, params);
    }

    /**
     * @method
     * @name deepcoin#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://www.deepcoin.com/docs/DeepCoinTrade/ordersPendingV2
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.index] pagination index, default is 1
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        const market = this.market (symbol);
        const index = this.safeInteger (params, 'index', 1); // todo add pagination handling
        const request: Dict = {
            'instId': market['id'],
            'index': index,
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 30, max 100
        }
        const response = await this.privateGetDeepcoinTradeV2OrdersPending (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "instType": "SPOT",
        //                 "instId": "ETH-USDT",
        //                 "tgtCcy": "",
        //                 "ccy": "",
        //                 "ordId": "1001435158096314",
        //                 "clOrdId": "",
        //                 "tag": "",
        //                 "px": "1000.000000000000",
        //                 "sz": "0.004000",
        //                 "pnl": "0.000000",
        //                 "ordType": "limit",
        //                 "side": "buy",
        //                 "posSide": "",
        //                 "tdMode": "cash",
        //                 "accFillSz": "0.000000",
        //                 "fillPx": "",
        //                 "tradeId": "",
        //                 "fillSz": "0.000000",
        //                 "fillTime": "1760695267000",
        //                 "avgPx": "",
        //                 "state": "live",
        //                 "lever": "1",
        //                 "tpTriggerPx": "",
        //                 "tpTriggerPxType": "",
        //                 "tpOrdPx": "",
        //                 "slTriggerPx": "",
        //                 "slTriggerPxType": "",
        //                 "slOrdPx": "",
        //                 "feeCcy": "USDT",
        //                 "fee": "0.000000",
        //                 "rebateCcy": "",
        //                 "source": "",
        //                 "rebate": "",
        //                 "category": "normal",
        //                 "uTime": "1760695267000",
        //                 "cTime": "1760695267000"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name deepcoin#cancelOrder
     * @description cancels an open order
     * @see https://www.deepcoin.com/docs/DeepCoinTrade/cancelOrder
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order (default false)
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        const market = this.market (symbol);
        const request: Dict = {
            'instId': market['id'],
            'ordId': id,
        };
        let response = undefined;
        const trigger = this.safeBool (params, 'trigger', false);
        if (trigger) {
            params = this.omit (params, 'trigger');
            response = await this.privatePostDeepcoinTradeCancelTriggerOrder (this.extend (request, params));
        } else {
            response = await this.privatePostDeepcoinTradeCancelOrder (this.extend (request, params));
        }
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name deepcoin#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://www.deepcoin.com/docs/DeepCoinTrade/cancelAllOrder
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] *swap only* 'cross' or 'isolated', the default is 'cash' for spot and 'cross' for swap
     * @param {boolean} [params.merged] *swap only* true for merged positions, false for split positions (default true)
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        const market = this.market (symbol);
        if (market['spot']) {
            throw new NotSupported (this.id + ' cancelAllOrders() is not supported for spot markets');
        }
        const productGroup = this.getProductGroupFromMarket (market);
        const marginMode = this.safeString (params, 'marginMode');
        let encodedMarginMode = 1;
        if (marginMode !== undefined) {
            params = this.omit (params, 'marginMode');
            if (marginMode === 'isolated') {
                encodedMarginMode = 0;
            }
        }
        let merged = true;
        [ merged, params ] = this.handleOptionAndParams (params, 'cancelAllOrders', 'merged', merged);
        const request: Dict = {
            'InstrumentID': market['id'],
            'ProductGroup': productGroup,
            'IsCrossMargin': encodedMarginMode,
            'IsMergeMode': merged ? 1 : 0,
        };
        const response = await this.privatePostDeepcoinTradeSwapCancelAll (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //     {
        //         "instType": "SPOT",
        //         "instId": "ETH-USDT",
        //         "tgtCcy": "",
        //         "ccy": "",
        //         "ordId": "1001434573319675",
        //         "clOrdId": "",
        //         "tag": "",
        //         "px": "4056.620000000000",
        //         "sz": "0.004000",
        //         "pnl": "0.000000",
        //         "ordType": "market",
        //         "side": "buy",
        //         "posSide": "",
        //         "tdMode": "cash",
        //         "accFillSz": "0.004000",
        //         "fillPx": "",
        //         "tradeId": "",
        //         "fillSz": "0.004000",
        //         "fillTime": "1760619119000",
        //         "avgPx": "",
        //         "state": "filled",
        //         "lever": "1.000000",
        //         "tpTriggerPx": "",
        //         "tpTriggerPxType": "",
        //         "tpOrdPx": "",
        //         "slTriggerPx": "",
        //         "slTriggerPxType": "",
        //         "slOrdPx": "",
        //         "feeCcy": "USDT",
        //         "fee": "0.000004",
        //         "rebateCcy": "",
        //         "source": "",
        //         "rebate": "",
        //         "category": "normal",
        //         "uTime": "1760619119000",
        //         "cTime": "1760619119000"
        //     }
        //
        const marketId = this.safeString (order, 'instId');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (order, 'cTime');
        const state = this.safeString (order, 'state');
        const orderType = this.safeString (order, 'ordType');
        let average = this.safeString (order, 'avgPx');
        if (average === '') {
            average = undefined;
        }
        const feeCurrencyId = this.safeString (order, 'feeCcy');
        let fee = undefined;
        if (feeCurrencyId !== undefined) {
            const feeCost = this.safeString (order, 'fee');
            fee = {
                'cost': this.parseNumber (feeCost),
                'currency': this.safeCurrencyCode (feeCurrencyId),
            };
        }
        return this.safeOrder ({
            'id': this.safeString (order, 'ordId'),
            'clientOrderId': this.safeString (order, 'clOrdId'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.safeInteger (order, 'uTime'),
            'status': this.parseOrderStatus (state),
            'symbol': market['symbol'],
            'type': this.parseOrderType (orderType),
            'timeInForce': this.parseOrderTimeInForce (orderType),
            'side': this.safeString (order, 'side'),
            'price': this.safeString (order, 'px'),
            'average': average,
            'amount': this.safeString (order, 'sz'),
            'filled': this.safeString (order, 'accFillSz'),
            'remaining': undefined,
            'triggerPrice': undefined, // todo check for trigger orders
            'takeProfitPrice': this.safeString (order, 'tpTriggerPx'),
            'stopLossPrice': this.safeString (order, 'slTriggerPx'),
            'cost': undefined,
            'trades': undefined, // todo check
            'fee': fee,
            'reduceOnly': undefined,
            'postOnly': orderType ? (orderType === 'post_only') : undefined,
            'info': order,
        }, market);
    }

    parseOrderStatus (status: Str): Str {
        const statuses = {
            'live': 'open',
            'filled': 'closed',
            'canceled': 'canceled',
            'partially_filled': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type: Str): Str {
        const types = {
            'limit': 'limit',
            'market': 'market',
            'post_only': 'limit',
            'ioc': 'market',
        };
        return this.safeString (types, type, type);
    }

    parseOrderTimeInForce (type: Str): Str {
        const timeInForces = {
            'post_only': 'PO',
            'ioc': 'IOC',
            'limit': 'GTC',
            'market': 'GTC',
        };
        return this.safeString (timeInForces, type, type);
    }

    /**
     * @method
     * @description fetch open positions for a single market
     * @name deepcoin#fetchPositionsForSymbol
     * @see https://www.deepcoin.com/docs/DeepCoinAccount/accountPositions
     * @description fetch all open positions for specific symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositionsForSymbol (symbol: string, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const instrumentType = this.convertToInstrumentType (market['type']);
        const request: Dict = {
            'instType': instrumentType,
            'instId': market['id'],
        };
        const response = await this.privateGetDeepcoinAccountPositions (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        return this.parsePositions (data, [ market['symbol'] ]);
    }

    /**
     * @method
     * @name deepcoin#fetchPositions
     * @description fetch all open positions
     * @see https://www.deepcoin.com/docs/DeepCoinAccount/accountPositions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true);
        let marketType = 'swap';
        let market: Market = undefined;
        if (symbols !== undefined) {
            const firstSymbol = this.safeString (symbols, 0);
            market = this.market (firstSymbol);
        }
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchPositions', market, params, marketType);
        const instrumentType = this.convertToInstrumentType (marketType);
        const request: Dict = {
            'instType': instrumentType,
        };
        const response = await this.privateGetDeepcoinAccountPositions (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "instType": "SWAP",
        //                 "mgnMode": "cross",
        //                 "instId": "DOGE-USDT-SWAP",
        //                 "posId": "1001110099878275",
        //                 "posSide": "long",
        //                 "pos": "20",
        //                 "avgPx": "0.18408",
        //                 "lever": "75",
        //                 "liqPx": "0.00001",
        //                 "useMargin": "0.049088",
        //                 "mrgPosition": "merge",
        //                 "ccy": "USDT",
        //                 "uTime": "1760709419000",
        //                 "cTime": "1760709419000"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parsePositions (data, symbols);
    }

    parsePosition (position: Dict, market: Market = undefined): Position {
        //
        //     {
        //         "instType": "SWAP",
        //         "mgnMode": "cross",
        //         "instId": "DOGE-USDT-SWAP",
        //         "posId": "1001110099878275",
        //         "posSide": "long",
        //         "pos": "20",
        //         "avgPx": "0.18408",
        //         "lever": "75",
        //         "liqPx": "0.00001",
        //         "useMargin": "0.049088",
        //         "mrgPosition": "merge",
        //         "ccy": "USDT",
        //         "uTime": "1760709419000",
        //         "cTime": "1760709419000"
        //     }
        //
        const marketId = this.safeString (position, 'instId');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (position, 'cTime');
        return this.safePosition ({
            'symbol': market['symbol'],
            'id': this.safeString (position, 'posId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'contracts': this.safeString (position, 'pos'),
            'contractSize': undefined,
            'side': this.safeString (position, 'posSide'),
            'notional': undefined,
            'leverage': this.omitZero (this.safeString (position, 'lever')),
            'unrealizedPnl': undefined,
            'realizedPnl': undefined,
            'collateral': undefined,
            'entryPrice': this.safeString (position, 'avgPx'),
            'markPrice': undefined,
            'liquidationPrice': this.safeString (position, 'liqPx'),
            'marginMode': this.safeString (position, 'mgnMode'),
            'hedged': true, // todo check
            'maintenanceMargin': this.safeString (position, 'useMargin'),
            'maintenanceMarginPercentage': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'marginRatio': undefined,
            'lastUpdateTimestamp': this.safeInteger (position, 'uTime'),
            'lastPrice': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
            'percentage': undefined,
            'info': position,
        });
    }

    /**
     * @method
     * @name deepcoin#setLeverage
     * @description set the level of leverage for a market
     * @see https://www.deepcoin.com/docs/DeepCoinAccount/accountSetLeverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' (default is cross)
     * @param {string} [params.mrgPosition] 'merge' or 'split', default is merge
     * @returns {object} response from the exchange
     */
    async setLeverage (leverage: int, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        if (leverage < 1) {
            throw new BadRequest (this.id + ' setLeverage() leverage should be minimum 1');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let marginMode = 'cross';
        [ marginMode, params ] = this.handleMarginModeAndParams ('setLeverage', params, marginMode);
        if ((marginMode !== 'cross') && (marginMode !== 'isolated')) {
            throw new BadRequest (this.id + ' setLeverage() requires a marginMode parameter that must be either cross or isolated');
        }
        let mrgPosition = 'merge';
        [ mrgPosition, params ] = this.handleOptionAndParams (params, 'setLeverage', 'mrgPosition', mrgPosition);
        if (mrgPosition !== 'merge' && mrgPosition !== 'split') {
            throw new BadRequest (this.id + ' setLeverage() mrgPosition parameter must be either merge or split');
        }
        const request: Dict = {
            'lever': leverage,
            'mgnMode': marginMode,
            'instId': market['id'],
            'mrgPosition': mrgPosition,
        };
        const response = await this.privatePostDeepcoinAccountSetLeverage (this.extend (request, params));
        //
        //     {
        //         code: '0',
        //         msg: '',
        //         data: {
        //             instId: 'ETH-USDT-SWAP',
        //             lever: '2',
        //             mgnMode: 'cross',
        //             mrgPosition: 'merge',
        //             sCode: '0',
        //             sMsg: ''
        //         }
        //     }
        //
        return response;
    }

    /**
     * @method
     * @name deepcoin#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://www.deepcoin.com/docs/DeepCoinTrade/currentFundRate
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexed by market symbols
     */
    async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, 'swap', true, true, true);
        let subType = 'linear';
        let firstMarket: Market = undefined;
        if (symbols !== undefined) {
            const firstSymbol = this.safeString (symbols, 0);
            firstMarket = this.market (firstSymbol);
        }
        [ subType, params ] = this.handleSubTypeAndParams ('fetchFundingRates', firstMarket, params, subType);
        let instType = 'SwapU';
        if (subType === 'inverse') {
            instType = 'Swap';
        } else if (subType !== 'linear') {
            throw new BadRequest (this.id + ' fetchFundingRates() subType parameter must be either linear or inverse');
        }
        const request: Dict = {
            'instType': instType,
        };
        const response = await this.privateGetDeepcoinTradeFundRateCurrentFundingRate (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": {
        //             "current_fund_rates": [
        //                 {
        //                     "instrumentId": "SPKUSDT",
        //                     "fundingRate": 0.00005
        //                 },
        //                 {
        //                     "instrumentId": "LAUNCHCOINUSDT",
        //                     "fundingRate": 0.00005
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const rates = this.safeList (data, 'current_fund_rates', []);
        return this.parseFundingRates (rates, symbols);
    }

    /**
     * @method
     * @name deepcoin#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://www.deepcoin.com/docs/DeepCoinTrade/currentFundRate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new ExchangeError (this.id + ' fetchFundingRate() is only valid for swap markets');
        }
        const request: Dict = {
            'instId': market['id'],
            'instType': this.getProductGroupFromMarket (market),
        };
        const response = await this.privateGetDeepcoinTradeFundRateCurrentFundingRate (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": {
        //             "current_fund_rates": [
        //                 {
        //                     "instrumentId": "ETHUSDT",
        //                     "fundingRate": 0.0000402356250176
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const rates = this.safeList (data, 'current_fund_rates', []);
        const entry = this.safeDict (rates, 0, {});
        return this.parseFundingRate (entry, market);
    }

    parseFundingRate (contract, market: Market = undefined): FundingRate {
        //
        //     {
        //         "instrumentId": "ETHUSDT",
        //         "fundingRate": 0.0000402356250176
        //     }
        //
        const marketId = this.safeString2 (contract, 'instrumentId', 'instrumentID');
        const symbol = this.safeSymbol (marketId, market);
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber (contract, 'fundingRate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': undefined,
        } as FundingRate;
    }

    /**
     * @method
     * @name okx#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://www.deepcoin.com/docs/DeepCoinTrade/fundingRateHistory
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.page] pagination page number
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instId': market['id'],
        };
        if (limit !== undefined) {
            request['size'] = limit; // default 20, max 100
        }
        const response = await this.privateGetDeepcoinTradeFundRateHistory (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": {
        //             "rows": [
        //                 {
        //                     "instrumentID": "ETHUSD",
        //                     "rate": "0.00046493",
        //                     "CreateTime": 1760860800,
        //                     "ratePeriodSec": 0
        //                 },
        //                 {
        //                     "instrumentID": "ETHUSD",
        //                     "rate": "0.00047949",
        //                     "CreateTime": 1760832000,
        //                     "ratePeriodSec": 0
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const rows = this.safeList (data, 'rows', []);
        return this.parseFundingRateHistories (rows, market, since, limit);
    }

    parseFundingRateHistory (info, market: Market = undefined) {
        //
        //     {
        //         "instrumentID": "ETHUSD",
        //         "rate": "0.00047949",
        //         "CreateTime": 1760832000,
        //         "ratePeriodSec": 0
        //     }
        //
        const timestamp = this.safeTimestamp (info, 'CreateTime');
        const instrumentID = this.safeString2 (info, 'instrumentID', 'instrumentId');
        market = this.safeMarket (instrumentID, market, undefined, 'swap');
        return {
            'info': info,
            'symbol': market['symbol'],
            'fundingRate': this.safeNumber (info, 'rate'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    /**
     * @method
     * @name deepcoin#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://www.deepcoin.com/docs/DeepCoinTrade/tradeFills
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch
     * @param {string} [params.type] 'spot' or 'swap', the market type for the trades (default is 'spot')
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params, marketType);
        const request: Dict = {
            'instType': this.convertToInstrumentType (marketType),
        };
        if (market !== undefined) {
            request['instId'] = market['id'];
        }
        if (since !== undefined) {
            request['begin'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['end'] = until;
        }
        const response = await this.privateGetDeepcoinTradeFills (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "instType": "SPOT",
        //                 "instId": "ETH-USDT",
        //                 "tradeId": "1001056429613610",
        //                 "ordId": "1001435238208686",
        //                 "clOrdId": "",
        //                 "billId": "10010564296136101",
        //                 "tag": "",
        //                 "fillPx": "3791.15",
        //                 "fillSz": "0.004",
        //                 "side": "sell",
        //                 "posSide": "",
        //                 "execType": "",
        //                 "feeCcy": "USDT",
        //                 "fee": "0.0151646",
        //                 "ts": "1760704540000"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    /**
     * @method
     * @name binance#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://www.deepcoin.com/docs/DeepCoinTrade/tradeFills
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', the market type for the trades
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const marketType = this.safeString (params, 'type');
        if (symbol === undefined && marketType === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderTrades requires a symbol argument or a market type in the params');
        }
        params = this.extend ({ 'ordId': id }, params);
        return await this.fetchMyTrades (symbol, since, limit, params);
    }

    /**
     * @method
     * @name deepcoin#closePosition
     * @description closes open positions for a market
     * @see https://www.deepcoin.com/docs/DeepCoinTrade/batchClosePosition
     * @see https://www.deepcoin.com/docs/DeepCoinTrade/closePositionByIds
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} [side] not used by deepcoin
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.positionId] the id of the position you would like to close
     * @param {string[]|undefined} [params.positionIds] list of position ids to close (for batch closing)
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const productGroup = this.getProductGroupFromMarket (market);
        const positionId = this.safeString (params, 'positionId');
        const positionIds = this.safeList (params, 'positionIds');
        const request: Dict = {
            'instId': market['id'],
            'productGroup': productGroup,
        };
        let response = undefined;
        if (positionId === undefined && positionIds === undefined) {
            response = await this.privatePostDeepcoinTradeBatchClosePosition (this.extend (request, params));
        } else {
            if (positionId !== undefined) {
                params = this.omit (params, 'positionId');
                request['positionIds'] = [ positionId ];
            }
            response = await this.privatePostDeepcoinTradeClosePositionByIds (this.extend (request, params));
        }
        const data = this.safeList (response, 'data', []);
        return this.parseOrder (data, market);
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
