
//  ---------------------------------------------------------------------------

import gate from './gate.js';

// ---------------------------------------------------------------------------

// @ts-expect-error
export default class gateio extends gate {
    describe () {
        return this.deepExtend (super.describe (), {
            'alias': true,
            'id': 'gateio',
        });
    }
}
