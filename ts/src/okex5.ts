
// ---------------------------------------------------------------------------

import okex from './okex.js';

// ---------------------------------------------------------------------------

// @ts-ignore
export default class okex5 extends _okex {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okex5',
            'alias': true,
        });
    }
}
