
//  ---------------------------------------------------------------------------

import onetrading from './onetrading.js';

// ---------------------------------------------------------------------------

export default class bitpanda extends onetrading {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'alias': true,
            'id': 'bitpanda',
        });
    }
}
