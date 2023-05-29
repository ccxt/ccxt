
// ---------------------------------------------------------------------------

import mexc from './mexc.js';

// ---------------------------------------------------------------------------

export default class mexc3 extends mexc {
    /**
     * @class
     * @name mexc3
     * @description exchange class for mexc3 api
     */
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mexc3',
            'alias': true,
        });
    }
}
