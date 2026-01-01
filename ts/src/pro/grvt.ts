
//  ---------------------------------------------------------------------------

import grvtRest from '../grvt.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import type { Int, OHLCV, Str, Strings, OrderBook, Order, Trade, Balances, Ticker, Dict, Position, Bool, Tickers } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { ExchangeError } from '../base/errors.js';

//  ---------------------------------------------------------------------------

export default class grvt extends grvtRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://market-data.grvt.io/ws/full',
                    },
                },
            },
            'options': {
                'watchOrderBook': {
                    'depth': 100, // 5, 10, 20, 50, 100
                    'interval': 500, // 100, 200, 500, 1000
                },
            },
            'streaming': {
                'keepAlive': 300000, // 5 minutes
            },
        });
    }

    handleMessage (client: Client, message) {
        //
        // confirmation
        //
        //  {
        //     jsonrpc: '2.0',
        //     result: {
        //         stream: 'v1.mini.d',
        //         subs: [ 'BTC_USDT_Perp@500' ],
        //         unsubs: [],
        //         num_snapshots: [ 1 ],
        //         first_sequence_number: [ '1061214' ],
        //         latest_sequence_number: [ '1061213' ]
        //     },
        //     id: 1,
        //     method: 'subscribe'
        //  }
        //
        // ticker
        //
        //  {
        //     stream: "v1.mini.d",
        //     selector: "BTC_USDT_Perp@500",
        //     sequence_number: "0",
        //     feed: {
        //         event_time: "1767198134519661154",
        //         instrument: "BTC_USDT_Perp",
        //         ...
        //     },
        //     prev_sequence_number: "0",
        //  }
        //
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const methods: Dict = {
            'v1.ticker.s': this.handleTicker,
            'v1.ticker.d': this.handleTicker,
            'v1.mini.d': this.handleTicker,
            'v1.mini.s': this.handleTicker,
            'v1.trade': this.handleTrades,
        };
        const methodName = this.safeString (message, 'method');
        if (methodName === 'subscribe') {
            // return from confirmation
            return;
        }
        const channel = this.safeString (message, 'stream');
        const method = this.safeValue (methods, channel);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    async subscribeMultiple (messageHashes: string[], request: Dict): Promise<any> {
        const payload: Dict = {
            'jsonrpc': '2.0',
            'method': 'subscribe',
            'params': request,
            'id': this.requestId (),
        };
        return await this.watchMultiple (this.urls['api']['ws']['public'], messageHashes, payload, messageHashes);
    }

    async subscribe (messageHash: string, request: Dict): Promise<any> {
        const subscriptionHash = messageHash;
        const payload: Dict = {
            'jsonrpc': '2.0',
            'method': 'subscribe',
            'params': request,
            'id': this.requestId (),
        };
        return await this.watch (this.urls['api']['ws']['public'], messageHash, payload, subscriptionHash);
    }

    requestId () {
        this.lockId ();
        const newValue = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = newValue;
        this.unlockId ();
        return newValue;
    }

    /**
     * @method
     * @name grvt#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-docs.grvt.io/market_data_streams/#mini-ticker-snap-feed-selector
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        const channel = this.safeString (params, 'channel', 'v1.ticker.s'); // v1.ticker.s | v1.ticker.d | v1.mini.s | v1.mini.d
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const interval = this.safeInteger (params, 'interval', 500);
        const selector = marketId + '@' + interval; // raw, 50, 100, 200, 500, 1000, 5000
        const request = {
            'stream': channel,
            'selectors': [ selector ],
        };
        const messageHash = 'ticker::' + market['symbol'];
        return await this.subscribe (messageHash, this.extend (params, request));
    }

    /**
     * @method
     * @name grvt#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        const channel = this.safeString (params, 'channel', 'v1.ticker.s'); // v1.ticker.s | v1.ticker.d | v1.mini.s | v1.mini.d
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const selectors = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const marketId = market['id'];
            const interval = this.safeInteger (params, 'interval', 500);
            const selector = marketId + '@' + interval; // raw, 50, 100, 200, 500, 1000, 5000
            selectors.push (selector);
            const messageHash = 'ticker::' + market['symbol'];
            messageHashes.push (messageHash);
        }
        const request = {
            'stream': channel,
            'selectors': selectors,
        };
        const ticker = await this.subscribeMultiple (messageHashes, this.extend (params, request));
        if (this.newUpdates) {
            const tickers: Dict = {};
            tickers[ticker['symbol']] = ticker;
            return tickers;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    handleTicker (client: Client, message) {
        //
        // v1.ticker.s
        //
        //    {
        //        "stream": "v1.ticker.s",
        //        "selector": "BTC_USDT_Perp@500",
        //        "sequence_number": "0",
        //        "feed": {
        //            "event_time": "1767199535382794823",
        //            "instrument": "BTC_USDT_Perp",
        //            "mark_price": "87439.392166151",
        //            "index_price": "87462.426721779",
        //            "last_price": "87467.5",
        //            "last_size": "0.001",
        //            "mid_price": "87474.35",
        //            "best_bid_price": "87474.3",
        //            "best_bid_size": "2.435",
        //            "best_ask_price": "87474.4",
        //            "best_ask_size": "3.825",
        //            "funding_rate_8h_curr": "0.01",
        //            "funding_rate_8h_avg": "0.01",
        //            "interest_rate": "0.0",
        //            "forward_price": "0.0",
        //            "buy_volume_24h_b": "3115.631",
        //            "sell_volume_24h_b": "3195.236",
        //            "buy_volume_24h_q": "275739265.1558",
        //            "sell_volume_24h_q": "282773286.2658",
        //            "high_price": "89187.2",
        //            "low_price": "87404.1",
        //            "open_price": "88667.1",
        //            "open_interest": "1914.093886738",
        //            "long_short_ratio": "1.472050",
        //            "funding_rate": "0.01",
        //            "funding_interval_hours": 8,
        //            "next_funding_time": "1767225600000000000"
        //        },
        //        "prev_sequence_number": "0"
        //    }
        //
        // v1.mini.s
        //
        //    {
        //        "stream": "v1.mini.s",
        //        "selector": "BTC_USDT_Perp@500",
        //        "sequence_number": "0",
        //        "feed": {
        //            "event_time": "1767198364309454192",
        //            "instrument": "BTC_USDT_Perp",
        //            "mark_price": "87792.25830235",
        //            "index_price": "87806.705713684",
        //            "last_price": "87800.0",
        //            "last_size": "0.032",
        //            "mid_price": "87799.95",
        //            "best_bid_price": "87799.9",
        //            "best_bid_size": "0.151",
        //            "best_ask_price": "87800.0",
        //            "best_ask_size": "5.733"
        //        },
        //        "prev_sequence_number": "0"
        //    }
        //
        //  v1.mini.d
        //
        //    {
        //        "stream": "v1.mini.d",
        //        "selector": "BTC_USDT_Perp@500",
        //        "sequence_number": "1061718",
        //        "feed": {
        //            "event_time": "1767198266500017753",
        //            "instrument": "BTC_USDT_Perp",
        //            "index_price": "87820.929569614",
        //            "best_ask_size": "5.708"
        //        },
        //        "prev_sequence_number": "1061717"
        //    }
        //
        const data = this.safeDict (message, 'feed', {});
        const selector = this.safeString (message, 'selector');
        const parts = selector.split ('@');
        const marketId = this.safeString (parts, 0);
        const market = this.safeMarket (marketId, undefined);
        const symbol = market['symbol'];
        const ticker = this.parseWsTicker (data, market);
        this.tickers[symbol] = ticker;
        client.resolve (ticker, 'ticker::' + symbol);
    }

    parseWsTicker (message, market = undefined) {
        // same dict as REST api
        return this.parseTicker (message, market);
    }

    /**
     * @method
     * @name grvt#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://api-docs.grvt.io/market_data_streams/#trade_1
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    /**
     * @method
     * @name ascendex#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://ascendex.github.io/ascendex-pro-api/#channel-market-trades
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] the name of the method to call, 'trade' or 'aggTrade', default is 'trade'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const selectors = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const marketId = market['id'];
            const limitRaw = this.safeInteger (params, 'limit', 50);
            const selector = marketId + '@' + limitRaw; // 50, 200, 500, 1000
            selectors.push (selector);
            const messageHash = 'trade::' + market['symbol'];
            messageHashes.push (messageHash);
        }
        const request = {
            'stream': 'v1.trade',
            'selectors': selectors,
        };
        const trades = await this.subscribeMultiple (messageHashes, this.extend (params, request));
        if (this.newUpdates) {
            const first = this.safeValue (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        //    {
        //        "stream": "v1.trade",
        //        "selector": "BTC_USDT_Perp@50",
        //        "sequence_number": "0",
        //        "feed": {
        //            "event_time": "1767257046164798775",
        //            "instrument": "BTC_USDT_Perp",
        //            "is_taker_buyer": true,
        //            "size": "0.001",
        //            "price": "87700.1",
        //            "mark_price": "87700.817100682",
        //            "index_price": "87708.566729268",
        //            "interest_rate": "0.0",
        //            "forward_price": "0.0",
        //            "trade_id": "73808524-19",
        //            "venue": "ORDERBOOK",
        //            "is_rpi": false
        //        },
        //        "prev_sequence_number": "0"
        //    }
        //
        const data = this.safeDict (message, 'feed', {});
        const selector = this.safeString (message, 'selector');
        const parts = selector.split ('@');
        const marketId = this.safeString (parts, 0);
        const market = this.safeMarket (marketId, undefined);
        const symbol = market['symbol'];
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const parsed = this.parseWsTrade (data);
        const stored = this.trades[symbol];
        stored.append (parsed);
        client.resolve (stored, 'trade::' + symbol);
    }

    parseWsTrade (trade, market = undefined) {
        // same as REST api
        return this.parseTrade (trade, market);
    }

    handleErrorMessage (client: Client, response): Bool {
        //
        // error example:
        //
        //    {
        //        "id": "30005",
        //        "name": "InvalidNotional",
        //        "message": "order validation failed: invalid notional: notional 0.25 is less than min notional 1"
        //    }
        //
        return false; // 
        const message = this.safeString (response, 'message');
        if (message !== undefined) {
            const body = this.json (response);
            const errorCode = this.safeString (response, 'id');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (this.id + ' ' + body);
        }
        return false;
    }
}
