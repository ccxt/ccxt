'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var okxus$1 = require('../abstract/pro/okxus.js');

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class okxus extends okxus$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'okxus',
            'name': 'OKX (US)',
            'hostname': 'us.okx.com',
            'urls': {
                'api': {
                    'rest': 'https://{hostname}',
                    'ws': 'wss://wsus.okx.com:443/ws/v5',
                },
                'www': 'https://app.okx.com',
                'doc': 'https://app.okx.com/docs-v5/en/#overview',
                'fees': 'https://app.okx.com/pages/products/fees.html',
                'referral': {
                    'url': 'https://www.app.okx.com/join/CCXT2023',
                    'discount': 0.2,
                },
                'test': {
                    'ws': 'wss://wsuspap.okx.com:443/ws/v5',
                },
            },
            'has': {
                'swap': true,
                'future': false,
                'option': false,
            },
        });
    }
}

exports["default"] = okxus;
