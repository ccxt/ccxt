
// ---------------------------------------------------------------------------

import mexc from './mexc.js';

// ---------------------------------------------------------------------------

export default class mexc3 extends mexc {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mexc3',
            'alias': true,
        });
    }
}
