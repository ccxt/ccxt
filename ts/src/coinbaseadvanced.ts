
// ---------------------------------------------------------------------------

import coinbase from './coinbase.js';

// ---------------------------------------------------------------------------

export default class coinbaseadvanced extends coinbase {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'coinbaseadvanced',
            'name': 'Coinbase Advanced',
            'rollingWindowSize': 60000.0,
            'alias': true,
        });
    }
}
