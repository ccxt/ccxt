
//  ---------------------------------------------------------------------------

import fmfwio from './fmfwio.js';

//  ---------------------------------------------------------------------------

export default class bitcoincom extends fmfwio {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'bitcoincom',
            'name': 'Bitcoin.com',
            'alias': true,
        });
    }
}
