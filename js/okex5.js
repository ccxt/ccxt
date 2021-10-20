'use strict';

// ---------------------------------------------------------------------------

const okex = require ('./okex.js');

// ---------------------------------------------------------------------------

module.exports = class okex5 extends okex {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okex5',
            'alias': true,
        });
    }
};
