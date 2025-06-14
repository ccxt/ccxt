'use strict';

var gate = require('./gate.js');

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class gateio extends gate {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'gateio',
            'alias': true,
        });
    }
}

module.exports = gateio;
