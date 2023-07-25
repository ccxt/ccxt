
//  ---------------------------------------------------------------------------

import bingxRest from '../bingx.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class bingx extends bingxRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://open-api-ws.bingx.com/market',
                        'swap': 'wss://open-api-swap.bingx.com/swap-market',
                    },
                },
            },
            'options': {
                'ws': {
                    'gunzip': true,
                },
            },
        });
    }

    handleMessage (client: Client, message) {
        console.log (message);
        process.exit ();
    }
}
