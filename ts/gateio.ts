
// ---------------------------------------------------------------------------

import gate from './gate';

// ---------------------------------------------------------------------------

export default class gateio extends gate {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gateio',
            'alias': true,
        });
    }
}
