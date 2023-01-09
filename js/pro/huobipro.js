'use strict';

//  ---------------------------------------------------------------------------

const huobi = require ('./huobi.js');

// ---------------------------------------------------------------------------

module.exports = class huobipro extends huobi {
    describe () {
        return this.deepExtend (super.describe (), {
            'alias': true,
            'id': 'huobipro',
        });
    }
};
