'use strict';

// ---------------------------------------------------------------------------

const okex = require ('./okex.js');

// ---------------------------------------------------------------------------

module.exports = class okex5 extends okex {
    /**
     * @class
     * @name okex5
     * @description exchange class for okex5 api
     */
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okex5',
            'alias': true,
        });
    }
};
