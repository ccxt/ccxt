
// ---------------------------------------------------------------------------

import okx from './okx.js';

// ---------------------------------------------------------------------------

export default class myokx extends okx {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'myokx',
            'name': 'MyOKX (EEA)',
            'certified': false,
            'pro': true,
            'hostname': 'eea.okx.com',
        });
    }
}
