'use strict';

var mexc = require('./mexc.js');

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class mexc3 extends mexc {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'mexc3',
            'alias': true,
        });
    }
}

module.exports = mexc3;
