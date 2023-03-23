
//  ---------------------------------------------------------------------------

import fmfwio from './abstract/fmfwio.js';

//  ---------------------------------------------------------------------------

// @ts-ignore
export default class bitcoincom extends fmfwio {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitcoincom',
            'alias': true,
        });
    }
}
