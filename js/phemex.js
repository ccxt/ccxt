'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { NotSupported } = require ('ccxt/js/base/errors');
const { ROUND } = require ('ccxt/js/base/functions/number');
const { ArrayCache, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class phemex extends ccxt.phemex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchTrades': true,
                'watchOrderBook': true,
                'watchOHLCV': true,
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
                'keepAlive': 20000,
            },
        });
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
        const symbol = this.safeSymbol (marketId);
        const timestamp = this.safeIntegerProduct (ticker, 'timestamp', 0.000001);
        const last = this.fromEp (this.safeFloat (ticker, 'close'), market);
        const quoteVolume = this.fromEv (this.safeFloat (ticker, 'turnover'), market);
        const baseVolume = this.fromEv (this.safeFloat (ticker, 'volume'), market);
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        const open = this.fromEp (this.safeFloat (ticker, 'open'), market);
        if ((open !== undefined) && (last !== undefined)) {
            change = last - open;
            if (open > 0) {
                percentage = change / open * 100;
            }
            average = this.sum (open, last) / 2;
        }
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.fromEp (this.safeFloat (ticker, 'high'), market),
            'low': this.fromEp (this.safeFloat (ticker, 'low'), market),
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

    handleTicker (client, message) {
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
        let name = 'market24h';
        let ticker = this.safeValue (message, name);
        let result = undefined;
        if (ticker === undefined) {
            name = 'spot_market24h';
            ticker = this.safeValue (message, name);
            result = this.parseTicker (ticker);
        } else {
            result = this.parseSwapTicker (ticker);
        }
        const symbol = result['symbol'];
        const messageHash = name + ':' + symbol;
        const timestamp = this.safeIntegerProduct (message, 'timestamp', 0.000001);
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        this.tickers[symbol] = result;
        client.resolve (result, messageHash);
    }

    async watchBalance (params = {}) {
        await this.loadMarkets ();
        throw new NotSupported (this.id + ' watchBalance() not implemented yet');
    }

    handleTrades (client, message) {
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
        const trades = this.safeValue (message, 'trades', []);
        const parsed = this.parseTrades (trades, market);
        for (let i = 0; i < parsed.length; i++) {
            stored.append (parsed[i]);
        }
        client.resolve (stored, messageHash);
    }

    handleOHLCV (client, message) {
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
        //
        const name = 'kline';
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const candles = this.safeValue (message, name, []);
        const first = this.safeValue (candles, 0, []);
        const interval = this.safeString (first, 1);
        const timeframe = this.findTimeframe (interval);
        if (timeframe !== undefined) {
            const messageHash = name + ':' + timeframe + ':' + symbol;
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

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = market['spot'] ? 'spot_market24h' : 'market24h';
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ();
        const subscriptionHash = name + '.subscribe';
        const messageHash = name + ':' + symbol;
        const subscribe = {
            'method': subscriptionHash,
            'id': requestId,
            'params': [],
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, subscriptionHash);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ();
        const name = 'trade';
        const messageHash = name + ':' + symbol;
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
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ();
        const name = 'orderbook';
        const messageHash = name + ':' + symbol;
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
        return orderbook.limit (limit);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ();
        const name = 'kline';
        const messageHash = name + ':' + timeframe + ':' + symbol;
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
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleDelta (bookside, delta, market = undefined) {
        const bidAsk = this.parseBidAsk (delta, 0, 1, market);
        bookside.storeArray (bidAsk);
    }

    handleDeltas (bookside, deltas, market = undefined) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i], market);
        }
    }

    handleOrderBook (client, message) {
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
            const book = this.safeValue (message, 'book', {});
            const snapshot = this.parseOrderBook (book, symbol, timestamp, 'bids', 'asks', 0, 1, market);
            snapshot['nonce'] = nonce;
            const orderbook = this.orderBook (snapshot, depth);
            this.orderbooks[symbol] = orderbook;
            client.resolve (orderbook, messageHash);
        } else {
            const orderbook = this.safeValue (this.orderbooks, symbol);
            if (orderbook !== undefined) {
                const changes = this.safeValue (message, 'book', {});
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

    fromEn (en, scale, precision, precisionMode = undefined) {
        precisionMode = (precisionMode === undefined) ? this.precisionMode : precisionMode;
        return parseFloat (this.decimalToPrecision (en * Math.pow (10, -scale), ROUND, precision, precisionMode));
    }

    fromEp (ep, market = undefined) {
        if ((ep === undefined) || (market === undefined)) {
            return ep;
        }
        return this.fromEn (ep, market['priceScale'], market['precision']['price']);
    }

    fromEv (ev, market = undefined) {
        if ((ev === undefined) || (market === undefined)) {
            return ev;
        }
        if (market['spot']) {
            return this.fromEn (ev, market['valueScale'], market['precision']['amount']);
        } else {
            return this.fromEn (ev, market['valueScale'], 1 / Math.pow (10, market['valueScale']));
        }
    }

    handleMessage (client, message) {
        if (('market24h' in message) || ('spot_market24h' in message)) {
            return this.handleTicker (client, message);
        } else if ('trades' in message) {
            return this.handleTrades (client, message);
        } else if ('kline' in message) {
            return this.handleOHLCV (client, message);
        } else if ('book' in message) {
            return this.handleOrderBook (client, message);
        } else {
            //
            //     { error: null, id: 1, result: { status: 'success' } }
            //
            return message;
        }
    }
};
