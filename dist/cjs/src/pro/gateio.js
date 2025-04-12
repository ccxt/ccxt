'use strict';

var gate = require('./gate.js');

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class gateio extends gate {
    describe() {
        return this.deepExtend(super.describe(), {
            'alias': true,
            'id': 'gateio',
        });
    }
}

module.exports = gateio;
