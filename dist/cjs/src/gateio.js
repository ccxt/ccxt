'use strict';

var gate = require('./gate.js');

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// @ts-expect-error
class gateio extends gate {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'gateio',
            'alias': true,
        });
    }
}

module.exports = gateio;
