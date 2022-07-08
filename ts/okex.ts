
// ---------------------------------------------------------------------------

import okx from './okx';

// ---------------------------------------------------------------------------

export default class okex extends okx {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okex',
            'alias': true,
        });
    }
}
