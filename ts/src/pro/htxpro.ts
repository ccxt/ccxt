
//  ---------------------------------------------------------------------------

import huobi from './huobi.js';

// ---------------------------------------------------------------------------

export default class htxpro extends huobi {
    describe () {
        return this.deepExtend (super.describe (), {
            'alias': true,
            'id': 'htxpro',
        });
    }
}
