'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var gate = require('./gate.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class gateeu extends gate["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'gateeu',
            'name': 'Gate EU',
            'countries': ['EU'], // European Union
            'version': 'v4',
            'rateLimit': 20,
            'pro': true,
            'certified': false,
            'urls': {
                'api': {
                    'public': {
                        'wallet': 'https://api.gateeu.com/api/v4',
                        'margin': 'https://api.gateeu.com/api/v4',
                        'spot': 'https://api.gateeu.com/api/v4',
                        'sub_accounts': 'https://api.gateeu.com/api/v4',
                        'earn': 'https://api.gateeu.com/api/v4',
                    },
                    'private': {
                        'withdrawals': 'https://api.gateeu.com/api/v4',
                        'wallet': 'https://api.gateeu.com/api/v4',
                        'margin': 'https://api.gateeu.com/api/v4',
                        'spot': 'https://api.gateeu.com/api/v4',
                        'subAccounts': 'https://api.gateeu.com/api/v4',
                        'unified': 'https://api.gateeu.com/api/v4',
                        'rebate': 'https://api.gateeu.com/api/v4',
                        'earn': 'https://api.gateeu.com/api/v4',
                        'account': 'https://api.gateeu.com/api/v4',
                        'loan': 'https://api.gateeu.com/api/v4',
                        'otc': 'https://api.gateeu.com/api/v4',
                    },
                },
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
                'fetchMarkets': {
                    'types': ['spot'],
                },
                'mica': true,
            },
        });
    }
}

exports["default"] = gateeu;
