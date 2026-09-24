'use strict';

// ---------------------------------------------------------------------------

const trbinance = require ('./trbinance.js');

// ---------------------------------------------------------------------------

module.exports = class binancetr extends trbinance {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binancetr',
            'alias': true,
        });
    }
};
