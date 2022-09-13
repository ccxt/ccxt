'use strict';

//  ---------------------------------------------------------------------------

const huobi = require ('./huobi.js');

// ---------------------------------------------------------------------------

module.exports = class huobipro extends huobiproRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'alias': true,
            'id': 'huobipro',
        });
    }
};
