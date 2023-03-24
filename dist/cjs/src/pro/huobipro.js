'use strict';

var huobi = require('./huobi.js');

//  ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// @ts-expect-error
class huobipro extends huobi {
    describe() {
        return this.deepExtend(super.describe(), {
            'alias': true,
            'id': 'huobipro',
        });
    }
}

module.exports = huobipro;
