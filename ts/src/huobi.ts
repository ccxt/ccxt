
// ---------------------------------------------------------------------------

import htx from './htx.js';

// ---------------------------------------------------------------------------

export default class huobi extends htx {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'huobi',
            'rollingWindowSize': 60000.0,
            'alias': true,
        });
    }
}
