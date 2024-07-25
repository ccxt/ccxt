'use strict';

var onetrading = require('./onetrading.js');

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class bitpanda extends onetrading {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'bitpanda',
            'alias': true,
        });
    }
}

module.exports = bitpanda;
