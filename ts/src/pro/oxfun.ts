
//  ---------------------------------------------------------------------------

import oxfunRest from '../oxfun.js';
import type { } from '../base/types.js';
// import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class oxfun extends oxfunRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': false,
                'watchOrderBook': false,
                'watchOHLCV': false,
                'watchOrders': false,
                'watchMyTrades': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchBalance': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://api.ox.fun/v2/websocket',
                        'private': 'wss://api.ox.fun/v2/websocket',
                    },
                    'test': {
                        'public': 'wss://stgapi.ox.fun/v2/websocket',
                        'private': 'wss://stgapi.ox.fun/v2/websocket',
                    },
                },
            },
            'options': {
                'listenKeyRefreshRate': 3600000,
                'watchOrderBook': {
                    'snapshotDelay': 25,
                    'snapshotMaxRetries': 3,
                },
                'listenKey': undefined,
            },
            'streaming': {
                'keepAlive': 10000,
            },
        });
    }
}
