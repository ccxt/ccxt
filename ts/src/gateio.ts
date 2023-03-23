
// ---------------------------------------------------------------------------

import gate from './gate.js';

// ---------------------------------------------------------------------------

// @ts-ignore
export default class gateio extends _gate {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gateio',
            'alias': true,
        });
    }
}
