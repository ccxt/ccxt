'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var bybit = require('./bybit.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class bybiteu extends bybit["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'bybiteu',
            'name': 'Bybit EU',
            'countries': ['EU'], // European Union
            'version': 'v5',
            'rateLimit': 20,
            'hostname': 'bybit.eu',
            'pro': true,
            'certified': false,
            'urls': {
                'test': {
                    'spot': 'https://api-testnet.{hostname}',
                    'futures': 'https://api-testnet.{hostname}',
                    'v2': 'https://api-testnet.{hostname}',
                    'public': 'https://api-testnet.{hostname}',
                    'private': 'https://api-testnet.{hostname}',
                },
                'logo': 'https://github.com/user-attachments/assets/97a5d0b3-de10-423d-90e1-6620960025ed',
                'api': {
                    'spot': 'https://api.{hostname}',
                    'futures': 'https://api.{hostname}',
                    'v2': 'https://api.{hostname}',
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
                },
                'demotrading': {
                    'spot': 'https://api-demo.{hostname}',
                    'futures': 'https://api-demo.{hostname}',
                    'v2': 'https://api-demo.{hostname}',
                    'public': 'https://api-demo.{hostname}',
                    'private': 'https://api-demo.{hostname}',
                },
                'www': 'https://www.bybit.com',
                'doc': [
                    'https://bybit-exchange.github.io/docs/inverse/',
                    'https://bybit-exchange.github.io/docs/linear/',
                    'https://github.com/bybit-exchange',
                ],
                'fees': 'https://help.bybit.com/hc/en-us/articles/360039261154',
                'referral': 'https://www.bybit.com/invite?ref=XDK12WP',
            },
            'has': {
                'CORS': true,
                'spot': true,
                'margin': true,
                'swap': false,
                'future': false,
                'option': undefined,
            },
            'options': {
                'mica': true,
            },
        });
    }
}

exports["default"] = bybiteu;
