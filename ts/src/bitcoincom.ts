
//  ---------------------------------------------------------------------------

import fmfwio from './fmfwio.js';

//  ---------------------------------------------------------------------------

export default class bitcoincom extends fmfwio {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitcoincom',
            'name': 'Bitcoin.com',
            'alias': true,
        });
    }
}
