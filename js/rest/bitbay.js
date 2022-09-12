'use strict';

// ---------------------------------------------------------------------------

const zonda = require ('./zonda.js');

// ---------------------------------------------------------------------------

module.exports = class bitbay extends zonda {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitbay',
            'alias': true,
        });
    }
};
