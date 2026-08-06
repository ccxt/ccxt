
//  ---------------------------------------------------------------------------

import gate from './gate.js';
import gateeuRest from '../gateeu.js';

// ---------------------------------------------------------------------------

export default class gateeu extends gate {
    override describe (): any {
        // eslint-disable-next-line new-cap
        const restInstance = new gateeuRest ();
        const restDescribe = restInstance.describe ();
        const parentWsDescribe = super.describeData ();
        // the ws describe-data must be applied on top of the rest describe,
        // otherwise the explicit-undefined watch* defaults of the rest 'has'
        // block wipe the parent's ws capability flags in the deep extend
        const extended = this.deepExtend (restDescribe, parentWsDescribe);
        return this.deepExtend (extended, {
            'id': 'gateeu',
            'name': 'Gate EU',
            'countries': [ 'EU' ],
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
