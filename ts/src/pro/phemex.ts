
//  ---------------------------------------------------------------------------

import phemexRest from '../phemex.js';
import { Precise } from '../base/Precise.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { Int } from '../base/types.js';
import { AuthenticationError } from '../base/errors.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class phemex extends phemexRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchTrades': true,
                'watchMyTrades': true,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOHLCV': true,
                'watchPositions': undefined, // TODO
            },
            'urls': {
                'test': {
                    'ws': 'wss://testnet.phemex.com/ws',
                },
                'api': {
                    'ws': 'wss://phemex.com/ws',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
            },
            'streaming': {
                'keepAlive': 10000,
            },
        });
    }

    fromEn (en, scale) {
        if (en === undefined) {
            return undefined;
        }
        const precise = new Precise (en);
        precise.decimals = this.sum (precise.decimals, scale);
        precise.reduce ();
        return precise.toString ();
    }

    fromEp (ep, market = undefined) {
        if ((ep === undefined) || (market === undefined)) {
            return ep;
        }
        return this.fromEn (ep, this.safeInteger (market, 'priceScale'));
    }

    fromEv (ev, market = undefined) {
        if ((ev === undefined) || (market === undefined)) {
            return ev;
        }
        return this.fromEn (ev, this.safeInteger (market, 'valueScale'));
    }

    fromEr (er, market = undefined) {
        if ((er === undefined) || (market === undefined)) {
            return er;
        }
        return this.fromEn (er, this.safeInteger (market, 'ratioScale'));
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    parseSwapTicker (ticker, market = undefined) {
        //
        //     {
        //         close: 442800,
        //         fundingRate: 10000,
        //         high: 445400,
        //         indexPrice: 442621,
        //         low: 428400,
        //         markPrice: 442659,
        //         open: 432200,
        //         openInterest: 744183,
        //         predFundingRate: 10000,
        //         symbol: 'LTCUSD',
        //         turnover: 8133238294,
        //         volume: 934292
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeIntegerProduct (ticker, 'timestamp', 0.000001);
        const lastString = this.fromEp (this.safeString (ticker, 'close'), market);
        const last = this.parseNumber (lastString);
        const quoteVolume = this.parseNumber (this.fromEv (this.safeString (ticker, 'turnover'), market));
        const baseVolume = this.parseNumber (this.fromEv (this.safeString (ticker, 'volume'), market));
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        const openString = this.omitZero (this.fromEp (this.safeString (ticker, 'open'), market));
        const open = this.parseNumber (openString);
        if ((openString !== undefined) && (lastString !== undefined)) {
            change = this.parseNumber (Precise.stringSub (lastString, openString));
            average = this.parseNumber (Precise.stringDiv (Precise.stringAdd (lastString, openString), '2'));
            percentage = this.parseNumber (Precise.stringMul (Precise.stringSub (Precise.stringDiv (lastString, openString), '1'), '100'));
        }
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.parseNumber (this.fromEp (this.safeString (ticker, 'high'), market)),
            'low': this.parseNumber (this.fromEp (this.safeString (ticker, 'low'), market)),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
        return result;
    }

    parsePerpetualTicker (ticker, market = undefined) {
        //
        //    [
        //        "STXUSDT",
        //        "0.64649",
        //        "0.8628",
        //        "0.61215",
        //        "0.71737",
        //        "4519387",
        //        "3210827.98166",
        //        "697635",
        //        "0.71720205",
        //        "0.71720205",
        //        "0.0001",
        //        "0.0001",
        //    ]
        //
        const marketId = this.safeString (ticker, 0);
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const lastString = this.fromEp (this.safeString (ticker, 4), market);
        const last = this.parseNumber (lastString);
        const quoteVolume = this.parseNumber (this.fromEv (this.safeString (ticker, 6), market));
        const baseVolume = this.parseNumber (this.fromEv (this.safeString (ticker, 5), market));
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        const openString = this.omitZero (this.fromEp (this.safeString (ticker, 1), market));
        const open = this.parseNumber (openString);
        if ((openString !== undefined) && (lastString !== undefined)) {
            change = this.parseNumber (Precise.stringSub (lastString, openString));
            average = this.parseNumber (Precise.stringDiv (Precise.stringAdd (lastString, openString), '2'));
            percentage = this.parseNumber (Precise.stringMul (Precise.stringSub (Precise.stringDiv (lastString, openString), '1'), '100'));
        }
        const result = {
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.parseNumber (this.fromEp (this.safeString (ticker, 2), market)),
            'low': this.parseNumber (this.fromEp (this.safeString (ticker, 3), market)),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
        return result;
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         spot_market24h: {
        //             askEp: 958148000000,
        //             bidEp: 957884000000,
        //             highEp: 962000000000,
        //             lastEp: 958220000000,
        //             lowEp: 928049000000,
        //             openEp: 935597000000,
        //             symbol: 'sBTCUSDT',
        //             turnoverEv: 146074214388978,
        //             volumeEv: 15492228900
        //         },
        //         timestamp: 1592847265888272100
        //     }
        //
        // swap
        //
        //     {
        //         market24h: {
        //             close: 442800,
        //             fundingRate: 10000,
        //             high: 445400,
        //             indexPrice: 442621,
        //             low: 428400,
        //             markPrice: 442659,
        //             open: 432200,
        //             openInterest: 744183,
        //             predFundingRate: 10000,
        //             symbol: 'LTCUSD',
        //             turnover: 8133238294,
        //             volume: 934292
        //         },
        //         timestamp: 1592845585373374500
        //     }
        //
        // perpetual
        //
        //    {
        //        data: [
        //            [
        //                "STXUSDT",
        //                "0.64649",
        //                "0.8628",
        //                "0.61215",
        //                "0.71737",
        //                "4519387",
        //                "3210827.98166",
        //                "697635",
        //                "0.71720205",
        //                "0.71720205",
        //                "0.0001",
        //                "0.0001",
        //            ],
        //            ...
        //        ],
        //        fields: [
        //            "symbol",
        //            "openRp",
        //            "highRp",
        //            "lowRp",
        //            "lastRp",
        //            "volumeRq",
        //            "turnoverRv",
        //            "openInterestRv",
        //            "indexRp",
        //            "markRp",
        //            "fundingRateRr",
        //            "predFundingRateRr",
        //        ],
        //        method: "perp_market24h_pack_p.update",
        //        timestamp: "1677094918686806209",
        //        type: "snapshot",
        //    }
        //
        const tickers = [];
        if ('market24h' in message) {
            const ticker = this.safeValue (message, 'market24h');
            tickers.push (this.parseSwapTicker (ticker));
        } else if ('spot_market24h' in message) {
            const ticker = this.safeValue (message, 'spot_market24h');
            tickers.push (this.parseTicker (ticker));
        } else if ('data' in message) {
            const data = this.safeValue (message, 'data', []);
            for (let i = 0; i < data.length; i++) {
                tickers.push (this.parsePerpetualTicker (data[i]));
            }
        }
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            const symbol = ticker['symbol'];
            const messageHash = 'ticker:' + symbol;
            const timestamp = this.safeIntegerProduct (message, 'timestamp', 0.000001);
            ticker['timestamp'] = timestamp;
            ticker['datetime'] = this.iso8601 (timestamp);
            this.tickers[symbol] = ticker;
            client.resolve (ticker, messageHash);
        }
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name phemex#watchBalance
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#subscribe-account-order-position-aop
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-account-order-position-aop
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#subscribe-wallet-order-messages
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @param {string} params.settle set to USDT to use hedged perpetual api
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        const usePerpetualApi = this.safeString (params, 'settle') === 'USDT';
        let messageHash = ':balance';
        messageHash = usePerpetualApi ? 'perpetual' + messageHash : type + messageHash;
        return await this.subscribePrivate (type, messageHash, params);
    }

    handleBalance (type, client, message) {
        // spot
        //    [
        //       {
        //           balanceEv: 0,
        //           currency: 'BTC',
        //           lastUpdateTimeNs: '1650442638722099092',
        //           lockedTradingBalanceEv: 0,
        //           lockedWithdrawEv: 0,
        //           userID: 2647224
        //         },
        //         {
        //           balanceEv: 1154232337,
        //           currency: 'USDT',
        //           lastUpdateTimeNs: '1650442617610017597',
        //           lockedTradingBalanceEv: 0,
        //           lockedWithdrawEv: 0,
        //           userID: 2647224
        //         }
        //    ]
        // swap
        //    [
        //        {
        //            accountBalanceEv: 0,
        //            accountID: 26472240001,
        //            bonusBalanceEv: 0,
        //            currency: 'BTC',
        //            totalUsedBalanceEv: 0,
        //            userID: 2647224
        //        }
        //    ]
        // perpetual
        //    [
        //        {
        //            "accountBalanceRv": "1508.452588802237",
        //            "accountID": 9328670003,
        //            "bonusBalanceRv": "0",
        //            "currency": "USDT",
        //            "totalUsedBalanceRv": "343.132599666883",
        //            "userID": 932867
        //        }
        //    ]
        //
        this.balance['info'] = message;
        for (let i = 0; i < message.length; i++) {
            const balance = message[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const currency = this.safeValue (this.currencies, code, {});
            const scale = this.safeInteger (currency, 'valueScale', 8);
            const account = this.account ();
            let used = this.safeString (balance, 'totalUsedBalanceRv');
            if (used === undefined) {
                let usedEv = this.safeString (balance, 'totalUsedBalanceEv');
                if (usedEv === undefined) {
                    const lockedTradingBalanceEv = this.safeString (balance, 'lockedTradingBalanceEv');
                    const lockedWithdrawEv = this.safeString2 (balance, 'lockedWithdrawEv', 'lockedWithdrawRv');
                    usedEv = Precise.stringAdd (lockedTradingBalanceEv, lockedWithdrawEv);
                }
                used = this.fromEn (usedEv, scale);
            }
            let total = this.safeString (balance, 'accountBalanceRv');
            if (total === undefined) {
                const totalEv = this.safeString2 (balance, 'accountBalanceEv', 'balanceEv');
                total = this.fromEn (totalEv, scale);
            }
            account['used'] = used;
            account['total'] = total;
            this.balance[code] = account;
            this.balance = this.safeBalance (this.balance);
        }
        const messageHash = type + ':balance';
        client.resolve (this.balance, messageHash);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         sequence: 1795484727,
        //         symbol: 'sBTCUSDT',
        //         trades: [
        //             [ 1592891002064516600, 'Buy', 964020000000, 1431000 ],
        //             [ 1592890978987934500, 'Sell', 963704000000, 1401800 ],
        //             [ 1592890972918701800, 'Buy', 963938000000, 2018600 ],
        //         ],
        //         type: 'snapshot'
        //     }
        //  perpetual
        //     {
        //         sequence: 1230197759,
        //         symbol: "BTCUSDT",
        //         trades_p: [
        //             [
        //                 1677094244729433000,
        //                 "Buy",
        //                 "23800.4",
        //                 "2.455",
        //             ],
        //         ],
        //         type: "snapshot",
        //     }
        //
        const name = 'trade';
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = name + ':' + symbol;
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const trades = this.safeValue2 (message, 'trades', 'trades_p', []);
        const parsed = this.parseTrades (trades, market);
        for (let i = 0; i < parsed.length; i++) {
            stored.append (parsed[i]);
        }
        client.resolve (stored, messageHash);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         kline: [
        //             [ 1592905200, 60, 960688000000, 960709000000, 960709000000, 960400000000, 960400000000, 848100, 8146756046 ],
        //             [ 1592905140, 60, 960718000000, 960716000000, 960717000000, 960560000000, 960688000000, 4284900, 41163743512 ],
        //             [ 1592905080, 60, 960513000000, 960684000000, 960718000000, 960684000000, 960718000000, 4880500, 46887494349 ],
        //         ],
        //         sequence: 1804401474,
        //         symbol: 'sBTCUSDT',
        //         type: 'snapshot'
        //     }
        // perpetual
        //     {
        //         kline_p: [
        //             [
        //                 1677094560,
        //                 60,
        //                 "23746.2",
        //                 "23746.1",
        //                 "23757.6",
        //                 "23736.9",
        //                 "23754.8",
        //                 "34.273",
        //                 "813910.208",
        //             ],
        //         ],
        //         sequence: 1230786017,
        //         symbol: "BTCUSDT",
        //         type: "incremental",
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const candles = this.safeValue2 (message, 'kline', 'kline_p', []);
        const first = this.safeValue (candles, 0, []);
        const interval = this.safeString (first, 1);
        const timeframe = this.findTimeframe (interval);
        if (timeframe !== undefined) {
            const messageHash = 'kline:' + timeframe + ':' + symbol;
            const ohlcvs = this.parseOHLCVs (candles, market);
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
            let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            for (let i = 0; i < ohlcvs.length; i++) {
                const candle = ohlcvs[i];
                stored.append (candle);
            }
            client.resolve (stored, messageHash);
        }
    }

    async watchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name phemex#watchTicker
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#subscribe-24-hours-ticker
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-24-hours-ticker
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#subscribe-24-hours-ticker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const isSwap = market['swap'];
        const settleIsUSDT = market['settle'] === 'USDT';
        let name = 'spot_market24h';
        if (isSwap) {
            name = settleIsUSDT ? 'perp_market24h_pack_p' : 'market24h';
        }
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ();
        const subscriptionHash = name + '.subscribe';
        const messageHash = 'ticker:' + symbol;
        const subscribe = {
            'method': subscriptionHash,
            'id': requestId,
            'params': [],
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, subscriptionHash);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name phemex#watchTrades
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#subscribe-trade
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-trade
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#subscribe-trade
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ();
        const isSwap = market['swap'];
        const settleIsUSDT = market['settle'] === 'USDT';
        const name = (isSwap && settleIsUSDT) ? 'trade_p' : 'trade';
        const messageHash = 'trade:' + symbol;
        const method = name + '.subscribe';
        const subscribe = {
            'method': method,
            'id': requestId,
            'params': [
                market['id'],
            ],
        };
        const request = this.deepExtend (subscribe, params);
        const trades = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp');
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name phemex#watchOrderBook
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#subscribe-orderbook-for-new-model
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-30-levels-orderbook
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#subscribe-orderbook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ();
        const isSwap = market['swap'];
        const settleIsUSDT = market['settle'] === 'USDT';
        const name = (isSwap && settleIsUSDT) ? 'orderbook_p' : 'orderbook';
        const messageHash = 'orderbook:' + symbol;
        const method = name + '.subscribe';
        const subscribe = {
            'method': method,
            'id': requestId,
            'params': [
                market['id'],
            ],
        };
        const request = this.deepExtend (subscribe, params);
        const orderbook = await this.watch (url, messageHash, request, messageHash);
        return orderbook.limit ();
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name phemex#watchOHLCV
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#subscribe-kline
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-kline
         * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#subscribe-kline
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ();
        const isSwap = market['swap'];
        const settleIsUSDT = market['settle'] === 'USDT';
        const name = (isSwap && settleIsUSDT) ? 'kline_p' : 'kline';
        const messageHash = 'kline:' + timeframe + ':' + symbol;
        const method = name + '.subscribe';
        const subscribe = {
            'method': method,
            'id': requestId,
            'params': [
                market['id'],
                this.safeInteger (this.timeframes, timeframe),
            ],
        };
        const request = this.deepExtend (subscribe, params);
        const ohlcv = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0);
    }

    handleDelta (bookside, delta, market = undefined) {
        const bidAsk = this.customParseBidAsk (delta, 0, 1, market);
        bookside.storeArray (bidAsk);
    }

    handleDeltas (bookside, deltas, market = undefined) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i], market);
        }
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         book: {
        //             asks: [
        //                 [ 960316000000, 6993800 ],
        //                 [ 960318000000, 13183000 ],
        //                 [ 960319000000, 9170200 ],
        //             ],
        //             bids: [
        //                 [ 959941000000, 8385300 ],
        //                 [ 959939000000, 10296600 ],
        //                 [ 959930000000, 3672400 ],
        //             ]
        //         },
        //         depth: 30,
        //         sequence: 1805784701,
        //         symbol: 'sBTCUSDT',
        //         timestamp: 1592908460404461600,
        //         type: 'snapshot'
        //     }
        //  perpetual
        //    {
        //        depth: 30,
        //        orderbook_p: {
        //            asks: [
        //                [
        //                    "23788.5",
        //                    "0.13",
        //                ],
        //            ],
        //            bids: [
        //                [
        //                    "23787.8",
        //                    "1.836",
        //                ],
        //            ],
        //        },
        //        sequence: 1230347368,
        //        symbol: "BTCUSDT",
        //        timestamp: "1677093457306978852",
        //        type: "snapshot",
        //    }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const type = this.safeString (message, 'type');
        const depth = this.safeInteger (message, 'depth');
        const name = 'orderbook';
        const messageHash = name + ':' + symbol;
        const nonce = this.safeInteger (message, 'sequence');
        const timestamp = this.safeIntegerProduct (message, 'timestamp', 0.000001);
        if (type === 'snapshot') {
            const book = this.safeValue2 (message, 'book', 'orderbook_p', {});
            const snapshot = this.customParseOrderBook (book, symbol, timestamp, 'bids', 'asks', 0, 1, market);
            snapshot['nonce'] = nonce;
            const orderbook = this.orderBook (snapshot, depth);
            this.orderbooks[symbol] = orderbook;
            client.resolve (orderbook, messageHash);
        } else {
            const orderbook = this.safeValue (this.orderbooks, symbol);
            if (orderbook !== undefined) {
                const changes = this.safeValue2 (message, 'book', 'orderbook_p', {});
                const asks = this.safeValue (changes, 'asks', []);
                const bids = this.safeValue (changes, 'bids', []);
                this.handleDeltas (orderbook['asks'], asks, market);
                this.handleDeltas (orderbook['bids'], bids, market);
                orderbook['nonce'] = nonce;
                orderbook['timestamp'] = timestamp;
                orderbook['datetime'] = this.iso8601 (timestamp);
                this.orderbooks[symbol] = orderbook;
                client.resolve (orderbook, messageHash);
            }
        }
    }

    async watchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name phemex#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
         */
        await this.loadMarkets ();
        let market = undefined;
        let type = undefined;
        let messageHash = 'trades:';
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = messageHash + market['symbol'];
            if (market['settle'] === 'USDT') {
                params['settle'] = 'USDT';
            }
        }
        [ type, params ] = this.handleMarketTypeAndParams ('watchMyTrades', market, params);
        if (symbol === undefined) {
            const settle = this.safeString (params, 'settle');
            messageHash = (settle === 'USDT') ? (messageHash + 'perpetual') : (messageHash + type);
        }
        const trades = await this.subscribePrivate (type, messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit);
    }

    handleMyTrades (client: Client, message) {
        //
        // swap
        //    [
        //        {
        //            "avgPriceEp":4138763000000,
        //            "baseCurrency":"BTC",
        //            "baseQtyEv":0,
        //            "clOrdID":"7956e0be-e8be-93a0-2887-ca504d85cda2",
        //            "execBaseQtyEv":30100,
        //            "execFeeEv":31,
        //            "execID":"d3b10cfa-84e3-5752-828e-78a79617e598",
        //            "execPriceEp":4138763000000,
        //            "execQuoteQtyEv":1245767663,
        //            "feeCurrency":"BTC",
        //            "lastLiquidityInd":"RemovedLiquidity",
        //            "ordType":"Market",
        //            "orderID":"34a4b1a8-ac3a-4580-b3e6-a6d039f27195",
        //            "priceEp":4549022000000,
        //            "qtyType":"ByQuote",
        //            "quoteCurrency":"USDT",
        //            "quoteQtyEv":1248000000,
        //            "side":"Buy",
        //            "symbol":"sBTCUSDT",
        //            "tradeType":"Trade",
        //            "transactTimeNs":"1650442617609928764",
        //            "userID":2647224
        //        }
        //    ]
        // perpetual
        //    [
        //        {
        //            "accountID": 9328670003,
        //            "action": "New",
        //            "actionBy": "ByUser",
        //            "actionTimeNs": 1666858780876924611,
        //            "addedSeq": 77751555,
        //            "apRp": "0",
        //            "bonusChangedAmountRv": "0",
        //            "bpRp": "0",
        //            "clOrdID": "c0327a7d-9064-62a9-28f6-2db9aaaa04e0",
        //            "closedPnlRv": "0",
        //            "closedSize": "0",
        //            "code": 0,
        //            "cumFeeRv": "0",
        //            "cumQty": "0",
        //            "cumValueRv": "0",
        //            "curAccBalanceRv": "1508.489893982237",
        //            "curAssignedPosBalanceRv": "24.62786650928",
        //            "curBonusBalanceRv": "0",
        //            "curLeverageRr": "-10",
        //            "curPosSide": "Buy",
        //            "curPosSize": "0.043",
        //            "curPosTerm": 1,
        //            "curPosValueRv": "894.0689",
        //            "curRiskLimitRv": "1000000",
        //            "currency": "USDT",
        //            "cxlRejReason": 0,
        //            "displayQty": "0.003",
        //            "execFeeRv": "0",
        //            "execID": "00000000-0000-0000-0000-000000000000",
        //            "execPriceRp": "20723.7",
        //            "execQty": "0",
        //            "execSeq": 77751555,
        //            "execStatus": "New",
        //            "execValueRv": "0",
        //            "feeRateRr": "0",
        //            "leavesQty": "0.003",
        //            "leavesValueRv": "63.4503",
        //            "message": "No error",
        //            "ordStatus": "New",
        //            "ordType": "Market",
        //            "orderID": "fa64c6f2-47a4-4929-aab4-b7fa9bbc4323",
        //            "orderQty": "0.003",
        //            "pegOffsetValueRp": "0",
        //            "posSide": "Long",
        //            "priceRp": "21150.1",
        //            "relatedPosTerm": 1,
        //            "relatedReqNum": 11,
        //            "side": "Buy",
        //            "slTrigger": "ByMarkPrice",
        //            "stopLossRp": "0",
        //            "stopPxRp": "0",
        //            "symbol": "BTCUSDT",
        //            "takeProfitRp": "0",
        //            "timeInForce": "ImmediateOrCancel",
        //            "tpTrigger": "ByLastPrice",
        //            "tradeType": "Amend",
        //            "transactTimeNs": 1666858780881545305,
        //            "userID": 932867
        //        },
        //        ...
        //    ]
        //
        const channel = 'trades';
        const tradesLength = message.length;
        if (tradesLength === 0) {
            return;
        }
        let cachedTrades = this.myTrades;
        if (cachedTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            cachedTrades = new ArrayCacheBySymbolById (limit);
        }
        const marketIds = {};
        let type = undefined;
        for (let i = 0; i < message.length; i++) {
            const rawTrade = message[i];
            const marketId = this.safeString (rawTrade, 'symbol');
            const market = this.safeMarket (marketId);
            const parsed = this.parseTrade (rawTrade);
            cachedTrades.append (parsed);
            const symbol = parsed['symbol'];
            if (type === undefined) {
                type = (market['settle'] === 'USDT') ? 'perpetual' : market['type'];
            }
            marketIds[symbol] = true;
        }
        const keys = Object.keys (marketIds);
        for (let i = 0; i < keys.length; i++) {
            const market = keys[i];
            const hash = channel + ':' + market;
            client.resolve (cachedTrades, hash);
        }
        // generic subscription
        const messageHash = channel + ':' + type;
        client.resolve (cachedTrades, messageHash);
    }

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name phemex#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the phemex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let messageHash = 'orders:';
        let market = undefined;
        let type = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = messageHash + market['symbol'];
            if (market['settle'] === 'USDT') {
                params['settle'] = 'USDT';
            }
        }
        [ type, params ] = this.handleMarketTypeAndParams ('watchOrders', market, params);
        const isUSDTSettled = this.safeString (params, 'settle') === 'USDT';
        if (symbol === undefined) {
            messageHash = (isUSDTSettled) ? (messageHash + 'perpetual') : (messageHash + type);
        }
        const orders = await this.subscribePrivate (type, messageHash, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    handleOrders (client: Client, message) {
        // spot update
        // {
        //        "closed":[
        //           {
        //              "action":"New",
        //              "avgPriceEp":4138763000000,
        //              "baseCurrency":"BTC",
        //              "baseQtyEv":0,
        //              "bizError":0,
        //              "clOrdID":"7956e0be-e8be-93a0-2887-ca504d85cda2",
        //              "createTimeNs":"1650442617606017583",
        //              "cumBaseQtyEv":30100,
        //              "cumFeeEv":31,
        //              "cumQuoteQtyEv":1245767663,
        //              "cxlRejReason":0,
        //              "feeCurrency":"BTC",
        //              "leavesBaseQtyEv":0,
        //              "leavesQuoteQtyEv":0,
        //              "ordStatus":"Filled",
        //              "ordType":"Market",
        //              "orderID":"34a4b1a8-ac3a-4580-b3e6-a6d039f27195",
        //              "pegOffsetValueEp":0,
        //              "priceEp":4549022000000,
        //              "qtyType":"ByQuote",
        //              "quoteCurrency":"USDT",
        //              "quoteQtyEv":1248000000,
        //              "side":"Buy",
        //              "stopPxEp":0,
        //              "symbol":"sBTCUSDT",
        //              "timeInForce":"ImmediateOrCancel",
        //              "tradeType":"Trade",
        //              "transactTimeNs":"1650442617609928764",
        //              "triggerTimeNs":0,
        //              "userID":2647224
        //           }
        //        ],
        //        "fills":[
        //           {
        //              "avgPriceEp":4138763000000,
        //              "baseCurrency":"BTC",
        //              "baseQtyEv":0,
        //              "clOrdID":"7956e0be-e8be-93a0-2887-ca504d85cda2",
        //              "execBaseQtyEv":30100,
        //              "execFeeEv":31,
        //              "execID":"d3b10cfa-84e3-5752-828e-78a79617e598",
        //              "execPriceEp":4138763000000,
        //              "execQuoteQtyEv":1245767663,
        //              "feeCurrency":"BTC",
        //              "lastLiquidityInd":"RemovedLiquidity",
        //              "ordType":"Market",
        //              "orderID":"34a4b1a8-ac3a-4580-b3e6-a6d039f27195",
        //              "priceEp":4549022000000,
        //              "qtyType":"ByQuote",
        //              "quoteCurrency":"USDT",
        //              "quoteQtyEv":1248000000,
        //              "side":"Buy",
        //              "symbol":"sBTCUSDT",
        //              "tradeType":"Trade",
        //              "transactTimeNs":"1650442617609928764",
        //              "userID":2647224
        //           }
        //        ],
        //        "open":[
        //           {
        //              "action":"New",
        //              "avgPriceEp":0,
        //              "baseCurrency":"LTC",
        //              "baseQtyEv":0,
        //              "bizError":0,
        //              "clOrdID":"2c0e5eb5-efb7-60d3-2e5f-df175df412ef",
        //              "createTimeNs":"1650446670073853755",
        //              "cumBaseQtyEv":0,
        //              "cumFeeEv":0,
        //              "cumQuoteQtyEv":0,
        //              "cxlRejReason":0,
        //              "feeCurrency":"LTC",
        //              "leavesBaseQtyEv":0,
        //              "leavesQuoteQtyEv":1000000000,
        //              "ordStatus":"New",
        //              "ordType":"Limit",
        //              "orderID":"d2aad92f-50f5-441a-957b-8184b146e3fb",
        //              "pegOffsetValueEp":0,
        //              "priceEp":5000000000,
        //              "qtyType":"ByQuote",
        //              "quoteCurrency":"USDT",
        //              "quoteQtyEv":1000000000,
        //              "side":"Buy",
        //            }
        //        ]
        //  },
        // perpetual
        //    [
        //        {
        //          accountID: 40183400003,
        //          action: 'New',
        //          actionBy: 'ByUser',
        //          actionTimeNs: '1674110665380190869',
        //          addedSeq: 678760103,
        //          apRp: '0',
        //          bonusChangedAmountRv: '0',
        //          bpRp: '0',
        //          clOrdID: '',
        //          cl_req_code: 0,
        //          closedPnlRv: '0',
        //          closedSize: '0',
        //          code: 0,
        //          cumFeeRv: '0',
        //          cumQty: '0.001',
        //          cumValueRv: '20.849',
        //          curAccBalanceRv: '19.9874906',
        //          curAssignedPosBalanceRv: '0',
        //          curBonusBalanceRv: '0',
        //          curLeverageRr: '-10',
        //          curPosSide: 'Buy',
        //          curPosSize: '0.001',
        //          curPosTerm: 1,
        //          curPosValueRv: '20.849',
        //          curRiskLimitRv: '1000000',
        //          currency: 'USDT',
        //          cxlRejReason: 0,
        //          displayQty: '0.001',
        //          execFeeRv: '0.0125094',
        //          execID: 'b88d2950-04a2-52d8-8927-346059900242',
        //          execPriceRp: '20849',
        //          execQty: '0.001',
        //          execSeq: 678760103,
        //          execStatus: 'TakerFill',
        //          execValueRv: '20.849',
        //          feeRateRr: '0.0006',
        //          lastLiquidityInd: 'RemovedLiquidity',
        //          leavesQty: '0',
        //          leavesValueRv: '0',
        //          message: 'No error',
        //          ordStatus: 'Filled',
        //          ordType: 'Market',
        //          orderID: '79620ed2-54c6-4645-a35c-7057e687c576',
        //          orderQty: '0.001',
        //          pegOffsetProportionRr: '0',
        //          pegOffsetValueRp: '0',
        //          posSide: 'Long',
        //          priceRp: '21476.3',
        //          relatedPosTerm: 1,
        //          relatedReqNum: 4,
        //          side: 'Buy',
        //          slTrigger: 'ByMarkPrice',
        //          stopLossRp: '0',
        //          stopPxRp: '0',
        //          symbol: 'BTCUSDT',
        //          takeProfitRp: '0',
        //          timeInForce: 'ImmediateOrCancel',
        //          tpTrigger: 'ByLastPrice',
        //          tradeType: 'Trade',
        //          transactTimeNs: '1674110665387882268',
        //          userID: 4018340
        //        },
        //        ...
        //    ]
        //
        let trades = [];
        const parsedOrders = [];
        if (('closed' in message) || ('fills' in message) || ('open' in message)) {
            const closed = this.safeValue (message, 'closed', []);
            const open = this.safeValue (message, 'open', []);
            const orders = this.arrayConcat (open, closed);
            const ordersLength = orders.length;
            if (ordersLength === 0) {
                return;
            }
            trades = this.safeValue (message, 'fills', []);
            for (let i = 0; i < orders.length; i++) {
                const rawOrder = orders[i];
                const parsedOrder = this.parseOrder (rawOrder);
                parsedOrders.push (parsedOrder);
            }
        } else {
            for (let i = 0; i < message.length; i++) {
                const update = message[i];
                const action = this.safeString (update, 'action');
                if ((action !== undefined) && (action !== 'Cancel')) {
                    // order + trade info together
                    trades.push (update);
                }
                const parsedOrder = this.parseWSSwapOrder (update);
                parsedOrders.push (parsedOrder);
            }
        }
        this.handleMyTrades (client, trades);
        const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
        const marketIds = {};
        if (this.orders === undefined) {
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        let type = undefined;
        const stored = this.orders;
        for (let i = 0; i < parsedOrders.length; i++) {
            const parsed = parsedOrders[i];
            stored.append (parsed);
            const symbol = parsed['symbol'];
            const market = this.market (symbol);
            if (type === undefined) {
                const isUsdt = market['settle'] === 'USDT';
                type = isUsdt ? 'perpetual' : market['type'];
            }
            marketIds[symbol] = true;
        }
        const keys = Object.keys (marketIds);
        for (let i = 0; i < keys.length; i++) {
            const messageHash = 'orders' + ':' + keys[i];
            client.resolve (this.orders, messageHash);
        }
        // resolve generic subscription (spot or swap)
        const messageHash = 'orders:' + type;
        client.resolve (this.orders, messageHash);
    }

    parseWSSwapOrder (order, market = undefined) {
        //
        // swap
        //    {
        //        "accountID":26472240002,
        //        "action":"Cancel",
        //        "actionBy":"ByUser",
        //        "actionTimeNs":"1650450096104760797",
        //        "addedSeq":26975849309,
        //        "bonusChangedAmountEv":0,
        //        "clOrdID":"d9675963-5e4e-6fc8-898a-ec8b934c1c61",
        //        "closedPnlEv":0,
        //        "closedSize":0,
        //        "code":0,
        //        "cumQty":0,
        //        "cumValueEv":0,
        //        "curAccBalanceEv":400079,
        //        "curAssignedPosBalanceEv":0,
        //        "curBonusBalanceEv":0,
        //        "curLeverageEr":0,
        //        "curPosSide":"None",
        //        "curPosSize":0,
        //        "curPosTerm":1,
        //        "curPosValueEv":0,
        //        "curRiskLimitEv":5000000000,
        //        "currency":"USD",
        //        "cxlRejReason":0,
        //        "displayQty":0,
        //        "execFeeEv":0,
        //        "execID":"00000000-0000-0000-0000-000000000000",
        //        "execPriceEp":0,
        //        "execQty":1,
        //        "execSeq":26975862338,
        //        "execStatus":"Canceled",
        //        "execValueEv":0,
        //        "feeRateEr":0,
        //        "leavesQty":0,
        //        "leavesValueEv":0,
        //        "message":"No error",
        //        "ordStatus":"Canceled",
        //        "ordType":"Limit",
        //        "orderID":"8141deb9-8f94-48f6-9421-a4e3a791537b",
        //        "orderQty":1,
        //        "pegOffsetValueEp":0,
        //        "priceEp":9521,
        //        "relatedPosTerm":1,
        //        "relatedReqNum":4,
        //        "side":"Buy",
        //        "slTrigger":"ByMarkPrice",
        //        "stopLossEp":0,
        //        "stopPxEp":0,
        //        "symbol":"ADAUSD",
        //        "takeProfitEp":0,
        //        "timeInForce":"GoodTillCancel",
        //        "tpTrigger":"ByLastPrice",
        //        "transactTimeNs":"1650450096108143014",
        //        "userID":2647224
        //    }
        // perpetual
        //    {
        //        accountID: 40183400003,
        //        action: 'New',
        //        actionBy: 'ByUser',
        //        actionTimeNs: '1674110665380190869',
        //        addedSeq: 678760103,
        //        apRp: '0',
        //        bonusChangedAmountRv: '0',
        //        bpRp: '0',
        //        clOrdID: '',
        //        cl_req_code: 0,
        //        closedPnlRv: '0',
        //        closedSize: '0',
        //        code: 0,
        //        cumFeeRv: '0',
        //        cumQty: '0.001',
        //        cumValueRv: '20.849',
        //        curAccBalanceRv: '19.9874906',
        //        curAssignedPosBalanceRv: '0',
        //        curBonusBalanceRv: '0',
        //        curLeverageRr: '-10',
        //        curPosSide: 'Buy',
        //        curPosSize: '0.001',
        //        curPosTerm: 1,
        //        curPosValueRv: '20.849',
        //        curRiskLimitRv: '1000000',
        //        currency: 'USDT',
        //        cxlRejReason: 0,
        //        displayQty: '0.001',
        //        execFeeRv: '0.0125094',
        //        execID: 'b88d2950-04a2-52d8-8927-346059900242',
        //        execPriceRp: '20849',
        //        execQty: '0.001',
        //        execSeq: 678760103,
        //        execStatus: 'TakerFill',
        //        execValueRv: '20.849',
        //        feeRateRr: '0.0006',
        //        lastLiquidityInd: 'RemovedLiquidity',
        //        leavesQty: '0',
        //        leavesValueRv: '0',
        //        message: 'No error',
        //        ordStatus: 'Filled',
        //        ordType: 'Market',
        //        orderID: '79620ed2-54c6-4645-a35c-7057e687c576',
        //        orderQty: '0.001',
        //        pegOffsetProportionRr: '0',
        //        pegOffsetValueRp: '0',
        //        posSide: 'Long',
        //        priceRp: '21476.3',
        //        relatedPosTerm: 1,
        //        relatedReqNum: 4,
        //        side: 'Buy',
        //        slTrigger: 'ByMarkPrice',
        //        stopLossRp: '0',
        //        stopPxRp: '0',
        //        symbol: 'BTCUSDT',
        //        takeProfitRp: '0',
        //        timeInForce: 'ImmediateOrCancel',
        //        tpTrigger: 'ByLastPrice',
        //        tradeType: 'Trade',
        //        transactTimeNs: '1674110665387882268',
        //        userID: 4018340
        //    }
        //
        const id = this.safeString (order, 'orderID');
        let clientOrderId = this.safeString (order, 'clOrdID');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined;
        }
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const status = this.parseOrderStatus (this.safeString (order, 'ordStatus'));
        const side = this.safeStringLower (order, 'side');
        const type = this.parseOrderType (this.safeString (order, 'ordType'));
        const price = this.safeString (order, 'priceRp', this.fromEp (this.safeString (order, 'priceEp'), market));
        const amount = this.safeString (order, 'orderQty');
        const filled = this.safeString (order, 'cumQty');
        const remaining = this.safeString (order, 'leavesQty');
        const timestamp = this.safeIntegerProduct (order, 'actionTimeNs', 0.000001);
        const cost = this.safeString (order, 'cumValueRv', this.fromEv (this.safeString (order, 'cumValueEv'), market));
        let lastTradeTimestamp = this.safeIntegerProduct (order, 'transactTimeNs', 0.000001);
        if (lastTradeTimestamp === 0) {
            lastTradeTimestamp = undefined;
        }
        const timeInForce = this.parseTimeInForce (this.safeString (order, 'timeInForce'));
        const stopPrice = this.safeString (order, 'stopPx');
        const postOnly = (timeInForce === 'PO');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'average': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    handleMessage (client: Client, message) {
        // private spot update
        // {
        //     orders: { closed: [ ], fills: [ ], open: [] },
        //     sequence: 40435835,
        //     timestamp: '1650443245600839241',
        //     type: 'snapshot',
        //     wallets: [
        //       {
        //         balanceEv: 0,
        //         currency: 'BTC',
        //         lastUpdateTimeNs: '1650442638722099092',
        //         lockedTradingBalanceEv: 0,
        //         lockedWithdrawEv: 0,
        //         userID: 2647224
        //       },
        //       {
        //         balanceEv: 1154232337,
        //         currency: 'USDT',
        //         lastUpdateTimeNs: '1650442617610017597',
        //         lockedTradingBalanceEv: 0,
        //         lockedWithdrawEv: 0,
        //         userID: 2647224
        //       }
        //     ]
        // }
        // private swap update
        // {
        //     sequence: 83839628,
        //     timestamp: '1650382581827447829',
        //     type: 'snapshot',
        //     accounts: [
        //       {
        //         accountBalanceEv: 0,
        //         accountID: 26472240001,
        //         bonusBalanceEv: 0,
        //         currency: 'BTC',
        //         totalUsedBalanceEv: 0,
        //         userID: 2647224
        //       }
        //     ],
        //     orders: [],
        //     positions: [
        //       {
        //         accountID: 26472240001,
        //         assignedPosBalanceEv: 0,
        //         avgEntryPriceEp: 0,
        //         bankruptCommEv: 0,
        //         bankruptPriceEp: 0,
        //         buyLeavesQty: 0,
        //         buyLeavesValueEv: 0,
        //         buyValueToCostEr: 1150750,
        //         createdAtNs: 0,
        //         crossSharedBalanceEv: 0,
        //         cumClosedPnlEv: 0,
        //         cumFundingFeeEv: 0,
        //         cumTransactFeeEv: 0,
        //         curTermRealisedPnlEv: 0,
        //         currency: 'BTC',
        //         dataVer: 2,
        //         deleveragePercentileEr: 0,
        //         displayLeverageEr: 10000000000,
        //         estimatedOrdLossEv: 0,
        //         execSeq: 0,
        //         freeCostEv: 0,
        //         freeQty: 0,
        //         initMarginReqEr: 1000000,
        //         lastFundingTime: '1640601827712091793',
        //         lastTermEndTime: 0,
        //         leverageEr: 0,
        //         liquidationPriceEp: 0,
        //         maintMarginReqEr: 500000,
        //         makerFeeRateEr: 0,
        //         markPriceEp: 507806777,
        //         orderCostEv: 0,
        //         posCostEv: 0,
        //         positionMarginEv: 0,
        //         positionStatus: 'Normal',
        //         riskLimitEv: 10000000000,
        //         sellLeavesQty: 0,
        //         sellLeavesValueEv: 0,
        //         sellValueToCostEr: 1149250,
        //         side: 'None',
        //         size: 0,
        //         symbol: 'BTCUSD',
        //         takerFeeRateEr: 0,
        //         term: 1,
        //         transactTimeNs: 0,
        //         unrealisedPnlEv: 0,
        //         updatedAtNs: 0,
        //         usedBalanceEv: 0,
        //         userID: 2647224,
        //         valueEv: 0
        //       }
        //     ]
        // }
        const id = this.safeString (message, 'id');
        if (id in client.subscriptions) {
            const method = client.subscriptions[id];
            delete client.subscriptions[id];
            if (method !== true) {
                return method.call (this, client, message);
            }
        }
        const method = this.safeString (message, 'method', '');
        if (('market24h' in message) || ('spot_market24h' in message) || (method.indexOf ('perp_market24h_pack_p') >= 0)) {
            return this.handleTicker (client, message);
        } else if (('trades' in message) || ('trades_p' in message)) {
            return this.handleTrades (client, message);
        } else if (('kline' in message) || ('kline_p' in message)) {
            return this.handleOHLCV (client, message);
        } else if (('book' in message) || ('orderbook_p' in message)) {
            return this.handleOrderBook (client, message);
        }
        if (('orders' in message) || ('orders_p' in message)) {
            const orders = this.safeValue2 (message, 'orders', 'orders_p', {});
            this.handleOrders (client, orders);
        }
        if (('accounts' in message) || ('accounts_p' in message) || ('wallets' in message)) {
            let type = ('accounts' in message) ? 'swap' : 'spot';
            if ('accounts_p' in message) {
                type = 'perpetual';
            }
            const accounts = this.safeValueN (message, [ 'accounts', 'accounts_p', 'wallets' ], []);
            this.handleBalance (type, client, accounts);
        }
    }

    handleAuthenticate (client: Client, message) {
        //
        // {
        //     "error": null,
        //     "id": 1234,
        //     "result": {
        //       "status": "success"
        //     }
        // }
        //
        const result = this.safeValue (message, 'result');
        const status = this.safeString (result, 'status');
        const messageHash = 'authenticated';
        if (status === 'success') {
            client.resolve (message, messageHash);
        } else {
            const error = new AuthenticationError (this.id + ' ' + this.json (message));
            client.reject (error, messageHash);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
    }

    async subscribePrivate (type, messageHash, params = {}) {
        await this.loadMarkets ();
        await this.authenticate ();
        const url = this.urls['api']['ws'];
        const requestId = this.seconds ();
        const settleIsUSDT = (this.safeValue (params, 'settle', '') === 'USDT');
        params = this.omit (params, 'settle');
        let channel = 'aop.subscribe';
        if (type === 'spot') {
            channel = 'wo.subscribe';
        }
        if (settleIsUSDT) {
            channel = 'aop_p.subscribe';
        }
        let request = {
            'id': requestId,
            'method': channel,
            'params': [],
        };
        request = this.extend (request, params);
        return await this.watch (url, messageHash, request, channel);
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const requestId = this.requestId ();
        const messageHash = 'authenticated';
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            const expiryDelta = this.safeInteger (this.options, 'expires', 120);
            const expiration = this.seconds () + expiryDelta;
            const payload = this.apiKey + expiration.toString ();
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256);
            const method = 'user.auth';
            const request = {
                'method': method,
                'params': [ 'API', this.apiKey, signature, expiration ],
                'id': requestId,
            };
            const subscriptionHash = requestId.toString ();
            const message = this.extend (request, params);
            if (!(messageHash in client.subscriptions)) {
                client.subscriptions[subscriptionHash] = this.handleAuthenticate;
            }
            future = this.watch (url, messageHash, message);
            client.subscriptions[messageHash] = future;
        }
        return await future;
    }
}
