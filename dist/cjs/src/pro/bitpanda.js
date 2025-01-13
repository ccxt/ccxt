'use strict';

var onetrading = require('./onetrading.js');

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class bitpanda extends onetrading {
    describe() {
        return this.deepExtend(super.describe(), {
            'alias': true,
            'id': 'bitpanda',
        });
    }
}

module.exports = bitpanda;
