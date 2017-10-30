"use strict";

// ---------------------------------------------------------------------------

const blinktrade = require ('./blinktrade.js')

// ---------------------------------------------------------------------------

module.exports = class vbtc extends blinktrade {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'vbtc',
            'name': 'VBTC',
            'countries': 'VN',
            'hasCORS': false,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27991481-1f53d1d8-6481-11e7-884e-21d17e7939db.jpg',
                'api': {
                    'public': 'https://api.blinktrade.com/api',
                    'private': 'https://api.blinktrade.com/tapi',
                },
                'www': 'https://vbtc.exchange',
                'doc': 'https://blinktrade.com/docs',
            },
            'comment': 'Blinktrade API',
            'markets': {
                'BTC/VND': { 'id': 'BTCVND', 'symbol': 'BTC/VND', 'base': 'BTC', 'quote': 'VND', 'brokerId': 3, 'broker': 'VBTC' },
            }
        });
    }
}
