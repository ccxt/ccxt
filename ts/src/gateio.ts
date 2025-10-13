
// ---------------------------------------------------------------------------

import gate from './gate.js';

// ---------------------------------------------------------------------------

export default class gateio extends gate {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'gateio',
            'rollingWindowSize': 60000.0,
            'alias': true,
        });
    }
}
