
//  ---------------------------------------------------------------------------

import deribit from './deribit.js';
import coinbasederibitRest from '../coinbasederibit.js';

// ---------------------------------------------------------------------------

export default class coinbasederibit extends deribit {
    override describe (): any {
        // eslint-disable-next-line new-cap
        const restInstance = new coinbasederibitRest ();
        const restDescribe = restInstance.describe ();
        const parentWsDescribe = super.describeData ();
        const extended = this.deepExtend (restDescribe, parentWsDescribe);
        return this.deepExtend (extended, {
            'id': 'coinbasederibit',
            'name': 'Coinbase Deribit',
            'urls': {
                'api': {
                    'ws': 'wss://drb.coinbase.com/ws/api/v2', // authenticated: private/* and user.* channels
                    'wsPublic': 'wss://streams.drb.coinbase.com/ws/api/v2', // unauthenticated market data
                },
                'test': undefined,
            },
            'streaming': {
                'keepAlive': 15000, // idle sockets are closed after ~30s without client messages, see ping()
            },
        });
    }
}
