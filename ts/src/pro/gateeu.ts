
//  ---------------------------------------------------------------------------

import gate from './gate.js';
import gateeuRest from '../gateeu.js';

// ---------------------------------------------------------------------------

export default class gateeu extends gate {
    describe (): any {
        // eslint-disable-next-line new-cap
        const restInstance = new gateeuRest ();
        const restDescribe = restInstance.describe ();
        const parentWsDescribe = super.describeData ();
        const extended = this.deepExtend (restDescribe, parentWsDescribe);
        return this.deepExtend (extended, {
            'id': 'gateeu',
            'name': 'Gate EU',
            'countries': [ 'EU' ],
            'hostname': 'gateeu.com',
            'certified': false,
            'urls': {
                'api': {
                    'ws': 'wss://ws.gateeu.com/v4',
                    'spot': 'wss://api.gateeu.com/ws/v4/',
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
        });
    }
}
