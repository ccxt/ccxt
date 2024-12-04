
//  ---------------------------------------------------------------------------

import hitbtc from './hitbtc.js';

//  ---------------------------------------------------------------------------

export default class fmfwio extends hitbtc {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'fmfwio',
            'name': 'FMFW.io',
            'countries': [ 'KN' ],
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/07f884a3-fd5f-4b3b-b55b-4afd9592948f',
                'api': {
                    'public': 'https://api.fmfw.io/api/3',
                    'private': 'https://api.fmfw.io/api/3',
                },
                'www': 'https://fmfw.io',
                'doc': 'https://api.fmfw.io/',
                'fees': 'https://fmfw.io/fees-and-limits',
                'referral': 'https://fmfw.io/referral/da948b21d6c92d69',
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.005'),
                    'taker': this.parseNumber ('0.005'),
                },
            },
        });
    }
}
