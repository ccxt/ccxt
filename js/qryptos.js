'use strict';

// ---------------------------------------------------------------------------

const liquid = require ('./liquid');

// ---------------------------------------------------------------------------

module.exports = class qryptos extends liquid {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'qryptos',
            'name': 'QRYPTOS',
        });
    }
};
