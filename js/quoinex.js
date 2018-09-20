'use strict';

// ---------------------------------------------------------------------------

const liquid = require ('./liquid .js');

// ---------------------------------------------------------------------------

module.exports = class quoinex extends liquid {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'quoinex',
            'name': 'QUOINEX',
        });
    }
};
