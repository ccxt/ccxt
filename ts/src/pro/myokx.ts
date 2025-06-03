
//  ---------------------------------------------------------------------------

import okx from './okx.js';

// ---------------------------------------------------------------------------

export default class myokx extends okx {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'myokx',
            'name': 'MyOKX (EEA)',
            'hostname': 'eea.okx.com',
            'urls': {
                'api': {
                    'rest': 'https://{hostname}',
                    'ws': 'wss://wseea.okx.com:8443/ws/v5',
                },
                'www': 'https://my.okx.com',
                'doc': 'https://my.okx.com/docs-v5/en/#overview',
                'fees': 'https://my.okx.com/pages/products/fees.html',
                'referral': {
                    'url': 'https://www.my.okx.com/join/CCXT2023',
                    'discount': 0.2,
                },
                'test': {
                    'ws': 'wss://wseeapap.okx.com:8443/ws/v5',
                },
            },
            'has': {
                'swap': false,
                'future': false,
                'option': false,
            },
        });
    }
}
