
//  ---------------------------------------------------------------------------

import _fmfwio from './abstract/fmfwio.js';

//  ---------------------------------------------------------------------------

// @ts-ignore
export default class bitcoincom extends _fmfwio {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitcoincom',
            'alias': true,
        });
    }
}
