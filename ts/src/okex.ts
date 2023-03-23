
// ---------------------------------------------------------------------------

import okx from './okx.js';

// ---------------------------------------------------------------------------

// @ts-ignore
export default class okex extends _okx {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okex',
            'alias': true,
        });
    }
}
