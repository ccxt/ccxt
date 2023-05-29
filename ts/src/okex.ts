
// ---------------------------------------------------------------------------

import okx from './okx.js';

// ---------------------------------------------------------------------------

export default class okex extends okx {
    /**
     * @class
     * @name okex
     * @description exchange class for okex api
     */
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okex',
            'alias': true,
        });
    }
}
