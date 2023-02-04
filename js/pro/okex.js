'use strict';

//  ---------------------------------------------------------------------------

const okx = require ('./okx.js');

// ---------------------------------------------------------------------------

module.exports = class okex extends okx {
    describe () {
        return this.deepExtend (super.describe (), {
            'alias': true,
            'id': 'okex',
        });
    }
};
