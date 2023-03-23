
// ---------------------------------------------------------------------------

import zonda from './zonda.js';

// ---------------------------------------------------------------------------
// @ts-ignore
export default class bitbay extends _zonda {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitbay',
            'alias': true,
        });
    }
}
