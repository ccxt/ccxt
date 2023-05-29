
// ---------------------------------------------------------------------------

import zonda from './zonda.js';

// ---------------------------------------------------------------------------
export default class bitbay extends zonda {
    /**
     * @class
     * @name bitbay
     * @description exchange class for bitbay api
     */
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitbay',
            'alias': true,
        });
    }
}
