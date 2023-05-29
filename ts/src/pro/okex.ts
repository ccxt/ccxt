
//  ---------------------------------------------------------------------------

import okx from './okx.js';

// ---------------------------------------------------------------------------

export default class okex extends okx {
    /**
     * @class
     * @name okex
     * @description websocket exchange class for okex api
     */
    describe () {
        return this.deepExtend (super.describe (), {
            'alias': true,
            'id': 'okex',
        });
    }
}
