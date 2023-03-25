
//  ---------------------------------------------------------------------------

import huobi from './huobi.js';

// ---------------------------------------------------------------------------

// @ts-expect-error
export default class huobipro extends huobi {
    describe () {
        return this.deepExtend (super.describe (), {
            'alias': true,
            'id': 'huobipro',
        });
    }
}
