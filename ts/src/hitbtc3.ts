
// ---------------------------------------------------------------------------

import hitbtc from './hitbtc.js';

// ---------------------------------------------------------------------------

export default class hitbtc3 extends hitbtc {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hitbtc3',
            'alias': true,
        });
    }
}
