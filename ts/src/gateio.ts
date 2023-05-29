
// ---------------------------------------------------------------------------

import gate from './gate.js';

// ---------------------------------------------------------------------------

export default class gateio extends gate {
    /**
     * @class
     * @name gateio
     * @description exchange class for gateio api
     */
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gateio',
            'alias': true,
        });
    }
}
