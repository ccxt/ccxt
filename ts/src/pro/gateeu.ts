
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
                },
            },
        });
    }
}
