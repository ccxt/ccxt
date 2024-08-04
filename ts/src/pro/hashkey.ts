
//  ---------------------------------------------------------------------------

import hashkeyRest from '../hashkey.js';
import type { } from '../base/types.js';
// import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class hashkey extends hashkeyRest {
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
                        'public': 'wss://stream-glb.hashkey.com',
                        'private': 'wss://stream-glb.hashkey.com',
                    },
                    'test': {
                        'public': 'wss://stream-glb.sim.hashkeydev.com',
                        'private': 'wss://stream-glb.sim.hashkeydev.com',
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