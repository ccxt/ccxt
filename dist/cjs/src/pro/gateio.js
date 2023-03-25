'use strict';

var gate = require('./gate.js');

//  ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// @ts-expect-error
class gateio extends gate {
    describe() {
        return this.deepExtend(super.describe(), {
            'alias': true,
            'id': 'gateio',
        });
    }
}

module.exports = gateio;
