'use strict';

var hitbtc = require('./hitbtc.js');

// ---------------------------------------------------------------------------
/**
 * @class hitbtc3
 * @augments Exchange
 */
class hitbtc3 extends hitbtc {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'hitbtc3',
            'alias': true,
        });
    }
}

module.exports = hitbtc3;
