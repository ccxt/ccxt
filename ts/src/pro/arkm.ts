
//  ---------------------------------------------------------------------------

import arkmRest from '../arkm.js';
import { BadRequest, NetworkError, NotSupported, ArgumentsRequired } from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type { Int, OHLCV, Str, Strings, OrderBook, Order, Trade, Balances, Ticker, Tickers, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class arkm extends arkmRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                // 'watchTrades': true,
                // 'watchTradesForSymbols': false,
                // 'watchOrderBook': true,
                // 'watchOrderBookForSymbols': true,
                // 'watchOHLCV': true,
                // 'watchOHLCVForSymbols': true,
                // 'watchOrders': true,
                // 'watchMyTrades': true,
                // 'watchTicker': true,
                // 'watchTickers': true,
                // 'watchBalance': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://arkm.com/ws',
                        'linear': 'wss://arkm.com/ws',
                        'inverse': 'wss://arkm.com/ws',
                    },
                },
            },
            'options': {
                'listenKeyRefreshRate': 3540000, // 1 hour (59 mins so we have 1 min to renew the token)
                'ws': {
                    'gunzip': true,
                },
                'watchBalance': {
                    'fetchBalanceSnapshot': true, // needed to be true to keep track of used and free balance
                    'awaitBalanceSnapshot': false, // whether to wait for the balance snapshot before providing updates
                },
                'watchOrderBook': {
                    'depth': 100, // 5, 10, 20, 50, 100
                    'interval': 500, // 100, 200, 500, 1000
                },
                'watchOrderBookForSymbols': {
                    'depth': 100, // 5, 10, 20, 50, 100
                    'interval': 500, // 100, 200, 500, 1000
                },
                'watchTrades': {
                    'ignoreDuplicates': true,
                },
            },
            'streaming': {
                'keepAlive': 1800000, // 30 minutes
            },
        });
    }
}
