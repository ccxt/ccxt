'use strict';

// ---------------------------------------------------------------------------

const hitbtc = require ('./hitbtc');

// ---------------------------------------------------------------------------

module.exports = class hitbtc2 extends hitbtc {
    describe () {
        // this is a temporary stub for backward compatibility
        // https://github.com/ccxt/ccxt/issues/6678
        return this.deepExtend (super.describe (), {
            'id': 'hitbtc2',
        });
    }
};
