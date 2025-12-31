
//  ---------------------------------------------------------------------------

import grvtRest from '../grvt.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import type { Int, OHLCV, Str, Strings, OrderBook, Order, Trade, Balances, Ticker, Dict, Position, Bool } from '../base/types.js';
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
        //         mark_price: "87813.097386665",
        //         index_price: "87829.179848534",
        //         last_price: "87807.7",
        //         last_size: "0.016",
        //         mid_price: "87807.65",
        //         best_bid_price: "87807.6",
        //         best_bid_size: "5.507",
        //         best_ask_price: "87807.7",
        //         best_ask_size: "5.222",
        //     },
        //     prev_sequence_number: "0",
        //  }
        //
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const methods: Dict = {
            'v1.mini.d': this.handleTicker,
            'v1.mini.s': this.handleTicker,
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
        const channel = this.safeString (params, 'channel', 'v1.mini.s'); // 'v1.mini.s' or 'v1.mini.d'
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

    handleTicker (client: Client, message) {
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
