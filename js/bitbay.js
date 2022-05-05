'use strict';

// ---------------------------------------------------------------------------

const zonda = require ('./zonda.js');

// ---------------------------------------------------------------------------

module.exports = class bitbay extends zonda {
    /**
     * @class
     * @name bitbay
     * @description exchange class for bitbay api
     */
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitbay',
            'alias': true,
        });
    }
};
