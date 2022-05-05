'use strict';

// ---------------------------------------------------------------------------

const okx = require ('./okx.js');

// ---------------------------------------------------------------------------

module.exports = class okex extends okx {
    /**
     * @class
     * @name okex
     * @description exchange class for okex api
     */
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okex',
            'alias': true,
        });
    }
};
