'use strict';

var htx = require('./htx.js');

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class huobi extends htx {
    describe() {
        return this.deepExtend(super.describe(), {
            'alias': true,
            'id': 'huobi',
        });
    }
}

module.exports = huobi;
