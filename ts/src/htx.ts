
// ---------------------------------------------------------------------------

import huobi from './huobi.js';

// ---------------------------------------------------------------------------

export default class htx extends huobi {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'htx',
            'alias': true,
            'name': 'HTX',
        });
    }
}
