'use strict';

var zonda = require('./zonda.js');

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// @ts-expect-error
class bitbay extends zonda {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'bitbay',
            'alias': true,
        });
    }
}

module.exports = bitbay;
