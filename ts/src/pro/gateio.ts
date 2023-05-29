
//  ---------------------------------------------------------------------------

import gate from './gate.js';

// ---------------------------------------------------------------------------

export default class gateio extends gate {
    /**
     * @class
     * @name gateio
     * @description websocket exchange class for gateio api
     */
    describe () {
        return this.deepExtend (super.describe (), {
            'alias': true,
            'id': 'gateio',
        });
    }
}
