import Exchange from './abstract/drift.js';
import type {
    Int,
    OrderSide,
    OrderType,
    Trade,
    OHLCV,
    Order,
    OrderBook,
    Balances,
    Str,
    Ticker,
    Tickers,
    Strings,
    Market,
    Num,
    Dict,
    int,
    Position,
    Currencies,
    Currency,
    Transaction,
    LedgerEntry,
    FundingHistory,
} from './base/types.js';
import {
    NotSupported,
    ArgumentsRequired,
    InsufficientFunds,
    OrderNotFound,
} from './base/errors.js';
import { eddsa } from './base/functions/crypto.js';
import { ed25519 } from './static_dependencies/noble-curves/ed25519.js';
import { base58 } from './static_dependencies/scure-base/index.js'; // adjust path
import { Precise } from './base/Precise.js';

export default class drift extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'drift',
            'name': 'Drift Protocol',
            'countries': [],
            'version': 'v1',
            'rateLimit': 250,
            'certified': false,
            'pro': false,
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'accountId': true,
                'privateKey': true,
            },
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'deposit': true,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingHistory': true,
                'fetchFundingLimits': false,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': true,
                'fetchWithdrawals': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '1h': '60',
                '4h': '240',
                '1d': 'D',
                '1w': 'W',
                '1M': 'M',
            },
            'urls': {
                'logo': 'https://app.drift.trade/assets/icons/text-logo-light-theme.svg',
                'api': {
                    'public': 'https://data.api.drift.trade',
                    'dlob': 'https://dlob.drift.trade',
                },
                'www': 'https://app.drift.trade',
                'doc': [
                    'https://docs.drift.trade',
                    'https://data.api.drift.trade/playground',
                ],
                'fees': 'https://docs.drift.trade/trading/trading-fees',
            },
            'api': {
                'public': {
                    'get': [
                        'user/{accountId}',
                        'user/{accountId}/trades',
                        'user/{accountId}/trades/{symbol}',
                        'user/{accountId}/orders/id/{orderId}',
                        'user/{accountId}/settlePnl',
                        'user/{accountId}/deposits',
                        'user/{accountId}/orders/perp',
                        'user/{accountId}/orders/perp/{symbol}',
                        'user/{accountId}/orders/perp/id/{orderId}',
                        'user/{accountId}/fundingPayments',
                        'market/{symbol}/trades',
                        'market/{symbol}/candles/{resolution}',
                        'stats/markets',
                    ],
                    'post': [
                        'tx/order/place',
                        'tx/order/cancel',
                        'tx/execute',
                        'tx/deposit',
                        'tx/withdraw',
                    ],
                },
                'dlob': {
                    'get': [
                        'l2',
                        'batchL2',
                    ],
                },
            },
            'exceptions': {
                'exact': {
                    'ValidationError': ArgumentsRequired,
                    'InsufficientCollateral': InsufficientFunds,
                    '6003': InsufficientFunds,
                },
                'broad': {},
            },
        });
    }

    /**
     * @param params
     * @method
     * @name drift#fetchMarkets
     * @description retrieves data on all markets for drift
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetStatsMarkets (params);
        const allMarkets = this.safeValue (response, 'markets', []);
        const result: Market[] = [];
        for (let i = 0; i < allMarkets.length; i++) {
            const market = allMarkets[i];
            const marketType = this.safeString (market, 'marketType');
            // Only include perp markets
            if (marketType !== 'perp') {
                continue;
            }
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = quote;
            const symbol = base + '/' + quote + ':' + settle;
            const status = this.safeString (market, 'status');
            const activeStatuses = [ 'active', 'fundingPaused', 'ammPaused' ];
            const active = activeStatuses.includes (status);
            const limits = this.safeValue (market, 'limits', {});
            const leverageLimits = this.safeValue (limits, 'leverage', {});
            const amountLimits = this.safeValue (limits, 'amount', {});
            const fees = this.safeValue (market, 'fees', {});
            const precision = this.safeInteger (market, 'precision');
            result.push (this.safeMarketStructure ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': quoteId,
                'type': 'swap',
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'active': active,
                'contract': true,
                'linear': true,
                'inverse': false,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'maker': this.safeNumber (fees, 'maker'),
                'taker': this.safeNumber (fees, 'taker'),
                'precision': {
                    'amount': precision,
                    'price': precision,
                },
                'limits': {
                    'leverage': {
                        'min': this.safeNumber (leverageLimits, 'min', 1),
                        'max': this.safeNumber (leverageLimits, 'max', 1),
                    },
                    'amount': {
                        'min': this.safeNumber (amountLimits, 'min'),
                        'max': this.safeNumber (amountLimits, 'max'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': market,
            }));
        }
        return result;
    }

    /**
     * @method
     * @name drift#fetchCurrencies
     * @description fetches all available currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Currencies} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetStatsMarkets (params);
        const markets = this.safeValue (response, 'markets', []);
        const result: Dict = {};
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const marketType = this.safeString (market, 'marketType');
            if (marketType !== 'spot') {
                continue;
            }
            const symbol = this.safeString (market, 'symbol');
            const status = this.safeString (market, 'status');
            const limits = this.safeValue (market, 'limits', {});
            const depositLimits = this.safeValue (limits, 'deposit', {});
            const withdrawLimits = this.safeValue (limits, 'withdraw', {});
            const withdrawEnabled = status !== 'withdrawPaused';
            const isActive = status === 'active';
            result[symbol] = this.safeCurrencyStructure ({
                'id': this.safeString (market, 'marketIndex'),
                'code': this.safeString (market, 'symbol'),
                'info': market,
                'active': isActive,
                'deposit': true,
                'withdraw': withdrawEnabled,
                'fee': undefined,
                'precision': this.safeInteger (market, 'precision'),
                'limits': {
                    'deposit': {
                        'min': this.safeNumber (depositLimits, 'min'),
                        'max': this.safeNumber (depositLimits, 'max'),
                    },
                    'withdraw': {
                        'min': this.safeNumber (withdrawLimits, 'min'),
                        'max': this.safeNumber (withdrawLimits, 'max'),
                    },
                },
                'networks': {},
            });
        }
        return result;
    }

    /**
     * @method
     * @name drift#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketType = market['swap'] ? 'perp' : 'spot';
        const request: Dict = {
            'marketName': market['id'],
            'marketType': marketType,
            'depth': 1,
        };
        const promises = [
            this.dlobGetL2 (this.extend (request, params)), // top of book from dlob
            this.publicGetStatsMarkets (), // 24h stats
        ];
        const responses = await Promise.all (promises);
        const dlobl2 = responses[0];
        const timestamp = this.safeInteger (dlobl2, 'ts');
        const bids = this.safeValue (dlobl2, 'bids', []);
        const asks = this.safeValue (dlobl2, 'asks', []);
        const bestBid = (bids.length > 0) ? this.parseBidAsk (bids[0]) : [];
        const bestAsk = (asks.length > 0) ? this.parseBidAsk (asks[0]) : [];
        let bidPrice = undefined;
        let bidVolume = undefined;
        if (bestBid.length > 1) {
            bidPrice = bestBid[0];
            bidVolume = bestBid[1];
        }
        let askPrice = undefined;
        let askVolume = undefined;
        if (bestAsk.length > 1) {
            askPrice = bestAsk[0]
            askVolume = bestAsk[1];
        }
        const marketsStats = this.safeValue (responses[1], 'markets', []);
        const stats = this.findMarketStat (marketsStats, market['id']);
        const last = this.safeNumber (stats, 'price');
        const priceHighObj = this.safeValue (stats, 'priceHigh');
        const priceLowObj = this.safeValue (stats, 'priceLow');
        const priceHigh = this.safeNumber (priceHighObj, 'fill');
        const priceLow = this.safeNumber (priceLowObj, 'fill');
        return this.safeTicker (
            {
                'symbol': market['symbol'],
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'high': priceHigh,
                'low': priceLow,
                'bid': bidPrice,
                'bidVolume': bidVolume,
                'ask': askPrice,
                'askVolume': askVolume,
                'close': last,
                'last': last,
                'change': this.safeNumber (stats, 'priceChange24h'),
                'percentage': this.safeNumber (stats, 'price24hChangePct'),
                'baseVolume': this.safeNumber (stats, 'baseVolume'),
                'quoteVolume': this.safeNumber (stats, 'quoteVolume'),
                'markPrice': this.safeNumber (stats, 'markPrice'),
                'info': this.deepExtend (dlobl2, stats),
            },
            market
        );
    }

    findMarketStat (stats: any[], marketId: string): Dict {
        for (let i = 0; i < stats.length; i++) {
            const entry = stats[i];
            const name = this.safeString2 (entry, 'marketName', 'symbol');
            if (name === marketId) {
                return entry;
            }
        }
        return {};
    }

    /**
     * @method
     * @name drift#fetchTickers
     * @description fetches a price ticker for a specific symbol
     * @param {string} [symbols] unified market symbol of the market the orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (
        symbols: Strings = undefined,
        params = {}
    ): Promise<Tickers> {
        await this.loadMarkets ();
        const marketIds = this.marketIds (symbols);
        const depthParam = this.safeString (params, 'depth', '1'); // default is 1
        let depth = '';
        if (depthParam.indexOf (',') >= 0) {
            depth = depthParam;
        } else {
            depth = marketIds.map (() => depthParam).join (',');
        }
        params = this.omit (params, 'depth');
        const request: Dict = {
            'marketName': marketIds.join (','),
            'depth': depth,
        };
        const promises = [
            this.dlobGetBatchL2 (this.extend (request, params)),
            this.publicGetStatsMarkets (),
        ];
        const responses = await Promise.all (promises);
        const statsArray = this.safeValue (responses[1], 'markets', []);
        const statsById: Dict = {};
        for (let i = 0; i < statsArray.length; i++) {
            const s = statsArray[i];
            const name = this.safeString2 (s, 'marketName', 'symbol');
            if (name !== undefined) {
                statsById[name] = s;
            }
        }
        const result: Dict = {};
        const books = this.safeValue (responses[0], 'l2s', responses[0]);
        const booksArray = Array.isArray (books)
            ? books
            : Object.keys (books).map ((key) => {
                const entry = books[key];
                if (entry === undefined) {
                    return { 'marketName': key };
                }
                entry['marketName'] = this.safeString (entry, 'marketName', key);
                return entry;
            });
        for (let i = 0; i < booksArray.length; i++) {
            const book = booksArray[i];
            const marketId = this.safeString2 (book, 'marketName', 'symbol');
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const bids = this.safeValue (book, 'bids', []);
            const asks = this.safeValue (book, 'asks', []);
            const bestBid = (bids.length > 0) ? this.parseBidAsk (bids[0]) : [];
            const bestAsk = (asks.length > 0) ? this.parseBidAsk (asks[0]) : [];
            let bidPrice = undefined;
            let bidVolume = undefined;
            if (bestBid.length > 1) {
                bidPrice = bestBid[0];
                bidVolume = bestBid[1];
            }
            let askPrice = undefined;
            let askVolume = undefined;
            if (bestAsk.length > 1) {
                askPrice = bestAsk[0]
                askVolume = bestAsk[1];
            }
            const marketStats = this.safeValue (statsById, marketId, {});
            const last = this.safeNumber (marketStats, 'price');
            const priceHighObj = this.safeValue (marketStats, 'priceHigh');
            const priceLowObj = this.safeValue (marketStats, 'priceLow');
            const priceHigh = this.safeNumber (priceHighObj, 'fill');
            const priceLow = this.safeNumber (priceLowObj, 'fill');
            const ts = this.safeInteger (book, 'ts');
            result[symbol] = this.safeTicker (
                {
                    'symbol': symbol,
                    'timestamp': ts,
                    'datetime': this.iso8601 (ts),
                    'high': priceHigh,
                    'low': priceLow,
                    'bid': bidPrice,
                    'bidVolume': bidVolume,
                    'ask': askPrice,
                    'askVolume': askVolume,
                    'close': last,
                    'last': last,
                    'change': this.safeNumber (marketStats, 'priceChange24h'),
                    'percentage': this.safeNumber (marketStats, 'price24hChangePct'),
                    'baseVolume': this.safeNumber (marketStats, 'baseVolume'),
                    'quoteVolume': this.safeNumber (marketStats, 'quoteVolume'),
                    'markPrice': this.safeNumber (marketStats, 'markPrice'),
                    'info': this.deepExtend (book, marketStats),
                },
                market
            );
        }
        return result;
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        return this.safeTicker (
            {
                'symbol': symbol,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'high': this.safeString (ticker, 'high'),
                'low': this.safeString (ticker, 'low'),
                'bid': this.safeString (ticker, 'bid'),
                'bidVolume': undefined,
                'ask': this.safeString (ticker, 'ask'),
                'askVolume': this.safeString (ticker, 'askVolume'),
                'vwap': this.safeString (ticker, 'vwap'),
                'open': this.safeString (ticker, 'open'),
                'close': this.safeString (ticker, 'last'),
                'last': this.safeString (ticker, 'last'),
                'previousClose': undefined,
                'change': this.safeString (ticker, 'change'),
                'percentage': this.safeString (ticker, 'percentage'),
                'average': undefined,
                'baseVolume': this.safeString (ticker, 'volume'),
                'quoteVolume': this.safeString (ticker, 'quoteVolume'),
                'info': ticker,
            },
            market
        );
    }

    /**
     * @method
     * @name drift#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (
        symbol: string,
        limit: Int = undefined,
        params = {}
    ): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'marketName': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = Math.min (limit, 100);
        }
        const response = await this.dlobGetL2 (this.extend (request, params));
        //
        // {
        //     "bids": [
        //         {
        //             "price": "1896967924",
        //             "size": "207000000",
        //             "sources": {
        //                 "dlob": "207000000"
        //             }
        //         }
        //     ],
        //     "asks": [
        //         {
        //             "price": "1900240000",
        //             "size": "2631000000",
        //             "sources": {
        //                 "vamm": "2631000000"
        //             }
        //         }
        //     ],
        //     "marketName": "ETH-PERP",
        //     "marketType": "perp",
        //     "marketIndex": 2,
        //     "ts": 1770340556873,
        //     "slot": 398339101,
        //     "markPrice": "1898603962",
        //     "bestBidPrice": "1896967924",
        //     "bestAskPrice": "1900240000",
        //     "spreadPct": "172341",
        //     "spreadQuote": "3272076",
        //     "oracle": 1900078085,
        //     "oracleData": {
        //         "price": "1900078085",
        //         "slot": "398339102",
        //         "confidence": "89869",
        //         "hasSufficientNumberOfDataPoints": true,
        //         "twap": "1900078085",
        //         "twapConfidence": "1900078085"
        //     },
        //     "mmOracleData": {
        //         "price": "1900304417",
        //         "slot": "398339102",
        //         "confidence": "316201",
        //         "hasSufficientNumberOfDataPoints": true
        //     },
        //     "marketSlot": 398339102
        // }
        //
        const timestamp = this.safeInteger (response, 'ts');
        const bids = this.safeValue (response, 'bids', []);
        const asks = this.safeValue (response, 'asks', []);
        return this.parseOrderBook (
            {
                'bids': bids,
                'asks': asks,
                'timestamp': timestamp,
            },
            symbol,
            timestamp
        );
    }

    parseBidAsk (bidask) {
        const rawPrice = this.safeString (bidask, 'price');
        const rawAmount = this.safeString (bidask, 'size');
        const price = rawPrice === undefined ? undefined : this.parseNumber (Precise.stringDiv (rawPrice, '1000000'));
        const amount = rawAmount === undefined ? undefined : this.parseNumber (Precise.stringDiv (rawAmount, '1000000000'));
        const result = [ price, amount ];
        return result;
    }

    /**
     * @method
     * @name drift#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (
        symbol: string,
        since: Int = undefined,
        limit: Int = undefined,
        params = {}
    ): Promise<Trade[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchTrades', symbol, since, limit, params, 'nextPage', 'page', undefined, 50) as Trade[];
        }
        const market = this.market (symbol);
        if (limit !== undefined) {
            limit = Math.min (limit, 100);
        }
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketSymbolTrades (this.extend (request, params));
        //
        // {
        //     "success": true,
        //     "records": [
        //         {
        //             "ts": 1770340611,
        //             "txSig": "4VYnTYbXYvxRd7s55b8xNVSQBRP5AzoxQEqd8dfdZ47LVKYTTdnjRGX9eQdDLSWsGnqmx6KCtYVi6pLzt6Jx6uhL",
        //             "txSigIndex": 2,
        //             "slot": 398339247,
        //             "fillerReward": "0.000000",
        //             "baseAssetAmountFilled": "15.000000000",
        //             "quoteAssetAmountFilled": "28327.650000",
        //             "takerFee": "19.829356",
        //             "makerRebate": "-0.991467",
        //             "referrerReward": "0.000000",
        //             "quoteAssetAmountSurplus": "0.000000",
        //             "takerOrderBaseAssetAmount": "15.000000000",
        //             "takerOrderCumulativeBaseAssetAmountFilled": "15.000000000",
        //             "takerOrderCumulativeQuoteAssetAmountFilled": "28327.650000",
        //             "makerOrderBaseAssetAmount": "15.000000000",
        //             "makerOrderCumulativeBaseAssetAmountFilled": "15.000000000",
        //             "makerOrderCumulativeQuoteAssetAmountFilled": "28327.650000",
        //             "oraclePrice": "1889.139752",
        //             "makerFee": "-0.991467",
        //             "action": "fill",
        //             "actionExplanation": "orderFilledWithMatchJit",
        //             "marketIndex": 2,
        //             "marketType": "perp",
        //             "filler": "6McRjTd6iKrUSvzQewoMhrnEkcgZfrZPsXcTexihb9p6",
        //             "fillRecordId": "5987735",
        //             "taker": "AMJ56PZC1KwUw8HvCenf6dPieuJKM4XEamHE7Mw8aoy2",
        //             "takerOrderId": "493",
        //             "takerOrderDirection": "short",
        //             "maker": "6McRjTd6iKrUSvzQewoMhrnEkcgZfrZPsXcTexihb9p6",
        //             "makerOrderId": "46304664",
        //             "makerOrderDirection": "long",
        //             "spotFulfillmentMethodFee": "0.000000",
        //             "marketFilter": "perp",
        //             "symbol": "ETH-PERP",
        //             "bitFlags": 1,
        //             "takerExistingQuoteEntryAmount": "27211.200000",
        //             "takerExistingBaseAssetAmount": "",
        //             "makerExistingQuoteEntryAmount": "",
        //             "makerExistingBaseAssetAmount": ""
        //         }
        //     ],
        //     "meta": {
        //         "nextPage": "eyJwayI6Ik1BUktFVCNFVEgtUEVSUCIsInNrIjoiVFJBREUjVFMjMTc3MDM0MDI4NSNTTE9UIzM5ODMzODQwNSNTSUcjM2VHVzREcEJOc1djVFFjRHpQbVdmejVwTXBxOURMTFNEUkZhOXc5bWU5Q1ZlaEduWXVKTHVQeG95ek5nSnpVNWJIZGZha2NrMm90cUhDQXNXVHN6cEVQUCNJTkRFWCMwMDAwOCJ9"
        //     }
        // }
        //
        const trades = this.safeValue (response, 'records');
        const meta = this.safeDict (response, 'meta');
        const nextPage = this.safeString (meta, 'nextPage');
        if ((trades.length > 0) && (nextPage !== undefined)) {
            trades[0]['nextPage'] = nextPage;
        }
        return this.parseTrades (trades, market, limit);
    }

    /**
     * @method
     * @name drift#fetchMyTrades
     * @description fetch all trades made by the user
     * @param {string} [symbol] unified market symbol to fetch trades for, required by some exchanges
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchMyTrades (
        symbol: string = undefined,
        since: Int = undefined,
        limit: Int = undefined,
        params = {}
    ): Promise<Trade[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchMyTrades', symbol, since, limit, params, 'nextPage', 'page', undefined, 50) as Trade[];
        }
        const request: Dict = {
            'accountId': this.accountId,
        };
        let market = undefined;
        let method = 'publicGetUserAccountIdTrades';
        if (symbol !== undefined) {
            market = this.market (symbol);
            method = 'publicGetUserAccountIdTradesSymbol';
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            limit = Math.min (limit, 100);
        }
        const response = await this[method] (this.extend (request, params));
        //
        // {
        //     "success": true,
        //     "records": [
        //         {
        //             "ts": 1770000777,
        //             "txSig": "",
        //             "txSigIndex": 0,
        //             "slot": 398000661,
        //             "fillerReward": "0.000330",
        //             "baseAssetAmountFilled": "0.005000000",
        //             "quoteAssetAmountFilled": "9.440000",
        //             "takerFee": "0.003304",
        //             "makerRebate": "-0.000236",
        //             "referrerReward": "0.000000",
        //             "quoteAssetAmountSurplus": "0.000000",
        //             "takerOrderBaseAssetAmount": "0.005000000",
        //             "takerOrderCumulativeBaseAssetAmountFilled": "0.005000000",
        //             "takerOrderCumulativeQuoteAssetAmountFilled": "9.440000",
        //             "makerOrderBaseAssetAmount": "0.140000000",
        //             "makerOrderCumulativeBaseAssetAmountFilled": "0.046000000",
        //             "makerOrderCumulativeQuoteAssetAmountFilled": "86.848000",
        //             "oraclePrice": "1887.217373",
        //             "makerFee": "-0.000236",
        //             "action": "fill",
        //             "actionExplanation": "orderFilledWithMatch",
        //             "marketIndex": 2,
        //             "marketType": "perp",
        //             "filler": "",
        //             "fillRecordId": "5986044",
        //             "taker": "",
        //             "takerOrderId": "2",
        //             "takerOrderDirection": "short",
        //             "maker": "",
        //             "makerOrderId": "1793",
        //             "makerOrderDirection": "long",
        //             "spotFulfillmentMethodFee": "0.000000",
        //             "marketFilter": "perp",
        //             "user": "",
        //             "symbol": "ETH-PERP",
        //             "bitFlags": 0,
        //             "takerExistingQuoteEntryAmount": "",
        //             "takerExistingBaseAssetAmount": "",
        //             "makerExistingQuoteEntryAmount": "9.400000",
        //             "makerExistingBaseAssetAmount": ""
        //         }
        //     ],
        //     "meta": {
        //         "nextPage": null
        //     }
        // }
        //
        const trades = this.safeValue (response, 'records');
        const meta = this.safeDict (response, 'meta');
        const nextPage = this.safeString (meta, 'nextPage');
        if ((trades.length > 0) && (nextPage !== undefined)) {
            trades[0]['nextPage'] = nextPage;
        }
        return this.parseTrades (trades, market, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        const timestamp = this.safeTimestamp (trade, 'ts');
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const accountId = this.safeString2 (this.options, 'accountId', 'account_id') ?? this.safeString (this, 'accountId');
        const takerAccount = this.safeString (trade, 'taker');
        const makerAccount = this.safeString (trade, 'maker');
        let takerOrMaker = undefined;
        if (accountId !== undefined) {
            if (accountId === takerAccount) {
                takerOrMaker = 'taker';
            } else if (accountId === makerAccount) {
                takerOrMaker = 'maker';
            }
        }
        const directionKey = takerOrMaker === 'maker' ? 'makerOrderDirection' : 'takerOrderDirection';
        const direction = this.safeStringLower (trade, directionKey) ?? this.safeStringLower (trade, 'takerOrderDirection');
        const side = direction === 'long' ? 'buy' : 'sell';
        const amountString = this.safeString (trade, 'baseAssetAmountFilled');
        const costString = this.safeString (trade, 'quoteAssetAmountFilled');
        const priceString = Precise.stringDiv (costString, amountString);
        let feeCostString = undefined;
        if (takerOrMaker === 'maker') {
            feeCostString = this.safeString (trade, 'makerFee');
        } else {
            feeCostString = this.safeString (trade, 'takerFee');
        }
        const fee = feeCostString === undefined
            ? undefined
            : {
                'cost': feeCostString,
                'currency': market ? this.safeCurrencyCode (market['quote']) : 'USDC',
            };
        const orderId = takerOrMaker === 'maker'
            ? this.safeString (trade, 'makerOrderId')
            : this.safeString (trade, 'takerOrderId');
        return this.safeTrade (
            {
                'info': trade,
                'amount': amountString,
                'datetime': this.iso8601 (timestamp),
                'id': this.safeString (trade, 'fillRecordId'),
                'price': priceString,
                'timestamp': timestamp,
                'symbol': symbol,
                'side': side,
                'cost': costString,
                'fee': fee,
                'order': orderId,
                'takerOrMaker': takerOrMaker,
            },
            market
        );
    }

    /**
     * @method
     * @name drift#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, close price, and volume
     * @param {string} symbol unified symbol of the market to fetch OHLCV for
     * @param {string} [timeframe] the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {OHLCV[]} A list of OHLCV data in an array [timestamp, open, high, low, close, volume]
     */
    async fetchOHLCV (
        symbol: string,
        timeframe: string = '1m',
        since: Int = undefined,
        limit: Int = undefined,
        params = {}
    ): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const resolution = this.safeString (this.timeframes, timeframe);
        if (resolution === undefined) {
            throw new NotSupported (
                this.id + ' fetchOHLCV() does not support timeframe ' + timeframe
            );
        }
        const request: Dict = {
            'symbol': market['id'],
            'resolution': resolution,
        };
        if (since !== undefined) {
            request['endTs'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        const response = await this.publicGetMarketSymbolCandlesResolution (
            this.extend (request, params)
        );
        //
        // {
        //     "success": true,
        //     "records": [
        //         {
        //             "ts": 1769904000,
        //             "fillOpen": 2448.341584,
        //             "fillHigh": 2472.25,
        //             "fillClose": 1891.22,
        //             "fillLow": 1743.59,
        //             "oracleOpen": 2448.478142,
        //             "oracleHigh": 2473.10011,
        //             "oracleClose": 1892.258333,
        //             "oracleLow": 1746.921599,
        //             "quoteVolume": 166995196.877037,
        //             "baseVolume": 75911.612
        //         }
        //     ]
        // }
        //
        const candles = this.safeValue (response, 'records', response);
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv: Dict): OHLCV {
        return [
            this.safeTimestamp (ohlcv, 'ts'),
            this.safeNumber (ohlcv, 'fillOpen'),
            this.safeNumber (ohlcv, 'fillHigh'),
            this.safeNumber (ohlcv, 'fillLow'),
            this.safeNumber (ohlcv, 'fillClose'),
            this.safeNumber (ohlcv, 'quoteVolume'),
        ];
    }

    /**
     * @method
     * @name drift#fetchOrder
     * @description fetches information on an order made by the user
     * @param {string} id order id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (
        id: string,
        symbol: Str = undefined,
        params = {}
    ): Promise<Order> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const request: Dict = {
            'accountId': this.accountId,
            'orderId': id,
        };
        const response = await this.publicGetUserAccountIdOrdersIdOrderId (this.extend (request, params));
        //
        // {
        //     "success": true,
        //     "record": {
        //         "ts": 1770009167,
        //         "txSig": "",
        //         "txSigIndex": 1,
        //         "slot": 397477413,
        //         "user": "=",
        //         "status": "open",
        //         "orderType": "oracle",
        //         "marketType": "perp",
        //         "orderId": 1,
        //         "userOrderId": 0,
        //         "marketIndex": 0,
        //         "price": "0",
        //         "baseAssetAmount": "0.01",
        //         "quoteAssetAmount": "0",
        //         "baseAssetAmountFilled": "0.01",
        //         "quoteAssetAmountFilled": "0.993918",
        //         "direction": "short",
        //         "reduceOnly": false,
        //         "triggerPrice": "0",
        //         "triggerCondition": "above",
        //         "existingPositionDirection": "long",
        //         "postOnly": false,
        //         "immediateOrCancel": false,
        //         "oraclePriceOffset": "-0.189943",
        //         "auctionDuration": 20,
        //         "auctionStartPrice": "-0.0539",
        //         "auctionEndPrice": "-0.1899",
        //         "maxTs": 1770009197,
        //         "marketFilter": "perp",
        //         "symbol": "SOL-PERP",
        //         "lastActionStatus": "filled",
        //         "lastActionExplanation": "orderFilledWithMatch",
        //         "lastUpdatedTs": 1770009171,
        //         "cumulativeFee": "0.000348"
        //     }
        // }
        //
        const record = this.safeDict (response, 'record', {});
        if (record['orderId'] === undefined) {
            throw new OrderNotFound (this.id + ' fetchOrder() returned empty response');
        }
        return this.parseOrder (record);
    }

    /**
     * @method
     * @name drift#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @param {string} [symbol] unified market symbol of the market the orders were made in
     * @param {int} [limit] the maximum amount of orders to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (
        symbol: Str = undefined,
        since: Int = undefined,
        limit: Int = undefined,
        params = {}
    ): Promise<Order[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchOrders', symbol, since, limit, params, 'nextPage', 'page', undefined, 50) as Order[];
        }
        const request: Dict = {
            'accountId': this.accountId,
        };
        let market = undefined;
        let method = 'publicGetUserAccountIdOrdersPerp';
        if (symbol !== undefined) {
            market = this.market (symbol);
            method = 'publicGetUserAccountIdOrdersPerpSymbol';
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            limit = Math.min (limit, 100);
        }
        const response = await (this as any)[method] (this.extend (request, params));
        //
        // {
        //     "success": true,
        //     "records": [
        //         {
        //             "ts": 1770001166,
        //             "txSig": "",
        //             "txSigIndex": 1,
        //             "slot": 398990651,
        //             "user": "",
        //             "status": "open",
        //             "orderType": "oracle",
        //             "marketType": "perp",
        //             "orderId": 5,
        //             "userOrderId": 1,
        //             "marketIndex": 0,
        //             "price": "0.000000",
        //             "baseAssetAmount": "0.010000000",
        //             "quoteAssetAmount": "0.000000",
        //             "baseAssetAmountFilled": "0.010000000",
        //             "quoteAssetAmountFilled": "0.769870",
        //             "direction": "long",
        //             "reduceOnly": false,
        //             "triggerPrice": "0.000000",
        //             "triggerCondition": "above",
        //             "existingPositionDirection": "long",
        //             "postOnly": false,
        //             "immediateOrCancel": false,
        //             "oraclePriceOffset": "0.032413",
        //             "auctionDuration": 40,
        //             "auctionStartPrice": "-0.268200",
        //             "auctionEndPrice": "0.032400",
        //             "maxTs": 1770341196,
        //             "marketFilter": "perp",
        //             "symbol": "SOL-PERP",
        //             "lastActionStatus": "filled",
        //             "lastActionExplanation": "orderFilledWithMatch",
        //             "lastUpdatedTs": 1770001166,
        //             "cumulativeFee": "0.000270"
        //         }
        //     ],
        //     "meta": {
        //         "nextPage": null
        //     }
        // }
        //
        const orders = this.safeValue (response, 'records');
        const meta = this.safeDict (response, 'meta');
        const nextPage = this.safeString (meta, 'nextPage');
        if ((orders.length > 0) && (nextPage !== undefined)) {
            orders[0]['nextPage'] = nextPage;
        }
        return this.parseOrders (orders, market, since, limit);
    }

    /**
     * @method
     * @name drift#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const market = this.safeMarket (symbol);
        const request: Dict = {
            'accountId': this.accountId,
        };
        const response = await this.publicGetUserAccountId (this.extend (request, params));
        //
        // {
        //     "account": {
        //         "balance": "30.160985",
        //         "totalCollateral": "30.143451",
        //         "freeCollateral": "28.884414",
        //         "health": "99",
        //         "initialMargin": "1.259037",
        //         "maintenanceMargin": "0.212363",
        //         "leverage": "0.339"
        //     },
        //     "positions": [],
        //     "balances": [],
        //     "orders": []
        // }
        //
        const orders = this.safeValue (response, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        const id = this.safeString (order, 'orderId');
        const timestamp = this.safeTimestamp (order, 'ts');
        const direction = this.safeStringLower (order, 'direction');
        const side = direction === 'long' ? 'buy' : 'sell';
        const amount = Precise.stringAbs (this.safeString (order, 'baseAssetAmount'));
        const filled = Precise.stringAbs (this.safeString (order, 'baseAssetAmountFilled'));
        const remaining = Precise.stringSub (amount, filled);
        const status = this.parseOrderStatus (this.safeString2 (order, 'lastActionStatus', 'status'));
        const cost = this.safeString2 (order, 'cost', 'quoteAssetAmountFilled');
        const triggerPrice = this.safeInteger (order, 'triggerPrice');
        const triggerDirection = this.safeValue (order, 'triggerCondition');
        const immediateOrCancel = this.safeBool (order, 'immediateOrCancel');
        const timeInForce = immediateOrCancel ? 'IOC' : 'GTC';
        const feeCost = this.safeNumber (order, 'cumulativeFee');
        const feeCurrencyId = market ? market['quote'] : 'USDC';
        const feeCurrency = this.safeCurrencyCode (feeCurrencyId);
        let fee = undefined;
        if (feeCost === undefined) {
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return this.safeOrder (
            {
                'info': order,
                'id': id,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'symbol': this.safeSymbol (order.symbol, market),
                'type': this.parseOrderType (this.safeString (order, 'orderType')),
                'postOnly': this.safeValue (order, 'postOnly', false),
                'reduceOnly': this.safeValue (order, 'reduceOnly', false),
                'side': side,
                'price': this.safeString (order, 'price'),
                'triggerPrice': triggerPrice,
                'triggerDirection': triggerDirection,
                'amount': amount,
                'cost': cost,
                'average': undefined,
                'filled': filled,
                'remaining': remaining,
                'status': status,
                'fee': fee,
                'fees': fee === undefined ? undefined : [ fee ],
                'timeInForce': timeInForce,
                'lastUpdateTimestamp': this.safeTimestamp (order, 'lastUpdatedTs'),
            },
            market
        );
    }

    parseOrderStatus (status: Str): string {
        const statuses: Dict = {
            'partial_fill_cancelled': 'canceled',
            'cancelled': 'canceled',
            'partial_fill': 'open',
            'filled': 'closed',
            'open': 'open',
            'expired': 'expired',
            'trigger': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type: Str): string {
        const types: Dict = {
            'oracle': 'market',
            'triggerMarket': 'market',
            'triggerLimit': 'limit',
        };
        return this.safeString (types, type, type);
    }

    /**
     * @method
     * @name drift#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        const request: Dict = {
            'accountId': this.accountId,
        };
        const response = await this.publicGetUserAccountId (this.extend (request, params));
        return this.parseBalance (response);
    }

    parseBalance (response: any): Balances {
        const result: Dict = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const balances = this.safeValue (response, 'balances', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const total = this.safeString (balance, 'balance');
            const used = this.safeString (balance, 'openOrders');
            const free = (total !== undefined && used !== undefined) ? Precise.stringSub (total, used) : total;
            account['free'] = free;
            account['used'] = used;
            account['total'] = total;
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name drift#fetchPositions
     * @description fetch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions (
        symbols: Strings = undefined,
        params = {}
    ): Promise<Position[]> {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        const request: Dict = {
            'accountId': this.accountId,
        };
        const response = await this.publicGetUserAccountId (this.extend (request, params));
        const positions = this.safeList (response, 'positions', []);
        return this.parsePositions (positions, symbols);
    }

    /**
     * Parse a single position entry
     * @param {object} position raw position structure from the exchange
     * @param {object} [market] unified market structure
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    parsePosition (position: Dict, market: Market = undefined): Position {
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        const contracts = this.safeNumber (position, 'baseAssetAmount');
        let side = undefined;
        if (contracts !== undefined) {
            if (contracts > 0) {
                side = 'long';
            } else if (contracts < 0) {
                side = 'short';
            }
        }
        const quoteEntryAmountAbs = Precise.stringAbs (this.safeString (position, 'quoteEntryAmount'));
        const baseAssetAmountAbs = Precise.stringAbs (this.safeString (position, 'baseAssetAmount'));
        const entryPriceString = (quoteEntryAmountAbs !== undefined && baseAssetAmountAbs !== undefined && Precise.stringGt (baseAssetAmountAbs, '0'))
            ? Precise.stringDiv (quoteEntryAmountAbs, baseAssetAmountAbs)
            : undefined;
        const entryPrice = entryPriceString === undefined ? undefined : this.parseNumber (entryPriceString);
        const liquidationPrice = this.safeNumber (position, 'liquidationPrice');
        return this.safePosition ({ // todo add margin modes, leverage, collateral etc
            'info': position,
            'symbol': this.safeSymbol (marketId),
            'contracts': contracts,
            'side': side,
            'notional': quoteEntryAmountAbs === undefined ? undefined : this.parseNumber (quoteEntryAmountAbs),
            'entryPrice': entryPrice,
            'liquidationPrice': liquidationPrice,
        });
    }

    /**
     * @method
     * @name drift#fetchFundingHistory
     * @description fetches the history of funding payments for swap positions
     * @param symbol
     * @param {int} [limit] the maximum amount of funding payments to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {FundingHistory[]} a list of [funding history structures]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    async fetchFundingHistory (
        symbol: Str = undefined, // todo funding by market
        // since: Int = undefined, // todo funding
        limit: Int = 20,
        params = {}
    ): Promise<FundingHistory[]> {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        const maxEntries = Math.min (limit, 100);
        const request: Dict = {
            'accountId': this.accountId,
        };
        let nextPage = undefined;
        let allPayments: any[] = [];
        let fetchMore = true;
        while (fetchMore) {
            const pageRequest = this.extend ({}, request);
            if (nextPage !== undefined) {
                pageRequest['page'] = nextPage;
            }
            const response = await (this as any).publicGetUserAccountIdFundingPayments (this.extend (pageRequest, params));
            const records = this.safeList (response, 'records', []);
            allPayments = allPayments.concat (records);
            const meta = this.safeDict (response, 'meta', {});
            nextPage = this.safeString (response, 'nextPage') ?? this.safeString (meta, 'nextPage');
            fetchMore = !((nextPage === undefined) || (records.length === 0) || (allPayments.length >= maxEntries));
        }
        allPayments = allPayments.slice (0, maxEntries);
        return this.parseFundingHistories (allPayments);
    }

    parseFundingHistory (payment: Dict, market: Market = undefined): FundingHistory {
        const timestamp = this.safeTimestamp (payment, 'ts');
        const marketIndex = this.safeInteger (payment, 'marketIndex');
        let marketId = undefined;
        if (marketIndex !== undefined) { // todo add symbol to funding records
            const markets = this.toArray (this.markets);
            for (let i = 0; i < markets.length; i++) {
                const m = markets[i];
                if (!this.safeBool (m, 'swap', false)) {
                    continue;
                }
                const info = this.safeValue (m, 'info', {});
                const mIndex = this.safeInteger (info, 'marketIndex');
                if (mIndex === marketIndex) {
                    marketId = this.safeString (m, 'id');
                    break;
                }
            }
        }
        const symbol = this.safeSymbol (marketId, market, undefined, 'swap');
        const txSig = this.safeString (payment, 'txSig');
        const txSigIndex = this.safeString (payment, 'txSigIndex');
        const id = txSigIndex === undefined ? txSig : txSig + ':' + txSigIndex;
        return {
            'info': payment,
            'symbol': symbol,
            'code': 'USDC',
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': id,
            'amount': this.safeNumber (payment, 'fundingPayment'),
        };
    }

    parseFundingHistories (
        payments: any[],
        market: Market = undefined,
        since: Int = undefined,
        limit: Int = undefined
    ): FundingHistory[] {
        const result = [];
        for (let i = 0; i < payments.length; i++) {
            result.push (this.parseFundingHistory (payments[i], market));
        }
        const sorted = this.sortBy (result, 'timestamp');
        const symbol = market !== undefined ? market['symbol'] : undefined;
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit) as FundingHistory[];
    }

    /**
     * @method
     * @name drift#fetchTransactions
     * @description fetch history of deposits and withdrawals
     * @param {string} [code] unified currency code for the currency of the transactions
     * @param {int} [limit] max number of transactions to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Transaction[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchTransactions (
        code: Str = undefined,
        // since: Int = undefined, todo look at implementing
        limit: Int = 20,
        params = {}
    ): Promise<Transaction[]> {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const maxTransactions = Math.min (limit, 100);
        let nextPage = undefined;
        let transactions: any[] = [];
        let fetchMore = true;
        while (fetchMore) {
            const request: Dict = {
                'accountId': this.accountId,
            };
            if (nextPage !== undefined) {
                request['page'] = nextPage;
            }
            const response = await this.publicGetUserAccountIdDeposits (this.extend (request, params));
            const records = this.safeValue (response, 'records', response);
            transactions = transactions.concat (records);
            nextPage = this.safeString (response, 'nextPage');
            fetchMore = !((nextPage === undefined) || (records.length === 0) || (transactions.length >= maxTransactions));
        }
        transactions = transactions.slice (0, maxTransactions);
        return this.parseTransactions (transactions, currency, limit);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        const timestamp = this.safeTimestamp (transaction, 'ts');
        const currencyId = this.safeString (transaction, 'symbol');
        const code = this.safeCurrencyCode (currencyId, currency);
        const direction = this.safeStringLower (transaction, 'direction');
        let type = undefined;
        if (direction === 'deposit') {
            type = 'deposit';
        } else if (direction === 'withdraw' || direction === 'withdrawal') {
            type = 'withdrawal';
        }
        const amountString = this.safeString (transaction, 'amount');
        const amount = this.parseNumber (amountString);
        return {
            'info': transaction,
            'id': code + '-' + this.safeString (transaction, 'depositRecordId'),
            'txid': this.safeString (transaction, 'txSig'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': undefined,
            'addressFrom': undefined,
            'addressTo': undefined,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': 'ok',
            'updated': undefined,
            'fee': undefined,
            'network': undefined,
            'comment': this.safeString (transaction, 'explanation'),
            'internal': undefined,
        };
    }

    parseLedgerEntry (entry: Dict, currency: Currency = undefined): LedgerEntry {
        const timestamp = this.safeTimestamp (entry, 'ts');
        const marketId = this.safeString (entry, 'marketIndex');
        const market = this.safeMarket (marketId);
        const currencyId = market !== undefined ? market['quote'] : undefined;
        const code = this.safeCurrencyCode (currencyId, currency);
        const amount = this.parseNumber (this.safeString (entry, 'pnl'));
        let direction = undefined;
        if (amount !== undefined) {
            if (amount > 0) {
                direction = 'in';
            } else if (amount < 0) {
                direction = 'out';
            }
        }
        return {
            'info': entry,
            'id': this.safeString (entry, 'txSig'),
            'direction': direction,
            'account': this.safeString (entry, 'user'),
            'referenceId': this.safeString (entry, 'txSig'),
            'type': 'pnl',
            'currency': code,
            'amount': amount,
            'before': undefined,
            'after': undefined,
            'status': 'ok',
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        };
    }

    /**
     * @method
     * @name drift#fetchLedger
     * @description fetch the history of changes in balance
     * @param code
     * @param {int} [limit] the maximum number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {LedgerEntry[]} a list of [ledger entries]{@link https://docs.ccxt.com/#/?id=ledger-structure}
     */
    async fetchLedger (
        code: Str = undefined,
        // since: Int = undefined, todo implement
        limit: Int = 20,
        params = {}
    ): Promise<LedgerEntry[]> {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        const currency = this.currency ('USDC'); // Everything settled in USDC
        const maxEntries = Math.min (limit, 100);
        let nextPage = undefined;
        let entries: any[] = [];
        let fetchMore = true;
        while (fetchMore) {
            const request: Dict = {
                'accountId': this.accountId,
            };
            if (nextPage !== undefined) {
                request['page'] = nextPage;
            }
            const response = await this.publicGetUserAccountIdSettlePnl (this.extend (request, params));
            const records = this.safeValue (response, 'records', response);
            entries = entries.concat (records);
            nextPage = this.safeString (response, 'nextPage');
            fetchMore = !((nextPage === undefined) || (records.length === 0) || (entries.length >= maxEntries));
        }
        entries = entries.slice (0, maxEntries);
        return this.parseLedger (entries, currency, limit);
    }

    /**
     * @method
     * @name drift#createOrder
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (
        symbol: string,
        type: OrderType,
        side: OrderSide,
        amount: number,
        price: Num = undefined,
        params = {}
    ): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'accountId': this.accountId,
            'symbol': market['id'],
            'direction': side === 'buy' ? 'long' : 'short',
            'amount': amount,
            'orderType': type,
        };
        if (type === 'limit') {
            if (price === undefined) {
                throw new Error (
                    this.id + ' createOrder() requires a price argument for limit orders'
                );
            }
            request['price'] = price;
        }
        const response = await this.publicPostTxOrderPlace (
            this.extend (request, params)
        );
        await this.executeTx (response.tx);
        // todo add order to response
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name drift#cancelOrder
     * @description cancels an open order
     * @param {string} id order id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (
        id: string,
        params = {}
    ): Promise<Order> {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        const request: Dict = {
            'accountId': this.accountId,
            'orderId': id,
        };
        const response = await this.publicPostTxOrderCancel (this.extend (request, params));
        const txSig = await this.executeTx (response.tx);
        // todo add order to response
        return this.safeOrder (
            {
                'id': id,
                'clientOrderId': undefined,
                'info': this.extend (response, { 'txSig': txSig }),
                'symbol': undefined,
                'timestamp': undefined,
                'datetime': undefined,
                'status': 'canceled',
                'side': undefined,
                'price': undefined,
                'amount': undefined,
                'filled': undefined,
                'remaining': undefined,
                'type': undefined,
            }
        );
    }

    /**
     * @method
     * @name drift#cancelAllOrders
     * @description cancel all open orders in a market
     * @param {string} [symbol] unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (
        symbol: Str = undefined,
        params = {}
    ): Promise<Order[]> {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        const market = symbol !== undefined ? this.market (symbol) : undefined;
        const request: Dict = {
            'accountId': this.accountId,
        };
        if (market !== undefined) {
            request['symbol'] = market['id'];
        }
        const response = await this.publicPostTxOrderCancel (this.extend (request, params));
        await this.executeTx (response.tx);
        // todo add order to response
        return [];
    }

    /**
     * @method
     * @name drift#deposit
     * @description make a deposit
     * @param {string} code unified currency code
     * @param {float} amount amount to deposit
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Transaction} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async deposit (
        code: string,
        amount: number,
        params = {}
    ): Promise<Transaction> {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        const request: Dict = {
            'accountId': this.accountId,
            'amount': amount,
            'symbol': code,
        };
        const response = await this.publicPostTxDeposit (this.extend (request));
        const txSig = await this.executeTx (response.tx);
        // todo add deposit to response
        return {
            'info': this.extend (response, { 'txSig': txSig }),
            'id': this.safeString (response, 'depositRecordId'),
            'txid': txSig,
            'timestamp': undefined,
            'datetime': undefined,
            'address': undefined,
            'addressFrom': undefined,
            'addressTo': undefined,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': 'deposit',
            'amount': amount,
            'currency': code,
            'status': 'ok',
            'updated': undefined,
            'fee': undefined,
            'network': undefined,
            'internal': undefined,
            'comment': undefined,
        };
    }

    /**
     * @method
     * @name drift#withdraw
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount amount to withdraw
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Transaction} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw (
        code: string,
        amount: number,
        params = {}
    ): Promise<Transaction> {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        const request: Dict = {
            'accountId': this.accountId,
            'amount': amount,
            'symbol': code,
        };
        const response = await this.publicPostTxWithdraw (this.extend (request));
        const txSig = await this.executeTx (response.tx);
        // todo add deposit to response
        return {
            'info': this.extend (response, { 'txSig': txSig }),
            'id': this.safeString (response, 'withdrawRecordId'),
            'txid': txSig,
            'timestamp': undefined,
            'datetime': undefined,
            'address': this.accountId,
            'addressFrom': undefined,
            'addressTo': this.accountId,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': 'withdrawal',
            'amount': amount,
            'currency': code,
            'status': 'ok',
            'updated': undefined,
            'fee': undefined,
            'network': undefined,
            'comment': undefined,
            'internal': undefined,
        };
    }

    async executeTx (serializedTx: string): Promise<string> {
        this.checkRequiredCredentials ();
        const txBytes = this.base64ToBinary (serializedTx);
        const keyBytes = base58.decode (this.privateKey);
        const secretKey = keyBytes.slice (0, 32);
        const sigCount = txBytes[0];
        const signaturesEnd = 1 + sigCount * 64;
        const messageBytes = txBytes.slice (signaturesEnd);
        const signatureBase64 = eddsa (messageBytes, secretKey, ed25519);
        const signatureBytes = this.base64ToBinary (signatureBase64);
        const signedTxBytes = new Uint8Array (txBytes);
        signedTxBytes.set (signatureBytes, 1);
        const signedTxBase64 = this.binaryToBase64 (signedTxBytes);
        const request: Dict = {
            'signedTx': signedTxBase64,
            'simulate': false,
        };
        const response = await this.publicPostTxExecute (request);
        return this.safeString (response, 'txSig');
    }

    sign (
        path: string,
        api: string = 'public',
        method: string = 'GET',
        params: Dict = {},
        headers: any = undefined,
        body: any = undefined
    ) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public' || api === 'dlob') {
            if (method !== 'GET' && Object.keys (query).length) {
                body = this.json (query);
            } else if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
            headers = {
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (
        code: int,
        reason: string,
        url: string,
        method: string,
        headers: Dict,
        body: string,
        response: any,
        requestHeaders: any,
        requestBody: any
    ) {
        if (response === undefined) {
            return undefined;
        }
        const error = this.safeString (response, 'error');
        const name = this.safeString (response, 'name');
        const codeValue = this.safeString (response, 'code');
        const details = this.safeString (response, 'details');
        const message = this.safeString (response, 'message');
        if (error !== undefined || name !== undefined || codeValue !== undefined) {
            const feedback = this.id + ': ' + (error ?? name) + ': ' + (details ?? message);
            this.throwExactlyMatchedException (
                this.exceptions['exact'],
                error,
                feedback
            );
            this.throwExactlyMatchedException (
                this.exceptions['exact'],
                name,
                feedback
            );
            this.throwExactlyMatchedException (
                this.exceptions['exact'],
                codeValue,
                feedback
            );
            throw new Error (feedback);
        }
        return undefined;
    }
}
