'use strict';

//  ---------------------------------------------------------------------------

import hitbtc from './hitbtc.js';

// ---------------------------------------------------------------------------

export default class bitcoincom extends hitbtc {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitcoincom',
            'name': 'bitcoin.com',
            'countries': [ 'KN' ],
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/97296144-514fa300-1861-11eb-952b-3d55d492200b.jpg',
                'api': {
                    'ws': 'wss://api.fmfw.io/api/2/ws',
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.15 / 100,
                    'taker': 0.2 / 100,
                },
            },
        });
    }
}
