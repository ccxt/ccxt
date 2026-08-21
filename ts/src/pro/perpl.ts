//  ---------------------------------------------------------------------------

import perplRest from '../perpl.js';

//  ---------------------------------------------------------------------------

export default class perpl extends perplRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': false,
                'watchBalance': false,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': false,
                'watchOrders': false,
                'watchPositions': false,
                'watchTicker': false,
                'watchTrades': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://app.perpl.xyz/ws/v1/market-data',
                        'private': 'wss://app.perpl.xyz/ws/v1/trading',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://testnet.perpl.xyz/ws/v1/market-data',
                        'private': 'wss://testnet.perpl.xyz/ws/v1/trading',
                    },
                },
            },
        });
    }
}
