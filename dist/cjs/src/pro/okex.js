'use strict';

var okx = require('./okx.js');

//  ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class okex extends okx {
    describe() {
        return this.deepExtend(super.describe(), {
            'alias': true,
            'id': 'okex',
        });
    }
}

module.exports = okex;
