
// ---------------------------------------------------------------------------

import okx from './okx.js';

// ---------------------------------------------------------------------------

export default class myokx extends okx {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'myokx',
            'name': 'MyOKX',
            'certified': false,
            'pro': true,
            'hostname': 'www.eea.okx.com',
        });
    }
}
