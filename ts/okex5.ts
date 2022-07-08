
// ---------------------------------------------------------------------------

import okex from './okex';

// ---------------------------------------------------------------------------

export default class okex5 extends okex {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okex5',
            'alias': true,
        });
    }
}
