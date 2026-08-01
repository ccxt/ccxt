'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var kucoin = require('./kucoin.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class kucoineu extends kucoin["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'kucoineu',
            'name': 'KuCoin EU',
            'countries': ['EU'], // European Union
            'hostname': 'kucoin.eu',
            'certified': false,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87295558-132aaf80-c50e-11ea-9801-a2fb0c57c799.jpg',
                'api': {
                    'public': 'https://api.kucoin.eu',
                    'private': 'https://api.kucoin.eu',
                },
                'www': 'https://www.kucoin.com/en-eu',
                'doc': [
                    'https://www.kucoin.com/en-eu/docs-new',
                ],
            },
            'options': {
                'mica': true,
            },
        });
    }
}

exports["default"] = kucoineu;
