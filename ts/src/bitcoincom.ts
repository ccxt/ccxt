
//  ---------------------------------------------------------------------------

import fmfwio from './fmfwio.js';

//  ---------------------------------------------------------------------------

// @ts-expect-error
export default class bitcoincom extends fmfwio {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitcoincom',
            'alias': true,
        });
    }
}
