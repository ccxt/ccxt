'use strict';

var htx = require('./htx.js');

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class huobi extends htx {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'huobi',
            'alias': true,
        });
    }
}

module.exports = huobi;
