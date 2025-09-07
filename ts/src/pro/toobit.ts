//  ---------------------------------------------------------------------------

import toobitRest from '../toobit.js';
import { ExchangeError, AuthenticationError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type { Int, Str, Ticker, OrderBook, Order, Trade, OHLCV, Dict, Bool } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class toobit extends toobitRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                // 'watchBalance': false,
                // 'watchMyTrades': true,
                // 'watchOHLCV': true,
                // 'watchOrderBook': true,
                // 'watchOrders': true,
                // 'watchTicker': true,
                // 'watchTickers': false, // for now
                // 'watchTrades': true,
                // 'watchPosition': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://stream.toobit.com',
                        'swap': 'wss://stream.toobit.com',
                    },
                },
            },
            'options': {
            },
            'streaming': {
                'keepAlive': (60 - 1) * 5 * 1000, // every 5 minutes
                'ping': this.ping,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                    },
                },
            },
        });
    }

}
