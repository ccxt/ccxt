
//  ---------------------------------------------------------------------------

import fmfwio from './fmfwio';

//  ---------------------------------------------------------------------------

export default class bitcoincom extends fmfwio {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitcoincom',
        });
    }
}
