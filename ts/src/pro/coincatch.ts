//  ---------------------------------------------------------------------------

import coincatchRest from '../coincatch.js';
import type { } from '../base/types.js';
// import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class hashkey extends coincatchRest {
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
                        'public': 'wss://ws.coincatch.com/public/v1/stream',
                        'private': 'wss://ws.coincatch.com/private/v1/stream',
                    },
                },
            },
            'options': {
                'listenKeyRefreshRate': 3600000,
                'watchOrderBook': {
                },
                'listenKey': undefined,
            },
            'streaming': {
                'keepAlive': 10000,
            },
        });
    }
}