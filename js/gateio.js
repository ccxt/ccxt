'use strict';

// ---------------------------------------------------------------------------

const gate = require ('./gate.js');

// ---------------------------------------------------------------------------

module.exports = class gateio extends gate {
    /**
     * @class
     * @name gateio
     * @description alias exchange class for gate exchange
     */
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gateio',
            'alias': true,
        });
    }
};
