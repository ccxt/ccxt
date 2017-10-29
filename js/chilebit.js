"use strict";

// ---------------------------------------------------------------------------

const blinktrade = require ('./blinktrade.js')

// ---------------------------------------------------------------------------

module.exports = class chilebit extends blinktrade {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'chilebit',
            'name': 'ChileBit',
            'countries': 'CL',
            'hasCORS': false,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27991414-1298f0d8-647f-11e7-9c40-d56409266336.jpg',
                'api': {
                    'public': 'https://api.blinktrade.com/api',
                    'private': 'https://api.blinktrade.com/tapi',
                },
                'www': 'https://chilebit.net',
                'doc': 'https://blinktrade.com/docs',
            },
            'comment': 'Blinktrade API',
            'markets': {
                'BTC/CLP': { 'id': 'BTCCLP', 'symbol': 'BTC/CLP', 'base': 'BTC', 'quote': 'CLP', 'brokerId': 9, 'broker': 'ChileBit' },
            },
        }
    }
}
