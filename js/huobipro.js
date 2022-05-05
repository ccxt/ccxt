'use strict';

// ---------------------------------------------------------------------------

const huobi = require ('./huobi.js');

// ---------------------------------------------------------------------------

module.exports = class huobipro extends huobi {
    /**
     * @class
     * @name huobipro
     * @description exchange class for huobipro api
     */
    describe () {
        // this is an alias for backward-compatibility
        // to be removed soon
        return this.deepExtend (super.describe (), {
            'id': 'huobipro',
            'alias': true,
            'name': 'Huobi Pro',
        });
    }
};
