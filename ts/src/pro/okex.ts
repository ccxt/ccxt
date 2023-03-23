
//  ---------------------------------------------------------------------------

import okx from './okx.js';

// ---------------------------------------------------------------------------

// @ts-expect-error
export default class okex extends okx {
    describe () {
        return this.deepExtend (super.describe (), {
            'alias': true,
            'id': 'okex',
        });
    }
}
