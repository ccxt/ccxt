'use strict';

var huobi = require('./huobi.js');

//  ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class huobipro extends huobi {
    describe() {
        return this.deepExtend(super.describe(), {
            'alias': true,
            'id': 'huobipro',
        });
    }
}

module.exports = huobipro;
