'use strict';

var okex = require('./okex.js');

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class okex5 extends okex {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'okex5',
            'alias': true,
        });
    }
}

module.exports = okex5;
