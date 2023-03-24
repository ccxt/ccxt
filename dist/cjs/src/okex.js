'use strict';

var okx = require('./okx.js');

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// @ts-expect-error
class okex extends okx {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'okex',
            'alias': true,
        });
    }
}

module.exports = okex;
