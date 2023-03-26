
// ---------------------------------------------------------------------------

import zonda from './zonda.js';

// ---------------------------------------------------------------------------
// @ts-expect-error
export default class bitbay extends zonda {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitbay',
            'alias': true,
        });
    }
}
