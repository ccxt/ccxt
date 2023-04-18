
// ---------------------------------------------------------------------------

import mexc from './mexc.js';

// ---------------------------------------------------------------------------
// this is a dummy change to force re-transpile of mexc3's py/php-files. This line can be removed again on next change

export default class mexc3 extends mexc {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mexc3',
            'alias': true,
        });
    }
}
